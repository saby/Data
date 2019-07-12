import SerializableMixin, {IState as IDefaultSerializableState} from './SerializableMixin';
import {mixin} from '../util';

export interface ISerializableState extends IDefaultSerializableState {
    _value: number;
}

/**
 * Date and time type
 * @class Types/_entity/DateTime
 * @extends Date
 * @public
 * @author Мальцев А.А.
 */
export default class DateTime {
    constructor(year, month, day?, hour?, minute?, second?, millisecond?) {
        let instance;
        switch (arguments.length) {
            case 0:
                instance = new Date();
                break;
            case 1:
                instance = new Date(year);
                break;
            case 2:
                instance = new Date(year, month);
                break;
            case 3:
                instance = new Date(year, month, day);
                break;
            case 4:
                instance = new Date(year, month, day, hour);
                break;
            case 5:
                instance = new Date(year, month, day, hour, minute);
                break;
            case 6:
                instance = new Date(year, month, day, hour, minute, second);
                break;
            default:
                instance = new Date(year, month, day, hour, minute, second, millisecond);
        }

        // Unfortunately we can't simply extend from Date because it's not a regular object. Here are some details
        // about this issue: https://stackoverflow.com/questions/6075231/how-to-extend-the-javascript-date-object
        Object.setPrototypeOf(instance, DateTime.prototype);

        return instance;
    }

    // region SerializableMixin

    _getSerializableState(state: IDefaultSerializableState): ISerializableState {
        const resultState: ISerializableState = SerializableMixin.prototype._getSerializableState.call(this, state);
        resultState._value = this.getTime();

        return resultState;
    }

    _setSerializableState(state: ISerializableState): Function {
        const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);

        return function(): void {
            fromSerializableMixin.call(this);

            this.setTime(state._value);
        };
    }

    // endregion
}

// Deal with not natural prototype of Date
Object.setPrototypeOf(DateTime.prototype, Date.prototype);
