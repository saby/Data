/// <amd-module name="Types/_entity/CloneableMixin" />
/**
 * Миксин, позволяющий клонировать объекты.
 * Для корректной работы требуется подмешать {@link Types/Entity/SerializableMixin}.
 * @mixin Types/Entity/CloneableMixin
 * @public
 * @author Мальцев А.А.
 */

// @ts-ignore
import Serializer = require('Core/Serializer');

const CloneableMixin = /** @lends Types/Entity/CloneableMixin.prototype */{
   '[Types/_entity/CloneableMixin]': true,

   //region Types/Entity/ICloneable

   '[Types/_entity/ICloneable]': true,

   clone(shallow) {
      let clone;

      if (shallow) {
         const proto = Object.getPrototypeOf(this);
         const Module = proto.constructor;
         let data = this.toJSON();

         data.state = this._unlinkCollection(data.state);
         if (data.state.$options) {
            data.state.$options = this._unlinkCollection(data.state.$options);
         }

         clone = Module.prototype.fromJSON.call(Module, data);
      } else {
         let serializer = new Serializer();
         clone = JSON.parse(
            JSON.stringify(this, serializer.serialize),
            serializer.deserialize
         );
      }

      //TODO: this should be do instances mixes InstantiableMixin
      delete clone._instanceId;

      return clone;
   },

   //endregion Types/Entity/ICloneable

   //region Protected methods

   _unlinkCollection(collection) {
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
         for (let key in collection) {
            if (collection.hasOwnProperty(key)) {
               result[key] = this._unlinkObject(collection[key]);
            }
         }
         return result;
      }

      return collection;
   },

   _unlinkObject(object) {
      if (object instanceof Array) {
         return object.slice();
      }
      return object;
   }

   //endregion Protected methods
};

export default CloneableMixin;
