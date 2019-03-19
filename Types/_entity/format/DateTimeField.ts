import Field from './Field';

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
 * @class Types/_entity/format/DateTimeField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */
export default class DateTimeField extends Field /** @lends Types/_entity/format/DateTimeField.prototype */{
   /**
    * @cfg {Boolean} Без указания временной зоны
    * @name Types/_entity/format/DateTimeField#withoutTimeZone
    * @see hasTimeZone
    */
   _$withoutTimeZone: boolean;

   // region Public methods

   /**
    * Возвращает признак указания временной зоны
    * @return {Boolean}
    */
   isWithoutTimeZone(): boolean {
      return this._$withoutTimeZone;
   }

   // endregion Public methods

}

Object.assign(DateTimeField.prototype, {
   '[Types/_entity/format/DateTimeField]': true,
   _moduleName: 'Types/entity:format.DateTimeField',
   _typeName: 'DateTime',
   _$withoutTimeZone: false
});
