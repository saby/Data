import FIELD_TYPE from './SbisFieldType';
import {serialize} from '../factory';
import {
    fieldsFactory,
    IFieldDeclaration,
    Field,
    UniversalField,
    MoneyField,
    DictionaryField,
    DateTimeField,
    ArrayField,
    IUniversalFieldMeta,
    IUniversalFieldRealMeta,
    IUniversalFieldMoneyMeta,
    IUniversalFieldDictionaryMeta,
    IUniversalFieldDateTimeMeta,
    IUniversalFieldIdentityMeta,
    IUniversalFieldArrayMeta
} from '../format';
import {DEFAULT_PRECISION as MONEY_FIELD_DEFAULT_PRECISION} from '../format/MoneyField';
import {Map} from '../../shim';
import {object, logger, protect} from '../../util';
import {IHashMap} from '../../_declarations';
import {FormatCarrier} from './SbisFormatController';

type ComplexTypeMarker = 'record' | 'recordset';
export type GenericFormat = IRecordFormat | ITableFormat;

const entryDenormalized = protect('denormalized');

export interface ISerializable {
    toJSON(): unknown;
}

export interface IFieldType {
    n: string;
}

export interface IRealFieldType extends IFieldType {
    p?: number;
}

export interface IMoneyFieldType extends IRealFieldType {
    l?: boolean;
}

export interface IDictFieldType extends IFieldType {
    s: string[] | IHashMap<string>;
    sl?: string[] | IHashMap<string>;
}

export interface IDateTimeFieldType extends IFieldType {
    tz: boolean;
}

export interface IArrayFieldType extends IFieldType {
    t: string;
}

export interface IFieldFormat {
    n: string;
    t: string | IFieldType;
}

export interface IRecordFormat {
   _type?: ComplexTypeMarker;
   d: any[];
   s?: IFieldFormat[];
   f?: number;
}

export interface ITableFormat {
   _type?: ComplexTypeMarker;
   d: any[][];
   s?: IFieldFormat[];
   n?: boolean | number | object;
   m?: IRecordFormat;
   f?: number;
}

/**
 * Инвертированный FIELD_TYPE
 */
const FIELD_TYPE_INVERTED = Object.keys(FIELD_TYPE).reduce((memo, key) => {
    memo[FIELD_TYPE[key]] = key;
    return memo;
}, {});

/**
 * Символ для кэширования индексов полей
 */
const fieldIndicesSymbol = typeof Symbol === 'undefined' ? undefined : Symbol('fieldIndices');

function getFieldTypeNameByInner(innerName: string): string {
    return FIELD_TYPE_INVERTED[innerName] || 'string';
}

function getFieldInnerTypeNameByOuter(outerName: string): string {
    const result = FIELD_TYPE[(outerName + '').toLowerCase()];
    if (!result) {
        throw new TypeError(`Field type "${outerName}" is not supported.`);
    }
    return result;
}

/**
 * Returns format hash
 * @param format Format to handle
 */
export function getFormatHash(format: IFieldFormat[]): string {
    return format.map((field) => {
        let fieldType = field.t;
        let fieldDetails = '';
        if (fieldType && (fieldType as IFieldType).n) {
            if ((fieldType as IArrayFieldType).t) {
                fieldDetails = (fieldType as IArrayFieldType).t;
            } else if ((fieldType as IDictFieldType).s) {
                fieldDetails = JSON.stringify((fieldType as IDictFieldType).s);
            }
            fieldType = (fieldType as IFieldType).n;
        }
        return field.n + ':' + fieldType + ':' + fieldDetails;
    }).join(',');
}

/**
 * Finds formats deep within given data and calls given function for each one.
 * @param data Data to search
 * @param callback Callback to call
 */
