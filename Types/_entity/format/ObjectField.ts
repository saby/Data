/// <amd-module name="Types/_entity/format/ObjectField" />
/**
 * Формат поля для JSON-объекта.
 *
 * Создадим поле c типом "JSON-объект":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'object'
 *    };
 * </pre>
 * @class Types/_entity/format/ObjectField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';
import {register} from '../../di';

export default class ObjectField extends Field /** @lends Types/_entity/format/ObjectField.prototype */{
}

ObjectField.prototype['[Types/_entity/format/ObjectField]'] = true;
ObjectField.prototype._moduleName = 'Types/entity:format.ObjectField';
ObjectField.prototype._typeName = 'Object';

register('Types/entity:format.ObjectField', ObjectField, {instantiate: false});
