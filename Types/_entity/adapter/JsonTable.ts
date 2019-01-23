/// <amd-module name="Types/_entity/adapter/JsonTable" />
/**
 * Адаптер для таблицы данных в формате JSON.
 * Работает с данными, представленными в виде массива (Array.<Object>).
 *
 * Создадим адаптер для таблицы:
 * <pre>
 *    var adapter = new JsonTable([{
 *       id: 1,
 *       title: 'Test 1'
 *    }, {
 *       id: 2,
 *       title: 'Test 2'
 *    }]);
 *    adapter.at(0);//{id: 1, title: 'Test 1'}
 * </pre>
 * @class Types/Adapter/JsonTable
 * @mixes Types/Entity/DestroyableMixin
 * @implements Types/Adapter/ITable
 * @mixes Types/Adapter/GenericFormatMixin
 * @mixes Types/Adapter/JsonFormatMixin
 * @public
 * @author Мальцев А.А.
 */

import DestroyableMixin from '../DestroyableMixin';
import ITable from './ITable';
import GenericFormatMixin from './GenericFormatMixin';
import JsonFormatMixin from './JsonFormatMixin';
import JsonRecord from './JsonRecord';
import {UniversalField} from '../format';
import {Set} from '../../shim';
import {mixin} from '../../util';
import {merge} from '../../object';

export default class JsonTable extends mixin(
   DestroyableMixin, GenericFormatMixin, JsonFormatMixin
) implements ITable /** @lends Types/Adapter/JsonTable.prototype */{
   /**
    * @property {Array.<Object>} Сырые данные
    */
   _data: Array<Object>;

   /**
    * Конструктор
    * @param {*} data Сырые данные
    */
   constructor(data: any) {
      super(data);
      GenericFormatMixin.constructor.call(this, data);
      JsonFormatMixin.constructor.call(this, data);
   }

   //region ITable

   readonly '[Types/_entity/adapter/ITable]': boolean;

   getData: () => any;
   getFormat: (name: string) => any;
   getSharedFormat: (name: string) => UniversalField;
   removeFieldAt: (index: number) => void;

   //region ITable

   //region Types/Adapter/JsonFormatMixin

   addField(format, at) {
      JsonFormatMixin.addField.call(this, format, at);

      let name = format.getName();
      let value = format.getDefaultValue();
      let item;
      for (let i = 0; i < this._data.length; i++) {
         item = this._data[i];
         if (!item.hasOwnProperty(name)) {
            item[name] = value;
         }
      }
   }

   removeField(name) {
      JsonFormatMixin.removeField.call(this, name);
      for (let i = 0; i < this._data.length; i++) {
         delete this._data[i][name];
      }
   }

   //endregion Types/Adapter/JsonFormatMixin

   //region Public methods

   getFields() {
      let count = this.getCount();
      let fieldSet = new Set();
      let fields = [];
      let item;
      let collector = (field) => {
         fieldSet.add(field);
      };

      for (let i = 0; i < count; i++) {
         item = this.at(i);
         if (item instanceof Object) {
            Object.keys(item).forEach(collector);
         }
      }

      fieldSet.forEach((field) => {
         fields.push(field);
      });

      return fields;
   }

   getCount() {
      return this._isValidData() ? this._data.length : 0;
   }

   add(record, at) {
      this._touchData();
      if (at === undefined) {
         this._data.push(record);
      } else {
         this._checkPosition(at);
         this._data.splice(at, 0, record);
      }
   }

   at(index) {
      return this._isValidData() ? this._data[index] : undefined;
   }

   remove(at) {
      this._touchData();
      this._checkPosition(at);
      this._data.splice(at, 1);
   }

   replace(record, at) {
      this._touchData();
      this._checkPosition(at);
      this._data[at] = record;
   }

   move(source, target) {
      this._touchData();
      if (target === source) {
         return;
      }
      let removed = this._data.splice(source, 1);
      if (target === -1) {
         this._data.unshift(removed.shift());
      } else {
         this._data.splice(target, 0, removed.shift());
      }
   }

   merge(acceptor, donor, idProperty) {
      this._touchData();

      let first = this.at(acceptor);
      let extention = this.at(donor);
      let adapter = new JsonRecord(first);
      let id = adapter.get(idProperty);
      merge(first, extention);
      adapter.set(idProperty, id);
      this.remove(donor);
   }

   copy(index) {
      this._touchData();

      let source = this.at(index);
      let clone = merge({}, source);
      this.add(clone, 1 + index);
      return clone;
   }

   clear() {
      this._touchData();
      this._data.length = 0;
   }

   //endregion Public methods

   //region Protected methods

   _touchData() {
      GenericFormatMixin._touchData.call(this);
      if (!(this._data instanceof Array)) {
         this._data = [];
      }
   }

   _isValidData() {
      return this._data instanceof Array;
   }

   _has(name) {
      let count = this.getCount();
      let has = false;
      let item;
      for (let i = 0; i < count; i++) {
         item = this.at(i);
         if (item instanceof Object) {
            has = item.hasOwnProperty(name);
            if (has) {
               break;
            }
         }
      }
      return has;
   }

   _checkPosition(at) {
      if (at < 0 || at > this._data.length) {
         throw new Error('Out of bounds');
      }
   }

   //endregion Protected methods
}

JsonTable.prototype['[Types/_entity/adapter/JsonTable]'] = true;
JsonTable.prototype._data = null;
