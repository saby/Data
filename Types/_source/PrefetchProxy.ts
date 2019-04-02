import ICrud from './ICrud';
import ICrudPlus from './ICrudPlus';
import IDecorator from './IDecorator';
import OptionsMixin from './OptionsMixin';
import Query from './Query';
import DataSet from './DataSet';
import {
   DestroyableMixin,
   OptionsToPropertyMixin,
   SerializableMixin,
   Record,
   ISerializableState
} from '../entity';
import {RecordSet} from '../collection';
import {mixin} from '../util';
// @ts-ignore
import Deferred = require('Core/Deferred');

interface IData {
   read: Record;
   query: DataSet;
   copy: Record;
}

interface IDone {
   read?: boolean;
   query?: boolean;
   copy?: boolean;
}

interface IPrefetchProxySerializableState extends ISerializableState {
   _done: IDone;
}

declare type ITarget = ICrud | ICrudPlus;

/**
 * Источник данных, содержащий предварительно загруженные данные и возвращающий их на первый вызов любого метода
 * чтения данных. Все последующие вызовы проксируются на целевой источник данных.
 *
 * Создадим источник с заранее загруженным результатом списочного метода:
 * <pre>
 *    require(['Types/source'], function (source) {
 *       var fastFoods = new source.PrefetchProxy({
 *          target: new source.Memory({
 *             data: [
 *                {id: 1, name: 'Kurger Bing'},
 *                {id: 2, name: 'DcMonald\'s'},
 *                {id: 3, name: 'CFK'},
 *                {id: 4, name: 'Kuicq'}
 *             ],
 *          }),
 *          data: {
 *             query: new source.DataSet({
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
 * @class Types/_source/PrefetchProxy
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_source/IDecorator
 * @implements Types/_source/ICrud
 * @implements Types/_source/ICrudPlus
 * @mixes Types/_entity/OptionsMixin
 * @mixes Types/_entity/SerializableMixin
 * @public
 * @author Мальцев А.А.
 */
export default class PrefetchProxy extends mixin<
   OptionsToPropertyMixin,
   SerializableMixin
>(
   DestroyableMixin,
   OptionsToPropertyMixin,
   SerializableMixin
) implements IDecorator, ICrud, ICrudPlus /** @lends Types/_source/PrefetchProxy.prototype */{
   /**
    * @cfg {Types/_source/ICrud} Целевой источник данных.
    * @name Types/_source/PrefetchProxy#target
    */
   protected _$target: ITarget = null;

   /**
    * @cfg {Object} Предварительно загруженные данные для методов чтения, определенных в интерфейсах
    * {@link Types/_source/ICrud} и {@link Types/_source/ICrudPlus}.
    * @name Types/_source/PrefetchProxy#data
    */
   protected _$data: IData = {

      /**
       * @cfg {Types/_entity/Record} Предварительно загруженные данные для метода {@link Types/_source/ICrud#read}.
       * @name Types/_source/PrefetchProxy#data.read
       */
      read: null,

      /**
       * @cfg {Types/_source/DataSet} Предварительно загруженные данные для метода {@link Types/_source/ICrud#query}.
       * @name Types/_source/PrefetchProxy#data.query
       */
      query: null,

      /**
       * @cfg {Types/_entity/Record} Предварительно загруженные данные для метода {@link Types/_source/ICrud#copy}.
       * @name Types/_source/PrefetchProxy#data.copy
       */
      copy: null
   };

   /**
    * Методы, уже отдавший заранее приготовленные данные
    */
   protected _done: IDone = {};

   constructor(options?: object) {
      super(options);
      OptionsToPropertyMixin.call(this, options);
      SerializableMixin.call(this);

      if (!this._$target) {
         throw new ReferenceError('Option "target" is required.');
      }
   }

   // region IDecorator

   readonly '[Types/_source/IDecorator]': boolean = true;

   getOriginal<T = ITarget>(): T {
      return this._$target as any;
   }

   // endregion

   // region ICrud

   readonly '[Types/_source/ICrud]': boolean = true;

   create(meta?: object): ExtendPromise<Record> {
      return (<ICrud> this._$target).create(meta);
   }

   read(key: any, meta?: object): ExtendPromise<Record> {
      if (this._$data.read && !this._done.read) {
         this._done.read = true;
         return Deferred.success(this._$data.read);
      }
      return (<ICrud> this._$target).read(key, meta);
   }

   update(data: Record | RecordSet, meta?: object): ExtendPromise<null> {
      return (<ICrud> this._$target).update(data, meta);
   }

   destroy(keys: any | any[], meta?: object): ExtendPromise<null> {
      return (<ICrud> this._$target).destroy(keys, meta);
   }

   query(query: Query): ExtendPromise<DataSet> {
      if (this._$data.query && !this._done.query) {
         this._done.query = true;
         return Deferred.success(this._$data.query);
      }
      return (<ICrud> this._$target).query(query);
   }

   // endregion

   // region ICrudPlus

   readonly '[Types/_source/ICrudPlus]': boolean = true;

   merge(from: string | number, to: string | number): ExtendPromise<any> {
      return (<ICrudPlus> this._$target).merge(from, to);
   }

   copy(key: string | number, meta?: object): ExtendPromise<Record> {
      if (this._$data.copy && !this._done.copy) {
         this._done.copy = true;
         return Deferred.success(this._$data.copy);
      }
      return (<ICrudPlus> this._$target).copy(key, meta);
   }

   move(items: Array<string | number>, target: string | number, meta?: object): ExtendPromise<any> {
      return (<ICrudPlus> this._$target).move(items, target, meta);
   }

   // endregion

   // region OptionsMixin

   getOptions(): object {
      if (this._$target && (this._$target as any as OptionsMixin).getOptions) {
         return (this._$target as any as OptionsMixin).getOptions();
      }
      return {};
   }

   setOptions(options: object): void {
      if (this._$target && (this._$target as any as OptionsMixin).setOptions) {
         return (this._$target as any as OptionsMixin).setOptions(options);
      }
      throw new TypeError('Option "target" should be an instance of Types/_source/OptionsMixin');
   }

   // endregion

   // region SerializableMixin

   _getSerializableState(state: ISerializableState): IPrefetchProxySerializableState {
      const resultState = super._getSerializableState(state) as IPrefetchProxySerializableState;
      resultState._done = this._done;

      return resultState;
   }

   _setSerializableState(state?: IPrefetchProxySerializableState): Function {
      const fromSerializableMixin = super._setSerializableState(state);
      return function(): void {
         fromSerializableMixin.call(this);
         this._done = state._done;
      };
   }

   // endregion
}

Object.assign(PrefetchProxy.prototype, {
   '[Types/_source/PrefetchProxy]': true,
   _moduleName: 'Types/source:PrefetchProxy'
});
