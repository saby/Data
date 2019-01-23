/// <amd-module name="Types/_entity/adapter/JsonFormatMixin" />
/**
 * Миксин для работы с JSON-форматом в адаптерах
 * @mixin Types/_entity/adapter/JsonFormatMixin
 * @public
 * @author Мальцев А.А.
 */

import {fieldsFactory, Field, UniversalField} from '../format'

const JsonFormatMixin = /** @lends Types/_entity/adapter/JsonFormatMixin.prototype */{
   '[Types/_entity/adapter/GenericFormatMixin]': true,

   /**
    * @property {Object.<Types/Format/Field>} Форматы полей
    */
   _format: null,

   //region Public methods

   constructor() {
      this._format = {};
   },

   getFormat(name) {
      if (!this._has(name)) {
         throw new ReferenceError(`${this._moduleName}::getFormat(): field "${name}" doesn't exist`);
      }
      if (!this._format.hasOwnProperty(name)) {
         this._format[name] = this._buildFormat(name);
      }
      return this._format[name];
   },

   getSharedFormat(name) {
      if (this._sharedFieldFormat === null) {
         this._sharedFieldFormat = new UniversalField();
      }
      let format = this._sharedFieldFormat;
      format.name = name;
      if (this._format.hasOwnProperty(name)) {
         format.type = this.getFormat(name).getType();
         format.meta = this._getFieldMeta(name);
      } else {
         format.type = 'String';
      }

      return format;
   },

   addField(format) {
      if (!format || !(format instanceof Field)) {
         throw new TypeError(`${this._moduleName}::addField(): format should be an instance of Types/entity:format.Field`);
      }
      let name = format.getName();
      if (!name) {
         throw new Error(`${this._moduleName}::addField(): field name is empty`);
      }
      this._touchData();
      this._format[name] = format;
   },

   removeField(name) {
      if (!this._has(name)) {
         throw new ReferenceError(`${this._moduleName}::removeField(): field "${name}" doesn't exist`);
      }
      this._touchData();
      delete this._format[name];
   },

   removeFieldAt() {
      throw new Error(`Method ${this._moduleName}::removeFieldAt() doesn't supported`);
   },

   //endregion Public methods

   //region Protected methods

   _touchData() {
      if (!(this._data instanceof Object)) {
         this._data = {};
      }
   },

   _isValidData() {
      return this._data instanceof Object;
   },

   _has() {
      throw new Error('Method must be implemented');
   },

   _buildFormat(name) {
      return fieldsFactory({
         name: name,
         type: 'string'
      });
   }

   //endregion Protected methods
};

export default JsonFormatMixin;
