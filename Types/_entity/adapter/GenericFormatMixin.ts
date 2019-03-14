import {Field, UniversalField} from '../format';
import {IDeclaration} from '../format/fieldsFactory';
import {format} from '../../collection';

/**
 * Миксин для работы с форматом в адаптерах
 * @mixin Types/_entity/adapter/GenericFormatMixin
 * @public
 * @author Мальцев А.А.
 */
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
   constructor(data: any): void {
      this._data = data;
   },

   // region Public methods

   getData(): any {
      return this._data;
   },

   getFields(): string[] {
      throw new Error('Method must be implemented');
   },

   getFormat(name: string): Field {
      const fields = this._getFieldsFormat();
      const index = fields ? fields.getFieldIndex(name) : -1;
      if (index === -1) {
         throw new ReferenceError(`${this._moduleName}::getFormat(): field "${name}" doesn't exist`);
      }
      return fields.at(index);
   },

   getSharedFormat(name: string): UniversalField {
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

   addField(format: Field, at: number): void {
      if (!format || !(format instanceof Field)) {
         throw new TypeError(
            `${this._moduleName}::addField(): format should be an instance of Types/entity:format.Field`
         );
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

   removeField(name: string): void {
      const fields = this._getFieldsFormat();
      const index = fields ? fields.getFieldIndex(name) : -1;
      if (index === -1) {
         throw new ReferenceError(`${this._moduleName}::removeField(): field "${name}" doesn't exist`);
      }
      this._touchData();
      fields.removeAt(index);
   },

   removeFieldAt(index: number): void {
      this._touchData();
      const fields = this._getFieldsFormat();
      if (fields) {
         fields.removeAt(index);
      }
   },

   // endregion Public methods

   // region Protected methods

   _touchData(): void {
      // Could be implemented
   },

   _isValidData(): boolean {
      return true;
   },

   _getFieldsFormat(): format.Format {
      throw new Error('Method must be implemented');
   },

   _getFieldMeta(name: string): IDeclaration {
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
