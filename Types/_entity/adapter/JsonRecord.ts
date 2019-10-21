import DestroyableMixin from '../DestroyableMixin';
import IRecord from './IRecord';
import GenericFormatMixin from './GenericFormatMixin';
import JsonFormatMixin from './JsonFormatMixin';
import {Field} from '../format';
import {mixin} from '../../util';

/**
 * Адаптер для записи таблицы данных в формате JSON
 * Работает с данными, представленными в виде объекта (Object).
 *
 * Создадим адаптер для записи:
 * <pre>
 *     var adapter = new JsonRecord({
 *         id: 1,
 *         title: 'Test'
 *     });
 *     adapter.get('title');//'Test'
 * </pre>
 * @class Types/_entity/adapter/JsonRecord
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_entity/adapter/IRecord
 * @mixes Types/_entity/adapter/GenericFormatMixin
 * @mixes Types/_entity/adapter/JsonFormatMixin
 * @public
 * @author Мальцев А.А.
 */
export default class JsonRecord extends mixin<
    DestroyableMixin,
    GenericFormatMixin,
    JsonFormatMixin
>(
    DestroyableMixin,
    GenericFormatMixin,
    JsonFormatMixin,
) implements IRecord {
    /**
     * Сырые данные
     */
    protected _data: object;

    /**
     * Конструктор
     * @param data Сырые данные
     */
    constructor(data?: object) {
        super(data);
        GenericFormatMixin.call(this, data);
        JsonFormatMixin.call(this, data);
    }

    // region JsonFormatMixin

    addField(format: Field, at: number): void {
        if (!format || !(format instanceof Field)) {
            throw new TypeError(
                `${this._moduleName}::addField(): argument "format" should be an instance of Types/entity:format.Field`,
            );
        }

        super.addField(format, at);

        const name = format.getName();
        if (!this.has(name)) {
            this.set(name, format.getDefaultValue());
        }
    }

    removeField(name: string): void {
        super.removeField(name);
        delete this._data[name];
    }

    // endregion

    // region IRecord

    readonly '[Types/_entity/adapter/IRecord]': boolean;

    has(name: string): boolean {
        return this._isValidData() ? this._data.hasOwnProperty(name) : false;
    }

    get(name: string): any {
        return this._isValidData() ? this._data[name] : undefined;
    }

    set(name: string, value: any): void {
        if (!name) {
            throw new ReferenceError(`${this._moduleName}::set(): field name is not defined`);
        }
        this._touchData();
        this._data[name] = value;
    }

    clear(): void {
        this._touchData();
        const keys = Object.keys(this._data);
        const count = keys.length;
        for (let i = 0; i < count; i++) {
            delete this._data[keys[i]];
        }
    }

    getFields(): string[] {
        return this._isValidData() ? Object.keys(this._data) : [];
    }

    getKeyField(): string {
        return undefined;
    }

    // endregion

    // region Protected methods

    protected _has(name: string): boolean {
        return this.has(name);
    }

    // endregion
}

Object.assign(JsonRecord.prototype, {
    '[Types/_entity/adapter/JsonRecord]': true,
    '[Types/_entity/adapter/IRecord]': true,
    _data: null,
});
