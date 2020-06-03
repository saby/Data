import {ISignature, ILinkSignature} from './jsonReplacer';
import {resolve} from '../di';
import {ISerializableSignature, ISerializableConstructor} from '../entity';

interface ISerializedLink {
    name: string;
    linkResolved?: boolean;
    scope: object;
    value: ILinkSignature;
}

interface IConfig {
    resolveDates?: boolean;
}

type TReviver<T> = (name: string, value: ISignature | unknown) => T;

const DATE_MATCH = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:[0-9\.]+Z$/;

let unresolvedLinks: ISerializedLink[] = [];
let unresolvedInstances = [];
let unresolvedInstancesId = [];
let instanceStorage = {};

function resolveLinks(): void {
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

function resolveInstances(): void {
    for (let i = 0; i < unresolvedInstances.length; i++) {
        const item = unresolvedInstances[i];
        let instance = null;
        if (instanceStorage[item.value.id]) {
            instance = instanceStorage[item.value.id];
        } else if (item.value.module) {
            const name = item.value.module;
            const Module = resolve<ISerializableConstructor>(name);
            if (!Module) {
                throw new Error(`The module "${name}" is not loaded yet.`);
            }
            if (!Module.prototype) {
                throw new Error(`The module "${name}" is not a constructor.`);
            }
            if (typeof Module.fromJSON !== 'function') {
                throw new Error(`The prototype of module "${name}" doesn't have fromJSON() method.`);
            }
            instance = Module.fromJSON(item.value);

            instanceStorage[item.value.id] = instance;
        }

        item.scope[item.name] = item.value = instance;
    }
}

const defaultConfig = {
    resolveDates: true
};

export function withConfig<S>(config?: IConfig): TReviver<S> {
    const actualConfig: IConfig = {...defaultConfig, ...config};

    return function configuredJsonReviver<T>(name: string, value: ISignature | unknown): T {
        let result: T = value as unknown as T;

        if (value instanceof Object &&
            value.hasOwnProperty('$serialized$')
        ) {
            switch ((value as ISerializableSignature).$serialized$) {
                case 'inst':
                    unresolvedInstances.push({
                        scope: this,
                        name,
                        value
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

        if (actualConfig.resolveDates && typeof result === 'string' && DATE_MATCH.test(result)) {
            result = new Date(result) as unknown as T;
        }

        // Resolve links and instances at root
        if (name === '' && Object.keys(this).length === 1) {
            try {
                resolveLinks();
                resolveInstances();
            } finally {
                unresolvedLinks = [];
                unresolvedInstances = [];
                unresolvedInstancesId = [];
                instanceStorage = {};
            }

            // In this case result hasn't been assigned and should be resolved from this
            if (result === value as unknown as T) {
                result = this[name];
            }
        }

        return result;
    }
}

const defaultReviver = withConfig();

export default function jsonReviver<T>(name: string, value: ISignature | unknown): T {
    return defaultReviver.call(this, name, value) as T;
}
