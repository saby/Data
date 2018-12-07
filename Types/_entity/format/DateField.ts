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
 * @class Types/Format/DateField
 * @extends Types/Format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';
// @ts-ignore
import toSql = require('Core/helpers/Date/toSql');

export default class DateField extends Field /** @lends Types/Format/DateField.prototype */{
      //region Public methods

      getDefaultValue() {
         if (this._$defaultValue instanceof Date) {
            return toSql(this._$defaultValue, toSql.MODE_DATE);
         }
         return this._$defaultValue;
      }

      //endregion Public methods
}

DateField.prototype['[Types/_entity/format/DateField]'] = true;
DateField.prototype._moduleName = 'Types/entity:format.DateField';
DateField.prototype._typeName = 'Date';
