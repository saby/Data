/**
 * Формат поля UUID.
 *
 * Создадим поле c типом "UUID":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'uuid'
 *    };
 * </pre>
 * @class Types/_entity/format/UuidField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';

export default class UuidField extends Field /** @lends Types/_entity/format/UuidField.prototype */{
}

UuidField.prototype['[Types/_entity/format/UuidField]'] = true;
UuidField.prototype._moduleName = 'Types/entity:format.UuidField';
UuidField.prototype._typeName = 'Uuid';
