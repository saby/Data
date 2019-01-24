/// <amd-module name="Types/_collection/enumerator/Objectwise" />
/**
 * Энумератор для собственных свойств объекта
 * @class Types/_collection/ObjectEnumerator
 * @implements Types/_collection/IEnumerator
 * @public
 * @author Мальцев А.А.
 */

import IEnumerator from '../IEnumerator';

export default class Objectwise<T> implements IEnumerator<T> /** @lends Types/_collection/ObjectEnumerator.prototype */{
   readonly '[Types/_collection/IEnumerator]' = true;

   /**
    * @property {Object} Объект
    */
   private _items: Object;

   /**
    * @property {Array} Набор свойств объекта
    */
   private _keys: string[];

   /**
    * @property {Number} Текущий индекс
    */
   private _index: number;

   /**
    * @property {function(): Boolean} Фильтр элементов
    */
   private _filter: (item: any, index: any) => boolean;

   /**
    * Конструктор
    * @param {Object} items Массив
    */
   constructor(items: Object) {
      let checkedItems = items;
      if (checkedItems === undefined) {
         checkedItems = {};
      }

      if (!(checkedItems instanceof Object)) {
         throw new Error('Argument items should be an instance of Object');
      }

      this._items = checkedItems;
      this._keys = Object.keys(checkedItems);
   }

   // region Types/_collection/IEnumerator

   getCurrent() {
      if (this._index < 0) {
         return undefined;
      }
      return this._items[this._keys[this._index]];
   }

   moveNext() {
      if (1 + this._index >= this._keys.length) {
         return false;
      }
      this._index++;

      const current = this.getCurrent();
      if (this._filter && !this._filter(current, this.getCurrentIndex())) {
         return this.moveNext();
      }
      return true;
   }

   reset() {
      this._index = -1;
   }

   // endregion Types/_collection/IEnumerator

   // region Public methods

   getCurrentIndex() {
      return this._keys[this._index];
   }

   /**
    * Устанавливает фильтр элементов
    * @param {function(): Boolean} filter Функция обратного вызова, которая должна для каждого элемента вернуть признак,
    * проходит ли он фильтр
    */
   setFilter(filter: (item: any, index: any) => boolean) {
      this._filter = filter;
   }

   // endregion Public methods
}

Objectwise.prototype['[Types/_collection/enumerator/Objectwise]'] = true;
// @ts-ignore
Objectwise.prototype._items = null;
// @ts-ignore
Objectwise.prototype._keys = null;
// @ts-ignore
Objectwise.prototype._index = -1;
// @ts-ignore
Objectwise.prototype._filter = null;
