import Rpc from './Rpc';
import {
    IOptions as IRemoteOptions,
    IOptionsOption as IRemoteOptionsOption,
    IPassing as IRemotePassing
} from './Remote';
import {IEndpoint as IProviderEndpoint} from './IProvider';
import {IBinding as IDefaultBinding} from './BindingMixin';
import OptionsMixin from './OptionsMixin';
import DataMixin from './DataMixin';
import Query, {
    ExpandMode,
    PartialExpression,
    playExpression,
    NavigationType,
    WhereExpression
} from './Query';
import DataSet from './DataSet';
import {IAbstract} from './provider';
import {RecordSet} from '../collection';
import {AdapterDescriptor, getMergeableProperty, Record} from '../entity';
import {register, resolve} from '../di';
import {logger, object} from '../util';
import {IHashMap} from '../declarations';
import ParallelDeferred = require('Core/ParallelDeferred');

enum PoitionNavigationOrder {
    before = 'before',
    after = 'after',
    both = 'both'
}

/**
 * Separator for BL object name and method name
 */
const BL_OBJECT_SEPARATOR = '.';

/**
 * Separator for Identity type
 */
const COMPLEX_ID_SEPARATOR = ',';

/**
 * Regexp for Identity type detection
 */
const COMPLEX_ID_MATCH = /^[0-9]+,[А-яA-z0-9]+$/;

const EXPRESSION_TEMPLATE = /(.+)([<>]=?|~)$/;

type EntityId = string | number;

interface ICursor {
    position: object | object[];
    order: string;
}

export interface IEndpoint extends IProviderEndpoint {
    moveContract?: string;
}
/**
 * Extended IBinding
 */
export interface IBinding extends IDefaultBinding {
    updateBatch?: string;
    moveBefore?: string;
    moveAfter?: string;
    format?: string;
}

/**
 * Extended _$options
 */
export interface IOptionsOption extends IRemoteOptionsOption {
    hasMoreProperty?: string;
}

/**
 * Constructor options
 */
export interface IOptions extends IRemoteOptions {
    endpoint?: IEndpoint | string;
    binding?: IBinding;
    orderProperty?: string;
    options?: IOptionsOption;
}

/**
 * Move metadata interface
 */
export interface IMoveMeta {
    parentProperty?: string;
    objectName?: string;
    position?: string;
}

/**
 * Old move metadata interface
 */
interface IOldMoveMeta {
    before: string;
    hierField: string;
}

type PositionDeclaration = [EntityId, IHashMap<unknown>];

export class PositionExpression<T = PositionDeclaration> extends PartialExpression<T> {
    readonly type: string = 'sbisPosition';
}

export function positionExpression<T>(...conditions: PositionDeclaration[]): PositionExpression<T> {
    return new PositionExpression(conditions as unknown as T[]);
}

/**
 * Returns BL object name and its method name joined by separator.
 * If method name already contains the separator then returns it unchanged.
 */
function buildBlMethodName(objectName: string, methodName: string): string {
    return methodName.indexOf(BL_OBJECT_SEPARATOR) > -1 ? methodName : objectName + BL_OBJECT_SEPARATOR + methodName;
}

/**
 * Returns key of the BL Object from its complex id
 */
function getKeyByComplexId(id: EntityId): string {
    id = String(id || '');
    if (id.match(COMPLEX_ID_MATCH)) {
        return id.split(COMPLEX_ID_SEPARATOR)[0];
    }
    return id;
}

/**
 * Returns name of the BL Object from its complex id
 */
function getNameByComplexId(id: EntityId, defaults: string): string {
    id = String(id || '');
    if (id.match(COMPLEX_ID_MATCH)) {
        return id.split(COMPLEX_ID_SEPARATOR)[1];
    }
    return defaults;
}

/**
 * Creates complex id
 */
function createComplexId(id: string, defaults: string): string[] {
    id = String(id || '');
    if (id.match(COMPLEX_ID_MATCH)) {
        return id.split(COMPLEX_ID_SEPARATOR, 2);
    }
    return [id, defaults];
}

/**
 * Joins BL objects into groups be its names
 */
function getGroupsByComplexIds(ids: EntityId[], defaults: string): object {
    const groups = {};
    let name;
    for (let i = 0, len = ids.length; i < len; i++) {
        name = getNameByComplexId(ids[i], defaults);
        groups[name] = groups[name] || [];
        groups[name].push(getKeyByComplexId(ids[i]));
    }

    return groups;
}

/**
 * Builds Record from plain object
 * @param data Record data as JSON
 * @param adapter
 */
function buildRecord(data: unknown, adapter: AdapterDescriptor): Record | null {
    if (data && DataMixin.isModelInstance(data)) {
        return data as Record;
    }

    const RecordType = resolve<typeof Record>('Types/entity:Record');
    return RecordType.fromObject(data, adapter);
}

/**
 * Builds RecordSet from array of plain objects
 * @param data RecordSet data as JSON
 * @param adapter
 * @param keyProperty
 */
