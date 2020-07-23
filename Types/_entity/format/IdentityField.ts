import Field from './Field';
import {register} from '../../di';

/**
 * Формат поля для идентификатора.
 * @remark
 * Создадим поле c типом "Идентификатор":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'identity'
 *     };
 * </pre>
 * @class Types/_entity/format/IdentityField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */
export default class IdentityField extends Field {
    /**
     * @cfg {Array.<Number>} Значение поля по умолчанию
     * @name Types/_entity/format/IdentityField#defaultValue
     * @see getDefaultValue
     * @see setDefaultValue
     */
    protected _$defaultValue: any[];

    protected _separator: string;

    // region Public methods

    /**
     * Возвращает разделитель
     * @return {String}
     */
    getSeparator(): string {
        return this._separator;
    }

    // endregion Public methods
}

Object.assign(IdentityField.prototype, {
    '[Types/_entity/format/IdentityField]': true,
    _moduleName: 'Types/entity:format.IdentityField',
    _typeName: 'Identity',
    _separator: ',',
    _$defaultValue: [null]
});

register('Types/entity:format.IdentityField', IdentityField, {instantiate: false});
