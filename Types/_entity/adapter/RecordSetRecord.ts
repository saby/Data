import DestroyableMixin from '../DestroyableMixin';
import IRecord from './IRecord';
import GenericFormatMixin from './GenericFormatMixin';
import {Field} from '../format';
import {create} from '../../di';
import {mixin} from '../../util';
import Record from '../Record';
import {RecordSet, format} from '../../collection';

/**
 * Адаптер для записи таблицы данных в формате записи.
 * Работает с данными, представленными в виде экземлпяра {@link Types/_entity/Record}.
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
 * @class Types/_entity/adapter/RecordSetRecord
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_entity/adapter/IRecord
 * @mixes Types/_entity/adapter/GenericFormatMixin
 * @public
 * @author Мальцев А.А.
 */
export default class RecordSetRecord extends mixin<
   DestroyableMixin,
   GenericFormatMixin
>(
   DestroyableMixin,
   GenericFormatMixin
) implements IRecord {
   /**
    * Запись
    */
   protected _data: Record;

   /**
    * Таблица
    */
   protected _tableData: RecordSet;

   // region IRecord

   readonly '[Types/_entity/adapter/IRecord]': boolean;

   /**
    * Конструктор
    * @param data Сырые данные
    * @param [tableData] Таблица
    */
   constructor(data: Record, tableData?: RecordSet) {
      if (data && !data['[Types/_entity/Record]']) {
         throw new TypeError('Argument "data" should be an instance of Types/entity:Record');
      }
      super(data);
      GenericFormatMixin.call(this, data);
      this._tableData = tableData;
   }

   has(name: string): boolean {
      return this._isValidData() ? this._data.has(name) : false;
   }

   get(name: string): any {
      return this._isValidData() ? this._data.get(name) : undefined;
   }

   set(name: string, value: any): void {
      if (!name) {
         throw new ReferenceError(`${this._moduleName}::set(): argument "name" is not defined`);
      }
      this._touchData();
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      return this._data.set(name, value);
   }

   clear(): void {
      this._touchData();
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      const fields = this.getFields();
      const format = this._data.getFormat();
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

   getFields(): string[] {
      const fields = [];
      if (this._isValidData()) {
         this._data.getFormat().each((field) => {
            fields.push(field.getName());
         });
      }
      return fields;
   }

   addField(format: Field, at: number): void {
      this._touchData();
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      this._data.addField(format, at);
   }

   removeField(name: string): void {
      this._touchData();
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      this._data.removeField(name);
   }

   removeFieldAt(index: number): void {
      this._touchData();
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      this._data.removeFieldAt(index);
   }

   // endregion

   // region Protected methods

   protected _touchData(): void {
      if (!this._data &&
         this._tableData &&
         this._tableData['[Types/_entity/FormattableMixin]']
      ) {
         const model = this._tableData.getModel();
         const adapter = this._tableData.getAdapter();

         this._data = create(model, {
            adapter
         });
      }
   }

   protected _isValidData(): boolean {
      return this._data && this._data['[Types/_entity/Record]'];
   }

   protected _getFieldsFormat(): format.Format {
      return this._isValidData()
         ? this._data.getFormat()
         : create<format.Format>('Types/collection:format.Format');
   }

   // endregion
}

Object.assign(RecordSetRecord.prototype, {
   '[Types/_entity/adapter/RecordSetRecord]': true,
   '[Types/_entity/adapter/IRecord]': true,
   _data: null,
   _tableData: null
});