function buildRecordSet(data: unknown, adapter: AdapterDescriptor, keyProperty?: string): RecordSet<Record> | null {
    if (data === null) {
        return data;
    }
    if (data && DataMixin.isRecordSetInstance(data)) {
        return data as RecordSet<Record>;
    }

    const RecordSetType = resolve<typeof RecordSet>('Types/collection:RecordSet');
    const records = new RecordSetType<Record>({
        adapter,
        keyProperty
    });

    if (data instanceof Array) {
        const count = data.length;
        for (let i = 0; i < count; i++) {
            records.add(buildRecord(data[i], adapter));
        }
    }

    return records;
}

/**
 * Returns sorting parameters
 */
function getSortingParams(query: Query): string[] | null {
    if (!query) {
        return null;
    }

    const orders = query.getOrderBy();
    if (orders.length === 0) {
        return null;
    }

    const sort = [];
    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        sort.push({
            n: order.getSelector(),
            o: order.getOrder(),
            l: order.getNullPolicy()
        });
    }
    return sort;
}

/**
 * Converts expression to the plain object
 * @param expr Expression to convert
 */
function expressionToObject<T>(expr: WhereExpression<T>): object {
    const result = {};
    let currentType: string = '';
    let processingPosition = false;

    playExpression(expr, (key, value) => {
        if (processingPosition) {
            return;
        }

        if (currentType === 'or') {
            result[key] = result[key] || [];
            result[key].push(value);
        } else {
            result[key] = value;
        }
    }, (type) => {
        currentType = type;
        if (type === 'sbisPosition') {
            processingPosition = true;
        }
    }, (type, restoreType) => {
        currentType = restoreType;
        if (type === 'sbisPosition') {
            processingPosition = false;
        }
    });

    return result;
}

/**
 * Applies string expression and its value to given cursor
 * @param expr Expression to apply
 * @param value Value of expression
 * @param cursor Cursor to affect
 */
function applyExpressionAndValue(expr: string, value: unknown, cursor: ICursor): void {
    // Skip undefined values
    if (value === undefined) {
        return;
    }
    const parts = expr.match(EXPRESSION_TEMPLATE);

    // Check next if there's no operand
    if (!parts) {
        return;
    }

    const field = parts[1];
    const operand = parts[2];

    // Add field value to position if it's not null because nulls used only for defining an order.
    if (value !== null) {
        if (!cursor.position) {
            cursor.position = {};
        }
        cursor.position[field] = value;
    }

    // We can use only one kind of order so take it from the first operand
    if (!cursor.order) {
        switch (operand) {
            case '~':
                cursor.order = PoitionNavigationOrder.both;
                break;

            case '<':
            case '<=':
                cursor.order = PoitionNavigationOrder.before;
                break;
        }
    }
}

/**
 * Applies multiple positions to given cursor
 * @param conditions Conditions of positions to apply
 * @param cursor Cursor to affect
 * @param adapter Adapter to use in records
 */
function applyMultiplePosition(conditions: PositionDeclaration[], cursor: ICursor, adapter: AdapterDescriptor): void {
    cursor.position = [];

    conditions.forEach(([conditionKey, conditionFilter]) => {
        const conditionCursor: ICursor = {
            position: null,
            order: ''
        };
        Object.keys(conditionFilter).forEach((filterKey) => {
            applyExpressionAndValue(filterKey, conditionFilter[filterKey], conditionCursor);
        });

        (cursor.position as object[]).push({
            id: conditionKey,
            nav:  buildRecord(conditionCursor.position, adapter)
        });

        cursor.order = cursor.order || conditionCursor.order;
    });
}

/**
 * Returns navigation parameters
 */
function getNavigationParams(query: Query, options: IOptionsOption, adapter: AdapterDescriptor): object | null {
    if (!query) {
        return null;
    }

    const offset = query.getOffset();
    const limit = query.getLimit();
    const meta = query.getMeta();
    const moreProp = options.hasMoreProperty;
    const hasMoreProp = meta.hasOwnProperty(moreProp);
    const more = hasMoreProp ? meta[moreProp] : offset >= 0;
    const withoutOffset = offset === 0;
    const withoutLimit = limit === undefined || limit === null;

    let params = null;
    switch (meta.navigationType || options.navigationType) {
        case NavigationType.Page:
            if (!withoutOffset || !withoutLimit) {
                params = {
                    Страница: limit > 0 ? Math.floor(offset / limit) : 0,
                    РазмерСтраницы: limit,
                    ЕстьЕще: more
                };
            }
            break;

        case NavigationType.Position:
            if (!withoutLimit) {
                const where = query.getWhere();
                const cursor = {
                    position: null,
                    order: ''
                };
                let processingPosition = false;

                playExpression(where, (expr, value) => {
                    if (processingPosition) {
                        return;
                    }

                    applyExpressionAndValue(expr, value, cursor);

                    // Also delete property with operand in query (by link)
                    delete where[expr];
                }, (type, conditions) => {
                    if (type === 'sbisPosition') {
                        processingPosition = true;
                        applyMultiplePosition(conditions as PositionDeclaration[], cursor, adapter);
                    }
                }, (type) => {
                    if (type === 'sbisPosition') {
                        processingPosition = false;
                    }
                });

                params = {
                    HasMore: more,
                    Limit: limit,
                    Order: cursor.order || PoitionNavigationOrder.after,
                    Position: cursor.position instanceof Array
                        ? buildRecordSet(cursor.position, adapter)
                        : buildRecord(cursor.position, adapter)
                };
            }
            break;

        default:
            if (!withoutOffset || !withoutLimit) {
                params = {
                    Offset: offset || 0,
                    Limit: limit,
                    HasMore: more
                };
            }
    }

    return params;
}