function eachFormatEntry(data: unknown, callback: (entry: FormatCarrier) => boolean | void): boolean | void {
    if (Array.isArray(data)) {
        for (const item of data) {
            if (eachFormatEntry(item, callback) === false) {
                return false;
            }
        }
    } else if (data && typeof data === 'object') {
        const record = data as FormatCarrier;
        if (record.s !== undefined || record.f !== undefined) {
            if (callback(record) === false) {
                return false;
            }
        }
        if (record.d) {
            if (eachFormatEntry(record.d, callback) === false) {
                return false;
            }
        }
    }
}

function denormalizeEntry(entry: GenericFormat, store: Map<number, IFieldFormat[]>): void {
    // Check if entry is normalized
    const formatIndex = entry.f;

    if (entry.s) {
        // Set reference from format index to format definition
        store.set(formatIndex, entry.s.slice());
    } else {
        // Set format definition by index
        Object.defineProperty(entry, 's', {
            configurable: true,
            enumerable: true,
            value: store.get(formatIndex).slice(),
            writable: true
        });
    }

    // Keep the format index but make it not enumerable
    delete entry.f;
    Object.defineProperty(entry, 'f', {
        configurable: true,
        value: formatIndex
    });
}

export function markEntryAsDenormalized(entry: GenericFormat): void {
    Object.defineProperty(entry, entryDenormalized, {
        enumerable: false,
        value: true
    });
}

/**
 * Injects format controller deep within data scope
 */
export function denormalizeFormats(data: GenericFormat): void {
    if (!data || data[entryDenormalized]) {
        return;
    }

    let store: Map<number, IFieldFormat[]>;

    eachFormatEntry(data, (entry) => {
        store = store || new Map<number, IFieldFormat[]>();

        // Check if entry is normalized
        if (entry.f === undefined) {
            return;
        }

        // Check if injection has done
        if (entry[entryDenormalized]) {
            return;
        }

        denormalizeEntry(entry, store);
        markEntryAsDenormalized(entry);
    });
}

/**
 * Makes data clone with normalized formats
 * @param data Raw data with formats
 */
export function normalizeFormats(data: object): object {
    const dataClone = object.clonePlain(data);
    const formatStorage = new Map<string, number>();

    eachFormatEntry(dataClone, (entry) => {
        const format = entry.s;
        if (format !== undefined) {
            // TODO: accelerate this by using object comparsion by link
            const formatKey = getFormatHash(format);
            if (formatStorage.has(formatKey)) {
                const formatNumber = formatStorage.get(formatKey);
                delete entry.s;
                entry.f = formatNumber;
            } else {
                const formatNumber = formatStorage.size;
                formatStorage.set(formatKey, formatNumber);
                entry.f = formatNumber;
            }
        }
    });

    return dataClone;
}

/**
 * Add additional behaviour during object serialization
 * @param data Raw data with formats
 */
export function makeSerializable(data: object): void {
    if (!data || (data as ISerializable).toJSON) {
        return;
    }

    Object.defineProperty(data, 'toJSON', {
        enumerable: false,
        value: () => normalizeFormats(data)
    });
}

/**
 * Миксин для работы с СБИС-форматом в адаптерах
 * @mixin Types/_entity/adapter/SbisFormatMixin
 * @public
 * @author Мальцев А.А.
 */
export default abstract class SbisFormatMixin {
    readonly '[Types/_entity/adapter/SbisFormatMixin]': boolean;

    protected _moduleName: string;

    /**
     * Сырые данные
     */
    protected _data: GenericFormat;

    /**
     * Название поля -> индекс в d
     */
    protected _fieldIndices: Map<string, number>;

    /**
     * Форматы полей
     */
    protected _format: IHashMap<Field>;

    /**
     * Формат поля, отдаваемый через getSharedFormat()
     */
    protected _sharedFieldFormat: UniversalField;

    /**
     * Мета данные поля, отдаваемого через getSharedFormat()
     */
    protected _sharedFieldMeta: IUniversalFieldMeta;

    /**
     * Сигнатура типа
     */
    get type(): string {
        return '';
    }

