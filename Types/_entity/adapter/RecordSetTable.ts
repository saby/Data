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
import {UniversalField} from '../format';
import {create} from '../../di';
import {mixin} from '../../util';
import Record from '../Record';
import {RecordSet} from '../../collection';

interface RecordSetOptions {
   adapter?: string | IAdapter
   idProperty?: string
}

export default class RecordSetTable extends mixin(
   DestroyableMixin, GenericFormatMixin
) implements ITable /** @lends Types/_entity/adapter/RecordSetTable.prototype */{
   /**
    * @property Список
    */
   _data: RecordSet<Record>;

   /**
    * Конструктор
    * @param {Types/_collection/RecordSet} data Таблица
    */
   constructor(data) {
      if (data && !data['[Types/_collection/RecordSet]']) {
         throw new TypeError('Argument "data" should be an instance of Types/collection:RecordSet');
      }
      super(data);
      GenericFormatMixin.constructor.call(this, data);
   }

   //region ITable

   readonly '[Types/_entity/adapter/ITable]': boolean;

   getData: () => any;
   getFormat: (name: string) => any;
   getSharedFormat: (name: string) => UniversalField;

   getFields() {
      let fields = [];
      if (this._isValidData()) {
         this._data.getFormat().each((field) => {
            fields.push(field.getName());
         });
      }
      return fields;
   }

   getCount() {
      return this._isValidData() ? this._data.getCount() : 0;
   }

   add(record, at) {
      this._buildData(record);
      this._data.add(record, at);
   }

   at(index) {
      return this._isValidData() ? this._data.at(index) : undefined;
   }

   remove(at) {
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      return this._data.removeAt(at);
   }

   replace(record, at) {
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      return this._data.replace(record, at);
   }

   move(source, target) {
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      let rec = this._data.at(source);
      this._data.removeAt(source);
      this._data.add(rec, target);
   }

   merge(acceptor, donor, idProperty) {
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      acceptor = this._data.at(acceptor);
      this._data.at(donor).each((name, value) => {
         if (name !== idProperty) {
            acceptor.set(name, value);
         }
      }, this);
      this._data.removeAt(donor);
   }

   copy(index) {
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      let clone = this._data.at(index).clone();
      this.add(clone, 1 + index);
      return clone;
   }

   clear() {
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      let count = this._data.getCount();
      for (let i = count - 1; i >= 0; i--) {
         this._data.removeAt(i);
      }
   }

   addField(format, at) {
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      this._data.addField(format, at);
   }

   removeField(name) {
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      this._data.removeField(name);
   }

   removeFieldAt(index) {
      if (!this._isValidData()) {
         throw new TypeError('Passed data has invalid format');
      }

      this._data.removeFieldAt(index);
   }

   //endregion ITable

   //region Protected methods

   _buildData(sample) {
      if (!this._data) {
         let config = <RecordSetOptions>{};
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

   _isValidData() {
      return this._data && this._data['[Types/_collection/RecordSet]'];
   }

   _getFieldsFormat() {
      return this._data.getFormat();
   }

   //endregion Protected methods
}

RecordSetTable.prototype['[Types/_entity/adapter/RecordSetTable]'] = true;
// @ts-ignore
RecordSetTable.prototype['[Types/_entity/adapter/ITable]'] = true;
RecordSetTable.prototype._data = null;