/**
 * Returns filtering parameters
 */
function getFilterParams(query: Query): object | null {
    let params = null;
    if (query) {
        params = expressionToObject(query.getWhere());

        const meta = query.getMeta();
        if (meta) {
            switch (meta.expand) {
                case ExpandMode.None:
                    params.Разворот = 'Без разворота';
                    break;
                case ExpandMode.Nodes:
                    params.Разворот = 'С разворотом';
                    params.ВидДерева = 'Только узлы';
                    break;
                case ExpandMode.Leaves:
                    params.Разворот = 'С разворотом';
                    params.ВидДерева = 'Только листья';
                    break;
                case ExpandMode.All:
                    params.Разворот = 'С разворотом';
                    params.ВидДерева = 'Узлы и листья';
                    break;
            }
        }
    }

    return params;
}

type AdditionalParams = string[] | IHashMap<unknown>;

/**
 * Returns additional parameters
 */
function getAdditionalParams(query: Query): AdditionalParams {
    let additional: AdditionalParams = [];
    if (query) {
        additional = query.getSelect();
        if (additional && DataMixin.isModelInstance(additional)) {
            const obj = {};
            additional.each((key, value) => {
                obj[key] = value;
            });
            additional = obj;
        }

        if (additional instanceof Object) {
            const arr = [];
            for (const key in additional) {
                if (additional.hasOwnProperty(key)) {
                    arr.push(additional[key]);
                }
            }
            additional = arr;
        }

        if (!(additional instanceof Array)) {
            throw new TypeError('Types/_source/SbisService::getAdditionalParams(): unsupported data type. ' +
              'Only Array, Types/_entity/Record or Object are allowed.');
        }
    }

    return additional;
}

interface ICreateMeta extends IHashMap<unknown> {
    ВызовИзБраузера?: boolean;
}

interface ICreateResult {
    Фильтр: Record;
    ИмяМетода: string | null;
}

/**
 * Returns data to send in create()
 */
function passCreate(this: SbisService, meta?: Record | ICreateMeta): ICreateResult {
    if (!DataMixin.isModelInstance(meta)) {
        meta = {...meta || {}};
        if (!('ВызовИзБраузера' in meta)) {
            meta.ВызовИзБраузера = true;
        }
    }

    // TODO: вместо 'ИмяМетода' может передаваться 'Расширение'
    return {
        Фильтр: buildRecord(meta, this._$adapter),
        ИмяМетода: this._$binding.format || null
    };
}

interface IReadResult {
    ИдО: EntityId;
    ИмяМетода: string | null;
    ДопПоля?: IHashMap<unknown>;
}

/**
 * Returns data to send in read()
 */
function passRead(this: SbisService, key: EntityId, meta?: IHashMap<unknown>): IReadResult {
    const args: IReadResult = {
        ИдО: key,
        ИмяМетода: this._$binding.format || null
    };
    if (meta && Object.keys(meta).length) {
        args.ДопПоля = meta;
    }
    return args;
}

interface IUpdateResult {
    Запись?: Record;
    Записи?: Record;
    ДопПоля?: IHashMap<unknown>;
}

/**
 * Returns data to send in update()
 */
function passUpdate(this: SbisService, data: Record | RecordSet, meta?: IHashMap<unknown>): IUpdateResult {
    const superArgs = (Rpc.prototype as any)._$passing.update.call(this, data, meta);
    const args: IUpdateResult = {};
    const recordArg = DataMixin.isRecordSetInstance(superArgs[0]) ? 'Записи' : 'Запись';

    args[recordArg] = superArgs[0];

    if (superArgs[1] && Object.keys(superArgs[1]).length) {
        args.ДопПоля = superArgs[1];
    }

    return args;
}

interface IUpdateBatchResult {
    changed: RecordSet;
    added: RecordSet;
    removed: RecordSet;
}

/**
 * Returns data to send in update() if updateBatch uses
 */
function passUpdateBatch(items: RecordSet, meta?: IHashMap<unknown>): IUpdateBatchResult {
    const RecordSetType = resolve<typeof RecordSet>('Types/collection:RecordSet');
    const patch = RecordSetType.patch(items);
    return {
        changed: patch.get('changed'),
        added: patch.get('added'),
        removed: patch.get('removed')
    };
}

interface IDestroyResult {
    ИдО: string | string[];
    ДопПоля?: IHashMap<unknown>;
}

/**
 * Returns data to send in destroy()
 */
function passDestroy(this: SbisService, keys: string | string[], meta?: IHashMap<unknown>): IDestroyResult {
    const args: IDestroyResult = {
        ИдО: keys
    };
    if (meta && Object.keys(meta).length) {
        args.ДопПоля = meta;
    }
    return args;
}

interface IQueryResult {
    Фильтр: Record;
    Сортировка: RecordSet<Record>;
    Навигация: Record;
    ДопПоля: AdditionalParams;
}

/**
 * Returns data to send in query()
 */
