import Abstract from './Abstract';
import IAdapter from './IAdapter';
import IDecorator from './IDecorator';
import CowTable from './CowTable';
import CowRecord from './CowRecord';
import SerializableMixin, {IState as ICommonState} from '../SerializableMixin';
import {register} from '../../di';
import {mixin} from '../../util';

interface ISerializableState extends ICommonState {
    _original: IAdapter;
}

/**
 * Адаптер для работы с даными в режиме Copy-on-write.
 * \|/         (__)
 *     `\------(oo)
 *       ||    (__)
 *       ||w--||     \|/
 *   \|/
 * @class Types/_entity/adapter/Cow
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_entity/adapter/IAdapter
 * @implements Types/_entity/adapter/IDecorator
 * @mixes Types/_entity/SerializableMixin
 * @author Мальцев А.А.
 */
export default class Cow extends mixin<
    Abstract,
    SerializableMixin
>(
    Abstract,
    SerializableMixin,
) implements IDecorator {
    /**
     * Оригинальный адаптер
     */
    protected _original: IAdapter;

    /**
     * Ф-я обратного вызова при событии записи
     */
    protected _writeCallback: Function;

    /**
     * Конструктор
     * @param original Оригинальный адаптер
     * @param [writeCallback] Ф-я обратного вызова при событии записи
     */
    constructor(original: IAdapter, writeCallback?: Function) {
        super();
        SerializableMixin.call(this);
        this._original = original;
        if (writeCallback) {
            this._writeCallback = writeCallback;
        }
    }

    // region IAdapter

    forTable(data?: any): CowTable {
        return new CowTable(data, this._original, this._writeCallback);
    }

    forRecord(data?: any): CowRecord {
        return new CowRecord(data, this._original, this._writeCallback);
    }

    getKeyField(data: any): string {
        return this._original.getKeyField(data);
    }

    getProperty(data: object, property: string): any {
        return this._original.getProperty(data, property);
    }

    setProperty(data: object, property: string, value: any): void {
        return this._original.setProperty(data, property, value);
    }

    // endregion

    // region IDecorator

    readonly '[Types/_entity/adapter/IDecorator]': boolean;

    getOriginal(): IAdapter {
        return this._original;
    }

    // endregion

    // region SerializableMixin

    _getSerializableState(state: ICommonState): ISerializableState {
        const resultState: ISerializableState = SerializableMixin.prototype._getSerializableState.call(this, state);
        resultState._original = this._original;
        return resultState;
    }

    _setSerializableState(state: ISerializableState): Function {
        const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
        return function(): void {
            fromSerializableMixin.call(this);
            this._original = state._original;
        };
    }

    // endregion
}

Object.assign(Cow.prototype, {
    '[Types/_entity/adapter/Cow]': true,
    '[Types/_entity/adapter/IDecorator]': true,
    _moduleName: 'Types/entity:adapter.Cow',
    _original: null,
    _writeCallback: null,
});

register('Types/entity:adapter.Cow', Cow, {instantiate: false});
