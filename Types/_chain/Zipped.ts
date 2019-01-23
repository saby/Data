/// <amd-module name="Types/_chain/Zipped" />
/**
 * Объединяющее звено цепочки.
 * @class Types/_chain/Zipped
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import ZippedEnumerator from './ZippedEnumerator';
import {IEnumerable} from '../collection';

export default class Zipped<T> extends Abstract<T> /** @lends Types/_chain/Zipped.prototype */{
   /**
    * @property {Array.<Array>|Array.<Types/Collection/IEnumerable>} Коллекции для объединения
    */
   protected _items: Array<Array<T> | IEnumerable<T>>;

   /**
    * Конструктор объединяющего звена цепочки.
    * @param {Types/_chain/Abstract} source Предыдущее звено.
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

   getEnumerator(): ZippedEnumerator<T> {
      return new ZippedEnumerator(
         this._previous,
         this._items
      );
   }

   // endregion Types/_collection/IEnumerable
}

Zipped.prototype['[Types/_chain/Zipped]'] = true;
// @ts-ignore
Zipped.prototype._items = null;
