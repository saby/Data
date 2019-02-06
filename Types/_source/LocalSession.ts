/// <amd-module name="Types/_source/LocalSession" />
/**
 * Общий локальный источник данных для всех вкладок.
 * Источник позволяет хранить данные в локальной сессии браузера.
 * Во всех вкладках будут одни и те же данные.
 *
 * @class Types/_source/LocalSession
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_source/ICrud
 * @implements Types/_source/ICrudPlus
 * @implements Types/_source/IData
 * @mixes Types/_entity/OptionsMixin
 * @author Санников Кирилл
 * @public
 * @example
 * Создадим источник со списком объектов солнечной системы:
 * <pre>
 *    var solarSystem = new LocalSession({
 *       data: [
 *          {id: '1', name: 'Sun', kind: 'Star'},
 *          {id: '2', name: 'Mercury', kind: 'Planet'},
 *          {id: '3', name: 'Venus', kind: 'Planet'},
 *          {id: '4', name: 'Earth', kind: 'Planet'},
 *          {id: '5', name: 'Mars', kind: 'Planet'},
 *          {id: '6', name: 'Jupiter', kind: 'Planet'},
 *          {id: '7', name: 'Saturn', kind: 'Planet'},
 *          {id: '8', name: 'Uranus', kind: 'Planet'},
 *          {id: '9', name: 'Neptune', kind: 'Planet'},
 *          {id: '10', name: 'Pluto', kind: 'Dwarf planet'}
 *       ],
 *       idProperty: 'id'
 *    });
 * </pre>
 */

import ICrud from './ICrud';
import ICrudPlus from './ICrudPlus';
import IData from './IData';
import Query from './Query';
import DataSet from './DataSet';
import {DestroyableMixin, Record, Model, OptionsToPropertyMixin, ReadWriteMixin, adapter as libAdapter} from '../entity';
import {RecordSet} from '../collection';
import {create, register} from '../di';
import {mixin, object} from '../util';
import {merge} from '../object';
// @ts-ignore
import Deferred = require('Core/Deferred');
// @ts-ignore
import { LocalStorage } from 'Browser/Storage';

const DATA_FIELD_PREFIX = 'd';
const KEYS_FIELD = 'i';
const ID_COUNT = 'k';

function initJsonData(source, data) {
   let item;
   let itemId;
   let key;
   for (let i = 0; i < data.length; i++) {
      item = data[i];
      itemId = item[source.getIdProperty()];
      key = itemId === undefined ? source.rawManager.reserveId() : itemId;
      source.rawManager.set(key, item);
   }
}

function isJsonAdapter(instance) {
   if (typeof instance === 'string') {
      return instance.indexOf('Types/entity:adapter.Json') > -1 || instance.indexOf('adapter.json') > -1;
   }

   return instance instanceof libAdapter.Json;
}

function itemToObject(item, adapter) {
   if (!item) {
      return {};
   }

   let record = item;
   let isRecord = item && item instanceof Record;

   if (!isRecord && isJsonAdapter(adapter)) {
      return item;
   }

   if (!isRecord) {
      record = new Record({
         adapter: adapter,
         rawData: item
      });
   }

   let data = {};
   let enumerator = record.getEnumerator();
   while (enumerator.moveNext()) {
      let key = enumerator.getCurrent();
      data[key] = record.get(key);
   }

   return data;
}

interface IOptions {
   prefix: string
   data: string
}

class WhereTokenizer {
   query: RegExp = /(\w+)([!><=]*)/;

   tokinize(key: string): IToken {
      let m = key.match(this.query);
      m.shift();

      let op;
      if (m.length > 1) {
         op = m.pop();
      }

      let fn;
      switch (op) {
         case '<':
            fn = WhereTokenizer.lt;
            break;
         case '<=':
            fn = WhereTokenizer.le;
            break;
         case '>':
            fn = WhereTokenizer.gt;
            break;
         case '>=':
            fn = WhereTokenizer.ge;
            break;
         case '!=':
            fn = WhereTokenizer.ne;
            break;
         case '<>':
            fn = WhereTokenizer.ne;
            break;
         default:
            fn = WhereTokenizer.eq;
      }
      return {
         field: m[0],
         op: fn
      };
   }

