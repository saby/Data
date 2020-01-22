import Field from './Field';
import {register} from '../../di';

/**
 * Формат поля для записи.
 * @remark
 * Создадим поле c типом "Запись":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'record'
 *     };
 * </pre>
 * @class Types/_entity/format/RecordField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */
export default class RecordField extends Field {
}

Object.assign(RecordField.prototype, {
    '[Types/_entity/format/RecordField]': true,
    _moduleName: 'Types/entity:format.RecordField',
    _typeName: 'Record'
});

register('Types/entity:format.RecordField', RecordField, {instantiate: false});