    constructor(data: GenericFormat, injected?: boolean) {
        if (data) {
            if (Object.getPrototypeOf(data) !== Object.prototype) {
                throw new TypeError('Argument \'data\' should be an instance of plain Object');
            }
            if (data._type && data._type !== this.type) {
                throw new TypeError(
                    `Argument 'data' has '${data._type}' type signature but '${this.type}' is expected.`
                );
            }

            denormalizeFormats(data);
            makeSerializable(data);
        }

        this._data = data;
        this._format = {};
    }

    // region Public methods

    getData(): GenericFormat {
        return this._data;
    }

    getFields(): string[] {
        const fields = [];
        if (this._isValidData()) {
            const s = this._data.s;
            for (let i = 0, count = s.length; i < count; i++) {
                fields.push(s[i].n);
            }
        }
        return fields;
    }

    clear(): void {
        this._touchData();
        this._data.d.length = 0;
    }

    getFormat<T extends Field = Field>(name: string): T {
        if (!this._has(name)) {
            throw new ReferenceError(`${this._moduleName}::getFormat(): field "${name}" doesn't exist`);
        }
        if (!this._format.hasOwnProperty(name)) {
            this._format[name] = this._buildFormat(name);
        }
        return this._format[name] as T;
    }

    getSharedFormat(name: string): UniversalField {
        const format = this._sharedFieldFormat || (this._sharedFieldFormat = new UniversalField());
        const index = this._getFieldIndex(name);
        if (index === -1) {
            throw new ReferenceError(`${this._moduleName}::getSharedFormat(): field "${name}" doesn't exist`);
        }
        format.name = name;
        format.type = this._getFieldType(index);
        format.meta = this._getFieldMeta(index, format.type, true);

        return format;
    }

    addField(format: Field, at?: number): void {
        if (!format || !(format instanceof Field)) {
            throw new TypeError(
                `${this._moduleName}::addField(): format should be an instance of Types/entity:format.Field`
            );
        }

        const name = format.getName();
        if (this._has(name)) {
            throw new ReferenceError(`${this._moduleName}::addField(): field "${name}" already exists`);
        }

        this._touchData();
        if (at === undefined) {
            at = this._data.s.length;
        }
        this._checkFieldIndex(at, true);

        this._format[name] = format;
        this._resetFieldIndices();
        this._data.s.splice(at, 0, this._buildS(format));
        this._buildD(
            at,
            serialize(
                format.getDefaultValue(),
                {format}
            )
        );
    }

    removeField(name: string): void {
        this._touchData();
        const index = this._getFieldIndex(name);
        if (index === -1) {
            throw new ReferenceError(`${this._moduleName}::removeField(): field "${name}" doesn't exist`);
        }
        delete this._format[name];
        this._resetFieldIndices();
        this._data.s.splice(index, 1);
        this._removeD(index);
    }

    removeFieldAt(index: number): void {
        this._touchData();
        this._checkFieldIndex(index);
        const name = this._data.s[index].n;
        delete this._format[name];
        this._resetFieldIndices();
        this._data.s.splice(index, 1);
        this._removeD(index);
    }

    // endregion

    // region Protected methods

    protected _touchData(): void {
        this._data = this._normalizeData(this._data, this.type);
        makeSerializable(this._data);
    }

    protected _normalizeData(data: any, dataType: string): GenericFormat {
        if (!(data instanceof Object)) {
           data = {};
        }
        if (!(data.d instanceof Array)) {
           data.d = [];
        }
        if (!(data.s instanceof Array) && data.f === undefined) {
           data.s = [];
        }
        data._type = dataType;

        return data;
    }

    protected _cloneData(shareFormat?: boolean): GenericFormat {
        const data = object.clone(this._data);
        if (shareFormat && data) {
            if (data.s) {
                data.s = this._data.s;
            }
            if (data.f !== undefined && this._data.f !== undefined) {
                data.f = this._data.f;
            }
            // Keep sharing fields format
        }
        return data;
    }

    protected _isValidData(): boolean {
        return this._data && (this._data.s instanceof Array);
    }

    protected _has(name: string): boolean {
        return this._getFieldIndex(name) >= 0;
    }