   static eq(field, val): boolean {
      if (!(val instanceof Array)) {
         return field == val;
      }
      return val.indexOf(field) !== -1;
   }

   static ne(field, val): boolean {
      return field != val;
   }

   static lt(field, val): boolean {
      return field < val;
   }

   static le(field, val): boolean {
      return field <= val;
   }

   static gt(field, val): boolean {
      return field > val;
   }

   static ge(field, val): boolean {
      return field >= val;
   }
}

interface IToken {
   field: string,
   op: (field: any, val: any) => boolean
}

class LocalQuery {
   query: any;
   tokenizer: WhereTokenizer = new WhereTokenizer();

   constructor(query) {
      this.query = query;
   }

   select(items) {
      let fields = this.query.getSelect();
      if (Object.keys(fields).length === 0) {
         return items;
      }
      return items.map((item) => {
         let res = {};
         let name;
         for (let i = 0; i < fields.length; i++) {
            name = fields[i];
            res[name] = item[name];
         }
         return res;
      });
   }

   where(items) {
      let where = this.query.getWhere();
      let conditions = [];
      let adapter = new libAdapter.Json();

      if (typeof where === 'function') {
         return items.filter((item, i) => {
            return where(adapter.forRecord(item), i);
         });
      }

      for (let key in where) {
         if (!where.hasOwnProperty(key)) {
            continue;
         }
         if (where[key] === undefined) {
            continue;
         }
         let token = this.tokenizer.tokinize(key);
         if (token === undefined) {
            return [];
         }
         conditions.push({field: token.field, op: token.op, value: where[key]});
      }
      return items.filter((item) => {
         for (let i = 0; i < conditions.length; i++) {
            let token = conditions[i];
            if (item[token.field] instanceof Array) {
               let trigger = false;
               for (let j = 0, field = item[token.field]; j < field.length; j++) {
                  trigger = token.op(field, token.value);
               }
               return trigger;
            }

            if (!token.op(item[token.field], token.value)) {
               return false;
            }
         }
         return true;
      });
   }

   order(items) {
      let orders = this.query.getOrderBy();
      if (orders.length > 0) {
         return LocalQuery.orderBy(items, orders);
      }
      return items;
   }

   offset(items) {
      if (!this.query.getOffset()) {
         return items;
      }
      return items.slice(this.query.getOffset());
   }

   limit(items) {
      if (this.query.getLimit() === undefined) {
         return items;
      }
      return items.slice(0, this.query.getLimit());
   }

   static orderBy(items, orders) {
      let data = items;

      function compare(a, b) {
         if (a === null && b !== null) {
            //Считаем null меньше любого не-null
            return -1;
         }
         if (a !== null && b === null) {
            //Считаем любое не-null больше null
            return 1;
         }
         if (a === b) {
            return 0;
         }
         return a > b ? 1 : -1;
      }

      data.sort((a, b) => {
         let result = 0;
         for (let i = 0; i < orders.length; i++) {
            let order = orders[i];
            let direction = order.getOrder() ? -1 : 1;
            let selector = order.getSelector();
            result = direction * compare(a[selector], b[selector]);
            if (result !== 0) {
               break;
            }
         }
         return result;
      });
      return data;
   }
}

class RawManager {
   ls: LocalStorage;

   constructor(ls) {
      this.ls = ls;
      let count = this.getCount();
      if (count === null) {
         this.setCount(0);
      }
      let keys = this.getKeys();
      if (keys === null) {
         this.setKeys([]);
      }
   }

   get(key) {
      return this.ls.getItem(DATA_FIELD_PREFIX + key);
   }

   set(key, data) {
      let count = this.getCount() + 1;
      let keys = this.getKeys();
      if (keys.indexOf(key) === -1) {
         keys.push(key);
         this.setKeys(keys);
         this.setCount(count);
      }
      return this.ls.setItem(DATA_FIELD_PREFIX + key, data);
   }

