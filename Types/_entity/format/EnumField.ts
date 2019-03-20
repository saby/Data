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
export default class EnumField extends DictionaryField {
}

Object.assign(EnumField.prototype, {
   '[Types/_entity/format/EnumField]': true,
   _moduleName: 'Types/entity:format.EnumField',
   _typeName: 'Enum'
});
