/// <amd-module name="Types/_entity/factory" />
/**
 * Фабрика типов - перобразует исходные значения в типизированные и наоборот.
 * @class Types/Factory
 * @public
 * @author Мальцев А.А.
 */

/**
 * @faq Почему я вижу ошибки от Types/Di::resolve?
 * Для корректной работы с зависимости сначала надо загрузить {@link Types/_entity/Model} и {@link Types/_source/RecordSet}, а уже потом {@link Types/_entity/factory}
 */

import IProducible, {IProducibleConstructor} from './IProducible';
import {Field, ArrayField, DateTimeField, DictionaryField, MoneyField, RealField, UniversalField} from './format';
import {create, resolve, isRegistered} from '../di';
import toSql, {MODE as toSqlMode} from './date/toSql';
import fromSql from './date/fromSql';

// @ts-ignore
import CoreTimeInterval = require('Core/TimeInterval');
// @ts-ignore
import renders = require('Core/defaultRenders');

declare type ValueType = string | Function | IProducible;

/**
 * @const {RegExp} Выделяет временную зону в строковом представлении Date
 */
const SQL_TIME_ZONE: RegExp = /[+-][0-9]+$/;

/**
 * Возвращает словарь для поля типа "Словарь"
 * @param {Types/_entity/format/Field|Types/_entity/format/UniversalField} format Формат поля
 * @return {Array}
 */
function getDictionary(format: DictionaryField | UniversalField): Array<any> {
   return (format instanceof DictionaryField ? format.getDictionary() : format.meta && format.meta.dictionary) || [];
}

/**
 * Возвращает признак, что значение типа Enum может быть null
 * @param {*} value Значение.
 * @param {Object} options Опции.
 * @return {Boolean}
 */
function isEnumNullable(value: any, options: any): boolean {
   let dict = getDictionary(options.format);
   if (value === null && !dict.hasOwnProperty(value)) {
      return true;
   } else if (value === undefined) {
      return true;
   }
   return false;
}

/**
 * Возвращает признак, что значение типа может быть null
 * @param {String|Function} type Тип значения.
 * @param {*} value Значение.
 * @param {Object} [options] Опции.
 * @return {Boolean}
 */
function isNullable(type: ValueType, value: any, options?: Object): boolean {
   if (value === undefined || value === null) {
      switch (type) {
         case 'identity':
            return false;
         case 'enum':
            return isEnumNullable(value, options);
      }

      if (typeof type === 'function') {
         let inst = Object.create(type.prototype);
         if (inst && inst['[Types/_collection/IEnum]']) {
            return isEnumNullable(value, options);
         }
      }

      return true;
   }
   return false;
}

/**
 * Возвращает скалярное значение из массива
 * @param {*} value Значение
 * @return {*}
 */
function toScalar(value: Array<any>): any {
   if (Array.isArray(value) && value.length < 2) {
      return value.length ? value[0] : null;
   }
   return value;
}

/**
 * Возвращает название типа поля
 * @param {Types/_entity/format/Field|Types/_entity/format/UniversalField|String} format Формат поля
 * @return {String}
 */
function getTypeName(format: Field | UniversalField): string {
   let type;
   if (typeof format === 'object') {
      type = format instanceof Field ? format.getType() : format.type;
   } else {
      type = format;
   }
   return ('' + type).toLowerCase();
}

/**
 * Возвращает признак указания временной зоны для поля типа "Дата и время"
 * @param {Types/_entity/format/DateTimeField|Types/_entity/format/UniversalField} format Формат поля
 * @return {Number}
 */
function isWithoutTimeZone(format: DateTimeField | UniversalField): boolean {
   if (!format) {
      return false;
   }
   return format instanceof DateTimeField ? format.isWithoutTimeZone() : format.meta && format.meta.withoutTimeZone;
}

/**
 * Возвращает признак "Большие деньги"
 * @param {Types/_entity/format/MoneyField|Types/_entity/format/UniversalField} format Формат поля
 * @return {Boolean}
 */
function isLargeMoney(format: MoneyField | UniversalField): boolean {
   if (!format) {
      return false;
   }
   return format instanceof MoneyField ? format.isLarge() : format.meta && format.meta.large;
}

