/**
 * Интерфейс сериализуемого объекта.
 * @interface Types/_entity/ISerializable
 * @author Мальцев А.А.
 */

/*
 * Interface of serializable instance
 * @interface Types/_entity/ISerializable
 * @author Мальцев А.А.
 */
export default interface ISerializable {
    readonly '[Types/_entity/ISerializable]': boolean;

    /**
     * Instance module name
     */
    _moduleName: string;
}
