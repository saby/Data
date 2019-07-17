import VersionableMixin from './VersionableMixin';
import {Map} from '../shim';

export default class ReactiveObject<T> extends VersionableMixin {
    protected constructor(data: T) {
        super();
        this._proxyProperties(data);
    }

    // region Protected

    /**
     * Proxies properties definition from given object to the current instance
     * @param donor Object to get properties declaration from
     */
    private _proxyProperties(donor: T): void {
        let storage: Map<string, T[keyof T]>;

        Object.keys(donor).forEach((key: string) => {
            let descriptor = Object.getOwnPropertyDescriptor(donor, key);

            if (descriptor.set) {
                // Wrap write operation in access descriptor
                descriptor.set = ((original) => (value) => {
                    original.call(this, value);
                    this._nextVersion();
                })(descriptor.set);
            } else if (!descriptor.get) {
                if (!storage) {
                    storage = new Map<string, T[keyof T]>();
                }

                // Translate data descriptor to the access descriptor
                storage.set(key, descriptor.value);
                descriptor = {
                    get: () => storage.get(key),
                    set: descriptor.writable ? (value) => {
                        storage.set(key, value);
                        this._nextVersion();
                    } : undefined,
                    configurable: descriptor.configurable,
                    enumerable: descriptor.enumerable
                };
            }

            Object.defineProperty(this, key, descriptor);
        });

    }

    // endregion

    // region Statics

    // Static construction method only allows TypeScript interpreter to see T within ReactiveObject instance
    static create<T>(data: T): ReactiveObject<T> & T {
        return new ReactiveObject<T>(data) as ReactiveObject<T> & T;
    }

    // endregion
}
