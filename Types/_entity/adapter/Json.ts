import Abstract from './Abstract';
import JsonTable from './JsonTable';
import JsonRecord from './JsonRecord';
import {register} from '../../di';

/**
 * Адаптер для данных в формате JSON.
 * Работает с данными, представленными в виде обычных JSON объектов.
 * Примеры можно посмотреть в модулях {@link Types/_entity/adapter/JsonRecord} и
 * {@link Types/_entity/adapter/JsonTable}.
 * @class Types/_entity/adapter/Json
 * @extends Types/_entity/adapter/Abstract
 * @public
 * @author Мальцев А.А.
 */
export default class Json extends Abstract {
   forTable(data: object[]): JsonTable {
      return new JsonTable(data);
   }

   forRecord(data: object): JsonRecord {
      return new JsonRecord(data);
   }

   getKeyField(): string {
      return undefined;
   }
}

Object.assign(Json.prototype, {
   '[Types/_entity/adapter/Json]': true,
   _moduleName: 'Types/entity:adapter.Json'
});

register('Types/entity:adapter.Json', Json, {instantiate: false});
// FIXME: deprecated
register('adapter.json', Json);
