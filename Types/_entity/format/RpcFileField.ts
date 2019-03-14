import Field from './Field';

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
 * @class Types/_entity/format/RpcFileField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */
export default class RpcFileField extends Field /** @lends Types/_entity/format/RpcFileField.prototype */{
}

RpcFileField.prototype['[Types/_entity/format/RpcFileField]'] = true;
RpcFileField.prototype._moduleName = 'Types/entity:format.RpcFileField';
RpcFileField.prototype._typeName = 'RpcFile';
