import { ICacheParameters } from '../Remote';

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
     * @param name Имя сервиса
     * @param args Аргументы вызова
     * @return Асинхронный результат операции
     */
    call<T>(name: string, args: string[] | Object, cache?: ICacheParameters): Promise<T>;
}
