/// <amd-module name="Types/_chain/ReversedEnumerator" />
/**
 * Реверсивный энумератор
 * @author Мальцев А.А.
 */

import IndexedEnumerator from './IndexedEnumerator';

export default class ReversedEnumerator<T> extends IndexedEnumerator<T> {
   _getItems(): T[] {
      if (!this._items) {
         super._getItems();
         this._items.reverse();

         // Build natural order indices if necessary
         if (!this.previous.shouldSaveIndices) {
            this._items = this._items.map((item, index) => [
               index,
               item[1]
            ], this);
         }
      }

      return this._items;
   }
}
