/// <amd-module name="Types/_collection/enumerator/Mapwise" />
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
   readonly '[Types/_collection/IEnumerator]' = true;

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
   protected _cachedKeys: Array<string>;

   /**
    * @property {Array} Ключи
    */
   get _keys() {
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

   getCurrent() {
      return this._index === -1 ? undefined : this._items.get(this._keys[this._index]);
   }

   moveNext() {
      const keys = this._keys;
      if (this._index >= keys.length - 1) {
         return false;
      }

      this._index++;
      return true;
   }

   reset() {
      this._cachedKeys = undefined;
      this._index = -1;
   }

   // endregion Types/_collection/IEnumerator

   // region Public methods

   getCurrentIndex() {
      return this._keys[this._index];
   }

   // endregion Public methods
}

Object.assign(Mapwise.prototype,{
   '[Types/_collection/enumerator/Mapwise]': true,
   _items: null,
   _index: -1,
   _cachedKeys: undefined
});
