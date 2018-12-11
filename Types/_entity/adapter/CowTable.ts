/// <amd-module name="Types/_entity/adapter/CowTable" />
/**
 * Адаптер таблицы для работы в режиме Copy-on-write.
 * @class Types/Adapter/CowTable
 * @mixes Types/Entity/DestroyableMixin
 * @implements Types/Adapter/ITable
 * @implements Types/Adapter/IDecorator
 * @author Мальцев А.А.
 */

import DestroyableMixin from '../DestroyableMixin';
import ITable from './ITable';
import IAdapter from './IAdapter';
import IDecorator from './IDecorator';
import {object} from '../../util';

export default class CowTable extends DestroyableMixin implements ITable, IDecorator /** @lends Types/Adapter/CowTable.prototype */{
   /**
    * @property {Types/Adapter/IAdapter} Оригинальный адаптер
    */
   _original: IAdapter;

   /**
    * @property {Types/Adapter/ITable} Оригинальный адаптер таблицы
    */
   _originalTable: ITable;

   /**
    * @property {Function} Ф-я обратного вызова при событии записи
    */
   _writeCallback: Function;

   /**
    * @property {Boolean} Сырые данные были скопированы
    */
   _copied: boolean;

   /**
    * Конструктор
    * @param {*} data Сырые данные
    * @param {Types/Adapter/IAdapter} original Оригинальный адаптер
    * @param {Function} [writeCallback] Ф-я обратного вызова при событии записи
    */
   constructor(data: any, original: IAdapter, writeCallback?: Function) {
      super();
      this._original = original;
      this._originalTable = original.forTable(data);
      if (writeCallback) {
         this._writeCallback = writeCallback;
      }
   }

   //region Types/Adapter/ITable

   readonly '[Types/_entity/adapter/ITable]': boolean;

   getFields() {
      return this._originalTable.getFields();
   }

   getCount() {
      return this._originalTable.getCount();
   }

   getData() {
      return this._originalTable.getData();
   }

   add(record, at) {
      this._copy();
      return this._originalTable.add(record, at);
   }

   at(index) {
      return this._originalTable.at(index);
   }

   remove(at) {
      this._copy();
      return this._originalTable.remove(at);
   }

   replace(record, at) {
      this._copy();
      return this._originalTable.replace(record, at);
   }

   move(source, target) {
      this._copy();
      return this._originalTable.move(source, target);
   }

   merge(acceptor, donor, idProperty) {
      this._copy();
      return this._originalTable.merge(acceptor, donor, idProperty);
   }

   copy(index) {
      this._copy();
      return this._originalTable.copy(index);
   }

   clear() {
      this._copy();
      return this._originalTable.clear();
   }

   getFormat(name) {
      return this._originalTable.getFormat(name);
   }

   getSharedFormat(name) {
      return this._originalTable.getSharedFormat(name);
   }

   addField(format, at) {
      this._copy();
      return this._originalTable.addField(format, at);
   }

   removeField(name) {
      this._copy();
      return this._originalTable.removeField(name);
   }

   removeFieldAt(index) {
      this._copy();
      return this._originalTable.removeFieldAt(index);
   }

   //endregion Types/Adapter/ITable

   //region Types/Adapter/IDecorator

   readonly '[Types/_entity/adapter/IDecorator]': boolean;

   getOriginal() {
      return this._originalTable;
   }

   //endregion Types/Adapter/IDecorator

   //region Protected methods

   _copy() {
      if (!this._copied) {
         if (this._originalTable['[Types/_entity/ICloneable]']) {
            // @ts-ignore
            this._originalTable = this._originalTable.clone();
         } else {
            this._originalTable = this._original.forTable(
               object.clonePlain(
                  this._originalTable.getData()
               )
            );
         }
         this._copied = true;

         if (this._writeCallback) {
            this._writeCallback();
            this._writeCallback = null;
         }
      }
   }

   //endregion Protected methods
}

CowTable.prototype['[Types/_entity/adapter/CowTable]'] = true;
// @ts-ignore
CowTable.prototype['[Types/_entity/adapter/ITable]'] = true;
// @ts-ignore
CowTable.prototype['[Types/_entity/adapter/IDecorator]'] = true;
CowTable.prototype._original = null;
CowTable.prototype._originalTable = null;
CowTable.prototype._writeCallback = null;
CowTable.prototype._copied = false;
