import DestroyableMixin from '../DestroyableMixin';
import IRecord from './IRecord';
import ICloneable from '../ICloneable';
import SbisFormatMixin, {IFieldFormat, IRecordFormat} from './SbisFormatMixin';
import {mixin} from '../../util';

/**
 * Адаптер для записи таблицы данных в формате СБиС.
 * Работает с данными, представленными в виде объекта ({_entity: 'record', d: [], s: []}), где
 * <ul>
 *     <li>d - значения полей записи;</li>
 *     <li>s - описание полей записи.</li>
 * </ul>
 *
 * Создадим адаптер для записи:
 * <pre>
 *     var adapter = new SbisRecord({
 *         _entity: 'record',
 *         d: [1, 'Test'],
 *         s: [
 *             {n: 'id', t: 'Число целое'},
 *             {n: 'title', t: 'Строка'}
 *         ]
 *     });
 *     adapter.get('title');//'Test'
 * </pre>
 * @class Types/_entity/adapter/SbisRecord
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_entity/adapter/IRecord
 * @implements Types/_entity/ICloneable
 * @mixes Types/_entity/adapter/SbisFormatMixin
 * @public
 * @author Мальцев А.А.
 */
export default class SbisRecord extends mixin<
    DestroyableMixin,
    SbisFormatMixin
>(
    DestroyableMixin,
    SbisFormatMixin
) implements IRecord, ICloneable {
    protected _data: IRecordFormat;

    /**
     * Разделитель значений при сериализации сложных типов
     */
    protected _castSeparator: string;

    get type(): string {
        return 'record';
    }

    /**
     * Конструктор
     * @param data Сырые данные
     */
    constructor(data?: IRecordFormat) {
        super(data);
        SbisFormatMixin.call(this, data);
    }

    // region IRecord

    readonly '[Types/_entity/adapter/IRecord]': boolean;

    has(name: string): boolean {
        return this._has(name);
    }

    get(name: string): any {
        const index = this._getFieldIndex(name);
        return index >= 0
            ? this._cast(this._data.s[index], this._data.d[index])
            : undefined;
    }

    set(name: string, value: any): void {
        const index = this._getFieldIndex(name);
        if (index < 0) {
            throw new ReferenceError(`${this._moduleName}::set(): field "${name}" is not defined`);
        }
        this._data.d[index] = this._uncast(this._data.s[index], value);
    }

    clear(): void {
        this._touchData();
        super.clear();
        this._data.s.length = 0;
    }

    // endregion

    // region ICloneable

    readonly '[Types/_entity/ICloneable]': boolean;

    clone<T = this>(shallow?: boolean): T {
        // FIXME: shall share _data.s with recordset _data.s after clone to keep in touch. Probably no longer need this.
        return new SbisRecord(shallow ? this.getData() : this._cloneData(true)) as any;
    }

    // endregion

    // region SbisFormatMixin

    protected _buildD(at: number, value: any): void {
        this._data.d.splice(at, 0, value);
    }

    protected _removeD(at: number): void {
        if (this._formatController) {
            this._formatController.scanFormats(this._data.d[at]);
        }

        this._data.d.splice(at, 1);
    }

    // endregion

    // region Protected methods

    protected _cast(format: IFieldFormat, value: any): any {
        switch (format && format.t) {
            case 'Идентификатор':
                if (!(value instanceof Array)) {
                    return value;
                }
                if (value.length === 1 || value[0] === null) {
                    return value[0];
                }
                return value.join(this._castSeparator);
        }
        return value;
    }

    protected _uncast(format: IFieldFormat, value: any): any {
        switch (format && format.t) {
            case 'Идентификатор':
                if (value instanceof Array) {
                    return value;
                }
                if (typeof value === 'string') {
                    return value.split(this._castSeparator);
                }
                return [value];
        }
        return value;
    }

    // endregion
}

Object.assign(SbisRecord.prototype, {
    '[Types/_entity/adapter/SbisRecord]': true,
    '[Types/_entity/adapter/IRecord]': true,
    '[Types/_entity/ICloneable]': true,
    _castSeparator: ','
});
