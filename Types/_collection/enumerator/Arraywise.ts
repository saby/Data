import IEnumerator from '../IEnumerator';
import IndexedEnumeratorMixin from '../IndexedEnumeratorMixin';
import {register} from '../../di';
import {mixin} from '../../util';

type FilterFunc<T> = (item: T, index: number) => boolean;
type ResolveFunc<T> = (index: number) => T;

/**
 * Энумератор для массива
 * @class Types/_collection/ArrayEnumerator
 * @implements Types/_collection/IEnumerator
 * @mixes Types/_collection/IndexedEnumeratorMixin
 * @public
 * @author Мальцев А.А.
 */
export default class Arraywise<T> extends mixin<
    IndexedEnumeratorMixin<any>
>(
    IndexedEnumeratorMixin
) implements IEnumerator<T, number> {
    /**
     * Array to traverse
     */
    protected _items: T[];

    /**
     * Current index
     */
    _index: number;

    /**
     * Elements resolver
     */
    _resolver: ResolveFunc<T>;

    /**
     * Elements filter
     */
    _filter: FilterFunc<T>;

    /**
     * Конструктор
     * @param items Массив
     */
    constructor(items: T[]) {
        super();
        let checkedItems = items;
        if (checkedItems === undefined) {
            checkedItems = [];
        }
        if (!(checkedItems instanceof Array)) {
            throw new Error('Argument items should be an instance of Array');
        }
        this._items = checkedItems;
        IndexedEnumeratorMixin.call(this);
    }

    // region IEnumerator

    readonly '[Types/_collection/IEnumerator]': boolean = true;

    getCurrent(): T {
        if (this._index < 0) {
            return undefined;
        }
        return this._resolver ? this._resolver(this._index) : this._items[this._index];
    }

    getCurrentIndex(): number {
        return this._index;
    }

    moveNext(): boolean {
        if (1 + this._index >= this._items.length) {
            return false;
        }
        this._index++;

        const current = this.getCurrent();
        if (this._filter && !this._filter(current, this._index)) {
            return this.moveNext();
        }

        return true;
    }

    reset(): void {
        this._index = -1;
    }

    // endregion

    // region Public methods

    /**
     * Устанавливает резолвер элементов по позиции
     * @param resolver Функция обратного вызова, которая должна по позиции вернуть элемент
     */
    setResolver(resolver: ResolveFunc<T>): void {
        this._resolver = resolver;
    }

    /**
     * Устанавливает фильтр элементов
     * @param filter Функция обратного вызова, которая должна для каждого элемента вернуть
     * признак, проходит ли он фильтр
     */
    setFilter(filter: FilterFunc<T>): void {
        this._filter = filter;
    }

    // endregion
}

Object.assign(Arraywise.prototype, {
    ['[Types/_collection/enumerator/Arraywise]']: true,
    _items: null,
    _index: -1,
    _resolver: null,
    _filter: null
});

register('Types/collection:enumerator.Arraywise', Arraywise, {instantiate: false});
