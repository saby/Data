/// <amd-module name="Types/_chain/Filtered" />
/**
 * Фильтрующее звено цепочки.
 * @class Types/Chain/Filtered
 * @extends Types/Chain/Abstract
 * @public
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import FilteredEnumerator from './FilteredEnumerator';

interface CallbackFunc {
   (item: any, index: number): boolean;
}

export default class Filtered<T> extends Abstract<T> /** @lends Types/Chain/Filtered.prototype */{
   /**
    * @property {Function(*, Number): Boolean} Фильтр
    */
   protected _callback: CallbackFunc;

   /**
    * @property {Object} Контекст вызова _callback
    */
   protected _callbackContext: Object;

   /**
    * Конструктор фильтрующего звена цепочки.
    * @param {Types/Chain/Abstract} source Предыдущее звено.
    * @param {Function(*, Number): Boolean} callback Фильтр
    * @param {Object} [callbackContext] Контекст вызова callback
    */
   constructor(source: Abstract<T>, callback: CallbackFunc, callbackContext: Object) {
      super(source);
      this._callback = callback;
      this._callbackContext = callbackContext;
   }

   destroy() {
      this._callback = null;
      this._callbackContext = null;
      super.destroy();
   }

   // region Types/Collection/IEnumerable

   getEnumerator(): FilteredEnumerator<T> {
      return new FilteredEnumerator(
         this._previous,
         this._callback,
         this._callbackContext
      );
   }

   // endregion Types/Collection/IEnumerable

   // region Types/Chain/DestroyableMixin

   // endregion Types/Chain/DestroyableMixin
}

Filtered.prototype['[Types/_chain/Filtered]'] = true;
