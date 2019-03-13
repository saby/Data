/**
 * Цепочка по IEnumerable.
 * @class Types/_chain/Enumerable
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import {IEnumerator} from '../collection';

export default class Enumerable<T> extends Abstract<T> /** @lends Types/_chain/Enumerable.prototype */{
   constructor(source: any) {
      if (!source || !source['[Types/_collection/IEnumerable]']) {
         throw new TypeError('Source must implement Types/collection:IEnumerable');
      }
      super(source);
   }

   // region Types/_collection/IEnumerable

   getEnumerator(): IEnumerator<T> {
      return this._source.getEnumerator();
   }

   each(callback: (item: any, index: number) => void, context?: object): void {
      return this._source.each(callback, context);
   }

   // endregion Types/_collection/IEnumerable

   // region Types/_chain/DestroyableMixin

   toObject(): object {
      if (this._source['[Types/_entity/IObject]']) {
         const result = {};
         this.each((key, value) => {
            result[key] = value;
         });
         return result;
      }
      return super.toObject();
   }

   // endregion Types/_chain/DestroyableMixin
}

Enumerable.prototype['[Types/_chain/Enumerable]'] = true;
