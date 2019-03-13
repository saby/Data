/**
 * Группирующее звено цепочки.
 * @class Types/_chain/Grouped
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import {enumerator} from '../collection';
import {Map} from '../shim';

type GroupFunc = (item: any) => string;

type ValueFunc = (item: any) => any;

export default class Grouped<T> extends Abstract<T> /** @lends Types/_chain/Grouped.prototype */{
   /**
    * @property {String|Function} Функция, возвращающая ключ группировки для каждого элемента
    */
   protected _key: string|GroupFunc;

   /**
    * @property {String|Function} Функция, возвращающая значение для каждого элемента
    */
   protected _value: string|ValueFunc;

   /**
    * Конструктор группирующего звена цепочки.
    * @param {Types/_chain/Abstract} source Предыдущее звено.
    * @param {String|function(*): String} key Поле группировки или функция группировки для каждого элемента.
    * @param {String|function(*): *} [value] Поле значения или функция, возвращающая значение для каждого элемента.
    */
   constructor(source: Abstract<T>, key: string|GroupFunc, value: string|ValueFunc) {
      super(source);
      this._key = key;
      this._value = value;
   }

   destroy(): void {
      this._key = null;
      this._value = null;
      super.destroy();
   }

   // region Types/_collection/IEnumerable

   getEnumerator(): enumerator.Mapwise<T> {
      const toKey = Abstract.propertyMapper(this._key);
      const toValue = Abstract.propertyMapper(this._value);

      return new enumerator.Mapwise(
         this._previous.reduce((memo, item, index) => {
            const key = toKey(item, index);
            const value = toValue(item, index);
            let group;

            if (memo.has(key)) {
               group = memo.get(key);
            } else {
               group = [];
               memo.set(key, group);
            }
            group.push(value);

            return memo;
         },
         new Map())
      );
   }

   // endregion Types/_collection/IEnumerable
}

Object.assign(Grouped.prototype, {
   '[Types/_chain/Grouped]': true,
   _key: null,
   _value: null
});
