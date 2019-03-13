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
 * @class Types/_entity/format/TimeIntervalField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';

export default class TimeIntervalField extends Field /** @lends Types/_entity/format/TimeIntervalField.prototype */{
   _$defaultValue: number;
}

TimeIntervalField.prototype['[Types/_entity/format/TimeIntervalField]'] = true;
TimeIntervalField.prototype._moduleName = 'Types/entity:format.TimeIntervalField';
TimeIntervalField.prototype._typeName = 'TimeInterval';
TimeIntervalField.prototype._$defaultValue = 0;
