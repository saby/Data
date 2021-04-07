import IEnumerator from '../IEnumerator';
import { EntityMarker } from '../../_declarations';

/**
 * Энумератор для собственных свойств объекта
 * @class Types/_collection/ObjectEnumerator
 * @implements Types/_collection/IEnumerator
 * @public
 * @author Кудрявцев И.С.
 */
export default class Objectwise<T> implements IEnumerator<T, string> {
    /**
     * Объект
     */
    protected _items: object;

    /**
     * Набор свойств объекта
     */
    protected _keys: string[];

    /**
     * Текущий индекс
     */
    protected _index: number;

    /**
     * Фильтр элементов
     */
    protected _filter: (item: any, index: any) => boolean;

    /**
     * Конструктор
     * @param items Массив
     */
    constructor(items: object) {
        let checkedItems = items;
        if (checkedItems === undefined) {
            checkedItems = {};
        }

        if (!(checkedItems instanceof Object)) {
            throw new Error('Argument items should be an instance of Object');
        }

        this._items = checkedItems;
        this._keys = Object.keys(checkedItems);
    }

    // region IEnumerator

    readonly '[Types/_collection/IEnumerator]': EntityMarker = true;

    getCurrent(): T {
        if (this._index < 0) {
            return undefined;
        }
        return this._items[this._keys[this._index]];
    }

    moveNext(): boolean {
        if (1 + this._index >= this._keys.length) {
            return false;
        }
        this._index++;

        const current = this.getCurrent();
        if (this._filter && !this._filter(current, this.getCurrentIndex())) {
            return this.moveNext();
        }
        return true;
    }

    reset(): void {
        this._index = -1;
    }

    // endregion

    // region Public methods

    getCurrentIndex(): string {
        return this._keys[this._index];
    }

    /**
     * Устанавливает фильтр элементов
     * @param {function(): Boolean} filter Функция обратного вызова, которая должна для каждого элемента вернуть признак,
     * проходит ли он фильтр
     */
    setFilter(filter: (item: any, index: any) => boolean): void {
        this._filter = filter;
    }

    // endregion
}

Object.assign(Objectwise.prototype, {
    '[Types/_collection/enumerator/Objectwise]': true,
    _items: null,
    _keys: null,
    _index: -1,
    _filter: null
});
