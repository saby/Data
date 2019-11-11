import {fieldsFactory, Field, UniversalField, IUniversalFieldMeta} from '../format';
import {IHashMap} from '../../_declarations';

/**
 * Миксин для работы с JSON-форматом в адаптерах
 * @mixin Types/_entity/adapter/JsonFormatMixin
 * @public
 * @author Мальцев А.А.
 */
export default abstract class JsonFormatMixin {
    '[Types/_entity/adapter/GenericFormatMixin]': boolean;

    protected _moduleName: string;

    // region GenericFormatMixin

    protected _data: any;
    protected _sharedFieldFormat: UniversalField;
    protected _getFieldMeta: (name: string) => IUniversalFieldMeta;

    // endregion

    /**
     * Форматы полей
     */
    protected _format: IHashMap<Field> = {};

    // region Public methods

    getFormat(name: string): Field {
        if (!this._has(name)) {
            throw new ReferenceError(`${this._moduleName}::getFormat(): field "${name}" doesn't exist`);
        }
        if (!this._format.hasOwnProperty(name)) {
            this._format[name] = this._buildFormat(name);
        }
        return this._format[name];
    }

    getSharedFormat(name: string): UniversalField {
        if (this._sharedFieldFormat === null) {
            this._sharedFieldFormat = new UniversalField();
        }
        const format = this._sharedFieldFormat;
        format.name = name;
        if (this._format.hasOwnProperty(name)) {
            format.type = this.getFormat(name).getType() as string;
            format.meta = this._getFieldMeta(name);
        } else {
            format.type = 'String';
        }

        return format;
    }

    addField(format: Field, at?: number): void {
        if (!format || !(format instanceof Field)) {
            throw new TypeError(
                `${this._moduleName}::addField(): format should be an instance of Types/entity:format.Field`
            );
        }
        const name = format.getName();
        if (!name) {
            throw new Error(`${this._moduleName}::addField(): field name is empty`);
        }
        this._touchData();
        this._format[name] = format;
    }

    removeField(name: string): void {
        if (!this._has(name)) {
            throw new ReferenceError(`${this._moduleName}::removeField(): field "${name}" doesn't exist`);
        }
        this._touchData();
        delete this._format[name];
    }

    removeFieldAt(index: number): void {
        throw new Error(`Method ${this._moduleName}::removeFieldAt() doesn't supported`);
    }

    // endregion

    // region Protected methods

    protected _touchData(): void {
        if (!(this._data instanceof Object)) {
            this._data = {};
        }
    }

    protected _isValidData(): boolean {
        return this._data instanceof Object;
    }

    protected abstract _has(name: string): boolean;

    protected _buildFormat(name: string): Field {
        return fieldsFactory({
            name,
            type: 'string'
        });
    }

    // endregion
}

Object.assign(JsonFormatMixin.prototype, {
    '[Types/_entity/adapter/GenericFormatMixin]': true,
    _format: null
});
