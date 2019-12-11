import { protect } from '../util';

/**
 * Обертка для элемента коллекции, позволяющая сохранить информацию о его индексе в коллекции.
 * @param {*} item Элемент коллекции.
 * @param {*} index Индекс элемента коллекции.
 * @protected
 */
export default class SortWrapper<T, U> {
    static indexKey: string | Symbol;
    private item: T;
    private index: U;

    constructor(item: T, index: U) {
        if (item instanceof Object) {
            item[SortWrapper.indexKey as string] = index;
            return item as unknown as SortWrapper<T, U>;
        }
        this.item = item;
        this.index = index;
    }

    valueOf(): T {
        return this.item;
    }

    indexOf(): U {
        return this.index;
    }

    static valueOf<T, U>(item: SortWrapper<T, U>): T {
        return item instanceof SortWrapper ? item.valueOf() : item;
    }

    static indexOf<T, U>(item: SortWrapper<T, U>): U {
        return item instanceof SortWrapper ? item.indexOf() : item[SortWrapper.indexKey as string];
    }

    static clear<T>(item: T): void {
        if (!(item instanceof SortWrapper)) {
            delete item[SortWrapper.indexKey as string];
        }
    }
}

SortWrapper.indexKey = protect('[]');