   move(sourceItems, to, meta) {
      let keys = this.getKeys();
      let toIndex;
      sourceItems.forEach((id) => {
         let index = keys.indexOf(id);
         keys.splice(index, 1);
      });
      if (to !== null) {
         toIndex = keys.indexOf(to);
         if (toIndex === -1) {
            return Deferred.fail('Record "to" with key ' + to + ' is not found.');
         }
      }
      let shift = meta && (meta.before || meta.position === 'before') ? 0 : 1;
      sourceItems.forEach((id, index) => {
         keys.splice(toIndex + shift + index, 0, id);
      });
      this.setKeys(keys);
   }

   remove(keys) {
      let count;
      if (!(keys instanceof Array)) {
         count = this.getCount();
         this.removeFromKeys(keys);
         this.setCount(count - 1);
         return this.ls.removeItem(DATA_FIELD_PREFIX + keys);
      }
      for (let i = 0; i < keys.length; i++) {
         let key = keys[i];
         count = this.getCount();
         this.setCount(count - 1);
         this.ls.removeItem(DATA_FIELD_PREFIX + key);
      }
      this.removeFromKeys(keys);
      return true;
   }

   removeFromKeys(keys) {
      let ks;
      if (keys instanceof Array) {
         ks = keys;
      } else {
         ks = [keys];
      }
      let data = this.getKeys();
      for (let i = 0; i < ks.length; i++) {
         let key = ks[i];
         let index = data.indexOf(key);
         if (index === -1) {
            continue;
         }
         data.splice(index, 1);
      }
      this.setKeys(data);
   }

   getCount(): number {
      return this.ls.getItem(ID_COUNT);
   }

   setCount(number: number) {
      this.ls.setItem(ID_COUNT, number);
   }

   getKeys() {
      return this.ls.getItem(KEYS_FIELD);
   }

   setKeys(keys) {
      this.ls.setItem(KEYS_FIELD, keys);
   }

   /**
    * Проверка существования ключей
    * @param {String|Array<String>} keys Значение ключа или ключей
    * @return {Boolean} true, если все ключи существуют, иначе false
    */
   existKeys(keys) {
      let existedKeys = this.getKeys();
      if (existedKeys.length === 0) {
         return false;
      }

      if (keys instanceof Array) {
         for (let i = 0; i < keys.length; i++) {
            if (existedKeys.indexOf(keys[i]) <= -1) {
               return false;
            }
         }
         return true;
      }

      return (existedKeys.indexOf(keys) > -1);
   }

   reserveId() {
      function genId() {
         function str() {
            return Math.floor((1 + Math.random()) * 0x1d0aa0)
               .toString(32)
               .substring(1);
         }
         return str() + str() + '-' + str() + '-' + str() + '-' + str() + '-' + str() + str();
      }

      let lastId;
      do {
         lastId = genId();
      } while (this.existKeys(lastId));

      return lastId;
   }
}

class ModelManager {
   adapter: string;
   idProperty: string;

   constructor(adapter, idProperty) {
      this.adapter = adapter;
      this.idProperty = idProperty;
   }

   get(data) {
      data = object.clonePlain(data, true);
      switch (this.adapter) {
         case 'Types/entity:adapter.RecordSet':
         case 'adapter.recordset':
            return new Model({
               rawData: new Record({rawData: data}),
               adapter: create(this.adapter),
               idProperty: this.idProperty
            });

         case 'Types/entity:adapter.Sbis':
         case 'adapter.sbis':
            return this.sbis(data);

         default:
            return new Model({
               rawData: data,
               adapter: create(this.adapter),
               idProperty: this.idProperty
            });
      }
   }

   sbis(data) {
      let rec = new Record({rawData: data});
      let format = rec.getFormat();
      let enumerator = rec.getEnumerator();

      let model = new Model({
         format: format,
         adapter: create(this.adapter),
         idProperty: this.idProperty
      });

      while (enumerator.moveNext()) {
         let key = enumerator.getCurrent();
         model.set(key, rec.get(key));
      }
      return model;
   }
}

class Converter {
   adapter: string;
   idProperty: string;
   modelManager: ModelManager;

   constructor (adapter, idProperty, modelManager) {
      this.adapter = adapter;
      this.idProperty = idProperty;
      this.modelManager = modelManager;
   }

