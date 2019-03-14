import FIELD_TYPE from './SbisFieldType';
import factory from '../factory';
import {fieldsFactory, IFieldDeclaration, Field, UniversalField} from '../format';
import {Map} from '../../shim';
import {object, logger} from '../../util';
import {format} from '../../collection';

/**
 * @const {Object} Инвертированный FIELD_TYPE
 */
const FIELD_TYPE_INVERTED = Object.keys(FIELD_TYPE).reduce((memo, key) => {
   memo[FIELD_TYPE[key]] = key;
   return memo;
}, {});

/**
 * {Symbol} Символ для кэширования индексов полей
 */
const fieldIndicesSymbol = typeof Symbol === 'undefined' ? undefined : Symbol('fieldIndices');

export interface IFieldType {
   n: string;
}

export interface IMoneyFieldType extends IFieldType {
   l?: boolean;
}

export interface IDictFieldType extends IFieldType {
   s: string[];
}

export interface IDateTeimeFieldType extends IFieldType {
   tz: boolean;
}

export interface IArrayFieldType extends IFieldType {
   t: string;
}

export interface IFieldFormat {
   n: string;
   t: string | IFieldType;
}

export interface IRecordFormat {
   _type?: string;
   d: any[];
   s: IFieldFormat[];
}

export interface ITableFormat {
   _type?: string;
   d: any[][];
   s: IFieldFormat[];
}

function getFieldTypeNameByInner(innerName: string): string {
   return FIELD_TYPE_INVERTED[innerName] || 'string';
}

function getFieldInnerTypeNameByOuter(outerName: string): string {
   return FIELD_TYPE[(outerName + '').toLowerCase()];
}

/**
 * Миксин для работы с СБИС-форматом в адаптерах
 * @mixin Types/_entity/adapter/SbisFormatMixin
 * @public
 * @author Мальцев А.А.
 */
