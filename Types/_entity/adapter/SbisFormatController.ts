import {IFieldFormat, IRecordFormat, ITableFormat} from './SbisFormatMixin';
import {Map} from '../../shim';

interface IResultGenerator {
    value: undefined | IFieldFormat[];
    done: boolean;
}

interface IIteratorResult {
    value: undefined | unknown;
    done: boolean;
}

export type FormatCarrier = IRecordFormat | ITableFormat;

/**
 * Finds formats deep within given data and calls given function for each one.
 * @param data Data to search
 * @param callback Callback to call
 */
export function eachFormatEntry(data: unknown, callback: (entry: FormatCarrier) => boolean | void): boolean | void {
    if (Array.isArray(data)) {
        for (const item of data) {
            if (eachFormatEntry(item, callback) === false) {
                return false;
            }
        }
    } else if (data && typeof data === 'object') {
        const record = data as FormatCarrier;
        if (record.s !== undefined || record.f !== undefined) {
            if (callback(record) === false) {
                return false;;
            }
        }
        if (record.d) {
            if (eachFormatEntry(record.d, callback) === false) {
                return false;
            }
        }
    }
}

class IteratorArray {
    currentIndex: number = -1;
    protected _data: unknown[];

    constructor(data) {
        this._data = data;
    }

    next(): IIteratorResult {
        this.currentIndex += 1;

        if (this.isDone()) {
            return {
                value: undefined,
                done: true
            };
        } else {
            return {
                value: this._data[this.currentIndex],
                done: false
            };
        }
    }

    protected isDone(): boolean {
        return this.currentIndex === this._data.length;
    }
}

/**
 * Recursive call stack holder which remember nodes list.
 */
class RecursiveStack {
    /**
     * Nodes list
     */
    protected _stack: Map<number, IFieldFormat[]>;

    /**
     * Last node in stack.
     */
    protected _current: any;

    /**
     * Current node id.
     */
    processableId: number;

    constructor() {
        this._stack = new Map();
        this.processableId = -1;
    }

    /**
     * Returns last node from stack
     */
    get currentNode(): any {
        return this._current || undefined;
    }

    /**
     * Adds node to stack.
     * @param node Node to add.
     */
    push(node: any): void {
        this._current = node;
        this.processableId++;
        this._stack.set(this.processableId, this._current);
    }

    /**
     * Removes last node from stack.
     */
    pop(): void {
        this.processableId--;
        this._current = this._stack.get(this.processableId);
        this._stack.delete(this.processableId + 1);
    }
}

/**
 * Recursive formats iterator.
 */
export class RecursiveIterator {
    /**
     * Recursice stack instance to iterate.
     */
    protected _stackNodes: RecursiveStack;

    constructor(data: FormatCarrier) {
        this._stackNodes = new RecursiveStack();

        // Add root immediately.
        this._stackNodes.push({data});
   } 

    /**
     * Proceeds iterations till given format.
     * @param storage Formats cache.
     * @param id Format id.
     */
    next(storage: Map<number, IFieldFormat[]>, id?: number): IResultGenerator {
        while (true) {
            if (this._stackNodes.processableId < 0) {
                // id обрабтываемого узла меньше 0, значит дерево обработано.
                return {value: undefined, done: true};
            }

            const result = this._process(storage, id);

            if (result) {
                return {value: result, done: false};
            }
        }
    }

    /**
     * Single node handler.
     * @param storage Formats cache.
     * @param id Format id.
     */
    protected _process(storage: Map<number, IFieldFormat[]>, id?: number): IFieldFormat[] {
        // Получаем из стека послдений узел, чтобы обработь его.
        const node = this._stackNodes.currentNode;

        if (node.data instanceof Array) {
            if (!node.iterator) {
                node.iterator = this._getIterator(node.data);
            }

            while (true) {
                const item = node.iterator.next();

                if (item.done) {
                    break;
                }

                // Оптимизация, в массивах нас интересуют только объекты.
                if (item.value instanceof Object) {
                    this._stackNodes.push({
                        data: item.value
                    });

                    const result = this._process(storage, id);

                    if (result) {
                        return result;
                    }
                }
            }

            this._stackNodes.pop();

            return undefined;
        } else if (node.data instanceof Object && !node.completed) {
            if (node.data.f !== undefined && node.data.s && !storage.has(node.data.f)) {
                storage.set(node.data.f, node.data.s);

                if (node.data.f === id) {
                    return node.data.s;
                }
            }

            let result;

            // Если в record есть данные их надо обработать.
            if (node.data.d) {
                this._stackNodes.push( {
                    data: node.data.d
                });

                node.completed = true;
                result = this._process(storage, id);
            }

            if (result) {
                return result;
            }

            this._stackNodes.pop();
            node.completed = true;

            return undefined;
        }

        this._stackNodes.pop();
        return undefined;
    }

    protected _getIterator(data) {
        return RecursiveIterator.doesEnvSupportIterator() ? data[Symbol.iterator]() : new IteratorArray(data);
    }

    static doesEnvSupportIterator(): boolean {
        return typeof Symbol !== 'undefined' && Symbol.iterator !== undefined;
    }
}

/**
 * Do search in raw data for formats. Uses internal cache for optimization.
 */
export default class SbisFormatController {
    /**
     * Formats cache.
     */
    protected _cache: Map<number, IFieldFormat[]>;

    /**
     * Raw data to search within.
     */
    protected _data: FormatCarrier;

    /**
     * Generator to maintain searching process.
     */
    protected _generator: RecursiveIterator;

    get data(): FormatCarrier {
        return this._data;
    }

    /**
     *
     * @param data Raw data to search within.
     */
    constructor(data?: FormatCarrier) {
       this._cache = new Map();
       this._data = data;
    }

   /**
    * Sets original format for given id.
    * @param id Format id
    * @param copy Format definition
    */
    setOriginal(id: number, data: IFieldFormat[]): void {
        this._cache.set(id, this._clone(data));
    }

   /**
    * Returns format by given id.
    * @param id Format id.
    * @param copy Return copy to keep original unchanged.
    */
    getFormat(id?: number, copy?: boolean): IFieldFormat[] {
        if (this._cache.has(id)) {
            return copy ? this._clone(this._cache.get(id)) : this._cache.get(id);
        }

        const result = this.generator.next(this._cache, id);

        if (result.done) {
            throw new ReferenceError("Couldn't find format by id");
        }

        return copy ? this._clone(result.value) : result.value;
    }

    scanFormats(data: any): void {
        if (typeof data === 'object') {
            const generator = new RecursiveIterator(data);

            generator.next(this._cache);
        }
    }

    protected _clone(format: IFieldFormat[]): IFieldFormat[] {
        return format.slice();
    }

    protected get generator(): RecursiveIterator {
        if (this._generator) {
            return this._generator;
        }

        return new RecursiveIterator(this._data);
    }
}
