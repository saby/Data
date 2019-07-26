import {DestroyableMixin, OptionsToPropertyMixin, SerializableMixin, Model, adapter} from '../entity';
import {create, register} from '../di';
import {mixin} from '../util';
import {RecordSet} from '../collection';

type TypeDeclaration = Function | string;

export interface IOptions {
    adapter?: adapter.IAdapter | string;
    itemsProperty?: string;
    keyProperty?: string;
    listModule?: TypeDeclaration;
    metaProperty?: string;
    model?: TypeDeclaration;
    rawData?: any;
    writable?: boolean;
}

/**
 * Набор данных, полученный из источника.
 * @remark
 * Представляет собой набор {@link Types/_collection/RecordSet выборок}, {@link Types/_entity/Model записей}, а также
 * скалярных значений, которые можно получить по имени свойства (или пути из имен).Использование таких комплексных
 * наборов позволяет за один вызов {@link Types/_source/ICrud#query списочного} либо
 * {@link Types/_source/IRpc#call произвольного} метода источника данных получать сразу все требующиеся для отображения
 * какого-либо сложного интерфейса данные. {@link rawData Исходные данные} могут быть предоставлены источником в разных
 * форматах (JSON, XML). По умолчанию используется формат JSON. Для чтения каждого формата должен быть указан
 * соответствующий адаптер. По умолчанию используется адаптер {@link Types/_entity/adapter/Json}.
 * В общем случае не требуется создавать экземпляры DataSet самостоятельно - это за вас будет делать источник. Но для
 * наглядности ниже приведены несколько примеров чтения частей из набора данных.
 *
 * Создадим комплексный набор в формате JSON из двух выборок "Заказы" и "Покупатели", одной записи "Итого" и даты
 * выполнения запроса:
 * <pre>
 *     require(['Types/source'], function (source) {
 *         var data = new source.DataSet({
 *             rawData: {
 *                 orders: [
 *                     {id: 1, buyer_id: 1, date: '2016-06-02 14:12:45', amount: 96},
 *                     {id: 2, buyer_id: 2, date: '2016-06-02 17:01:12', amount: 174},
 *                     {id: 3, buyer_id: 1, date: '2016-06-03 10:24:28', amount: 475}
 *                 ],
 *                 buyers: [
 *                     {id: 1, email: 'tony@stark-industries.com', phone: '555-111-222'},
 *                     {id: 2, email: 'steve-rogers@avengers.us', phone: '555-222-333'}
 *                 ],
 *                 total: {
 *                     date_from: '2016-06-01 00:00:00',
 *                     date_to: '2016-07-01 00:00:00',
 *                     amount: 745,
 *                     deals: 3,
 *                     completed: 2,
 *                     paid: 2,
 *                     awaited: 1,
 *                     rejected: 0
 *                 },
 *                 executeDate: '2016-06-27 11:34:57'
 *             },
 *             itemsProperty: 'orders',
 *             keyProperty: 'id'
 *         });
 *
 *         var orders = data.getAll();//Here use itemsProperty option value
 *         console.log(orders.getCount());//3
 *         console.log(orders.at(0).get('amount'));//96
 *
 *         var buyers = data.getAll('buyers');//Here use argument 'property'
 *         console.log(buyers.getCount());//2
 *         console.log(buyers.at(0).get('email'));//'tony@stark-industries.com'
 *
 *         var total = data.getRow('total');
 *         console.log(total.get('amount'));//745
 *
 *         console.log(data.getScalar('executeDate'));//'2016-06-27 11:34:57'
 *     });
 * </pre>
 * Создадим комплексный набор в формате XML из двух выборок "Заказы" и "Покупатели", записи "Итого" и даты выполнения
 * запроса:
 * <pre>
 *     require(['Types/source', 'Types/entity'], function (source, entity) {
 *         var data = new source.DataSet({
 *             adapter: new entity.adapter.Xml(),
 *             rawData: '<?xml version="1.0"?>' +
 *                 '<response>' +
 *                 '    <orders>' +
 *                 '        <order>' +
 *                 '            <id>1</id><buyer_id>1</buyer_id><date>2016-06-02 14:12:45</date><amount>96</amount>' +
 *                 '        </order>' +
 *                 '        <order>' +
 *                 '            <id>2</id><buyer_id>2</buyer_id><date>2016-06-02 17:01:12</date><amount>174</amount>' +
 *                 '        </order>' +
 *                 '        <order>' +
 *                 '            <id>3</id><buyer_id>1</buyer_id><date>2016-06-03 10:24:28</date><amount>475</amount>' +
 *                 '        </order>' +
 *                 '    </orders>' +
 *                 '    <buyers>' +
 *                 '        <buyer>' +
 *                 '            <id>1</id><email>tony@stark-industries.com</email><phone>555-111-222</phone>' +
 *                 '        </buyer>' +
 *                 '        <buyer>' +
 *                 '            <id>2</id><email>steve-rogers@avengers.us</email><phone>555-222-333</phone>' +
 *                 '        </buyer>' +
 *                 '    </buyers>' +
 *                 '    <total>' +
 *                 '        <date_from>2016-06-01 00:00:00</date_from>' +
 *                 '        <date_to>2016-07-01 00:00:00</date_to>' +
 *                 '        <amount>475</amount>' +
 *                 '        <deals>3</deals>' +
 *                 '        <completed>2</completed>' +
 *                 '        <paid>2</paid>' +
 *                 '        <awaited>1</awaited>' +
 *                 '        <rejected>0</rejected>' +
 *                 '    </total>' +
 *                 '    <executeDate>2016-06-27 11:34:57</executeDate>' +
 *                 '</response>',
 *             itemsProperty: 'orders/order',//XPath syntax
 *             keyProperty: 'id'
 *         });
 *
 *         var orders = data.getAll();
 *         console.log(orders.getCount());//3
 *         console.log(orders.at(0).get('amount'));//96
 *
 *         var buyers = data.getAll('buyers/buyer');//XPath syntax
 *         console.log(buyers.getCount());//2
 *         console.log(buyers.at(0).get('email'));//'tony@stark-industries.com'
 *
 *         var total = data.getRow('total');
 *         console.log(total.get('amount'));//745
 *
 *         console.log(data.getScalar('executeDate'));//'2016-06-27 11:34:57'
 *     });
 * </pre>
 * @class Types/_source/DataSet
 * @mixes Types/_entity/DestroyableMixin
 * @mixes Types/_entity/OptionsMixin
 * @mixes Types/_entity/SerializableMixin
 * @ignoreOptions totalProperty writable
 * @ignoreMethods getTotal getTotalProperty setTotalProperty
 * @public
 * @author Мальцев А.А.
 */
