/// <amd-module name="Types/_chain/SlicedEnumerator" />
/**
 * Вырезающий энумератор
 * @author Мальцев А.А.
 */

import {IEnumerator} from '../collection';
import Abstract from './Abstract';

export default class SlicedEnumerator<T> implements IEnumerator<T> {
   readonly '[Types/_collection/IEnumerator]' = true;
   private previous: Abstract<T>;
   private begin: number;
   private end: number;
   private now: number;
   private enumerator: IEnumerator<T>;

   /**
    * Конструктор вырезающего энумератора.
    * @param {Types/Chain/Abstract} previous Предыдущее звено.
    * @param {Number} begin Индекс, по которому начинать извлечение
    * @param {Number} end Индекс, по которому заканчивать извлечение (будут извлечены элементы с индексом меньше end)
    * @protected
    */
   constructor(previous: Abstract<T>, begin: number, end: number) {
      this.previous = previous;
      this.begin = begin;
      this.end = end;
      this.reset();
   }

   getCurrent(): any {
      return this.enumerator.getCurrent();
   }

   getCurrentIndex(): any {
      return this.enumerator.getCurrentIndex();
   }

   moveNext(): boolean {
      while (this.now < this.begin - 1 && this.enumerator.moveNext()) {
         this.now++;
      }

      const next = this.now + 1;
      if (
         next >= this.begin &&
         next < this.end &&
         this.enumerator.moveNext()
      ) {
         this.now = next;
         return true;
      }

      return false;
   }

   reset() {
      this.enumerator = this.previous.getEnumerator();
      this.now = -1;
   }
}

// @ts-ignore
SlicedEnumerator.prototype.previous = null;
// @ts-ignore
SlicedEnumerator.prototype.now = 0;
// @ts-ignore
SlicedEnumerator.prototype.begin = 0;
// @ts-ignore
SlicedEnumerator.prototype.end = 0;
// @ts-ignore
SlicedEnumerator.prototype.enumerator = null;
