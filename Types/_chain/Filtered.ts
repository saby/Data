/// <amd-module name="Types/_chain/Filtered" />
/**
 * Фильтрующее звено цепочки.
 * @class Types/_chain/Filtered
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import FilteredEnumerator from './FilteredEnumerator';

type CallbackFunc = (item: any, index: number) => boolean;

export default class Filtered<T> extends Abstract<T> /** @lends Types/_chain/Filtered.prototype */{
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
    * @param {Types/_chain/Abstract} source Предыдущее звено.
    * @param {Function(*, Number): Boolean} callback Фильтр
    * @param {Object} [callbackContext] Контекст вызова callback
    */
   constructor(source: Abstract<T>, callback: CallbackFunc, callbackContext: Object) {
      super(source);
      this._callback = callback;
      this._callbackContext = callbackContext;
   }

   destroy(): void {
      this._callback = null;
      this._callbackContext = null;
      super.destroy();
   }

   // region Types/_collection/IEnumerable

   getEnumerator(): FilteredEnumerator<T> {
      return new FilteredEnumerator(
         this._previous,
         this._callback,
         this._callbackContext
      );
   }

   // endregion Types/_collection/IEnumerable

   // region Types/_chain/DestroyableMixin

   // endregion Types/_chain/DestroyableMixin
}

Filtered.prototype['[Types/_chain/Filtered]'] = true;
