/**
 * Формат поля для времени.
 *
 * Создадим поле c типом "Время":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'time'
 *    };
 * </pre>
 * @class Types/_entity/format/TimeField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';
import {dateToSql, TO_SQL_MODE} from '../../formatter';

export default class TimeField extends Field /** @lends Types/_entity/format/TimeField.prototype */{

   // region Public methods

   getDefaultValue(): string {
      if (this._$defaultValue instanceof Date) {
         return dateToSql(this._$defaultValue, TO_SQL_MODE.TIME);
      }
      return this._$defaultValue;
   }

   // endregion Public methods
}

TimeField.prototype['[Types/_entity/format/TimeField]'] = true;
TimeField.prototype._moduleName = 'Types/entity:format.TimeField';
TimeField.prototype._typeName = 'Time';
