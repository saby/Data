import RealField from './RealField';

/**
 * Формат денежного поля.
 * @remark
 * Создадим поле c типом "Деньги":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'money'
 *    };
 * </pre>
 * @class Types/_entity/format/MoneyField
 * @extends Types/_entity/format/RealField
 * @public
 * @author Мальцев А.А.
 */
export default class MoneyField extends RealField {
   /**
    * @cfg {Boolean} Большие деньги (значение передается строкой, чтобы избежать погрешностей выполнения операций с
    * плавающей запятой)
    * @name Types/_entity/format/MoneyField#large
    * @see isLarge
    */
   _$large: boolean;

   // region Public methods

   /**
    * Возвращает признак "Большие деньги"
    * @return {Boolean}
    * @see large
    */
   isLarge(): boolean {
      return this._$large;
   }

   // endregion Public methods
}

export const DEFAULT_PRECISION = 2;

Object.assign(MoneyField.prototype, {
   '[Types/_entity/format/MoneyField]': true,
   _moduleName: 'Types/entity:format.MoneyField',
   _typeName: 'Money',
   _$precision: DEFAULT_PRECISION,
   _$large: false
});
