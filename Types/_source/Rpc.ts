import Remote, { ICacheParameters } from './Remote';
import DataSet from './DataSet';
import IRpc from './IRpc';
import { EntityMarker } from '../_declarations';
import { skipLogExecutionTime } from '../util';

/**
 * Источник данных, работающий по технологии RPC.
 * @remark
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @class Types/_source/Rpc
 * @extends Types/_source/Remote
 * @implements Types/_source/IRpc
 * @public
 * @author Мальцев А.А.
 */
export default abstract class Rpc extends Remote implements IRpc {

    // region IRpc

    readonly '[Types/_source/IRpc]': EntityMarker = true;

    call(command: string, data?: object, cache?: ICacheParameters): Promise<DataSet> {
        return this._callProvider<DataSet>(command, data, cache).addCallback(skipLogExecutionTime(
            (responseData) => this._loadAdditionalDependencies().then(skipLogExecutionTime(
                () => this._wrapToDataSet(responseData)
            ))
        ));
    }

    // endregion
}

Object.assign(Rpc.prototype, {
    '[Types/_source/Rpc]': true,
    _moduleName: 'Types/source:Rpc'
});
