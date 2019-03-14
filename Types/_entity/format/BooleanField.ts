import Field from './Field';

/**
 * Формат логического поля.
 *
 * Создадим поле логического типа:
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'boolean'
 *    };
 * </pre>
 * @class Types/_entity/format/BooleanField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */
export default class BooleanField extends Field /** @lends Types/_entity/format/BooleanField.prototype */{
}

BooleanField.prototype['[Types/_entity/format/BooleanField]'] = true;
BooleanField.prototype._moduleName = 'Types/entity:format.BooleanField';
BooleanField.prototype._typeName = 'Boolean';
