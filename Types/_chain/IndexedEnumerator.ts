/// <amd-module name="Types/_chain/IndexedEnumerator" />
/**
 * Индексирующий энумератор
 * @author Мальцев А.А.
 */
import Abstract from './Abstract';
import {IEnumerator} from '../collection';

export default class IndexedEnumerator<T> implements IEnumerator<T> {
   readonly '[Types/_collection/IEnumerator]' = true;
   protected previous: Abstract<T>;
   private index: number;
   protected _items: Array<any>;

   /**
    * Конструктор.
    * @param {Types/Chain/Abstract} previous Предыдущее звено.
    */
   constructor(previous: Abstract<T>) {
      this.previous = previous;
      this.reset();
   }

   getCurrent(): any {
      const items = this._getItems();
      const current = items[this.index];
      return current ? current[1] : undefined;
   }

   getCurrentIndex(): any {
      const items = this._getItems();
      const current = items[this.index];
      return current ? current[0] : -1;
   }

   moveNext(): boolean {
      if (this.index >= this._getItems().length - 1) {
         return false;
      }
      this.index++;
      return true;
   }

   reset() {
      this._items = null;
      this.index = -1;
   }

   _getItems(): Array<any> {
      if (!this._items) {
         this._items = [];
         const enumerator = this.previous.getEnumerator();
         while (enumerator.moveNext()) {
            this._items.push([enumerator.getCurrentIndex(), enumerator.getCurrent()]);
         }
      }

      return this._items;
   }
}

// @ts-ignore
IndexedEnumerator.prototype.previous = null;
// @ts-ignore
IndexedEnumerator.prototype.index = -1;
// @ts-ignore
IndexedEnumerator.prototype._items = null;
