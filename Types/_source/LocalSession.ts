/* tslint:disable:max-classes-per-file */

import ICrud from './ICrud';
import ICrudPlus from './ICrudPlus';
import IData from './IData';
import Query, { Order } from './Query';
import DataSet from './DataSet';
import {
   DestroyableMixin,
   Record,
   Model,
   OptionsToPropertyMixin,
   ReadWriteMixin,
   adapter as adapters
} from '../entity';
import {RecordSet} from '../collection';
import {create, register} from '../di';
import {mixin, object} from '../util';
import {merge} from '../object';
import {ExtendPromise} from '../_declarations';
import {LocalStorage} from 'Browser/Storage';
// @ts-ignore
import Deferred = require('Core/Deferred');

const DATA_FIELD_PREFIX = 'd';
const KEYS_FIELD = 'i';
const ID_COUNT = 'k';

function initJsonData(source: LocalSession, data: any): void {
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

function isJsonAdapter(instance: string | adapters.IAdapter): boolean {
   if (typeof instance === 'string') {
      return instance.indexOf('Types/entity:adapter.Json') > -1 || instance.indexOf('adapter.json') > -1;
   }

   return instance instanceof adapters.Json;
}

function itemToObject(item: any, adapter: string | adapters.IAdapter): object {
   if (!item) {
      return {};
   }

   let record = item;
   const isRecord = item && item instanceof Record;

   if (!isRecord && isJsonAdapter(adapter)) {
      return item;
   }

   if (!isRecord) {
      record = new Record({
         adapter,
         rawData: item
      });
   }

   const data = {};
   const enumerator = record.getEnumerator();
   while (enumerator.moveNext()) {
      const key = enumerator.getCurrent();
      data[key] = record.get(key);
   }

   return data;
}

interface IOptions {
   prefix: string;
   idProperty: string;
   data?: object;
}

class WhereTokenizer {
   query: RegExp = /(\w+)([!><=]*)/;

   tokinize(key: string): IToken {
      const m = key.match(this.query);
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

   static eq(field: any, val: any): boolean {
      if (!(val instanceof Array)) {
         // tslint:disable-next-line:triple-equals
         return field == val;
      }
      return val.indexOf(field) !== -1;
   }

   static ne(field: any, val: any): boolean {
         // tslint:disable-next-line:triple-equals
         return field != val;
   }

   static lt(field: any, val: any): boolean {
      return field < val;
   }

   static le(field: any, val: any): boolean {
      return field <= val;
   }

   static gt(field: any, val: any): boolean {
      return field > val;
   }

   static ge(field: any, val: any): boolean {
      return field >= val;
   }
}

interface IToken {
   field: string;
   op: (field: any, val: any) => boolean;
}

class LocalQuery {
   query: Query;
   tokenizer: WhereTokenizer = new WhereTokenizer();

   constructor(query: Query) {
      this.query = query;
   }

   select(items: object[]): object[] {
      const fields = this.query.getSelect() as string[];
      if (Object.keys(fields).length === 0) {
         return items;
      }
      return items.map((item) => {
         const res = {};
         let name;
         for (let i = 0; i < fields.length; i++) {
            name = fields[i];
            res[name] = item[name];
         }
         return res;
      });
   }

   where(items: object[]): object[] {
      const where = this.query.getWhere();
      const conditions = [];
      const adapter = new adapters.Json();

      if (typeof where === 'function') {
         return items.filter((item, i) => {
            return where(adapter.forRecord(item), i);
         });
      }

      for (const key in where) {
         if (!where.hasOwnProperty(key)) {
            continue;
         }
         if (where[key] === undefined) {
            continue;
         }
         const token = this.tokenizer.tokinize(key);
         if (token === undefined) {
            return [];
         }
         conditions.push({field: token.field, op: token.op, value: where[key]});
      }

      return items.filter((item) => {
         for (let i = 0; i < conditions.length; i++) {
            const token = conditions[i];
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

   order(items: object[]): object[] {
      const orders = this.query.getOrderBy();
      if (orders.length > 0) {
         return LocalQuery.orderBy(items, orders);
      }
      return items;
   }

   offset(items: object[]): object[] {
      if (!this.query.getOffset()) {
         return items;
      }
      return items.slice(this.query.getOffset());
   }

   limit(items: object[]): object[] {
      if (this.query.getLimit() === undefined) {
         return items;
      }
      return items.slice(0, this.query.getLimit());
   }

   static orderBy(items: object[], orders: Order[]): object[] {
      const data = items;

      function compare(a: any, b: any): number {
         if (a === null && b !== null) {
            // Считаем null меньше любого не-null
            return -1;
         }
         if (a !== null && b === null) {
            // Считаем любое не-null больше null
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
            const order = orders[i];
            const direction = order.getOrder() ? -1 : 1;
            const selector = order.getSelector();
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

   constructor(ls: LocalStorage) {
      this.ls = ls;
      const count = this.getCount();
      if (count === null) {
         this.setCount(0);
      }
      const keys = this.getKeys();
      if (keys === null) {
         this.setKeys([]);
      }
   }

   get(key: string): any {
      return this.ls.getItem(DATA_FIELD_PREFIX + key);
   }

   set(key: string, data: any): boolean {
      const count = this.getCount() + 1;
      const keys = this.getKeys();
      if (keys.indexOf(key) === -1) {
         keys.push(key);
         this.setKeys(keys);
         this.setCount(count);
      }
      return this.ls.setItem(DATA_FIELD_PREFIX + key, data);
   }

   move(sourceItems: string[], to: string, meta?: any): void {
      const keys = this.getKeys();
      let toIndex;
      sourceItems.forEach((id) => {
         const index = keys.indexOf(id);
         keys.splice(index, 1);
      });
      if (to !== null) {
         toIndex = keys.indexOf(to);
         if (toIndex === -1) {
            return Deferred.fail('Record "to" with key ' + to + ' is not found.');
         }
      }
      const shift = meta && (meta.before || meta.position === 'before') ? 0 : 1;
      sourceItems.forEach((id, index) => {
         keys.splice(toIndex + shift + index, 0, id);
      });
      this.setKeys(keys);
   }

   remove(keys: string | string[]): boolean {
      let count;
      if (!(keys instanceof Array)) {
         count = this.getCount();
         this.removeFromKeys(keys);
         this.setCount(count - 1);
         return this.ls.removeItem(DATA_FIELD_PREFIX + keys);
      }
      for (let i = 0; i < keys.length; i++) {
         const key = keys[i];
         count = this.getCount();
         this.setCount(count - 1);
         this.ls.removeItem(DATA_FIELD_PREFIX + key);
      }
      this.removeFromKeys(keys);
      return true;
   }

   removeFromKeys(keys: string | string[]): void {
      let ks;
      if (keys instanceof Array) {
         ks = keys;
      } else {
         ks = [keys];
      }
      const data = this.getKeys();
      for (let i = 0; i < ks.length; i++) {
         const key = ks[i];
         const index = data.indexOf(key);
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

   setCount(count: number): void {
      this.ls.setItem(ID_COUNT, count);
   }

   getKeys(): string[] {
      return this.ls.getItem(KEYS_FIELD);
   }

   setKeys(keys: string[]): void {
      this.ls.setItem(KEYS_FIELD, keys);
   }

   /**
    * Проверка существования ключей
    * @param {String|Array<String>} keys Значение ключа или ключей
    * @return {Boolean} true, если все ключи существуют, иначе false
    */
   existKeys(keys: string[]): boolean {
      const existedKeys = this.getKeys();
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

   reserveId(): string {
      function genId(): string {
         function str(): string {
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
   adapter: adapters.IAdapter | string;
   idProperty: string;

   constructor(adapter: adapters.IAdapter | string, idProperty: string) {
      this.adapter = adapter;
      this.idProperty = idProperty;
   }

   get(data: object): Model {
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

   sbis(data: object): Model {
      const rec = new Record({rawData: data});
      const format = rec.getFormat();
      const enumerator = rec.getEnumerator();

      const model = new Model({
         format,
         adapter: create(this.adapter),
         idProperty: this.idProperty
      });

      while (enumerator.moveNext()) {
         const key = enumerator.getCurrent();
         model.set(key, rec.get(key));
      }
      return model;
   }
}

class Converter {
   adapter: adapters.IAdapter | string;
   idProperty: string;
   modelManager: ModelManager;

   constructor(adapter: adapters.IAdapter | string, idProperty: string, modelManager: ModelManager) {
      this.adapter = adapter;
      this.idProperty = idProperty;
      this.modelManager = modelManager;
   }

   get(data: object[]): RecordSet | object {
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

   recordSet(data: object[]): RecordSet {
      const _data = [];
      if (data.length === 0) {
         return new RecordSet({
            rawData: _data,
            idProperty: this.idProperty
         });
      }

      for (let i = 0; i < data.length; i++) {
         const item = data[i];
         const model = this.modelManager.get(item);
         _data.push(model);
      }
      return new RecordSet({
         rawData: _data,
         idProperty: this.idProperty
      });
   }

   sbis(data: object[]): object {
      if (data.length === 0) {
         return data;
      }
      const rs = new RecordSet({
         adapter: this.adapter
      });

      const format = new Record({rawData: data[0]}).getFormat();

      for (let j = 0; j < data.length; j++) {
         const item = data[j];
         const rec = new Record({
            format,
            adapter: this.adapter
         });
         const enumerator = rec.getEnumerator();
         while (enumerator.moveNext()) {
            const key = enumerator.getCurrent();
            rec.set(key, item[key]);
         }
         rs.add(rec);
      }

      return rs.getRawData();
   }
}

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
export default class LocalSession extends mixin<
   OptionsToPropertyMixin
>(
   DestroyableMixin,
   OptionsToPropertyMixin
) implements ICrud, ICrudPlus, IData {
   protected _writable: boolean;

   /**
    * Конструктор модуля, реализующего DataSet
    */
   protected _dataSetModule: string | Function;

   /**
    * @cfg {String|Types/_entity/adapter/IAdapter} Адаптер для работы с форматом данных, выдаваемых источником.
    * По умолчанию {@link Types/_entity/adapter/Json}.
    */
   protected _$adapter: string | adapters.IAdapter;

   /**
    * @cfg {String|Function} Конструктор рекордсетов, порождаемых источником данных.
    * По умолчанию {@link Types/_collection/RecordSet}.
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
    * @cfg {String|Function} Конструктор записей, порождаемых источником данных.
    * По умолчанию {@link Types/_entity/Model}.
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

   readonly rawManager: RawManager;
   readonly modelManager: ModelManager;
   readonly converter: Converter;

   constructor(options?: IOptions) {
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

   // region {ICrud}

   readonly '[Types/_source/ICrud]': boolean = true;

   /**
    * Создает пустую запись через источник данных (при этом она не сохраняется в хранилище)
    * @param {Object|Types/_entity/Record} [meta] Дополнительные мета данные, которые могут понадобиться для
    * создания модели
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
   create(meta?: object): ExtendPromise<Record> {
      const item = itemToObject(meta, this._$adapter);
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
   read(key: any, meta?: object): ExtendPromise<Record> {
      const data = this.rawManager.get(key);
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
   update(data: Record | RecordSet, meta?: Object): ExtendPromise<null> {
      const updateRecord = (record) => {
         let key;
         const idProperty = record.getIdProperty ? record.getIdProperty() : this.getIdProperty();

         try {
            key = record.get(idProperty);
         } catch (e) {
            return Deferred.fail('Record idProperty doesn\'t exist');
         }

         if (key === undefined) {
            key = this.rawManager.reserveId();
         }

         record.set(idProperty, key);
         const item = itemToObject(record, this._$adapter);
         this.rawManager.set(key, item);
         record.acceptChanges();

         return key;
      };

      const keys = [];
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
   destroy(keys: any | any[], meta?: Object): ExtendPromise<null> {
      const isExistKeys = this.rawManager.existKeys(keys);
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
   query(query: Query): ExtendPromise<DataSet> {
      if (query === void 0) {
         query = new Query();
      }
      let data = [];
      const keys = this.rawManager.getKeys();
      for (let i = 0; i < keys.length; i++) {
         data.push(this.rawManager.get(keys[i]));
      }

      const lq = new LocalQuery(query);
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

   // endregion

   // region ICrudPlus

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
   merge(from: string | number, to: string | number): ExtendPromise<any> {
      const fromData = this.rawManager.get(from as string);
      const toData = this.rawManager.get(to as string);
      if (fromData === null || toData === null) {
         return Deferred.fail('Record with key ' + from + ' or ' + to + ' isn\'t exists');
      }
      const data = merge(fromData, toData);
      this.rawManager.set(from as string, data);
      this.rawManager.remove(to as string);
      return Deferred.success(true);
   }

   /**
    * Создает копию модели
    * @param {String} key Первичный ключ модели
    * @return {Core/Deferred} Асинхронный результат выполнения. В колбэке придет
    * {@link Types/_entity/Model копия модели}.
    * @example
    * <pre>
    *   solarSystem.copy('5').addCallbacks(function (copy) {
    *      console.log('New id: ' + copy.getId());
    *   });
    * </pre>
    */
   copy(key: string | number, meta?: Object): ExtendPromise<Record> {
      const myId = this.rawManager.reserveId();
      const from = this.rawManager.get(key as string);
      if (from === null) {
         return Deferred.fail('Record with key ' + from + ' isn\'t exists');
      }
      const to = merge({}, from);
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
   move(items: Array<string | number>, target: string | number, meta?: any): ExtendPromise<any> {
      const keys = this.rawManager.getKeys();
      const sourceItems = [];
      if (!(items instanceof Array)) {
         items = [items];
      }
      items.forEach((id) => {
         const index = keys.indexOf(id as string);
         if (index === -1) {
            return Deferred.fail(`Record "items" with key "${items}" is not found.`);
         }
         sourceItems.push(id);
      });
      if (meta.position === 'on') {
         return Deferred.success(this._hierarchyMove(sourceItems, target, meta, keys));
      }
      return Deferred.success(this.rawManager.move(sourceItems, target as string, meta));
   }

   // endregion

   // region IData

   readonly '[Types/_source/IData]': boolean = true;

   getIdProperty(): string {
      return this._$idProperty;
   }

   setIdProperty(name: string): void {
      throw new Error('Method is not supported');
   }

   getAdapter(): adapters.IAdapter {
      return create<adapters.IAdapter>(this._$adapter);
   }

   getListModule(): Function | string {
      return this._$listModule;
   }

   setListModule(listModule: Function | string): void {
      this._$listModule = listModule;
   }

   getModel(): string | Function {
      return this._$model;
   }

   setModel(model: string | Function): void {
      this._$model = model;
   }

   // endregion

   // region protected

   /**
    * Инициализирует данные источника, переданные в конструктор
    * @protected
    */
   protected _initData(data: object): void {
      if (!data) {
         return;
      }

      if (isJsonAdapter(this._$adapter)) {
         initJsonData(this, data);
         return;
      }

      const adapter = this.getAdapter().forTable(data);
      const handler = (record) => {
         this.update(record);
      };
      for (let i = 0; i < adapter.getCount(); i++) {
         const meta = adapter.at(i);
         this.create(meta).addCallback(handler);
      }
   }

   /**
    * Создает новый экземпляр dataSet
    * @param rawData данные
    * @protected
    */
   protected _getDataSet(rawData: any): DataSet {
      return create<DataSet>(// eslint-disable-line new-cap
         this._dataSetModule,
         {...{
            writable: this._writable,
            adapter: this.getAdapter(),
            model: this.getModel(),
            listModule: this.getListModule(),
            idProperty: this.getIdProperty()
         }, ...{
            rawData,
            itemsProperty: this._dataSetItemsProperty,
            metaProperty: this._dataSetMetaProperty
         }}
      );
   }

   protected _hierarchyMove(sourceItems: any[], to: string | number, meta: any, keys: string[]): void {
      let toIndex;
      let parentValue;
      if (!meta.parentProperty) {
         return Deferred.fail('Parent property is not defined');
      }
      if (to) {
         toIndex = keys.indexOf(to as string);
         if (toIndex === -1) {
            return Deferred.fail('Record "to" with key ' + to + ' is not found.');
         }
         const item = this.rawManager.get(keys[toIndex]);
         parentValue = item[meta.parentProperty];
      } else {
         parentValue = null;
      }
      sourceItems.forEach((id) => {
         const item = this.rawManager.get(id);
         item[meta.parentProperty] = parentValue;
         this.rawManager.set(id, item);
      });
   }

   protected _reorderMove(sourceItems: any[], to: string, meta: any, keys: string[]): void {
      let toIndex;
      sourceItems.forEach((id) => {
         const index = keys.indexOf(id);
         keys.splice(index, 1);
      });
      if (to !== null) {
         toIndex = keys.indexOf(to);
         if (toIndex === -1) {
            return Deferred.fail('Record "to" with key ' + to + ' is not found.');
         }
      }
      const shift = meta && (meta.before || meta.position === 'before') ? 0 : 1;
      sourceItems.forEach((id, index) => {
         keys.splice(toIndex + shift + index, 0, id);
      });
      this.rawManager.setKeys(keys);
   }

   // endregion
}

Object.assign(LocalSession.prototype, {
   '[Types/_source/LocalSession]': true,
   _moduleName: 'Types/source:LocalSession',
   _writable: ReadWriteMixin.prototype.writable,
   _dataSetModule: 'Types/source:DataSet',
   _$adapter: 'Types/entity:adapter.Json',
   _$listModule: 'Types/collection:RecordSet',
   _$model: 'Types/entity:Model',
   _$idProperty: '',
   _dataSetItemsProperty: 'items',
   _dataSetMetaProperty: 'meta',
   _options: {
      prefix: '',
      model: Model,
      data: []
   }
});

register('Types/source:LocalSession', LocalSession, {instantiate: false});
