import Field from './Field';

/**
 * Формат вещественного поля.
 * @remark
 * Создадим поле вещественного типа:
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'real',
 *         precision: 4
 *     };
 * </pre>
 * @class Types/_entity/format/RealField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */
export default class RealField extends Field {
    _$defaultValue: number;

    /**
     * @cfg {Number} Максимальное количество знаков в дробной части
     * @name Types/_entity/format/RealField#precision
     * @see getPrecision
     * @see setPrecision
     */
    _$precision: number;

    // region Public methods

    /**
     * Возвращает максимальное количество знаков в дробной части
     * @return {Number}
     * @see precision
     * @see setPrecision
     */
    getPrecision(): number {
        return this._$precision;
    }

    /**
     * Устанавливает максимальное количество знаков в дробной части
     * @param {Number} value
     * @see precision
     * @see getPrecision
     */
    setPrecision(value: number): void {
        this._$precision = value;
    }

    // endregion Public methods
}

export const DEFAULT_PRECISION = 16;

Object.assign(RealField.prototype, {
    '[Types/_entity/format/RealField]': true,
    _moduleName: 'Types/entity:format.RealField',
    _typeName: 'Real',
    _$defaultValue: 0,
    _$precision: DEFAULT_PRECISION,
});
