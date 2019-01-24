/// <amd-module name="Types/_entity/InstantiableMixin" />
/**
 * Миксин, позволяющий генерировать уникальный (в рамках миксина) идентификатор для каждого экземпляра класса.
 * @mixin Types/_entity/InstantiableMixin
 * @public
 * @author Мальцев А.А.
 */

// @ts-ignore
import constants = require('Core/constants');

const MAX_VALUE = Number.MAX_SAFE_INTEGER || (Math.pow(2, 53) - 1);
let counter = 0;

const InstantiableMixin = /** @lends Types/_entity/InstantiableMixin.prototype */{
   '[Types/_entity/InstantiableMixin]': true,

   /**
    * @property {String} Префикс значений идентификатора
    */
   _instancePrefix: 'id-',

   /**
    * @property {String} Уникальный идентификатор
    */
   _instanceId: '',

   //region IInstantiable

   getInstanceId(): string {
      if (counter >= MAX_VALUE) {
         counter = 0;
      }
      return this._instanceId || (this._instanceId = (constants.isBrowserPlatform ? 'client-' : 'server-') + this._instancePrefix + counter++);
   }

   //endregion IInstantiable
};

//Deprecated methods
// @ts-ignore
InstantiableMixin.getHash = InstantiableMixin.getInstanceId;

export default InstantiableMixin;
