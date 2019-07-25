import SerializableMixin, {ISignature, IState as IDefaultSerializableState} from './SerializableMixin';

interface IDateTimeConstructor {
    new(): Date & SerializableMixin;
    fromJSON(data: ISignature): DateTime;
}

function mixin(Base: Function): IDateTimeConstructor {
    return Base as any;
}

/**
 * Date and time type
 * @class Types/_entity/DateTime
 * @extends Date
 * @public
 * @author Мальцев А.А.
 */
export default class DateTime extends mixin(SerializableMixin) {
    protected get _proto(): object {
        return DateTime.prototype;
    }

    constructor(
        year?: number | string,
        month?: number,
        day?: number,
        hour?: number,
        minute?: number,
        second?: number,
        millisecond?: number
    ) {
        super();

        let instance;
        switch (arguments.length) {
            case 0:
                instance = new Date();
                break;
            case 1:
                instance = new Date(year);
                break;
            case 2:
                instance = new Date(year as number, month);
                break;
            case 3:
                instance = new Date(year as number, month, day);
                break;
            case 4:
                instance = new Date(year as number, month, day, hour);
                break;
            case 5:
                instance = new Date(year as number, month, day, hour, minute);
                break;
            case 6:
                instance = new Date(year as number, month, day, hour, minute, second);
                break;
            default:
                instance = new Date(year as number, month, day, hour, minute, second, millisecond);
        }

        // Unfortunately we can't simply extend from Date because it's not a regular object. Here are some details
        // about this issue: https://stackoverflow.com/questions/6075231/how-to-extend-the-javascript-date-object
        Object.setPrototypeOf(instance, this._proto);

        return instance;
    }

    // region SerializableMixin

    _getSerializableState(state: IDefaultSerializableState): IDefaultSerializableState {
        state.$options = this.getTime();

        return state;
    }

    // @ts-ignore override Date signature
    toJSON(key?: any): ISignature;

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
