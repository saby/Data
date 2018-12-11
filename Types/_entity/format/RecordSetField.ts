/// <amd-module name="Types/_entity/format/RecordSetField" />
/**
 * Формат поля для рекордсета.
 *
 * Создадим поле c типом "Рекордсет":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'recordset'
 *    };
 * </pre>
 * @class Types/Format/RecordSetField
 * @extends Types/Format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';

export default class RecordSetField extends Field /** @lends Types/Format/RecordSetField.prototype */{
}

RecordSetField.prototype['[Types/_entity/format/RecordSetField]'] = true;
RecordSetField.prototype._moduleName = 'Types/entity:format.RecordSetField';
RecordSetField.prototype._typeName = 'RecordSet';
