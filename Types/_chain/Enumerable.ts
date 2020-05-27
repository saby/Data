import Abstract, {IObject} from './Abstract';
import {IEnumerator} from '../collection';

/**
 * Цепочка по IEnumerable.
 * @class Types/_chain/Enumerable
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
export default class Enumerable<T, U> extends Abstract<T, U> {
    constructor(source: any) {
        if (!source || !source['[Types/_collection/IEnumerable]']) {
            throw new TypeError('Source must implement Types/collection:IEnumerable');
        }
        super(source);
    }

    // region IEnumerable

    getEnumerator(): IEnumerator<T, U> {
        return this._source.getEnumerator();
    }

    each(callback: (item: T, index: U) => void, context?: object): void {
        return this._source.each(callback, context);
    }

    // endregion

    // region IObject

    toObject<S = IObject<T>>(): S {
        if (this._source['[Types/_entity/IObject]']) {
            const result = {} as S;
            this.each((key, value) => {
                result[key as unknown as string] = value;
            });
            return result;
        }
        return super.toObject();
    }

    // endregion
}

Enumerable.prototype['[Types/_chain/Enumerable]'] = true;
