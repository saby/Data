import Field from './Field';

/**
 * Формат поля для строк.
 *
 * Создадим поле c типом "Строка":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'string'
 *    };
 * </pre>
 * @class Types/_entity/format/StringField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */
export default class StringField extends Field /** @lends Types/_entity/format/StringField.prototype */{
}

StringField.prototype['[Types/_entity/format/StringField]'] = true;
StringField.prototype._moduleName = 'Types/entity:format.StringField';
StringField.prototype._typeName = 'String';
