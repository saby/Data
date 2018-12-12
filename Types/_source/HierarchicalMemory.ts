/// <amd-module name="Types/_source/HierarchicalMemory" />
/**
 * Source which returns "breadcrumbs" to the root of hierarchy in the result of query() method.
 * "Breadcrumbs" stores as Array in property "path" of RecordSet's meta data.
 *
 * Let's create hierarchical source and select data with breadcrumbs:
 * <pre>
 *    require(['Types/source'], function (source) {
 *       var goods = new source.HierarchicalMemory({
 *          data: [
 *             {id: 1, parent: null, name: 'Laptops'},
 *             {id: 10, parent: 1, name: 'Apple MacBook Pro'},
 *             {id: 11, parent: 1, name: 'Xiaomi Mi Notebook Air'},
 *             {id: 2, parent: null, name: 'Smartphones'},
 *             {id: 20, parent: 2, name: 'Apple iPhone'},
 *             {id: 21, parent: 2, name: 'Samsung Galaxy'}
 *          ],
 *          idProperty: 'id',
 *          parentProperty: 'parent'
 *       });
 *
 *       var laptopsQuery = new source.Query();
 *       laptopsQuery.where({parent: 1});
 *
 *       goods.query(laptopsQuery).addCallbacks(function(response) {
 *          var items = response.getAll();
 *          items.forEach(function(item) {
 *              console.log(item.get('name'));//'Apple MacBook Pro', 'Xiaomi Mi Notebook Air'
 *          });
 *          items.getMetaData().path.map(function(item) {
 *             console.log(item.get('name'));//'Laptops'
 *          });
 *       }, function(error) {
 *          console.error(error);
 *       });
 *    });
 * </pre>
 * @class Types/_source/HierarchicalMemory
 * @mixes Types/Entity/DestroyableMixin
 * @implements Types/Source/ICrud
 * @implements Types/Source/ICrudPlus
 * @mixes Types/Entity/SerializableMixin
 * @author Мальцев А.А.
 */

import ICrud from './ICrud';
import ICrudPlus from './ICrudPlus';
import Memory, {IOptions as IMemoryOptions} from './Memory';
import {DestroyableMixin, OptionsToPropertyMixin, SerializableMixin, adapter, relation} from '../entity';
import {mixin} from '../util';
// @ts-ignore
import req = require('require');
// @ts-ignore
import Deferred = require('Core/Deferred');

interface IOptions extends IMemoryOptions {
   parentProperty: string;
}

export default class HierarchicalMemory extends mixin(
   DestroyableMixin, OptionsToPropertyMixin, SerializableMixin
) implements ICrud, ICrudPlus /** @lends Data/_source/HierarchicalMemory.prototype */{
   /**
    * @cfg {String|Types/Adapter/IAdapter} See {@link Types/Source/Memory#adapter}.
    * @name Types/_source/HierarchicalMemory#adapter
    */
   protected _$adapter: string | Function;

   /**
    * @cfg {String|Function} See {@link Types/Source/Memory#model}.
    * @name Types/_source/HierarchicalMemory#model
    */
   protected _$model: string | Function;

   /**
    * @cfg {String|Function} See {@link Types/Source/Memory#listModule}.
    * @name Types/_source/HierarchicalMemory#listModule
    */
   protected _$listModule: string | Function;

   /**
    * @cfg {String} See {@link Types/Source/Memory#idProperty}.
    * @name Types/_source/HierarchicalMemory#idProperty
    */
   protected _$idProperty: string;

   /**
    * @cfg {String} Record's property name that contains identity of the node another node or leaf belongs to.
    * @name Types/_source/HierarchicalMemory#parentProperty
    */
   protected _$parentProperty: string;

   /**
    * @cfg {Object} See {@link Types/Source/Memory#data}.
    * @name Types/_source/HierarchicalMemory#data
    */
   protected _$data: any;

   /**
    * @cfg {Function(Types/Adapter/IRecord, Object):Boolean} See {@link Types/Source/Memory#filter}.
    * @name Types/_source/HierarchicalMemory#filter
    */
   protected _$filter: (item: adapter.IRecord, query: Object) => boolean;

   protected _source: Memory;

   constructor(options?: IOptions) {
      super();
      OptionsToPropertyMixin.call(this, options);
      SerializableMixin.constructor.call(this);
      this._source = new Memory(options);
   }

   //region ICrud

   readonly '[Types/_source/ICrud]': boolean = true;

   create(meta) {
      return this._source.create(meta);
   }

   read(key, meta) {
      return this._source.read(key, meta);
   }

   update(data, meta) {
      return this._source.update(data, meta);
   }

   destroy(keys, meta) {
      return this._source.destroy(keys, meta);
   }

   query(query) {
      let result = new Deferred();

      req(['Types/collection'], (collection) => {
         this._source.query(query).addCallbacks((response) => {
            if (this._$parentProperty) {
               let hierarchy = new relation.Hierarchy({
                  idProperty: this._$idProperty,
                  parentProperty: this._$parentProperty
               });

               let sourceRecords = new collection.RecordSet({
                  rawData: this._$data,
                  adapter: this._source.getAdapter(),
                  idProperty: this._$idProperty,
               });

               // Extract breadcrumbs as path from filtered node to the root
               let breadcrumbs = [];
               let startFromId = query.getWhere()[this._$parentProperty];
               let startFromNode = sourceRecords.getRecordById(startFromId);
               if (startFromNode) {
                  breadcrumbs.unshift(startFromNode);
                  let node;
                  while(startFromNode && (node = hierarchy.getParent(startFromNode, sourceRecords))) {
                     breadcrumbs.unshift(node);
                     startFromNode = node.get(this._$idProperty);
                  }
               }

               //Store breadcrumbs as 'path' in meta data
               const data =  response.getRawData(true);
               if (data) {
                  const metaData =  data.meta || {};
                  metaData.path = breadcrumbs;
                  data.meta = metaData;
                  response.setRawData(data);
               }
            }

            result.callback(response);
         }, (err) => {
            result.errback(err);
         });
      }, (err) => {
         result.errback(err);
      });

      return result;
   }

   //endregion

   //region ICrudPlus

   readonly '[Types/_source/ICrudPlus]': boolean = true;

   merge(from, to) {
      return this._source.merge(from, to);
   }

   copy(key, meta) {
      return this._source.copy(key, meta);
   }

   move(items, target, meta) {
      return this._source.move(items, target, meta);
   }

   //endregion

   // region SerializableMixin

   protected _getSerializableState(state) {
      state = SerializableMixin.prototype._getSerializableState.call(this, state);
      state._source = this._source;

      return state;
   }

   protected _setSerializableState(state) {
      let fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
      return function() {
         fromSerializableMixin.call(this);
         this._source = state._source;
      };
   }

   // endregion
}

HierarchicalMemory.prototype._moduleName = 'Types/source:HierarchicalMemory';
HierarchicalMemory.prototype['[Types/_source/HierarchicalMemory]'] = true;
// @ts-ignore
HierarchicalMemory.prototype._$adapter = null;
// @ts-ignore
HierarchicalMemory.prototype._$model = null;
// @ts-ignore
HierarchicalMemory.prototype._$listModule = null;
// @ts-ignore
HierarchicalMemory.prototype._$idProperty = null;
// @ts-ignore
HierarchicalMemory.prototype._$parentProperty = null;
// @ts-ignore
HierarchicalMemory.prototype._$data = null;
// @ts-ignore
HierarchicalMemory.prototype._$filter = null;
