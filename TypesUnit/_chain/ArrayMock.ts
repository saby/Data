import Abstract from 'Types/_chain/Abstract';

/**
 * A mock for abstract chain wrapping an array.
 */
class ArrayMock<T> {
    ['[Types/_chain/Abstract]']: boolean = true;
    start: Abstract<T>;
    reduce: Function;
    protected _source: T[];

    constructor(items: T[]) {
        this._source = items;
        this.reduce = Array.prototype.reduce.bind(items);
    }

    getEnumerator(): any {
        const items = this._source;

        const en: any = {};
        en.index = -1;
        en.getCurrent = function(): T {
            return items[this.index];
        };
        en.getCurrentIndex = function(): number {
            return this.index;
        };
        en.moveNext = function(): boolean {
            if (this.index >= items.length - 1) {
                return false;
            }
            this.index++;
            return true;
        };
        return en;
    }
}

interface IAbstractConstructor {
    readonly prototype: Abstract<any>;
    new <T>(items: T[]): Abstract<T>;
}

export default ArrayMock as any as IAbstractConstructor;
