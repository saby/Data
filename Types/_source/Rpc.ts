import Remote, { ICacheParameters } from './Remote';
import DataSet from './DataSet';
import IRpc from './IRpc';
import { EntityMarker, IDeferred } from '../_declarations';
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
        const result = this._callProvider<DataSet>(command, data, cache);

        if ((result as IDeferred<DataSet>).addCallback) {
            (result as IDeferred<DataSet>).addCallback(skipLogExecutionTime(
                (responseData) => this._loadAdditionalDependencies().then(skipLogExecutionTime(
                    () => this._wrapToDataSet(responseData)
                ))
            ));
            return result;
        }

        return result.then((responseData) => this._wrapToDataSet(responseData));
    }

    // endregion
}

Object.assign(Rpc.prototype, {
    '[Types/_source/Rpc]': true,
    _moduleName: 'Types/source:Rpc'
});
