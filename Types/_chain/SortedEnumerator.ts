/**
 * Сортирующий энумератор
 * @author Мальцев А.А.
 */

import {CompareFunction} from '../_declarations';
import IndexedEnumerator from './IndexedEnumerator';
import SortWrapper from './SortWrapper';
import Abstract from './Abstract';

export default class SortedEnumerator<T> extends IndexedEnumerator<T> {
   private compareFunction: CompareFunction;

   /**
    * Конструктор сортирующего энумератора.
    * @param {Types/_chain/Abstract} previous Предыдущее звено.
    * @param {function(*, Number): *} [compareFunction] Функция сравнения.
    * @protected
    */
   constructor(previous: Abstract<T>, compareFunction?: CompareFunction) {
      super(previous);
      this.compareFunction = compareFunction || SortedEnumerator.defaultCompare;
   }

   static defaultCompare(a: any, b: any): number {
      return a === b ? 0 : (a > b ? 1 : -1);
   }

   _getItems(): any[] {
      if (!this._items) {
         const shouldSaveIndices: boolean = this.previous.shouldSaveIndices;
         this._items = super._getItems()
            .map(([index, item]) => new SortWrapper(item, index))
            .sort(this.compareFunction)
            .map((item, index) => {
               const result = [
                  shouldSaveIndices ? SortWrapper.indexOf(item) : index,
                  SortWrapper.valueOf(item)
               ];
               SortWrapper.clear(item);

               return result;
            });
      }

      return this._items;
   }
}

Object.assign(SortedEnumerator.prototype, {
   compareFunction: null
});
