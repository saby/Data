import Field from './Field';
import {dateToSql, TO_SQL_MODE} from '../../formatter';

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
export default class TimeField extends Field {

   // region Public methods

   getDefaultValue(): string {
      if (this._$defaultValue instanceof Date) {
         return dateToSql(this._$defaultValue, TO_SQL_MODE.TIME);
      }
      return this._$defaultValue;
   }

   // endregion Public methods
}

Object.assign(TimeField.prototype, {
   '[Types/_entity/format/TimeField]': true,
   _moduleName: 'Types/entity:format.TimeField',
   _typeName: 'Time'
});