   get(data) {
      data = object.clonePlain(data, true);
      switch (this.adapter) {
         case 'Types/entity:adapter.RecordSet':
         case 'adapter.recordset':
            return this.recordSet(data);
         case 'Types/entity:adapter.Sbis':
         case 'adapter.sbis':
            return this.sbis(data);
         default:
            return data;
      }
   }

   recordSet(data) {
      let _data = [];
      if (data.length === 0) {
         return new RecordSet({
            rawData: _data,
            idProperty: this.idProperty
         });
      }

      for (let i = 0; i < data.length; i++) {
         let item = data[i];
         let model = this.modelManager.get(item);
         _data.push(model);
      }
      return new RecordSet({
         rawData: _data,
         idProperty: this.idProperty
      });
   }

   sbis(data) {
      if (data.length === 0) {
         return data;
      }
      let rs = new RecordSet({
         adapter: this.adapter
      });

      let format = new Record({rawData: data[0]}).getFormat();

      for (let j = 0; j < data.length; j++) {
         let item = data[j],
            rec = new Record({
               format: format,
               adapter: this.adapter
            }),
            enumerator = rec.getEnumerator();
         while (enumerator.moveNext()) {
            let key = enumerator.getCurrent();
            rec.set(key, item[key]);
         }
         rs.add(rec);
      }

      return rs.getRawData();
   }
}

