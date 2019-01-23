/// <amd-module name="Types/_source/Memory" />
/**
 * Источник данных в памяти ОС.
 * Позволяет получать данные из объектов в оперативной памяти.
 *
 * Создадим источник со списком объектов солнечной системы:
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
 *          idProperty: 'id'
 *       });
 *
 *       //Создадим новый объект:
 *       solarSystem.create(
 *          {id: 11, name: 'Moon', 'kind': 'Satellite'}
 *       ).addCallback(function(satellite) {
 *          console.log('Object created:', satellite.get('name'));//'Object created: Moon'
 *       });
 *
 *       //Прочитаем данные о Солнце:
 *       solarSystem.read(1).addCallback(function(star) {
 *          console.log('Object readed:', star.get('name'));//'Object readed: Sun'
 *       });
 *
 *       //Вернем Плутону статус планеты:
 *       solarSystem.read(10).addCallback(function(pluto) {
 *          pluto.set('kind', 'Planet');
 *          solarSystem.update(pluto).addCallback(function() {
 *             console.log('Pluto is the planet again!');
 *          });
 *       });
 *
 *       //Удалим Марс:
 *       solarSystem.destroy(5).addCallback(function() {
 *          console.log('Bye Mars!');
 *       });
 *
 *       //Получим список планет:
 *       var query = new Query();
 *       query.where({
 *          kind: 'Planet'
 *       });
 *       solarSystem.query(query).addCallback(function(dataSet) {
 *          var planets = dataSet.getAll();
 *          planets.getCount();//8
 *          planets.each(function(planet) {
 *             console.log(planet.get('name'));
 *          });
 *          //Mercury, Venus, Earth, Jupiter, Saturn, Uranus, Neptune, Pluto
 *       });
 *    });
 * </pre>
 * @class Types/_source/Memory
 * @extends Types/_source/Local
 * @public
 * @author Мальцев А.А.
 */

import Local, {IOptions as ILocalOptions} from './Local';
import DataSet from './DataSet';
import Query, {Join} from './Query';
import {adapter} from '../entity';
import {register} from '../di';
import {protect, object} from '../util';
import {Map} from '../shim';

/**
 * Protected 'cachedAdapter' property symbol
 */
const $cachedAdapter = protect('cachedAdapter');

/**
 * All injected data by contracts
 */
let contracts = {};

interface IEndpoint {
   contract?: string
}

export interface IOptions extends ILocalOptions {
   data?: any
   endpoint?: IEndpoint
}

export default class Memory extends Local /** @lends Types/_source/Memory.prototype */{
   /**
    * @cfg {Object} Данные, с которыми работает источник.
    * @name Types/_source/Memory#data
    * @remark
    * Данные должны быть в формате, поддерживаемом адаптером {@link adapter}.
    * @example
    * Создадим источник с данными объектов солнечной системы, данные представлены в виде массива:
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
    *          idProperty: 'id'
    *       });
    *    });
    * </pre>
    * Создадим источник с данными объектов солнечной системы, данные представлены в виде {@link Types/Collection/RecordSet рекордсета}:
    * <pre>
    *    require([
    *       'Types/Source/Memory',
    *       'Types/Collection/RecordSet',
    *       'Types/Adapter/RecordSet'
    *    ], function (
    *       MemorySource,
    *       RecordSet,
    *       RecordSetAdapter
    *    ) {
    *       var solarData = new RecordSet({
    *          rawData: [
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
    *          ]
    *       });
    *       var solarSystem = new MemorySource({
    *          data: solarData,
    *          adapter: new RecordSetAdapter(),
    *          idProperty: 'id'
    *       });
    *    });
    * </pre>
    */
   protected _$data: any;

   protected _dataSetItemsProperty: string;

   protected _dataSetMetaProperty: string;

   /**
    * Пустые данные по таблицам
    */
   protected _emptyData: Map<string, any>;

   constructor(options?: IOptions) {
      super(options);

      //FIXME: YAGNI
      if (options && options.endpoint && options.endpoint.contract && !contracts.hasOwnProperty(options.endpoint.contract)) {
         contracts[options.endpoint.contract] = this._$data;
      }
   }

   //region Base

   protected _prepareQueryResult(data: any, query): DataSet {
      //selection has no items - return an empty table
      if (data && data.items === undefined) {
         data.items = this._getEmptyData(query);
      }
      return super._prepareQueryResult(data);
   }

   //endregion Base

   //region Local

   protected _getTableAdapter(): adapter.ITable {
      return this[<string>$cachedAdapter] || (this[<string>$cachedAdapter] = this.getAdapter().forTable(this._$data));
   }

   protected _applyFrom(from?: string): any {
      return from ? contracts[from] : this._data;
   }

   protected _applyJoin(data: any, join: Join[]): any {
      if (join.length) {
         throw new Error('Joins are not supported');
      }
      return data;
   }

   protected _applyWhere(data: any, where?: Object | Function): any {
      //FIXME: get rid of this SBIS-specified
      if (where && typeof where === 'object') {
         where = Object.assign({}, where);
         delete where['Разворот'];
         delete where['ВидДерева'];
         delete where['usePages'];
      }

      return super._applyWhere(data, where);
   }

   //endregion Local

   //region Protected members

   /**
    * Возвращает данные пустой выборки с учетом того, что в ней может содержаться описание полей (зависит от используемого адаптера)
    * @param {Types/Query/Query} [query] Запрос
    * @return {*}
    * @protected
    */
   protected _getEmptyData(query?: Query): any {
      this._emptyData = this._emptyData || new Map();

      let table = query ? query.getFrom() : undefined;
      if (!this._emptyData.has(table)) {
         let items = object.clonePlain(this._applyFrom(table), true);
         let adapter = this.getAdapter().forTable(items);

         adapter.clear();
         this._emptyData.set(table, adapter.getData());
      }

      return this._emptyData.get(table);
   }

   //endregion Protected members
}

Memory.prototype._moduleName = 'Types/source:Memory';
Memory.prototype['[Types/_source/Memory]'] = true;
// @ts-ignore
Memory.prototype._$data = null;
// @ts-ignore
Memory.prototype._dataSetItemsProperty = 'items';
// @ts-ignore
Memory.prototype._dataSetMetaProperty = 'meta';
// @ts-ignore
Memory.prototype._emptyData = null;

register('Types/source:Memory', Memory, {instantiate: false});
