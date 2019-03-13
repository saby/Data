/**
 * Фабрика полей - конструирует поля по декларативному описанию
 * @author Мальцев А.А.
 */

import BooleanField from './BooleanField';
import IntegerField from './IntegerField';
import RealField from './RealField';
import MoneyField from './MoneyField';
import StringField from './StringField';
import XmlField from './XmlField';
import DateTimeField from './DateTimeField';
import DateField from './DateField';
import TimeField from './TimeField';
import TimeIntervalField from './TimeIntervalField';
import LinkField from './LinkField';
import IdentityField from './IdentityField';
import EnumField from './EnumField';
import FlagsField from './FlagsField';
import RecordField from './RecordField';
import RecordSetField from './RecordSetField';
import BinaryField from './BinaryField';
import UuidField from './UuidField';
import RpcFileField from './RpcFileField';
import ObjectField from './ObjectField';
import ArrayField from './ArrayField';
import Field from './Field';
import {isRegistered, resolve} from '../../di';
import {logger} from '../../util';

/**
 * @typedef {String} FieldType
 * @variant boolean Логическое
 * @variant integer Число целое
 * @variant real Число вещественное
 * @variant money Деньги
 * @variant string Строка
 * @variant xml Строка в формате XML
 * @variant datetime Дата и время
 * @variant date Дата
 * @variant time Время
 * @variant timeinterval Временной интервал
 * @variant identity Идентификатор
 * @variant enum Перечисляемое
 * @variant flags Флаги
 * @variant record Запись
 * @variant model Модель
 * @variant recordset Выборка
 * @variant binary Двоичное
 * @variant uuid UUID
 * @variant rpcfile Файл-RPC
 * @variant object Объект
 * @variant array Массив
 */

/**
 * @typedef {Object} FieldDeclaration
 * @property {String} name Имя поля
 * @property {FieldType|Function|String} type Тип поля (название или конструктор)
 * @property {*} defaultValue Значение поля по умолчанию
 * @property {Boolean} nullable Значение может быть null
 * @property {*} [*] Доступны любые опции, которые можно передавать в конструктор (Types/_entity/format/*Field) данного
 * типа поля. Например опция precision для типа @{link Types/_entity/format/MoneyField money}:
 * {name: 'amount', type: 'money', precision: 4}
 */

export interface IDeclaration {
   name: string;
   type: string | Function;
   kind?: string;
}

/**
 * Конструирует формат поля по декларативному описанию
 * @param {FieldDeclaration} declaration Декларативное описание
 * @return {Types/_entity/format/Field}
 */
export default function(declaration: IDeclaration): Field {
   if (Object.getPrototypeOf(declaration) !== Object.prototype) {
      throw new TypeError('Types/_entity/format/FieldsFactory::create(): declaration should be an instance of Object');
   }

   let type = declaration.type;
   if (typeof type === 'string') {
      switch (type.toLowerCase()) {
         case 'boolean':
            return new BooleanField(declaration);
         case 'integer':
            return new IntegerField(declaration);
         case 'real':
            return new RealField(declaration);
         case 'money':
            return new MoneyField(declaration);
         case 'string':
            return new StringField(declaration);
         case 'text':
            logger.error(
               'Types/_entity/format/FieldsFactory::create()',
               'Type "text" has been removed in 3.18.10. Use "string" instead.'
            );
            declaration.type = 'string';
            return new StringField(declaration);
         case 'xml':
            return new XmlField(declaration);
         case 'datetime':
            return new DateTimeField(declaration);
         case 'date':
            return new DateField(declaration);
         case 'time':
            return new TimeField(declaration);
         case 'timeinterval':
            return new TimeIntervalField(declaration);
         case 'link':
            return new LinkField(declaration);
         case 'identity':
            return new IdentityField(declaration);
         case 'enum':
            return new EnumField(declaration);
         case 'flags':
            return new FlagsField(declaration);
         case 'record':
         case 'model':
            return new RecordField(declaration);
         case 'recordset':
            return new RecordSetField(declaration);
         case 'binary':
            return new BinaryField(declaration);
         case 'uuid':
            return new UuidField(declaration);
         case 'rpcfile':
            return new RpcFileField(declaration);
         case 'hierarchy':
            logger.error(
               'Types/_entity/format/FieldsFactory::create()',
               'Type "hierarchy" has been removed in 3.18.10. Use "identity" instead.'
            );
            declaration.type = 'identity';
            return new IdentityField(declaration);
         case 'object':
            return new ObjectField(declaration);
         case 'array':
            return new ArrayField(declaration);
      }

      if (isRegistered(type)) {
         type = resolve(type);
      }
   }

   if (typeof type === 'function') {
      const inst = Object.create(type.prototype);
      if (inst['[Types/_entity/IObject]'] && inst['[Types/_entity/FormattableMixin]']) {
         // Yes it's Types/_entity/Record
         return new RecordField(declaration);
      } else if (inst['[Types/_collection/IList]'] && inst['[Types/_entity/FormattableMixin]']) {
         // Yes it's Types/_collection/RecordSet
         return new RecordSetField(declaration);
      } else if (inst['[Types/_collection/IEnum]']) {
         return new EnumField(declaration);
      } else if (inst['[Types/_collection/IFlags]']) {
         return new FlagsField(declaration);
      } else if (inst instanceof Array) {
         return new ArrayField(declaration);
      } else if (inst instanceof Date) {
         return new DateField(declaration);
      } else if (inst instanceof String) {
         return new StringField(declaration);
      } else if (inst instanceof Number) {
         return new RealField(declaration);
      } else if (type === Object) {
         return new ObjectField(declaration);
      }
   }

   // tslint:disable-next-line:max-line-length
   throw new TypeError(`Types/_entity/format/fieldsFactory(): unsupported field type ${typeof type === 'function' ? type.name : '"' + type + '"'}`);
}
