import Field from './Field';

/**
 * Формат поля "Связь".
 * @remark
 * Создадим поле c типом "Связь":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'link'
 *    };
 * </pre>
 * @class Types/_entity/format/LinkField
 * @extends Types/_entity/format/Field
 * @deprecated Модуль будет удален в 3.18.10
 * @author Мальцев А.А.
 */
export default class LinkField extends Field {
   _$defaultValue: number;
}

Object.assign(LinkField.prototype, {
   '[Types/_entity/format/LinkField]': true,
   _moduleName: 'Types/entity:format.LinkField',
   _typeName: 'Link',
   _$defaultValue: 0
});
