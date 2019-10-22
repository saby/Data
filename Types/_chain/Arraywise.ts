import Abstract from './Abstract';
import {enumerator} from '../collection';

/**
 * Цепочка по массиву.
 * @class Types/_chain/Array
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
export default class Arraywise<T> extends Abstract<T> {
    protected _source: any[];

    constructor(source: any[]) {
        if (!(source instanceof Array)) {
            throw new TypeError('Source should be an instance of Array');
        }
        super(source);
    }

    // region IEnumerable

    getEnumerator(): enumerator.Arraywise<T> {
        return new enumerator.Arraywise(this._source);
    }

    each(callback: (item: any, index: number) => void, context?: object): void {
        for (let i = 0, count = this._source.length; i < count; i++) {
            callback.call(
                context || this,
                this._source[i],
                i
            );
        }
    }

    // endregion

    // region Public

    toArray(): any[] {
        return this._source.slice();
    }

    // endregion
}

Arraywise.prototype['[Types/_chain/Arraywise]'] = true;

Object.defineProperty(Arraywise.prototype, 'shouldSaveIndices', { value: false });
