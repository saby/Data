import Abstract from './Abstract';
import FlattenedEnumerator from './FlattenedEnumerator';

/**
 * Разворачивающее звено цепочки.
 * @class Types/_chain/Flattened
 * @extends Types/_chain/Abstract
 * @public
 * @author Кудрявцев И.С.
 */
export default class Flattened<T> extends Abstract<T> {
    // region IEnumerable

    getEnumerator(): FlattenedEnumerator<T> {
        return new FlattenedEnumerator(
            this._previous
        );
    }

    // endregion
}

Flattened.prototype['[Types/_chain/Flattened]'] = true;
