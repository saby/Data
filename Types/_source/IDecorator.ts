import ICrud from './ICrud';

/**
 * Интерфейс источника, являющегося декоратором для другого источника
 * @interface Types/_source/IDecorator
 * @public
 * @author Мальцев А.А.
 */
export default interface IDecorator {
    readonly '[Types/_source/IDecorator]': boolean;

    /**
     * Возвращает оригинальный источник данных
     */
    getOriginal<T = ICrud>(): T;
}
