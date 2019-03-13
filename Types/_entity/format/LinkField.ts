/**
 * Формат поля "Связь".
 *
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

import Field from './Field';

export default class LinkField extends Field /** @lends Types/_entity/format/LinkField.prototype */{
   _$defaultValue: number;
}

LinkField.prototype['[Types/_entity/format/LinkField]'] = true;
LinkField.prototype._moduleName = 'Types/entity:format.LinkField';
LinkField.prototype._typeName = 'Link';
LinkField.prototype._$defaultValue = 0;
