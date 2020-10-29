import {
    ISignature,
    ILinkSignature
} from './jsonReplacer';
import {
    ISerializableSignature,
    ISerializableConstructor
} from '../entity';
import {
    isInstantiable,
    resolve
} from '../di';

interface ISerializedLink {
    linkResolved?: boolean;
    name: string;
    scope: object;
    value: ILinkSignature | ISerializableSignature;
}

interface IUnresolvedInstance {
    scope: object;
    name: string;
    instanceResolved?: boolean;
    value: ILinkSignature | ISerializableSignature;
}

interface IConfig {
    resolveDates?: boolean;
}

interface IParsed {
    name: string;
    path: string[];
}

interface IEsModule<T> {
    __esModule: boolean;
    default?: T;
}

type JsonReviverFunction<T> = (name: string, value: ISignature | unknown) => T;

const DATE_MATCH = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:[0-9\.]+Z$/;

const defaultConfig: IConfig = {
    resolveDates: true
};

/**
 * Parses module declaration include library name name and path.
 * TODO: switch to wasaby-loader wnen it will be ready
 * @param name Module name like 'Library/Name:Path.To.Module' or just 'Module/Name'
 * @public
 */
export function parse(name: string): IParsed {
    const parts = String(name || '').split(':', 2);
    return {
        name: parts[0],
        path: parts[1] ? parts[1].split('.') : []
    };
}

/**
 * Resolves module by its name
 * TODO: switch to wasaby-loader wnen it will be ready
 * @param name Module name
 * @param loader Modules loader
 */
function resolveConstructor(name: string, loader: Require = requirejs): ISerializableConstructor {
    let module: ISerializableConstructor;

    // Try to use DI because it's way too much faster
    if (isInstantiable(name) === false) {
        module = resolve<ISerializableConstructor>(name);
    }

    // Use RequireJS if module doesn't registered in DI
    if (!module) {
        const parts = parse(name);

        module = loader(parts.name);
        if (!module) {
            throw new ReferenceError(`The module "${parts.name}" is not loaded yet. Please make sure it\'s included into application dependencies.`);
        }

        // Extract default module in case of ES6 module
        if (
            (module as unknown as IEsModule<ISerializableConstructor>).__esModule &&
            (module as unknown as IEsModule<ISerializableConstructor>).default
        ) {
            module = (module as unknown as IEsModule<ISerializableConstructor>).default;
        }

        parts.path.forEach((element, index) => {
            if (!(element in module)) {
                throw new Error(`The module "${parts.name}" doesn\'t export element "${parts.path.slice(0, index).join('.')}".`);
            }
            module = module[element];
        });
    }

    return module;
}

/**
 * Resolves links with corresponding instances signatures
 * @param unresolvedLinks Unresolved links
 * @param unresolvedInstances Unresolved instances
 * @param unresolvedInstancesId Unresolved instances IDs
 */
function resolveLinks(
    unresolvedLinks: ISerializedLink[],
    unresolvedInstances: IUnresolvedInstance[],
    unresolvedInstancesId: number[]
): void {
    for (let i = 0; i < unresolvedLinks.length; i++) {
        const link = unresolvedLinks[i];
        if (link.linkResolved) {
            continue;
        }

        const index = unresolvedInstancesId.indexOf(link.value.id);
        if (index === -1) {
            throw new Error('Can\'t resolve link for property "' + link.name + '" with instance id "' + link.value.id + '".');
        }
        const instance = unresolvedInstances[index];
        link.scope[link.name] = link.value = instance.value;
        link.linkResolved = true;

        // It not necessary to resolve instance if it's already resolved
        if (!instance.instanceResolved) {
            unresolvedInstances.splice(1 + index, 0, link);
            unresolvedInstancesId.splice(1 + index, 0, link.value.id);
        }
    }
}

/**
 * Resolves instances
 * @param unresolvedInstances Unresolved instances
 * @param instancesStorage Instances storage
 */
