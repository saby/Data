/// <amd-module name="Types/_entity/format/HierarchyField" />
/**
 * Формат поля иерархии
 *
 * @class Types/_entity/format/HierarchyField
 * @extends Types/_entity/format/Field
 * @author Мальцев А.А.
 */

import Field from './Field';

export default class HierarchyField extends Field /** @lends Types/_entity/format/HierarchyField.prototype */{
   /**
    * @cfg {String} Тип элементов
    * @name Types/_entity/format/HierarchyField#kind
    * @see getKind
    */
   _$kind: string;

   //region Public methods

   /**
    * Возвращает тип элементов
    * @return {String}
    * @see dictionary
    */
   getKind() {
      return this._$kind;
   }

   getDefaultValue() {
      if (this._$kind && this._$kind === 'Identity') {
         return [null];
      }
      return null;
   }

   //endregion Public methods
}

HierarchyField.prototype['[Types/_entity/format/HierarchyField]'] = true;
HierarchyField.prototype._moduleName = 'Types/entity:format.HierarchyField';
HierarchyField.prototype._typeName = 'Hierarchy';
HierarchyField.prototype._$kind = '';
