/* tslint:disable:member-ordering */

import IEnumerable, { EnumeratorCallback } from './IEnumerable';
import IObservable from './IObservable';
import ObservableList from './ObservableList';
import { IOptions as IListOptions } from './List';
import { Format } from './format';
import Arraywise from './enumerator/Arraywise';
import Indexer from './Indexer';
import {
    FormattableMixin,
    IFormattableOptions,
    IFormattableSerializableState,
    IObservableObject,
    IProducible,
    InstantiableMixin,
    ISerializableSignature,
    ISerializableState as IDefaultSerializableState,
    factory,
    format,
    FormatDescriptor,
    Record,
    RecordState,
    Model,
    adapter
} from '../entity';
import { create, register } from '../di';
import { logger, applyMixins } from '../util';
import { isEqual } from '../object';
import { IHashMap, EntityMarker } from '../_declarations';

const DEFAULT_MODEL = 'Types/entity:Model';
const RECORD_STATE = Record.RecordState;
const developerMode = false;

interface IOptions<T> extends IListOptions<T>, IFormattableOptions {
    model?: Function | string;
    keyProperty?: string;
    meta?: any;
    metaFormat?: FormatDescriptor;
    metaData?: any;
}

interface ISerializableOptions extends IOptions<any>, IFormattableOptions {
}

interface ISerializableState extends IDefaultSerializableState, IFormattableSerializableState {
    $options: ISerializableOptions;
    _instanceId: string;
}

/**
 *
 */
function checkNullId<T extends Record>(value: T, keyProperty: string): void {
    if (developerMode && keyProperty) {
        if (value && value['[Types/_entity/Record]'] && value.get(keyProperty) === null) {
            logger.info('Types/_collection/RecordSet: Id propery must not be null');
        } else if (value instanceof RecordSet) {
            value.each((item) => {
                checkNullId(item, keyProperty);
            });
        }
    }
}

/**
 * Рекордсет - список записей, имеющих общий формат полей.
 * @remark
 * Основные аспекты рекордсета (дополнительно к аспектам {@link Types/_collection/ObservableList}):
 * <ul>
 *     <li>манипуляции с форматом полей. За реализацию аспекта отвечает примесь {@link Types/_entity/FormattableMixin};</li>
 *     <li>манипуляции с сырыми данными посредством адаптера. За реализацию аспекта отвечает примесь {@link Types/_entity/FormattableMixin}.</li>
 * </ul>
 * Элементами рекордсета могут быть только {@link Types/_entity/Record записи}, причем формат полей всех записей должен совпадать.
 *
 * Создадим рекордсет, в котором в качестве сырых данных используется JSON (адаптер для данных в таком формате используется по умолчанию):
 * <pre>
 *     import {RecordSet} from 'Types/collection';
 *     const characters = new RecordSet({
 *         rawData: [{
 *             id: 1,
 *             firstName: 'Tom',
 *             lastName: 'Sawyer'
 *         }, {
 *             id: 2,
 *             firstName: 'Huckleberry',
 *             lastName: 'Finn'
 *         }]
 *     });
 *     characters.at(0).get('firstName'); // 'Tom'
 *     characters.at(1).get('firstName'); // 'Huckleberry'
 * </pre>
 * Создадим рекордсет, в котором в качестве сырых данных используется ответ БЛ СБИС (адаптер для данных в таком формате укажем явно):
 * <pre>
 *     import {RecordSet} from 'Types/collection';
 *     import {SbisService} from 'Types/source';
 *     const ds = new SbisService({endpoint: 'Employee'});
 *     ds.call('list', {department: 'designers'}).then((response) => {
 *         const designers = new RecordSet({
 *             rawData: response.getRawData(),
 *             adapter: response.getAdapter()
 *         });
 *         console.log(designers.getCount());
 *     });
 * </pre>
 * @class Types/_collection/RecordSet
 * @extends Types/_collection/ObservableList
 * @implements Types/_entity/IObservableObject
 * @implements Types/_entity/IProducible
 * @mixes Types/_entity/FormattableMixin
 * @mixes Types/_entity/InstantiableMixin
 * @ignoreOptions items
 * @author Мальцев А.А.
 * @public
 */
class RecordSet<
    TData = any,
    T extends Record<TData> = Model<TData>
