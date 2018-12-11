/// <amd-module name="Types/_chain/FilteredEnumerator" />
/**
 * Фильтрующий энумератор.
 * @public
 * @author Мальцев А.А.
 */
import {IEnumerator} from '../collection';
import Abstract from './Abstract';

interface CallbackFunc {
   (item: any, index: number): boolean;
}

export default class FilteredEnumerator<T> implements IEnumerator<T> {
   readonly '[Types/_collection/IEnumerator]' = true;
   private previous: Abstract<T>;
   private callback: CallbackFunc;
   private callbackContext: Object;
   private enumerator: IEnumerator<T>;

   /**
    * Конструктор фильтрующего энумератора.
    * @param {Types/Chain/Abstract} previous Предыдущее звено.
    * @param {Function(*, Number): Boolean} callback Фильтр
    * @param {Object} [callbackContext] Контекст вызова callback
    */
   constructor(previous: Abstract<T>, callback: CallbackFunc, callbackContext: Object) {
      this.previous = previous;
      this.callback = callback;
      this.callbackContext = callbackContext;
      this.reset();
   }

   getCurrent(): any {
      return this.enumerator.getCurrent();
   }

   getCurrentIndex(): any {
      return this.enumerator.getCurrentIndex();
   }

   moveNext(): boolean {
      while (this.enumerator.moveNext()) {
         if (this.callback.call(
            this.callbackContext,
            this.enumerator.getCurrent(),
            this.enumerator.getCurrentIndex()
         )) {
            return true;
         }
      }

      return false;
   }

   reset() {
      this.enumerator = this.previous.getEnumerator();
   }
}

// @ts-ignore
FilteredEnumerator.prototype.previous = null;
// @ts-ignore
FilteredEnumerator.prototype.callback = null;
// @ts-ignore
FilteredEnumerator.prototype.callbackContext = null;
// @ts-ignore
FilteredEnumerator.prototype.enumerator = null;
