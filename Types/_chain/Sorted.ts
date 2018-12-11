/// <amd-module name="Types/_chain/Sorted" />
/**
 * Сортирующее звено цепочки.
 * @class Types/Chain/Sorted
 * @extends Types/Chain/Abstract
 * @public
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import SortedEnumerator from './SortedEnumerator';

export default class Sorted<T> extends Abstract<T> /** @lends Types/Chain/Sorted.prototype */{
   /**
    * @property {function(*, *): Number} Функция сравнения
    */
   protected _compareFunction: CompareFunction;

   /**
    * Конструктор сортирующего звена цепочки.
    * @param {Types/Chain/Abstract} source Предыдущее звено.
    * @param {function(*, *): Number} [compareFunction] Функция сравнения
    */
   constructor(source: Abstract<T>, compareFunction?: CompareFunction) {
      super(source);
      this._compareFunction = compareFunction;
   }

   destroy() {
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

Sorted.prototype['[Types/_chain/Sorted]'] = true;
// @ts-ignore
Sorted.prototype._compareFunction = null;
