/**
 * Вырезающее звено цепочки.
 * @class Types/_chain/Sliced
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import SlicedEnumerator from './SlicedEnumerator';

export default class Sliced<T> extends Abstract<T> /** @lends Types/_chain/Sliced.prototype */{
   /**
    * @property {Number} Индекс, по которому начинать извлечение
    */
   protected _begin: number;
   /**
    * @property {Number} Индекс, по которому заканчивать извлечение (будут извлечены элементы с индексом меньше end)
    */
   protected _end: number;

   /**
    * Конструктор вырезающего звена цепочки.
    * @param {Types/_chain/Abstract} source Предыдущее звено.
    * @param {Number} begin Индекс, по которому начинать извлечение
    * @param {Number} end Индекс, по которому заканчивать извлечение (будут извлечены элементы с индексом меньше end)
    */
   constructor(source: Abstract<T>, begin: number, end: number) {
      super(source);
      this._begin = begin;
      this._end = end;
   }

   // region Types/_collection/IEnumerable

   getEnumerator(): SlicedEnumerator<T> {
      return new SlicedEnumerator(
         this._previous,
         this._begin,
         this._end
      );
   }

   // endregion Types/_collection/IEnumerable
}

Object.assign(Sliced.prototype, {
   '[Types/_chain/Sliced]': true,
   _begin: 0,
   _end: 0
});
