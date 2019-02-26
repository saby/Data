/// <amd-module name="Types/_entity/FormattableMixin" />
/**
 * Миксин, предоставляющий поведение владения форматом полей и доступа к их значениям в сырых данных через адаптер.
 * @mixin Types/_entity/FormattableMixin
 * @public
 * @author Мальцев А.А.
 */

import {Field, fieldsFactory, UniversalField, IFieldDeclaration} from './format';
import {Cow as CowAdapter, IAdapter, ITable, IRecord, IDecorator} from './adapter';
import {IState as IDefaultSerializableState} from './SerializableMixin';
import {resolve, create, isRegistered} from '../di';
import {format} from '../collection';
import {object, logger} from '../util';

const defaultAdapter = 'Types/entity:adapter.Json';

export interface IOptions {
   adapter?: IAdapter | string;
   rawData?: any;
   format?: format.Format<Field> | IFieldDeclaration[];
   cow?: boolean;
}

export interface ISerializableState extends IDefaultSerializableState {
   $options: IOptions;
}

/**
 * Строит формат, объединяя частичный формат и формат, построенный по сырым данным
 * @param {Object} slicedFormat Частичное описание формата
 * @param {Types/_collection/format/Format>} rawDataFormat Формат из сырых данных
 * @return {Types/_collection/format/Format}
 */
function buildFormatFromObject(slicedFormat: object, rawDataFormat: format.Format<Field>): format.Format<Field> {
   let field;
   let fieldIndex;
   for (const name in slicedFormat) {
      if (!slicedFormat.hasOwnProperty(name)) {
         continue;
      }

      field = slicedFormat[name];
      if (typeof field !== 'object') {
         field = {type: field};
      }
      if (!(field instanceof Field)) {
         field = fieldsFactory(field);
      }
      field.setName(name);

      fieldIndex = rawDataFormat.getFieldIndex(name);
      if (fieldIndex === -1) {
         rawDataFormat.add(field);
      } else {
         rawDataFormat.replace(field, fieldIndex);
      }
   }

   return rawDataFormat;
}

/**
 * Строит формат полей сырым данным
 * @return {Types/_collection/format/Format}
 */
function buildFormatByRawData(): format.Format<Field> {
   const format = create<format.Format<Field>>('Types/collection:format.Format');
   const adapter = this._getRawDataAdapter();
   const fields = this._getRawDataFields();
   const count = fields.length;

   for (let i = 0; i < count; i++) {
      format.add(
         adapter.getFormat(fields[i])
      );
   }

   return format;
}

/**
 * Строит сырые данные по формату если он был явно задан
 */
function buildRawData(): void {
   if (this._hasFormat()) {
      let adapter = this._getRawDataAdapter();
      const fields = adapter.getFields();

      if (adapter['[Types/_entity/adapter/IDecorator]']) {
         adapter = adapter.getOriginal();
      }
      // TODO: solve the problem of data normalization
      if (adapter._touchData) {
         adapter._touchData();
      }

      this._getFormat().each((fieldFormat) => {
         try {
            if (fields.indexOf(fieldFormat.getName()) === -1) {
               adapter.addField(fieldFormat);
            }
         } catch (e) {
            logger.info(this._moduleName + '::constructor(): can\'t add raw data field (' + e.message + ')');
         }
      });
   }
}

