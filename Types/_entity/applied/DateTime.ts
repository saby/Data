import SerializableMixin, {ISignature, IState as IDefaultSerializableState} from '../SerializableMixin';
import {global} from '../../util';
import {register} from '../../di';

type DateConstructorArgumentsTuple = [number | string | Date] |
    [number, number, number, number, number, number, number];

export const $withoutTimeZone = Symbol('withoutTimeZone');

const NOW = new Date();

export interface ISerializableState<T = number | string | Date> extends IDefaultSerializableState<T> {
    withoutTimeZone?: boolean;
}

export interface IDateSignature<T = number | string | Date> extends ISignature<T> {
    state: ISerializableState<T>;
}

interface IDateTimeConstructor {
    new(): Date & SerializableMixin;
    fromJSON(data: IDateSignature): DateTime;
}

function mixin(Base: unknown): IDateTimeConstructor {
    return Base as IDateTimeConstructor;
}

function normalizeArguments(
    ...args: Array<number | string | Date | boolean>
): [boolean, DateConstructorArgumentsTuple] {
    const withoutTimeZoneIndex = args.findIndex((item) => typeof item === 'boolean');
    if (withoutTimeZoneIndex > -1) {
        return [
            args[withoutTimeZoneIndex] as boolean,
            args.slice(0, withoutTimeZoneIndex - 1) as DateConstructorArgumentsTuple
        ];
    }

    return [false, args as DateConstructorArgumentsTuple];
}

/**
 * Тип "Дата-время". Расширяет стандартный тип Date для более точной работы с типами "Дата" и "Время".
 * @class Types/_entity/applied/DateTime
 * @extends Date
 * @public
 * @author Мальцев А.А.
 */

/*
 * Date and time type. Extends standard Date type to work with "Date" and "Time" types more precisely.
 * @class Types/_entity/applied/DateTime
 * @extends Date
 * @public
 * @author Мальцев А.А.
 */
export default class DateTime extends mixin(SerializableMixin) {
    protected get _proto(): object {
        return DateTime.prototype;
    }

    /**
     * @property Сериализовать значение без сохранения информации о временной зоне
     */
    get withoutTimeZone(): boolean {
        return Boolean(this[$withoutTimeZone]);
    }

    /**
     * @property Без указания временной зоны
     */
    protected [$withoutTimeZone]: boolean;

    constructor(
        withoutTimeZone?: boolean
    );
    constructor(
        value?: number | string | Date | boolean,
        withoutTimeZone?: boolean
    );
    constructor(
        year: number,
        month: number,
        withoutTimeZone?: boolean
    );
    constructor(
        year: number,
        month: number,
        date?: number,
        withoutTimeZone?: boolean
    );
    constructor(
        year: number,
        month: number,
        date?: number,
        hours?: number,
        withoutTimeZone?: boolean
    );
    constructor(
        year: number,
        month: number,
        date?: number,
        hours?: number,
        minutes?: number,
        withoutTimeZone?: boolean
    );
    constructor(
        year: number,
        month: number,
        date?: number,
        hours?: number,
        minutes?: number,
        seconds?: number,
        withoutTimeZone?: boolean
    );
    constructor(
        year: number,
        month: number,
        date?: number,
        hours?: number,
        minutes?: number,
        seconds?: number,
        millisecond?: number,
        withoutTimeZone?: boolean
    );
    constructor(...args: Array<number | string | Date | boolean>) {
        super();

        const [withoutTimeZone, normalizedArgs]: [boolean, DateConstructorArgumentsTuple] = normalizeArguments(...args);
        const instance = new Date(...normalizedArgs as [string | number | Date]);

        // Unfortunately we can't simply extend from Date because it's not a regular object. Here are some details
        // about this issue: https://stackoverflow.com/questions/6075231/how-to-extend-the-javascript-date-object
        Object.setPrototypeOf(instance, this._proto);

        if (withoutTimeZone === true) {
            instance[$withoutTimeZone] = true;
        }

        return instance as unknown as DateTime;
    }

    // region SerializableMixin

    _getSerializableState(state: ISerializableState): ISerializableState {
        state.$options = this.getTime();
        if (this[$withoutTimeZone]) {
            state.withoutTimeZone = this[$withoutTimeZone];
        }

        return state;
    }

    _setSerializableState(state: ISerializableState): Function {
        const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
        return function(): void {
            fromSerializableMixin.call(this);
            if (state.withoutTimeZone) {
                this[$withoutTimeZone] = state.withoutTimeZone;
            }
        };
    }

    toJSON(): IDateSignature;
    toJSON(key?: unknown): string;
    toJSON(key?: unknown): IDateSignature | string {
        return SerializableMixin.prototype.toJSON.call(this);
    }

    // endregion

    // region Statics

    /**
     * Возвращает смещение часового пояса клиента, взятое из cookie с именем 'tz'.
     * Аналог {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset getTimezoneOffset}, но его можно использовать в SSR для синхронизации отображаемых значений даты/времени с часовым поясом клиента.
     */

    /*
     * Returns client time zone offset taken from cookie named 'tz'.
     * It's an analogue of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset getTimezoneOffset} but it could be used on SSR to synchronize rendered values of date/time with client time zone.
     */
    static getClientTimezoneOffset(): number {
        const clientTimeZoneStr = global.process?.domain?.req?.cookies?.tz;
        if (clientTimeZoneStr) {
            return parseInt(clientTimeZoneStr, 10);
        }

        return NOW.getTimezoneOffset();
    }

    // endregion
}

// Deal with not natural prototype of Date by including its prototype into the chain of prototypes like this:
// DateTime -> Interlayer[SerializableMixin -> Date]
function Interlayer(): void {/*Just carrier*/}
// Use spread operator to break off shared link because polyfill of setPrototypeOf() for IE spoils the prototype of
// SerializableMixin
Interlayer.prototype = {...Object.getPrototypeOf(DateTime.prototype)};
Object.setPrototypeOf(Interlayer.prototype, Date.prototype);
Object.setPrototypeOf(DateTime.prototype, Interlayer.prototype);

Object.assign(DateTime.prototype, {
    '[Types/_entity/applied/DateTime]': true,
    _moduleName: 'Types/entity:DateTime'
});

register('Types/entity:DateTime', DateTime, {instantiate: false});
