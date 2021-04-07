import Field from './Field';
import {register} from '../../di';

/**
 * Формат поля для JSON-объекта.
 * @remark
 * Создадим поле c типом "JSON-объект":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'object'
 *     };
 * </pre>
 * @class Types/_entity/format/ObjectField
 * @extends Types/_entity/format/Field
 * @public
 * @author Кудрявцев И.С.
 */
export default class ObjectField extends Field {
}

Object.assign(ObjectField.prototype, {
    '[Types/_entity/format/ObjectField]': true,
    _moduleName: 'Types/entity:format.ObjectField',
    _typeName: 'Object'
});

register('Types/entity:format.ObjectField', ObjectField, {instantiate: false});
