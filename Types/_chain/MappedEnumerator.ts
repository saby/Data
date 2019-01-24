/// <amd-module name="Types/_chain/MappedEnumerator" />
/**
 * Преобразующующий энумератор
 * @author Мальцев А.А.
 */

import {IEnumerator} from '../collection';
import Abstract from './Abstract';

interface MapFunc {
   (item: any, index: number): any;
}

export default class MappedEnumerator<T> implements IEnumerator<T> {
   readonly '[Types/_collection/IEnumerator]' = true;
   private previous: any;
   private callback: MapFunc;
   private callbackContext: Object;
   private enumerator: IEnumerator<T>;
   private current: any;

   /**
    * Конструктор преобразующего энумератора.
    * @param {Types/_chain/Abstract} previous Предыдущее звено.
    * @param {Function(*, Number): *} callback Функция, возвращающая новый элемент.
    * @param {Object} [callbackContext] Контекст вызова callback
    */
   constructor(previous: Abstract<T>, callback: MapFunc, callbackContext?: Object) {
      this.previous = previous;
      this.callback = callback;
      this.callbackContext = callbackContext;
      this.reset();
   }

   getCurrent(): any {
      return this.current;
   }

   getCurrentIndex(): any {
      return this.enumerator.getCurrentIndex();
   }

   moveNext(): boolean {
      if (this.enumerator.moveNext()) {
         this.current = this.callback.call(
            this.callbackContext,
            this.enumerator.getCurrent(),
            this.enumerator.getCurrentIndex()
         );
         return true;
      }

      return false;
   }

   reset() {
      this.enumerator = this.previous.getEnumerator();
      this.current = undefined;
   }
}

// @ts-ignore
MappedEnumerator.prototype.previous = null;
// @ts-ignore
MappedEnumerator.prototype.callback = null;
// @ts-ignore
MappedEnumerator.prototype.callbackContext = null;
// @ts-ignore
MappedEnumerator.prototype.enumerator = null;
// @ts-ignore
MappedEnumerator.prototype.current = null;
