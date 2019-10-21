import IndexedEnumerator from './IndexedEnumerator';

/**
 * Реверсивный энумератор
 * @author Мальцев А.А.
 */
export default class ReversedEnumerator<T> extends IndexedEnumerator<T> {
    _getItems(): T[] {
        if (!this._items) {
            super._getItems();
            this._items.reverse();

            // Build indices in natural order if necessary
            if (!this.previous.shouldSaveIndices) {
                this._items = this._items.map((item, index) => [
                    index,
                    item[1],
                ], this);
            }
        }

        return this._items;
    }
}
