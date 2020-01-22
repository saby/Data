import DateTime from './DateTime';
import parseDate from './dateParser';
import SerializableMixin, {IState as IDefaultSerializableState} from './SerializableMixin';
import {date as formatDate} from '../formatter';
import {register} from '../di';

const ISO_PREFIX = 'ISO:';
const ISO_FORMAT = 'YYYY-MM-DD';

/**
 * Date type
 * @class Types/_entity/Date
 * @public
 * @author Мальцев А.А.
 */
export default class Date extends DateTime {
    protected get _proto(): object {
         return Date.prototype;
    }

    constructor(...args: Array<number | string>) {
        const instance = super(...args) as unknown as Date;
        instance.setHours(0);
        instance.setMinutes(0);
        instance.setSeconds(0);
        instance.setMilliseconds(0);

        return instance;
    }

    // region SerializableMixin

    _getSerializableState(state: IDefaultSerializableState): IDefaultSerializableState {
        state.$options = ISO_PREFIX + formatDate(this as any, ISO_FORMAT);

        return state;
    }

    _setSerializableState(state: IDefaultSerializableState): Function {
        const dateStr = String(state && state.$options);
        if (dateStr.startsWith(ISO_PREFIX)) {
            state.$options = parseDate(dateStr.substr(ISO_PREFIX.length), ISO_FORMAT);
        }

        return SerializableMixin.prototype._setSerializableState(state);
    }

    // endregion
}

Object.assign(Date.prototype, {
    _moduleName: 'Types/entity:Date'
});

register('Types/entity:Date', Date, {instantiate: false});
