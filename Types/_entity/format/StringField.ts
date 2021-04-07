import Field from './Field';
import {register} from '../../di';

/**
 * Формат поля для строк.
 * @remark
 * Создадим поле c типом "Строка":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'string'
 *     };
 * </pre>
 * @class Types/_entity/format/StringField
 * @extends Types/_entity/format/Field
 * @public
 * @author Кудрявцев И.С.
 */
export default class StringField extends Field {
}

Object.assign(StringField.prototype, {
    '[Types/_entity/format/StringField]': true,
    _moduleName: 'Types/entity:format.StringField',
    _typeName: 'String'
});

register('Types/entity:format.StringField', StringField, {instantiate: false});
