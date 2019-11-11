import {
    Field,
    RealField,
    DictionaryField,
    IdentityField,
    ArrayField,
    UniversalField,
    IUniversalFieldMeta,
    IUniversalFieldMoneyMeta,
    IUniversalFieldDictionaryMeta,
    IUniversalFieldIdentityMeta,
    IUniversalFieldArrayMeta
} from '../format';
import {format} from '../../collection';

/**
 * Миксин для работы с форматом в адаптерах
 * @mixin Types/_entity/adapter/GenericFormatMixin
 * @public
 * @author Мальцев А.А.
 */
export default abstract class GenericFormatMixin {
    '[Types/_entity/adapter/GenericFormatMixin]': boolean;

    protected _moduleName: string;

    /**
     * Сырые данные
     */
    protected _data: any;

    /**
     * Формат поля, отдаваемый через getSharedFormat()
     */
    protected _sharedFieldFormat: UniversalField;

    /**
     * Мета данные поля, отдаваемого через getSharedFormat()
     */
    protected _sharedFieldMeta: IUniversalFieldMeta;

    /**
     * Конструктор
     * @param data Сырые данные
     */
    constructor(data: any) {
        this._data = data;
    }

    // region Public methods

    getData(): any {
        return this._data;
    }

    abstract getFields(): string[];

    getFormat(name: string): Field {
        const fields = this._getFieldsFormat();
        const index = fields ? fields.getFieldIndex(name) : -1;
        if (index === -1) {
            throw new ReferenceError(`${this._moduleName}::getFormat(): field "${name}" doesn't exist`);
        }
        return fields.at(index);
    }

    getSharedFormat(name: string): UniversalField {
        if (this._sharedFieldFormat === null) {
            this._sharedFieldFormat = new UniversalField();
        }
        const fieldFormat = this._sharedFieldFormat;
        const fields = this._getFieldsFormat();
        const index = fields ? fields.getFieldIndex(name) : -1;

        fieldFormat.name = name;
        fieldFormat.type = index === -1 ? 'String' : fields.at(index).getType() as string;
        fieldFormat.meta = index === -1 ? {} : this._getFieldMeta(name);

        return fieldFormat;
    }

    addField(format: Field, at?: number): void {
        if (!format || !(format instanceof Field)) {
            throw new TypeError(
                `${this._moduleName}::addField(): format should be an instance of Types/entity:format.Field`
            );
        }
        const name = format.getName();
        if (!name) {
            throw new Error('{$this._moduleName}::addField(): field name is empty');
        }
        const fields = this._getFieldsFormat();
        const index = fields ? fields.getFieldIndex(name) : -1;
        if (index > -1) {
            throw new Error(`${this._moduleName}::addField(): field "${name}" already exists`);
        }
        this._touchData();
        fields.add(format, at);
    }

    removeField(name: string): void {
        const fields = this._getFieldsFormat();
        const index = fields ? fields.getFieldIndex(name) : -1;
        if (index === -1) {
            throw new ReferenceError(`${this._moduleName}::removeField(): field "${name}" doesn't exist`);
        }
        this._touchData();
        fields.removeAt(index);
    }

    removeFieldAt(index: number): void {
        this._touchData();
        const fields = this._getFieldsFormat();
        if (fields) {
            fields.removeAt(index);
        }
    }

    // endregion Public methods

    // region Protected methods

    protected _touchData(): void {
        // Could be implemented
    }

    protected _isValidData(): boolean {
        return true;
    }

    protected _getFieldsFormat(): format.Format {
        throw new Error('Method must be implemented');
    }

    protected _getFieldMeta(name: string): IUniversalFieldMeta {
        if (this._sharedFieldMeta === null) {
            this._sharedFieldMeta = {};
        }
        const format = this.getFormat(name);
        const meta = this._sharedFieldMeta;

        switch (format.getType()) {
            case 'Real':
            case 'Money':
                (meta as IUniversalFieldMoneyMeta).precision = (format as RealField).getPrecision();
                break;
            case 'Enum':
            case 'Flags':
                (meta as IUniversalFieldDictionaryMeta).dictionary = (format as DictionaryField).getDictionary();
                break;
            case 'Identity':
                (meta as IUniversalFieldIdentityMeta).separator = (format as IdentityField).getSeparator();
                break;
            case 'Array':
                (meta as IUniversalFieldArrayMeta).kind = (format as ArrayField).getKind();
                break;
        }

        return meta;
    }

    // endregion Protected methods
}

Object.assign(GenericFormatMixin.prototype, {
    '[Types/_entity/adapter/GenericFormatMixin]': true,
    _data: null,
    _sharedFieldFormat: null,
    _sharedFieldMeta: null
});
