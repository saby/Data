/// <amd-module name="Types/_entity/format/RealField" />
/**
 * Формат вещественного поля.
 *
 * Создадим поле вещественного типа:
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'real',
 *       precision: 4
 *    };
 * </pre>
 * @class Types/_entity/format/RealField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';

export default class RealField extends Field /** @lends Types/_entity/format/RealField.prototype */{
   _$defaultValue: number;

   /**
    * @cfg {Number} Максимальное количество знаков в дробной части
    * @name Types/_entity/format/RealField#precision
    * @see getPrecision
    * @see setPrecision
    */
   _$precision: number;

   //region Public methods

   /**
    * Возвращает максимальное количество знаков в дробной части
    * @return {Number}
    * @see precision
    * @see setPrecision
    */
   getPrecision(): number {
      return this._$precision;
   }

   /**
    * Устанавливает максимальное количество знаков в дробной части
    * @param {Number} value
    * @see precision
    * @see getPrecision
    */
   setPrecision(value: number) {
      this._$precision = value;
   }

   //endregion Public methods
}

RealField.prototype['[Types/_entity/format/RealField]'] = true;
RealField.prototype._moduleName = 'Types/entity:format.RealField';
RealField.prototype._typeName = 'Real';
RealField.prototype._$defaultValue = 0;
RealField.prototype._$precision = 16;

