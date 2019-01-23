/// <amd-module name="Types/_entity/IProducible" />
/**
 * Интерфейс получения экземпляра класса через фабричный метод
 * @interface Types/_entity/IProducible
 * @author Мальцев А.А.
 */

export default interface IProducible extends Object {
   readonly '[Types/_entity/IProducible]': boolean;
}

export interface IProducibleConstructor extends Function {
   /**
    * @name Types/_entity/IProducible#produceInstance
    * @function
    * Создает экземпляр класса.
    * @param {*} [data] Исходные данные.
    * @param {Object} [options] Дополнительные данные.
    * @return {Object}
    */
   produceInstance(data?: any, options?: any): any;
}
