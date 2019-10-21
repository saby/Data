import Abstract from './Abstract';
import {enumerator} from '../collection';

/**
 * Цепочка по объекту.
 * @class Types/_chain/Object
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
export default class Objectwise<T> extends Abstract<T> {
    protected _source: object;

    constructor(source: object) {
        if (!(source instanceof Object)) {
            throw new TypeError('Source should be an instance of Object');
        }
        super(source);
    }

    // region IEnumerable

    getEnumerator(): enumerator.Objectwise<T> {
        return new enumerator.Objectwise(this._source);
    }

    each(callback: (item: any, index: number) => void, context?: Object): void {
        const keys = Object.keys(this._source);
        const count = keys.length;
        let key;

        for (let i = 0; i < count; i++) {
            key = keys[i];
            callback.call(
                context || this,
                this._source[key],
                key,
            );
        }
    }

    value(factory?: Function): Object {
        if (factory instanceof Function) {
            return super.value(factory);
        }

        return this.toObject();
    }

    // endregion
}

Objectwise.prototype['[Types/_chain/Objectwise]'] = true;