    protected _getFieldIndex(name: string): number {
        if (!this._isValidData()) {
            return -1;
        }

        const s = this._data.s;
        let fieldIndices = fieldIndicesSymbol ? s[fieldIndicesSymbol] : this._fieldIndices;

        if (fieldIndices) {
            // Invalidate if size doesn't match
            if (fieldIndicesSymbol && fieldIndices.size !== s.length) {
                fieldIndices = null;
            }
            // Invalidate if reference doesn't match
            if (!fieldIndicesSymbol && this._fieldIndices['[{s}]'] !== s) {
                fieldIndices = null;
            }
        }

        if (!fieldIndices) {
            fieldIndices = new Map();
            if (fieldIndicesSymbol) {
                s[fieldIndicesSymbol] = fieldIndices;
            } else {
                this._fieldIndices = fieldIndices;
                this._fieldIndices['[{s}]'] = s;
            }

            for (let i = 0, count = s.length; i < count; i++) {
                fieldIndices.set(s[i].n, i);
            }
        }

        return fieldIndices.has(name) ? fieldIndices.get(name) : -1;
    }

    protected _resetFieldIndices(): void {
        if (this._isValidData()) {
            if (fieldIndicesSymbol) {
                this._data.s[fieldIndicesSymbol] = null;
            } else {
                this._fieldIndices = null;
            }
        }
    }

    protected _checkFieldIndex(index: number, appendMode?: boolean): void {
        let max = this._data.s.length - 1;
        if (appendMode) {
            max++;
        }
        if (!(index >= 0 && index <= max)) {
            throw new RangeError(`${this._moduleName}: field index "${index}" is out of bounds.`);
        }
    }

    protected _getFieldType(index: number): string {
        const field = this._data.s[index];
        let typeName = field.t;
        if (typeName && (typeName instanceof Object)) {
            typeName = typeName.n;
        }
        return getFieldTypeNameByInner(typeName as string);
    }

    protected _getFieldMeta(index: number, type: string, singleton?: boolean): IUniversalFieldMeta {
        if (singleton && this._sharedFieldMeta === null) {
            this._sharedFieldMeta = {};
        }
        const info = this._data.s[index];
        const meta = singleton ? this._sharedFieldMeta : {};

        switch (type) {
            case 'real':
                (meta as IUniversalFieldRealMeta).precision = (info.t as IRealFieldType).p;
                break;

            case 'money':
                (meta as IUniversalFieldMoneyMeta).precision = undefined;
                if (typeof info.t === 'object' && 'p' in info.t) {
                    (meta as IUniversalFieldMoneyMeta).precision = (info.t as IMoneyFieldType).p;
                }
                (meta as IUniversalFieldMoneyMeta).large = !!(info.t as IMoneyFieldType).l;
                break;

            case 'enum':
            case 'flags':
                (meta as IUniversalFieldDictionaryMeta).dictionary = (info.t as IDictFieldType).s as string[];
                (meta as IUniversalFieldDictionaryMeta).localeDictionary = (info.t as IDictFieldType).sl as string[];
                break;

            case 'datetime':
                (meta as IUniversalFieldDateTimeMeta).withoutTimeZone = info.t
                    && (info.t as IDateTimeFieldType).n
                    && 'tz' in (info.t as IDateTimeFieldType)
                        ? !(info.t as IDateTimeFieldType).tz
                        : false;
                break;

            case 'identity':
                (meta as IUniversalFieldIdentityMeta).separator = ',';
                break;

            case 'array':
                (meta as IUniversalFieldArrayMeta).kind = getFieldTypeNameByInner((info.t as IArrayFieldType).t);
                Object.assign(meta, this._getFieldMeta(index, (meta as IUniversalFieldArrayMeta).kind));
                break;
        }

        return meta;
    }

