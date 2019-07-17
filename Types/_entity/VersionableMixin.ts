import IVersionable from './IVersionable';
import ManyToMany from './relation/ManyToMany';

/**
 * Миксин, позволяющий получать и измениять номер версии объекта.
 * @mixin Types/_entity/VersionableMixin
 * @public
 * @author Мальцев А.А.
 */
export default abstract class VersionableMixin implements IVersionable {
   readonly '[Types/_entity/VersionableMixin]': boolean;
   protected _version: number;

   // region IVersionable

   readonly '[Types/_entity/IVersionable]': boolean;

   getVersion(): number {
      return this._version;
   }

   protected _nextVersion(): void {
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

   // region ManyToManyMixin

   protected _getMediator: () => ManyToMany;

   // endregion
}

Object.assign(VersionableMixin.prototype, {
   '[Types/_entity/VersionableMixin]': true,
   '[Types/_entity/IVersionable]': true,
   _version: 0
});

// Deprecated implementation
Object.assign(VersionableMixin, VersionableMixin.prototype);
