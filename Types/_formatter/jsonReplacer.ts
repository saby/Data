import {ISerializableSignature} from '../entity';

export type LinkSignatureMark = 'link';
export type FunctionSignatureMark = 'function';
export type NativeSignatureMark = '+inf' | '-inf' | 'undef' | 'NaN';

export interface ILinkSignature {
    '$serialized$': LinkSignatureMark;
    id: number;
}

export interface IFunctionSignature {
    '$serialized$': FunctionSignatureMark;
    id: number;
}

export interface ISpecialSignature {
    '$serialized$': NativeSignatureMark;
    id: number;
}

export type ISignature = ISerializableSignature | ILinkSignature | ISpecialSignature;
type JsonReplacerFunction<T> = (name: string, value: T) => ISignature | T;

const OBJECT_TAG = '[object Object]';

function isPlainObject(obj: unknown): boolean {
    return obj &&
        Object.prototype.toString.call(obj) === OBJECT_TAG &&
        Object.getPrototypeOf(obj) === Object.prototype;
}

/**
 * Serializes links to the same object instances which allows do not to repeat their signatures
 * @param value Serializable value
 * @param storage Instances link storage to fill in
 */
function serializeLink(
    value: ISerializableSignature,
    storage: Map<number, ILinkSignature>
): ISerializableSignature | ILinkSignature {
    if (
        value &&
        typeof value === 'object' &&
        value.$serialized$ === 'inst' &&
        value.hasOwnProperty('id')
    ) {
        const id = value.id;
        if (storage.has(id)) {
            return {
                $serialized$: 'link',
                id
            };
        } else {
            storage.set(id, value as ILinkSignature);
        }
    }

    return value;
}

/**
 * Creates a storage based replacer function for {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify JSON.stringify}.
 * @param functionsStorage Storage for functions
 */
export function getReplacerWithStorage<T = unknown>(
    functionsStorage?: Map<number, Function>
): JsonReplacerFunction<T> {
    const linksStorage: Map<number, ILinkSignature> = new Map();

    return function jsonReplacerWithStorage(name: string, value: T): ISignature | T {
        // Clear storage when root passed
        if (name === '' && (!this || Object.keys(this).length === 1)) {
            linksStorage.clear();
        }

        let result;

        // Skip complicated objects which not serializable
        const isObject = value && typeof value === 'object';
        if (isObject && !Array.isArray(value) && !isPlainObject(value)) {
            return;
        }

        if (functionsStorage && typeof value === 'function') {
            const id = functionsStorage.size;
            result = {
                $serialized$: 'function',
                id
            };
            functionsStorage.set(id, value);
            return result;
        }

        if (value as unknown === Infinity) {
            result = {
                $serialized$: '+inf'
            };
        } else if (value as unknown === -Infinity) {
            result = {
               $serialized$: '-inf'
            };
        } else if (value === undefined) {
            result = {
                $serialized$: 'undef'
            };
        } else if (Number.isNaN(value as unknown as number)) {
            result = {
                $serialized$: 'NaN'
            };
        } else {
            result = serializeLink(value as unknown as ISerializableSignature, linksStorage);
        }

        return result;
    };
}

/**
 * Default replacer for {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify JSON.stringify}.
 * @param name Property name
 * @param value Property value
 */
export default getReplacerWithStorage();
