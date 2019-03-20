import Field from './Field';

/**
 * Формат поля UUID.
 *
 * Создадим поле c типом "UUID":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'uuid'
 *    };
 * </pre>
 * @class Types/_entity/format/UuidField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */
export default class UuidField extends Field {
}

Object.assign(UuidField.prototype, {
   '[Types/_entity/format/UuidField]': true,
   _moduleName: 'Types/entity:format.UuidField',
   _typeName: 'Uuid'
});