const FormattableMixin = /** @lends Types/_entity/FormattableMixin.prototype */{
   '[Types/_entity/FormattableMixin]': true,

   // FIXME: backward compatibility for check via Core/core-instance::instanceOfMixin()
   '[WS.Data/Entity/FormattableMixin]': true,

   /**
    * @cfg {Object} Данные в "сыром" виде.
    * @name Types/_entity/FormattableMixin#rawData
    * @see getRawData
    * @see setRawData
    * @remark
    * Данные должны быть в формате, поддерживаемом адаптером {@link adapter}.
    * Данные должны содержать только примитивные значения или простые массивы (Array) или объекты (Object).
    * @example
    * Создадим новую запись с данными сотрудника:
    * <pre>
    *    require(['Types/_entity/Record'], function (Record) {
    *       var user = new Record({
    *          rawData: {
    *             id: 1,
    *             firstName: 'John',
    *           lastName: 'Smith'
    *          }
    *       });
    *
    *       console.log(user.get('id'));// 1
    *       console.log(user.get('firstName'));// John
    *       console.log(user.get('lastName'));// Smith
    *    });
    * </pre>
    * Создадим рекордсет с персонажами фильма:
    * <pre>
    *    require(['Types/collection'], function (collection) {
    *       var characters = new collection.RecordSet({
    *          rawData: [{
    *             id: 1,
    *             firstName: 'John',
    *             lastName: 'Connor',
    *             role: 'Savior'
    *          }, {
    *             id: 2,
    *             firstName: 'Sarah',
    *             lastName: 'Connor',
    *             role: 'Mother'
    *          }, {
    *             id: 3,
    *             firstName: '-',
    *             lastName: 'T-800',
    *             role: 'Terminator'
    *          }]
    *       });
    *
    *
    *       console.log(characters.at(0).get('firstName'));// John
    *       console.log(characters.at(0).get('lastName'));// Connor
    *       console.log(characters.at(1).get('firstName'));// Sarah
    *       console.log(characters.at(1).get('lastName'));// Connor
    *    });
    * </pre>
    */
   _$rawData: null,

   // При работе с сырыми данными использовать режим Copy-On-Write.
   _$cow: false,

   /**
    * @cfg {String|Types/_entity/adapter/IAdapter} Адаптер для работы с данными, по умолчанию
    * {@link Types/_entity/adapter/Json}.
    * @name Types/_entity/FormattableMixin#adapter
    * @see getAdapter
    * @see Types/_entity/adapter/Json
    * @see Types/di
    * @remark
    * Адаптер должен быть предназначен для формата, в котором получены сырые данные {@link rawData}.
    * По умолчанию обрабатываются данные в формате JSON (ключ -> значение).
    * @example
    * Создадим запись с адаптером для данных в формате БЛ СБИС:
    * <pre>
    *    require(['Types/entity'], function (entity) {
    *       var user = new entity.Record({
    *          adapter: new entity.adapter.Sbis(),
    *          format: [
    *             {name: 'login', type: 'string'},
    *             {name: 'email', type: 'string'}
    *          ]
    *       });
    *       user.set({
    *          login: 'root',
    *          email: 'root@server.name'
    *       });
    *    });
    * </pre>
    */
   _$adapter: defaultAdapter,

   /**
    * @cfg {Types/_collection/format/Format|
    * Array.<Types/_entity/format/FieldsFactory/FieldDeclaration.typedef>|
    * Object.<String,String>|
    * Object.<String,Function>|
    * Object.<String,Types/_entity/format/FieldsFactory/FieldDeclaration.typedef>|
    * Object.<String,Types/_entity/format/Field>
    * } Формат всех полей (если задан массивом или экземпляром {@link Types/_collection/format/Format Format}),
    * либо формат отдельных полей (если задан объектом).
    * @name Types/_entity/FormattableMixin#format
    * @see getFormat
    * @remark Правила {@link getFormat формирования формата} в зависимости от типа значения опции:
    * <ul>
    * <li>если формат явно не задан, то он будет построен по сырым данным;</li>
    * <li>если формат задан для части полей (Object), то он будет построен по сырым данным; для полей с совпадающими
    *     именами формат будет заменен на явно указанный, формат полей с несовпадающими именами будет добавлен в конец;
    * </li>
    * <li>если формат задан для всех полей (Array или Types/_collection/format/Format), то будет использован именно он,
    *     независимо от набора полей в сырых данных.
    * </li>
    * </ul>
    * @example
    * Создадим запись с указанием формата полей, внедренным в декларативном виде:
    * <pre>
    *    require(['Types/entity'], function(entity) {
    *       var user = new entity.Record({
    *          format: [{
    *             name: 'id',
    *             type: 'integer'
    *          }, {
    *             name: 'login',
    *             type: 'string'
    *          }, {
    *             name: 'amount',
    *             type: 'money',
    *             precision: 4
    *          }]
    *       });
    *    });
    * </pre>
    * Создадим рекордсет с указанием формата полей, внедренным в виде готового экземпляра:
    * <pre>
    *    //My/Format/User.js
    *    define('My/Format/User', [
    *       'Types/collection',
    *       'Types/entity'
    *    ], function(collection, entity) {
    *       var format = new collection.format.Format();
    *       format.add(new entity.format.IntegerField({name: 'id'}));
    *       format.add(new entity.format.StringField({name: 'login'}));
    *       format.add(new entity.format.StringField({name: 'email'}));
    *
    *       return format;
    *    });
    *
    *    ///My/Models/Users.js
    *    require([
    *       'Types/collection',
    *       'My/Format/User'
    *    ], function (collection, userFormat) {
    *       var users = new collection.RecordSet({
    *          format: userFormat
    *       });
    *    });
    * </pre>
    * Создадим запись, для которой зададим формат полей 'id' и 'amount', внедренный в декларативном виде:
    * <pre>
    *    require(['Types/entity'], function(entity) {
    *       var user = new entity.Record({
    *          rawData: {
    *             id: 256,
    *             login: 'dr.strange',
    *             amount: 15739.45
    *          },
    *          format: {
    *             id: 'integer',
    *             amount: {type: 'money', precision: 4}
    *          }]
    *       });
    *    });
    * </pre>
    * Создадим запись, для которой зададим формат поля 'amount', внедренный в виде готового экземпляра:
    * <pre>
    *    require([
    *       'Types/entity'
    *    ], function(entity) {
    *       var amountField = new entity.format.MoneyField({precision: 4}),
    *          user = new entity.Record({
    *             format: {
    *                amount: amountField
    *             }]
    *          });
    *    });
    * </pre>
    * Укажем тип Number для поля "Идентификатор" и тип Date для поля "Время последнего входа" учетной записи
    * пользователя:
    * <pre>
    *    require(['Types/entity'], function(entity) {
    *       var user = new entity.Record({
    *          format: {
    *             id: Number,
    *             lastLogin: Date
    *          }
    *       });
    *    });
    * </pre>
    * Внедрим рекордсет со своей моделью в одно из полей записи:
    * <pre>
    *    //MyApplication/Models/ActivityModel.js
    *    import {Model} from 'Types/entity';
    *    export default class ActivityModel extends Model{
    *       //...
    *    }
    *
    *    //MyApplication/Models/ActivityRecordSet.js
    *    import ActivityModel from './ActivityModel';
    *    import {RecordSet} from 'Types/collection';
    *    export default class ActivityRecordSet extends RecordSet {
    *       _$model: ActivityModel
    *    }
    *
    *    //MyApplication/Controllers/ActivityController.js
    *    import ActivityRecordSet from '../Models/ActivityRecordSet';
    *    import {Record} from 'Types/entity';
    *    const user = new Record({
    *       format: {
    *          activity: ActivityRecordSet
    *       }
    *    });
    * </pre>
    * Создадим запись заказа в магазине с полем типа "рекордсет", содержащим список позиций. Сырые данные будут в
    * формате БЛ СБИС:
    * <pre>
    *    require([
    *       'Types/entity',
    *       'Types/collection'
    *    ], function (entity, collection) {
    *       var order = new entity.Record({
    *          adapter: new entity.adapter.Sbis(),
    *          format:[{
    *             name: 'id',
    *             type: 'integer',
    *             defaultValue: 0
    *          }, {
    *             name: 'items',
    *             type: 'recordset'
    *          }]
    *       });
    *       var orderItems = new RecordSet({
    *          adapter: new entity.adapter.Sbis(),
    *          format: [{
    *             name: 'goods_id',
    *             type: 'integer',
    *             defaultValue: 0
    *          }, {
    *             name: 'price',
    *             type: 'real',
    *             defaultValue: 0
    *          }, {
    *            name: 'count',
    *            type: 'integer',
    *            defaultValue: 0
    *          }]
    *       });
    *
    *       order.set('items', orderItems);
    *    });
    * </pre>
    * Формат поля для массива значений смотрите в описании {@link Types/_entity/format/ArrayField}.
    */
   _$format: null,

   /**
    * @member {Types/_collection/format/Format} Формат полей (собранный из опции format или в результате манипуляций)
    */
   _format: null,

   /**
    * @member {Types/_collection/format/Format} Клон формата полей (для кэшеирования результата getFormat())
    */
   _formatClone: null,

   /**
    * @member {Types/_entity/adapter/ITable|Types/_entity/adapter/IRecord} Адаптер для данных в "сыром" виде
    */
   _rawDataAdapter: null,

   /**
    * @member {Array.<String>} Описание всех полей, полученных из данных в "сыром" виде
    */
   _rawDataFields: null,

   constructor(): void {
      // FIXME: get rid of _options
      if (!this._$format && this._options && this._options.format) {
         this._$format = this._options.format;
      }

      buildRawData.call(this);
   },

   // region Types/_entity/SerializableMixin

   _getSerializableState(state: ISerializableState): ISerializableState {
      state.$options.rawData = this._getRawData();
      return state;
   },

   _setSerializableState(state: ISerializableState): Function {
      // tslint:disable-next-line:only-arrow-functions no-empty
      return function(): void {};
   },

   // endregion Types/_entity/SerializableMixin

   // region Public methods

   /**
    * Возвращает данные в "сыром" виде. Если данные являются объектом, то возвращается его дубликат.
    * @return {Object}
    * @see setRawData
    * @see rawData
    * @example
    * Получим сырые данные статьи:
    * <pre>
    *    require(['Types/entity'], function (entity) {
    *       var data = {id: 1, title: 'Article 1'};
    *       var article = new entity.Record({
    *          rawData: data
    *       });
    *
    *       console.log(article.getRawData());// {id: 1, title: 'Article 1'}
    *       console.log(article.getRawData() === data);// false
    *       console.log(JSON.stringify(article.getRawData()) === JSON.stringify(data));// true
    *    });
    * </pre>
    */
   getRawData(shared?: boolean): any {
      return shared ? this._getRawData() : object.clone(this._getRawData());
   },

   /**
    * Устанавливает данные в "сыром" виде.
    * @param data {Object} Данные в "сыром" виде.
    * @see getRawData
    * @see rawData
    * @example
    * Установим сырые данные статьи:
    * <pre>
    *    require(['Types/entity'], function (entity) {
    *       var article = new entity.Record();
    *       article.setRawData({id: 1, title: 'Article 1'});
    *       console.log(article.get('title'));// Article 1
    *    });
    * </pre>
    */
   setRawData(data: any): void {
      this._resetRawDataAdapter(data);
      this._resetRawDataFields();
      this._clearFormatClone();
      buildRawData.call(this);
   },

   /**
    * Возвращает адаптер для работы с данными в "сыром" виде.
    * @return {Types/_entity/adapter/IAdapter}
    * @see adapter
    * @example
    * Проверим, что по умолчанию используется адаптер для формата JSON:
    * <pre>
    *    require(['Types/entity'], function (entity) {
    *       var article = new entity.Record();
    *       console.log(article.getAdapter() instanceof entity.adapter.Json);// true
    *    });
    * </pre>
    */
   getAdapter(): IAdapter {
      let adapter = this._getAdapter();
      if (adapter['[Types/_entity/adapter/IDecorator]']) {
         adapter = adapter.getOriginal();
      }
      return adapter;
   },

   /**
    * Возвращает формат полей (в режиме только для чтения)
    * @return {Types/_collection/format/Format}
    * @see format
    * @example
    * Получим формат, сконструированный из декларативного описания:
    * <pre>
    *    require(['Types/entity'], function (entity) {
    *       var article = new entity.Record({
    *          format: [
    *             {name: 'id', type: 'integer'},
    *             {name: 'title', type: 'string'}
    *           ]
    *       });
    *       var format = article.getFormat();
    *
    *       console.log(format.at(0).getName());// 'id'
    *       console.log(format.at(1).getName());// 'title'
    *    });
    * </pre>
    * Получим формат, сконструированный из сырых данных:
    * <pre>
    *    require(['Types/entity'], function (entity) {
    *       var article = new entity.Record({
    *          rawData: {
    *             id: 1,
    *             title: 'What About Livingstone'
    *          }
    *       });
    *       var format = article.getFormat();
    *
    *       console.log(format.at(0).getName());// 'id'
    *       console.log(format.at(1).getName());// 'title'
    *    });
    * </pre>
    */
   getFormat(shared?: boolean): format.Format<Field> {
      if (shared) {
         return this._getFormat(true);
      }
      if (!this._formatClone) {
         this._formatClone = this._getFormat(true).clone(true);
      }
      return this._formatClone;
   },

   /**
    * Добавляет поле в формат.
    * @remark
    * Если позиция не указана (или указана как -1), поле добавляется в конец формата.
    * Если поле с таким форматом уже есть, генерирует исключение.
    * @param {Types/_entity/format/Field|Types/_entity/format/FieldsFactory/FieldDeclaration.typedef} format Формат
    * поля.
    * @param {Number} [at] Позиция поля.
    * @see format
    * @see removeField
    * @example
    * Добавим поля в виде декларативного описания:
    * <pre>
    *    require(['Types/entity'], function (entity) {
    *       var record = new entity.Record();
    *       record.addField({name: 'login', type: 'string'});
    *       record.addField({name: 'amount', type: 'money', precision: 3});
    *    });
    * </pre>
    * Добавим поля в виде экземпляров:
    * <pre>
    *    require([
    *       'Types/collection',
    *       'Types/entity'
    *    ], function (collection, entity) {
    *       var recordset = new collection.RecordSet();
    *       recordset.addField(new entity.format.StringField({name: 'login'}));
    *       recordset.addField(new entity.format.MoneyField({name: 'amount', precision: 3}));
    *    });
    * </pre>
    */
   addField(format: Field, at: number): void {
      format = this._buildField(format);
      this._$format = this._getFormat(true);
      this._$format.add(format, at);
      this._getRawDataAdapter().addField(format, at);
      this._resetRawDataFields();
      this._clearFormatClone();
   },

   /**
    * Удаляет поле из формата по имени.
    * @remark
    * Если поля с таким именем нет, генерирует исключение.
    * @param {String} name Имя поля
    * @see format
    * @see addField
    * @see removeFieldAt
    * @example
    * Удалим поле login:
    * <pre>
    *    record.removeField('login');
    * </pre>
    */
   removeField(name: string): void {
      this._$format = this._getFormat(true);
      this._$format.removeField(name);
      this._getRawDataAdapter().removeField(name);
      this._resetRawDataFields();
      this._clearFormatClone();
   },

   /**
    * Удаляет поле из формата по позиции.
    * @remark
    * Если позиция выходит за рамки допустимого индекса, генерирует исключение.
    * @param {Number} at Позиция поля.
    * @see format
    * @see addField
    * @see removeField
    * @example
    * Удалим первое поле:
    * <pre>
    *    record.removeFieldAt(0);
    * </pre>
    */
   removeFieldAt(at: number): void {
      this._$format = this._getFormat(true);
      this._$format.removeAt(at);
      this._getRawDataAdapter().removeFieldAt(at);
      this._resetRawDataFields();
      this._clearFormatClone();
   },

   // endregion Public methods

   // region Protected methods

   /**
    * Возвращает данные в "сыром" виде из _rawDataAdapter (если он был создан) или исходные
    * @param {Boolean} [direct=false] Напрямую, не используя адаптер
    * @return {Object}
    * @protected
    */
   _getRawData(direct?: boolean): any {
      if (!direct && this._rawDataAdapter) {
         return this._rawDataAdapter.getData();
      }
      return typeof this._$rawData === 'function' ? this._$rawData() : this._$rawData;
   },

   /**
    * Возвращает адаптер по-умолчанию в случае, если опция 'adapter' не была переопределена в подмешивающем миксин коде.
    * @protected
    * @deprecated Метод _getDefaultAdapter() не рекомендуется к использованию. Используйте опцию adapter.
    */
   _getDefaultAdapter(): string {
      return defaultAdapter;
   },

   /**
    * Возвращает адаптерр для сырых данных
    * @return {Types/_entity/adapter/IAdapter}
    * @protected
    */
   _getAdapter(): IAdapter {
      if (
         this._$adapter === defaultAdapter &&
         FormattableMixin._getDefaultAdapter !== this._getDefaultAdapter
      ) {
         this._$adapter = this._getDefaultAdapter();
      }

      if (this._$adapter && !(this._$adapter instanceof Object)) {
         this._$adapter = create(this._$adapter);
      }

      if (this._$cow && !this._$adapter['[Types/_entity/adapter/IDecorator]']) {
         this._$adapter = new CowAdapter(this._$adapter);
      }

      return this._$adapter;
   },

   /**
    * Возвращает адаптер для сырых данных заданного вида
    * @return {Types/_entity/adapter/ITable|Types/_entity/adapter/IRecord}
    * @protected
    */
   _getRawDataAdapter(): ITable | IRecord {
      if (!this._rawDataAdapter) {
         this._rawDataAdapter = this._createRawDataAdapter();
      }

      return this._rawDataAdapter;
   },

   /**
    * Создает адаптер для сырых данных
    * @return {Types/_entity/adapter/ITable|Types/_entity/adapter/IRecord}
    * @protected
    */
   _createRawDataAdapter(): ITable | IRecord {
      throw new Error('Method must be implemented');
   },

   /**
    * Сбрасывает адаптер для сырых данных
    * @param {*} [data] Сырые данные
    * @protected
    */
   _resetRawDataAdapter(data?: any): void {
      if (data === undefined) {
         if (this._rawDataAdapter && typeof this._$rawData !== 'function') {
            // Save possible rawData changes
            this._$rawData = this._rawDataAdapter.getData();
         }
      } else {
         this._$rawData = data;
      }

      this._rawDataAdapter = null;
   },

   /**
    * Проверяет совместимость адаптеров
    * @param {Types/_entity/adapter/IAdapter} foreign Адаптер внешнего объекта
    * @protected
    */
   _checkAdapterCompatibility(foreign: IAdapter | IDecorator): void {
      let internal = this._getAdapter();

      if (foreign['[Types/_entity/adapter/IDecorator]']) {
         foreign = (foreign as IDecorator).getOriginal() as IAdapter;
      }
      if (internal['[Types/_entity/adapter/IDecorator]']) {
         internal = internal.getOriginal();
      }

      const internalProto = Object.getPrototypeOf(internal);
      if (!internalProto.isPrototypeOf(foreign)) {
         throw new TypeError(
            `The foreign adapter "${(foreign as any)._moduleName}" is incompatible with the internal adapter ` +
            `"${internal._moduleName}"`
         );
      }
   },

   /**
    * Возвращает список полей записи, полученный из "сырых" данных
    * @return {Array.<String>}
    * @protected
    */
   _getRawDataFields(): string[] {
      return this._rawDataFields || (this._rawDataFields = this._getRawDataAdapter().getFields());
   },

   /**
    * Добавляет поле в список полей
    * @param {String} name Название поля
    * @protected
    */
   _addRawDataField(name: string): void {
      this._getRawDataFields().push(name);
   },

   /**
    * Сбрасывает список полей записи, полученный из "сырых" данных
    * @protected
    */
   _resetRawDataFields(): void {
      this._rawDataFields = null;
   },

   /**
    * Возвращает формат полей
    * @param {Boolean} [build=false] Принудительно создать, если не задан
    * @return {Types/_collection/format/Format}
    * @protected
    */
   _getFormat(build?: boolean): format.Format<Field> {
      if (!this._format) {
         if (this._hasFormat()) {
            this._format = this._$format = FormattableMixin._buildFormat(this._$format, () => {
               return buildFormatByRawData.call(this);
            });
         } else if (build) {
            this._format = buildFormatByRawData.call(this);
         }
      }

      return this._format;
   },

   /**
    * Очищает формат полей. Это можно сделать только если формат не был установлен явно.
    * @protected
    */
   _clearFormat(): void {
      if (this._hasFormat()) {
         throw new Error(`${this._moduleName}: format can't be cleared because it's defined directly`);
      }
      this._format = null;
      this._clearFormatClone();
   },

   /**
    * Очищает клон формата полей.
    * @protected
    */
   _clearFormatClone(): void {
      this._formatClone = null;
   },

   /**
    * Возвращает признак, что формат полей был установлен явно
    * @return {Boolean}
    * @protected
    */
   _hasFormat(): boolean {
      return !!this._$format;
   },

   /**
    * Возвращает формат поля с указанным названием
    * @param {String} name Название поля
    * @param {Types/_entity/adapter/ITable|Types/_entity/adapter/IRecord} adapter Адаптер
    * @return {Types/_entity/format/Field|Types/_entity/format/UniversalField}
    * @protected
    */
   _getFieldFormat(name: string, adapter: ITable | IRecord): Field | UniversalField {
      if (this._hasFormat()) {
         const fields = this._getFormat();
         const index = fields.getFieldIndex(name);
         if (index > -1) {
            return fields.at(index);
         }
      }

      return adapter.getSharedFormat(name);
   },

   /**
    * Возвращает тип значения поля по его формату
    * @param {Types/_entity/format/Field|Types/_entity/format/UniversalField} format Формат поля
    * @return {String|Function}
    * @protected
    */
   _getFieldType(format: Field | UniversalField): string | Function {
      let Type = (format as Field).getType ? (format as Field).getType() : format.type;
      if (Type && typeof Type === 'string') {
         if (isRegistered(Type)) {
            Type = resolve(Type);
         }
      }
      return Type;
   },

   /**
    * Строит формат поля по описанию
    * @param {Types/_entity/format/Field|Types/_entity/format/FieldsFactory/FieldDeclaration.typedef} format Описание
    * формата поля
    * @return {Types/_entity/format/Field}
    * @protected
    */
   _buildField(format: Field | IFieldDeclaration): Field {
      if (
         typeof format === 'string' ||
         Object.getPrototypeOf(format) === Object.prototype
      ) {
         format = fieldsFactory(format as IFieldDeclaration);
      }
      if (!format || !(format instanceof Field)) {
         throw new TypeError(`${this._moduleName}: format should be an instance of Types/entity:format.Field`);
      }
      return format;
   },

   /**
    * Строит формат полей по описанию
    * @param {Types/_collection/format/Format|
    * Array.<Types/_entity/format/FieldsFactory/FieldDeclaration.typedef>|
    * Object} format Описание формата (полное либо частичное)
    * @param {Function} fullFormatCallback Метод, возвращающий полный формат
    * @return {Types/_collection/format/Format}
    * @static
    * @protected
    */
   _buildFormat(
      format: format.Format<Field> | IFieldDeclaration[],
      fullFormatCallback?: Function
   ): format.Format<Field> {
      const Format = resolve<any>('Types/collection:format.Format');

      if (format) {
         const formatProto = Object.getPrototypeOf(format);
         if (formatProto === Array.prototype) {
            const factory = resolve<Function>('Types/collection:format.factory');
            // All of the fields in Array
            format = factory(format);
         } else if (formatProto === Object.prototype) {
            // Slice of the fields in Object
            format = buildFormatFromObject(format, fullFormatCallback ? fullFormatCallback() : new Format());
         }
      }

      if (!format || !(format instanceof Format)) {
         format = new Format();
      }

      return format as format.Format<Field>;
   }

   // endregion Protected methods
};

export default FormattableMixin;
