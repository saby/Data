/// <amd-module name="Types/_entity/adapter/SbisFormatMixin" />
/**
 * Миксин для работы с СБИС-форматом в адаптерах
 * @mixin Types/_entity/adapter/SbisFormatMixin
 * @public
 * @author Мальцев А.А.
 */

import FIELD_TYPE from './SbisFieldType';
import factory from '../factory'
import {fieldsFactory, Field, UniversalField} from '../format'
import {Map} from '../../shim'
import {object, logger} from '../../util'

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

function getFieldTypeNameByInner(innerName) {
   return FIELD_TYPE_INVERTED[innerName] || 'string';
}

function getFieldInnerTypeNameByOuter(outerName) {
   return FIELD_TYPE[(outerName + '').toLowerCase()];
}

const SbisFormatMixin = /** @lends Types/_entity/adapter/SbisFormatMixin.prototype */{
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

   constructor(data) {
      if (data && data._type && data._type !== this._type) {
         throw new TypeError(`Argument "data" has "${data._type}" type signature but "${this._type}" expected.`);
      }
      if (fieldIndicesSymbol && data && data.s) {
         data.s[fieldIndicesSymbol] = null;
      }

      this._data = data;
      this._format = {};
   },

   //region Public methods

   getData() {
      return this._data;
   },

   getFields() {
      let fields = [];
      if (this._isValidData()) {
         for (let i = 0, count = this._data.s.length; i < count; i++) {
            fields.push(this._data.s[i].n);
         }
      }
      return fields;
   },

   clear() {
      this._touchData();
      this._data.d.length = 0;
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
      let format = this._sharedFieldFormat || (this._sharedFieldFormat = new UniversalField());
      let index = this._getFieldIndex(name);
      if (index === -1) {
         throw new ReferenceError(`${this._moduleName}::getSharedFormat(): field "${name}" doesn't exist`);
      }
      format.name = name;
      format.type = this._getFieldType(index);
      format.meta = this._getFieldMeta(index, format.type, true);

      return format;
   },

   addField(format, at) {
      if (!format || !(format instanceof Field)) {
         throw new TypeError(`${this._moduleName}::addField(): format should be an instance of Types/entity:format.Field`);
      }
      let name = format.getName();
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
            {format: format}
         )
      );
   },

   removeField(name) {
      this._touchData();
      let index = this._getFieldIndex(name);
      if (index === -1) {
         throw new ReferenceError(`${this._moduleName}::removeField(): field "${name}" doesn't exist`);
      }
      delete this._format[name];
      this._resetFieldIndices();
      this._data.s.splice(index, 1);
      this._removeD(index);
   },

   removeFieldAt(index) {
      this._touchData();
      this._checkFieldIndex(index);
      let name = this._data.s[index].n;
      delete this._format[name];
      this._resetFieldIndices();
      this._data.s.splice(index, 1);
      this._removeD(index);
   },

   //endregion Public methods

   //region Protected methods

   _touchData() {
      this._data = this._normalizeData(this._data, this._type);
   },

   _normalizeData(data, dataType) {
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

   _cloneData(shareFormat) {
      let data = object.clone(this._data);
      if (shareFormat && data && data.s) {
         data.s = this._data.s;//Keep sharing fields format
      }
      return data;
   },

   _isValidData() {
      return this._data && (this._data.s instanceof Array);
   },

   _has(name) {
      return this._getFieldIndex(name) >= 0;
   },

   _getFieldIndex(name) {
      if (!this._isValidData()) {
         return -1;
      }

      let s = this._data.s;
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

   _resetFieldIndices() {
      if (this._isValidData()) {
         if (fieldIndicesSymbol) {
            this._data.s[fieldIndicesSymbol] = null;
         } else {
            this._fieldIndices = null;
         }
      }
   },

   _checkFieldIndex(index, appendMode) {
      let max = this._data.s.length - 1;
      if (appendMode) {
         max++;
      }
      if (!(index >= 0 && index <= max)) {
         throw new RangeError(`${this._moduleName}: field index "${index}" is out of bounds.`);
      }
   },

   _getFieldType(index) {
      let field = this._data.s[index];
      let typeName = field.t;
      if (typeName && (typeName instanceof Object)) {
         typeName = typeName.n;
      }
      return getFieldTypeNameByInner(typeName);
   },

   _getFieldMeta(index, type, singleton) {
      if (singleton && this._sharedFieldMeta === null) {
         this._sharedFieldMeta = {};
      }
      let info = this._data.s[index];
      let meta = singleton ? this._sharedFieldMeta : {};

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

   _checkFormat(record, prefix) {
      let self = this._isValidData() ? this._data.s : [];
      let outer = record ? record.s || [] : [];
      let count = self.length;
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

   _checkFormatColumns(self, outer, index) {
      if (self.n !== outer.n) {
         return 'field with name "' + self.n + '" at position ' + index + ' expected instead of "' + outer.n + '"';
      }

      let selfType = self.t;
      let outerType;

      if (selfType && selfType.n) {
         selfType = selfType.n;
      }
      outerType = outer.t;
      if (outerType && outerType.n) {
         outerType = outerType.n;
      }
      if (selfType !== outerType) {
         return 'expected field type for "' + self.n + '" at position ' + index + ' is "' + selfType + '" instead of "' + outerType + '"';
      }
   },

   _buildFormatDeclaration(name) {
      let index = this._getFieldIndex(name);
      let type = this._getFieldType(index);
      let declaration = this._getFieldMeta(index, type);
      declaration.name = name;
      declaration.type = type;
      return declaration;
   },

   _buildFormat(name) {
      return fieldsFactory(
         this._buildFormatDeclaration(name)
      );
   },

   _buildS(format) {
      let data = {
         n: format.getName()
      };
      this._buildSType(data, format);

      return data;
   },

   _buildSType(data, format) {
      let type = (format.getTypeName() + '').toLowerCase();
      switch (type) {
         case 'money':
            if (format.isLarge()) {
               data.t = {
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
            data.t = {
               n: FIELD_TYPE[type],
               s: dict
            };
            break;

         case 'datetime':
            let withoutTimeZone = format.isWithoutTimeZone();
            if (withoutTimeZone) {
               data.t = {
                  n: FIELD_TYPE[type],
                  tz: !withoutTimeZone
               };
            } else {
               data.t = FIELD_TYPE[type];
            }
            break;

         case 'array':
            data.t = {
               n: FIELD_TYPE[type],
               t: getFieldInnerTypeNameByOuter(format.getKind())
            };
            break;

         default:
            data.t = FIELD_TYPE[type];
      }
   },

   _buildD() {
      throw new Error('Method must be implemented');
   },

   _removeD() {
      throw new Error('Method must be implemented');
   }

   //endregion Protected methods
};

export default SbisFormatMixin;
