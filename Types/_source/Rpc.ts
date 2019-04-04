import Remote from './Remote';
import DataSet from './DataSet';
import IRpc from './IRpc';
import {ExtendPromise} from '../_declarations';

/**
 * Источник данных, работающий по технологии RPC.
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @class Types/_source/Rpc
 * @extends Types/_source/Remote
 * @implements Types/_source/IRpc
 * @public
 * @author Мальцев А.А.
 */
export default abstract class Rpc extends Remote implements IRpc {

   // region IRpc

   readonly '[Types/_source/IRpc]': boolean = true;

   call(command: string, data?: object): ExtendPromise<DataSet> {
      return this._callProvider(command, data).addCallback(
         (data) => this._loadAdditionalDependencies().addCallback(
            () => this._wrapToDataSet(data)
         )
      );
   }

   // endregion
}

Object.assign(Rpc.prototype, {
   '[Types/_source/Rpc]': true,
   _moduleName: 'Types/source:Rpc'
});
