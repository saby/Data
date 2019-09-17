import {ExtendPromise} from '../../_declarations';

/**
 * Интерфейс абстрактного провайдера
 * @interface Types/_source/provider/IAbstract
 * @public
 * @author Мальцев А.А.
 */
export default interface IAbstract {
    readonly '[Types/_source/provider/IAbstract]': boolean;

    /**
     * Вызывает удаленный сервис
     * @param {String} name Имя сервиса
     * @param {Object|Array} [args] Аргументы вызова
     * @return {Promise} Асинхронный результат операции
     */
    call(name: string, args: string[] | Object): ExtendPromise<any>;
}
