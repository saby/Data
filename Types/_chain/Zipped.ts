import Abstract from './Abstract';
import ZippedEnumerator from './ZippedEnumerator';

/**
 * Объединяющее звено цепочки.
 * @class Types/_chain/Zipped
 * @extends Types/_chain/Abstract
 * @public
 * @author Кудрявцев И.С.
 */
export default class Zipped<TResult, TSource1, TSource2> extends Abstract<TResult> {
    /**
     * Коллекции для объединения
     */
    protected _items: TSource2[];

    /**
     * Конструктор объединяющего звена цепочки.
     * @param source Предыдущее звено.
     * @param items Коллекции для объединения.
     */
    constructor(source: Abstract<TSource1>, items: TSource2[]) {
        super(source);
        this._items = items;
    }

    destroy(): void {
        this._items = null;
        super.destroy();
    }

    // region IEnumerable

    getEnumerator(): ZippedEnumerator<TResult, TSource1, TSource2> {
        return new ZippedEnumerator<TResult, TSource1, TSource2>(
            this._previous as unknown as Abstract<TSource1>,
            this._items
        );
    }

    // endregion
}

Object.assign(Zipped.prototype, {
    '[Types/_chain/Zipped]': true,
    _items: null
});
