/**
 * Тип данных "Первичный ключ".
 * Представляет собой обертку, хранящую оригинальное значение.
 * @class Types/_entity/applied/PrimaryKey
 * @public
 * @author Мальцев А.А.
 * @example
 * <pre>
 *     import {applied} from 'Types/entity';
 *
 *     const pk = new applied.PrimaryKey(123);
 *     console.log(pk + 1); // 124
 * </pre>
 */
export default class PrimaryKey<T> {
    constructor(protected _value: T) {
    }

    // region Object

    /**
     * Returns original value.
     * See {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf} for details.
     */
    valueOf(): T {
        return this._value;
    }

    /**
     * Returns serialized value interpretation.
     * See {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify} for details.
     */
    toJSON(): T {
        return this._value;
    }

    // endregion
}

PrimaryKey.prototype['[Types/_entity/applied/PrimaryKey]'] = true;
