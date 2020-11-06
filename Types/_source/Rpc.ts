import Remote, { ICacheParameters } from './Remote';
import DataSet from './DataSet';
import { compatibleThen } from './Deferred';
import IRpc from './IRpc';
import { EntityMarker } from '../_declarations';

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
        const callResult = this._withAdditionalDependencies(
            this._callProvider<DataSet>(command, data, cache),
            this._loadAdditionalDependencies()
        );

        return compatibleThen(
            callResult,
            (responseData) => this._wrapToDataSet(responseData)
        );
    }

    // endregion
}

Object.assign(Rpc.prototype, {
    '[Types/_source/Rpc]': true,
    _moduleName: 'Types/source:Rpc'
});
