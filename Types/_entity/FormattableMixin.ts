/// <amd-module name="Types/_entity/FormattableMixin" />
/**
 * Миксин, предоставляющий поведение владения форматом полей и доступа к их значениям в сырых данных через адаптер.
 * @mixin Types/Entity/FormattableMixin
 * @public
 * @author Мальцев А.А.
 */

import {Field, fieldsFactory} from './format';
import {Cow as CowAdapter, Json as JsonAdapter} from './adapter';
import di from '../di';
import {object, logger} from '../util';

const defaultAdapter = 'Types/entity:adapter.Json';

/**
 * Строит формат, объединяя частичный формат и формат, построенный по сырым данным
 * @param {Object>} sliceFormat Частичное описание формата
 * @param {Types/Format/Format>} rawDataFormat Формат из сырых данных
 * @return {Types/Format/Format}
 */
function buildFormatFromObject(sliceFormat, rawDataFormat) {
   let field;
   let fieldIndex;
   for (let name in sliceFormat) {
      if (!sliceFormat.hasOwnProperty(name)) {
         continue;
      }

      field = sliceFormat[name];
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
 * @return {Types/Format/Format}
 */
function buildFormatByRawData() {
   const Format = di.resolve('Types/collection:format.Format');
   let format = new Format();
   let adapter = this._getRawDataAdapter();
   let fields = this._getRawDataFields();
   let count = fields.length;

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
function buildRawData() {
   if (this._hasFormat()) {
      let adapter = this._getRawDataAdapter();
      let fields = adapter.getFields();

      if (adapter['[Types/_entity/adapter/IDecorator]']) {
         adapter = adapter.getOriginal();
      }
      //TODO: solve the problem of data normalization
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

const FormattableMixin = /** @lends Types/Entity/FormattableMixin.prototype */{
   '[Types/_entity/FormattableMixin]': true,

   //FIXME: backward compatibility for check via Core/core-instance::instanceOfMixin()
   '[WS.Data/Entity/FormattableMixin]': true,

   /**
    * @cfg {Object} Данные в "сыром" виде.
    * @name Types/Entity/FormattableMixin#rawData
    * @see getRawData
    * @see setRawData
    * @remark
    * Данные должны быть в формате, поддерживаемом адаптером {@link adapter}.
    * Данные должны содержать только примитивные значения или простые массивы (Array) или объекты (Object).
    * @example
    * Создадим новую запись с данными сотрудника:
    * <pre>
    *    require(['Types/Entity/Record'], function (Record) {
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
    *    require(['Types/Collection/RecordSet'], function (RecordSet) {
    *       var characters = new RecordSet({
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

   // {Object} При работе с сырыми данными использовать режим Copy-On-Write.
   _$cow: false,

   /**
    * @cfg {String|Types/Adapter/IAdapter} Адаптер для работы с данными, по умолчанию {@link Types/Adapter/Json}.
    * @name Types/Entity/FormattableMixin#adapter
    * @see getAdapter
    * @see Types/Adapter/Json
    * @see Types/Di
    * @remark
    * Адаптер должен быть предназначен для формата, в котором получены сырые данные {@link rawData}.
    * По умолчанию обрабатываются данные в формате JSON (ключ -> значение).
    * @example
    * Создадим запись с адаптером для данных в формате БЛ СБИС, внедренным в виде названия зарегистрированной зависимости:
    * <pre>
    *    require(['Types/Entity/Record', 'Types/Adapter/Sbis'], function (Record) {
    *       var user = new Record({
    *          adapter: 'Types/entity:adapter.Sbis',
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
    * Создадим запись с адаптером для данных в формате БЛ СБИС, внедренным в виде готового экземпляра:
    * <pre>
    *    require(['Types/Entity/Record', 'Types/Adapter/Sbis'], function (Record, SbisAdapter) {
    *       var user = new Record({
    *          adapter: new SbisAdapter(),
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
    * @cfg {Types/Format/Format|Array.<Types/Format/FieldsFactory/FieldDeclaration.typedef>|Object.<String,String>|Object.<String,Function>|Object.<String,Types/Format/FieldsFactory/FieldDeclaration.typedef>|Object.<String,Types/Format/Field>} Формат всех полей (если задан массивом или экземпляром {@link Types/Format/Format Format}), либо формат отдельных полей (если задан объектом).
    * @name Types/Entity/FormattableMixin#format
    * @see getFormat
    * @remark Правила {@link getFormat формирования формата} в зависимости от типа значения опции:
    * <ul>
    * <li>если формат явно не задан, то он будет построен по сырым данным;
    * <li>если формат задан для части полей (Object), то он будет построен по сырым данным; для полей с совпадающими именами формат будет заменен на явно указанный, формат полей с несовпадающими именами будет добавлен в конец;
    * <li>если формат задан для всех полей (Array или Types/Format/Format), то будет использован именно он, независимо от набора полей в сырых данных.
    * @example
    * Создадим запись с указанием формата полей, внедренным в декларативном виде:
    * <pre>
    *    require(['Types/Entity/Record'], function(Record) {
    *       var user = new Record({
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
    *    //My.Format.User.module.js
    *    define('My.Format.User', [
    *       'Types/Format/Format',
    *       'Types/Format/IntegerField',
    *       'Types/Format/StringField'
    *    ], function(Format, IntegerField, StringField) {
    *       var format = new Format();
    *       format.add(new IntegerField({name: 'id'}));
    *       format.add(new StringField({name: 'login'}));
    *       format.add(new StringField({name: 'email'}));
    *
    *       return format;
    *    });
    *
    *    //Users.js
    *    require([
    *       'Types/Collection/RecordSet',
    *       'My.Format.User'
    *    ], function (RecordSet, userFormat) {
    *       var users = new RecordSet({
    *          format: userFormat
    *       });
    *    });
    * </pre>
    * Создадим запись, для которой зададим формат полей 'id' и 'amount', внедренный в декларативном виде:
    * <pre>
    *    require(['Types/Entity/Record'], function(Record) {
    *       var user = new Record({
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
    *       'Types/Entity/Record',
    *       'Types/Format/MoneyField'
    *    ], function(Record, MoneyField) {
    *       var amountField = new MoneyField({precision: 4}),
    *          user = new Record({
    *             format: {
    *                amount: amountField
    *             }]
    *          });
    *    });
    * </pre>
    * Укажем тип Number для поля "Идентификатор" и тип Date для поля "Время последнего входа" учетной записи пользователя:
    * <pre>
    *    require(['Types/Entity/Record'], function(Record) {
    *       var user = new Record({
    *          format: {
    *             id: Number,
    *             lastLogin: Date
    *          }
    *       });
    *    });
    * </pre>
    * Внедрим рекордсет со своей моделью в одно из полей записи:
    * <pre>
    *    //ActivityModel.js
    *    require('MyApplication/Models/ActivityModel', [
    *       'Types/Entity/Model'
    *    ], function(Model) {
    *       return Model.extend({
    *          //...
    *       });
    *    });
    *
    *    //ActivityRecordSet.js
    *    require('MyApplication/ViewModels/ActivityRecordSet', [
    *       'Types/Collection/RecordSet'
    *       'MyApplication/Models/ActivityModel'
    *    ], function(RecordSet, ActivityModel) {
    *       return RecordSet.extend({
    *          _$model: ActivityModel
    *       });
    *    });
    *
    *    //ActivityController.js
    *    require('MyApplication/Controllers/ActivityController', [
    *       'Types/Entity/Record'
    *       'MyApplication/ViewModels/ActivityRecordSet'
    *    ], function(Record, ActivityRecordSet) {
    *       var user = new Record({
    *          format: {
    *             activity: ActivityRecordSet
    *          }
    *       });
    *       //...
    *    });
    * </pre>
    * Создадим запись заказа в магазине с полем типа "рекордсет", содержащим список позиций. Сырые данные будут в формате БЛ СБИС:
    * <pre>
    *    require([
    *       'Types/Entity/Record',
    *       'Types/Collection/RecordSet',
    *       'Types/Adapter/Sbis'
    *    ], function (Record, RecordSet) {
    *       var order = new Record({
    *             adapter: 'Types/entity:adapter.Sbis',
    *             format:[{
    *                name: 'id',
    *                type: 'integer',
    *                defaultValue: 0
    *             }, {
    *                name: 'items',
    *                type: 'recordset'
    *             }]
    *          }),
    *          orderItems = new RecordSet({
    *             adapter: 'Types/entity:adapter.Sbis',
    *             format: [{
    *                name: 'goods_id',
    *                type: 'integer',
    *                defaultValue: 0
    *             },{
    *                name: 'price',
    *                type: 'real',
    *                defaultValue: 0
    *             },{
    *               name: 'count',
    *               type: 'integer',
    *               defaultValue: 0
    *             }]
    *          });
    *
    *       order.set('items', orderItems);
    *    });
    * </pre>
    * Формат поля для массива значений смотрите в описании {@link Types/Format/ArrayField}.
    */
   _$format: null,

   /**
    * @member {Types/Format/Format} Формат полей (собранный из опции format или в результате манипуляций)
    */
   _format: null,

   /**
    * @member {Types/Format/Format} Клон формата полей (для кэшеирования результата getFormat())
    */
   _formatClone: null,

   /**
    * @member {Types/Adapter/ITable|Types/Adapter/IRecord} Адаптер для данных в "сыром" виде
    */
   _rawDataAdapter: null,

   /**
    * @member {Array.<String>} Описание всех полей, полученных из данных в "сыром" виде
    */
   _rawDataFields: null,

   constructor() {
      //FIXME: get rid of _options
      if (!this._$format && this._options && this._options.format) {
         this._$format = this._options.format;
      }

      buildRawData.call(this);
   },

   //region Types/Entity/SerializableMixin

   _getSerializableState(state) {
      state.$options.rawData = this._getRawData();
      return state;
   },

   _setSerializableState(state?) {
      return function() {};
   },

   //endregion Types/Entity/SerializableMixin

   //region Public methods

   /**
    * Возвращает данные в "сыром" виде. Если данные являются объектом, то возвращается его дубликат.
    * @return {Object}
    * @see setRawData
    * @see rawData
    * @example
    * Получим сырые данные статьи:
    * <pre>
    *    require(['Types/Entity/Record'], function (Record) {
    *       var data = {id: 1, title: 'Article 1'},
    *          article = new Record({
    *             rawData: data
    *        });
    *
    *       console.log(article.getRawData());// {id: 1, title: 'Article 1'}
    *       console.log(article.getRawData() === data);// false
    *       console.log(JSON.stringify(article.getRawData()) === JSON.stringify(data));// true
    *    });
    * </pre>
    */
   getRawData(shared) {
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
    *    require(['Types/Entity/Record'], function (Record) {
    *       var article = new Record();
    *       article.setRawData({id: 1, title: 'Article 1'});
    *       console.log(article.get('title'));// Article 1
    *    });
    * </pre>
    */
   setRawData(data) {
      this._resetRawDataAdapter(data);
      this._resetRawDataFields();
      this._clearFormatClone();
      buildRawData.call(this);
   },

   /**
    * Возвращает адаптер для работы с данными в "сыром" виде.
    * @return {Types/Adapter/IAdapter}
    * @see adapter
    * @example
    * Проверим, что по умолчанию используется адаптер для формата JSON:
    * <pre>
    *    require(['Types/Entity/Record', 'Types/Adapter/Json'], function (Record, JsonAdapter) {
    *       var article = new Record();
    *       console.log(article.getAdapter() instanceof JsonAdapter);// true
    *    });
    * </pre>
    */
   getAdapter() {
      let adapter = this._getAdapter();
      if (adapter['[Types/_entity/adapter/IDecorator]']) {
         adapter = adapter.getOriginal();
      }
      return adapter;
   },

   /**
    * Возвращает формат полей (в режиме только для чтения)
    * @return {Types/Format/Format}
    * @see format
    * @example
    * Получим формат, сконструированный из декларативного описания:
    * <pre>
    *    require(['Types/Entity/Record'], function (Record) {
    *       var article = new Record({
    *             format: [
    *                {name: 'id', type: 'integer'},
    *                {name: 'title', type: 'string'}
    *             ]
    *          }),
    *          format = article.getFormat();
    *
    *       console.log(format.at(0).getName());// 'id'
    *       console.log(format.at(1).getName());// 'title'
    *    });
    * </pre>
    * Получим формат, сконструированный из сырых данных:
    * <pre>
    *    require(['Types/Entity/Record'], function (Record) {
    *       var article = new Record({
    *             rawData: {
    *                id: 1,
    *                title: 'What About Livingstone'
    *             }
    *          }),
    *          format = article.getFormat();
    *
    *       console.log(format.at(0).getName());// 'id'
    *       console.log(format.at(1).getName());// 'title'
    *    });
    * </pre>
    */
   getFormat(shared) {
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
    * @param {Types/Format/Field|Types/Format/FieldsFactory/FieldDeclaration.typedef} format Формат поля.
    * @param {Number} [at] Позиция поля.
    * @see format
    * @see removeField
    * @example
    * Добавим поля в виде декларативного описания:
    * <pre>
    *    require(['Types/Entity/Record'], function (Record) {
    *       var record = new Record();
    *       record.addField({name: 'login', type: 'string'});
    *       record.addField({name: 'amount', type: 'money', precision: 3});
    *    });
    * </pre>
    * Добавим поля в виде экземпляров:
    * <pre>
    *    require([
    *       'Types/Collection/RecordSet',
    *       'Types/Format/StringField',
    *       'Types/Format/MoneyField'
    *    ], function (RecordSet, StringField, MoneyField) {
    *       var recordset = new RecordSet();
    *       recordset.addField(new StringField({name: 'login'}));
    *       recordset.addField(new MoneyField({name: 'amount', precision: 3}));
    *    });
    * </pre>
    */
   addField(format, at) {
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
   removeField(name) {
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
   removeFieldAt(at) {
      this._$format = this._getFormat(true);
      this._$format.removeAt(at);
      this._getRawDataAdapter().removeFieldAt(at);
      this._resetRawDataFields();
      this._clearFormatClone();
   },

   //endregion Public methods

   //region Protected methods

   /**
    * Возвращает данные в "сыром" виде из _rawDataAdapter (если он был создан) или исходные
    * @param {Boolean} [direct=false] Напрямую, не используя адаптер
    * @return {Object}
    * @protected
    */
   _getRawData(direct) {
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
   _getDefaultAdapter() {
      return defaultAdapter;
   },

   /**
    * Возвращает адаптерр для сырых данных
    * @return {Types/Adapter/IAdapter}
    * @protected
    */
   _getAdapter() {
      if (
         this._$adapter === defaultAdapter &&
         FormattableMixin._getDefaultAdapter !== this._getDefaultAdapter
      ) {
         this._$adapter = this._getDefaultAdapter();
      }

      if (this._$adapter && !(this._$adapter instanceof Object)) {
         this._$adapter = di.create(this._$adapter);
      }

      if (this._$cow && !this._$adapter['[Types/_entity/adapter/IDecorator]']) {
         this._$adapter = new CowAdapter(this._$adapter);
      }

      return this._$adapter;
   },

   /**
    * Возвращает адаптер для сырых данных заданного вида
    * @return {Types/Adapter/ITable|Types/Adapter/IRecord}
    * @protected
    */
   _getRawDataAdapter() {
      if (!this._rawDataAdapter) {
         this._rawDataAdapter = this._createRawDataAdapter();
      }

      return this._rawDataAdapter;
   },

   /**
    * Создает адаптер для сырых данных
    * @return {Types/Adapter/ITable|Types/Adapter/IRecord}
    * @protected
    */
   _createRawDataAdapter() {
      throw new Error('Method must be implemented');
   },

   /**
    * Сбрасывает адаптер для сырых данных
    * @param {*} [data] Сырые данные
    * @protected
    */
   _resetRawDataAdapter(data) {
      if (data === undefined) {
         if (this._rawDataAdapter && typeof this._$rawData !== 'function') {
            //Save possible rawData changes
            this._$rawData = this._rawDataAdapter.getData();
         }
      } else {
         this._$rawData = data;
      }

      this._rawDataAdapter = null;
   },

   /**
    * Проверяет совместимость адаптеров
    * @param {Types/Adapter/IAdapter} foreign Адаптер внешнего объекта
    * @protected
    */
   _checkAdapterCompatibility(foreign) {
      let internal = this._getAdapter();

      if (foreign['[Types/_entity/adapter/IDecorator]']) {
         foreign = foreign.getOriginal();
      }
      if (internal['[Types/_entity/adapter/IDecorator]']) {
         internal = internal.getOriginal();
      }

      let internalProto = Object.getPrototypeOf(internal);
      if (!internalProto.isPrototypeOf(foreign)) {
         throw new TypeError(`The foreign adapter "${foreign._moduleName}" is incompatible with the internal adapter "${internal._moduleName}"`);
      }
   },

   /**
    * Возвращает список полей записи, полученный из "сырых" данных
    * @return {Array.<String>}
    * @protected
    */
   _getRawDataFields() {
      return this._rawDataFields || (this._rawDataFields = this._getRawDataAdapter().getFields());
   },

   /**
    * Добавляет поле в список полей
    * @param {String} name Название поля
    * @protected
    */
   _addRawDataField(name) {
      this._getRawDataFields().push(name);
   },

   /**
    * Сбрасывает список полей записи, полученный из "сырых" данных
    * @protected
    */
   _resetRawDataFields() {
      this._rawDataFields = null;
   },

   /**
    * Возвращает формат полей
    * @param {Boolean} [build=false] Принудительно создать, если не задан
    * @return {Types/Format/Format}
    * @protected
    */
   _getFormat(build) {
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
   _clearFormat() {
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
   _clearFormatClone() {
      this._formatClone = null;
   },

   /**
    * Возвращает признак, что формат полей был установлен явно
    * @return {Boolean}
    * @protected
    */
   _hasFormat() {
      return !!this._$format;
   },

   /**
    * Возвращает формат поля с указанным названием
    * @param {String} name Название поля
    * @param {Types/Adapter/ITable|Types/Adapter/IRecord} adapter Адаптер
    * @return {Types/Format/Field|Types/Format/UniversalField}
    * @protected
    */
   _getFieldFormat(name, adapter) {
      if (this._hasFormat()) {
         let fields = this._getFormat();
         let index = fields.getFieldIndex(name);
         if (index > -1) {
            return fields.at(index);
         }
      }

      return adapter.getSharedFormat(name);
   },

   /**
    * Возвращает тип значения поля по его формату
    * @param {Types/Format/Field|Types/Format/UniversalField} format Формат поля
    * @return {String|Function}
    * @protected
    */
   _getFieldType(format) {
      let Type = format.getType ? format.getType() : format.type;
      if (Type && typeof Type === 'string') {
         if (di.isRegistered(Type)) {
            Type = di.resolve(Type);
         }
      }
      return Type;
   },

   /**
    * Строит формат поля по описанию
    * @param {Types/Format/Field|Types/Format/FieldsFactory/FieldDeclaration.typedef} format Описание формата поля
    * @return {Types/Format/Field}
    * @protected
    */
   _buildField(format) {
      if (
         typeof format === 'string' ||
         Object.getPrototypeOf(format) === Object.prototype
      ) {
         format = fieldsFactory(format);
      }
      if (!format || !(format instanceof Field)) {
         throw new TypeError(`${this._moduleName}: format should be an instance of Types/entity:format.Field`);
      }
      return format;
   },

   /**
    * Строит формат полей по описанию
    * @param {Types/Format/Format|Array.<Types/Format/FieldsFactory/FieldDeclaration.typedef>|Object} format Описание формата (полное либо частичное)
    * @param {Function} fullFormatCallback Метод, возвращающий полный формат
    * @return {Types/Format/Format}
    * @static
    * @protected
    */
   _buildFormat(format, fullFormatCallback?: Function) {
      const Format = di.resolve('Types/collection:format.Format');

      if (format) {
         let formatProto = Object.getPrototypeOf(format);
         if (formatProto === Array.prototype) {
            let factory = di.resolve('Types/collection:format.factory');
            //All of the fields in Array
            format = factory(format);
         } else if (formatProto === Object.prototype) {
            //Slice of the fields in Object
            format = buildFormatFromObject(format, fullFormatCallback ? fullFormatCallback() : new Format());
         }
      }

      if (!format || !(format instanceof Format)) {
         format = new Format();
      }

      return format;
   }

   //endregion Protected methods
};

export default FormattableMixin;
