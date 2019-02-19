/// <amd-module name="Types/_entity/adapter/GenericFormatMixin" />
/**
 * Миксин для работы с форматом в адаптерах
 * @mixin Types/_entity/adapter/GenericFormatMixin
 * @public
 * @author Мальцев А.А.
 */

import {Field, UniversalField} from '../format';

const GenericFormatMixin = /** @lends Types/_entity/adapter/GenericFormatMixin.prototype */{
   '[Types/_entity/adapter/GenericFormatMixin]': true,

   /**
    * @property {Object} Сырые данные
    */
   _data: null,

   /**
    * @property {Object} Формат поля, отдаваемый через getSharedFormat()
    */
   _sharedFieldFormat: null,

   /**
    * @property {Object} Мета данные поля, отдаваемого через getSharedFormat()
    */
   _sharedFieldMeta: null,

   /**
    * Конструктор
    * @param {*} data Сырые данные
    */
   constructor(data) {
      this._data = data;
   },

   // region Public methods

   getData() {
      return this._data;
   },

   getFields() {
      throw new Error('Method must be implemented');
   },

   getFormat(name) {
      const fields = this._getFieldsFormat();
      const index = fields ? fields.getFieldIndex(name) : -1;
      if (index === -1) {
         throw new ReferenceError(`${this._moduleName}::getFormat(): field "${name}" doesn't exist`);
      }
      return fields.at(index);
   },

   getSharedFormat(name) {
      if (this._sharedFieldFormat === null) {
         this._sharedFieldFormat = new UniversalField();
      }
      const fieldFormat = this._sharedFieldFormat;
      const fields = this._getFieldsFormat();
      const index = fields ? fields.getFieldIndex(name) : -1;

      fieldFormat.name = name;
      fieldFormat.type = index === -1 ? 'String' : fields.at(index).getType();
      fieldFormat.meta = index === -1 ? {} : this._getFieldMeta(name);

      return fieldFormat;
   },

   addField(format, at) {
      if (!format || !(format instanceof Field)) {
         throw new TypeError(`${this._moduleName}::addField(): format should be an instance of Types/entity:format.Field`);
      }
      const name = format.getName();
      if (!name) {
         throw new Error('{$this._moduleName}::addField(): field name is empty');
      }
      const fields = this._getFieldsFormat();
      const index = fields ? fields.getFieldIndex(name) : -1;
      if (index > -1) {
         throw new Error(`${this._moduleName}::addField(): field "${name}" already exists`);
      }
      this._touchData();
      fields.add(format, at);
   },

   removeField(name) {
      const fields = this._getFieldsFormat();
      const index = fields ? fields.getFieldIndex(name) : -1;
      if (index === -1) {
         throw new ReferenceError(`${this._moduleName}::removeField(): field "${name}" doesn't exist`);
      }
      this._touchData();
      fields.removeAt(index);
   },

   removeFieldAt(index) {
      this._touchData();
      const fields = this._getFieldsFormat();
      if (fields) {
         fields.removeAt(index);
      }
   },

   // endregion Public methods

   // region Protected methods

   _touchData() {
   },

   _isValidData() {
      return true;
   },

   _getFieldsFormat() {
      throw new Error('Method must be implemented');
   },

   _getFieldMeta(name) {
      if (this._sharedFieldMeta === null) {
         this._sharedFieldMeta = {};
      }
      const format = this.getFormat(name);
      const meta = this._sharedFieldMeta;

      switch (format.getType()) {
         case 'Real':
         case 'Money':
            meta.precision = format.getPrecision();
            break;
         case 'Enum':
         case 'Flags':
            meta.dictionary = format.getDictionary();
            break;
         case 'Identity':
            meta.separator = format.getSeparator();
            break;
         case 'Array':
            meta.kind = format.getKind();
            break;
      }

      return meta;
   }

   // endregion Protected methods
};

export default GenericFormatMixin;
