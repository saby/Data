/// <amd-module name="Types/_entity/VersionableMixin" />
/**
 * Миксин, позволяющий получать и измениять номер версии объекта.
 * @mixin Types/Entity/VersionableMixin
 * @public
 * @author Мальцев А.А.
 */

const VersionableMixin = /** @lends Types/Entity/VersionableMixin.prototype */{
   '[Types/_entity/VersionableMixin]': true,

   //region IVersionable

   _version: 0,

   getVersion() {
      return this._version;
   },

   _nextVersion() {
      this._version++;
      if (this['[Types/_entity/ManyToManyMixin]']) {
         this._getMediator().belongsTo(this, (parent) => {
            if (parent && parent['[Types/_entity/IVersionable]']) {
               parent._nextVersion();
            }
         });
      }
   }

   //endregion IVersionable
};

export default VersionableMixin;