/**
 * Возвращает точность для поля типа "Вещественное число"
 * @param {Types/_entity/format/Field|Types/_entity/format/UniversalField} format Формат поля
 * @return {Number}
 */
function getPrecision(format: RealField): number {
   if (!format) {
      return 0;
   }
   return (format.getPrecision ? format.getPrecision() : format.meta && format.meta.precision) || 0;
}

/**
 * Возвращает тип элементов для поля типа "Массив"
 * @param {Types/_entity/format/Field|Types/_entity/format/UniversalField} format Формат поля
 * @return {String}
 */
function getKind(format: ArrayField): string {
   return (format.getKind ? format.getKind() : format.meta && format.meta.kind) || '';
}

/**
 * Сериализует поле флагов
 * @param {Types/_collectionFlags} data
 * @return {Array.<Boolean>}
 */
function serializeFlags(data: any): Array<boolean> {
   let d = [];
   data.each((name) => {
      d.push(data.get(name));
   });
   return d;
}

/**
 * Конвертирует список записей в рекордсет
 * @param {Types/_collection/List} list Список
 * @return {Types/_collection/RecordSet}
 */
function convertListToRecordSet(list) {
   let adapter = 'Types/entity:adapter.Json',
      count = list.getCount(),
      record,
      i;

   for (i = 0; i < count; i++) {
      record = list.at(i);

      //Check for Types/_entity/Record
      if (record && record['[Types/_entity/IObject]'] && record['[Types/_entity/FormattableMixin]']) {
         adapter = record.getAdapter();
         break;
      }
   }

   let rs = create('Types/collection:RecordSet', {
      adapter: adapter
   });
   for (i = 0; i < count; i++) {
      rs.add(list.at(i));
   }

   return rs.getRawData(true);
}

