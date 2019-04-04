const MAX_VALUE = Number.MAX_SAFE_INTEGER || (Math.pow(2, 53) - 1);
const IS_SERVER_SIDE = typeof window === 'undefined';

let counter = 0;

/**
 * Миксин, позволяющий генерировать уникальный (в рамках миксина) идентификатор для каждого экземпляра класса.
 * @mixin Types/_entity/InstantiableMixin
 * @public
 * @author Мальцев А.А.
 */
export default class InstantiableMixin {
   '[Types/_entity/InstantiableMixin]': boolean;

   /**
    * Префикс значений идентификатора
    */
   protected _instancePrefix: string;

   /**
    * Уникальный идентификатор
    */
   protected _instanceId: string;

   // region IInstantiable

   readonly '[Types/_entity/IInstantiable]': boolean;

   getInstanceId(): string {
      if (counter >= MAX_VALUE) {
         counter = 0;
      }
      return this._instanceId ||
         (this._instanceId = (IS_SERVER_SIDE ? 'server-' : 'client-') + this._instancePrefix + counter++);
   }

   // endregion
}

Object.assign(InstantiableMixin.prototype, {
   '[Types/_entity/InstantiableMixin]': true,
   '[Types/_entity/IInstantiable]': true,
   _instancePrefix: 'id-',
   _instanceId: ''
});

// Deprecated implementation
// @ts-ignore
InstantiableMixin.prototype.getHash = InstantiableMixin.prototype.getInstanceId;
Object.assign(InstantiableMixin, InstantiableMixin.prototype);
