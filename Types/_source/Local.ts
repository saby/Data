/// <amd-module name="Types/_source/Local" />
/**
 * Источник данных, работающий локально.
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @class Types/Source/Local
 * @extends Types/Source/Base
 * @implements Types/Source/ICrud
 * @implements Types/Source/ICrudPlus
 * @mixes Types/Source/DataCrudMixin
 * @public
 * @author Мальцев А.А.
 */

import ICrud from './ICrud';
import ICrudPlus from './ICrudPlus';
import Base, {IOptions as IBaseOptions} from './Base';
import DataMixin from './DataMixin';
import DataCrudMixin from './DataCrudMixin';
import Query, {Join, Order} from './Query';
import DataSet from './DataSet';
import {adapter, Model, Record} from '../entity';
import {IList, RecordSet} from '../collection';
import {mixin, object} from '../util';
// @ts-ignore
import Deferred = require('Core/Deferred');
// @ts-ignore
import randomId = require('Core/helpers/Number/randomId');

const MOVE_POSITION = {
   on: 'on',
   before: 'before',
   after: 'after'
};

function compareValues(given, expect, operator) {
   // If array expected, use "given in expect" logic
   if (expect instanceof Array) {
      for (let i = 0; i < expect.length; i++) {
         if (compareValues(given, expect[i], operator)) {
            return true;
         }
      }
      return false;
   }

   // If array given, use "given has only expect" logic
   if (given instanceof Array) {
      for (let i = 0; i < given.length; i++) {
         if (!compareValues(given[i], expect, operator)) {
            return false;
         }
      }
      return true;
   }

   //Otherwise - just compare
   return given == expect;
}

interface GenericObject<T> {}

interface IFilter {
   (item: adapter.IRecord, query: Object): boolean;
}

export interface IOptions extends IBaseOptions {
   filter?: IFilter
}