function resolveInstances(
    unresolvedInstances: IUnresolvedInstance[],
    instancesStorage: Map<number, unknown>
): void {
    for (let i = 0; i < unresolvedInstances.length; i++) {
        const item = unresolvedInstances[i];
        let instance = null;
        if (instancesStorage.has(item.value.id)) {
            instance = instancesStorage.get(item.value.id);
        } else if ((item.value as ISerializableSignature).module) {
            const name = (item.value as ISerializableSignature).module;
            const Module = resolveConstructor(name);
            if (!Module) {
                throw new Error(`The module "${name}" is not loaded yet.`);
            }
            if (!Module.prototype) {
                throw new Error(`The module "${name}" is not a constructor.`);
            }
            if (typeof Module.fromJSON !== 'function') {
                throw new Error(`The prototype of module "${name}" doesn't have fromJSON() method.`);
            }
            instance = Module.fromJSON(item.value as ISerializableSignature);

            instancesStorage.set(item.value.id, instance);
        }

        item.scope[item.name] = item.value = instance;
    }
}

/**
 * Creates a storage based reviver function for {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse JSON.parse}.
 * @param config Reviver config
 * @param functionsStorage Storage for functions
 */
export function getReviverWithStorage<T = unknown>(
    config: IConfig = defaultConfig,
    functionsStorage?: Map<number, Function>
): JsonReviverFunction<T> {
    let unresolvedLinks: ISerializedLink[] = [];
    let unresolvedInstances: IUnresolvedInstance[] = [];
    let unresolvedInstancesId: number[] = [];
    let instancesStorage: Map<number, unknown> = new Map();

    return function jsonReviverWithStorage(name: string, value: ISignature | unknown): T {
        let result: T = value as unknown as T;

        if (value instanceof Object &&
            value.hasOwnProperty('$serialized$')
        ) {
            switch ((value as ISerializableSignature).$serialized$) {
                case 'inst':
                    unresolvedInstances.push({
                        scope: this,
                        name,
                        value: value as ISerializableSignature
                    });
                    unresolvedInstancesId.push((value as ISerializableSignature).id);
                    break;

                case 'link':
                    unresolvedLinks.push({
                        scope: this,
                        name,
                        value: value as ILinkSignature
                    });
                    break;

                case 'function':
                    if (!functionsStorage) {
                        throw new ReferenceError('Functions storage is required to restore function');
                    }
                    const functionId = (value as ISerializableSignature).id;
                    if (!functionsStorage.has(functionId)) {
                        throw new ReferenceError(`Functions storage doesn't contain function with id "${functionId}"`);
                    }
                    result = functionsStorage.get(functionId) as unknown as T;
                    break;

                case '+inf':
                    result = Infinity as unknown as T;
                    break;

                case '-inf':
                    result = -Infinity as unknown as T;
                    break;

                case 'undef':
                    result = undefined;
                    break;

                case 'NaN':
                    result = NaN as unknown as T;
                    break;

                default:
                    throw new Error(`Unknown serialized type "${(value as ISerializableSignature).$serialized$}" detected`);
            }
        }

        if (config.resolveDates && typeof result === 'string' && DATE_MATCH.test(result)) {
            result = new Date(result) as unknown as T;
        }

        // Resolve links and instances at root
        if (name === '' && (!this || Object.keys(this).length === 1)) {
            try {
                resolveLinks(unresolvedLinks, unresolvedInstances, unresolvedInstancesId);
                resolveInstances(unresolvedInstances, instancesStorage);
            } finally {
                unresolvedLinks = [];
                unresolvedInstances = [];
                unresolvedInstancesId = [];
                instancesStorage = new Map();
            }

            // In this case result hasn't been assigned and should be resolved from this
            if (this && result === value as unknown as T) {
                result = this[name];
            }
        }

        return result;
    };
}

/**
 * Default replacer for {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse JSON.parse}.
 * @param name Property name
 * @param value Property value
 */
export default getReviverWithStorage();
