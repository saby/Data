import { EntityMarker } from '../_declarations';

/**
 * Интерфейс объектов, которые могут сохранять свое состояние.
 * @interface Types/_entity/IStateful
 * @public
 * @author Кудрявцев И.С.
 */

/*
 * An interface that can save its state.
 * @interface Types/_entity/IStateful
 * @public
 * @author Кудрявцев И.С.
 */
export default interface IStateful {
    readonly '[Types/_entity/IStateful]': EntityMarker;

    /**
     * Returns state for this instance.
     */
    getInstanceState<T>(): T;
}
