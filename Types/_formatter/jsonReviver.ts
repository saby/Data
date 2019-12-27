import {resolve} from '../di';

const DataRegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:[0-9\.]+Z$/;
let unresolvedInstances = [];
let unresolvedInstancesId = [];
let instanceStorage = {};

function resolveInstances(): void {
    let Module;
    let name;

    for (let i = 0; i < unresolvedInstances.length; i++) {
        const item = unresolvedInstances[i];
        let instance = null;
        if (instanceStorage[item.value.id]) {
            instance = instanceStorage[item.value.id];
        } else if (item.value.module) {
            name = item.value.module;
            Module = resolve(name);
            if (!Module) {
                throw new Error(`The module "${name}" is not loaded yet.`);
            }
            if (!Module.prototype) {
                throw new Error(`The module "${name}" is not a constructor.`);
            }
            if (typeof Module.fromJSON !== 'function') {
                throw new Error(`The prototype of module "${name}" don\'t have fromJSON() method.`);
            }
            instance = Module.fromJSON(item.value);

            instanceStorage[item.value.id] = instance;
        }

        item.scope[item.name] = item.value = instance;
    }
}

export default function jsonReviver(name: string | number, value: any): any {
    let result = value;

    if ((value instanceof Object) &&
        value.hasOwnProperty('$serialized$')
    ) {
        switch (value.$serialized$) {
            case 'inst':
                unresolvedInstances.push({
                    scope: this,
                    name,
                    value
                });
                unresolvedInstancesId.push(value.id);
                break;
            case '+inf':
                result = Infinity;
                break;
            case '-inf':
                result = -Infinity;
                break;
            case 'undef':
                result = undefined;
                break;
            case 'NaN':
                result = NaN;
                break;
            default:
                throw new Error(`Unknown serialized type "${value.$serialized$}" detected`);
        }
    }

    if (typeof result === 'string') {
        if (DataRegExp.test(result)) {
            const dateValue = new Date(result);
            return dateValue;
        }
    }

    // Resolve links and instances at root
    if (name === '' && Object.keys(this).length === 1) {
        resolveInstances();
        unresolvedInstances = [];
        unresolvedInstancesId = [];
        instanceStorage = {};

        // In this case result hasn't been assigned and should be resolved from this
        if (result === value) {
            result = this[name];
        }
    }

    return result;
}