function passQuery(this: SbisService, query?: Query): IQueryResult {
    const nav = getNavigationParams(query, this._$options, this._$adapter);
    const filter = getFilterParams(query);
    const sort = getSortingParams(query);
    const add = getAdditionalParams(query);

    return {
        Фильтр: buildRecord(filter, this._$adapter),
        Сортировка: buildRecordSet(sort, this._$adapter, this.getKeyProperty()),
        Навигация: buildRecord(nav, this._$adapter),
        ДопПоля: add
    };
}

interface ICopyResult {
    ИдО: EntityId;
    ИмяМетода: string;
    ДопПоля?: AdditionalParams;
}

/**
 * Returns data to send in copy()
 */
function passCopy(this: SbisService, key: EntityId, meta?: IHashMap<unknown>): ICopyResult {
    const args: ICopyResult = {
        ИдО: key,
        ИмяМетода: this._$binding.format
    };
    if (meta && Object.keys(meta).length) {
        args.ДопПоля = meta;
    }
    return args;
}

interface IMergeResult {
    ИдО: EntityId;
    ИдОУд: EntityId;
}

/**
 * Returns data to send in merge()
 */
function passMerge(this: SbisService, from: EntityId, to: EntityId): IMergeResult {
    return {
        ИдО: from,
        ИдОУд: to
    };
}

interface IMoveResult {
    IndexNumber: string;
    HierarchyName: string;
    ObjectName: string;
    ObjectId: EntityId;
    DestinationId: EntityId;
    Order: string;
    ReadMethod: string;
    UpdateMethod: string;
}

/**
 * Returns data to send in move()
 */
function passMove(this: SbisService, from: EntityId, to: EntityId, meta?: IMoveMeta): IMoveResult {
    return {
        IndexNumber: this._$orderProperty,
        HierarchyName: meta.parentProperty || null,
        ObjectName: meta.objectName,
        ObjectId: from,
        DestinationId: to,
        Order: meta.position,
        ReadMethod: buildBlMethodName(meta.objectName, this._$binding.read),
        UpdateMethod: buildBlMethodName(meta.objectName, this._$binding.update)
    };
}

/**
 * Calls move method in old style
 * @param from Record to move
 * @param to Record to move to
 * @param meta Meta data
 */
function oldMove(
    this: SbisService,
    from: EntityId | EntityId[],
    to: string, meta: IOldMoveMeta
): Promise<unknown> {
    logger.info(
        this._moduleName,
        'Move elements through moveAfter and moveBefore methods have been deprecated, please use just move instead.'
    );

    const moveMethod = meta.before ? this._$binding.moveBefore : this._$binding.moveAfter;
    const params = {
        ПорядковыйНомер: this._$orderProperty,
        Иерархия: meta.hierField || null,
        Объект: this._$endpoint.moveContract,
        ИдО: createComplexId(from as string, this._$endpoint.contract)
    };

    params[meta.before ? 'ИдОДо' : 'ИдОПосле'] = createComplexId(to, this._$endpoint.contract);

    return this._callProvider(
        this._$endpoint.moveContract + BL_OBJECT_SEPARATOR + moveMethod,
        params
    );
}

/**
 * Calls destroy method for some BL-Object
 * @param ids BL objects ids to delete
 * @param name BL object name
 * @param meta Meta data
 */
function callDestroyWithComplexId(
    this: SbisService,
    ids: string[],
    name: string,
    meta: object
): Promise<unknown> {
    return this._callProvider(
        this._$endpoint.contract === name
            ? this._$binding.destroy
            :  buildBlMethodName(name, this._$binding.destroy),
        this._$passing.destroy.call(this, ids, meta)
    );
}

