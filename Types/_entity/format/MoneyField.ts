import RealField from './RealField';

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
 * @class Types/_entity/format/MoneyField
 * @extends Types/_entity/format/RealField
 * @public
 * @author Мальцев А.А.
 */
export default class MoneyField extends RealField {
   _$precision: number;

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

Object.assign(MoneyField.prototype, {
   '[Types/_entity/format/MoneyField]': true,
   _moduleName: 'Types/entity:format.MoneyField',
   _typeName: 'Money',
   _$precision: 2,
   _$large: false
});
