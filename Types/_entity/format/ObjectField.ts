import Field from './Field';

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
export default class ObjectField extends Field /** @lends Types/_entity/format/ObjectField.prototype */{
}

Object.assign(ObjectField.prototype, {
   '[Types/_entity/format/ObjectField]': true,
   _moduleName: 'Types/entity:format.ObjectField',
   _typeName: 'Object'
});
