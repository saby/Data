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

   readonly '[Types/_collection/IEnumerator]': boolean = true;

   getCurrent(): T {
      if (this._index < 0) {
         return undefined;
      }
      return this._items[this._keys[this._index]];
   }

   moveNext(): boolean {
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

   reset(): void {
      this._index = -1;
   }

   // endregion Types/_collection/IEnumerator

   // region Public methods

   getCurrentIndex(): string {
      return this._keys[this._index];
   }

   /**
    * Устанавливает фильтр элементов
    * @param {function(): Boolean} filter Функция обратного вызова, которая должна для каждого элемента вернуть признак,
    * проходит ли он фильтр
    */
   setFilter(filter: (item: any, index: any) => boolean): void {
      this._filter = filter;
   }

   // endregion Public methods
}

Object.assign(Objectwise.prototype, {
   '[Types/_collection/enumerator/Objectwise]': true,
   _items: null,
   _keys: null,
   _index: -1,
   _filter: null
});