export default abstract class Local extends mixin(
   Base, DataCrudMixin
) implements ICrud, ICrudPlus /** @lends Types/Source/Local.prototype */{
   /**
    * @cfg {Function(Types/Adapter/IRecord, Object):Boolean} Фильтр записей, используемый при вызове метода {@link query}.
    * @name Types/Source/Local#filter
    * @remark
    * Первым аргументом передается адаптер сырых данных для каждой записи, вторым - фильтр, переданный в вызов метода query().
    * Функция должна вернуть Boolean: true - запись прошла фильтр и попадет в итоговую выборку, false - не  прошла.
    * @example
    * Спрячем Землю из результатов выборки:
    * <pre>
    *    require(['Types/Source/Memory'], function (MemorySource) {
    *       var solarSystem = new MemorySource({
    *          data: [
    *             {id: 1, name: 'Sun', kind: 'Star'},
    *             {id: 2, name: 'Mercury', kind: 'Planet'},
    *             {id: 3, name: 'Venus', kind: 'Planet'},
    *             {id: 4, name: 'Earth', kind: 'Planet'},
    *             {id: 5, name: 'Mars', kind: 'Planet'},
    *             {id: 6, name: 'Jupiter', kind: 'Planet'},
    *             {id: 7, name: 'Saturn', kind: 'Planet'},
    *             {id: 8, name: 'Uranus', kind: 'Planet'},
    *             {id: 9, name: 'Neptune', kind: 'Planet'},
    *             {id: 10, name: 'Pluto', kind: 'Dwarf planet'}
    *          ],
    *          filter: function(item) {
    *             return item.get('name') !== 'Earth';
    *          },
    *          idProperty: 'id'
    *       });
    *
    *       solarSystem.query().addCallback(function(result) {
    *          result.getAll().each(function(record) {
    *             console.log(record.get('name'));//'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
    *          });
    *       });
    *    });
    * </pre>
    * Выберем все объекты, имена которых начинаются на 'S':
    * <pre>
    *    require(['Types/Source/Memory', 'Types/Query/Query'], function (MemorySource, Query) {
    *       var solarSystem = new MemorySource({
    *          data: [
    *             {id: 1, name: 'Sun', kind: 'Star'},
    *             {id: 2, name: 'Mercury', kind: 'Planet'},
    *             {id: 3, name: 'Venus', kind: 'Planet'},
    *             {id: 4, name: 'Earth', kind: 'Planet'},
    *             {id: 5, name: 'Mars', kind: 'Planet'},
    *             {id: 6, name: 'Jupiter', kind: 'Planet'},
    *             {id: 7, name: 'Saturn', kind: 'Planet'},
    *             {id: 8, name: 'Uranus', kind: 'Planet'},
    *             {id: 9, name: 'Neptune', kind: 'Planet'},
    *             {id: 10, name: 'Pluto', kind: 'Dwarf planet'}
    *          ],
    *          filter: function(item, where) {
    *             return Object.keys(where).some(function(field) {
    *                var value = item.get(field),
    *                   needed = where[field];
    *                return String(value).indexOf(needed) === 0;
    *             });
    *          },
    *          idProperty: 'id'
    *       });
    *
    *       var query = new Query();
    *       query.where({name: 'S'});
    *       solarSystem.query(query).addCallback(function(result) {
    *          result.getAll().each(function(record) {
    *             console.log(record.get('name'));//'Sun', 'Saturn'
    *          });
    *       });
    *    });
    * </pre>
    */
   protected _$filter: IFilter;

   /**
    * Индекс для быстрого поиска записи по ключу
    */
   protected _index: GenericObject<Number>;

   /**
    * Данные, с которыми работает источник
    */
   protected get _data(): any {
      return this._getTableAdapter().getData();
   }

   protected constructor(options?: IOptions) {
      super(options);

      this._reIndex();
   }

   //region ICrud

   readonly '[Types/_source/ICrud]': boolean = true;

   create(meta?: Object): ExtendPromise<Record> {
      meta = object.clonePlain(meta, true);
      return this._loadAdditionalDependencies().addCallback(() => {
         return this._prepareCreateResult(meta);
      });
   }

   read(key: any, meta?: Object): ExtendPromise<Record> {
      let data = this._getRecordByKey(key);
      if (data) {
         return this._loadAdditionalDependencies().addCallback(() => this._prepareReadResult(data));
      } else {
         return Deferred.fail(`Record with key "${key}" does not exist`);
      }
   }

   update(data: Record | RecordSet<Record>, meta?: Object): ExtendPromise<null> {
      let updateRecord = (record) => {
         let idProperty = this.getIdProperty();
         let key = idProperty ? record.get(idProperty) : undefined;
         if (key === undefined) {
            key = randomId('k');
            record.set(idProperty, key);
         }

         let adapter = this._getTableAdapter();
         let index = this._getIndexByKey(key);

         if (index === -1) {
            adapter.add(record.getRawData());
            if (this._index) {
               this._index[key] = adapter.getCount() - 1;
            }
         } else {
            adapter.replace(record.getRawData(), index);
         }

         return key;
      };

      let keys = [];

      if (DataMixin.isListInstance(data)) {
         (<RecordSet<Record>>data).each((record) => {
            keys.push(updateRecord(record));
         });
      } else {
         keys = updateRecord(data);
      }

      return this._loadAdditionalDependencies().addCallback(
         () => this._prepareUpdateResult(data, keys)
      );
   }

   destroy(keys: any | Array<any>, meta?: Object): ExtendPromise<null> {
      let destroyByKey = (key) => {
         let index = this._getIndexByKey(key);
         if (index !== -1) {
            this._getTableAdapter().remove(index);
            this._reIndex();
            return true;
         } else {
            return false;
         }
      };

      if (!(keys instanceof Array)) {
         keys = [keys];
      }

      for (let i = 0, len = keys.length; i < len; i++) {
         if (!destroyByKey(keys[i])) {
            return Deferred.fail(`Record with key "${keys[i]}" does not exist`);
         }
      }

      return Deferred.success(true);
   }

   query(query: Query): ExtendPromise<DataSet> {
      let items = this._applyFrom(query ? query.getFrom() : undefined);
      let adapter = this.getAdapter();
      let total;

      if (query) {
         items = this._applyJoin(items, query.getJoin());
         items = this._applyWhere(items, query.getWhere());
         items = this._applyOrderBy(items, query.getOrderBy());
         total = adapter.forTable(items).getCount();
         items = this._applyPaging(items, query.getOffset(), query.getLimit());
      } else if (this._$filter) {
         items = this._applyWhere(items);
      } else {
         total = adapter.forTable(items).getCount();
      }

      return this._loadAdditionalDependencies().addCallback(() => this._prepareQueryResult({
         items: items,
         meta: {
            total: total
         }
      }, query));
   }

   //endregion ICrud

   //region ICrudPlus

   readonly '[Types/_source/ICrudPlus]': boolean = true;

   merge(from: string | number, to: string | number): ExtendPromise<any> {
      let indexOne = this._getIndexByKey(from);
      let indexTwo = this._getIndexByKey(to);
      if (indexOne === -1 || indexTwo === -1) {
         return Deferred.fail(`Record with key "${from}" or "${to}" does not exist`);
      } else {
         this._getTableAdapter().merge(
            indexOne,
            indexTwo,
            this.getIdProperty()
         );
         this._reIndex();
         return Deferred.success(true);
      }
   }

   copy(key: string | number, meta?: Object): ExtendPromise<Record> {
      let index = this._getIndexByKey(key);
      if (index === -1) {
         return Deferred.fail(`Record with key "${key}" does not exist`);
      } else {
         let copy = this._getTableAdapter().copy(index);
         this._reIndex();
         return this._loadAdditionalDependencies().addCallback(
            () => this._prepareReadResult(copy)
         );
      }
   }

   move(items: Array<string | number>, target: string | number, meta?: any): ExtendPromise<any> {
      meta = meta || {};
      let sourceItems = [];
      if (!(items instanceof Array)) {
         items = [items];
      }
      let tableAdapter = this._getTableAdapter();
      let adapter = this.getAdapter();

      items.sort( (a, b) => {
         let indexa = this._getIndexByKey(a);
         let indexb = this._getIndexByKey(b);
         return  meta.position == MOVE_POSITION.after ? indexb - indexa : indexa - indexb;
      }).forEach((id) => {
         let index = this._getIndexByKey(id);
         sourceItems.push(adapter.forRecord(tableAdapter.at(index)));
      });

      let targetPosition = -1;
      let targetItem = null;
      if (target !== null) {
         targetPosition = this._getIndexByKey(target);
         targetItem = adapter.forRecord(tableAdapter.at(targetPosition));
         if (targetPosition === -1) {
            return Deferred.fail('Can\'t find target position');
         }
      }

      if (meta.position === MOVE_POSITION.on) {
         return this._hierarchyMove(sourceItems, targetItem, meta);
      }

      return this._reorderMove(sourceItems, targetItem, meta);
   }

   //endregion ICrudPlus

   //region DataMixin

   protected _wrapToDataSet(data): DataSet {
      return super._wrapToDataSet(
         object.clonePlain(data, true)
      );
   }

   //endregion DataMixin

   //region DataCrudMixin

   protected _prepareCreateResult(data): Model {
      return DataCrudMixin._prepareCreateResult.call(
         this,
         object.clonePlain(data, true)
      );
   }

   protected _prepareReadResult(data): Model {
      return DataCrudMixin._prepareReadResult.call(
         this,
         object.clonePlain(data, true)
      );
   }

   //endregion DataCrudMixin

   //region Protected methods

   /**
    * Возвращает адаптер для работы с таблицей
    * @return {Types/Adapter/ITable}
    * @protected
    */
   protected abstract _getTableAdapter(): adapter.ITable

   /**
    * Возвращает данные модели с указанным ключом
    * @param {String} key Значение ключа
    * @return {Array|undefined}
    * @protected
    */
   protected _getRecordByKey(key: string): Array<adapter.IRecord> {
      return this._getTableAdapter().at(
         this._getIndexByKey(key)
      );
   }

   /**
    * Возвращает индекс модели с указанным ключом
    * @param {String} key Значение ключа
    * @return {Number} -1 - не найден, >=0 - индекс
    * @protected
    */
   protected _getIndexByKey(key: string | number): number {
      let index = this._index[key];
      return index === undefined ? -1 : index;
   }

   /**
    * Перестраивает индекс
    * @protected
    */
   protected _reIndex() {
      this._index = {};
      let adapter = this.getAdapter();
      this._each(this._data, (item, index) => {
         let key = adapter.forRecord(item).get(this._$idProperty);
         this._index[key] = index;
      });
   }

   /**
    * Применяет источник выборки
    * @param {String} [from] Источник выборки
    * @return {*}
    * @protected
    */
   protected abstract _applyFrom(from?: string): any

   /**
    * Применяет объединение
    * @param {*} data Данные
    * @param {Types/Query/Join[]} join Выборки для объединения
    * @return {*}
    * @protected
    */
   protected abstract _applyJoin(data: any, join: Join[]): any;

   /**
    * Применяет фильтр
    * @param {*} data Данные
    * @param {Object|Function} where Фильтр
    * @return {*}
    * @protected
    */
   protected _applyWhere(data: any, where?: Object | Function): any {
      where = where || {};
      if (!this._$filter && typeof where === 'object' && !Object.keys(where).length) {
         return data;
      }

      let checkFields = (fields, item) => {
         let result = true;
         for (let name in fields) {
            if (!fields.hasOwnProperty(name)) {
               continue;
            }
            result = compareValues(
               item.get(name),
               fields[name],
               '='
            );
            if (!result) {
               break;
            }
         }
         return result;
      };

      let adapter = this.getAdapter();
      let tableAdapter = adapter.forTable();
      let isPredicate = typeof where === 'function';

      this._each(data, (item, index) => {
         item = adapter.forRecord(item);

         let isMatch = true;
         if (this._$filter) {
            isMatch = this._$filter(item, where);
         } else {
            isMatch = isPredicate ? (<Function>where)(item, index) : checkFields(where, item);
         }

         if (isMatch) {
            tableAdapter.add(item.getData());
         }
      });

      return tableAdapter.getData();
   }

   /**
    * Применяет сортировку
    * @param {*} data Данные
    * @param {Array.<Types/Query/Order>} order Параметры сортировки
    * @return {*}
    * @protected
    */
   protected _applyOrderBy(data: any, order: Order[]): any {
      order = order || [];
      if (!order.length) {
         return data;
      }

      //Создаем карту сортировки
      let orderMap = [];
      for (let i = 0; i < order.length; i++) {
         orderMap.push({
            field: order[i].getSelector(),
            order: order[i].getOrder()
         });
      }

      //Создаем служебный массив, который будем сортировать
      let adapter = this.getAdapter();
      let dataMap = [];
      this._each(data, (item, index) => {
         let value;
         let values = [];
         for (let i = 0; i < orderMap.length; i++) {
            value = adapter.forRecord(item).get(orderMap[i].field);

            //undefined значения не передаются в compareFunction Array.prototype.sort, и в результате сортируются непредсказуемо. Поэтому заменим их на null.
            values.push(value === undefined ? null : value);
         }
         dataMap.push({
            index: index,
            values: values
         });
      });

      let compare = (a, b) => {
         if (a === null && b !== null) {
            //Считаем null меньше любого не-null
            return -1;
         }
         if (a !== null && b === null) {
            //Считаем любое не-null больше null
            return 1;
         }
         if (a == b) {
            return 0;
         }
         return a > b ? 1 : -1;
      };

      //Сортируем служебный массив
      dataMap.sort((a, b) => {
         let result = 0;
         for (let index = 0; index < orderMap.length; index++) {
            result = (orderMap[index].order ? -1 : 1) * compare(
               a.values[index],
               b.values[index]
            );
            if (result !== 0) {
               break;
            }
         }
         return result;
      });

      //Создаем новую таблицу по служебному массиву
      let sourceAdapter = adapter.forTable(data);
      let resultAdapter = adapter.forTable();
      for (let i = 0, count = dataMap.length; i < count; i++) {
         resultAdapter.add(sourceAdapter.at(dataMap[i].index));
      }

      return resultAdapter.getData();
   }

   /**
    * Применяет срез
    * @param {*} data Данные
    * @param {Number} [offset=0] Смещение начала выборки
    * @param {Number} [limit] Количество записей выборки
    * @return {*}
    * @protected
    */
   protected _applyPaging(data: any, offset?: number, limit?: number): any {
      offset = offset || 0;
      if (offset === 0 && limit === undefined) {
         return data;
      }

      let dataAdapter = this.getAdapter().forTable(data);
      if (limit === undefined) {
         limit = dataAdapter.getCount();
      } else {
         limit = limit || 0;
      }

      let newDataAdapter = this.getAdapter().forTable();
      let newIndex = 0;
      let beginIndex = offset;
      let endIndex = Math.min(
         dataAdapter.getCount(),
         beginIndex + limit
      );
      for (let index = beginIndex; index < endIndex; index++, newIndex++) {
         newDataAdapter.add(dataAdapter.at(index));
      }

      return newDataAdapter.getData();
   }

   protected _reorderMove(items: Array<adapter.IRecord>, target: adapter.IRecord, meta: any): ExtendPromise<null> {
      let parentValue;
      if (meta.parentProperty) {
         parentValue = target.get(meta.parentProperty);
      }
      if (!meta.position && meta.hasOwnProperty('before')) {
         meta.position = meta.before ? MOVE_POSITION.before : MOVE_POSITION.after;
      }

      let tableAdapter = this._getTableAdapter();
      let targetsId = target.get(this._$idProperty);
      items.forEach((item) => {
         if (meta.parentProperty) {
            item.set(meta.parentProperty, parentValue);
         }
         let index = this._getIndexByKey(item.get(this._$idProperty));
         let targetIndex = this._getIndexByKey(targetsId);
         if (meta.position === MOVE_POSITION.before && targetIndex > index) {
            targetIndex--;
         } else if (meta.position === MOVE_POSITION.after && targetIndex < index) {
            targetIndex++;
         }
         tableAdapter.move(index, targetIndex);
         this._reIndex();
      });

      return new Deferred().callback();
   }

   protected _hierarchyMove(items: Array<adapter.IRecord>, target: adapter.IRecord, meta: any): ExtendPromise<null> {
      if (!meta.parentProperty) {
         return Deferred.fail('Parent property is not defined');
      }
      let parentValue = target ? target.get(this._$idProperty) : null;
      items.forEach((item) => {
         item.set(meta.parentProperty, parentValue);
      });

      return new Deferred().callback();
   }

   //endregion Protected methods
}

Local.prototype._moduleName = 'Types/source:Local';
Local.prototype['[Types/_source/Local]'] = true;
// @ts-ignore
Local.prototype._$filter = null;
// @ts-ignore
Local.prototype._index = null;
