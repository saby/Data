/// <amd-module name="Types/_chain/FlattenedEnumerator" />
/**
 * Разворачивающий энумератор
 */
import FlattenedMover from './FlattenedMover';
import {IEnumerator} from '../collection';
import Abstract from './Abstract';

export default class FlattenedEnumerator<T> implements IEnumerator<T> {
   readonly '[Types/_collection/IEnumerator]' = true;
   private previous: Abstract<T>;
   private mover: FlattenedMover;
   private index: number;

   /**
    * Конструктор разворачивающего энумератора.
    * @param {Types/_chain/Abstract} previous Предыдущее звено.
    * @protected
    */
   constructor(previous: Abstract<T>) {
      this.previous = previous;
      this.reset();
   }

   getCurrent(): any {
      return this.mover ? this.mover.getCurrent() : undefined;
   }

   getCurrentIndex(): any {
      return this.index;
   }

   moveNext(): boolean {
      this.mover = this.mover || (this.mover = new FlattenedMover(this.previous.getEnumerator()));
      const hasNext = this.mover.moveNext();
      if (hasNext) {
         this.index++;
      }
      return hasNext;
   }

   reset() {
      this.mover = null;
      this.index = -1;
   }
}

// @ts-ignore
FlattenedEnumerator.prototype.previous = null;
// @ts-ignore
FlattenedEnumerator.prototype.mover = null;
// @ts-ignore
FlattenedEnumerator.prototype.index = null;