export default class LocalSession extends mixin(
   DestroyableMixin, OptionsToPropertyMixin
) implements ICrud, ICrudPlus, IData /** @lends Types/_source/LocalSession.prototype */{
   protected _writable: boolean;

   /**
    * Конструктор модуля, реализующего DataSet
    */
   protected _dataSetModule: string | Function;

   /**
    * @cfg {String|Types/_entity/adapter/IAdapter} Адаптер для работы с форматом данных, выдаваемых источником. По умолчанию {@link Types/_entity/adapter/Json}.
    */
   protected _$adapter: string | libAdapter.IAdapter;

   /**
    * @cfg {String|Function} Конструктор рекордсетов, порождаемых источником данных. По умолчанию {@link Types/_collection/RecordSet}.
    * @name Types/_source/LocalSession#listModule
    * @see getListModule
    * @see Types/_collection/RecordSet
    * @see Types/di
    * @example
    * Конструктор рекордсета, внедренный в виде названия зарегистрированной зависимости:
    * <pre>
    *    var Users = RecordSet.extend({
    *         getAdministrators: function() {
    *         }
    *      });
    *    Di.register('app.collections.users', Users);
    *    var dataSource = new LocalSession({
    *         listModule: 'app.collections.users'
    *      });
    * </pre>
    */
   protected _$listModule: string | Function;

   /**
    * @cfg {String|Function} Конструктор записей, порождаемых источником данных. По умолчанию {@link Types/_entity/Model}.
    * @name Types/_source/LocalSession#model
    * @see getModel
    * @see Types/_entity/Model
    * @see Types/di
    * @example
    * Конструктор пользовательской модели, внедренный в виде названия зарегистрированной зависимости:
    * <pre>
    *    var User = Model.extend({
    *         identify: function(login, password) {
    *         }
    *      });
    *    Di.register('app.model.user', User);
    *
    *    var dataSource = new LocalSession({
    *         model: 'app.model.user'
    *      });
    * </pre>
    */
   protected _$model: string | Function;

   /**
    * @cfg {String} Название свойства записи, содержащего первичный ключ.
    * @name Types/_source/LocalSession#idProperty
    * @see getIdProperty
    * @example
    * Установим свойство 'primaryId' в качестве первичного ключа:
    * <pre>
    *    var dataSource = new LocalSession({
    *       idProperty: 'primaryId'
    *    });
    * </pre>
    */
   protected _$idProperty: string;

   /**
    * Свойство данных, в котором лежит основная выборка
    */
   protected _dataSetItemsProperty: string;

   /**
    * Свойство данных, в котором лежит общее кол-во строк, выбранных запросом
    */
   protected _dataSetMetaProperty: string;

   protected _options: any;

   constructor(options?: any) {
      super();

      if (!('prefix' in options)) {
         throw new Error('"prefix" not found in options.');
      }
      if (!('idProperty' in options)) {
         throw new Error('"idProperty" not found in options.');
      }

      OptionsToPropertyMixin.call(this, options);

      this.rawManager = new RawManager(new LocalStorage(options.prefix));
      this.modelManager = new ModelManager(this._$adapter, this._$idProperty);
      this.converter = new Converter(this._$adapter, this._$idProperty, this.modelManager);

      this._initData(options.data);
   }

   ///region {ICrud}

   readonly '[Types/_source/ICrud]': boolean = true;

   /**
    * Создает пустую запись через источник данных (при этом она не сохраняется в хранилище)
    * @param {Object|Types/_entity/Record} [meta] Дополнительные мета данные, которые могут понадобиться для создания модели
    * @return {Core/Deferred} Асинхронный результат выполнения. В колбэке придет {@link Types/_entity/Model}.
    * @see Types/_entity/Model
    * @example
    * Создадим новый объект:
    * <pre>
    *    solarSystem.create(
    *       {id: '11', name: 'Moon', 'kind': 'Satellite'}
    *    ).addCallback(function(satellite) {
    *       satellite.get('name');//'Moon'
    *    });
    * </pre>
    */
   create(meta) {
      let item = itemToObject(meta, this._$adapter);
      if (item[this.getIdProperty()] === undefined) {
         this.rawManager.reserveId();
      }
      return Deferred.success(this.modelManager.get(item));
   }

   /**
    * Читает модель из источника данных
    * @param {String|Number} key Первичный ключ модели
    * @return {Core/Deferred} Асинхронный результат выполнения. В колбэке придет
    * @see Types/_entity/Model
    * Прочитаем данные о Солнце:
    * <pre>
    *    solarSystem.read(1).addCallback(function(star) {
    *        star.get('name');//'Sun'
    *     });
    * </pre>
    */
   read(key) {
      let data = this.rawManager.get(key);
      if (data) {
         return Deferred.success(this.modelManager.get(data));
      }
      return Deferred.fail('Record with key "' + key + '" does not exist');
   }

   /**
    *
    * Обновляет модель в источнике данных
    * @param {Types/_entity/Model|Types/_collection/RecordSet} data Обновляемая запись или рекордсет
    * @return {Core/Deferred} Асинхронный результат выполнения
    * @example
    * Вернем Плутону статус планеты:
    * <pre>
    *    var pluto = new Model({
    *          idProperty: 'id'
    *       });
    *    pluto.set({
    *       id: '10',
    *       name: 'Pluto',
    *       kind: 'Planet'
    *    });
    *
    *    solarSystem.update(pluto).addCallback(function() {
    *       alert('Pluto is a planet again!');
    *    });
    * </pre>
    */
   update(data) {
      let updateRecord = (record) => {
         let key;
         let idProperty = record.getIdProperty ? record.getIdProperty() : this.getIdProperty();

         try {
            key = record.get(idProperty);
         } catch (e) {
            return Deferred.fail('Record idProperty doesn\'t exist');
         }

         if (key === undefined) {
            key = this.rawManager.reserveId();
         }

         record.set(idProperty, key);
         let item = itemToObject(record, this._$adapter);
         this.rawManager.set(key, item);
         record.acceptChanges();

         return key;
      };

      let keys = [];
      if (data instanceof RecordSet) {
         data.each((record) => {
            keys.push(updateRecord(record));
         });
      } else {
         keys.push(updateRecord(data));
      }

      return Deferred.success(keys);
   }

   /**
    *
    * Удаляет модель из источника данных
    * @param {String|Array} keys Первичный ключ, или массив первичных ключей модели
    * @return {Core/Deferred} Асинхронный результат выполнения
    * @example
    * Удалим Марс:
    * <pre>
    *    solarSystem.destroy('5').addCallback(function() {
    *       alert('Mars deleted!');
    *    });
    * </pre>
    */
   destroy(keys) {
      let isExistKeys = this.rawManager.existKeys(keys);
      if (!isExistKeys) {
         return Deferred.fail('Not all keys exist');
      }
      this.rawManager.remove(keys);
      return Deferred.success(true);
   }

   /**
    * Выполняет запрос на выборку
    * @param {Types/_source/Query} [query] Запрос
    * @return {Core/Deferred} Асинхронный результат выполнения. В колбэке придет {@link Types/_source/DataSet}.
    * @see Types/_source/Query
    * @see Types/_source/DataSet
    * @example
    * <pre>
    *   solarSystem.query().addCallbacks(function (ds) {
    *      console.log(ds.getAll().at(0));
    *   });
    * </pre>
    */
   query(query) {
      if (query === void 0) {
         query = new Query();
      }
      let data = [];
      let keys = this.rawManager.getKeys();
      for (let i = 0; i < keys.length; i++) {
         data.push(this.rawManager.get(keys[i]));
      }

      let lq = new LocalQuery(query);
      data = lq.order(data);
      data = lq.where(data);
      data = lq.offset(data);
      data = lq.limit(data);
      data = lq.select(data);

      return Deferred.success(this._getDataSet({
         items: this.converter.get(data),
         meta: {
            total: data.length
         }
      }));
   }

   ///endregion

   ///region ICrudPlus

   readonly '[Types/_source/ICrudPlus]': boolean = true;

   /**
    * Объединяет одну модель с другой
    * @param {String} from Первичный ключ модели-источника (при успешном объедининии модель будет удалена)
    * @param {String} to Первичный ключ модели-приёмника
    * @return {Core/Deferred} Асинхронный результат выполнения
    * @example
    * <pre>
    *  solarSystem.merge('5','6')
    *     .addCallbacks(function () {
    *         alert('Mars became Jupiter!');
    *     })
    * </pre>
    */
   merge(from, to) {
      let fromData = this.rawManager.get(from);
      let toData = this.rawManager.get(to);
      if (fromData === null || toData === null) {
         return Deferred.fail('Record with key ' + from + ' or ' + to + ' isn\'t exists');
      }
      let data = merge(fromData, toData);
      this.rawManager.set(from, data);
      this.rawManager.remove(to);
      return Deferred.success(true);
   }

   /**
    * Создает копию модели
    * @param {String} key Первичный ключ модели
    * @return {Core/Deferred} Асинхронный результат выполнения. В колбэке придет {@link Types/_entity/Model копия модели}.
    * @example
    * <pre>
    *   solarSystem.copy('5').addCallbacks(function (copy) {
    *      console.log('New id: ' + copy.getId());
    *   });
    * </pre>
    */
   copy(key) {
      let myId = this.rawManager.reserveId();
      let from = this.rawManager.get(key);
      if (from === null) {
         return Deferred.fail('Record with key ' + from + ' isn\'t exists');
      }
      let to = merge({}, from);
      this.rawManager.set(myId, to);
      return Deferred.success(this.modelManager.get(to));
   }

   /**
    * Производит перемещение записи.
    * @param {Array} from Перемещаемая модель.
    * @param {String} to Идентификатор целевой записи, относительно которой позиционируются перемещаемые.
    * @param {MoveMetaConfig} [meta] Дополнительные мета данные.
    * @return {Core/Deferred} Асинхронный результат выполнения.
    * @example
    * <pre>
    * var ls = new LocalStorage('mdl_solarsystem');
    * solarSystem.move('6','3',{position: 'after'})
    *    .addCallbacks(function () {
    *       console.log(ls.getItem('i')[3] === '6');
    *    })
    * </pre>
    */
   move(from, to, meta) {
      let keys = this.rawManager.getKeys();
      let sourceItems = [];
      if (!(from instanceof Array)) {
         from = [from];
      }
      from.forEach((id) => {
         let index = keys.indexOf(id);
         if (index === -1) {
            return Deferred.fail('Record "from" with key ' + from + ' is not found.');
         }
         sourceItems.push(id);
      });
      if (meta.position === 'on') {
         return Deferred.success(this._hierarchyMove(sourceItems, to, meta, keys));
      }
      return Deferred.success(this.rawManager.move(sourceItems, to, meta));
   }

   ///endregion

   ///region {IData}

   readonly '[Types/_source/IData]': boolean = true;

   getIdProperty() {
      return this._$idProperty;
   }

   setIdProperty(name: string) {
      throw new Error('Method is not supported');
   }

   getAdapter() {
      return create(this._$adapter);
   }

   getListModule() {
      return this._$listModule;
   }

   setListModule(listModule) {
      this._$listModule = listModule;
   }

   getModel() {
      return this._$model;
   }

   setModel(model) {
      this._$model = model;
   }

   ///endregion

   ///region protected

   /**
    * Инициализирует данные источника, переданные в конструктор
    * @param {Object} data данные
    * @protected
    */
   protected _initData(data: Object) {
      if (!data) {
         return;
      }

      if (isJsonAdapter(this._$adapter)) {
         initJsonData(this, data);
         return;
      }

      let adapter = this.getAdapter().forTable(data);
      let handler = (record) => {
         this.update(record);
      };
      for (let i = 0; i < adapter.getCount(); i++) {
         let meta = adapter.at(i);
         this.create(meta).addCallback(handler);
      }
   }

   /**
    * Создает новый экземпляр dataSet
    * @param {Object} rawData данные
    * @return {Types/_source/DataSet}
    * @protected
    */
   protected _getDataSet(rawData: any) {
      return <DataSet>create(// eslint-disable-line new-cap
         this._dataSetModule,
         Object.assign({
            writable: this._writable,
            adapter: this.getAdapter(),
            model: this.getModel(),
            listModule: this.getListModule(),
            idProperty: this.getIdProperty()
         }, {
            rawData: rawData,
            itemsProperty: this._dataSetItemsProperty,
            metaProperty: this._dataSetMetaProperty
         })
      );
   }

   protected _hierarchyMove(sourceItems, to, meta, keys) {
      let _this = this;
      let toIndex;
      let parentValue;
      if (!meta.parentProperty) {
         return Deferred.fail('Parent property is not defined');
      }
      if (to) {
         toIndex = keys.indexOf(to);
         if (toIndex === -1) {
            return Deferred.fail('Record "to" with key ' + to + ' is not found.');
         }
         let item = this.rawManager.get(keys[toIndex]);
         parentValue = item[meta.parentProperty];
      } else {
         parentValue = null;
      }
      sourceItems.forEach((id) => {
         let item = _this.rawManager.get(id);
         item[meta.parentProperty] = parentValue;
         _this.rawManager.set(id, item);
      });
   }

   protected _reorderMove(sourceItems, to, meta, keys) {
      let toIndex;
      sourceItems.forEach((id) => {
         let index = keys.indexOf(id);
         keys.splice(index, 1);
      });
      if (to !== null) {
         toIndex = keys.indexOf(to);
         if (toIndex === -1) {
            return Deferred.fail('Record "to" with key ' + to + ' is not found.');
         }
      }
      let shift = meta && (meta.before || meta.position === 'before') ? 0 : 1;
      sourceItems.forEach((id, index) => {
         keys.splice(toIndex + shift + index, 0, id);
      });
      this.rawManager.setKeys(keys);
   }

   ///endregion
}

LocalSession.prototype._moduleName = 'Types/source:LocalSession';
LocalSession.prototype['[Types/_source/LocalSession]'] = true;
// @ts-ignore
LocalSession.prototype._writable = ReadWriteMixin.writable;
// @ts-ignore
LocalSession.prototype._dataSetModule = 'Types/source:DataSet';
// @ts-ignore
LocalSession.prototype._$adapter = 'Types/entity:adapter.Json';
// @ts-ignore
LocalSession.prototype._$listModule = 'Types/collection:RecordSet';
// @ts-ignore
LocalSession.prototype._$model = 'Types/entity:Model';
// @ts-ignore
LocalSession.prototype._$idProperty = '';
// @ts-ignore
LocalSession.prototype._dataSetItemsProperty = 'items';
// @ts-ignore
LocalSession.prototype._dataSetMetaProperty = 'meta';
// @ts-ignore
LocalSession.prototype._options = {
   prefix: '',
   model: Model,
   data: []
};

register('Types/source:LocalSession', LocalSession, {instantiate: false});
