/// <amd-module name="Types/_chain/ConcatenatedEnumerator" />
/**
 * Объединяющий энумератор.
 * @public
 * @author Мальцев А.А.
 */

import {enumerator, IEnumerable, IEnumerator} from '../collection';
import Abstract from './Abstract';

export default class ConcatenatedEnumerator<T> implements IEnumerator<T> {
   readonly '[Types/_collection/IEnumerator]': boolean = true;
   private previous: Abstract<T>;
   private items: Array<any | IEnumerable<T>>;
   private enumerator: IEnumerator<T>;
   private current: any;
   private index: any;
   private currentItem: any;
   private currentItemIndex: number;

   /**
    * Конструктор объединяющего энумератора.
    * @param {Types/_chain/Abstract} previous Предыдущее звено.
    * @param {Array.<Array>|Array.<Types/_collection/IEnumerable>} items Коллекции для объединения.
    */
   constructor(previous: Abstract<T>, items: Array<any | IEnumerable<T>>) {
      this.previous = previous;
      this.items = items;
      this.reset();
   }

   getCurrent(): any {
      return this.current;
   }

   getCurrentIndex(): any {
      return this.index;
   }

   moveNext(): boolean {
      this.enumerator = this.enumerator || (this.enumerator = this.previous.getEnumerator());

      let hasNext = this.enumerator.moveNext();
      if (hasNext) {
         this.current = this.enumerator.getCurrent();
         this.index++;
         return hasNext;
      }

      if (this.currentItem) {
         hasNext = this.currentItem.moveNext();
         if (hasNext) {
            this.current = this.currentItem.getCurrent();
            this.index++;
            return hasNext;
         }
      }

      if (this.currentItemIndex < this.items.length - 1) {
         this.currentItemIndex++;
         this.currentItem = this.items[this.currentItemIndex];
         if (this.currentItem instanceof Array) {
            this.currentItem = new enumerator.Arraywise(this.currentItem);
         } else if (this.currentItem && this.currentItem['[Types/_collection/IEnumerable]']) {
            this.currentItem = this.currentItem.getEnumerator();
         } else {
            throw new TypeError(
               `Collection at argument ${this.currentItemIndex} should implement [Types/collection#IEnumerable]`
            );
         }
         return this.moveNext();
      }

      return false;
   }

   reset(): void {
      this.enumerator = null;
      this.index = -1;
      this.current = undefined;
      this.currentItem = null;
      this.currentItemIndex = -1;
   }
}

Object.assign(ConcatenatedEnumerator.prototype, {
   previous: null,
   items: null,
   enumerator: null,
   index: null,
   current: undefined,
   currentItem: null,
   currentItemIndex: null
});
