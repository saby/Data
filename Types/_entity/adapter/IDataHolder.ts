import { EntityMarker } from '../../_declarations';

/**
 * Адаптер, содержащий данные для поддержки процессов инициализации.
 * @interface Types/_entity/adapter/IDataHolder
 * @public
 * @author Мальцев А.А.
 */

/*
 * An adapter which holds some data which helps to maintain processes of initialization.
 * @interface Types/_entity/adapter/IDataHolder
 * @public
 * @author Мальцев А.А.
 */
export default interface IDataHolder<T> {
    readonly '[Types/_entity/adapter/IDataHolder]': EntityMarker;

    /**
     * Свойство для хранения данных.
     */

    /*
     * А property to hold the data
     */
    dataReference: T;
}
