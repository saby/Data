/**
 * Формат поля для записи.
 *
 * Создадим поле c типом "Запись":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'record'
 *    };
 * </pre>
 * @class Types/_entity/format/RecordField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';

export default class RecordField extends Field /** @lends Types/_entity/format/RecordField.prototype */{
}

RecordField.prototype['[Types/_entity/format/RecordField]'] = true;
RecordField.prototype._moduleName = 'Types/entity:format.RecordField';
RecordField.prototype._typeName = 'Record';