export default class DataSet extends mixin<
    DestroyableMixin,
    OptionsToPropertyMixin,
    SerializableMixin
>(
    DestroyableMixin,
    OptionsToPropertyMixin,
    SerializableMixin
) {
    /**
     * @cfg {String|Types/_entity/adapter/IAdapter} Адаптер для работы данными, по умолчанию
     * {@link Types/_entity/adapter/Json}
     * @name Types/_source/DataSet#adapter
     * @see getAdapter
     * @see Types/_entity/adapter/IAdapter
     * @see Types/di
     */
    protected _$adapter: adapter.IAdapter | string;

    /**
     * @cfg {*} Данные в "сыром" виде
     * @name Types/_source/DataSet#rawData
     * @remark
     * Данные должны быть в формате, поддерживаемом адаптером {@link adapter}.
     * @see getRawData
     * @see setRawData
     * @example
     * Создадим набор данных с персонажами фильма:
     * <pre>
     *     require(['Types/source'], function (source) {
     *         var data = new source.DataSet({
     *                 rawData: [{
     *                     id: 1,
     *                     firstName: 'John',
     *                     lastName: 'Connor',
     *                     role: 'Savior'
     *                 }, {
     *                     id: 2,
     *                     firstName: 'Sarah',
     *                     lastName: 'Connor',
     *                     role: 'Savior\'s Mother'
     *                 }, {
     *                     id: 3,
     *                     firstName: '-',
     *                     lastName: 'T-800',
     *                     role: 'Terminator'
     *                 }]
     *             }),
     *             characters = data.getAll();
     *
     *         console.log(characters.at(0).get('firstName'));//John
     *         console.log(characters.at(0).get('lastName'));//Connor
     *     });
     * </pre>
     */
    protected _$rawData: any;

    /**
     * @cfg {String|Function} Конструктор записей, порождаемых набором данных. По умолчанию {@link Types/_entity/Model}.
     * @name Types/_source/DataSet#model
     * @see getModel
     * @see Types/_entity/Model
     * @see Types/di
     * @example
     * Установим модель "Пользователь":
     * <pre>
     *     require(['Types/source', 'Application/Models/User'], function (source, UserModel) {
     *         var data = new source.DataSet({
     *             model: UserModel
     *         });
     *     });
     * </pre>
     */
    protected _$model: TypeDeclaration;

    /**
     * @cfg {String|Function} Конструктор рекордсетов, порождаемых набором данных. По умолчанию
     * {@link Types/_collection/RecordSet}.
     * @name Types/_source/DataSet#listModule
     * @see getListModule
     * @see Types/_collection/RecordSet
     * @see Types/di
     * @example
     * Установим рекодсет "Пользователи":
     * <pre>
     *     require(['Types/source', 'Application/Collections/Users'], function (source, UsersCollection) {
     *         var data = new source.DataSet({
     *             listModule: UsersCollection
     *         });
     *     });
     * </pre>
     */
    protected _$listModule: TypeDeclaration;

    /**
     * @cfg {String} Название свойства записи, содержащего первичный ключ.
     * @name Types/_source/DataSet#keyProperty
     * @see getKeyProperty
     * @see Types/_entity/Model#idProperty
     * @example
     * Установим свойство 'primaryId' в качестве первичного ключа:
     * <pre>
     *     require(['Types/source'], function (source) {
     *         var data = new source.DataSet({
     *             keyProperty: 'primaryId'
     *         });
     *     });
     * </pre>
     */
    protected _$keyProperty: string;

    /**
     * @cfg {String} Название свойства сырых данных, в котором находится основная выборка
     * @name Types/_source/DataSet#itemsProperty
     * @see getItemsProperty
     * @see setItemsProperty
     * @example
     * Установим свойство 'orders' как содержащее основную выборку:
     * <pre>
     *     require(['Types/source'], function (source) {
     *         var data = new source.DataSet({
     *             rawData: {
     *                 orders: [
     *                     {id: 1, date: '2016-06-02 14:12:45', amount: 96},
     *                     {id: 2, date: '2016-06-02 17:01:12', amount: 174},
     *                     {id: 3, date: '2016-06-03 10:24:28', amount: 475}
     *                 ],
     *                 total: {
     *                     date_from: '2016-06-01 00:00:00',
     *                     date_to: '2016-07-01 00:00:00',
     *                     amount: 745
     *                 }
     *             },
     *             itemsProperty: 'orders'
     *         });
     *
     *         var orders = data.getAll();
     *         console.log(orders.getCount());//3
     *         console.log(orders.at(0).get('id'));//1
     *     });
     * </pre>
     */
    protected _$itemsProperty: string;

    /**
     * @cfg {String} Свойство данных, в которых находятся мета-данные выборки
     * @name Types/_source/DataSet#metaProperty
     * @see getMetaProperty
     */
    protected _$metaProperty: string;

    /**
     * @cfg {Boolean} Можно модифицировать. Признак передается объектам, которые инстанциирует DataSet.
     * @name Types/_source/DataSet#writable
     */
    protected _$writable: boolean;

    /**
     * Get instance can be changed
     */
    get writable(): boolean {
        return this._$writable;
    }

    /**
     * Set instance can be changed
     */
    set writable(value: boolean) {
        this._$writable = !!value;
    }

    constructor(options?: IOptions) {
        super();
        OptionsToPropertyMixin.call(this, options);
        SerializableMixin.call(this);

        if (!this._$keyProperty && options && (options as any).idProperty) {
             this._$keyProperty = (options as any).idProperty;
        }
    }

    // region Public methods

    /**
     * Возвращает адаптер для работы с данными
     * @return {Types/_entity/adapter/IAdapter}
     * @see adapter
     * @see Types/_entity/adapter/IAdapter
     * @example
     * Получим адаптер набора данных, используемый по умолчанию:
     * <pre>
     *     require(['Types/source', 'Types/entity'], function (source, entity) {
     *         var data = new source.DataSet();
     *         console.log(data.getAdapter() instanceof entity.adapter.Json);//true
     *     });
     * </pre>
     */
    getAdapter(): adapter.IAdapter {
        if (typeof this._$adapter === 'string') {
            this._$adapter = create<adapter.IAdapter>(this._$adapter);
        }
        return this._$adapter;
    }

    /**
     * Возвращает конструктор записей, порождаемых набором данных.
     * @return {String|Function}
     * @see model
     * @see Types/_entity/Model
     * @see Types/di
     * @example
     * Получим конструктор записей, используемый по умолчанию:
     * <pre>
     *     require(['Types/source'], function (source) {
     *         var data = new source.DataSet();
     *         console.log(data.getModel());//'Types/entity:Model'
     *     });
     * </pre>
     */
    getModel(): TypeDeclaration {
        return this._$model;
    }

    /**
     * Устанавливает конструктор записей, порождаемых набором данных.
     * @param {String|Function} model
     * @see model
     * @see getModel
     * @see Types/_entity/Model
     * @see Types/di
     * @example
     * Установим конструктор пользовательской модели:
     * <pre>
     *     require(['Types/source', 'Application/Models/User'], function (source, UserModel) {
     *         var data = new source.DataSet();
     *         data.setModel(UserModel);
     *     });
     * </pre>
     */
    setModel(model: TypeDeclaration): void {
        this._$model = model;
    }

    /**
     * Возвращает конструктор списка моделей
     * @return {String|Function}
     * @see listModule
     * @see Types/di
     * @example
     * Получим конструктор рекордсетов, используемый по умолчанию:
     * <pre>
     *     require(['Types/source'], function (source) {
     *         var data = new source.DataSet();
     *         console.log(data.getListModule());//'Types/collection:RecordSet'
     *     });
     * </pre>
     */
    getListModule(): TypeDeclaration {
        return this._$listModule;
    }

    /**
     * Устанавливает конструктор списка моделей
     * @param {String|Function} listModule
     * @see getListModule
     * @see listModule
     * @see Types/di
     * @example
     * Установим конструктор рекордсетов:
     * <pre>
     *     require(['Types/source', 'Application/Collection/Users'], function (source, UsersCollection) {
     *         var data = new source.DataSet();
     *         data.setListModule(UsersCollection);
     *     });
     * </pre>
     */
    setListModule(listModule: TypeDeclaration): void {
        this._$listModule = listModule;
    }

    /**
     * Возвращает название свойства модели, содержащего первичный ключ
     * @return {String}
     * @see keyProperty
     * @see Types/_entity/Model#keyProperty
     * @example
     * Получим название свойства модели, содержащего первичный ключ:
     * <pre>
     *     require(['Types/source'], function (source) {
     *         var data = new source.DataSet({
     *             keyProperty: 'id'
     *         });
     *         console.log(data.getKeyProperty());//'id'
     *     });
     * </pre>
     */
    getKeyProperty(): string {
        return this._$keyProperty;
    }

    /**
     * Устанавливает название свойства модели, содержащего первичный ключ
     * @param {String} name
     * @see getKeyProperty
     * @see keyProperty
     * @see Types/_entity/Model#idProperty
     * @example
     * Установим название свойства модели, содержащего первичный ключ:
     * <pre>
     *     require(['Types/source'], function (source) {
     *         var data = new source.DataSet();
     *         data.setKeyProperty('id');
     *     });
     * </pre>
     */
    setKeyProperty(name: string): void {
        this._$keyProperty = name;
    }

    /**
     * Возвращает название свойства сырых данных, в котором находится основная выборка
     * @return {String}
     * @see setItemsProperty
     * @see itemsProperty
     * @example
     * Получим название свойства, в котором находится основная выборка:
     * <pre>
     *     require(['Types/source'], function (source) {
     *         var data = new source.DataSet({
     *             itemsProperty: 'items'
     *         });
     *         console.log(data.getItemsProperty());//'items'
     *     });
     * </pre>
     */
    getItemsProperty(): string {
        return this._$itemsProperty;
    }

    /**
     * Устанавливает название свойства сырых данных, в котором находится основная выборка
     * @param {String} name
     * @see getItemsProperty
     * @see itemsProperty
     * @example
     * Установим название свойства, в котором находится основная выборка:
     * <pre>
     *     require(['Types/source'], function (source) {
     *         var data = new source.DataSet();
     *         data.setItemsProperty('items');
     *     });
     * </pre>
     */
    setItemsProperty(name: string): void {
        this._$itemsProperty = name;
    }

    /**
     * Возвращает выборку
     * @param {String} [property] Свойство данных, в которых находятся элементы выборки. Если не указывать, вернется
     * основная выборка.
     * @return {Types/_collection/RecordSet}
     * @see itemsProperty
     * @example
     * Получим основную выборку из набора данных, представляющего выборку:
     * <pre>
     *     require(['Types/source'], function (source) {
     *         var data = new source.DataSet({
     *                 rawData: [
     *                     {id: 1, title: 'How to build a Home'},
     *                     {id: 2, title: 'How to plant a Tree'},
     *                     {id: 3, title: 'How to grow up a Son'}
     *                 ]
     *             }),
     *             mansGuide = data.getAll();
     *
     *         console.log(mansGuide.at(0).get('title'));//'How to build a Home'
     *     });
     * </pre>
     * @example
     * Получим основную и дополнительную выборки из набора данных, представляющего несколько выборок:
     * <pre>
     *     require(['Types/source'], function (source) {
     *         var data = new source.DataSet({
     *                 rawData: {
     *                     articles: [{
     *                         id: 1,
     *                         topicId: 1,
     *                         title: 'Captain America'
     *                     }, {
     *                         id: 2,
     *                         topicId: 1,
     *                         title: 'Iron Man'
     *                     }, {
     *                         id: 3,
     *                         topicId: 2,
     *                         title: 'Batman'
     *                     }],
     *                     topics: [{
     *                         id: 1,
     *                         title: 'Marvel Comics'
     *                     }, {
     *                         id: 2,
     *                         title: 'DC Comics'
     *                     }]
     *                 },
     *                 itemsProperty: 'articles'
     *             }),
     *             articles = data.getAll(),
     *             topics = data.getAll('topics');
     *
     *         console.log(articles.at(0).get('title'));//'Captain America'
     *         console.log(topics.at(0).get('title'));//'Marvel Comics'
     *     });
     * </pre>
     */
    getAll(property?: string): RecordSet {
        this._checkAdapter();
        if (property === undefined) {
            property = this._$itemsProperty;
        }

        const items = this._getListInstance(
            this._getDataProperty(property)
        );

        if (this._$metaProperty && items.getMetaData instanceof Function) {
            let itemsMetaData = items.getMetaData();
            let metaData = this.getMetaData();
            let someInMetaData = Object.keys(metaData).length > 0;

            // FIXME: don't use deprecated 'total' property from raw data
            if (!someInMetaData && this._$rawData && this._$rawData.total) {
                metaData = {total: this._$rawData.total};
                someInMetaData = true;
            }

            if (someInMetaData) {
                itemsMetaData = {...(itemsMetaData || {}), ...metaData};

                // FIXME: don't use 'more' anymore
                if (!itemsMetaData.hasOwnProperty('more') && metaData.hasOwnProperty('total')) {
                    itemsMetaData.more = (<any> metaData).total;
                }

                items.setMetaData(itemsMetaData);
            }
        }

        return items;
    }

    /**
     * Возвращает запись
     * @param {String} [property] Свойство данных, в которых находится модель
     * @return {Types/_entity/Model|undefined}
     * @see itemsProperty
     * @example
     * Получим запись из набора данных, который содержит только ее:
     * <pre>
     *     require(['Types/source'], function (source) {
     *         var data = new source.DataSet({
     *                 rawData: {
     *                     id: 1,
     *                     title: 'C++ Beginners Tutorial'
     *                 }
     *             }),
     *             article = data.getRow();
     *
     *         console.log(article.get('title'));//'C++ Beginners Tutorial'
     *     });
     * </pre>
     * @example
     * Получим записи статьи и темы из набора данных, который содержит несколько записей:
     * <pre>
     *     require(['Types/source'], function (source) {
     *         var data = new source.DataSet({
     *                 rawData: {
     *                     article: {
     *                         id: 2,
     *                         topicId: 1,
     *                         title: 'Iron Man'
     *                     },
     *                     topic: {
     *                         id: 1,
     *                         title: 'Marvel Comics'
     *                     }
     *                 }
     *             }),
     *             article = data.getRow('article'),
     *             topic = data.getRow('topic');
     *
     *         console.log(article.get('title'));//'Iron Man'
     *         console.log(topic.get('title'));//'Marvel Comics'
     *     });
     * </pre>
     */
    getRow(property?: string): Model {
        this._checkAdapter();
        if (property === undefined) {
            property = this._$itemsProperty;
        }

        // FIXME: don't use hardcoded signature for type detection
        const data = this._getDataProperty(property);
        const type = this.getAdapter().getProperty(data, '_type');
        if (type === 'recordset') {
            const tableAdapter = this.getAdapter().forTable(data);
            if (tableAdapter.getCount() > 0) {
                return this._getModelInstance(tableAdapter.at(0));
            }
        } else {
            return this._getModelInstance(data);
        }

        return undefined;
    }

    /**
     * Возвращает значение
     * @param {String} [property] Свойство данных, в которых находится значение
     * @return {*}
     * @see itemsProperty
     * @example
     * Получим количество открытых задач:
     * <pre>
     *     require(['Types/source'], function (source) {
     *         var statOpen = new source.DataSet({
     *             rawData: 234
     *         });
     *
     *         console.log(statOpen.getScalar());//234
     *     });
     * </pre>
     * @example
     * Получим количество открытых и закрытых задач:
     * <pre>
     *     require(['Types/source'], function (source) {
     *         var stat = new source.DataSet({
     *             rawData: {
     *                 total: 500,
     *                 open: 234,
     *                 closed: 123,
     *                 deleted: 2345
     *              }
     *         });
     *
     *         console.log(stat.getScalar('open'));//234
     *         console.log(stat.getScalar('closed'));//123
     *     });
     * </pre>
     */
    getScalar(property?: string): string | number | boolean {
        if (property === undefined) {
            property = this._$itemsProperty;
        }
        return this._getDataProperty(property);
    }

    /**
     * Возвращает свойство данных, в котором находися общее число элементов выборки
     * @return {String}
     * @see metaProperty
     */
    getMetaProperty(): string {
        return this._$metaProperty;
    }

    /**
     * Возвращает мета-данные выборки
     * @return {Object}
     * @see metaProperty
     */
    getMetaData(): Object {
        return this._$metaProperty && this._getDataProperty(this._$metaProperty) || {};
    }

    /**
     * Проверяет наличие свойства в данных
     * @param {String} property Свойство
     * @return {Boolean}
     * @see getProperty
     * @example
     * Проверим наличие свойств 'articles' и 'topics':
     * <pre>
     *     require(['Types/source'], function (source) {
     *         var data = new source.DataSet({
     *             rawData: {
     *                 articles: [{
     *                     id: 1,
     *                     title: 'C++ Beginners Tutorial'
     *                 }]
     *             }
     *         });
     *
     *         console.log(data.hasProperty('articles'));//true
     *         console.log(data.hasProperty('topics'));//false
     *     });
     * </pre>
     */
    hasProperty(property?: string): boolean {
        return property ? this._getDataProperty(property) !== undefined : false;
    }

    /**
     * Возвращает значение свойства в данных
     * @param {String} property Свойство
     * @return {*}
     * @see hasProperty
     * @example
     * Получим значение свойства 'article':
     * <pre>
     *     require(['Types/source'], function (source) {
     *         var data = new source.DataSet({
     *             rawData: {
     *                 article: {
     *                     id: 1,
     *                     title: 'C++ Beginners Tutorial'
     *                 }
     *             }
     *         });
     *
     *         console.log(data.getProperty('article'));//{id: 1, title: 'C++ Beginners Tutorial'}
     *     });
     * </pre>
     */
    getProperty(property?: string): any {
        return this._getDataProperty(property);
    }

    /**
     * Возвращает сырые данные
     * @return {*}
     * @see setRawData
     * @see rawData
     * @example
     * Получим данные в сыром виде:
     * <pre>
     *     require(['Types/source'], function (source) {
     *         var data = new source.DataSet({
     *             rawData: {
     *                 id: 1,
     *                 title: 'C++ Beginners Tutorial'
     *             }
     *         });
     *
     *         console.log(data.getRawData());//{id: 1, title: 'C++ Beginners Tutorial'}
     *     });
     * </pre>
     */
    getRawData(): any {
        return this._$rawData;
    }

    /**
     * Устанавливает сырые данные
     * @param rawData {*} Сырые данные
     * @see getRawData
     * @see rawData
     * @example
     * Установим данные в сыром виде:
     * <pre>
     *     require(['Types/source'], function (source) {
     *         var data = new source.DataSet();
     *
     *         data.setRawData({
     *             id: 1,
     *             title: 'C++ Beginners Tutorial'
     *         });
     *         console.log(data.getRow().get('title'));//'C++ Beginners Tutorial'
     *     });
     * </pre>
     */
    setRawData(rawData: any): void {
        this._$rawData = rawData;
    }

    // endregion

    // region Protected methods

    /**
     * Возвращает свойство данных
     * @param property Свойство
     * @protected
     */
    protected _getDataProperty(property: string): any {
        this._checkAdapter();
        return property
            ? this.getAdapter().getProperty(this._$rawData, property)
            : this._$rawData;
    }

    /**
     * Возвращает инстанс модели
     * @param rawData Данные модели
     * @protected
     */
    protected _getModelInstance(rawData: any): Model {
        if (!this._$model) {
            throw new Error('Model is not defined');
        }
        return create<Model>(this._$model, {
            writable: this._$writable,
            rawData,
            adapter: this._$adapter,
            idProperty: this._$keyProperty
        });
    }

    /**
     * Возвращает инстанс рекордсета
     * @param rawData Данные рекордсета
     * @protected
     */
    protected _getListInstance(rawData: any): RecordSet {
        return create<RecordSet>(this._$listModule, {
            writable: this._$writable,
            rawData,
            adapter: this._$adapter,
            model: this._$model,
            idProperty: this._$keyProperty
        });
    }

    /**
     * Проверят наличие адаптера
     * @protected
     */
    protected _checkAdapter(): void {
        if (!this.getAdapter()) {
            throw new Error('Adapter is not defined');
        }
    }

    // endregion
}

Object.assign(DataSet.prototype, {
    '[Types/_source/DataSet]': true,
    _moduleName: 'Types/source:DataSet',
    _$adapter: 'Types/entity:adapter.Json',
    _$rawData: null,
    _$model: 'Types/entity:Model',
    _$listModule: 'Types/collection:RecordSet',
    _$keyProperty: '',
    _$itemsProperty: '',
    _$metaProperty: '',
    _$writable: true,
     getIdProperty: DataSet.prototype.getKeyProperty,
     setIdProperty: DataSet.prototype.setKeyProperty
});

register('Types/source:DataSet', DataSet, {instantiate: false});
