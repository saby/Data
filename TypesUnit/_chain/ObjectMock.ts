import Abstract from 'Types/_chain/Abstract';

export interface IItems<T> {
    [name: string]: T;
}

/**
 * A mock for abstract chain wrapping an object.
 */
class ObjectMock<T> {
    ['[Types/_chain/Abstract]']: boolean = true;
    start: Abstract<T>;
    shouldSaveIndices: boolean = true;
    reduce: Function;
    protected _source: IItems<T>;

    constructor(items: IItems<T>) {
        this._source = items;
        this.reduce = Array.prototype.reduce.bind(Object.keys(items).map((key) => items[key]));
    }

    getEnumerator(): any {
        const items = this._source;
        const keys = Object.keys(items);

        const en: any = {};
        en.index = -1;
        en.getCurrent = function(): T {
            return items[keys[this.index]];
        };
        en.getCurrentIndex = function(): string {
            return keys[this.index];
        };
        en.moveNext = function(): boolean {
            if (this.index >= keys.length - 1) {
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
    new <T>(items: IItems<T>): Abstract<T>;
}

export default ObjectMock as any as IAbstractConstructor;
