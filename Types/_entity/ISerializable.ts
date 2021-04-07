import { EntityMarker } from '../_declarations';

/**
 * Интерфейс сериализуемого объекта.
 * @interface Types/_entity/ISerializable
 * @author Кудрявцев И.С.
 */

/*
 * Interface of serializable instance
 * @interface Types/_entity/ISerializable
 * @author Кудрявцев И.С.
 */
export default interface ISerializable {
    readonly '[Types/_entity/ISerializable]': EntityMarker;

    /**
     * Instance module name
     */
    _moduleName: string;
}