const SbisFormatMixin = /** @lends Types/_entity/adapter/SbisFormatMixin.prototype */ {
   '[Types/_entity/adapter/SbisFormatMixin]': true,

   /**
    * @member {Object} Сырые данные
    */
   _data: null,

   /**
    * @member {String} Сигнатура типа
    */
   _type: '',

   /**
    * @member {Map.<String, Number>} Название поля -> индекс в d
    */
   _fieldIndices: null,

   /**
    * @member {Object.<Types/_entity/format/Field>} Форматы полей
    */
   _format: null,

   /**
    * @member {Object} Формат поля, отдаваемый через getSharedFormat()
    */
   _sharedFieldFormat: null,

   /**
    * @member {Object} Мета данные поля, отдаваемого через getSharedFormat()
    */
   _sharedFieldMeta: null,

   constructor(data: IRecordFormat | ITableFormat): void {
      if (data) {
         if (Object.getPrototypeOf(data) !== Object.prototype) {
            throw new TypeError('Argument \'data\' should be an instance of plain Object');
         }
         if (data._type && data._type !== this._type) {
            throw new TypeError(`Argument 'data' has '${data._type}' type signature but '${this._type}' is expected.`);
         }
      }

      if (fieldIndicesSymbol && data && data.s) {
         data.s[fieldIndicesSymbol] = null;
      }

      this._data = data;
      this._format = {};
   },

   // region Public methods

   getData(): IRecordFormat | ITableFormat {
      return this._data;
   },

   getFields(): string[] {
      const fields = [];
      if (this._isValidData()) {
         for (let i = 0, count = this._data.s.length; i < count; i++) {
            fields.push(this._data.s[i].n);
         }
      }
      return fields;
   },

   clear(): void {
      this._touchData();
      this._data.d.length = 0;
   },

   getFormat(name: string): format.Format {
      if (!this._has(name)) {
         throw new ReferenceError(`${this._moduleName}::getFormat(): field "${name}" doesn't exist`);
      }
      if (!this._format.hasOwnProperty(name)) {
         this._format[name] = this._buildFormat(name);
      }
      return this._format[name];
   },

   getSharedFormat(name: string): UniversalField {
      const format = this._sharedFieldFormat || (this._sharedFieldFormat = new UniversalField());
      const index = this._getFieldIndex(name);
      if (index === -1) {
         throw new ReferenceError(`${this._moduleName}::getSharedFormat(): field "${name}" doesn't exist`);
      }
      format.name = name;
      format.type = this._getFieldType(index);
      format.meta = this._getFieldMeta(index, format.type, true);

      return format;
   },

   addField(format: Field, at: number): void {
      if (!format || !(format instanceof Field)) {
         throw new TypeError(
            `${this._moduleName}::addField(): format should be an instance of Types/entity:format.Field`
         );
      }

      const name = format.getName();
      if (this._has(name)) {
         throw new ReferenceError(`${this._moduleName}::addField(): field "${name}" already exists`);
      }

      this._touchData();
      if (at === undefined) {
         at = this._data.s.length;
      }
      this._checkFieldIndex(at, true);

      this._format[name] = format;
      this._resetFieldIndices();
      this._data.s.splice(at, 0, this._buildS(format));
      this._buildD(
         at,
         factory.serialize(
            format.getDefaultValue(),
            {format}
         )
      );
   },

   removeField(name: string): void {
      this._touchData();
      const index = this._getFieldIndex(name);
      if (index === -1) {
         throw new ReferenceError(`${this._moduleName}::removeField(): field "${name}" doesn't exist`);
      }
      delete this._format[name];
      this._resetFieldIndices();
      this._data.s.splice(index, 1);
      this._removeD(index);
   },

   removeFieldAt(index: number): void {
      this._touchData();
      this._checkFieldIndex(index);
      const name = this._data.s[index].n;
      delete this._format[name];
      this._resetFieldIndices();
      this._data.s.splice(index, 1);
      this._removeD(index);
   },

   // endregion

   // region Protected methods

   _touchData(): void {
      this._data = this._normalizeData(this._data, this._type);
   },

   _normalizeData(data: any, dataType: string): IRecordFormat | ITableFormat {
      if (!(data instanceof Object)) {
         data = {};
      }
      if (!(data.d instanceof Array)) {
         data.d = [];
      }
      if (!(data.s instanceof Array)) {
         data.s = [];
      }
      data._type = dataType;

      return data;
   },

   _cloneData(shareFormat: UniversalField): IRecordFormat | ITableFormat {
      const data = object.clone(this._data);
      if (shareFormat && data && data.s) {
         data.s = this._data.s; // Keep sharing fields format
      }
      return data;
   },

   _isValidData(): boolean {
      return this._data && (this._data.s instanceof Array);
   },

   _has(name: string): boolean {
      return this._getFieldIndex(name) >= 0;
   },

   _getFieldIndex(name: string): number {
      if (!this._isValidData()) {
         return -1;
      }

      const s = this._data.s;
      let fieldIndices = fieldIndicesSymbol ? s[fieldIndicesSymbol] : this._fieldIndices;

      if (!fieldIndicesSymbol && fieldIndices && this._fieldIndices['[{s}]'] !== s) {
         fieldIndices = null;
      }

      if (!fieldIndices) {
         fieldIndices = new Map();
         if (fieldIndicesSymbol) {
            s[fieldIndicesSymbol] = fieldIndices;
         } else {
            this._fieldIndices = fieldIndices;
            this._fieldIndices['[{s}]'] = s;
         }

         for (let i = 0, count = s.length; i < count; i++) {
            fieldIndices.set(s[i].n, i);
         }
      }

      return fieldIndices.has(name) ? fieldIndices.get(name) : -1;
   },

   _resetFieldIndices(): void {
      if (this._isValidData()) {
         if (fieldIndicesSymbol) {
            this._data.s[fieldIndicesSymbol] = null;
         } else {
            this._fieldIndices = null;
         }
      }
   },

   _checkFieldIndex(index: number, appendMode: boolean): void {
      let max = this._data.s.length - 1;
      if (appendMode) {
         max++;
      }
      if (!(index >= 0 && index <= max)) {
         throw new RangeError(`${this._moduleName}: field index "${index}" is out of bounds.`);
      }
   },

   _getFieldType(index: number): string {
      const field = this._data.s[index];
      let typeName = field.t;
      if (typeName && (typeName instanceof Object)) {
         typeName = typeName.n;
      }
      return getFieldTypeNameByInner(typeName);
   },

   _getFieldMeta(index: number, type: string, singleton: boolean): object {
      if (singleton && this._sharedFieldMeta === null) {
         this._sharedFieldMeta = {};
      }
      const info = this._data.s[index];
      const meta = singleton ? this._sharedFieldMeta : {};

      switch (type) {
         case 'real':
            meta.precision = info.t.p;
            break;
         case 'money':
            meta.precision = undefined;
            if (typeof info.t === 'object' && 'p' in info.t) {
               meta.precision = info.t.p;
            }
            meta.large = !!info.t.l;
            break;
         case 'enum':
         case 'flags':
            meta.dictionary = info.t.s;
            meta.localeDictionary = info.t.sl;
            break;
         case 'datetime':
            meta.withoutTimeZone = info.t && info.t.n && 'tz' in info.t ? !info.t.tz : false;
            break;
         case 'identity':
            meta.separator = ',';
            break;
         case 'array':
            meta.kind = getFieldTypeNameByInner(info.t.t);
            Object.assign(meta, this._getFieldMeta(index, meta.kind));
            break;
      }

      return meta;
   },

   _checkFormat(record: IRecordFormat, prefix: string): void {
      const self = this._isValidData() ? this._data.s : [];
      const outer = record ? record.s || [] : [];
      const count = self.length;
      let error;

      if (self === outer) {
         return;
      }

      prefix = prefix || '';

      if (count !== outer.length) {
         error = count + ' columns expected instead of ' + outer.length;
      } else {
         for (let i = 0; i < count; i++) {
            error = this._checkFormatColumns(self[i], outer[i] || {}, i);
            if (error) {
               break;
            }
         }
      }

      if (error) {
         logger.info(this._moduleName + prefix + ': the formats are not equal (' + error + ')');
      }
   },

   _checkFormatColumns(self: IFieldFormat, outer: IFieldFormat, index: number): string {
      if (self.n !== outer.n) {
         return `field with name "${self.n}" at position ${index} expected instead of "${outer.n}"`;
      }

      let selfType = self.t;
      let outerType;

      if (selfType && (selfType as IFieldType).n) {
         selfType = (selfType as IFieldType).n;
      }
      outerType = outer.t;
      if (outerType && outerType.n) {
         outerType = outerType.n;
      }
      if (selfType !== outerType) {
         return `expected field type for "${self.n}" at position '${index} is "${selfType}" instead of "${outerType}"`;
      }
   },

   _buildFormatDeclaration(name: string): IFieldDeclaration {
      const index = this._getFieldIndex(name);
      const type = this._getFieldType(index);
      const declaration = this._getFieldMeta(index, type);
      declaration.name = name;
      declaration.type = type;
      return declaration;
   },

   _buildFormat(name: string): Field {
      return fieldsFactory(
         this._buildFormatDeclaration(name)
      );
   },

   _buildS(format: Field): IFieldFormat {
      const data = {
         t: '',
         n: format.getName()
      };
      this._buildSType(data, format);

      return data;
   },

   _buildSType(data: IFieldFormat, format: Field): void {
      const type = (format.getTypeName() + '').toLowerCase();
      switch (type) {
         case 'money':
            if (format.isLarge()) {
               (data.t as IMoneyFieldType) = {
                  n: FIELD_TYPE[type],
                  l: true
               };
            } else {
               data.t = FIELD_TYPE[type];
            }
            break;

         case 'enum':
         case 'flags':
            let dict = format.getDictionary();
            if (dict instanceof Array) {
               dict = dict.reduce((prev, curr, index) => {
                  prev[index] = curr;
                  return prev;
               }, {});
            }
            (data.t as IDictFieldType) = {
               n: FIELD_TYPE[type],
               s: dict
            };
            break;

         case 'datetime':
            const withoutTimeZone = format.isWithoutTimeZone();
            if (withoutTimeZone) {
               (data.t as IDateTeimeFieldType) = {
                  n: FIELD_TYPE[type],
                  tz: !withoutTimeZone
               };
            } else {
               data.t = FIELD_TYPE[type];
            }
            break;

         case 'array':
            (data.t as IArrayFieldType) = {
               n: FIELD_TYPE[type],
               t: getFieldInnerTypeNameByOuter(format.getKind())
            };
            break;

         default:
            data.t = FIELD_TYPE[type];
      }
   },

   _buildD(): void {
      throw new Error('Method must be implemented');
   },

   _removeD(): void {
      throw new Error('Method must be implemented');
   }

   // endregion Protected methods
};

export default SbisFormatMixin;
