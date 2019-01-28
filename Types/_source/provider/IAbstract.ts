/// <amd-module name="Types/_source/provider/IAbstract" />
/**
 * Интерфейс абстрактного провайдера
 * @interface Types/_source/provider/IAbstract
 * @public
 * @author Мальцев А.А.
 */

export default interface IAbstract /** @lends Types/_source/provider/IAbstract.prototype */{
   readonly '[Types/_source/provider/IAbstract]': boolean;

   /**
    * Вызывает удаленный сервис
    * @param {String} name Имя сервиса
    * @param {Object|Array} [args] Аргументы вызова
    * @return {Promise} Асинхронный результат операции
    */
   call(name: string, args: Array<string> | Object): ExtendPromise<any>;
}
