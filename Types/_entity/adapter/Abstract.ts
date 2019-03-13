/**
 * Абстрактный адаптер для данных.
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @class Types/_entity/adapter/Abstract
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_entity/adapter/IAdapter
 * @mixes Types/_entity/SerializableMixin
 * @public
 * @author Мальцев А.А.
 */

import DestroyableMixin from '../DestroyableMixin';
import IAdapter from './IAdapter';
import ITable from './ITable';
import IRecord from './IRecord';
import SerializableMixin from '../SerializableMixin';
import {mixin} from '../../util';
import {dateToSql, TO_SQL_MODE} from '../../formatter';

const serialize = (() => {
   interface ISerializableObject extends Object {
      getRawData?: Function;
   }

   function serializeAny(data: any): any {
      if (data instanceof Array) {
         return serializeArray(data);
      } else if (data && typeof data === 'object') {
         return serializeObject(data);
      } else {
         return data;
      }
   }

   function serializeArray(arr: any[]): any[] {
      return arr.map((item) => serializeAny(item));
   }

   function serializeObject(obj: ISerializableObject | ExtendDate): object | string {
      if (typeof (obj as ISerializableObject).getRawData === 'function') {
         // Instance of Types/_entity/Record || Types/_collection/RecordSet || Types/_source/DataSet
         return (obj as ISerializableObject).getRawData(true);
      } else if (obj instanceof Date) {
         let mode = TO_SQL_MODE.DATETIME;
         if ((obj as ExtendDate).getSQLSerializationMode) {
            switch (obj.getSQLSerializationMode()) {
               case (Date as ExtendDateConstructor).SQL_SERIALIZE_MODE_DATE:
                  mode = TO_SQL_MODE.DATE;
                  break;
               case (Date as ExtendDateConstructor).SQL_SERIALIZE_MODE_TIME:
                  mode = TO_SQL_MODE.TIME;
                  break;
            }
         }
         return dateToSql(obj, mode);
      } else {
         // Check if 'obj' is a scalar value wrapper
         if (obj.valueOf) {
            obj = obj.valueOf();
         }
         if (obj && typeof obj === 'object') {
            return serializePlainObject(obj);
         }
         return obj;
      }
   }

   function serializePlainObject(obj: object): object {
      const result = {};

      const proto = Object.getPrototypeOf(obj);
      if (proto !== null && proto !== Object.prototype) {
         throw new TypeError('Unsupported object type. Only plain objects can be serialized.');
      }

      const keys = Object.keys(obj);
      let key;
      for (let i = 0; i < keys.length; i++) {
         key = keys[i];
         result[key] = serializeAny(obj[key]);
      }
      return result;
   }

   return serializeAny;
})();

export default abstract class Abstract extends mixin(
   DestroyableMixin, SerializableMixin
) implements IAdapter /** @lends Types/_entity/adapter/Abstract.prototype */{
   readonly '[Types/_entity/adapter/IAdapter]': boolean;

   /**
    * @property Разделитель для обозначения пути в данных
    */
   _pathSeparator: string;

   constructor() {
      super();
      SerializableMixin.constructor.call(this);
   }

   getProperty(data: any, property: string): any {
      property = property || '';
      const parts = property.split(this._pathSeparator);
      let result;
      for (let i = 0; i < parts.length; i++) {
         result = i
            ? (result ? result[parts[i]] : undefined)
            : (data ? data[parts[i]] : undefined);
      }
      return result;
   }

   setProperty(data: any, property: string, value: any): void {
      if (!data || !(data instanceof Object)) {
         return;
      }
      property = property || '';
      const parts = property.split(this._pathSeparator);
      let current = data;
      for (let i = 0, max = parts.length - 1; i <= max; i++) {
         if (i === max) {
            current[parts[i]] = value;
         } else {
            if (current[parts[i]] === undefined) {
               current[parts[i]] = {};
            }
            current = current[parts[i]];
         }
      }
   }

   serialize(data: any): any {
      return serialize(data);
   }

   forRecord(data: any, tableData?: any): IRecord {
      throw new Error('Method must be implemented');
   }

   forTable(data: any): ITable {
      throw new Error('Method must be implemented');
   }

   getKeyField(data: any): string {
      throw new Error('Method must be implemented');
   }
}

Object.assign(Abstract.prototype, {
   '[Types/_entity/adapter/Abstract]': true,
   '[Types/_entity/adapter/IAdapter]': true,
   _pathSeparator: '.'
});
