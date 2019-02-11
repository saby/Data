/// <amd-module name="Types/_source/Rpc" />
/**
 * Источник данных, работающий по технологии RPC.
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @class Types/_source/Rpc
 * @extends Types/_source/Remote
 * @implements Types/_source/IRpc
 * @public
 * @author Мальцев А.А.
 */

import Remote, {IPassing as IRemotePassing, IOptions as IRemoteOptions} from './Remote';
import DataSet from './DataSet';
import IRpc from './IRpc';
import Deferred = require('Core/Deferred');

export interface IPassing extends IRemotePassing {
}

export interface IOptions extends IRemoteOptions {
}

export default abstract class Rpc extends Remote implements IRpc /** @lends Types/_source/Rpc.prototype */{

   //region IRpc

   readonly '[Types/_source/IRpc]': boolean = true;

   call(command: string, data?: Object): Deferred<DataSet> {
      return this._callProvider(
         command,
         data
      ).addCallback(
         (data) => this._loadAdditionalDependencies().addCallback(
            () => this._wrapToDataSet(data)
         )
      );
   }

   //endregion
}

Rpc.prototype._moduleName = 'Types/source:Rpc';
Rpc.prototype['[Types/_source/Rpc]'] = true;
