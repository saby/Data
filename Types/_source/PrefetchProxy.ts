/// <amd-module name="Types/_source/PrefetchProxy" />
/**
 * Источник данных, содержащий предварительно загруженные данные и возвращающий их на первый вызов любого метода чтения данных. Все последующие вызовы проксируются на целевой источник данных.
 *
 * Создадим источник с заранее загруженным результатом списочного метода:
 * <pre>
 *    require(['Types/Source/PrefetchProxy', 'Types/Source/Memory', 'Types/Source/DataSet'], function (PrefetchProxy, MemorySource, DataSet) {
 *       var fastFoods = new PrefetchProxy({
 *          target: new MemorySource({
 *             data: [
 *                {id: 1, name: 'Kurger Bing'},
 *                {id: 2, name: 'DcMonald\'s'},
 *                {id: 3, name: 'CFK'},
 *                {id: 4, name: 'Kuicq'}
 *             ],
 *          }),
 *          data: {
 *             query: new DataSet({
 *                rawData: [
 *                   {id: 1, name: 'Mret a Panger'},
 *                   {id: 2, name: 'Cofta Cosfee'},
 *                   {id: 3, name: 'AET'},
 *                ]
 *             })
 *          }
 *       });
 *
 *       //First query will return prefetched data
 *       fastFoods.query().addCallbacks(function(spots) {
 *          spots.getAll().forEach(function(spot) {
 *             console.log(spot.get('name'));//'Mret a Panger', 'Cofta Cosfee', 'AET'
 *          });
 *       }, function(error) {
 *          console.error(error);
 *       });
 *
 *       //Second query will return real data
 *       fastFoods.query().addCallbacks(function(spots) {
 *          spots.getAll().forEach(function(spot) {
 *             console.log(spot.get('name'));//'Kurger Bing', 'DcMonald's', 'CFK', 'Kuicq'
 *          });
 *       }, function(error) {
 *          console.error(error);
 *       });
 *    });
 * </pre>
 * @class Types/Source/PrefetchProxy
 * @mixes Types/Entity/DestroyableMixin
 * @implements Types/Source/ICrud
 * @implements Types/Source/ICrudPlus
 * @mixes Types/Entity/OptionsMixin
 * @mixes Types/Entity/SerializableMixin
 * @public
 * @author Мальцев А.А.
 */

import ICrud from './ICrud';
import ICrudPlus from './ICrudPlus';
import Base from './Base';
import DataSet from './DataSet';
import {DestroyableMixin, Record, OptionsToPropertyMixin, SerializableMixin} from '../entity';
import {mixin} from '../util';
// @ts-ignore
import Deferred = require('Core/Deferred');

interface IData {
   read: Record
   query: DataSet
   copy: Record
}

interface IDone {
   read?: boolean
   query?: boolean
   copy?: boolean
}

declare type ITarget = ICrud | ICrudPlus | Base

export default class PrefetchProxy extends mixin(
   DestroyableMixin, OptionsToPropertyMixin, SerializableMixin
) implements ICrud, ICrudPlus /** @lends Types/Source/PrefetchProxy.prototype */{
   /**
    * @cfg {Types/Source/ICrud|Types/Source/ICrudPlus} Целевой источник данных.
    * @name Types/Source/PrefetchProxy#target
    */
   _$target: ITarget = null;

   /**
    * @cfg {Object} Предварительно загруженные данные для методов чтения, определенных в интерфейсах {@link Types/Source/ICrud} и {@link Types/Source/ICrudPlus}.
    * @name Types/Source/PrefetchProxy#data
    */
   _$data: IData = {

      /**
       * @cfg {Types/Entity/Record} Предварительно загруженные данные для метода {@link Types/Source/ICrud#read}.
       * @name Types/Source/PrefetchProxy#data.read
       */
      read: null,

      /**
       * @cfg {Types/Source/DataSet} Предварительно загруженные данные для метода {@link Types/Source/ICrud#query}.
       * @name Types/Source/PrefetchProxy#data.query
       */
      query: null,

      /**
       * @cfg {Types/Entity/Record} Предварительно загруженные данные для метода {@link Types/Source/ICrud#copy}.
       * @name Types/Source/PrefetchProxy#data.copy
       */
      copy: null
   };

   /**
    * Методы, уже отдавший заранее приготовленные данные
    */
   _done: IDone = {};

   constructor(options?: Object) {
      super(options);
      OptionsToPropertyMixin.call(this, options);
      SerializableMixin.constructor.call(this);

      if (!this._$target) {
         throw new ReferenceError('Option "target" is required.');
      }
   }

   //region ICrud

   readonly '[Types/_source/ICrud]': boolean = true;

   create(meta) {
      return (<ICrud>this._$target).create(meta);
   }

   read(key, meta) {
      if (this._$data.read && !this._done.read) {
         this._done.read = true;
         return Deferred.success(this._$data.read);
      }
      return (<ICrud>this._$target).read(key, meta);
   }

   update(data, meta) {
      return (<ICrud>this._$target).update(data, meta);
   }

   destroy(keys, meta) {
      return (<ICrud>this._$target).destroy(keys, meta);
   }

   query(query) {
      if (this._$data.query && !this._done.query) {
         this._done.query = true;
         return Deferred.success(this._$data.query);
      }
      return (<ICrud>this._$target).query(query);
   }

   //endregion ICrud

   //region ICrudPlus

   readonly '[Types/_source/ICrudPlus]': boolean = true;

   merge(from, to) {
      return (<ICrudPlus>this._$target).merge(from, to);
   }

   copy(key, meta) {
      if (this._$data.copy && !this._done.copy) {
         this._done.copy = true;
         return Deferred.success(this._$data.copy);
      }
      return (<ICrudPlus>this._$target).copy(key, meta);
   }

   move(items, target, meta) {
      return (<ICrudPlus>this._$target).move(items, target, meta);
   }

   //endregion ICrudPlus

   //region Base

   getOptions() {
      return (<Base>this._$target).getOptions();
   }

   setOptions(options) {
      return (<Base>this._$target).setOptions(options);
   }

   //endregion Base

   // region SerializableMixin

   _getSerializableState(state) {
      state = SerializableMixin.prototype._getSerializableState.call(this, state);
      state._done = this._done;

      return state;
   }

   _setSerializableState(state) {
      let fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
      return function() {
         fromSerializableMixin.call(this);
         this._done = state._done;
      };
   }

   // endregion SerializableMixin
}

PrefetchProxy.prototype._moduleName = 'Types/source:PrefetchProxy';
PrefetchProxy.prototype['[Types/_source/PrefetchProxy]'] = true;
