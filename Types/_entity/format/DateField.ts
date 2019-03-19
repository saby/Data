import Field from './Field';
import {dateToSql, TO_SQL_MODE} from '../../formatter';

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
export default class DateField extends Field /** @lends Types/_entity/format/DateField.prototype */{
      // region Public methods

      getDefaultValue(): string {
         if (this._$defaultValue instanceof Date) {
            return dateToSql(this._$defaultValue, TO_SQL_MODE.DATE);
         }
         return this._$defaultValue;
      }

      // endregion Public methods
}

Object.assign(DateField.prototype, {
   '[Types/_entity/format/DateField]': true,
   _moduleName: 'Types/entity:format.DateField',
   _typeName: 'Date'
});
