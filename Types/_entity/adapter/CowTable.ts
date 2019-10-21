import DestroyableMixin from '../DestroyableMixin';
import ITable from './ITable';
import IAdapter from './IAdapter';
import IDecorator from './IDecorator';
import ICloneable from '../ICloneable';
import {Field, UniversalField} from '../format';
import {object} from '../../util';

/**
 * Адаптер таблицы для работы в режиме Copy-on-write.
 * @class Types/_entity/adapter/CowTable
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_entity/adapter/ITable
 * @implements Types/_entity/adapter/IDecorator
 * @author Мальцев А.А.
 */
export default class CowTable extends DestroyableMixin implements ITable, IDecorator {
    /**
     * Оригинальный адаптер
     */
    protected _original: IAdapter;

    /**
     * Оригинальный адаптер таблицы
     */
    protected _originalTable: ITable | ICloneable;

    /**
     * Ф-я обратного вызова при событии записи
     */
    protected _writeCallback: Function;

    /**
     * Сырые данные были скопированы
     */
    protected _copied: boolean;

    /**
     * Конструктор
     * @param data Сырые данные
     * @param original Оригинальный адаптер
     * @param [writeCallback] Ф-я обратного вызова при событии записи
     */
    constructor(data: any, original: IAdapter, writeCallback?: Function) {
        super();
        this._original = original;
        this._originalTable = original.forTable(data);
        if (writeCallback) {
            this._writeCallback = writeCallback;
        }
    }

    // region ITable

    readonly '[Types/_entity/adapter/ITable]': boolean;

    getFields(): string[] {
        return (this._originalTable as ITable).getFields();
    }

    getCount(): number {
        return (this._originalTable as ITable).getCount();
    }

    getData(): any {
        return (this._originalTable as ITable).getData();
    }

    add(record: any, at?: number): void {
        this._copy();
        return (this._originalTable as ITable).add(record, at);
    }

    at(index: number): any {
        return (this._originalTable as ITable).at(index);
    }

    remove(at: number): void {
        this._copy();
        return (this._originalTable as ITable).remove(at);
    }

    replace(record: any, at: number): void {
        this._copy();
        return (this._originalTable as ITable).replace(record, at);
    }

    move(source: number, target: number): void {
        this._copy();
        return (this._originalTable as ITable).move(source, target);
    }

   merge(acceptor: number, donor: number, keyProperty: string): any {
      this._copy();
      return (this._originalTable as ITable).merge(acceptor, donor, keyProperty);
   }

    copy(index: number): any {
        this._copy();
        return (this._originalTable as ITable).copy(index);
    }

    clear(): void {
        this._copy();
        return (this._originalTable as ITable).clear();
    }

    getFormat(name: string): Field {
        return (this._originalTable as ITable).getFormat(name);
    }

    getSharedFormat(name: string): UniversalField {
        return (this._originalTable as ITable).getSharedFormat(name);
    }

    addField(format: Field, at: number): void {
        this._copy();
        return (this._originalTable as ITable).addField(format, at);
    }

    removeField(name: string): void {
        this._copy();
        return (this._originalTable as ITable).removeField(name);
    }

    removeFieldAt(index: number): void {
        this._copy();
        return (this._originalTable as ITable).removeFieldAt(index);
    }

    // endregion

    // region IDecorator

    readonly '[Types/_entity/adapter/IDecorator]': boolean;

    getOriginal(): ITable {
        return this._originalTable as ITable;
    }

    // endregion

    // region Protected methods

    protected _copy(): void {
        if (!this._copied) {
            if (this._originalTable['[Types/_entity/ICloneable]']) {
                this._originalTable = (this._originalTable as ICloneable).clone();
            } else {
                this._originalTable = this._original.forTable(
                    object.clonePlain(
                        (this._originalTable as ITable).getData(),
                    ),
                );
            }
            this._copied = true;

            if (this._writeCallback) {
                this._writeCallback();
                this._writeCallback = null;
            }
        }
    }

    // endregion
}

Object.assign(CowTable.prototype, {
    '[Types/_entity/adapter/CowTable]': true,
    '[Types/_entity/adapter/ITable]': true,
    '[Types/_entity/adapter/IDecorator]': true,
    _original: null,
    _originalTable: null,
    _writeCallback: null,
    _copied: false,
});