/**
 * Класс источника данных на сервисах бизнес-логики СБИС.
 * @remark
 * <b>Пример 1</b>. Создадим источник данных для объекта БЛ:
 * <pre>
 *     import {SbisService} from 'Types/source';
 *     const dataSource = new SbisService({
 *         endpoint: 'Employee'
 *     });
 * </pre>
 * <b>Пример 2</b>. Создадим источник данных для объекта БЛ, используя отдельную точку входа:
 * <pre>
 *     import {SbisService} from 'Types/source';
 *     const dataSource = new SbisService({
 *         endpoint: {
 *             address: '/my-service/entry/point/',
 *             contract: 'Employee'
 *         }
 *     });
 * </pre>
 * <b>Пример 3</b>. Создадим источник данных для объекта БЛ с указанием своих методов для чтения записи и списка записей, а также свой формат записи:
 * <pre>
 *     import {SbisService} from 'Types/source';
 *     const dataSource = new SbisService({
 *         endpoint: 'Employee',
 *         binding: {
 *             read: 'GetById',
 *             query: 'GetList',
 *             format: 'getListFormat'
 *         },
 *         keyProperty: '@Employee'
 *     });
 * </pre>
 * <b>Пример 4</b>. Выполним основные операции CRUD-контракта объекта 'Article':
 * <pre>
 *     import {SbisService, Query} from 'Types/source';
 *     import {Model} from 'Types/entity';
 *
 *     function onError(err: Error): void {
 *         console.error(err);
 *     }
 *
 *     const dataSource = new SbisService({
 *         endpoint: 'Article',
 *         keyProperty: 'id'
 *     });
 *
 *     // Создадим новую статью
 *     dataSource.create().then((article) => {
 *         const id = article.getKey();
 *     }).catch(onError);
 *
 *     // Прочитаем статью
 *     dataSource.read('article-1').then((article) => {
 *         const title = article.get('title');
 *     }).catch(onError);
 *
 *     // Обновим статью
 *     const article = new Model({
 *         adapter: dataSource.getAdapter(),
 *         format: [
 *             {name: 'id', type: 'integer'},
 *             {name: 'title', type: 'string'}
 *         ],
 *         keyProperty: 'id'
 *     });
 *     article.set({
 *         id: 'article-1',
 *         title: 'Article 1'
 *     });
 *
 *     dataSource.update(article).then(() => {
 *         console.log('Article updated!');
 *     }).catch(onError);
 *
 *     // Удалим статью
 *     dataSource.destroy('article-1').then(() => {
 *         console.log('Article deleted!');
 *     }).catch(onError);
 *
 *     // Прочитаем первые сто статей
 *     const query = new Query();
 *     query.limit(100);
 *
 *     dataSource.query(query).then((response) => {
 *         const articles = response.getAll();
 *         console.log(`Articles count: ${articles.getCount()}`);
 *     }).catch(onError);
 * </pre>
 * <b>Пример 5</b>. Выберем статьи, используя навигацию по курсору:
 * <pre>
 *     import {SbisService, Query, QueryNavigationType} from 'Types/source';
 *
 *     const dataSource = new SbisService({
 *         endpoint: 'Article',
 *         keyProperty: 'id',
 *         options: {
 *             navigationType: QueryNavigationType.POSITION
 *         }
 *     });
 *
 *     const query = new Query();
 *     // Set cursor position by value of field 'PublicationDate'
 *     query.where({
 *         'PublicationDate>=': new Date(2020, 0, 1)
 *     });
 *     query.limit(100);
 *
 *     dataSource.query(query).then((response) => {
 *         const articles = response.getAll();
 *         console.log('Articles released on the 1st of January 2020 or later');
 *         // Do something with articles
 *     }).catch(onError);
 * </pre>
 * <b>Пример 5</b>. Выберем статьи, используя множественную навигацию по курсору:
 * <pre>
 *     import {SbisService, Query, QueryNavigationType, queryAndExpression, sbisServicePositionExpression} from 'Types/source';
 *
 *     const dataSource = new SbisService({
 *         endpoint: 'Article',
 *         keyProperty: 'articleId',
 *         options: {
 *             navigationType: QueryNavigationType.POSITION
 *         }
 *     });
 *
 *     const sections = {
 *         movies: 456,
 *         cartoons: 457,
 *         comics: 458,
 *         literature: 459,
 *         art: 460
 *     };
 *
 *     const query = new Query();
 *     // Set multiple cursors position by value of field 'PublicationDate' within hierarchy nodes with given id
 *     query.where(queryAndExpression({
 *         visible: true
 *     }, sbisServicePositionExpression(
 *         [sections.movies, {'PublicationDate>=': new Date(2020, 0, 10)}],
 *         [sections.comics, {'PublicationDate>=': new Date(2020, 0, 12)}]
 *     )));
 *     query.limit(100);
 *
 *     dataSource.query(query).then((response) => {
 *         const articles = response.getAll();
 *         console.log(`
 *             Visible articles from sections "Movies" (published on the 10th of January 2020 or later)
 *             and "Comics" (published on the 12th of January 2020 or later).
 *         `);
 *         // Do something with articles
 *     }).catch(onError);
 * </pre>
 * @class Types/_source/SbisService
 * @extends Types/_source/Rpc
 * @public
 * @author Мальцев А.А.
 */
export default class SbisService extends Rpc {
    /**
     * @typedef {Object} Endpoint
     * @property {String} contract Контракт - определяет доступные операции
     * @property {String} [address] Адрес - указывает место расположения сервиса, к которому будет осуществлено подключение
     * @property {String} [moveContract=ПорядковыйНомер] Название объекта бл в которому принадлежат методы перемещения
     */

    /** @typedef {Object} MoveMetaConfig
     * @property {Boolean} [before=false] Если true, то перемещаемая модель добавляется перед целевой моделью.
     */

    /**
     * @typedef {String} NavigationType
     * @variant Page По номеру страницы: передается номер страницы выборки и количество записей на странице.
     * @variant Offset По смещению: передается смещение от начала выборки и количество записей на странице.
     * @variant Position По курсору: передается позиция курсора, количество записей на странице и направление обхода
     * относительно курсора.
     */

    /**
     * @cfg {Endpoint|String} Конечная точка, обеспечивающая доступ клиента к функциональным возможностям источника данных.
     * @name Types/_source/SbisService#endpoint
     * @remark
     * Можно успользовать сокращенную запись, передав значение в виде строки - в этом случае оно будет интерпретироваться как контракт (endpoint.contract).
     * @see getEndPoint
     * @example
     * Подключаем объект БЛ 'Сотрудник', используя сокращенную запись:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee'
     *     });
     * </pre>
     * Подключаем объект БЛ 'Сотрудник', используя отдельную точку входа:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *         endpoint: {
     *             address: '/my-service/entry/point/',
     *             contract: 'Employee'
     *         }
     *     });
     * </pre>
     */
    protected _$endpoint: IEndpoint;

