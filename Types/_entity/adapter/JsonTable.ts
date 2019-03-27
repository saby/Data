import DestroyableMixin from '../DestroyableMixin';
import ITable from './ITable';
import GenericFormatMixin from './GenericFormatMixin';
import JsonFormatMixin from './JsonFormatMixin';
import JsonRecord from './JsonRecord';
import {Field} from '../format';
import {Set} from '../../shim';
import {mixin} from '../../util';
import {merge} from '../../object';

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
 * @class Types/_entity/adapter/JsonTable
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_entity/adapter/ITable
 * @mixes Types/_entity/adapter/GenericFormatMixin
 * @mixes Types/_entity/adapter/JsonFormatMixin
 * @public
 * @author Мальцев А.А.
 */
export default class JsonTable extends mixin<
   DestroyableMixin,
   GenericFormatMixin,
   JsonFormatMixin
>(
   DestroyableMixin,
   GenericFormatMixin,
   JsonFormatMixin
) implements ITable {
   /**
    * Сырые данные
    */
   protected _data: object[];

   /**
    * Конструктор
    * @param data Сырые данные
    */
   constructor(data: object[]) {
      super(data);
      GenericFormatMixin.call(this, data);
      JsonFormatMixin.call(this, data);
   }

   // region JsonFormatMixin

   addField(format: Field, at: number): void {
      super.addField(format, at);

      const name = format.getName();
      const value = format.getDefaultValue();
      let item;
      for (let i = 0; i < this._data.length; i++) {
         item = this._data[i];
         if (!item.hasOwnProperty(name)) {
            item[name] = value;
         }
      }
   }

   removeField(name: string): void {
      super.removeField(name);
      for (let i = 0; i < this._data.length; i++) {
         delete this._data[i][name];
      }
   }

   // endregion

   // region ITable

   readonly '[Types/_entity/adapter/ITable]': boolean;

   getFields(): string[] {
      const count = this.getCount();
      const fieldSet = new Set();
      const fields = [];
      const collector = (field) => {
         fieldSet.add(field);
      };

      for (let i = 0; i < count; i++) {
         const item = this.at(i);
         if (item instanceof Object) {
            Object.keys(item).forEach(collector);
         }
      }

      fieldSet.forEach((field) => {
         fields.push(field);
      });

      return fields;
   }

   getCount(): number {
      return this._isValidData() ? this._data.length : 0;
   }

   add(record: object, at: number): void {
      this._touchData();
      if (at === undefined) {
         this._data.push(record);
      } else {
         this._checkPosition(at);
         this._data.splice(at, 0, record);
      }
   }

   at(index: number): object {
      return this._isValidData() ? this._data[index] : undefined;
   }

   remove(at: number): void {
      this._touchData();
      this._checkPosition(at);
      this._data.splice(at, 1);
   }

   replace(record: object, at: number): void {
      this._touchData();
      this._checkPosition(at);
      this._data[at] = record;
   }

   move(source: number, target: number): void {
      this._touchData();
      if (target === source) {
         return;
      }
      const removed = this._data.splice(source, 1);
      if (target === -1) {
         this._data.unshift(removed.shift());
      } else {
         this._data.splice(target, 0, removed.shift());
      }
   }

   merge(acceptor: number, donor: number, idProperty: string): void {
      this._touchData();

      const first = this.at(acceptor);
      const extention = this.at(donor);
      const adapter = new JsonRecord(first);
      const id = adapter.get(idProperty);
      merge(first, extention);
      adapter.set(idProperty, id);
      this.remove(donor);
   }

   copy(index: number): object {
      this._touchData();

      const source = this.at(index);
      const clone = merge({}, source);
      this.add(clone, 1 + index);
      return clone;
   }

   clear(): void {
      this._touchData();
      this._data.length = 0;
   }

   // endregion

   // region Protected methods

   protected _touchData(): void {
      if (!(this._data instanceof Array)) {
         this._data = [];
      }
   }

   protected _isValidData(): boolean {
      return this._data instanceof Array;
   }

   protected _has(name: string): boolean {
      const count = this.getCount();
      let has = false;
      for (let i = 0; i < count; i++) {
         const item = this.at(i);
         if (item instanceof Object) {
            has = item.hasOwnProperty(name);
            if (has) {
               break;
            }
         }
      }
      return has;
   }

   protected _checkPosition(at: number): void {
      if (at < 0 || at > this._data.length) {
         throw new Error('Out of bounds');
      }
   }

   // endregion
}

Object.assign(JsonTable.prototype, {
   '[Types/_entity/adapter/JsonTable]': true,
   _data: null
});
