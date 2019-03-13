/**
 * Сортирующее звено цепочки.
 * @class Types/_chain/Sorted
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */

import {CompareFunction} from '../_declarations';
import Abstract from './Abstract';
import SortedEnumerator from './SortedEnumerator';

export default class Sorted<T> extends Abstract<T> /** @lends Types/_chain/Sorted.prototype */{
   /**
    * @property {function(*, *): Number} Функция сравнения
    */
   protected _compareFunction: CompareFunction;

   /**
    * Конструктор сортирующего звена цепочки.
    * @param {Types/_chain/Abstract} source Предыдущее звено.
    * @param {function(*, *): Number} [compareFunction] Функция сравнения
    */
   constructor(source: Abstract<T>, compareFunction?: CompareFunction) {
      super(source);
      this._compareFunction = compareFunction;
   }

   destroy(): void {
      this._compareFunction = null;
      super.destroy();
   }

   // region Types/_collection/IEnumerable

   getEnumerator(): SortedEnumerator<T> {
      return new SortedEnumerator(
         this._previous,
         this._compareFunction
      );
   }

   // endregion Types/_collection/IEnumerable
}

Object.assign(Sorted.prototype, {
   '[Types/_chain/Sorted]': true,
   _compareFunction: null
});