    /**
     * @cfg {Object} Соответствие методов CRUD методам БЛ. Определяет, какой метод объекта БЛ соответствует каждому методу CRUD.
     * @name Types/_source/SbisService#binding
     * @remark
     * По умолчанию используются стандартные методы.
     * Можно переопределить имя объекта БЛ, указанное в endpont.contract, прописав его имя через точку.
     * @see getBinding
     * @see create
     * @see read
     * @see destroy
     * @see query
     * @see copy
     * @see merge
     * @example
     * Зададим свои реализации для методов create, read и update:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee'
     *         binding: {
     *             create: 'new',
     *             read: 'get',
     *             update: 'save'
     *         }
     *     });
     * </pre>
     * Зададим реализацию для метода create на другом объекте БЛ:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee'
     *         binding: {
     *             create: 'Personnel.Create'
     *         }
     *     });
     * </pre>
     */
    protected _$binding: IBinding;

    protected _$passing: IRemotePassing;

    /**
     * @cfg {String|Function|Types/_entity/adapter/IAdapter} Адаптер для работы с данными. Для работы с БЛ всегда используется адаптер {@link Types/_entity/adapter/Sbis}.
     * @name Types/_source/SbisService#adapter
     * @see getAdapter
     * @see Types/_entity/adapter/Sbis
     * @see Types/di
     */
    protected _$adapter: string;

    /**
     * @cfg {String|Function|Types/_source/provider/IAbstract} Объект, реализующий сетевой протокол для обмена в режиме клиент-сервер, по умолчанию {@link Types/_source/provider/SbisBusinessLogic}.
     * @name Types/_source/SbisService#provider
     * @see Types/_source/Rpc#provider
     * @see getProvider
     * @see Types/di
     * @example
     * Используем провайдер нотификатора:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     import SbisPluginProvider from 'Plugin/DataSource/Provider/SbisPlugin';
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee'
     *         provider: new SbisPluginProvider()
     *     });
     * </pre>
     */
    protected _$provider: string;

    /**
     * @cfg {String} Имя поля, по которому по умолчанию сортируются записи выборки. По умолчанию 'ПорНомер'.
     * @name Types/_source/SbisService#orderProperty
     * @see move
     */
    protected _$orderProperty: string;

    protected _$options: IOptionsOption;

    constructor(options?: IOptions) {
        super(options);

        if (!this._$endpoint.moveContract) {
            this._$endpoint.moveContract = 'IndexNumber';
        }
    }

    // region Public methods

    getOrderProperty(): string {
        return this._$orderProperty;
    }

    setOrderProperty(name: string): void {
        this._$orderProperty = name;
    }

    // endregion

    // region ICrud

    /**
     * Создает пустую модель через источник данных
     * @param {Object|Types/_entity/Record} [meta] Дополнительные мета данные, которые могут понадобиться для создания модели.
     * @return {Core/Deferred} Асинхронный результат выполнения: в случае успеха вернет {@link Types/_entity/Model}, в случае ошибки - Error.
     * @see Types/_source/ICrud#create
     * @example
     * Создадим нового сотрудника:
     * <pre>
     *    import {SbisService} from 'Types/source';
     *    const dataSource = new SbisService({
     *       endpoint: 'Employee',
     *       keyProperty: '@Employee'
     *    });
     *    dataSource.create().then((employee) => {
     *       console.log(employee.get('FirstName'));
     *    }.then((error) => {
     *       console.error(error);
     *    });
     * </pre>
     * Создадим нового сотрудника по формату:
     * <pre>
     *    import {SbisService} from 'Types/source';
     *    const dataSource = new SbisService({
     *       endpoint: 'Employee',
     *       keyProperty: '@Employee',
     *       binding: {
     *          format: 'getListFormat'
     *       }
     *    });
     *    dataSource.create().then((employee) => {
     *       console.log(employee.get('FirstName'));
     *    }.then((error) => {
     *       console.error(error);
     *    });
     * </pre>
     */
    create(meta?: IHashMap<unknown>): Promise<Record> {
        meta = object.clonePlain(meta, true);
        return this._loadAdditionalDependencies((ready) => {
            this._connectAdditionalDependencies(
                super.create(meta) as any,
                ready
            );
        });
    }

    update(data: Record | RecordSet, meta?: IHashMap<unknown>): Promise<null> {
        if (this._$binding.updateBatch && DataMixin.isRecordSetInstance(data)) {
            return this._loadAdditionalDependencies((ready) => {
                this._connectAdditionalDependencies(
                    this._callProvider(
                        this._$binding.updateBatch,
                        passUpdateBatch(data as RecordSet, meta)
                    ).addCallback(
                        (key) => this._prepareUpdateResult(data, key)
                    ) as any,
                    ready
                );
            });
        }

        return super.update(data, meta);
    }

    destroy(keys: EntityId | EntityId[], meta?: IHashMap<unknown>): Promise<null> {
        if (!(keys instanceof Array)) {
            return callDestroyWithComplexId.call(
                this,
                [getKeyByComplexId(keys)],
                getNameByComplexId(keys, this._$endpoint.contract),
                meta
            );
        }

        // В ключе может содержаться ссылка на объект БЛ - сгруппируем ключи по соответствующим им объектам
        const groups = getGroupsByComplexIds(keys, this._$endpoint.contract);
        const pd = new ParallelDeferred();
        for (const name in groups) {
            if (groups.hasOwnProperty(name)) {
                pd.push(callDestroyWithComplexId.call(
                    this,
                    groups[name],
                    name,
                    meta
                ));
            }
        }
        return pd.done().getResult();
    }

