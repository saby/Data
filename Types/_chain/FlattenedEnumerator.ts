import FlattenedMover from './FlattenedMover';
import {IEnumerator} from '../collection';
import Abstract from './Abstract';

/**
 * Разворачивающий энумератор
 */
export default class FlattenedEnumerator<T> implements IEnumerator<T> {
    readonly '[Types/_collection/IEnumerator]': boolean = true;
    private previous: Abstract<T>;
    private mover: FlattenedMover;
    private index: number;

    /**
     * Конструктор разворачивающего энумератора.
     * @param previous Предыдущее звено.
     */
    constructor(previous: Abstract<T>) {
        this.previous = previous;
        this.reset();
    }

    getCurrent(): any {
        return this.mover ? this.mover.getCurrent() : undefined;
    }

    getCurrentIndex(): any {
        return this.index;
    }

    moveNext(): boolean {
        this.mover = this.mover || (this.mover = new FlattenedMover(this.previous.getEnumerator()));
        const hasNext = this.mover.moveNext();
        if (hasNext) {
            this.index++;
        }
        return hasNext;
    }

    reset(): void {
        this.mover = null;
        this.index = -1;
    }
}

Object.assign(FlattenedEnumerator.prototype, {
    previous: null,
    mover: null,
    index: null,
});
