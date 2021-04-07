import { ICacheParameters } from '../Remote';
import { EntityMarker } from '../../_declarations';

/**
 * Интерфейс абстрактного провайдера
 * @interface Types/_source/provider/IAbstract
 * @public
 * @author Кудрявцев И.С.
 */
export default interface IAbstract {
    readonly '[Types/_source/provider/IAbstract]': EntityMarker;

    /**
     * Вызывает удаленный сервис
     * @param name Имя сервиса
     * @param args Аргументы вызова
     * @return Асинхронный результат операции
     */
    call<T>(name: string, args: string[] | Object, cache?: ICacheParameters, httpMethod?: string): Promise<T>;
}
