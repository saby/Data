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

export interface IPassing extends IRemotePassing {
}

export interface IOptions extends IRemoteOptions {
}

export default abstract class Rpc extends Remote implements IRpc /** @lends Types/_source/Rpc.prototype */{

   // region IRpc

   readonly '[Types/_source/IRpc]': boolean = true;

   call(command: string, data?: Object): ExtendPromise<DataSet> {
      return this._callProvider(
         command,
         data
      ).addCallback(
         (data) => this._loadAdditionalDependencies().addCallback(
            () => this._wrapToDataSet(data)
         )
      );
   }

   // endregion

   // region Statics

   // FIXME: something went wrong with inheritance of static members in IE
   static get NAVIGATION_TYPE() {
      return Remote.NAVIGATION_TYPE;
   }

   // endregion
}

Rpc.prototype._moduleName = 'Types/source:Rpc';
Rpc.prototype['[Types/_source/Rpc]'] = true;
