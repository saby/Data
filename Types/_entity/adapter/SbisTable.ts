/// <amd-module name="Types/_entity/adapter/SbisTable" />
/**
 * Адаптер для таблицы данных в формате СБиС.
 * Работает с данными, представленными в виде объекта ({_entity: 'recordset', d: [], s: []}), где
 * <ul>
 *    <li>d - значения полей для каждой записи;</li>
 *    <li>s - описание полей записи.</li>
 * </ul>
 *
 * Создадим адаптер для таблицы:
 * <pre>
 *    var adapter = new SbisTable({
 *       _entity: 'recordset',
 *       d: [
 *          [1, 'Test 1'],
 *          [2, 'Test 2']
 *       ],
 *       s: [
 *          {n: 'id', t: 'Число целое'},
 *          {n: 'title', t: 'Строка'}
 *       ]
 *    });
 *    adapter.at(0);//{d: [1, 'Test 1'], s: [{n: 'id', t: 'Число целое'}, {n: 'title', t: 'Строка'}]}
 * </pre>
 * @class Types/_entity/adapter/SbisTable
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_entity/adapter/ITable
 * @implements Types/_entity/adapter/IMetaData
 * @implements Types/_entity/ICloneable
 * @mixes Types/_entity/adapter/SbisFormatMixin
 * @public
 * @author Мальцев А.А.
 */

import DestroyableMixin from '../DestroyableMixin';
import ITable from './ITable';
import IMetaData from './IMetaData';
import ICloneable from '../ICloneable';
import SbisFormatMixin from './SbisFormatMixin';
import SbisRecord from './SbisRecord';
import {fieldsFactory, Field, UniversalField} from '../format';
import {mixin} from '../../util';
import {merge} from '../../object';

