/// <amd-module name="Types/_chain/Concatenated" />
/**
 * Объединяющее звено цепочки.
 * @class Types/Chain/Concatenated
 * @extends Types/Chain/Abstract
 * @public
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import ConcatenatedEnumerator from './ConcatenatedEnumerator';
import {IEnumerable} from '../collection';

export default class Concatenated<T> extends Abstract<T> /** @lends Types/Chain/Concatenated.prototype */{
   /**
    * @property {Array.<Array>|Array.<Types/Collection/IEnumerable>} Коллекции для объединения
    */
   protected _items: Array<Array<T> | IEnumerable<T>>;

   /**
    * Конструктор объединяющего звена цепочки.
    * @param {Types/Chain/Abstract} source Предыдущее звено.
    * @param {Array.<Array>|Array.<Types/Collection/IEnumerable>} items Коллекции для объединения.
    */
   constructor(source: Abstract<T>, items: Array<Array<T> | IEnumerable<T>>) {
      super(source);
      this._items = items;
   }

   destroy() {
      this._items = null;
      super.destroy();
   }

   // region Types/_collection/IEnumerable

   getEnumerator(): ConcatenatedEnumerator<T> {
      return new ConcatenatedEnumerator(
         this._previous,
         this._items
      );
   }

   // endregion Types/_collection/IEnumerable
}

Concatenated.prototype['[Types/_chain/Concatenated]'] = true;

   // @ts-ignore
Concatenated.prototype._items = null;

Object.defineProperty(Concatenated.prototype, 'shouldSaveIndices', { value: false });
