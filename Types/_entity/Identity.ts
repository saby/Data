/// <amd-module name="Types/_entity/Identity" />
/**
 * Тип данных "Идентификатор".
 * @class Types/Type/Identity
 * @public
 * @author Мальцев А.А.
 * @example
 * <pre>
 *    require(['Types/Type/Identity'], function (Identity) {
 *       var id = new Identity([1, 'Employees']);
 *       console.log(id.getValue());//1
 *       console.log(id.getName());//'Employees'
 *       console.log(String(id));//'1,Employees'
 *    });
 * </pre>
 */

import di from '../_di';

export default class Identity /** @lends Types/Type/Identity.prototype */{
   /**
    * @property {String} Разделитель значений
    */
   _separator: string;

   /**
    * @property {Array} Значение идентификатора
    */
   _value: Array<any>;

   /**
    * Конструктор типа "Идентификатор".
    * @param {Array|String|Number} value Значение идентификатора
    */
   constructor(value) {
      if (!(value instanceof Array)) {
         if (typeof value === 'string') {
            value = value.split(this._separator);
         } else {
            value = [value];
         }
      }
      this._value = value;
   }

   //region Public methods

   /**
    * Возвращает значение поля таблицы.
    * @return {Number|Null}
    */
   getValue(): number | null {
      return this._value[0];
   }

   /**
    * Возвращает название таблицы.
    * @return {String|undefined}
    */
   getName(): string {
      return this._value[1];
   }

   valueOf() {
      return this._value;
   }

   toString(): string {
      return this._value[0] === null ? null : this._value.join(',');
   }

   //endregion Public methods
}

Identity.prototype['[Types/_entity/Identity]'] = true;
Identity.prototype._separator = ',';
Identity.prototype._value = null;

di.register('Types/entity:Identity', Identity, {instantiate: false});
