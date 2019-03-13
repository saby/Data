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
 * @class Types/_entity/format/BinaryField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';

export default class BinaryField extends Field /** @lends Types/_entity/format/BinaryField.prototype */{
}

BinaryField.prototype['[Types/_entity/format/BinaryField]'] = true;
BinaryField.prototype._moduleName = 'Types/entity:format.BinaryField';
BinaryField.prototype._typeName = 'Binary';
