import Abstract from './Abstract';
import { IEnumerator } from '../collection';
import { EntityMarker } from '../_declarations';

/**
 * Индексирующий энумератор
 * @author Мальцев А.А.
 */
export default class IndexedEnumerator<T, U> implements IEnumerator<T, U> {
    readonly '[Types/_collection/IEnumerator]': EntityMarker = true;
    protected previous: Abstract<T, U>;
    protected _items: Array<[U, T]>;
    private index: number;

    /**
     * Конструктор.
     * @param previous Предыдущее звено.
     */
    constructor(previous: Abstract<T, U>) {
        this.previous = previous;
        this.reset();
    }

    getCurrent(): T {
        const items = this._getItems();
        const current = items[this.index];
        return current ? current[1] : undefined;
    }

    getCurrentIndex(): U {
        const items = this._getItems();
        const current = items[this.index];
        return current ? current[0] : -1 as unknown as U;
    }

    moveNext(): boolean {
        if (this.index >= this._getItems().length - 1) {
            return false;
        }
        this.index++;
        return true;
    }

    reset(): void {
        this._items = null;
        this.index = -1;
    }

    _getItems(): Array<[U, T]> {
        if (!this._items) {
            this._items = [];
            const enumerator = this.previous.getEnumerator();
            while (enumerator.moveNext()) {
                this._items.push([enumerator.getCurrentIndex(), enumerator.getCurrent()]);
            }
        }

        return this._items;
    }
}

Object.assign(IndexedEnumerator.prototype, {
    previous: null,
    index: -1,
    _items: null
});
