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
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_source/ICrud
 * @implements Types/_source/ICrudPlus
 * @mixes Types/_entity/SerializableMixin
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
    * @cfg {Object} See {@link Types/_source/Memory#data}.
    * @name Types/_source/HierarchicalMemory#data
    */

   /**
    * @cfg {String|Types/_entity/adapter/IAdapter} See {@link Types/_source/Memory#adapter}.
    * @name Types/_source/HierarchicalMemory#adapter
    */

   /**
    * @cfg {String|Function} See {@link Types/_source/Memory#model}.
    * @name Types/_source/HierarchicalMemory#model
    */

   /**
    * @cfg {String|Function} See {@link Types/_source/Memory#listModule}.
    * @name Types/_source/HierarchicalMemory#listModule
    */

   /**
    * @cfg {Function(Types/_entity/adapter/IRecord, Object):Boolean} See {@link Types/_source/Memory#filter}.
    * @name Types/_source/HierarchicalMemory#filter
    */

   /**
    * @cfg {String} See {@link Types/_source/Memory#idProperty}.
    * @name Types/_source/HierarchicalMemory#idProperty
    */

   /**
    * @cfg {String} Record's property name that contains identity of the node another node or leaf belongs to.
    * @name Types/_source/HierarchicalMemory#parentProperty
    */
   protected _$parentProperty: string;

   protected _source: Memory;

   protected get _idProperty(): string {
      return this._source.getIdProperty();
   }

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
                  idProperty: this._idProperty,
                  parentProperty: this._$parentProperty
               });

               let sourceRecords = new collection.RecordSet({
                  rawData: this._source.data,
                  adapter: this._source.getAdapter(),
                  idProperty: this._idProperty,
               });

               let breadcrumbs = new collection.RecordSet({
                  adapter: this._source.getAdapter(),
                  idProperty: this._idProperty,
               });

               // Extract breadcrumbs as path from filtered node to the root
               let startFromId = query.getWhere()[this._$parentProperty];
               let startFromNode = sourceRecords.getRecordById(startFromId);
               if (startFromNode) {
                  breadcrumbs.add(startFromNode, 0);
                  let node;
                  while(startFromNode && (node = hierarchy.getParent(startFromNode, sourceRecords))) {
                     breadcrumbs.add(node, 0);
                     startFromNode = node.get(this._idProperty);
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
HierarchicalMemory.prototype._$parentProperty = null;
//FIXME: to pass check via cInstance.instanceOfMixin(sourceOpt, 'WS.Data/Source/ICrud')
HierarchicalMemory.prototype['[WS.Data/Source/ICrud]'] = true;
