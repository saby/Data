import DictionaryField from './DictionaryField';

/**
 * Формат перечисляемого поля.
 *
 * Создадим поле c типом "Перечисляемое":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'enum',
 *       dictionary: ['one', 'two', 'three']
 *    };
 * </pre>
 * @class Types/_entity/format/EnumField
 * @extends Types/_entity/format/DictionaryField
 * @public
 * @author Мальцев А.А.
 */
export default class EnumField extends DictionaryField /** @lends Types/_entity/format/EnumField.prototype */{
}

EnumField.prototype['[Types/_entity/format/EnumField]'] = true;
EnumField.prototype._moduleName = 'Types/entity:format.EnumField';
EnumField.prototype._typeName = 'Enum';
