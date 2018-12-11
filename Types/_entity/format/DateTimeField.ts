/// <amd-module name="Types/_entity/format/DateTimeField" />
/**
 * Формат поля для даты и времени.
 *
 * Создадим поле c типом "Дата и время":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'dateTime'
 *    };
 * </pre>
 * @class Types/Format/DateTimeField
 * @extends Types/Format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';

export default class DateTimeField extends Field /** @lends Types/Format/DateTimeField.prototype */{
      /**
       * @cfg {Boolean} Без указания временной зоны
       * @name Types/Format/DateTimeField#withoutTimeZone
       * @see hasTimeZone
       */
      _$withoutTimeZone: boolean;

      //region Public methods

      /**
       * Возвращает признак указания временной зоны
       * @return {Boolean}
       */
      isWithoutTimeZone(): boolean {
         return this._$withoutTimeZone;
      }

      //endregion Public methods

}

DateTimeField.prototype['[Types/_entity/format/DateTimeField]'] = true;
DateTimeField.prototype._moduleName = 'Types/entity:format.DateTimeField';
DateTimeField.prototype._typeName = 'DateTime';
DateTimeField.prototype._$withoutTimeZone = false;
