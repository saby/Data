/**
 * Миксин, позволяющий клонировать объекты.
 * Для корректной работы требуется подмешать {@link Types/_entity/SerializableMixin}.
 * @mixin Types/_entity/CloneableMixin
 * @public
 * @author Мальцев А.А.
 */

// @ts-ignore
import Serializer = require('Core/Serializer');

const CloneableMixin = /** @lends Types/_entity/CloneableMixin.prototype */{
   '[Types/_entity/CloneableMixin]': true,

   // region Types/_entity/ICloneable

   '[Types/_entity/ICloneable]': true,

   clone(shallow?: boolean): Object {
      let clone;

      if (shallow) {
         const proto = Object.getPrototypeOf(this);
         const Module = proto.constructor;
         const data = this.toJSON();

         data.state = this._unlinkCollection(data.state);
         if (data.state.$options) {
            data.state.$options = this._unlinkCollection(data.state.$options);
         }

         clone = Module.prototype.fromJSON.call(Module, data);
      } else {
         const serializer = new Serializer();
         clone = JSON.parse(
            JSON.stringify(this, serializer.serialize),
            serializer.deserialize
         );
      }

      // TODO: this should be do instances mixes InstantiableMixin
      delete clone._instanceId;

      return clone;
   },

   // endregion Types/_entity/ICloneable

   // region Protected methods

   _unlinkCollection(collection: any): void {
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
   },

   _unlinkObject(object: any): any {
      if (object instanceof Array) {
         return object.slice();
      }
      return object;
   }

   // endregion Protected methods
};

export default CloneableMixin;
