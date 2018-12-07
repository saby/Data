/// <amd-module name="Types/_entity/adapter/CowRecord" />
/**
 * Адаптер записи таблицы для работы в режиме Copy-on-write.
 * @class Types/Adapter/CowRecord
 * @mixes Types/Entity/DestroyableMixin
 * @implements Types/Adapter/IRecord
 * @implements Types/Adapter/IDecorator
 * @author Мальцев А.А.
 */

import DestroyableMixin from '../DestroyableMixin';
import IRecord from './IRecord';
import IAdapter from './IAdapter';
import IDecorator from './IDecorator';
import {object} from '../../util';

export default class CowRecord extends DestroyableMixin implements IRecord, IDecorator /** @lends Types/Adapter/CowRecord.prototype */{
   /**
    * @property Оригинальный адаптер
    */
   _original: IAdapter;

   /**
    * @property Оригинальный адаптер записи
    */
   _originalRecord: IRecord;

   /**
    * @property Ф-я обратного вызова при событии записи
    */
   _writeCallback: Function;

   /**
    * @property Сырые данные были скопированы
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
      this._originalRecord = original.forRecord(data);
      if (writeCallback) {
         this._writeCallback = writeCallback;
      }
   }

   //region Types/Adapter/IRecord

   readonly '[Types/_entity/adapter/IRecord]': boolean;

   has(name) {
      return this._originalRecord.has(name);
   }

   get(name) {
      return this._originalRecord.get(name);
   }

   set(name, value) {
      this._copy();
      return this._originalRecord.set(name, value);
   }

   clear() {
      this._copy();
      return this._originalRecord.clear();
   }

   getData() {
      return this._originalRecord.getData();
   }

   getFields() {
      return this._originalRecord.getFields();
   }

   getFormat(name) {
      return this._originalRecord.getFormat(name);
   }

   getSharedFormat(name) {
      return this._originalRecord.getSharedFormat(name);
   }

   addField(format, at) {
      this._copy();
      return this._originalRecord.addField(format, at);
   }

   removeField(name) {
      this._copy();
      return this._originalRecord.removeField(name);
   }

   removeFieldAt(index) {
      this._copy();
      return this._originalRecord.removeFieldAt(index);
   }

   //endregion Types/Adapter/IRecord

   //region Types/Adapter/IDecorator

   readonly '[Types/_entity/adapter/IDecorator]': boolean;

   getOriginal() {
      return this._originalRecord;
   }

   //endregion Types/Adapter/IDecorator

   //region Protected methods

   _copy() {
      if (!this._copied) {
         if (this._originalRecord['[Types/_entity/ICloneable]']) {
            // @ts-ignore
            this._originalRecord = this._originalRecord.clone();
         } else {
            this._originalRecord = this._original.forRecord(
               object.clonePlain(
                  this._originalRecord.getData()
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

CowRecord.prototype['[Types/_entity/adapter/CowRecord]'] = true;
// @ts-ignore
CowRecord.prototype['[Types/_entity/adapter/IRecord]'] = true;
// @ts-ignore
CowRecord.prototype['[Types/_entity/adapter/IDecorator]'] = true;
CowRecord.prototype._original = null;
CowRecord.prototype._originalRecord = null;
CowRecord.prototype._writeCallback = null;
CowRecord.prototype._copied = false;
