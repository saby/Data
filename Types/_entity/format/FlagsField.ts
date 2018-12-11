/// <amd-module name="Types/_entity/format/FlagsField" />
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
 * @class Types/Format/FlagsField
 * @extends Types/Format/DictionaryField
 * @public
 * @author Мальцев А.А.
 */

import DictionaryField from './DictionaryField';

export default class FlagsField extends DictionaryField /** @lends Types/Format/FlagsField.prototype */{
}

FlagsField.prototype['[Types/_entity/format/FlagsField]'] = true;
FlagsField.prototype._moduleName = 'Types/entity:format.FlagsField';
FlagsField.prototype._typeName = 'Flags';
