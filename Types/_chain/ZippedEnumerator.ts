import {IEnumerable, IEnumerator} from '../collection';
import Abstract from './Abstract';

/**
 * Объединяющий энумератор
 * @author Мальцев А.А.
 */
export default class ZippedEnumerator<T> implements IEnumerator<T> {
    readonly '[Types/_collection/IEnumerator]': boolean = true;
    private previous: Abstract<T>;
    private items: Array<T[]|IEnumerable<T>>;
    private current: any;
    private index: number;
    private enumerator: IEnumerator<T>;
    private itemsEnumerators: Array<IEnumerator<T>>;

    /**
     * Конструктор объединяющего энумератора.
     * @param previous Предыдущее звено.
     * @param items Коллекции для объединения.
     */
    constructor(previous: Abstract<T>, items: Array<T[] | IEnumerable<T>>) {
        this.previous = previous;
        this.items = items;
        this.reset();
    }

    getCurrent(): any {
        return this.current;
    }

    getCurrentIndex(): any {
        return this.index;
    }

    moveNext(): boolean {
        this.enumerator = this.enumerator || (this.enumerator = this.previous.getEnumerator());

        const hasNext = this.enumerator.moveNext();
        let current;
        let item;
        let itemEnumerator;

        if (hasNext) {
            this.index++;

            current = [this.enumerator.getCurrent()];
            for (let i = 0; i < this.items.length; i++) {
                item = this.items[i];
                if (item instanceof Array) {
                    current.push(item[this.index]);
                } else if (item && item['[Types/_collection/IEnumerable]']) {
                    itemEnumerator = this.itemsEnumerators[i] || (this.itemsEnumerators[i] = item.getEnumerator());
                    if (itemEnumerator.moveNext()) {
                        current.push(itemEnumerator.getCurrent());
                    } else {
                        current.push(undefined);
                    }
                } else {
                    throw new TypeError(`Collection at argument ${i} should implement Types/collection#IEnumerable`);
                }
            }
            this.current = current;
        }

        return hasNext;
    }

    reset(): void {
        this.enumerator = null;
        this.index = -1;
        this.current = undefined;
        this.itemsEnumerators = [];
    }
}

Object.assign(ZippedEnumerator.prototype, {
    previous: null,
    items: null,
    itemsEnumerators: null,
    enumerator: null,
    index: null,
    current: undefined
});
