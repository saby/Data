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
import {IHashMap} from '../../_declarations';

type Dictionary = string[] | IHashMap<string>;

export interface IShortDeclaration {
    type: string | Function;
    defaultValue?: any;
    kind?: string;
    nullable?: boolean;
    precision?: number;
    large?: boolean;
    withoutTimeZone?: boolean;
    dictionary?: Dictionary;
}

export interface IDeclaration extends IShortDeclaration {
    name: string;
}

export type FormatDeclaration = IDeclaration[] | IHashMap<IShortDeclaration> | IHashMap<Function> | IHashMap<string>;

/**
 * Создает формат поля по его декларативному описанию.
 * @remark
 * <h2>Параметры функции</h2>
 * <ul>
 *      <li><b>declaration</b> {@link FieldDeclaration Declarative definition}</li>
 * </ul>
 * <h2>Возвращает</h2>
 * {@link Types/_entity/format/Field} Формат поля.
 * @class Types/_entity/format/fieldsFactory
 * @param declaration Декларативное описание.
 * @public
 * @author Мальцев А.А.
 */

/*
 * Creates field format by its declarative definition.
 * @remark
 * <h2>Параметры функции</h2>
 * <ul>
 *      <li><b>declaration</b> {@link FieldDeclaration Declarative definition}</li>
 * </ul>
 * <h2>Возвращает</h2>
 * {@link Types/_entity/format/Field} Field format.
 * @class Types/_entity/format/fieldsFactory
 * @param declaration Declarative definition
 * @public
 * @author Мальцев А.А.
 */
export default function<T extends Field = Field>(declaration: IDeclaration): T {
     /**
      * @typedef {String} FieldType
      * @variant boolean Логический тип
      * @variant integer Целое число
      * @variant real Реальное число
      * @variant money Денежный тип
      * @variant string Строчный тип
      * @variant xml Строка в XML-формате
      * @variant datetime Дата и время
      * @variant date Дата
      * @variant time Время
      * @variant timeinterval Временной интервал
      * @variant identity Идентификатор базы данных
      * @variant enum Перечисляемый тип
      * @variant flags Флаг
      * @variant record Запись
      * @variant model Модель
      * @variant recordset RecordSet
      * @variant binary Двоичные данные
      * @variant uuid UUID
      * @variant rpcfile RPC-файл
      * @variant object JSON-объект
      * @variant array Массив
      */

     /*
      * @typedef {String} FieldType
      * @variant boolean Logical
      * @variant integer Integer number
      * @variant real Real number
      * @variant money Money
      * @variant string String
      * @variant xml String in XML format
      * @variant datetime Date and time
      * @variant date Date
      * @variant time Time
      * @variant timeinterval Time interval
      * @variant identity Database identity
      * @variant enum Enum
      * @variant flags Flags
      * @variant record Record
      * @variant model Model
      * @variant recordset RecordSet
      * @variant binary Binary data
      * @variant uuid UUID
      * @variant rpcfile RPC file
      * @variant object JSON object
      * @variant array Array
      */

     /**
      * @typedef {Object} FieldDeclaration
      * @property {String} name Имя поля.
      * @property {FieldType|Function|String} type Тип поля (имя типа или конструктор типа)
      * @property {*} defaultValue Значение по умолчанию.
      * @property {Boolean} nullable Значение может быть нулевым.
      * @property {*} [*] Доступны любые варианты конструктора желаемого типа (Types/_entity/format/*Field).
      * Например, опция "precision" для типа @{link Types/_entity/format/MoneyField money}:
      * {name: 'amount', type: 'money', precision: 4}
      */

     /*
      * @typedef {Object} FieldDeclaration
      * @property {String} name Field name
      * @property {FieldType|Function|String} type Field type (type name or type constructor)
      * @property {*} defaultValue Default value
      * @property {Boolean} nullable Value can be null
      * @property {*} [*] Any constructor options of desired type (Types/_entity/format/*Field) are available.
      * For instance, option "precision" for type @{link Types/_entity/format/MoneyField money}:
      * {name: 'amount', type: 'money', precision: 4}
      */

    if (Object.getPrototypeOf(declaration) !== Object.prototype) {
        throw new TypeError('Types/_entity/format/fieldsFactory: declaration should be an instance of Object');
    }

    let type = declaration.type;
    if (typeof type === 'string') {
        switch (type.toLowerCase()) {
            case 'boolean':
                return new BooleanField(declaration) as any;
            case 'integer':
                return new IntegerField(declaration) as any;
            case 'real':
                return new RealField(declaration) as any;
            case 'money':
                return new MoneyField(declaration) as any;
            case 'string':
                return new StringField(declaration) as any;
            case 'text':
                logger.error(
                    'Types/_entity/format/fieldsFactory',
                    'Type "text" has been removed in 3.18.10. Use "string" instead.'
                );
                declaration.type = 'string';
                return new StringField(declaration) as any;
            case 'xml':
                return new XmlField(declaration) as any;
            case 'datetime':
                return new DateTimeField(declaration) as any;
            case 'date':
                return new DateField(declaration) as any;
            case 'time':
                return new TimeField(declaration) as any;
            case 'timeinterval':
                return new TimeIntervalField(declaration) as any;
            case 'link':
                return new LinkField(declaration) as any;
            case 'identity':
                return new IdentityField(declaration) as any;
            case 'enum':
                return new EnumField(declaration) as any;
            case 'flags':
                return new FlagsField(declaration) as any;
            case 'record':
            case 'model':
                return new RecordField(declaration) as any;
            case 'recordset':
                return new RecordSetField(declaration) as any;
            case 'binary':
                return new BinaryField(declaration) as any;
            case 'uuid':
                return new UuidField(declaration) as any;
            case 'rpcfile':
                return new RpcFileField(declaration) as any;
            case 'hierarchy':
                logger.error(
                    'Types/_entity/format/fieldsFactory',
                    'Type "hierarchy" has been removed in 3.18.10. Use "identity" instead.'
                );
                declaration.type = 'identity';
                return new IdentityField(declaration) as any;
            case 'object':
                return new ObjectField(declaration) as any;
            case 'array':
                return new ArrayField(declaration) as any;
        }

        if (isRegistered(type)) {
            type = resolve(type);
        }
    }

    if (typeof type === 'function') {
        const inst = Object.create(type.prototype);
        if (inst['[Types/_entity/IObject]'] && inst['[Types/_entity/FormattableMixin]']) {
            // Yes it's Types/_entity/Record
            return new RecordField(declaration) as any;
        } else if (inst['[Types/_collection/IList]'] && inst['[Types/_entity/FormattableMixin]']) {
            // Yes it's Types/_collection/RecordSet
            return new RecordSetField(declaration) as any;
        } else if (inst['[Types/_collection/IEnum]']) {
            return new EnumField(declaration) as any;
        } else if (inst['[Types/_collection/IFlags]']) {
            return new FlagsField(declaration) as any;
        } else if (inst instanceof Array) {
            return new ArrayField(declaration) as any;
        } else if (inst instanceof Date) {
            return new DateField(declaration) as any;
        } else if (inst instanceof String) {
            return new StringField(declaration) as any;
        } else if (inst instanceof Number) {
            return new RealField(declaration) as any;
        } else if (type === Object) {
            return new ObjectField(declaration) as any;
        }
    }

    throw new TypeError(
        'Types/_entity/format/fieldsFactory: ' +
        `unsupported field type ${typeof type === 'function' ? type.name : '"' + type + '"'}`
    );
}
