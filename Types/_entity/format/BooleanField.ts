import Field from './Field';
import {register} from '../../di';

/**
 * Формат логического поля.
 * @remark
 * Создадим поле логического типа:
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'boolean'
 *     };
 * </pre>
 * @class Types/_entity/format/BooleanField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */
export default class BooleanField extends Field {
}

Object.assign(BooleanField.prototype, {
    '[Types/_entity/format/BooleanField]': true,
    _moduleName: 'Types/entity:format.BooleanField',
    _typeName: 'Boolean'
});

register('Types/entity:format.BooleanField', BooleanField, {instantiate: false});
