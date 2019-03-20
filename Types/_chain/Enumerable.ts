import Abstract from './Abstract';
import {IEnumerator} from '../collection';

/**
 * Цепочка по IEnumerable.
 * @class Types/_chain/Enumerable
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
export default class Enumerable<T> extends Abstract<T> {
   constructor(source: any) {
      if (!source || !source['[Types/_collection/IEnumerable]']) {
         throw new TypeError('Source must implement Types/collection:IEnumerable');
      }
      super(source);
   }

   // region IEnumerable

   getEnumerator(): IEnumerator<T> {
      return this._source.getEnumerator();
   }

   each(callback: (item: any, index: number) => void, context?: object): void {
      return this._source.each(callback, context);
   }

   // endregion

   // region IObject

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

   // endregion
}

Enumerable.prototype['[Types/_chain/Enumerable]'] = true;