    protected _checkFormat(record: IRecordFormat, prefix: string): void {
        const inner = this._isValidData() ? this._data.s : [];
        const outer = record ? record.s || [] : [];
        const count = inner.length;
        let error;

        if (inner === outer) {
            return;
        }

        prefix = prefix || '';

        if (count !== outer.length) {
            error = count + ' columns expected instead of ' + outer.length;
        } else {
            for (let i = 0; i < count; i++) {
                error = this._checkFormatColumns(
                    inner[i],
                    outer[i],
                    i
                );
                if (error) {
                    break;
                }
            }
        }

        if (error) {
            logger.info(this._moduleName + prefix + ': the formats are not equal (' + error + ')');
        }
    }

    protected _checkFormatColumns(inner: IFieldFormat, outer: IFieldFormat, index: number): string {
        if (!outer || inner.n !== outer.n) {
            return `field with name "${inner.n}" at position ${index} expected instead of "${outer.n}"`;
        }

        let innerType = inner.t;
        let outerType;

        if (innerType && (innerType as IFieldType).n) {
            innerType = (innerType as IFieldType).n;
        }
        outerType = outer.t;
        if (outerType && outerType.n) {
            outerType = outerType.n;
        }
        if (innerType !== outerType) {
            return `expected type for "${inner.n}" at position '${index} is "${innerType}" instead of "${outerType}"`;
        }
    }

    protected _buildFormatDeclaration(name: string): IFieldDeclaration {
        const index = this._getFieldIndex(name);
        const type = this._getFieldType(index);
        const declaration = this._getFieldMeta(index, type) as IFieldDeclaration;
        declaration.name = name;
        declaration.type = type;
        return declaration;
    }

    protected _buildFormat<T extends Field = Field>(name: string): T {
        return fieldsFactory<T>(
            this._buildFormatDeclaration(name)
        );
    }

    protected _buildS(format: Field): IFieldFormat {
        const data = {
            t: '',
            n: format.getName()
        };
        this._buildSType(data, format);

        return data;
    }

    protected _buildSType(data: IFieldFormat, format: Field): void {
        const type = (format.getTypeName() + '').toLowerCase();
        switch (type) {
            case 'money':
                let precision;
                let isLarge;

                if (format instanceof MoneyField) {
                    precision = format.getPrecision();
                    if (precision === MONEY_FIELD_DEFAULT_PRECISION) {
                         precision = undefined;
                    }
                    isLarge = format.isLarge();
                }

                if (precision || isLarge) {
                    data.t = {
                         n: FIELD_TYPE[type]
                    };
                    if (precision) {
                        (data.t as IRealFieldType).p = precision;
                    }
                    if (isLarge) {
                        (data.t as IMoneyFieldType).l = isLarge;
                    }
                } else {
                    data.t = FIELD_TYPE[type];
                }
                break;

            case 'enum':
            case 'flags':
                const dict = (format as DictionaryField).getDictionary();
                let dictHash: IHashMap<string>;
                if (dict instanceof Array) {
                    dictHash = dict.reduce((prev, curr, index) => {
                        prev[index] = curr;
                        return prev;
                    }, {});
                }
                (data.t as IDictFieldType) = {
                    n: FIELD_TYPE[type],
                    s: dictHash || dict
                };
                break;

            case 'datetime':
                const withoutTimeZone = (format as DateTimeField).isWithoutTimeZone();
                if (withoutTimeZone) {
                    (data.t as IDateTimeFieldType) = {
                        n: FIELD_TYPE[type],
                        tz: !withoutTimeZone
                    };
                } else {
                    data.t = FIELD_TYPE[type];
                }
                break;

            case 'array':
                (data.t as IArrayFieldType) = {
                    n: FIELD_TYPE[type],
                    t: getFieldInnerTypeNameByOuter((format as ArrayField).getKind())
                };
                break;

            default:
                data.t = FIELD_TYPE[type];
        }
    }

    protected abstract _buildD(at: number, value: any): void;

    protected abstract _removeD(at: number): void;

    // endregion
}

Object.assign(SbisFormatMixin.prototype, {
    '[Types/_entity/adapter/SbisFormatMixin]': true,
    _data: null,
    _fieldIndices: null,
    _format: null,
    _sharedFieldFormat: null,
    _sharedFieldMeta: null
});
