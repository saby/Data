import DateTime from './DateTime';
import IProducible, {IProducibleConstructor} from './IProducible';
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
import Record from './Record';
import TimeInterval from './TimeInterval';
import TheDate from './Date';
import Time from './Time';
import {create, resolve} from '../di';
import {dateFromSql, dateToSql, TO_SQL_MODE} from '../formatter';
import {List, RecordSet} from '../collection';
import renders = require('Core/defaultRenders');
import {IHashMap} from '../_declarations';

type ValueType = string | Function | IProducible;

/**
 * Выделяет временную зону в строковом представлении Date
 */
const SQL_TIME_ZONE: RegExp = /[+-][:0-9]+$/;

/**
 * Возвращает словарь для поля типа "Словарь"
 * @param format Формат поля
 */
function getDictionary(format: DictionaryField | UniversalField): any[] | IHashMap<any> {
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
function isEnumNullable(value: any, options: any): boolean {
    const dict = getDictionary(options.format);
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
function isNullable(type: ValueType, value: any, options?: object): boolean {
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
function toScalar(value: any[]): any {
    if (Array.isArray(value) && value.length < 2) {
        return value.length ? value[0] : null;
    }
    return value;
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
 * @param {Types/_collection/Flags} data
 */
function serializeFlags(data: any): boolean[] {
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
    cast(value: any, type: ValueType, options?: any): any {
        options = options || {};
        if (isNullable(type, value, options)) {
            return value;
        }

        let TypeConstructor = type;
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
                        const precision = getPrecision(options.format);
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
                        return value.toString();
                    }
                    return TimeInterval.toString(value);

                case 'array':
                    const kind = getKind(options.format);
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

        if (typeof TypeConstructor === 'function') {
            if (value instanceof TypeConstructor) {
                return value;
            }

            if (TypeConstructor.prototype['[Types/_entity/IProducible]']) {
                return (TypeConstructor as IProducibleConstructor).produceInstance(
                    value,
                    options
                );
            }

            // @ts-ignore
            return new TypeConstructor(value);
        }

        throw new TypeError(`Unknown type ${TypeConstructor}`);
    },

    /**
     * Возвращет исходное значение из типизированного.
     * @param value Типизированное значение
     * @param [options] Опции
     * @return Исходное значение
     */
    serialize(value: any, options?: any): any {
        options = options || {};
        const type = getTypeName(options.format);

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
                    const precision = getPrecision(options.format);
                    if (precision > 3) {
                        return renders.real(value, precision, false, true);
                    }
                }
                return value;

            case 'date':
            case 'time':
            case 'datetime':
                value = toScalar(value);
                let serializeMode = TO_SQL_MODE.DATE;
                let withoutTimeZone = false;
                switch (type) {
                    case 'datetime':
                        serializeMode = TO_SQL_MODE.DATETIME;
                        withoutTimeZone = isWithoutTimeZone(options.format);
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
                if (value instanceof TimeInterval) {
                    return value.toString();
                }
                return TimeInterval.toString(value);

            case 'array':
                const kind = getKind(options.format);
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
