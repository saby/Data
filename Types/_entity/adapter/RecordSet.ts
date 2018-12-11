/// <amd-module name="Types/_entity/adapter/RecordSet" />
/**
 * Адаптер для рекордсета.
 * Работает с данными, представленными в виде рекорда/рекордсета.
 * Примеры можно посмотреть в модулях {@link Types/Adapter/RecordSetRecord} и {@link Types/Adapter/RecordSetTable}.
 * @class Types/Adapter/RecordSet
 * @extends Types/Adapter/Abstract
 * @public
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import RecordSetTable from './RecordSetTable';
import RecordSetRecord from './RecordSetRecord';
import di from '../../di';
import {object} from '../../util';

export default class RecordSet extends Abstract /** @lends Types/Adapter/RecordSet.prototype */{
   /**
    * Возвращает интерфейс доступа к рекордсету в виде таблицы
    * @param {Types/Collection/RecordSet} data Рекордсет
    * @return {Types/Adapter/ITable}
    */
   forTable(data) {
      return new RecordSetTable(data);
   }

   /**
    * Возвращает интерфейс доступа к record-у в виде записи
    * @param {Types/Entity/Record} data Запись
    * @param {Types/Collection/RecordSet} [tableData] Таблица
    * @return {Types/Adapter/IRecord}
    */
   forRecord(data, tableData?) {
      return new RecordSetRecord(data, tableData);
   }

   getProperty(data, property) {
      return object.getPropertyValue(data, property);
   }

   setProperty(data, property, value) {
      return object.setPropertyValue(data, property, value);
   }

   getKeyField(data) {
      if (data && typeof data.getIdProperty === 'function') {
         return data.getIdProperty();
      }
      return undefined;
   }
}

RecordSet.prototype['[Types/_entity/adapter/RecordSet]'] = true;
RecordSet.prototype._moduleName = 'Types/entity:adapter.RecordSet';

di.register('Types/entity:adapter.RecordSet', RecordSet, {instantiate: false});
