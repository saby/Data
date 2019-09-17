/**
 * Интерфейс получения уникального идентификатора для экземпляра класса
 * @interface Types/_entity/IInstantiable
 * @public
 * @author Мальцев А.А.
 */
export default interface IInstantiable {
    readonly '[Types/_entity/IInstantiable]': boolean;

    /**
     * Возвращает уникальный идентификатор экземпляра класса.
     */
    getInstanceId(): string;
}
