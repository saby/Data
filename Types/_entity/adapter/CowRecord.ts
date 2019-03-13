/**
 * Адаптер записи таблицы для работы в режиме Copy-on-write.
 * @class Types/_entity/adapter/CowRecord
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_entity/adapter/IRecord
 * @implements Types/_entity/adapter/IDecorator
 * @author Мальцев А.А.
 */

import DestroyableMixin from '../DestroyableMixin';
import IRecord from './IRecord';
import IAdapter from './IAdapter';
import IDecorator from './IDecorator';
import ICloneable from '../ICloneable';
import {Field, UniversalField} from '../format';
import {object} from '../../util';

export default class CowRecord
   extends DestroyableMixin
   implements IRecord, IDecorator /** @lends Types/_entity/adapter/CowRecord.prototype */ {
   /**
    * @property Оригинальный адаптер
    */
   protected _original: IAdapter;

   /**
    * @property Оригинальный адаптер записи
    */
   protected _originalRecord: IRecord | ICloneable;

   /**
    * @property Ф-я обратного вызова при событии записи
    */
   protected _writeCallback: Function;

   /**
    * @property Сырые данные были скопированы
    */
   protected _copied: boolean;

   /**
    * Конструктор
    * @param {*} data Сырые данные
    * @param {Types/_entity/adapter/IAdapter} original Оригинальный адаптер
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

   // region Types/_entity/adapter/IRecord

   readonly '[Types/_entity/adapter/IRecord]': boolean;

   has(name: string): boolean {
      return (this._originalRecord as IRecord).has(name);
   }

   get(name: string): any {
      return (this._originalRecord as IRecord).get(name);
   }

   set(name: string, value: any): void {
      this._copy();
      return (this._originalRecord as IRecord).set(name, value);
   }

   clear(): void {
      this._copy();
      return (this._originalRecord as IRecord).clear();
   }

   getData(): any {
      return (this._originalRecord as IRecord).getData();
   }

   getFields(): string[] {
      return (this._originalRecord as IRecord).getFields();
   }

   getFormat(name: string): Field {
      return (this._originalRecord as IRecord).getFormat(name);
   }

   getSharedFormat(name: string): UniversalField {
      return (this._originalRecord as IRecord).getSharedFormat(name);
   }

   addField(format: Field, at?: number): void {
      this._copy();
      return (this._originalRecord as IRecord).addField(format, at);
   }

   removeField(name: string): void {
      this._copy();
      return (this._originalRecord as IRecord).removeField(name);
   }

   removeFieldAt(index: number): void {
      this._copy();
      return (this._originalRecord as IRecord).removeFieldAt(index);
   }

   // endregion

   // region Types/_entity/adapter/IDecorator

   readonly '[Types/_entity/adapter/IDecorator]': boolean;

   getOriginal(): IRecord {
      return this._originalRecord as IRecord;
   }

   // endregion

   // region Protected methods

   _copy(): void {
      if (!this._copied) {
         if (this._originalRecord['[Types/_entity/ICloneable]']) {
            this._originalRecord = (this._originalRecord as ICloneable).clone();
         } else {
            this._originalRecord = this._original.forRecord(
               object.clonePlain(
                  (this._originalRecord as IRecord).getData()
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

   // endregion
}

Object.assign(CowRecord.prototype, {
   '[Types/_entity/adapter/CowRecord]': true,
   '[Types/_entity/adapter/IRecord]': true,
   '[Types/_entity/adapter/IDecorator]': true,
   _original: null,
   _originalRecord: null,
   _writeCallback: null,
   _copied: false
});
