import {register} from '../di';

/**
 * Тип данных "Идентификатор".
 * @class Types/_entity/Identity
 * @public
 * @author Мальцев А.А.
 * @example
 * <pre>
 *    require(['Types/_entity/Identity'], function (Identity) {
 *       var id = new Identity([1, 'Employees']);
 *       console.log(id.getValue());//1
 *       console.log(id.getName());//'Employees'
 *       console.log(String(id));//'1,Employees'
 *    });
 * </pre>
 */
export default class Identity /** @lends Types/_entity/Identity.prototype */{
   /**
    * @property {String} Разделитель значений
    */
   _separator: string;

   /**
    * @property {Array} Значение идентификатора
    */
   _value: any[];

   /**
    * Конструктор типа "Идентификатор".
    * @param {Array|String|Number} value Значение идентификатора
    */
   constructor(value: any[] | string | number) {
      if (!(value instanceof Array)) {
         if (typeof value === 'string') {
            value = value.split(this._separator);
         } else {
            value = [value];
         }
      }
      this._value = value;
   }

   // region Public methods

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

   valueOf(): any[] {
      return this._value;
   }

   toString(): string {
      return this._value[0] === null ? null : this._value.join(',');
   }

   // endregion Public methods
}

Identity.prototype['[Types/_entity/Identity]'] = true;
Identity.prototype._separator = ',';
Identity.prototype._value = null;

register('Types/entity:Identity', Identity, {instantiate: false});
