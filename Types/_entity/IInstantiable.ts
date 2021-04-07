import { EntityMarkerCompat as EntityMarker } from '../_declarations';

/**
 * Интерфейс получения уникального идентификатора для экземпляра класса
 * @interface Types/_entity/IInstantiable
 * @public
 * @author Кудрявцев И.С.
 */
export default interface IInstantiable {
    readonly '[Types/_entity/IInstantiable]': EntityMarker;

    /**
     * Возвращает уникальный идентификатор экземпляра класса.
     */
    getInstanceId(): string;
}
