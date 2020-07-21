import DateTime, {$withoutTimeZone} from './DateTime';
import {register} from '../../di';

/**
 * Тип "время".
 * @class Types/_entity/applied/Time
 * @public
 * @author Мальцев А.А.
 */

/*
 * Time type
 * @class Types/_entity/applied/Time
 * @public
 * @author Мальцев А.А.
 */
export default class Time extends DateTime {
    protected get _proto(): object {
        return Time.prototype;
    }
    constructor(value?: number | string | Date);
    constructor(
        year: number,
        month: number,
        date?: number,
        hours?: number,
        minutes?: number,
        seconds?: number,
        millisecond?: number
    );
    constructor(...args: Array<number | string | Date>) {
        const instance = super(...args) as unknown as Time;

        if (instance[$withoutTimeZone] === true) {
            delete instance[$withoutTimeZone];
        }

        return instance;
    }
}

Object.assign(Time.prototype, {
    '[Types/_entity/applied/Time]': true,
    _moduleName: 'Types/entity:Time'
});

register('Types/entity:Time', Time, {instantiate: false});