> extends ObservableList<T> implements IObservableObject, IProducible {
    /**
     * @typedef {Object} MergeOptions
     * @property {Boolean} [add=true] Добавлять записи с новыми ключами.
     * @property {Boolean} [remove=true] Удалять записи с отсутствующими ключами.
     * @property {Boolean} [replace=true] Заменять записи с одинаковыми ключами.
     * @property {Boolean} [inject=false] Заменять данные записей с одинаковыми ключами.
     */

    /**
     * @cfg Конструктор записей, порождаемых рекордсетом. По умолчанию {@link Types/_entity/Model}.
     * @name Types/_collection/RecordSet#model
     * @see getModel
     * @see Types/_entity/Record
     * @see Types/_entity/Model
     * @see Types/di
     * @example
     * Внедрим конструктор пользовательской модели:
     * <pre>
     *     // App/Models/User.js
     *     import {Model} from 'Types/entity';
     *     export default class User extends Model {
     *         identify(login: string, password: string): boolean {
     *             //...some logic here
     *         }
     *     }
     *
     *     // App/Models/UsersList.js
     *     import User from './User';
     *     import {RecordSet} from 'Types/collection';
     *     const users = new RecordSet({
     *         model: User,
     *         rawData: [{
     *             id: 1,
     *             login: 'editor',
     *             salt: '1fhj46hF'
     *             password: 'dfyTEv4thDD343hIIdS'
     *         }]
     *     });
     *     users.at(0).identify('editor', 'L1keABo$$');
     * </pre>
     */
    protected _$model: Function | string;

    /**
     * @cfg Название свойства записи, содержащего первичный ключ.
     * @name Types/_collection/RecordSet#keyProperty
     * @see getKeyProperty
     * @example
     * Создадим рекордсет, получим запись по первичному ключу:
     * <pre>
     *     import {RecordSet} from 'Types/collection';
     *     const users = new RecordSet({
     *         keyProperty: 'id'
     *         rawData: [{
     *             id: 134,
     *             login: 'editor'
     *         }, {
     *             id: 257,
     *             login: 'shell'
     *         }]
     *     });
     *     users.getRecordById(257).get('login'); // 'shell'
     * </pre>
     */
    protected _$keyProperty: string;

    /**
     * @cfg Метаданные
     * @remark
     * Метаданные - это дополнительная информация, не связанная с RecordSet'ом напрямую.
     * Она используется механизмами списков для построения строки итогов, "хлебных крошек" и постраничной навигации.
     * Существуют три служебных поля в метаданных:
     * <ul>
     *   <li>path - путь для "хлебных крошек", возвращается как {@link Types/_collection/RecordSet};</li>
     *   <li>results - строка итогов, возвращается как {@link Types/_entity/Record}. Подробнее о конфигурации списков для отображения строки итогов читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/interfacedev/components/list/list-settings/list-visual-display/results/ этом разделе};</li>
     *   <li>more - Boolean - есть ли есть записи для подгрузки (используется для постраничной навигации).</li>
     * </ul>
     * @name Types/_collection/RecordSet#metaData
     * @see getMetaData
     * @see setMetaData
     * @example
     * Создадим рекордсет c метаданными произвольного формата:
     * <pre>
     *     import {RecordSet} from 'Types/collection';
     *     const rs = new RecordSet({
     *         metaData: {
     *             favorites: [{
     *                  id: 4,
     *                  name: 'Ultimate'
     *             }, {
     *                 id: 2,
     *                 name: 'Question'
     *             }]
     *         }
     *     });
     *
     *     const favorites = rs.getMetaData().favorites;
     *     console.log(favorites[0].name); // 'Ultimate'
     * </pre>
     */
    protected _$metaData: any;

    /**
     * @cfg Формат всех полей метаданных.
     * @name Types/_collection/RecordSet#metaFormat
     * @example
     * Создадим рекордсет с метаданным, поле created которых имеет тип Date
     * <pre>
     *     import {RecordSet} from 'Types/collection';
     *     const events = new RecordSet({
     *         metaData: {
     *             created: '2001-09-11'
     *         },
     *         metaFormat: [{
     *             name: 'created',
     *             type: Date
     *         }]
     *     });
     *
     *     console.log(events.getMetaData().created instanceof Date); // true
     * </pre>
     */
    protected _$metaFormat: FormatDescriptor;

    /**
     * Модель по умолчанию
     */
    protected _defaultModel: string;

    /**
     * Метаданные - локальная обработанная копия _$metaData
     */
    protected _metaData: any;

    constructor(options?: IOptions<T>) {
        if (options) {
            if ('items' in options) {
                logger.stack('Types/_collection/RecordSet: option "items" give no effect, use "rawData" instead', 1);
            }
        }

        super(options);

        if (options) {
            // Support deprecated  option 'idProperty'
            if (!this._$keyProperty && (options as any).idProperty) {
                this._$keyProperty = (options as any).idProperty;
            }
            // Support deprecated  option 'meta'
            if ('meta' in options) {
                this._$metaData = options.meta;
            }
        }

        // Model can have it's own format. Inherit that format if RecordSet's format is not defined.
        // FIXME: It only works with model's constructor injection not string alias
        if (!this._$format && this._$model && typeof this._$model === 'function' && this._$model.prototype._$format) {
            this._$format = this._$model.prototype._$format;
        }

        FormattableMixin.call(this, options);

        if (this._$rawData) {
            this._resetRawDataAdapter(this._getRawDataFromOption());
            this._initByRawData();
        }

        this._publish('onPropertyChange');
    }

    destroy(): void {
        this._$model = '';
        this._$metaData = null;
        this._metaData = null;

        super.destroy();
    }

    // region IEnumerable

    /**
     * Возвращает энумератор для перебора записей рекордсета.
     * Пример использования можно посмотреть в модуле {@link Types/_collection/IEnumerable}.
     * @param [state] Состояние записей, которые требуется перебрать (по умолчанию перебираются все записи)
     * @example
     * Получим сначала все, а затем - измененные записи:
     * <pre>
     *     import {RecordSet} from 'Types/collection';
     *
     *     const fruits = new RecordSet({
     *         rawData: [
     *             {name: 'Apple'},
     *             {name: 'Banana'},
     *             {name: 'Orange'},
     *             {name: 'Strawberry'}
     *         ]
     *     });
     *
     *     fruits.at(0).set('name', 'Pineapple');
     *     fruits.at(2).set('name', 'Grapefruit');
     *
     *     const enumerator1 = fruits.getEnumerator();
     *     while(enumerator1.moveNext()) {
     *         const fruit = enumerator1.getCurrent();
     *         console.log(fruit.get('name'));
     *     }
     *     // output: 'Pineapple', 'Banana', 'Grapefruit', 'Strawberry'
     *
     *     const enumerator2 = fruits.getEnumerator(Record.RecordState.CHANGED);
     *     while(enumerator2.moveNext()) {
     *         const fruit = enumerator2.getCurrent();
     *         console.log(fruit.get('name'));
     *     }
     *     // output: 'Pineapple', 'Grapefruit'
     * </pre>
     */
    getEnumerator(state?: RecordState): Arraywise<T> {
        const enumerator = new Arraywise<T>(this._$items);

        enumerator.setResolver((index) => this.at(index));

        if (state) {
            enumerator.setFilter((record) => record instanceof Record ? record.getState() === state : true);
        }

        return enumerator;
    }

    /**
     * Перебирает записи рекордсета.
     * @param callback Функция обратного вызова, аргументами будут переданы запись и ее позиция.
     * @param [state] Состояние записей, которые требуется перебрать (по умолчанию перебираются все записи)
     * @param [context] Контекст вызова callback
     * @example
     * Получим сначала все, а затем - измененные записи:
     * <pre>
     *     import {RecordSet} from 'Types/collection';
     *     import {Record} from 'Types/entity';
     *
     *     const fruits = new RecordSet({
     *         rawData: [
     *             {name: 'Apple'},
     *             {name: 'Banana'},
     *             {name: 'Orange'},
     *             {name: 'Strawberry'}
     *         ]
     *     });
     *
     *     fruits.at(0).set('name', 'Pineapple');
     *     fruits.at(2).set('name', 'Grapefruit');
     *
     *     fruits.each((fruit) => {
     *         console.log(fruit.get('name'));
     *     });
     *     // output: 'Pineapple', 'Banana', 'Grapefruit', 'Strawberry'
     *
     *     fruits.each((fruit) => {
     *         console.log(fruit.get('name'));
     *     }, Record.RecordState.CHANGED);
     *     // output: 'Pineapple', 'Grapefruit'
     * </pre>
     */
    each(callback: EnumeratorCallback<T, number>, context?: object): void;
    each(callback: EnumeratorCallback<T, number>, state?: RecordState, context?: object): void;
    each(callback: EnumeratorCallback<T, number>, state?: RecordState | object, context?: object): void {
        if (state instanceof Object) {
            context = state;
            state = undefined;
        }
        context = context || this;

        const length = this.getCount();
        let index = 0;
        for (let i = 0; i < length; i++) {
            const record = this.at(i);
            let isMatching = true;
            if (state) {
                isMatching = record instanceof Record ? record.getState() === state : true;
            }
            if (isMatching) {
                callback.call(
                    context,
                    record,
                    index++,
                    this
                );
            }
        }
    }

    // endregion

    // region List

    clear(): void {
        this._detachItems();
        this._clearRawData();
        super.clear();
    }

    /**
     * Добавляет запись в рекордсет путем создания новой записи, в качестве сырых данных для которой будут взяты сырые данные аргумента item.
     * Если формат созданной записи не совпадает с форматом рекордсета, то он будет приведен к нему принудительно:
     * лишние поля будут отброшены, недостающие - проинициализированы значениями по умолчанию.
     * При недопустимом at генерируется исключение.
     * @param item Запись, из которой будут извлечены сырые данные.
     * @param [at] Позиция, в которую добавляется запись (по умолчанию - в конец)
     * @return Добавленная запись.
     * @see Types/_collection/ObservableList#add
     * @example
     * Добавим запись в рекордсет:
     * <pre>
     *     import {RecordSet} from 'Types/collection';
     *     import {Record} from 'Types/entity';
     *
     *     const rs = new RecordSet();
     *     const source = new Record({
     *         rawData: {foo: 'bar'}
     *     });
     *     const result = rs.add(source);
     *
     *     console.log(result === source); // false
     *     console.log(result.get('foo') === source.get('foo')); // true
     *
     *     console.log(source.getOwner() === rs); // false
     *     console.log(result.getOwner() === rs); // true
     * </pre>
     */
    add(item: T, at?: number): T {
        item = this._normalizeItems([item], RECORD_STATE.ADDED)[0];
        (this._getRawDataAdapter() as adapter.ITable).add(item.getRawData(true), at);
        super.add(item, at);

        return item;
    }

    at(index: number): T {
        return this._getRecord(index);
    }

    remove(item: T): boolean {
        this._checkItem(item);
        return super.remove(item);
    }

    removeAt(index: number): T {
        const item = this._$items[index];

        if (item) {
            item.detach();
        }

        (this._getRawDataAdapter() as adapter.ITable).remove(index);
        const result = super.removeAt(index);

        return result;
    }

    /**
     * Заменяет запись в указанной позиции через создание новой записи, в качестве сырых данных для которой будут взяты сырые данные аргумента item.
     * Если формат созданной записи не совпадает с форматом рекордсета, то он будет приведен к нему принудительно: лишние поля будут отброшены, недостающие - проинициализированы значениями по умолчанию.
     * При недопустимом at генерируется исключение.
     * @param item Заменяющая запись, из которой будут извлечены сырые данные.
     * @param at Позиция, в которой будет произведена замена
     * @return Добавленная запись
     * @see Types/_collection/ObservableList#replace
     * @example
     * Заменим вторую запись:
     * <pre>
     *     import {RecordSet} from 'Types/collection';
     *     import {Record} from 'Types/entity';
     *
     *     const rs = new RecordSet({
     *         rawData: [{
     *             id: 1,
     *             title: 'Water'
     *         }, {
     *             id: 2,
     *             title: 'Ice'
     *         }]
     *     });
     *     const source = new Record({
     *         rawData: {
     *             id: 3,
     *             title: 'Snow'
     *         }
     *     });
     *
     *     rs.replace(source, 1);
     *     const result = rs.at(1);
     *
     *     console.log(result === source); // false
     *     console.log(result.get('title') === source.get('title')); // true
     *
     *     console.log(source.getOwner() === rs); // false
     *     console.log(result.getOwner() === rs); // true
     * </pre>
     */
    replace(item: T, at: number): T {
        item = this._normalizeItems([item], RECORD_STATE.CHANGED)[0];
        (this._getRawDataAdapter() as adapter.ITable).replace(item.getRawData(true), at);
        const oldItem = this._$items[at];
        super.replace(item, at);
        if (oldItem) {
            oldItem.detach();
        }

        return item;
    }

    move(from: number, to: number): void {
        this._getRecord(from); // force create record instance
        (this._getRawDataAdapter() as adapter.ITable).move(from, to);
        super.move(from, to);
    }

    /**
     * Заменяет записи рекордсета копиями записей другой коллекции.
     * Если формат созданных копий не совпадает с форматом рекордсета, то он будет приведен к нему принудительно: лишние поля будут отброшены, недостающие - проинициализированы значениями по умолчанию.
     * @param [items] Коллекция с записями для замены
     * @return Добавленные записи
     * @see Types/_collection/ObservableList#assign
     * @example
     * Установим записи из одного рекорсета в другой:
     * <pre>
     *     import {RecordSet} from 'Types/collection';
     *
     *     const rsA = new RecordSet({rawData: [{
     *         title: 'Foo'
     *     }]});
     *     const rsB = new RecordSet();
     *     rsB.assign(rsA);
     *
     *     console.log(rsB.at(0).get('title'); // 'Foo'
     * </pre>
     * Заменим записи рекорсета массивом записей:
     * <pre>
     *     import {RecordSet} from 'Types/collection';
     *     import {Record} from 'Types/entity';
     *
     *     const rs = new RecordSet();
     *     const foo = new Record({rawData: {
     *         title: 'Foo'
     *     }});
     *     rs.assign([foo]);
     *
     *     console.log(rs.at(0).get('title'); // 'Foo'
     * </pre>
     */
    assign(items: IEnumerable<T> | T[]): T[] {
        // Do nothing if assigning to itself
        if (items === this) {
            return [];
        }

        // We can trust foreign data only if it's a recordset and this instance doesn't have its own format
        const hasDeclaredFormat = this.hasDeclaredFormat();
        if (items instanceof RecordSet && !hasDeclaredFormat) {
            this._detachItems();

            this._$adapter = items.getAdapter();
            this._assignRawData(items.getRawData(), hasDeclaredFormat);

            const result = new Array(items.getCount());
            super.assign(result);

            return result;
        }

        // Otherwise we have to check and normalize foreign data
        items = this._itemsToArray(items);
        if (items.length && items[0] && items[0]['[Types/_entity/Record]']) {
            this._$adapter = items[0].getAdapter();
        }
        items = this._normalizeItems(items, RECORD_STATE.ADDED);

        this._detachItems();
        this._clearRawData();

        items = this._addItemsToRawData(items);
        super.assign(items);

        return items;
    }

    /**
     * Добавляет копии записей другой коллекции в конец рекордсета.
     * Если формат созданных копий не совпадает с форматом рекордсета, то он будет приведен к нему принудительно: лишние поля будут отброшены, недостающие - проинициализированы значениями по умолчанию.
     * @param [items] Коллекция с записями для добавления
     * @return Добавленные записи
     * @see Types/_collection/ObservableList#append
     * @example
     * Добавим записи из одного рекорсета в другой:
     * <pre>
     *     import {RecordSet} from 'Types/collection';
     *
     *     const rsA = new RecordSet({rawData: [{
     *         title: 'Foo'
     *     }]});
     *     const rsB = new RecordSet({rawData: [{
     *         title: 'Bar'
     *     }]});
     *     rsB.append(rsA);
     *
     *     console.log(rsB.getCount(); // 2
     *     console.log(rsB.at(0).get('title'); // 'Foo'
     *     console.log(rsB.at(1).get('title'); // 'Bar'
     * </pre>
     * Добавим записи рекорсета из массива записей:
     * <pre>
     *     import {RecordSet} from 'Types/collection';
     *     import {Record} from 'Types/entity';
     *
     *     const rs = new RecordSet({rawData: [{
     *         title: 'Foo'
     *     }]});
     *     const bar = new Record({rawData: {
     *         title: 'Bar'
     *     }});
     *     rs.append([bar]);
     *
     *     console.log(rs.getCount(); // 2
     *     console.log(rs.at(0).get('title'); // 'Foo'
     *     console.log(rs.at(1).get('title'); // 'Bar'
     * </pre>
     */
    append(items: IEnumerable<T> | T[]): T[] {
        let itemsArray = this._itemsToArray(items);
        itemsArray = this._normalizeItems(itemsArray, RECORD_STATE.ADDED, items instanceof RecordSet);
        itemsArray = this._addItemsToRawData(itemsArray);
        super.append(itemsArray);

        return itemsArray;
    }

    /**
     * Добавляет копии записей другой коллекции в начало рекордсета.
     * Если формат созданных копий не совпадает с форматом рекордсета, то он будет приведен к нему принудительно:
     * лишние поля будут отброшены, недостающие - проинициализированы значениями по умолчанию.
     * @param [items] Коллекция с записями для добавления
     * @return Добавленные записи
     * @see Types/_collection/ObservableList#prepend
     * @example
     * Добавим записи из одного рекорсета в другой:
     * <pre>
     *     import {RecordSet} from 'Types/collection';
     *
     *     const rsA = new RecordSet({rawData: [{
     *         title: 'Foo'
     *     }]});
     *     const rsB = new RecordSet({rawData: [{
     *         title: 'Bar'
     *     }]});
     *     rsB.prepend(rsA);
     *
     *     console.log(rsB.getCount(); // 2
     *     console.log(rsB.at(0).get('title'); // 'Bar'
     *     console.log(rsB.at(1).get('title'); // 'Foo'
     * </pre>
     * Добавим записи рекорсета из массива записей:
     * <pre>
     *     import {RecordSet} from 'Types/collection';
     *     import {Record} from 'Types/entity';
     *
     *     const rs = new RecordSet({rawData: [{
     *         title: 'Foo'
     *     }]});
     *     const bar = new Record({rawData: {
     *         title: 'Bar'
     *     }});
     *     rs.prepend([bar]);
     *
     *     console.log(rs.getCount(); // 2
     *     console.log(rs.at(0).get('title'); // 'Bar'
     *     console.log(rs.at(1).get('title'); // 'Foo'
     * </pre>
     */
    prepend(items: IEnumerable<T> | T[]): T[] {
        let itemsArray = this._itemsToArray(items);
        itemsArray = this._normalizeItems(itemsArray, RECORD_STATE.ADDED, items instanceof RecordSet);
        itemsArray = this._addItemsToRawData(itemsArray, 0);
        super.prepend(itemsArray);

        return itemsArray;
    }

    /**
     * Возвращает индексатор коллекции
     * @protected
     */
    protected _getIndexer(): Indexer<T[]> {
        if (this._indexer) {
            return this._indexer;
        }

        let indexer;

        // Custom model possible has different properties collection, this cause switch to the slow not lazy mode
        if (this._$model === this._defaultModel) {
            // Fast mode: indexing without record instances
            const adapter = this._getAdapter() as adapter.IAdapter;
            const tableAdapter = this._getRawDataAdapter() as adapter.ITable;

            indexer = new Indexer<T[]>(
                this._getRawData(),
                () => tableAdapter.getCount(),
                (items, at) => tableAdapter.at(at),
                (item, property) => adapter.forRecord(item).get(property)
            );
        } else {
            // Slow mode: indexing use record instances
            indexer = new Indexer<T[]>(
                this._$items,
                (items) => items.length,
                (items, at) => this.at(at),
                (item, property) => item.get(property)
            );
        }

        this._indexer = indexer;
        return indexer;
    }

    // endregion

    // region ObservableList

    protected _itemsSlice(begin?: number, end?: number): T[] {
        if (this._isNeedNotifyCollectionChange()) {
            if (begin === undefined) {
                begin = 0;
            }
            if (end === undefined) {
                end = this._$items.length;
            }

            // Force create records for event handler
            for (let i = begin; i < end; i++) {
                this._getRecord(i);
            }
        }

        return super._itemsSlice(begin, end);
    }

    protected _detachItems(items?: T[]): void {
        if (!items) {
            items = this._$items;
        }

        for (let i = 0, count = items.length; i < count; i++) {
            const item = items[i];
            if (item) {
                item.detach();
            }
        }
    }

    // endregion

    // region SerializableMixin

    _getSerializableState(state: IDefaultSerializableState): ISerializableState {
        let resultState = ObservableList.prototype._getSerializableState.call(this, state) as ISerializableState;
        resultState = FormattableMixin.prototype._getSerializableState.call(this, resultState);
        resultState._instanceId = this.getInstanceId();
        delete resultState.$options.items;
        return resultState;
    }

    _setSerializableState(state: ISerializableState): Function {
        const fromSuper = super._setSerializableState(state);
        const fromFormattableMixin = FormattableMixin.prototype._setSerializableState(
            state as IFormattableSerializableState
        );
        return function(): void {
            fromSuper.call(this);
            fromFormattableMixin.call(this);
            this._instanceId = state._instanceId;
        };
    }

    // endregion

    // region FormattableMixin

    setRawData(data: any): void {
        const oldItems = this._$items.slice();
        const eventsWasRaised = this._eventRaising;

        this._eventRaising = false;
        this.clear();
        this._eventRaising = eventsWasRaised;

        this._assignRawData(data);
        this._initByRawData();
        this._notifyCollectionChange(
            IObservable.ACTION_RESET,
            this._$items,
            0,
            oldItems,
            0
        );
    }

    addField(format: format.Field | format.IFieldDeclaration, at?: number, value?: any): void {
        format = this._buildField(format);
        FormattableMixin.prototype.addField.call(this, format, at);

        this._parentChanged(Record.prototype.addField);

        if (value !== undefined) {
            const name = format.getName();
            this.each((record: Record<unknown>) => {
                if (record instanceof Record) {
                    record.set(name, value);
                }
            });
        }
        this._nextVersion();
    }

    removeField(name: string): void {
        FormattableMixin.prototype.removeField.call(this, name);
        this._nextVersion();
        this._parentChanged(Record.prototype.removeField);
    }

    removeFieldAt(at: number): void {
        FormattableMixin.prototype.removeFieldAt.call(this, at);
        this._nextVersion();
        this._parentChanged(Record.prototype.removeFieldAt);
    }

    protected _getRawDataAdapter: () => adapter.ITable | adapter.IDecorator | adapter.IMetaData;

    protected _createRawDataAdapter(): adapter.ITable {
        return (this._getAdapter() as adapter.IAdapter).forTable(
            this._getRawDataFromOption()
        );
    }

    /**
     * Переустанавливает сырые данные
     * @param data Данные в "сыром" виде
     * @param [keepFormat=false] Сохранить формат
     * @protected
     */
    protected _assignRawData(data: any, keepFormat?: boolean): void {
        FormattableMixin.prototype.setRawData.call(this, data);
        this._clearIndexer();
        if (!keepFormat) {
            this._clearFormat();
        }
        this._nextVersion();
    }

    protected _clearRawData(): void {
        if (!this.hasDeclaredFormat()) {
            this._clearFormat();
        }
        (this._getRawDataAdapter() as adapter.ITable).clear();
        this._resetRawDataFields();
    }

    // endregion

    // region IObservableObject

    readonly '[Types/_entity/IObservableObject]': EntityMarker;

    // endregion

    // region IProducible

    readonly '[Types/_entity/IProducible]': EntityMarker;

    static produceInstance<T extends Record = Model>(data: any, options?: IOptions<T>): RecordSet<T> {
        const instanceOptions: any = {
            rawData: data
        };
        if (options) {
            if (options.adapter) {
                instanceOptions.adapter = options.adapter;
            }
            if (options.model) {
                instanceOptions.model = options.model;
            }
            if (options.keyProperty) {
                instanceOptions.keyProperty = options.keyProperty;
            } else if ((options as any).idProperty) {
                // Support deprecated  option 'idProperty'
                instanceOptions.keyProperty = (options as any).idProperty;
            }
        }
        return new this(instanceOptions);
    }

    // endregion

    // region IReceiver

    relationChanged(which: any, route: string[]): any {
        const index = this.getIndex(which.target);
        if (index > -1) {
            // Apply record's raw data to the self raw data if necessary
            const adapter = this._getRawDataAdapter() as adapter.ITable;
            const selfData = adapter.at(index);
            const recordData = which.target.getRawData(true);
            if (selfData !== recordData) {
                adapter.replace(
                    recordData,
                    index
                );
            }
        }

        return super.relationChanged(which, route);
    }

    // endregion

    // region ICloneable

    clone<U = this>(shallow?: boolean): U {
        const clone = super.clone<RecordSet<TData, T>>(shallow);
        if (shallow) {
            clone._$items = this._$items.slice();
        }
        return clone as any;
    }

    // endregion

    // region IEquatable

    isEqual(to: any): boolean {
        if (to === this) {
            return true;
        }
        if (!to) {
            return false;
        }
        if (!(to instanceof RecordSet)) {
            return false;
        }

        // TODO: compare using formats
        return isEqual(
            this._getRawData(),
            to.getRawData(true)
        );
    }

    // endregion

    // region Public methods

    /**
     * Возвращает конструктор записей, порождаемых рекордсетом.
     * @see model
     * @see Types/_entity/Model
     * @see Types/di
     * @example
     * Получим конструктор записепй, внедренный в рекордсет в виде названия зарегистрированной зависимости:
     * <pre>
     *     class User extends Model {
     *     }
     *     Di.register('model.user', User);
     *
     *     // ...
     *     const users = new RecordSet({
     *         model: 'model.user'
     *     });
     *     users.getModel() === 'model.user'; // true
     * </pre>
     * Получим конструктор записепй, внедренный в рекордсет в виде класса:
     * <pre>
     *     class User extends Model {
     *     }
     *
     *     // ...
     *     const users = new RecordSet({
     *         model: User
     *     });
     *     users.getModel() === User;//true
     * </pre>
     */
    getModel(): Function | string {
        return this._$model;
    }

    /**
     * Подтверждает изменения всех записей с момента предыдущего вызова acceptChanges().
     * Обрабатывает состояние записей следующим образом:
     * <ul>
     *     <li>Changed и Added - меняют state на Unchanged;</li>
     *     <li>Deleted - удаляются из рекордсета, а их state становится Detached;</li>
     *     <li>остальные не меняются.</li>
     * </ul>
     * @param [spread=false] Распространять изменения по иерархии родителей (будут вызваны acceptChanges всех владельцев).
     * @example
     * Подтвердим изменение записи:
     * <pre>
     *     import {RecordSet} from 'Types/collection';
     *     import {Record} from 'Types/entity';
     *
     *     const fruits = new RecordSet({
     *         rawData: [
     *             {name: 'Apple'},
     *             {name: 'Banana'}
     *         ]
     *     });
     *
     *     const apple = fruits.at(0);
     *     apple.set('name', 'Pineapple');
     *     apple.getState() === Record.RecordState.CHANGED;//true
     *
     *     fruits.acceptChanges();
     *     apple.getState() === Record.RecordState.UNCHANGED;//true
     * </pre>
     * Подтвердим добавленние записи:
     * <pre>
     *     import {RecordSet} from 'Types/collection';
     *     import {Record} from 'Types/entity';
     *
     *     const fruits = new RecordSet({
     *         rawData: [
     *             {name: 'Apple'}
     *         ]
     *     });
     *     const banana = new Record({
     *         rawData: {name: 'Banana'}
     *     });
     *
     *     fruits.add(banana);
     *     banana.getState() === Record.RecordState.ADDED; // true
     *
     *     fruits.acceptChanges();
     *     banana.getState() === Record.RecordState.UNCHANGED; // true
     * </pre>
     * Подтвердим удаленние записи:
     * <pre>
     *     import {RecordSet} from 'Types/collection';
     *     import {Record} from 'Types/entity';
     *
     *     const fruits = new RecordSet({
     *         rawData: [
     *             {name: 'Apple'},
     *             {name: 'Banana'}
     *         ]
     *     });
     *
     *     const apple = fruits.at(0);
     *     apple.setState(Record.RecordState.DELETED);
     *     fruits.getCount(); // 2
     *     fruits.at(0).get('name'); // 'Apple'
     *
     *     fruits.acceptChanges();
     *     apple.getState() === Record.RecordState.DETACHED; // true
     *     fruits.getCount(); // 1
     *     fruits.at(0).get('name'); // 'Banana'
     * </pre>
     */
    acceptChanges(spread?: boolean): void {
        const toRemove = [];
        this.each((record, index) => {
            if (record instanceof Record) {
                if (record.getState() === RECORD_STATE.DELETED) {
                    toRemove.push(index);
                }
                record.acceptChanges();
            }
        });

        for (let index = toRemove.length - 1; index >= 0; index--) {
            this.removeAt(toRemove[index]);
        }

        if (spread) {
            this._childChanged(Record.prototype.acceptChanges);
        }
    }

    isChanged(): boolean {
        let changed = false;
        const items = this._$items;
        const count = items.length;

        for (let i = 0; i < count; i++) {
            if (items[i].isChanged()) {
                changed = true;
                break;
            }
        }

        return changed;
    }

    /**
     * Возвращает название свойства записи, содержащего первичный ключ
     * @see setKeyProperty
     * @see keyProperty
     * @example
     * Получим название свойства, содержащего первичный ключ:
     * <pre>
     *     const users = new RecordSet({
     *         keyProperty: 'id'
     *     });
     *     users.getKeyProperty();//'id'
     * </pre>
     */
    getKeyProperty(): string {
        if (!this._$keyProperty) {
            this._$keyProperty = (this._getAdapter() as adapter.IAdapter).getKeyField(
                this._getRawData()
            );
        }
        return this._$keyProperty;
    }

    /**
     * Устанавливает название свойства записи, содержащего первичный ключ
     * @param name
     * @see getKeyProperty
     * @see keyProperty
     * @example
     * Установим название свойства, содержащего первичный ключ:
     * <pre>
     *     const users = new RecordSet({
     *         rawData: [{
     *             id: 134,
     *             login: 'editor',
     *         }, {
     *             id: 257,
     *             login: 'shell',
     *         }]
     *     });
     *     users.setKeyProperty('id');
     *     users.getRecordById(257).get('login');//'shell'
     * </pre>
     */
    setKeyProperty(name: string): void {
        if (this._$keyProperty === name) {
            return;
        }

        this._$keyProperty = name;
        this.each((record: any) => {
            if (record.setKeyProperty) {
                record.setKeyProperty(name);
            }
        });
        this._notify('onPropertyChange', {keyProperty: this._$keyProperty});
    }

    /**
     * Возвращает запись по ключу.
     * Если записи с таким ключом нет - возвращает undefined.
     * @param id Значение первичного ключа.
     * @example
     * Создадим рекордсет, получим запись по первичному ключу:
     * <pre>
     *     const users = new RecordSet({
     *         keyProperty: 'id'
     *         rawData: [{
     *             id: 134,
     *             login: 'editor',
     *         }, {
     *             id: 257,
     *             login: 'shell',
     *         }]
     *     });
     *     users.getRecordById(257).get('login');//'shell'
     * </pre>
     */
    getRecordById(id: string | number): T {
        return this.at(
            this.getIndexByValue(this.getKeyProperty(), id)
        );
    }

    /**
     * Возвращает метаданные RecordSet'а.
     * Подробнее о метаданных смотрите в описании опции {@link metaData}.
     * @see metaData
     * @see setMetaData
     */
    getMetaData(): any {
        if (this._metaData) {
            return this._metaData;
        }

        const cast = (value: unknown, fieldFormat: format.Field | format.UniversalField): unknown => {
            return factory.cast(
                value,
                this._getFieldType(fieldFormat),
                {
                    format: fieldFormat,
                    adapter: this._getAdapter(),
                    keyProperty: this.getKeyProperty()
                }
            );
        };

        // Build metadata format if it comes from option
        const metaFormat = this._$metaFormat ? this._buildFormat(this._$metaFormat) : null;
        let metaData = {};

        if (this._$metaData) {
            // Build metadata from option
            if (this._$metaData instanceof Object && Object.getPrototypeOf(this._$metaData) === Object.prototype) {
                Object.keys(this._$metaData).forEach((fieldName) => {
                    let fieldValue = this._$metaData[fieldName];
                    if (metaFormat) {
                        let fieldFormat;
                        const fieldIndex = metaFormat.getFieldIndex(fieldName);
                        if (fieldIndex > -1) {
                            fieldFormat = metaFormat.at(fieldIndex);
                            fieldValue = cast(fieldValue, fieldFormat);
                        }
                    }
                    metaData[fieldName] = fieldValue;
                });
            } else {
                metaData = this._$metaData;
            }
        } else {
            // Build metadata via adapter if supported
            let adapter = this._getRawDataAdapter();

            // Unwrap if needed
            if (adapter['[Types/_entity/adapter/IDecorator]']) {
                adapter = (adapter as adapter.IDecorator).getOriginal() as adapter.ITable;
            }

            if (adapter['[Types/_entity/adapter/IMetaData]']) {
                (adapter as adapter.IMetaData).getMetaDataDescriptor().forEach((format) => {
                    const fieldName = format.getName();
                    let fieldFormat;
                    if (metaFormat) {
                        const fieldIndex = metaFormat.getFieldIndex(fieldName);
                        if (fieldIndex > -1) {
                            fieldFormat = metaFormat.at(fieldIndex);
                        }
                    }

                    metaData[fieldName] = cast(
                        (adapter as adapter.IMetaData).getMetaData(fieldName),
                        fieldFormat || format
                    );
                });
            }
        }

        this._metaData = metaData;
        return this._metaData;
    }

    /**
     * Устанавливает метаданные RecordSet'а.
     * Подробнее о метаданных смотрите в описании опции {@link metaData}.
     * <ul>
     *   <li>path - путь для хлебных крошек, возвращается как {@link Types/_collection/RecordSet};</li>
     *   <li>results - строка итогов, возвращается как {@link Types/_entity/Record}. Подробнее о конфигурации списков для отображения строки итогов читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/interfacedev/components/list/list-settings/list-visual-display/results/ этом разделе};</li>
     *   <li>more - Boolean - есть ли есть записи для подгрузки (используется для постраничной навигации).</li>
     * </ul>
     * @param meta Метаданные.
     * @see metaData
     * @see getMetaData
     */
    setMetaData(meta: any): void {
        this._metaData = this._$metaData = meta;

        if (meta instanceof Object) {
            const adapter = this._getRawDataAdapter() as adapter.IMetaData;
            if (adapter['[Types/_entity/adapter/IMetaData]']) {
                adapter.getMetaDataDescriptor().forEach((format) => {
                    const name = format.getName();
                    const value = factory.serialize(
                        meta[name],
                        {
                            format,
                            adapter: this.getAdapter()
                        }
                    );
                    adapter.setMetaData(name, value);
                });
            }
        }

        this._notify('onPropertyChange', {metaData: meta});
    }

    /**
     * Объединяет два рекордсета.
     * @param recordSet Рекордсет, с которым объединить
     * @param {MergeOptions} options Опции операций
     * @see assign
     * @see append
     * @see prepend
     * @see add
     * @see replace
     * @see remove
     */
    merge(recordSet: RecordSet, options?: any): void {
        // Backward compatibility for 'merge'
        if (options instanceof Object && options.hasOwnProperty('merge') && !options.hasOwnProperty('replace')) {
            options.replace = options.merge;
        }

        options = {
            add: true,
            remove: true,
            replace: true,
            inject: false,
            ...(options || {})
        };

        const count = recordSet.getCount();
        const keyProperty = this.getKeyProperty();
        const existsIdMap = {};
        const newIdMap = {};
        const toAdd = [];
        const toReplace = [];
        const toInject = [];
        let record;
        let id;
        let index;

        this.each((record: Record<unknown>, index) => {
            if (record instanceof Record) {
                existsIdMap[record.get(keyProperty)] = index;
            }
        });

        for (let i = 0; i < count; i++) {
            record = recordSet.at(i);
            id = record.get(keyProperty);

            if (i === 0) {
                this._checkItem(record);
            }

            if (existsIdMap.hasOwnProperty(id)) {
                if (options.inject) {
                    index = existsIdMap[id];
                    if (!record.isEqual(this.at(index))) {
                        toInject.push([record, index]);
                    }
                } else if (options.replace) {
                    index = existsIdMap[id];
                    if (!record.isEqual(this.at(index))) {
                        toReplace.push([record, index]);
                    }
                }
            } else {
                if (options.add) {
                    toAdd.push(record);
                }
            }

            if (options.remove) {
                newIdMap[id] = true;
            }
        }

        if (toReplace.length) {
            for (let i = 0; i < toReplace.length; i++) {
                this.replace(toReplace[i][0], toReplace[i][1]);
            }
        }

        if (toInject.length) {
            this._normalizeItems(
                toInject.map((data) => data[0])
            ).forEach((item, i) => {
                toInject[i][0] = item;
            });
            for (let i = 0; i < toInject.length; i++) {
                record = this.at(toInject[i][1]);
                record.setRawData(toInject[i][0].getRawData());
            }
        }

        if (toAdd.length) {
            this.append(toAdd);
        }

        if (options.remove) {
            const toRemove = [];
            this.each((record: Record<unknown>, index) => {
                if (record instanceof Record && !newIdMap.hasOwnProperty(record.get(keyProperty))) {
                    toRemove.push(index);
                }
            });

            for (let i = toRemove.length - 1; i >= 0; i--) {
                this.removeAt(toRemove[i]);
            }
        }
    }

    // endregion

    // region Protected methods

    /**
     * Вставляет сырые данные записей в сырые данные рекордсета
     * @param items Коллекция записей
     * @param [at] Позиция вставки
     * @protected
     */
    protected _addItemsToRawData(items: T[], at?: number): T[] {
        const adapter = this._getRawDataAdapter() as adapter.ITable;
        items = this._itemsToArray(items);

        let item;
        for (let i = 0, len = items.length; i < len; i++) {
            item = items[i];
            adapter.add(
                item.getRawData(true),
                at === undefined ? undefined : at + i
            );
        }

        return items;
    }

    /**
     * Normalizes given records by producing their copies with recordset's format
     * @param items Records to normalize
     * @param [state] State of produced records
     * @param [itsRecordSet] Items are produced from recordset
     * @protected
     */
    protected _normalizeItems(items: T[], state?: RecordState, itsRecordSet?: boolean): T[] {
        let formatDefined = this.hasDeclaredFormat();
        const result = [];
        let isEqualFormat;
        let resultItem;
        let item;
        let format;
        for (let i = 0; i < items.length; i++) {
            item = items[i];

            if (!itsRecordSet || i === 0) {
                this._checkItem(item);
            }

            if (!formatDefined && this.getCount() === 0) {
                format = item.getFormat(true);
                this._clearFormat();
                this._resetRawDataFields();

                if (item.hasDeclaredFormat()) {
                    this._format = this._$format = format.clone();
                    formatDefined = true;
                }
            } else if (!format) {
                format = this._getFormat(true);
            }

            if (itsRecordSet && isEqualFormat === undefined) {
                isEqualFormat = format.isEqual(item.getFormat(true));
            }

            resultItem = this._normalizeItem(item, format, isEqualFormat);

            if (state) {
                resultItem.setState(state);
            }

            result.push(resultItem);
        }

        return result;
    }

    /**
     * Returns record copy with target format
     * @param item Data carrier
     * @param format Target format
     * @param isEqualFormat Data carrier has equal format
     * @protected
     */
    protected _normalizeItem(item: Record, format: Format, isEqualFormat: boolean): T {
        let normalizedRawData;

        if (isEqualFormat || format.isEqual(item.getFormat(true))) {
            normalizedRawData = item.getRawData();
        } else {
            const normalizedAdapter = this.getAdapter().forRecord(null, this._getRawData());
            const itemAdapter = item.getAdapter().forRecord(item.getRawData(true));
            format.each((field, index) => {
                normalizedAdapter.addField(field, index as number);
                const name = field.getName();
                normalizedAdapter.set(name, itemAdapter.get(name));
            });

            normalizedRawData = normalizedAdapter.getData();
        }

        return this._buildRecord(
            normalizedRawData,
            item instanceof Model ? item.getInstanceState() : null
        );
    }

    /**
     * Проверяет, что переданный элемент - это запись с идентичным форматом
     * @param item Запись
     * @protected
     */
    protected _checkItem(item: T): void {
        if (!item || !item['[Types/_entity/Record]']) {
            throw new TypeError('Item should be an instance of Types/entity:Record');
        }
        checkNullId(item, this.getKeyProperty());
        this._checkAdapterCompatibility(item.getAdapter());
    }

    /**
     * Создает новый экземпляр модели
     * @param rawData Сырые данные записи
     * @param instanceState Состояние записи
     * @protected
     */
    protected _buildRecord(rawData: any, instanceState?: IHashMap<any>): T {
        const record = create<T>(this._$model, {
            owner: this,
            writable: this.writable,
            state: RECORD_STATE.UNCHANGED,
            adapter: this.getAdapter(),
            rawData,
            instanceState,
            keyProperty: this.getKeyProperty()
        });

        return record;
    }

    /**
     * Возвращает запись по индексу
     * @param at Индекс
     * @protected
     */
    protected _getRecord(at: number): T {
        if (at < 0 || at >= this._$items.length) {
            return undefined;
        }

        let record = this._$items[at];
        if (!record) {
            const adapter = this._getRawDataAdapter() as adapter.ITable;
            record = this._$items[at] = this._buildRecord(() => {
                return adapter.at(record ? this.getIndex(record) : at);
            });
            this._addChild(record);
            checkNullId(record, this.getKeyProperty());
        }

        return record;
    }

    /**
     * Пересоздает элементы из сырых данных
     * @protected
     */
    protected _initByRawData(): void {
        const adapter = this._getRawDataAdapter() as adapter.ITable;
        this._$items.length = 0;
        this._$items.length = adapter.getCount();
    }

    // endregion

    // region SerializableMixin

    toJSON(): ISerializableSignature<IOptions<T>>;
    toJSON(key?: unknown): string;
    toJSON(key?: unknown): ISerializableSignature<IOptions<T>> | string {
        return super.toJSON();
    }

    static fromJSON<T = RecordSet, K = IOptions<unknown>>(data: ISerializableSignature<K>): T {
        return ObservableList.fromJSON.call(this, data);
    }

    // endregion

    // region Statics

    /**
     * Создает из рекордсета патч - запись с измененными, добавленными записями и ключами удаленных записей.
     * @param items Исходный рекордсет
     * @param [names] Имена полей результирующей записи, по умолчанию ['changed', 'added', 'removed']
     */
    static patch(items: RecordSet, names?: string[]): Record {
        names = names || ['changed', 'added', 'removed'];

        const filter = (state) => {
            const result = new RecordSet({
                adapter: items.getAdapter(),
                keyProperty: items.getKeyProperty()
            });

            items.each((item) => {
                result.add(item);
            }, state);

            return result;
        };

        const getIds = (items) => {
            const result = [];
            const keyProperty = items.getKeyProperty();

            items.each((item) => {
                result.push(item.get(keyProperty));
            });

            return result;
        };

        const result = new Record({
            format: [
                {name: names[0], type: 'recordset'},
                {name: names[1], type: 'recordset'},
                {name: names[2], type: 'array', kind: 'string'}
            ],
            adapter: items.getAdapter()
        });

        result.set(names[0], filter(RECORD_STATE.CHANGED));
        result.set(names[1], filter(RECORD_STATE.ADDED));
        result.set(names[2], getIds(filter(RECORD_STATE.DELETED)));
        result.acceptChanges();

        return result;
    }

    // endregion
}

applyMixins(RecordSet, FormattableMixin, InstantiableMixin);

// tslint:disable-next-line:interface-name
interface RecordSet<
    TData = any,
    T extends Record<TData> = Model<TData>
> extends ObservableList<T>, FormattableMixin, InstantiableMixin {}

Object.assign(RecordSet.prototype, {
    '[Types/_collection/RecordSet]': true,
    '[Types/_entity/IObservableObject]': true,
    '[Types/_entity/IProducible]': true,
    _moduleName: 'Types/collection:RecordSet',
    _instancePrefix: 'recordset-',
    _defaultModel: DEFAULT_MODEL,
    _$model: DEFAULT_MODEL,
    _$keyProperty: '',
    _$metaData: null,
    _$metaFormat: null,
    _metaData: null,
    getIdProperty: RecordSet.prototype.getKeyProperty,
    setIdProperty: RecordSet.prototype.setKeyProperty
});

// Aliases
RecordSet.prototype.forEach = RecordSet.prototype.each;

export default RecordSet;

register('Types/collection:RecordSet', RecordSet, {instantiate: false});
