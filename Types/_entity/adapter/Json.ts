/// <amd-module name="Types/_entity/adapter/Json" />
/**
 * Адаптер для данных в формате JSON.
 * Работает с данными, представленными в виде обычных JSON объектов.
 * Примеры можно посмотреть в модулях {@link Types/Adapter/JsonRecord} и {@link Types/Adapter/JsonTable}.
 * @class Types/Adapter/Json
 * @extends Types/Adapter/Abstract
 * @public
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import JsonTable from './JsonTable';
import JsonRecord from './JsonRecord';
import di from '../../_di';

export default class Json extends Abstract /** @lends Types/Adapter/Json.prototype */{
   forTable(data) {
      return new JsonTable(data);
   }

   forRecord(data) {
      return new JsonRecord(data);
   }

   getKeyField() {
      return undefined;
   }
}

Json.prototype['[Types/_entity/adapter/Json]'] = true;
Json.prototype._moduleName = 'Types/entity:adapter.Json';

di.register('Types/entity:adapter.Json', Json, {instantiate: false});
//FIXME: deprecated
di.register('adapter.json', Json);
