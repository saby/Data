import DateTime from './DateTime';
import {
    Field,
    ArrayField,
    DateTimeField,
    DictionaryField,
    MoneyField,
    RealField,
    UniversalField,
    IUniversalFieldDateTimeMeta,
    IUniversalFieldRealMeta,
    IUniversalFieldMoneyMeta,
    IUniversalFieldDictionaryMeta,
    IUniversalFieldArrayMeta
} from './format';
import IProducible, {IProducibleConstructor} from './IProducible';
import Record from './Record';
import TimeInterval from './TimeInterval';
import TheDate from './Date';
import Time from './Time';
import FormattableMixin from './FormattableMixin';
import {ISerializable} from './SerializableMixin';
import {create, resolve} from '../di';
import {dateFromSql, dateToSql, TO_SQL_MODE} from '../formatter';
import {List, RecordSet, IEnum, Flags} from '../collection';
import {IHashMap} from '../_declarations';
import renders = require('Core/defaultRenders');

type ValueType = string | Function | IProducible;

interface ICastOptions {
    format?: Field | UniversalField;
    strict?: boolean;
    [key: string]: unknown;
}

interface ISerializeOptions {
    format?: Field | UniversalField;
    [key: string]: unknown;
}

/**
 * Maximum precision to work with floating point as with a number
 */
const MAX_FLOAT_PRECISION = 3;

/**
 * Extracts time zone in Date string represenation.
 */
const SQL_TIME_ZONE: RegExp = /[+-][:0-9]+$/;

/**
 * Возвращает словарь для поля типа "Словарь"
 * @param format Формат поля
 */
function getDictionary(format: DictionaryField | UniversalField): unknown[] | IHashMap<unknown> {
    return (format instanceof DictionaryField
        ? format.getDictionary()
        : format.meta && (format.meta as IUniversalFieldDictionaryMeta).dictionary
    ) || [];
}

/**
 * Возвращает признак, что значение типа Enum может быть null
 * @param value Значение.
 * @param options Опции.
 */
function isEnumNullable(value: unknown, options: ICastOptions): boolean {
    const dict = getDictionary(options.format as DictionaryField);
    if (value === null && !dict.hasOwnProperty(value)) {
        return true;
    } else if (value === undefined) {
        return true;
    }
    return false;
}

/**
 * Возвращает признак, что значение типа может быть null
 * @param type Тип значения.
 * @param value Значение.
 * @param [options] Опции.
 */
