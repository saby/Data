import Field from './Field';
import {register} from '../../di';

/**
 * Формат двоичного поля.
 * @remark
 * Создадим поле двоичного типа:
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'binary'
 *     };
 * </pre>
 * @class Types/_entity/format/BinaryField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */
export default class BinaryField extends Field {
}

Object.assign(BinaryField.prototype, {
    '[Types/_entity/format/BinaryField]': true,
    _moduleName: 'Types/entity:format.BinaryField',
    _typeName: 'Binary'
});

register('Types/entity:format.BinaryField', BinaryField, {instantiate: false});
