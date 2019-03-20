import Abstract from './Abstract';
import UniquelyEnumerator from './UniquelyEnumerator';

type ExtractFunc = (item: any, index: string|number) => string|number;

/**
 * Звено цепочки, обеспечивающее уникальность.
 * @class Types/_chain/Uniquely
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
export default class Uniquely<T> extends Abstract<T> {
   /**
    * Возвращает уникальный идентификатор для каждого элемента.
    */
   protected _idExtractor: ExtractFunc;

   /**
    * Конструктор звена цепочки, обеспечивающего уникальность.
    * @param source Предыдущее звено.
    * @param [idExtractor] Возвращает уникальный идентификатор для каждого элемента.
    */
   constructor(source: Abstract<T>, idExtractor: ExtractFunc) {
      super(source);
      this._idExtractor = idExtractor;
   }

   destroy(): void {
      this._idExtractor = null;
      super.destroy();
   }

   // region IEnumerable

   getEnumerator(): UniquelyEnumerator<T> {
      return new UniquelyEnumerator(
         this._previous,
         this._idExtractor
      );
   }

   // endregion
}

Object.assign(Uniquely.prototype, {
   '[Types/_chain/Uniquely]': true,
   _idExtractor: null
});
