/// <amd-module name="Types/_entity/format/MoneyField" />
/**
 * Формат денежного поля.
 *
 * Создадим поле c типом "Деньги":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'money'
 *    };
 * </pre>
 * @class Types/Format/MoneyField
 * @extends Types/Format/RealField
 * @public
 * @author Мальцев А.А.
 */

import RealField from './RealField';

export default class MoneyField extends RealField /** @lends Types/Format/MoneyField.prototype */{
   _$precision: number;

   /**
    * @cfg {Boolean} Большие деньги (значение передается строкой, чтобы избежать погрешностей выполнения операций с плавающей запятой)
    * @name Types/Format/MoneyField#large
    * @see isLarge
    */
   _$large: boolean;

   //region Public methods

   /**
    * Возвращает признак "Большие деньги"
    * @return {Boolean}
    * @see large
    */
   isLarge() {
      return this._$large;
   }

   //endregion Public methods
}

MoneyField.prototype['[Types/_entity/format/MoneyField]'] = true;
MoneyField.prototype._moduleName = 'Types/entity:format.MoneyField';
MoneyField.prototype._typeName = 'Money';
MoneyField.prototype._$precision = 2;
MoneyField.prototype._$large = false;
