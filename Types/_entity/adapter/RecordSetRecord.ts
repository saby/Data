/// <amd-module name="Types/_entity/adapter/RecordSetRecord" />
/**
 * Адаптер для записи таблицы данных в формате записи.
 * Работает с данными, представленными в виде экземлпяра {@link Types/Entity/Record}.
 *
 * Создадим адаптер для записи:
 * <pre>
 *    var record = new Record({
 *          rawData: {
 *             id: 1,
 *             title: 'Test'
 *          }
 *       }),
 *       adapter = new RecordSetRecord(record);
 *    adapter.get('title');//'Test'
 * </pre>
 * @class Types/Adapter/RecordSetRecord
 * @mixes Types/Entity/DestroyableMixin
 * @implements Types/Adapter/IRecord
 * @mixes Types/Adapter/GenericFormatMixin
 * @public
 * @author Мальцев А.А.
 */

import DestroyableMixin from '../DestroyableMixin';
import IRecord from './IRecord';
import GenericFormatMixin from './GenericFormatMixin';
import {Field, UniversalField} from '../format';
import {create} from '../../di';
import {mixin} from '../../util';
// @ts-ignore
import Record = require('Types/Entity/Record');
// @ts-ignore
import RecordSet = require('Types/Collection/RecordSet');

export default class RecordSetRecord extends mixin(
   DestroyableMixin, GenericFormatMixin
) implements IRecord /** @lends Types/Adapter/RecordSetRecord.prototype */{
   /**
    * @property Запись
    */
   _data: Record;

   /**
    * @property Таблица
    */
   _tableData: RecordSet;

   /**
    * Конструктор
    * @param {Types/Entity/Record} data Сырые данные
    * @param {Types/Collection/RecordSet} [tableData] Таблица
    */
   constructor(data, tableData?) {
      if (data && !data['[Types/_entity/Record]']) {
         throw new TypeError('Argument "data" should be an instance of Types/entity:Record');
      }
      super(data);
      GenericFormatMixin.constructor.call(this, data);
      this._tableData = tableData;
   }

   //region IRecord

   readonly '[Types/_entity/adapter/IRecord]': boolean;

   getData: () => any;
   getFormat: (name: string) => Field;
   getSharedFormat: (name: string) => UniversalField;

   has(name) {
      return this._isValidData() ? this._data.has(name) : false;
   }

   get(name) {
      return this._isValidData() ? this._data.get(name) : undefined;
   }

   set(name, value) {
      if (!name) {
         throw new ReferenceError(`${this._moduleName}::set(): argument "name" is not defined`);
      }
      this._touchData();
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      return this._data.set(name, value);
   }

   clear() {
      this._touchData();
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      let fields = this.getFields();
      let format = this._data.getFormat();
      if (format) {
         let field;
         let index;
         for (let i = 0; i < fields.length; i++) {
            field = fields[i];
            index = format.getFieldIndex(field);
            if (index > -1) {
               this._data.removeField(field);
            }
         }
      }
   }

   getFields() {
      let fields = [];
      if (this._isValidData()) {
         this._data.getFormat().each((field) => {
            fields.push(field.getName());
         });
      }
      return fields;
   }

   addField(format, at) {
      this._touchData();
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      this._data.addField(format, at);
   }

   removeField(name) {
      this._touchData();
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      this._data.removeField(name);
   }

   removeFieldAt(index) {
      this._touchData();
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      this._data.removeFieldAt(index);
   }

   //endregion IRecord

   //region Protected methods

   _touchData() {
      if (!this._data &&
         this._tableData &&
         this._tableData['[Types/_entity/FormattableMixin]']
      ) {
         let model = this._tableData.getModel();
         let adapter = this._tableData.getAdapter();

         this._data = create(model, {
            adapter: adapter
         });
      }
   }

   _isValidData() {
      return this._data && this._data['[Types/_entity/Record]'];
   }

   _getFieldsFormat() {
      return this._isValidData() ? this._data.getFormat() : create('Types/collection:format.Format');
   }

   //endregion Protected methods
}

RecordSetRecord.prototype['[Types/_entity/adapter/RecordSetRecord]'] = true;
// @ts-ignore
RecordSetRecord.prototype['[Types/_entity/adapter/IRecord]'] = true;
RecordSetRecord.prototype._data = null;
RecordSetRecord.prototype._tableData = null;
