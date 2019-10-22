import Abstract from './Abstract';
import ZippedEnumerator from './ZippedEnumerator';
import {IEnumerable} from '../collection';

/**
 * Объединяющее звено цепочки.
 * @class Types/_chain/Zipped
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
export default class Zipped<T> extends Abstract<T> {
    /**
     * Коллекции для объединения
     */
    protected _items: Array<T[] | IEnumerable<T>>;

    /**
     * Конструктор объединяющего звена цепочки.
     * @param source Предыдущее звено.
     * @param items Коллекции для объединения.
     */
    constructor(source: Abstract<T>, items: Array<T[] | IEnumerable<T>>) {
        super(source);
        this._items = items;
    }

    destroy(): void {
        this._items = null;
        super.destroy();
    }

    // region IEnumerable

    getEnumerator(): ZippedEnumerator<T> {
        return new ZippedEnumerator(
            this._previous,
            this._items
        );
    }

    // endregion
}

Object.assign(Zipped.prototype, {
    '[Types/_chain/Zipped]': true,
    _items: null
});
