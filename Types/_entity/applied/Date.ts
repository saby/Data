import DateTime, {$withoutTimeZone, ISerializableState} from './DateTime';
import SerializableMixin from '../SerializableMixin';
import {date as formatDate} from '../../formatter';
import {date as parseDate} from '../../parser';
import {register} from '../../di';

const ISO_PREFIX = 'ISO:';
const ISO_FORMAT = 'YYYY-MM-DD';

/**
 * Тип даты.
 * @class Types/_entity/applied/Date
 * @public
 * @author Мальцев А.А.
 */

/*
 * Date type
 * @class Types/_entity/applied/Date
 * @public
 * @author Мальцев А.А.
 */
export default class TheDate extends DateTime {
    protected get _proto(): object {
         return TheDate.prototype;
    }

    constructor(value?: number | string | Date);
    constructor(
        year: number,
        month: number,
        date?: number
    );
    constructor(...args: Array<number | string | Date>) {
        const instance = super(...args) as unknown as TheDate;
        instance.setHours(0);
        instance.setMinutes(0);
        instance.setSeconds(0);
        instance.setMilliseconds(0);

        if (instance[$withoutTimeZone] === true) {
            delete instance[$withoutTimeZone];
        }

        return instance;
    }

    // region SerializableMixin

    _getSerializableState(state: ISerializableState): ISerializableState {
        state.$options = ISO_PREFIX + formatDate(this as Date, ISO_FORMAT);

        return state;
    }

    _setSerializableState(state: ISerializableState): Function {
        const dateStr = String(state && state.$options);
        if (dateStr.startsWith(ISO_PREFIX)) {
            state.$options = parseDate(dateStr.substr(ISO_PREFIX.length), ISO_FORMAT);
        }

        return SerializableMixin.prototype._setSerializableState(state);
    }

    // endregion
}

Object.assign(TheDate.prototype, {
    '[Types/_entity/applied/Date]': true,
    _moduleName: 'Types/entity:Date'
});

register('Types/entity:Date', TheDate, {instantiate: false});
