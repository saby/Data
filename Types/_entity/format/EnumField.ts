import DictionaryField from './DictionaryField';
import {register} from '../../di';

/**
 * Формат перечисляемого поля.
 * @remark
 * Создадим поле c типом "Перечисляемое":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'enum',
 *         dictionary: ['one', 'two', 'three']
 *     };
 * </pre>
 * Измением значение поля enum.
 * <pre>
 *    import {Record} from 'Types/entity';
 *
 *    const record = new Record({
 *        format: {
 *            foo: {
 *                type: 'enum',
 *                dictionary: ['one', 'two', 'three']
 *            }
 *        },
 *        rawData: {
 *            foo: 1
 *        }
 *    });
 *
 *    record.get('foo').set(2);
 *    record.get('foo').get(); // 2
 * </pre>
 * @class Types/_entity/format/EnumField
 * @extends Types/_entity/format/DictionaryField
 * @public
 * @author Кудрявцев И.С.
 */
export default class EnumField extends DictionaryField {
}

Object.assign(EnumField.prototype, {
    '[Types/_entity/format/EnumField]': true,
    _moduleName: 'Types/entity:format.EnumField',
    _typeName: 'Enum'
});

register('Types/entity:format.EnumField', EnumField, {instantiate: false});
