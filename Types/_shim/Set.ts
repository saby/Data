/**
 * Limited emulation of standard built-in object "Set" if it's not supported.
 * Follow {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Set} for details.
 * @author Мальцев А.А.
 */
export class SetPolyfill <T> {
    protected _hash: object;
    protected _objects: T[];
    _objectPrefix: string;

    size: number;

    constructor() {
        this.clear();
    }

    static _getHashedKey<T>(key: T): string {
        return (typeof key) + '@' + key;
    }

    add(value: T): this {
        const key = this._isObject(value) ? this._addObject(value) : value;

        this._hash[SetPolyfill._getHashedKey(key)] = value;

        return this;
    }

    clear(): void {
        this._hash = {};
        this._objects = [];
    }

    delete(value: T): boolean {
        let key;
        if (this._isObject(value)) {
            key = this._deleteObject(value);
            if (!key) {
                return false;
            }
        } else {
            key = value;

        }

        const hashedKey = SetPolyfill._getHashedKey(key);
        const result = hashedKey in this._hash;
        delete this._hash[hashedKey];

        return result;
    }

    entries(): any[] {
        throw new Error('Method is not supported');
    }

    forEach(callbackFn: Function, thisArg?: object): void {
        // FIXME: now not in insertion order
        const hash = this._hash;
        for (const key in hash) {
            if (hash.hasOwnProperty(key)) {
                callbackFn.call(thisArg, hash[key], hash[key], this);
            }
        }
    }

    has(value: T): boolean {
        let key;
        if (this._isObject(value)) {
            key = this._getObjectKey(value);
            if (!key) {
                return false;
            }
        } else {
            key = value;
        }
        key = SetPolyfill._getHashedKey(key);

        return this._hash.hasOwnProperty(key);
    }

    keys(): any[] {
        throw new Error('Method is not supported');
    }

    values(): any[] {
        throw new Error('Method is not supported');
    }

    _isObject(value: any): boolean {
        return value && typeof value === 'object';
    }

    _addObject(value: T): string {
        let index = this._objects.indexOf(value);
        if (index === -1) {
            index = this._objects.length;
            this._objects.push(value);
        }
        return this._objectPrefix + index;
    }

    _deleteObject(value: T): string|undefined {
        const index = this._objects.indexOf(value);
        if (index > -1) {
            this._objects[index] = null;
            return this._objectPrefix + index;
        }
        return undefined;
    }

    _getObjectKey(value: T): string|undefined {
        const index = this._objects.indexOf(value);
        if (index === -1) {
            return undefined;
        }
        return this._objectPrefix + index;
    }
}

Object.assign(SetPolyfill.prototype, {
    _hash: null,
    _objectPrefix: '{[object]}:',
    _objects: null
});

Object.defineProperty(SetPolyfill.prototype, 'size', {
    get(): number {
        return Object.keys(this._hash).length;
    },
    enumerable: true,
    configurable: false
});

// Use native implementation if supported
// @ts-ignore
const SetImplementation: SetConstructor = typeof Set === 'undefined' ? SetPolyfill : Set;
export default SetImplementation;
