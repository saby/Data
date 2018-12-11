/// <amd-module name="Types/_entity/format/IdentityField" />
/**
 * Формат поля для идентификатора.
 *
 * Создадим поле c типом "Идентификатор":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'identity'
 *    };
 * </pre>
 * @class Types/Format/IdentityField
 * @extends Types/Format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';

export default class IdentityField extends Field /** @lends Types/Format/IdentityField.prototype */{
   /**
    * @cfg {Array.<Number>} Значение поля по умолчанию
    * @name Types/Format/IdentityField#defaultValue
    * @see getDefaultValue
    * @see setDefaultValue
    */
   _$defaultValue: Array<any>;

   _separator: string;

   //region Public methods

   /**
    * Возвращает разделитель
    * @return {String}
    */
   getSeparator(): string {
      return this._separator;
   }

   //endregion Public methods
}

IdentityField.prototype['[Types/_entity/format/IdentityField]'] = true;
IdentityField.prototype._moduleName = 'Types/entity:format.IdentityField';
IdentityField.prototype._typeName = 'Identity';
IdentityField.prototype._separator = ',';
IdentityField.prototype._$defaultValue = [null];
