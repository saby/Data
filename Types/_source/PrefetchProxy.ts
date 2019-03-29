import ICrud from './ICrud';
import ICrudPlus from './ICrudPlus';
import Base from './Base';
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

declare type ITarget = ICrud | ICrudPlus | Base;

interface IValidators {
   read?: (data: Record, done?: IDone) => boolean;
   query?: (data: DataSet, done?: IDone) => boolean;
   copy?: (data: Record, done?: IDone) => boolean;
}

/**
 * Data source which contains prefetched data and returns them on the first call of any method for data reading.
 * Second and further calls will be proxied to the target data source.
 *
 * Let's create data source witch two lists of spots: first one is prefetched data and the second one is the target
 * Memory source:
 * <pre>
 *    import {PrefetchProxy, Memory, DataSet} from 'Types/source';
 *
 *    const fastFoods = new PrefetchProxy({
 *       data: {
 *          query: new DataSet({
 *             rawData: [
 *                {id: 1, name: 'Mret a Panger'},
 *                {id: 2, name: 'Cofta Cosfee'},
 *                {id: 3, name: 'AET'},
 *             ]
 *          })
 *       },
 *       target: new Memory({
 *          data: [
 *             {id: 1, name: 'Kurger Bing'},
 *             {id: 2, name: 'DcMonald\'s'},
 *             {id: 3, name: 'CFK'},
 *             {id: 4, name: 'Kuicq'}
 *          ],
 *       })
 *    });
 *
 *    //First query will return prefetched data
 *    fastFoods.query().then((spots) => {
 *       spots.getAll().forEach((spot) => {
 *          console.log(spot.get('name'));//'Mret a Panger', 'Cofta Cosfee', 'AET'
 *       });
 *    }, console.error);
 *
 *    //Second query will return real data from target source
 *    fastFoods.query().then((spots) => {
 *       spots.getAll().forEach((spot) => {
 *          console.log(spot.get('name'));//'Kurger Bing', 'DcMonald's', 'CFK', 'Kuicq'
 *       });
 *    }, console.error);
 * </pre>
 * @class Types/_source/PrefetchProxy
 * @mixes Types/_entity/DestroyableMixin
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
) implements ICrud, ICrudPlus /** @lends Types/_source/PrefetchProxy.prototype */{
   /**
    * @cfg {Types/_source/ICrud} Target data source
    * @name Types/_source/PrefetchProxy#target
    */
   protected _$target: ITarget = null;

   /**
    * @cfg {Object} Prefetched data for methods which means reading.
    * {@link Types/_source/ICrud} и {@link Types/_source/ICrudPlus}.
    * @name Types/_source/PrefetchProxy#data
    */
   protected _$data: IData = {

      /**
       * @cfg {Types/_entity/Record} Prefetched data for {@link Types/_source/ICrud#read} method.
       * @name Types/_source/PrefetchProxy#data.read
       */
      read: null,

      /**
       * @cfg {Types/_source/DataSet} Prefetched data for {@link Types/_source/ICrud#query} method.
       * @name Types/_source/PrefetchProxy#data.query
       */
      query: null,

      /**
       * @cfg {Types/_entity/Record} Prefetched data for {@link Types/_source/ICrud#copy} method.
       * @name Types/_source/PrefetchProxy#data.copy
       */
      copy: null
   };

   /**
    * @cfg {Object} Data validators which decides are they still valid or not and, accordingly, should it
    * return prefetched data or invoke target source.
    * @name Types/_source/PrefetchProxy#validators
    * @example
    * Let's cache data for one minute
    * <pre>
    *    import {PrefetchProxy, Memory, DataSet} from 'Types/source';
    *
    *    const EXPIRATION_INTERVAL = 60000;
    *    const EXPIRATION_TIME = Date.now() + EXPIRATION_INTERVAL;
    *
    *    const forecast = new PrefetchProxy({
    *       target: new Memory({
    *          data: [
    *             {id: 1, name: 'Moscow', temperature: -25},
    *             {id: 2, name: 'Los Angeles', temperature: 20}
    *          ],
    *       }),
    *       data: {
    *          query: new DataSet({
    *             rawData: [
    *                {id: 1, name: 'Moscow', temperature: -23},
    *                {id: 2, name: 'Los Angeles', temperature: 22}
    *             ]
    *          })
    *       },
    *       validators: {
    *          query: (data) => {
    *             return Date.now() < EXPIRATION_TIME;
    *          }
    *       }
    *    });
    *
    *    //First 60 seconds source will be returning prefetched data
    *    forecast.query().then((cities) => {
    *       cities.getAll().forEach((city) => {
    *          console.log(city.get('name') + ': ' + city.get('temperature'));//'Moscow: -25', 'Los Angeles: 20'
    *       });
    *    }, console.error);
    *
    *    //60 seconds later source will be returning updated data
    *    setTimeout(() => {
    *       forecast.query().then((cities) => {
    *          cities.getAll().forEach((city) => {
    *             console.log(city.get('name') + ': ' + city.get('temperature'));//'Moscow: -23', 'Los Angeles: 22'
    *          });
    *       }, console.error);
    *    }, EXPIRATION_INTERVAL);
    * </pre>
    */
   protected _$validators: IValidators = {
      read: (data: Record, done?: IDone): boolean => {
         if (data && !done.read) {
            done.read = true;
            return true;
         }
         return false;
      },
      query: (data: DataSet, done?: IDone): boolean => {
         if (data && !done.query) {
            done.query = true;
            return true;
         }
         return false;
      },
      copy: (data: Record, done?: IDone): boolean => {
         if (data && !done.copy) {
            done.copy = true;
            return true;
         }
         return false;
      }
   };

   /**
    * The state of reading prefetched data
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

   // region ICrud

   readonly '[Types/_source/ICrud]': boolean = true;

   create(meta?: object): ExtendPromise<Record> {
      return (this._$target as ICrud).create(meta);
   }

   read(key: any, meta?: object): ExtendPromise<Record> {
      if (this._$validators.read(this._$data.read, this._done)) {
         return Deferred.success(this._$data.read);
      }
      return (this._$target as ICrud).read(key, meta);
   }

   update(data: Record | RecordSet, meta?: object): ExtendPromise<null> {
      return (this._$target as ICrud).update(data, meta);
   }

   destroy(keys: any | any[], meta?: object): ExtendPromise<null> {
      return (this._$target as ICrud).destroy(keys, meta);
   }

   query(query: Query): ExtendPromise<DataSet> {
      if (this._$validators.query(this._$data.query, this._done)) {
         return Deferred.success(this._$data.query);
      }
      return (this._$target as ICrud).query(query);
   }

   // endregion

   // region ICrudPlus

   readonly '[Types/_source/ICrudPlus]': boolean = true;

   merge(from: string | number, to: string | number): ExtendPromise<any> {
      return (this._$target as ICrudPlus).merge(from, to);
   }

   copy(key: string | number, meta?: object): ExtendPromise<Record> {
      if (this._$validators.copy(this._$data.copy, this._done)) {
         return Deferred.success(this._$data.copy);
      }
      return (this._$target as ICrudPlus).copy(key, meta);
   }

   move(items: Array<string | number>, target: string | number, meta?: object): ExtendPromise<any> {
      return (this._$target as ICrudPlus).move(items, target, meta);
   }

   // endregion

   // region Base

   getOptions(): object {
      return (this._$target as Base).getOptions();
   }

   setOptions(options: object): void {
      return (this._$target as Base).setOptions(options);
   }

   // endregion

   // region SerializableMixin

   _getSerializableState(state: ISerializableState): IPrefetchProxySerializableState {
      const resultState: IPrefetchProxySerializableState =
         SerializableMixin.prototype._getSerializableState.call(this, state);
      resultState._done = this._done;

      return resultState;
   }

   _setSerializableState(state?: IPrefetchProxySerializableState): Function {
      const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
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
