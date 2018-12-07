/// <amd-module name="Types/_entity/format/BinaryField" />
/**
 * Формат двоичного поля.
 *
 * Создадим поле двоичного типа:
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'binary'
 *    };
 * </pre>
 * @class Types/Format/BinaryField
 * @extends Types/Format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';

export default class BinaryField extends Field /** @lends Types/Format/BinaryField.prototype */{
}

BinaryField.prototype['[Types/_entity/format/BinaryField]'] = true;
BinaryField.prototype._moduleName = 'Types/entity:format.BinaryField';
BinaryField.prototype._typeName = 'Binary';