   query(query?: Query): Promise<DataSet> {
      query = object.clonePlain(query, true);
      return this._loadAdditionalDependencies((ready) => {
         this._connectAdditionalDependencies(
            super.query(query) as any,
            ready
         );
      });
   }

    // endregion

    // region ICrudPlus

    move(items: EntityId[], target: EntityId, meta?: IMoveMeta): Promise<unknown> {
        meta = meta || {};
        if (this._$binding.moveBefore) {
            // TODO: поддерживаем старый способ с двумя методами
            return oldMove.call(this, items, target as string, meta as IOldMoveMeta);
        }

        // На БЛ не могут принять массив сложных идентификаторов,
        // поэтому надо сгуппировать идентификаторы по объекту и для каждой группы позвать метод
        const groups = getGroupsByComplexIds(items, this._$endpoint.contract);
        const groupsCount = Object.keys(groups).length;
        const pd = new ParallelDeferred();
        if (target !== null) {
            target = getKeyByComplexId(target);
        }

        for (const name in groups) {
            if (groups.hasOwnProperty(name)) {
                meta.objectName = name;
                const def = this._callProvider(
                    buildBlMethodName(this._$endpoint.moveContract, this._$binding.move),
                    this._$passing.move.call(this, groups[name], target, meta)
                );
                if (groupsCount === 1) {
                    // TODO: нужно доработать ParallelDeferred что бы он возвращал оригинал ошибки:
                    // https://online.sbis.ru/opendoc.html?guid=ecb592a4-bc06-463f-a3a0-90527f397ac2
                    return def;
                }
                pd.push(def);
            }
        }

        return pd.done().getResult();
    }

    // endregion

    // region Remote

    getProvider(): IAbstract {
        if (!this._provider) {
            this._provider = this._createProvider(this._$provider, {
                endpoint: this._$endpoint,
                options: this._$options,

                // TODO: remove pass 'service' and 'resource'
                service: this._$endpoint.address,
                resource: this._$endpoint.contract
            });
        }

        return this._provider;
    }

    // endregion
}

