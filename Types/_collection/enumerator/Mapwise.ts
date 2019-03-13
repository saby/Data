/**
 * Энумератор для Map
 * @class Types/_collection/MapEnumerator
 * @implements Types/_collection/IEnumerator
 * @public
 * @author Мальцев А.А.
 */

import IEnumerator from '../IEnumerator';
import {Map} from '../../shim';

export default class Mapwise<T> implements IEnumerator<T> /** @lends Types/_collection/MapEnumerator.prototype */{
   /**
    * @property {Map} Объект
    */
   protected _items: Map<any, T>;
   /**
    * @property {Number} Текущий индекс
    */
   protected _index: number;

   /**
    * @property {Array} Кэш ключей
    */
   protected _cachedKeys: string[];

   /**
    * @property {Array} Ключи
    */
   get _keys(): any[] {
      if (!this._cachedKeys) {
         const keys = [];
         this._items.forEach((value, key) => {
            keys.push(key);
         });
         this._cachedKeys = keys;
      }
      return this._cachedKeys;
   }

   /**
    * Конструктор
    * @param {Map} items Массив
    */
   constructor(items: Map<any, any>) {
      if (items === undefined) {
         items = new Map();
      }
      if (!(items instanceof Map)) {
         throw new Error('Argument items should be an instance of Map');
      }
      this._items = items;
   }

   // region Types/_collection/IEnumerator

   readonly '[Types/_collection/IEnumerator]': boolean = true;

   getCurrent(): any {
      return this._index === -1 ? undefined : this._items.get(this._keys[this._index]);
   }

   moveNext(): boolean {
      const keys = this._keys;
      if (this._index >= keys.length - 1) {
         return false;
      }

      this._index++;
      return true;
   }

   reset(): void {
      this._cachedKeys = undefined;
      this._index = -1;
   }

   // endregion Types/_collection/IEnumerator

   // region Public methods

   getCurrentIndex(): any {
      return this._keys[this._index];
   }

   // endregion Public methods
}

Object.assign(Mapwise.prototype, {
   '[Types/_collection/enumerator/Mapwise]': true,
   _items: null,
   _index: -1,
   _cachedKeys: undefined
});
