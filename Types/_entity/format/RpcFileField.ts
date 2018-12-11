/// <amd-module name="Types/_entity/format/RpcFileField" />
/**
 * Формат поля файл-RPC.
 *
 * Создадим поле c типом "Файл-RPC":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'rpcfile'
 *    };
 * </pre>
 * @class Types/Format/RpcFileField
 * @extends Types/Format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';

export default class RpcFileField extends Field /** @lends Types/Format/RpcFileField.prototype */{
}

RpcFileField.prototype['[Types/_entity/format/RpcFileField]'] = true;
RpcFileField.prototype._moduleName = 'Types/entity:format.RpcFileField';
RpcFileField.prototype._typeName = 'RpcFile';
