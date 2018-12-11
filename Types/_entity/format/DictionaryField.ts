/// <amd-module name="Types/_entity/format/DictionaryField" />
/**
 * Формат поля со словарём (абстрактный класс)
 * @class Types/Format/DictionaryField
 * @extends Types/Format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';

export default class DictionaryField extends Field /** @lends Types/Format/DictionaryField.prototype */{
      /**
       * @cfg {Array.<String>} Словарь возможных значений
       * @name Types/Format/DictionaryField#dictionary
       * @see getDictionary
       */
      _$dictionary: Array<string>;

      /**
       * @cfg {Array.<String>} Локализованный словарь возможных значений
       * @name Types/Format/DictionaryField#localeDictionary
       * @see getDictionary
       */
      _$localeDictionary: Array<string>;

      //region Public methods

      /**
       * Возвращает словарь возможных значений
       * @return {Array.<String>}
       * @see dictionary
       */
      getDictionary(): Array<string> {
         return this._$dictionary;
      }

      /**
       * Возвращает словарь возможных значений
       * @return {Array.<String>}
       * @see dictionary
       */
      getLocaleDictionary(): Array<string> {
         return this._$localeDictionary;
      }

      //endregion Public methods
}

DictionaryField.prototype['[Types/_entity/format/DictionaryField]'] = true;
DictionaryField.prototype._moduleName = 'Types/entity:format.DictionaryField';
DictionaryField.prototype._typeName = 'Dictionary';
DictionaryField.prototype._$dictionary = null;
DictionaryField.prototype._$localeDictionary = null;
