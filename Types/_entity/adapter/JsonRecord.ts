/// <amd-module name="Types/_entity/adapter/JsonRecord" />
/**
 * Адаптер для записи таблицы данных в формате JSON
 * Работает с данными, представленными в виде объекта (Object).
 *
 * Создадим адаптер для записи:
 * <pre>
 *    var adapter = new JsonRecord({
 *       id: 1,
 *       title: 'Test'
 *    });
 *    adapter.get('title');//'Test'
 * </pre>
 * @class Types/_entity/adapter/JsonRecord
 * @mixes Types/Entity/DestroyableMixin
 * @implements Types/_entity/adapter/IRecord
 * @mixes Types/_entity/adapter/GenericFormatMixin
 * @mixes Types/_entity/adapter/JsonFormatMixin
 * @public
 * @author Мальцев А.А.
 */

import DestroyableMixin from '../DestroyableMixin';
import IRecord from './IRecord';
import GenericFormatMixin from './GenericFormatMixin';
import JsonFormatMixin from './JsonFormatMixin';
import {Field, UniversalField} from '../format';
import {mixin} from '../../util';

export default class JsonRecord extends mixin(
   DestroyableMixin, GenericFormatMixin, JsonFormatMixin
) implements IRecord /** @lends Types/_entity/adapter/JsonRecord.prototype */{
   /**
    * @property {Object} Сырые данные
    */
   _data: Object;

   /**
    * Конструктор
    * @param {*} data Сырые данные
    */
   constructor(data) {
      super(data);
      GenericFormatMixin.constructor.call(this, data);
      JsonFormatMixin.constructor.call(this, data);
   }

   //region IRecord

   readonly '[Types/_entity/adapter/IRecord]': boolean;

   getData: () => any;
   getFormat: (name: string) => Field;
   getSharedFormat: (name: string) => UniversalField;
   removeFieldAt: (index: number) => void;

   //endregion IRecord

   //region Types/_entity/adapter/JsonFormatMixin

   addField(format, at) {
      if (!format || !(format instanceof Field)) {
         throw new TypeError(`${this._moduleName}::addField(): argument "format" should be an instance of Types/entity:format.Field`);
      }
      let name = format.getName();
      if (this.has(name)) {
         throw new Error(`${this._moduleName}::addField(): field "${name}" already exists`);
      }

      JsonFormatMixin.addField.call(this, format, at);
      this.set(name, format.getDefaultValue());
   }

   removeField(name) {
      JsonFormatMixin.removeField.call(this, name);
      delete this._data[name];
   }

   //endregion Types/_entity/adapter/JsonFormatMixin

   //region Public methods

   has(name) {
      return this._isValidData() ? this._data.hasOwnProperty(name) : false;
   }

   get(name) {
      return this._isValidData() ? this._data[name] : undefined;
   }

   set(name, value) {
      if (!name) {
         throw new ReferenceError(`${this._moduleName}::set(): field name is not defined`);
      }
      this._touchData();
      this._data[name] = value;
   }

   clear() {
      this._touchData();
      let keys = Object.keys(this._data);
      let count = keys.length;
      for (let i = 0; i < count; i++) {
         delete this._data[keys[i]];
      }
   }

   getFields() {
      return this._isValidData() ? Object.keys(this._data) : [];
   }

   getKeyField() {
      return undefined;
   }

   //endregion Public methods

   //region Protected methods

   _has(name) {
      return this.has(name);
   }

   //endregion Protected methods
}

JsonRecord.prototype['[Types/_entity/adapter/JsonRecord]'] = true;
// @ts-ignore
JsonRecord.prototype['[Types/_entity/adapter/IRecord]'] = true;
JsonRecord.prototype._data = null;
