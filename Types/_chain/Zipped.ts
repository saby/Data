import Abstract from './Abstract';
import ZippedEnumerator from './ZippedEnumerator';
import {IEnumerable} from '../collection';

/**
 * Объединяющее звено цепочки.
 * @class Types/_chain/Zipped
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
export default class Zipped<T> extends Abstract<T> /** @lends Types/_chain/Zipped.prototype */{
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

   getEnumerator(): ZippedEnumerator<T> {
      return new ZippedEnumerator(
         this._previous,
         this._items
      );
   }

   // endregion
}

Object.assign(Zipped.prototype, {
   '[Types/_chain/Zipped]': true,
   _items: null
});
