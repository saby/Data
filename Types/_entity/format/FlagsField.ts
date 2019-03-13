/**
 * Формат поля флагов.
 *
 * Создадим поле c типом "Флаги":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'flags',
 *       dictionary: ['one', 'two', 'three']
 *    };
 * </pre>
 * @class Types/_entity/format/FlagsField
 * @extends Types/_entity/format/DictionaryField
 * @public
 * @author Мальцев А.А.
 */

import DictionaryField from './DictionaryField';

export default class FlagsField extends DictionaryField /** @lends Types/_entity/format/FlagsField.prototype */{
}

FlagsField.prototype['[Types/_entity/format/FlagsField]'] = true;
FlagsField.prototype._moduleName = 'Types/entity:format.FlagsField';
FlagsField.prototype._typeName = 'Flags';
