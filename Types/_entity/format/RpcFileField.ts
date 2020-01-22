import Field from './Field';
import {register} from '../../di';

/**
 * Формат поля файл-RPC.
 * @remark
 * Создадим поле c типом "Файл-RPC":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'rpcfile'
 *     };
 * </pre>
 * @class Types/_entity/format/RpcFileField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */
export default class RpcFileField extends Field {
}

Object.assign(RpcFileField.prototype, {
    '[Types/_entity/format/RpcFileField]': true,
    _moduleName: 'Types/entity:format.RpcFileField',
    _typeName: 'RpcFile'
});

register('Types/entity:format.RpcFileField', RpcFileField, {instantiate: false});
