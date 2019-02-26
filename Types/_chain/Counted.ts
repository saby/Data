/// <amd-module name="Types/_chain/Counted" />
/**
 * Агрегирующее звено цепочки, подсчитывающие количество элементов, объединенных по какому-то принципу.
 * @class Types/_chain/Counted
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import {enumerator} from '../collection';
import {Map} from '../shim';

type KeyFunc = (key: any) => string;

export default class Counted<T> extends Abstract<T> /** @lends Types/_chain/Counted.prototype */{
   /**
    * @property {String|Function} Функция, возвращающая ключ группировки для каждого элемента
    */
   protected _key: string|KeyFunc;

   /**
    * Конструктор агрегирующего звена цепочки, подсчитывающего количество элементов, объединенных по какому-то принципу.
    * @param {Types/_chain/Abstract} source Предыдущее звено.
    * @param {String|function(*): String} key Поле агрегации или функция агрегации для каждого элемента.
    */
   constructor(source: Abstract<T>, key: string|KeyFunc) {
      super(source);
      this._key = key;
   }

   destroy(): void {
      this._key = null;
      super.destroy();
   }

   // region Types/_collection/IEnumerable

   getEnumerator(): enumerator.Mapwise<T> {
      const toKey = Abstract.propertyMapper(this._key);

      return new enumerator.Mapwise(
         this._previous.reduce((memo, item, index) => {
            const key = toKey(item, index);
            const count = memo.has(key) ? memo.get(key) : 0;
            memo.set(key, count + 1);
            return memo;
         },
         new Map())
      );
   }

   // endregion Types/_collection/IEnumerable
}

Object.assign(Counted.prototype, {
   '[Types/_chain/Counted]': true,
   _key: null
});
