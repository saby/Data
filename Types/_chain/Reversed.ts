import Abstract from './Abstract';
import ReversedEnumerator from './ReversedEnumerator';

/**
 * Реверсивное звено цепочки.
 * @class Types/_chain/Reversed
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
export default class Reversed<T> extends Abstract<T> {
    // IEnumerable

    getEnumerator(): ReversedEnumerator<T> {
        return new ReversedEnumerator(
            this._previous
        );
    }

    // endregion
}

Reversed.prototype['[Types/_chain/Reversed]'] = true;