const factory = {
   '[Types/_entity/factory]': true,

   /**
    * @typedef {String} SimpleType
    * @variant integer Целое число
    * @variant real Действительное число
    * @variant double Действительное число с размером больше real
    * @variant boolean Логический
    * @variant money Деньги
    * @variant link Ссылка
    * @variant date Дата
    * @variant time Время
    * @variant datetime Дата-время
    * @variant timeinterval Временной интервал
    * @variant array Массив со значениями определенного типа
    */

   /**
    * Возвращает типизированное значение из исходного.
    * @param {*} value Исходное значение
    * @param {Function|SimpleType} Type Тип значения
    * @param {Object} [options] Опции
    * @return {*} Типизированное значение
    */
   cast(value: any, Type: ValueType, options?: any): any {
      options = options || {};
      if (isNullable(Type, value, options)) {
         return value;
      }

      if (typeof Type === 'string') {
         Type = Type.toLowerCase();
         switch (Type) {
            case 'recordset':
               Type = resolve(isRegistered('collection.$recordset') ? 'collection.$recordset' : 'Types/collection:RecordSet');
               break;

            case 'record':
               Type = resolve(isRegistered('entity.$model') ? 'entity.$model' : 'Types/entity:Model');
               break;

            case 'enum':
               Type = resolve('Types/collection:Enum');
               break;

            case 'flags':
               Type = resolve('Types/collection:Flags');
               break;

            case 'link':
            case 'integer':
               return typeof (value) === 'number' ?
                  value :
                  (isNaN(parseInt(value, 10)) ? null : parseInt(value, 10));

            case 'real':
            case 'double':
               return typeof (value) === 'number' ?
                  value :
                  (isNaN(parseFloat(value)) ? null : parseFloat(value));

            case 'boolean':
               return !!value;

            case 'money':
               if (!isLargeMoney(options.format)) {
                  let precision = getPrecision(options.format);
                  if (precision > 3) {
                     return renders.real(value, precision, false, true);
                  }
               }
               return value === undefined ? null : value;

            case 'date':
            case 'time':
            case 'datetime':
               if (value instanceof Date) {
                  return value;
               } else if (value === 'infinity') {
                  return Infinity;
               } else if (value === '-infinity') {
                  return -Infinity;
               }
               value = fromSql('' + value);
               if (value.setSQLSerializationMode) {
                  switch (Type) {
                     case 'date':
                        value.setSQLSerializationMode((<ExtendDateConstructor>Date).SQL_SERIALIZE_MODE_DATE);
                        break;
                     case 'time':
                        value.setSQLSerializationMode((<ExtendDateConstructor>Date).SQL_SERIALIZE_MODE_TIME);
                        break;
                     case 'datetime':
                        value.setSQLSerializationMode((<ExtendDateConstructor>Date).SQL_SERIALIZE_MODE_DATETIME);
                        break;
                  }
               }
               return value;

            case 'timeinterval':
               if (value instanceof CoreTimeInterval) {
                  return value.toString();
               }
               return CoreTimeInterval.toString(value);

            case 'array':
               let kind = getKind(options.format);
               if (!(value instanceof Array)) {
                  value = [value];
               }
               return value.map((val) => {
                  return this.cast(val, kind, options);
               }, this);

            default:
               return value;
         }
      }

      if (typeof Type === 'function') {
         if (value instanceof Type) {
            return value;
         }

         if (Type.prototype['[Types/_entity/IProducible]']) {
            return (<IProducibleConstructor>Type).produceInstance(
               value,
               options
            );
         }

         // @ts-ignore
         return new Type(value);
      }

      throw new TypeError(`Unknown type ${Type}`);
   },

   /**
    * Возвращет исходное значение из типизированного.
    * @param {*} value Типизированное значение
    * @param {Object} [options] Опции
    * @return {*} Исходное значение
    */
   serialize(value: any, options?: any): any {
      options = options || {};
      let type = getTypeName(options.format);

      if (isNullable(type, value, options)) {
         return value;
      }

      if (value && typeof value === 'object') {
         if (value['[Types/_entity/FormattableMixin]']) {
            value = value.getRawData(true);
         }  else if (value['[Types/_collection/IFlags]']) {
            value = serializeFlags(value);
         } else if (value['[Types/_collection/IEnum]']) {
            value = value.get();
         } else if (value['[Types/_collection/IList]'] && type === 'recordset') {
            value = convertListToRecordSet(value);
         } else if (value._moduleName === 'Deprecated/Record') {
            throw new TypeError('Deprecated/Record can\'t be used with "Data"');
         } else if (value._moduleName === 'Deprecated/RecordSet') {
            throw new TypeError('Deprecated/RecordSet can\'t be used with "Data"');
         } else if (value._moduleName === 'Deprecated/Enum') {
            throw new TypeError('Deprecated/Enum can\'t be used with "Data"');
         }
      }

      switch (type) {
         case 'integer':
            value = toScalar(value);
            return typeof (value) === 'number'
               ? value
               : (isNaN(value = value - 0) ? null : parseInt(value, 10));

         case 'real':
         case 'double':
            return toScalar(value);

         case 'link':
            return parseInt(value, 10);

         case 'money':
            value = toScalar(value);
            if (!isLargeMoney(options.format)) {
               let precision = getPrecision(options.format);
               if (precision > 3) {
                  return renders.real(value, precision, false, true);
               }
            }
            return value;

         case 'date':
         case 'time':
         case 'datetime':
            value = toScalar(value);
            let serializeMode = toSqlMode.DATE,
               withoutTimeZone = false;
            switch (type) {
               case 'datetime':
                  serializeMode = toSqlMode.DATETIME;
                  withoutTimeZone = isWithoutTimeZone(options.format);
                  break;
               case 'time':
                  serializeMode = toSqlMode.TIME;
                  break;
            }
            if (!value) {
               value = fromSql('' + value);
            }
            if (value instanceof Date) {
               value = toSql(value, serializeMode);
               if (withoutTimeZone) {
                  value = value.replace(SQL_TIME_ZONE, '');
               }
            } else if (value === Infinity) {
               return 'infinity';
            } else if (value === -Infinity) {
               return '-infinity';
            }
            return value;

         case 'timeinterval':
            value = toScalar(value);
            if (value instanceof CoreTimeInterval) {
               return value.toString();
            }
            return CoreTimeInterval.toString(value);

         case 'array':
            let kind = getKind(options.format);
            if (!(value instanceof Array)) {
               value = [value];
            }
            return value.map((val) => {
               return this.serialize(val, {format: kind});
            }, this);

         default:
            return value;
      }
   }
};

export default factory;
