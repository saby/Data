/**
 * Интерфейс получения уникального идентификатора для экземпляра класса
 * @interface Types/_entity/IInstantiable
 * @public
 * @author Мальцев А.А.
 */
export default interface IInstantiable /** @lends Types/_entity/IInstantiable.prototype */{
   readonly '[Types/_entity/IInstantiable]': boolean;

   /**
    * Возвращает уникальный идентификатор экземпляра класса.
    * @return {String}
    */
   getInstanceId(): string;
}
