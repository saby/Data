/// <amd-module name="Types/_chain/Uniquely" />
/**
 * Звено цепочки, обеспечивающее уникальность.
 * @class Types/_chain/Uniquely
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import UniquelyEnumerator from './UniquelyEnumerator';

interface ExtractFunc {
   (item: any, index: string|number): string|number;
}

export default class Uniquely<T> extends Abstract<T> /** @lends Types/_chain/Uniquely.prototype */{
   /**
    * @property {function(*): String|Number} [idExtractor] Возвращает уникальный идентификатор для каждого элемента.
    */
   protected _idExtractor: ExtractFunc;

   /**
    * Конструктор звена цепочки, обеспечивающего уникальность.
    * @param {Types/_chain/Abstract} source Предыдущее звено.
    * @param {function(*): String|Number} [idExtractor] Возвращает уникальный идентификатор для каждого элемента.
    */
   constructor(source: Abstract<T>, idExtractor: ExtractFunc) {
      super(source);
      this._idExtractor = idExtractor;
   }

   destroy() {
      this._idExtractor = null;
      super.destroy();
   }

   // region Types/_collection/IEnumerable

   getEnumerator(): UniquelyEnumerator<T> {
      return new UniquelyEnumerator(
         this._previous,
         this._idExtractor
      );
   }

   // endregion Types/_collection/IEnumerable
}

Uniquely.prototype['[Types/_chain/Uniquely]'] = true;
// @ts-ignore
Uniquely.prototype._idExtractor = null;