function isNullable(type: ValueType, value: unknown, options?: ICastOptions): boolean {
    if (value === undefined || value === null) {
        switch (type) {
            case 'identity':
                return false;
            case 'enum':
                return isEnumNullable(value, options);
        }

        if (typeof type === 'function') {
            const inst = Object.create(type.prototype);
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
 */
function toScalar<T>(value: unknown): T {
    if (Array.isArray(value) && value.length < 2) {
        return value.length ? value[0] : null;
    }
    return value as T;
}

/**
 * Возвращает название типа поля
 * @param format Формат поля
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
 * @param format Формат поля
 */
function isWithoutTimeZone(format: DateTimeField | UniversalField): boolean {
    if (!format) {
        return false;
    }
    return format instanceof DateTimeField
        ? format.isWithoutTimeZone()
        : format.meta && (format.meta as IUniversalFieldDateTimeMeta).withoutTimeZone;
}

/**
 * Возвращает признак "Большие деньги"
 * @param format Формат поля
 */
function isLargeMoney(format: MoneyField | UniversalField): boolean {
    if (!format) {
        return false;
    }
    return format instanceof MoneyField
        ? format.isLarge()
        : format.meta && (format.meta as IUniversalFieldMoneyMeta).large;
}

/**
 * Возвращает точность для поля типа "Вещественное число"
 * @param format Формат поля
 */
function getPrecision(format: RealField | UniversalField): number {
    if (!format) {
        return 0;
    }
    return ((format as RealField).getPrecision
        ? (format as RealField).getPrecision()
        : (format as UniversalField).meta
            && ((format as UniversalField).meta as IUniversalFieldRealMeta).precision
    ) || 0;
}

/**
 * Возвращает тип элементов для поля типа "Массив"
 * @param format Формат поля
 */
function getKind(format: ArrayField | UniversalField): string {
    return ((format as ArrayField).getKind
        ? (format as ArrayField).getKind()
        : (format as UniversalField).meta
            && ((format as UniversalField).meta as IUniversalFieldArrayMeta).kind
    ) || '';
}

/**
 * Сериализует поле флагов
 * @param data
 */
function serializeFlags(data: Flags<unknown>): boolean[] {
    const d = [];
    data.each((name) => {
        d.push(data.get(name));
    });
    return d;
}

/**
 * Конвертирует список записей в рекордсет
 * @param list Список
 */
function convertListToRecordSet(list: List<Record>): RecordSet<unknown, Record> {
    let adapter = 'Types/entity:adapter.Json';
    const count = list.getCount();
    let record;

    for (let i = 0; i < count; i++) {
        record = list.at(i);

        // Check for Types/_entity/Record
        if (record && record['[Types/_entity/IObject]'] && record['[Types/_entity/FormattableMixin]']) {
            adapter = record.getAdapter();
            break;
        }
    }

    const rs = create<RecordSet<unknown, Record>>('Types/collection:RecordSet', {
        adapter
    });
    for (let i = 0; i < count; i++) {
        rs.add(list.at(i));
    }

    return rs.getRawData(true);
}

/**
 * Фабрика типов - перобразует исходные значения в типизированные и наоборот.
 * @faq Почему я вижу ошибки от Types/di:resolve?
 * Для корректной работы с зависимости сначала надо загрузить {@link Types/_entity/Model} и {@link Types/_source/RecordSet}, а уже потом {@link Types/_entity/factory}
 * @class Types/_entity/factory
 * @public
 * @author Мальцев А.А.
 */
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
     * @param value Исходное значение
     * @param type Тип значения
     * @param [options] Опции
     * @return Типизированное значение
     */
    cast<T = unknown>(value: unknown, type: ValueType, options?: ICastOptions): T {
        options = options || {};
        if (isNullable(type, value, options)) {
            return value as T;
        }

        let TypeConstructor: unknown = type;
        if (typeof TypeConstructor === 'string') {
            TypeConstructor = TypeConstructor.toLowerCase();
            switch (TypeConstructor) {
                case 'recordset':
                    TypeConstructor = resolve<Function>('Types/collection:RecordSet');
                    break;

                case 'record':
                    TypeConstructor = resolve<Function>('Types/entity:Model');
                    break;

                case 'enum':
                    TypeConstructor = resolve<Function>('Types/collection:Enum');
                    break;

                case 'flags':
                    TypeConstructor = resolve<Function>('Types/collection:Flags');
                    break;

                case 'link':
                case 'integer':
                    if (typeof value === 'number') {
                        return value as unknown as T;
                    }
                    value = parseInt(value as string, 10);
                    if (Number.isNaN(value as number)) {
                        return null;
                    }
                    return value as T;

                case 'real':
                case 'double':
                    if (typeof value === 'number') {
                        return value as unknown as T;
                    }
                    value = parseFloat(value as string);
                    if (Number.isNaN(value as number)) {
                        return null;
                    }
                    return value as T;

                case 'boolean':
                    return !!value as unknown as T;

                case 'money':
                    const moneyFormat = options.format as MoneyField;
                    if (!isLargeMoney(moneyFormat)) {
                        const precision = getPrecision(moneyFormat);
                        if (precision > MAX_FLOAT_PRECISION) {
                            return renders.real(value, precision, false, true);
                        }
                    }
                    return value === undefined ? null : value as T;

                case 'date':
                case 'time':
                case 'datetime':
                    if (value instanceof Date) {
                        return value as unknown as T;
                    } else if (value === 'infinity') {
                        return Infinity as unknown as T;
                    } else if (value === '-infinity') {
                        return -Infinity as unknown as T;
                    }
                    value = dateFromSql('' + value).getTime();

                    if (TypeConstructor === 'date') {
                        TypeConstructor = TheDate;
                    } else if (TypeConstructor === 'time') {
                         TypeConstructor = Time;
                    } else {
                         TypeConstructor = DateTime;
                    }
                    break;

                case 'timeinterval':
                    if (value instanceof TimeInterval) {
                        return value.toString() as unknown as T;
                    }
                    return TimeInterval.toString(value as string) as unknown as T;

                case 'array':
                    const arrayFormat = options.format as ArrayField;
                    const kind = getKind(arrayFormat);
                    const kindOptions = {...options, ...{strict: true}};
                    if (!(value instanceof Array)) {
                        value = [value];
                    }
                    return (value as unknown[]).map(
                        (val) => this.cast(val, kind, kindOptions),
                        this
                    ) as unknown as T;

                case 'string':
                    if (options.strict) {
                        return String(value) as unknown as T;
                    }
                    return value as T;

                default:
                    return value as T;
            }
        }

        if (typeof TypeConstructor === 'function') {
            if (value instanceof TypeConstructor) {
                return value as T;
            }

            if (TypeConstructor.prototype['[Types/_entity/IProducible]']) {
                return (TypeConstructor as IProducibleConstructor).produceInstance(
                    value,
                    options
                );
            }

            return new (TypeConstructor as new(opts: unknown) => T)(value);
        }

        throw new TypeError(`Unknown type ${TypeConstructor}`);
    },

    /**
     * Возвращет исходное значение из типизированного.
     * @param value Типизированное значение
     * @param [options] Опции
     * @return Исходное значение
     */
    serialize<T>(value: unknown, options?: ISerializeOptions): T {
        options = options || {};
        const type = getTypeName(options.format);

        if (isNullable(type, value, options)) {
            return value as T;
        }

        if (value && typeof value === 'object') {
            if (value['[Types/_entity/FormattableMixin]']) {
                value = (value as FormattableMixin).getRawData(true);
            }  else if (value['[Types/_collection/IFlags]']) {
                value = serializeFlags(value as Flags<unknown>);
            } else if (value['[Types/_collection/IEnum]']) {
                value = (value as IEnum<unknown>).get();
            } else if (value['[Types/_collection/IList]'] && type === 'recordset') {
                value = convertListToRecordSet(value as List<Record>);
            } else {
                const moduleName = (value as ISerializable)._moduleName;
                if (
                    moduleName === 'Deprecated/Record' ||
                    moduleName === 'Deprecated/RecordSet' ||
                    moduleName === 'Deprecated/Enum'
                ) {
                    throw new TypeError(`${moduleName} can't be used with "Types" module`);
                }
            }
        }

        switch (type) {
            case 'integer':
                value = toScalar(value);
                if (typeof value === 'number') {
                    return value as unknown as T;
                }
                value = (value as number) - 0;
                if (Number.isNaN(value as number)) {
                    return null;
                }
                return parseInt(value as string, 10) as unknown as T;

            case 'real':
            case 'double':
                return toScalar(value);

            case 'link':
                return parseInt(value as string, 10) as unknown as T;

            case 'money':
                value = toScalar(value);
                const moneyFormat = options.format as MoneyField;
                if (!isLargeMoney(moneyFormat)) {
                    const precision = getPrecision(moneyFormat);
                    if (precision > MAX_FLOAT_PRECISION) {
                        return renders.real(value, precision, false, true);
                    }
                }
                return value as T;

            case 'date':
            case 'time':
            case 'datetime':
                value = toScalar(value);
                const dateTimeFormat = options.format as DateTimeField;
                let serializeMode = TO_SQL_MODE.DATE;
                let withoutTimeZone = false;
                switch (type) {
                    case 'datetime':
                        serializeMode = TO_SQL_MODE.DATETIME;
                        withoutTimeZone = isWithoutTimeZone(dateTimeFormat);
                        break;
                    case 'time':
                        serializeMode = TO_SQL_MODE.TIME;
                        break;
                }
                if (!value) {
                    value = dateFromSql('' + value);
                }
                if (value instanceof Date) {
                    value = dateToSql(value, serializeMode);
                    if (withoutTimeZone) {
                        value = (value as string).replace(SQL_TIME_ZONE, '');
                    }
                } else if (value === Infinity) {
                    return 'infinity' as unknown as T;
                } else if (value === -Infinity) {
                    return '-infinity' as unknown as T;
                }
                return value as T;

            case 'timeinterval':
                value = toScalar(value);
                if (value instanceof TimeInterval) {
                    return value.toString() as unknown as T;
                }
                return TimeInterval.toString(value as string) as unknown as T;

            case 'array':
                const kind = getKind(options.format as ArrayField);
                if (!(value instanceof Array)) {
                    value = [value];
                }
                return (value as unknown[]).map(
                    (val) => this.serialize(val, {format: kind}),
                    this
                ) as unknown as T;

            default:
                return value as T;
        }
    }
};

export default factory;
