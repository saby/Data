/// <amd-module name="Types/_entity/format/TimeIntervalField" />
/**
 * Формат поля временной интервал.
 *
 * Создадим поле c типом "Временной интервал":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'timeinterval'
 *    };
 * </pre>
 * @class Types/Format/TimeIntervalField
 * @extends Types/Format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';

export default class TimeIntervalField extends Field /** @lends Types/Format/TimeIntervalField.prototype */{
   _$defaultValue: number;
}

TimeIntervalField.prototype['[Types/_entity/format/TimeIntervalField]'] = true;
TimeIntervalField.prototype._moduleName = 'Types/entity:format.TimeIntervalField';
TimeIntervalField.prototype._typeName = 'TimeInterval';
TimeIntervalField.prototype._$defaultValue = 0;
