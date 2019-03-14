import Abstract from './Abstract';
import ConcatenatedEnumerator from './ConcatenatedEnumerator';
import {IEnumerable} from '../collection';

/**
 * Объединяющее звено цепочки.
 * @class Types/_chain/Concatenated
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
export default class Concatenated<T> extends Abstract<T> /** @lends Types/_chain/Concatenated.prototype */{
   /**
    * @property {Array.<Array>|Array.<Types/_collection/IEnumerable>} Коллекции для объединения
    */
   protected _items: Array<T[] | IEnumerable<T>>;

   /**
    * Конструктор объединяющего звена цепочки.
    * @param {Types/_chain/Abstract} source Предыдущее звено.
    * @param {Array.<Array>|Array.<Types/_collection/IEnumerable>} items Коллекции для объединения.
    */
   constructor(source: Abstract<T>, items: Array<T[] | IEnumerable<T>>) {
      super(source);
      this._items = items;
   }

   destroy(): void {
      this._items = null;
      super.destroy();
   }

   // region IEnumerable

   getEnumerator(): ConcatenatedEnumerator<T> {
      return new ConcatenatedEnumerator(
         this._previous,
         this._items
      );
   }

   // endregion
}

Object.assign(Concatenated.prototype, {
   '[Types/_chain/Concatenated]': true,
   _items: null
});

Object.defineProperty(Concatenated.prototype, 'shouldSaveIndices', { value: false });
