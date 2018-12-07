/// <amd-module name="Types/_chain/Objectwise" />
/**
 * Цепочка по объекту.
 * @class Types/Chain/Object
 * @extends Types/Chain/Abstract
 * @public
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import {enumerator} from '../collection';

export default class Objectwise<T> extends Abstract<T> /** @lends Types/Chain/Object.prototype */{
   protected _source: Object;

   constructor(source: Object) {
      if (!(source instanceof Object)) {
         throw new TypeError('Source should be an instance of Object');
      }
      super(source);
   }

   // region Types/_collection/IEnumerable

   getEnumerator(): enumerator.Objectwise<T> {
      return new enumerator.Objectwise(this._source);
   }

   each(callback: (item: any, index: number) => void, context?: Object) {
      const keys = Object.keys(this._source);
      const count = keys.length;
      let key;

      for (let i = 0; i < count; i++) {
         key = keys[i];
         callback.call(
            context || this,
            this._source[key],
            key
         );
      }
   }

   value(factory?: Function): Object {
      if (factory instanceof Function) {
         return super.value(factory);
      }

      return this.toObject();
   }

   // endregion Types/_collection/IEnumerable
}

Objectwise.prototype['[Types/_chain/Objectwise]'] = true;
