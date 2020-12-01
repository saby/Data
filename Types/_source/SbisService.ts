import Rpc from './Rpc';
import {
    IOptions as IRemoteOptions,
    IOptionsOption as IRemoteOptionsOption,
    IPassing as IRemotePassing, IProviderOptions
} from './Remote';
import {EntityKey} from './ICrud';
import {IEndpoint as IProviderEndpoint} from './IProvider';
import {IBinding as IDefaultBinding} from './BindingMixin';
import OptionsMixin from './OptionsMixin';
import DataMixin from './DataMixin';
import Query, {
    ExpandMode,
    playExpression,
    NavigationType,
    WhereExpression
} from './Query';
import DataSet from './DataSet';
import {IAbstract} from './provider';
import {RecordSet} from '../collection';
import {applied, AdapterDescriptor, getMergeableProperty, Record, Model} from '../entity';
import {register, resolve} from '../di';
import {logger, object} from '../util';
import {IHashMap} from '../declarations';

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

enum CursorDirection {
    backward = 'backward',
    forward = 'forward',
    bothways = 'bothways'
}

interface ICursor {
    position: object | object[];
    direction: CursorDirection;
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
    passAddFieldsFromMeta?: boolean;
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
function getKeyByComplexId(id: EntityKey): string {
    id = String(id || '');
    if (id.match(COMPLEX_ID_MATCH)) {
        return id.split(COMPLEX_ID_SEPARATOR)[0];
    }
    return id;
}

/**
 * Returns name of the BL Object from its complex id
 */
function getNameByComplexId(id: EntityKey, defaults: string): string {
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
function getGroupsByComplexIds(ids: EntityKey[], defaults: string): object {
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
    if (data instanceof Record) {
        return data;
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
function buildRecordSet<T = unknown>(
    data: T | RecordSet<T, Model<T>>,
    adapter: AdapterDescriptor,
    keyProperty?: string
): RecordSet<T, Model<T>> | null {
    if (data === null) {
        return null;
    }
    if (data && DataMixin.isRecordSetInstance(data)) {
        return data;
    }

    const RecordSetType = resolve<typeof RecordSet>('Types/collection:RecordSet');
    const records = new RecordSetType<T, Model<T>>({
        adapter,
        keyProperty
    });

    if (data instanceof Array) {
        const count = data.length;
        for (let i = 0; i < count; i++) {
            records.add(buildRecord(data[i], adapter) as unknown as Model<T>);
        }
    }

    return records;
}

function eachQuery<T>(
    query: Query<T>,
    callback: (item: Query<T>, parent: Query<T>) => void,
    prev?: Query<T>
): void {
    callback(query, prev);
    query.getUnion().forEach((unionQuery: Query) => {
        eachQuery(unionQuery, callback, query);
    });
}

/**
 * Returns sorting parameters
 */
function getSortingParams(query: Query): string[] | null {
    if (!query) {
        return null;
    }

    let sort = null;
    eachQuery(query, (subQuery) => {
        const orders = subQuery.getOrderBy();
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            if (!sort) {
                sort = [];
            }
            sort.push({
                n: order.getSelector(),
                o: order.getOrder(),
                l: order.getNullPolicy()
            });
        }
    });

    return sort;
}

/**
 * Converts expression to the plain object
 * @param expr Expression to convert
 */
function expressionToObject<T>(expr: WhereExpression<T>): object {
    const result = {};
    let currentType: string = '';

    playExpression(expr, (key, value) => {
        if (currentType === 'or') {
            result[key] = result[key] || [];
            if (value !== undefined) {
                result[key].push(value);
            }
        } else {
            result[key] = value;
        }
    }, (type) => {
        currentType = type;
    }, (type, restoreType) => {
        currentType = restoreType;
    });

    return result;
}

/**
 * Applies string expression and its value to given cursor
 * @param expr Expression to apply
 * @param value Value of expression
 * @param cursor Cursor to affect
 * @return True if argument expr contains expression
 */
function applyPairToCursor(expr: string, value: unknown, cursor: ICursor): boolean {
    // Skip undefined values
    if (value === undefined) {
        return false;
    }
    const parts = expr.match(EXPRESSION_TEMPLATE);

    // Check next if there's no operand
    if (!parts) {
        return false;
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
    if (!cursor.direction) {
        switch (operand) {
            case '~':
                cursor.direction = CursorDirection.bothways;
                break;

            case '<':
            case '<=':
                cursor.direction = CursorDirection.backward;
                break;
        }
    }

    return true;
}

/**
 * Returns navigation parameters
 */
function getNavigationParams(query: Query, options: IOptionsOption, adapter: AdapterDescriptor): object[] | null {
    const result = [];

    if (!query) {
        return result;
    }

    eachQuery(query, (subQuery) => {
        const offset = subQuery.getOffset();
        const limit = subQuery.getLimit();
        const meta = subQuery.getMeta();
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
                    const cursor: ICursor = {
                        position: null,
                        direction: null
                    };

                    const where = subQuery.getWhere();
                    playExpression(where, (expr, value) => {
                        if (applyPairToCursor(expr, value, cursor)) {
                            // Also delete property with operand in subQuery (by link)
                            delete where[expr];
                        }
                    });

                    params = {
                        HasMore: more,
                        Limit: limit,
                        Direction: cursor.direction || CursorDirection.forward,
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

        result.push(params);
    });

    return result;
}

interface IMultipleNavigation {
    id: EntityKey;
    nav: Record<unknown>;
}

function getMultipleNavigation(
    summaryNav: object[],
    summaryFilter: object[],
    adapter: AdapterDescriptor
): IMultipleNavigation[] {
    const navigation = [];

    summaryNav.forEach((sectionNav, index) => {
        // Treat first filter key as section id
        const sectionFilter = summaryFilter[index] || {};
        const primaryKeys = Object.entries(sectionFilter)
            .filter(([key, value]) => value instanceof applied.PrimaryKey)
            .map(([key, value]) => {
                // Delete section id from filter to prevent sending it in general filter
                delete sectionFilter[key];

                return value;
            });

        navigation.push({
            id: primaryKeys.length === 0 ? null : (primaryKeys.length ? primaryKeys[0] : primaryKeys),
            nav: buildRecord(sectionNav, adapter)
        });
    });

    return navigation;
}

/**
 * Returns filtering parameters
 */
function getFilterParams(query: Query): object[] {
    const result = [];

    if (!query) {
        return result;
    }

    interface IHierarchyOptions {
        Разворот?: string;
        ВидДерева?: string;
    }

    eachQuery(query, (subQuery) => {
        const whereExpr = subQuery.getWhere();
        // Pass records and models 'as is'
        const whereObject: IHierarchyOptions = whereExpr instanceof Record
            ? whereExpr
            : expressionToObject(whereExpr);

        const meta = subQuery.getMeta();
        if (meta) {
            switch (meta.expand) {
                case ExpandMode.None:
                    whereObject.Разворот = 'Без разворота';
                    break;
                case ExpandMode.Nodes:
                    whereObject.Разворот = 'С разворотом';
                    whereObject.ВидДерева = 'Только узлы';
                    break;
                case ExpandMode.Leaves:
                    whereObject.Разворот = 'С разворотом';
                    whereObject.ВидДерева = 'Только листья';
                    break;
                case ExpandMode.All:
                    whereObject.Разворот = 'С разворотом';
                    whereObject.ВидДерева = 'Узлы и листья';
                    break;
            }
        }

        result.push(whereObject);
    });

    return result;
}

function mergeFilterParams(summaryFilter: object[]): object {
    if (!summaryFilter) {
        return summaryFilter;
    }

    const result = summaryFilter.reduce((memo, item) => {
        if (item instanceof Record) {
            if (!memo) {
                return item;
            }
            item.each((value, name) => {
                object.setPropertyValue(memo, name as string, value);
            });
            return memo;
        } else if (memo instanceof Record) {
            memo.set(item);
            return memo;
        }
        return {...(memo || {}), ...item};
    }, null);

    return result;
}

type AdditionalParams = string[] | IHashMap<unknown>;

/**
 * Returns additional parameters
 */
function getAdditionalParams(query: Query): AdditionalParams {
    const result: AdditionalParams = [];

    if (!query) {
        return result;
    }

    eachQuery(query, (subQuery) => {
        let additional: AdditionalParams = subQuery.getSelect();
        if (additional instanceof Record) {
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

        (result as unknown[]).push(...additional);
    });

    return result;
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
    if (!(meta instanceof Record)) {
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
    ИдО: EntityKey;
    ИмяМетода: string | null;
    ДопПоля?: object;
}

/**
 * Returns data to send in read()
 */
function passRead(this: SbisService, key: EntityKey, meta?: object): IReadResult {
    const binding = this._$binding;
    const passAddFieldsFromMeta = this._$options.passAddFieldsFromMeta;

    const args: IReadResult = {
        ИдО: key,
        ИмяМетода: binding.format || null
    };

    if (passAddFieldsFromMeta && meta && Object.keys(meta).length) {
        args.ДопПоля = meta;
    }

    return args;
}

interface IUpdateResult {
    Запись?: Record;
    Записи?: Record;
    ДопПоля?: object;
}

/**
 * Returns data to send in update()
 */
function passUpdate(this: SbisService, data: Record | RecordSet, meta?: object): IUpdateResult {
    const superArgs = (Rpc.prototype as any)._$passing.update.call(this, data, meta);
    const args: IUpdateResult = {};
    const recordArg = DataMixin.isRecordSetInstance(superArgs.data) ? 'Записи' : 'Запись';
    const passAddFieldsFromMeta = this._$options.passAddFieldsFromMeta;

    args[recordArg] = superArgs.data;

    if (passAddFieldsFromMeta && meta && Object.keys(meta).length) {
        args.ДопПоля = meta;
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
    Сортировка: RecordSet<unknown, Model<unknown>>;
    Навигация: Record<unknown> | RecordSet<unknown, Model<unknown>>;
    ДопПоля: AdditionalParams;
}

/**
 * Returns data to send in query()
 */
function passQuery(this: SbisService, query?: Query): IQueryResult {
    const adapter = this._$adapter;
    let nav = getNavigationParams(query, this._$options, adapter);
    const filter = getFilterParams(query);
    const sort = getSortingParams(query);
    const add = getAdditionalParams(query);

    const isMultipleNavigation = nav.length > 1;
    if (isMultipleNavigation) {
        nav = getMultipleNavigation(nav, filter, adapter);
    }

    return  {
        Фильтр: buildRecord(mergeFilterParams(filter), adapter),
        Сортировка: buildRecordSet(sort, adapter, this.getKeyProperty()),
        Навигация: isMultipleNavigation
            ? buildRecordSet(nav, adapter, this.getKeyProperty())
            : (nav.length ? buildRecord(nav[0], adapter) : null),
        ДопПоля: add
    };
}

/**
 * Public implemetation which returns standard query() method arguments
 * @package [query] query params
 * @package [options] SbisService constructor options
 */
export function getQueryArguments(query?: Query, options?: IOptions): IQueryResult {
    const source = new SbisService(options);
    return passQuery.call(source, query);
}

interface ICopyResult {
    ИдО: EntityKey;
    ИмяМетода: string;
    ДопПоля?: AdditionalParams;
}

/**
 * Returns data to send in copy()
 */
function passCopy(this: SbisService, key: EntityKey, meta?: IHashMap<unknown>): ICopyResult {
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
    ИдО: EntityKey;
    ИдОУд: EntityKey | EntityKey[];
}

/**
 * Returns data to send in merge()
 */
function passMerge(this: SbisService, target: EntityKey, merged: EntityKey | EntityKey[]): IMergeResult {
    return {
        ИдО: target,
        ИдОУд: merged
    };
}

interface IMoveResult {
    IndexNumber: string;
    HierarchyName: string;
    ObjectName: string;
    ObjectId: EntityKey | EntityKey[];
    DestinationId: EntityKey;
    Order: string;
    ReadMethod: string;
    UpdateMethod: string;
}

/**
 * Returns data to send in move()
 */
function passMove(this: SbisService, from: EntityKey | EntityKey[], to: EntityKey, meta?: IMoveMeta): IMoveResult {
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
    from: EntityKey | EntityKey[],
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
 * <b>Пример 5</b>. Выберем статьи, используя множественную навигацию по нескольким разделам каталога:
 * <pre>
 *     import {SbisService, Query} from 'Types/source';
 *     import {applied} from 'Types/entity';
 *
 *     const dataSource = new SbisService({
 *         endpoint: 'Article',
 *         keyProperty: 'articleId'
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
 *     // Use union of queries with various parameters
 *     const moviesQuery = new Query()
 *         .where({sectionId: new applied.PrimaryKey(sections.movies)})
 *         .offset(20)
 *         .limit(10)
 *         .orderBy('imdbRating', true);
 *
 *     const comicsQuery = new Query()
 *         .where({sectionId: new applied.PrimaryKey(sections.comics)})
 *         .offset(30)
 *         .limit(15)
 *         .orderBy('starComRating', true);
 *
 *     comicsQuery.union(moviesQuery);
 *
 *     dataSource.query(comicsQuery).then((response) => {
 *         const articles = response.getAll();
 *         console.log(`
 *             Articles from sections "Comics" and "Movies" with different query params
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
    create(meta?: IHashMap<unknown>): Promise<Model> {
        return this._loadAdditionalDependencies((ready) => {
            this._connectAdditionalDependencies(
                super.create(meta) as any,
                ready
            );
        });
    }

    update(data: Record | RecordSet, meta?: IHashMap<unknown>): Promise<void> {
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

    destroy(keys: EntityKey | EntityKey[], meta?: IHashMap<unknown>): Promise<void> {
        /**
         * Calls destroy method for some BL-Object
         * @param ids BL objects ids
         * @param name BL object name
         * @param meta Meta data
         */
        const callDestroyWithComplexId = (
            ids: string[],
            name: string,
            meta: object
        ): Promise<void> => {
            return this._callProvider(
                this._$endpoint.contract === name
                    ? this._$binding.destroy
                    :  buildBlMethodName(name, this._$binding.destroy),
                this._$passing.destroy.call(this, ids, meta)
            );
        };

        if (!(keys instanceof Array)) {
            return callDestroyWithComplexId(
                [getKeyByComplexId(keys)],
                getNameByComplexId(keys, this._$endpoint.contract),
                meta
            );
        }

        // В ключе может содержаться ссылка на объект БЛ - сгруппируем ключи по соответствующим им объектам
        const groups = getGroupsByComplexIds(keys, this._$endpoint.contract);
        return Promise.all(Object.keys(groups).map((name) => callDestroyWithComplexId(
            groups[name],
            name,
            meta
        ))) as unknown as Promise<void>;
    }

    query(query?: Query): Promise<DataSet> {
       query = object.clonePlain(query);
       return this._loadAdditionalDependencies((ready) => {
          this._connectAdditionalDependencies(
             super.query(query) as any,
             ready
          );
       });
    }

    // endregion

    // region ICrudPlus

    move(items: EntityKey[], target: EntityKey, meta?: IMoveMeta): Promise<void> {
        meta = meta || {};
        if (this._$binding.moveBefore) {
            // TODO: поддерживаем старый способ с двумя методами
            return oldMove.call(this, items, target as string, meta as IOldMoveMeta);
        }

        if (target !== null) {
            target = getKeyByComplexId(target);
        }

        // На БЛ не могут принять массив сложных идентификаторов,
        // поэтому надо сгуппировать идентификаторы по объекту и для каждой группы позвать метод
        const groups = getGroupsByComplexIds(items, this._$endpoint.contract);
        return  Promise.all(Object.keys(groups).map((name) => {
            meta.objectName = name;
            return this._callProvider(
                buildBlMethodName(this._$endpoint.moveContract, this._$binding.move),
                this._$passing.move.call(this, groups[name], target, meta)
            );
        })) as unknown as Promise<void>;
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
            } as IProviderOptions);
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

    /**
     * @cfg {Object} Дополнительные настройки источника данных бизнес-логики СБИС.
     * @name Types/_source/SbisService#options
     */
    _$options: getMergeableProperty<IOptionsOption>(OptionsMixin.addOptions<IOptionsOption>(Rpc, {
        /**
         * @cfg {String} Название свойства мета-данных {@link Types/_source/Query#meta запроса}, в котором хранится
         * значение поля HasMore аргумента Навигация, передаваемое в вызов {@link query}.
         * @name Types/_source/SbisService#options.hasMoreProperty
         */
        hasMoreProperty: 'hasMore',

        /**
         * @cfg {Boolean} Передавать аргумент "ДопПоля" при вызове методов {@link read} и {@link update}, значение которых получено из метаданных {@link Types/_source/Query#meta запроса}.
         * @name Types/_source/SbisService#options.passAddFieldsFromMeta
         */
        passAddFieldsFromMeta: false
    }))
});

register('Types/source:SbisService', SbisService, {instantiate: false});
