/// <amd-module name="Types/_entity/format/ObjectField" />
/**
 * Формат поля для JSON-объекта.
 *
 * Создадим поле c типом "JSON-объект":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'object'
 *    };
 * </pre>
 * @class Types/Format/ObjectField
 * @extends Types/Format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';

export default class ObjectField extends Field /** @lends Types/Format/ObjectField.prototype */{
}

ObjectField.prototype['[Types/_entity/format/ObjectField]'] = true;
ObjectField.prototype._moduleName = 'Types/entity:format.ObjectField';
ObjectField.prototype._typeName = 'Object';
