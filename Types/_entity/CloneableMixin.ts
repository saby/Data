// @ts-ignore
import Serializer = require('Core/Serializer');
import {protect} from '../util';

const $clone = protect('clone');

/**
 * Миксин, позволяющий клонировать объекты.
 * @remark
 * Для корректной работы требуется подмешать {@link Types/_entity/SerializableMixin}.
 * @mixin Types/_entity/CloneableMixin
 * @public
 * @author Мальцев А.А.
 */
export default class CloneableMixin {
    // region Types/_entity/ICloneable

    '[Types/_entity/ICloneable]': boolean;

    clone<T = this>(shallow?: boolean): T {
        let clone;

        if (shallow) {
            const proto = Object.getPrototypeOf(this);
            const Module = proto.constructor;
            const data = (this as any).toJSON();

            data.state = this._unlinkCollection(data.state);
            if (data.state.$options) {
                data.state.$options = this._unlinkCollection(data.state.$options);
            }

            clone = Module.fromJSON(data);
        } else {
            const serializer = new Serializer();
            clone = JSON.parse(
                JSON.stringify(this, serializer.serialize),
                serializer.deserialize
            );
        }
        clone[$clone] = true;

        // TODO: this should be do instances mixes InstantiableMixin
        delete clone._instanceId;

        return clone;
    }

    // endregion

    // region Protected methods

    protected _unlinkCollection(collection: any): void {
        let result;

        if (collection instanceof Array) {
            result = [];
            for (let i = 0; i < collection.length; i++) {
                result[i] = this._unlinkObject(collection[i]);
            }
            return result;
        }
        if (collection instanceof Object) {
            result = {};
            for (const key in collection) {
                if (collection.hasOwnProperty(key)) {
                    result[key] = this._unlinkObject(collection[key]);
                }
            }
            return result;
        }

        return collection;
    }

    protected _unlinkObject(object: any): any {
        if (object instanceof Array) {
            return object.slice();
        }
        return object;
    }

    // endregion
}

Object.assign(CloneableMixin.prototype, {
    '[Types/_entity/CloneableMixin]': true,
    '[Types/_entity/ICloneable]': true
});
