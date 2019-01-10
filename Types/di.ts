/// <amd-module name="Types/di" />
/**
 * Re-exports di as library
 * @public
 * @author Мальцев А.А.
 */

import _di from './_di'

const register = _di.register;
const unregister = _di.unregister;
const isRegistered = _di.isRegistered;
const create = _di.create;
const resolve = _di.resolve;

export {
   register,
   unregister,
   isRegistered,
   create,
   resolve
}
