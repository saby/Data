/// <amd-module name="Types/_entity/VersionableMixin" />
/**
 * Миксин, позволяющий получать и измениять номер версии объекта.
 * @mixin Types/_entity/VersionableMixin
 * @public
 * @author Мальцев А.А.
 */

const VersionableMixin = /** @lends Types/_entity/VersionableMixin.prototype */{
   '[Types/_entity/VersionableMixin]': true,

   // region IVersionable

   _version: 0,

   getVersion(): number {
      return this._version;
   },

   _nextVersion(): void {
      this._version++;
      if (this['[Types/_entity/ManyToManyMixin]']) {
         this._getMediator().belongsTo(this, (parent) => {
            if (parent && parent['[Types/_entity/IVersionable]']) {
               parent._nextVersion();
            }
         });
      }
   }

   // endregion
};

export default VersionableMixin;
