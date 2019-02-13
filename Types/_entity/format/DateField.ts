/// <amd-module name="Types/_entity/format/DateField" />
/**
 * Формат поля для даты.
 *
 * Создадим поле c типом "Дата":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'date'
 *    };
 * </pre>
 * @class Types/_entity/format/DateField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';
import {dateToSql, TO_SQL_MODE} from '../../formatter';
import {register} from '../../di';

export default class DateField extends Field /** @lends Types/_entity/format/DateField.prototype */{
      //region Public methods

      getDefaultValue() {
         if (this._$defaultValue instanceof Date) {
            return dateToSql(this._$defaultValue, TO_SQL_MODE.DATE);
         }
         return this._$defaultValue;
      }

      //endregion Public methods
}

DateField.prototype['[Types/_entity/format/DateField]'] = true;
DateField.prototype._moduleName = 'Types/entity:format.DateField';
DateField.prototype._typeName = 'Date';

register('Types/entity:format.DateField', DateField, {instantiate: false});