export default class SbisTable extends mixin(
   DestroyableMixin, SbisFormatMixin
) implements ITable, IMetaData, ICloneable /** @lends Types/_entity/adapter/SbisTable.prototype */{
   _type: string;

   /**
    * Конструктор
    * @param {*} data Сырые данные
    */
   constructor(data) {
      super(data);
      SbisFormatMixin.constructor.call(this, data);
   }

   //region ITable

   readonly '[Types/_entity/adapter/ITable]': boolean;

   addField: (format: Field, at: number) => void;
   clear: () => void;
   getData: () => any;
   getFields: () => Array<string>;
   getFormat: (name: string) => any;
   getSharedFormat: (name: string) => UniversalField;
   removeField: (name: string) => void;
   removeFieldAt: (index: number) => void;

   getCount() {
      return this._isValidData() ? this._data.d.length : 0;
   }

   add(record, at) {
      this._touchData();
      record = this._normalizeData(record, SbisRecord.prototype._type);

      if (this._data.d.length === 0 && record.s) {
         this._data.s = record.s;
      }

      this._checkFormat(record, '::add()');
      record.s = this._data.s;

      if (at === undefined) {
         this._data.d.push(record.d);
      } else {
         this._checkRowIndex(at, true);
         this._data.d.splice(at, 0, record.d);
      }
   }

   at(index) {
      return this._isValidData() && this._data.d[index] ? {
         d: this._data.d[index],
         s: this._data.s
      } : undefined;
   }

   remove(at) {
      this._touchData();
      this._checkRowIndex(at);
      this._data.d.splice(at, 1);
   }

   replace(record, at) {
      this._touchData();
      this._checkRowIndex(at);
      if (!this._data.s.length && record.s.length) {
         this._data.s = record.s;
      }
      record.s = this._data.s;
      this._checkFormat(record, '::replace()');
      this._data.d[at] = record.d;
   }

   move(source, target) {
      this._touchData();
      if (target === source) {
         return;
      }
      let removed = this._data.d.splice(source, 1);
      target === -1 ? this._data.d.unshift(removed.shift()) : this._data.d.splice(target, 0, removed.shift());
   }

   merge(acceptor, donor) {
      this._touchData();
      this._checkRowIndex(acceptor);
      this._checkRowIndex(donor);
      merge(
         this._data.d[acceptor],
         this._data.d[donor]
      );
      this.remove(donor);
   }

   copy(index) {
      this._touchData();
      this._checkRowIndex(index);
      let source = this._data.d[index];
      let clone = merge([], source);
      this._data.d.splice(1 + index, 0, clone);
      return clone;
   }

   //endregion ITable

   //region IMetaData

   readonly '[Types/_entity/adapter/IMetaData]': boolean;

   getMetaDataDescriptor() {
      let result = [];
      let data = this.getData();

      if (!(data instanceof Object)) {
         return result;
      }

      if (data.hasOwnProperty('r')) {
         result.push(fieldsFactory({
            name: 'results',
            type: 'record'
         }));
      }

      if (data.hasOwnProperty('p')) {
         result.push(fieldsFactory({
            name: 'path',
            type: 'recordset'
         }));
      }

      if (data.hasOwnProperty('n')) {
         let type = 'integer';
         switch (typeof data.n) {
            case 'boolean':
               type = 'boolean';
               break;
            case 'object':
               if (data.n) {
                  type = 'object';
               }
               break;
         }

         result.push(fieldsFactory({
            name: 'total',
            type: type
         }));

         result.push(fieldsFactory({
            name: 'more',
            type: type
         }));
      }

      if (data.hasOwnProperty('m')) {
         let meta = new SbisRecord(data.m);
         meta.getFields().forEach((name) => {
            result.push(meta.getFormat(name));
         });
      }

      return result;
   }

   getMetaData(name) {
      let alias = this._getMetaDataAlias(name);
      let data = this.getData();

      if (alias) {
         return data && data instanceof Object ? data[alias] : undefined;
      }

      let meta = new SbisRecord(data.m);
      return meta.get(name);
   }

   setMetaData(name, value) {
      let alias = this._getMetaDataAlias(name);
      let data = this.getData();

      if (alias) {
         if (data && data instanceof Object) {
            data[alias] = value;
         }
         return;
      }

      let meta = new SbisRecord(data.m);
      meta.set(name, value);
   }

   _getMetaDataAlias(name) {
      switch (name) {
         case 'results':
            return 'r';
         case 'path':
            return 'p';
         case 'more':
         case 'total':
            return 'n';
      }
   }

   //endregion IMetaData

   //region ICloneable

   readonly '[Types/_entity/ICloneable]': boolean;

   clone(shallow?: boolean): SbisTable {
      return new SbisTable(shallow ? this.getData() : this._cloneData());
   }

   //endregion ICloneable

   //region SbisFormatMixin

   protected _buildD(at, value) {
      this._data.d.forEach((item) => {
         item.splice(at, 0, value);
      });
   }

   protected _removeD(at) {
      this._data.d.forEach((item) => {
         item.splice(at, 1);
      });
   }

   //endregion SbisFormatMixin

   //region Protected methods

   protected _checkRowIndex(index: number, addMode?: boolean) {
      let max = this._data.d.length + (addMode ? 0 : -1);
      if (!(index >= 0 && index <= max)) {
         throw new RangeError(`${this._moduleName}: row index ${index} is out of bounds.`);
      }
   }

   //endregion Protected methods
}

SbisTable.prototype['[Types/_entity/adapter/SbisTable]'] = true;
// @ts-ignore
SbisTable.prototype['[Types/_entity/adapter/ITable]'] = true;
// @ts-ignore
SbisTable.prototype['[Types/_entity/adapter/IMetaData]'] = true;
// @ts-ignore
SbisTable.prototype['[Types/_entity/ICloneable]'] = true;
SbisTable.prototype._type = 'recordset';

//FIXME: backward compatibility for check via Core/core-instance::instanceOfMixin()
SbisTable.prototype['[WS.Data/Entity/ICloneable]'] = true;

