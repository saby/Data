/**
 * Interface of serializable instance
 * @interface Types/_entity/ISerializable
 * @author Мальцев А.А.
 */
export default interface ISerializable {
    readonly '[Types/_entity/IProducible]': boolean;

    /**
     * Instance module name
     */
    _moduleName: string;
}
