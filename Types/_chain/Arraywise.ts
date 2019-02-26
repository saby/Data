/// <amd-module name="Types/_chain/Arraywise" />
/**
 * Цепочка по массиву.
 * @class Types/_chain/Array
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import {enumerator} from '../collection';

export default class Arraywise<T> extends Abstract<T> /** @lends Types/_chain/Array.prototype */{
   protected _source: any[];

   constructor(source: any[]) {
      if (!(source instanceof Array)) {
         throw new TypeError('Source should be an instance of Array');
      }
      super(source);
   }

   // region Types/_collection/IEnumerable

   getEnumerator(): enumerator.Arraywise<T> {
      return new enumerator.Arraywise(this._source);
   }

   each(callback: (item: any, index: number) => void, context?: object): void {
      for (let i = 0, count = this._source.length; i < count; i++) {
         callback.call(
            context || this,
            this._source[i],
            i
         );
      }
   }

   // endregion Types/_collection/IEnumerable

   // region Types/_chain/DestroyableMixin

   toArray(): any[] {
      return this._source.slice();
   }

   // endregion Types/_chain/DestroyableMixin
}

Arraywise.prototype['[Types/_chain/Arraywise]'] = true;

Object.defineProperty(Arraywise.prototype, 'shouldSaveIndices', { value: false });
