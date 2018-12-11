/// <amd-module name="Types/_entity/format/RecordField" />
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
 * @class Types/Format/RecordField
 * @extends Types/Format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';

export default class RecordField extends Field /** @lends Types/Format/RecordField.prototype */{
}

RecordField.prototype['[Types/_entity/format/RecordField]'] = true;
RecordField.prototype._moduleName = 'Types/entity:format.RecordField';
RecordField.prototype._typeName = 'Record';
