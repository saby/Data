/**
 * Интерфейс объектов, которые могут сохранять свое состояние.
 * @interface Types/_entity/IStateful
 * @public
 * @author Мальцев А.А.
 */

/*
 * An interface that can save its state.
 * @interface Types/_entity/IStateful
 * @public
 * @author Мальцев А.А.
 */
export default interface IStateful {
    readonly '[Types/_entity/IStateful]': boolean;

    /**
     * Returns state for this instance.
     */
    getInstanceState<T>(): T;
}
