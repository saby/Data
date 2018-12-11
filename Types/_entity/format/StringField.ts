/// <amd-module name="Types/_entity/format/StringField" />
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
 * @class Types/Format/StringField
 * @extends Types/Format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';

export default class StringField extends Field /** @lends Types/Format/StringField.prototype */{
}

StringField.prototype['[Types/_entity/format/StringField]'] = true;
StringField.prototype._moduleName = 'Types/entity:format.StringField';
StringField.prototype._typeName = 'String';