// There are properties owned by the prototype
Object.assign(SbisService.prototype, /** @lends Types/_source/SbisService.prototype */ {
    '[Types/_source/SbisService]': true,
    _moduleName: 'Types/source:SbisService',

    _$binding: getMergeableProperty<IBinding>({
        /**
         * @cfg {String} Имя метода для создания записи через {@link create}.
         * @name Types/_source/SbisService#binding.create
         * @example
         * Зададим свою реализацию для метода create:
         * <pre>
         *     import {SbisService} from 'Types/source';
         *     const dataSource = new SbisService({
         *         endpoint: 'Employee',
         *         binding: {
         *             create: 'FastCreate'
         *         }
         *     });
         * </pre>
         * Зададим реализацию для метода create на другом объекте БЛ:
         * <pre>
         *     import {SbisService} from 'Types/source';
         *     const dataSource = new SbisService({
         *         endpoint: 'Employee',
         *         binding: {
         *             create: 'Personnel.Create'
         *         }
         *     });
         * </pre>
         */
        create: 'Создать',

        /**
         * @cfg {String} Имя метода для чтения записи через {@link read}.
         * @name Types/_source/SbisService#binding.read
         * @example
         * Зададим свою реализацию для метода read:
         * <pre>
         *     import {SbisService} from 'Types/source';
         *     const dataSource = new SbisService({
         *         endpoint: 'Employee',
         *         binding: {
         *             read: 'getById'
         *         }
         *     });
         * </pre>
         * Зададим реализацию для метода create на другом объекте БЛ:
         * <pre>
         *     import {SbisService} from 'Types/source';
         *     const dataSource = new SbisService({
         *         endpoint: 'Employee',
         *         binding: {
         *             read: 'Personnel.Read'
         *         }
         *     });
         * </pre>
         */
        read: 'Прочитать',

        /**
         * @cfg {String} Имя метода для обновления записи или рекордсета через {@link update}.
         * @name Types/_source/SbisService#binding.update
         * @example
         * Зададим свою реализацию для метода update:
         * <pre>
         *     import {SbisService} from 'Types/source';
         *     const dataSource = new SbisService({
         *         endpoint: 'Employee',
         *         binding: {
         *             update: 'FastSave'
         *         }
         *     });
         * </pre>
         * Зададим реализацию для метода update на другом объекте БЛ:
         * <pre>
         *     import {SbisService} from 'Types/source';
         *     const dataSource = new SbisService({
         *         endpoint: 'Employee',
         *         binding: {
         *             update: 'Personnel.Update'
         *         }
         *     });
         * </pre>
         */
        update: 'Записать',

        /**
         * @cfg {String} Имя метода для обновления рекордсета через метод {@link update} с передачей только измененных записей.
         * @remark
         * Метод должен принимать следующий набор аргументов:
         * RecordSet changed,
         * RecordSet added,
         * Array<Sting|Number> removed
         * Где changed - измененные записи, added - добавленные записи, removed - ключи удаленных записей.
         * @name Types/_source/SbisService#binding.updateBatch
         */
        updateBatch: '',

        /**
         * @cfg {String} Имя метода для удаления записи через {@link destroy}.
         * @name Types/_source/SbisService#binding.destroy
         * @example
         * Зададим свою реализацию для метода destroy:
         * <pre>
         *     import {SbisService} from 'Types/source';
         *     const dataSource = new SbisService({
         *         endpoint: 'Employee',
         *         binding: {
         *             destroy: 'SafeDelete'
         *         }
         *     });
         * </pre>
         * Зададим реализацию для метода destroy на другом объекте БЛ:
         * <pre>
         *     import {SbisService} from 'Types/source';
         *     const dataSource = new SbisService({
         *         endpoint: 'Employee',
         *         binding: {
         *             destroy: 'Personnel.Delete'
         *         }
         *     });
         * </pre>
         */
        destroy: 'Удалить',

        /**
         * @cfg {String} Имя метода для получения списка записей через {@link query}.
         * @name Types/_source/SbisService#binding.query
         * @example
         * Зададим свою реализацию для метода query:
         * <pre>
         *     import {SbisService} from 'Types/source';
         *     const dataSource = new SbisService({
         *         endpoint: 'Employee',
         *         binding: {
         *             query: 'CustomizedList'
         *         }
         *     });
         * </pre>
         * Зададим реализацию для метода query на другом объекте БЛ:
         * <pre>
         *     import {SbisService} from 'Types/source';
         *     const dataSource = new SbisService({
         *         endpoint: 'Employee',
         *         binding: {
         *             query: 'Personnel.List'
         *         }
         *     });
         * </pre>
         */
        query: 'Список',

        /**
         * @cfg {String} Имя метода для копирования записей через {@link copy}.
         * @name Types/_source/SbisService#binding.copy
         */
        copy: 'Копировать',

        /**
         * @cfg {String} Имя метода для объединения записей через {@link merge}.
         * @name Types/_source/SbisService#binding.merge
         */
        merge: 'Объединить',

        /**
         * @cfg {String} Имя метода перемещения записи перед указанной через метод {@link move}.
         * @remark Метод перемещения, используемый по умолчанию - IndexNumber.Move, при изменении родителя вызовет методы Прочитать(read) и Записать(Update), они обязательно должны быть у объекта БЛ.
         * @name Types/_source/SbisService#binding.move
         */
        move: 'Move',

        /**
         * @cfg {String} Имя метода для получения формата записи через {@link create}, {@link read} и {@link copy}.
         * Метод должен быть декларативным.
         * @name Types/_source/SbisService#binding.format
         */
        format: ''
    }),

    _$passing: getMergeableProperty<IRemotePassing>({
        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link create}.
         * @name Types/_source/BindingMixin#passing.create
         */
        create: passCreate,

        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link read}.
         * @name Types/_source/BindingMixin#passing.read
         */
        read: passRead,

        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link update}.
         * @name Types/_source/BindingMixin#passing.update
         */
        update: passUpdate,

        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link destroy}.
         * @name Types/_source/BindingMixin#passing.destroy
         */
        destroy: passDestroy,

        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link query}.
         * @name Types/_source/BindingMixin#passing.query
         */
        query: passQuery,

        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link copy}.
         * @name Types/_source/BindingMixin#passing.copy
         */
        copy: passCopy,

        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link merge}.
         * @name Types/_source/BindingMixin#passing.merge
         */
        merge: passMerge,

        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link move}.
         * @name Types/_source/BindingMixin#passing.move
         */
        move: passMove
    }),

    /**
     * @cfg {String|Function|Types/_entity/adapter/IAdapter} Адаптер для работы с данными. Для работы с БЛ всегда используется адаптер {@link Types/_entity/adapter/Sbis}.
     * @name Types/_source/SbisService#adapter
     * @see getAdapter
     * @see Types/_entity/adapter/Sbis
     * @see Types/di
     */
    _$adapter: 'Types/entity:adapter.Sbis',

    /**
     * @cfg {String|Function|Types/_source/Provider/IAbstract} Объект, реализующий сетевой протокол для обмена в режиме клиент-сервер, по умолчанию {@link Types/_source/Provider/SbisBusinessLogic}.
     * @name Types/_source/SbisService#provider
     * @see Types/_source/Rpc#provider
     * @see getProvider
     * @see Types/di
     * @example
     * Используем провайдер нотификатора:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     import SbisPluginProvider from 'Plugin/DataSource/Provider/SbisPlugin';
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee',
     *         provider: new SbisPluginProvider()
     *     });
     * </pre>
     */
    _$provider: 'Types/source:provider.SbisBusinessLogic',

    /**
     * @cfg {String} Имя поля, по которому по умолчанию сортируются записи выборки. По умолчанию 'ПорНомер'.
     * @name Types/_source/SbisService#orderProperty
     * @see move
     */
    _$orderProperty: 'ПорНомер',

    _$options: getMergeableProperty<IOptionsOption>(OptionsMixin.addOptions<IOptionsOption>(Rpc, {
        /**
         * @cfg {String} Название свойства мета-данных {@link Types/_source/Query#meta запроса}, в котором хранится
         * значение поля HasMore аргумента Навигация, передаваемое в вызов {@link query}.
         * @name Types/_source/SbisService#options.hasMoreProperty
         */
        hasMoreProperty: 'hasMore'
    }))
});

register('Types/source:SbisService', SbisService, {instantiate: false});
