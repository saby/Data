/// <amd-module name="Types/_entity/adapter/RecordSetTable" />
/**
 * Адаптер для таблицы данных в формате рекордсета.
 * Работает с данными, представленными в виде экземлпяра {@link Types/_collection/RecordSet}.
 *
 * Создадим адаптер для таблицы:
 * <pre>
 *    requirejs(['Types/collection', 'Types/entity'], function(collection, entity) {
 *       var ibizasClubs = new collection.RecordSet({
 *          rawData: [
 *             {id: 1, title: 'Amnesia Ibiza'},
 *             {id: 2, title: 'DC-10'},
 *             {id: 3, title: 'Pacha Ibiza'}
 *          ]
 *       });
 *       var clubsAdapter = new entity.adapter.RecordSet(ibizasClubs);
 *       console.log(clubsAdapter.at(0).get('title'));//'Amnesia Ibiza'
 *    });
 * </pre>
 * @class Types/_entity/adapter/RecordSetTable
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_entity/adapter/ITable
 * @mixes Types/_entity/adapter/GenericFormatMixin
 * @public
 * @author Мальцев А.А.
 */

import DestroyableMixin from '../DestroyableMixin';
import ITable from './ITable';
import IAdapter from './IAdapter';
import GenericFormatMixin from './GenericFormatMixin';
import {UniversalField, Field} from '../format';
import {create} from '../../di';
import {mixin} from '../../util';
import Record from '../Record';
import {RecordSet, format} from '../../collection';

interface IRecordSetOptions {
   adapter?: string | IAdapter;
   idProperty?: string;
}

export default class RecordSetTable extends mixin(
   DestroyableMixin, GenericFormatMixin
) implements ITable /** @lends Types/_entity/adapter/RecordSetTable.prototype */{
   /**
    * @property Список
    */
   _data: RecordSet<Record>;

   // region ITable

   readonly '[Types/_entity/adapter/ITable]': boolean;

   getData: () => any;
   getFormat: (name: string) => any;
   getSharedFormat: (name: string) => UniversalField;

   /**
    * Конструктор
    * @param {Types/_collection/RecordSet} data Таблица
    */
   constructor(data: RecordSet<Record>) {
      if (data && !data['[Types/_collection/RecordSet]']) {
         throw new TypeError('Argument "data" should be an instance of Types/collection:RecordSet');
      }
      super(data);
      GenericFormatMixin.constructor.call(this, data);
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

   getCount(): number {
      return this._isValidData() ? this._data.getCount() : 0;
   }

   add(record: Record, at: number): void {
      this._buildData(record);
      this._data.add(record, at);
   }

   at(index: number): Record {
      return this._isValidData() ? this._data.at(index) : undefined;
   }

   remove(at: number): Record {
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      return this._data.removeAt(at);
   }

   replace(record: Record, at: number): Record {
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      return this._data.replace(record, at);
   }

   move(source: number, target: number): void {
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      const rec = this._data.at(source);
      this._data.removeAt(source);
      this._data.add(rec, target);
   }

   merge(acceptor: number, donor: number, idProperty: string): any {
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      const acceptorRecord = this._data.at(acceptor);
      this._data.at(donor).each((name, value) => {
         if (name !== idProperty) {
            acceptorRecord.set(name, value);
         }
      }, this);
      this._data.removeAt(donor);
   }

   copy(index: number): Record {
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      const clone = this._data.at(index).clone();
      this.add(clone, 1 + index);
      return clone;
   }

   clear(): void {
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      const count = this._data.getCount();
      for (let i = count - 1; i >= 0; i--) {
         this._data.removeAt(i);
      }
   }

   addField(format: Field, at: number): void {
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      this._data.addField(format, at);
   }

   removeField(name: string): void {
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      this._data.removeField(name);
   }

   removeFieldAt(index: number): void {
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      this._data.removeFieldAt(index);
   }

   // endregion

   // region Protected methods

   _buildData(sample: Record): void {
      if (!this._data) {
         const config = {} as IRecordSetOptions;
         if (sample) {
            if (sample.getAdapter) {
               config.adapter = sample.getAdapter();
            }
            if (sample.getIdProperty) {
               config.idProperty = sample.getIdProperty();
            }
         }
         this._data = create('Types/collection:RecordSet', config);
      }
   }

   _isValidData(): boolean {
      return this._data && this._data['[Types/_collection/RecordSet]'];
   }

   _getFieldsFormat(): format.Format<Field> {
      return this._data.getFormat();
   }

   // endregion
}

Object.assign(RecordSetTable.prototype, {
   '[Types/_entity/adapter/RecordSetTable]': true,
   '[Types/_entity/adapter/ITable]': true,
   _data: null
});
