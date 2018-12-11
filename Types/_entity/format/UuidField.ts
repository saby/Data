/// <amd-module name="Types/_entity/format/UuidField" />
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
 * @class Types/Format/UuidField
 * @extends Types/Format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';

export default class UuidField extends Field /** @lends Types/Format/UuidField.prototype */{
}

UuidField.prototype['[Types/_entity/format/UuidField]'] = true;
UuidField.prototype._moduleName = 'Types/entity:format.UuidField';
UuidField.prototype._typeName = 'Uuid';
