import {enumerator, IEnumerable, IEnumerator} from '../collection';

/**
 * Передвигаемый рекурсивный указатель.
 * @author Кудрявцев И.С.
 */
export default class FlattenedMover {
    private readonly parent: IEnumerator<any>;
    private current: FlattenedMover | IEnumerable<any> | any[];

    constructor(parent: IEnumerator<any> | any[]) {
        if (parent instanceof Array) {
            this.parent = new enumerator.Arraywise(parent);
        } else {
            this.parent = parent;
        }
    }

    getCurrent(): any {
        if (!this.hasOwnProperty('current')) {
            return undefined;
        }

        if (this.current instanceof FlattenedMover) {
            return this.current.getCurrent();
        }
        return this.current;
    }

    moveNext(): boolean {
        if (!this.parent) {
            return false;
        }

        if (this.hasOwnProperty('current')) {
            if (this.current instanceof FlattenedMover) {
                const hasNext = this.current.moveNext();
                if (hasNext) {
                    return hasNext;
                }
            }
            delete this.current;
        }

        if (!this.hasOwnProperty('current')) {
            if (this.parent.moveNext()) {
                this.current = this.parent.getCurrent();
            } else {
                return false;
            }
        }

        if (this.current instanceof Array) {
            this.current = new FlattenedMover(this.current);
            return this.moveNext();
        }
        if (this.current && this.current['[Types/_collection/IEnumerable]']) {
            this.current = new FlattenedMover((this.current as IEnumerable<any>).getEnumerator());
            return this.moveNext();
        }

        return true;
    }
}
