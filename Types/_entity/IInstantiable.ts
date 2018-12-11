/// <amd-module name="Types/_entity/IInstantiable" />
/**
 * Интерфейс получения уникального идентификатора для экземпляра класса
 * @interface Types/Entity/IInstantiable
 * @public
 * @author Мальцев А.А.
 */

export default interface IInstantiable /** @lends Types/Entity/IInstantiable.prototype */{
   readonly '[Types/_entity/IInstantiable]': boolean;

   /**
    * Возвращает уникальный идентификатор экземпляра класса.
    * @return {String}
    */
   getInstanceId(): string;
}
