/// <amd-module name="Types/_entity/adapter/RecordSet" />
/**
 * Адаптер для рекордсета.
 * Работает с данными, представленными в виде рекорда/рекордсета.
 * Примеры можно посмотреть в модулях {@link Types/_entity/adapter/RecordSetRecord} и {@link Types/_entity/adapter/RecordSetTable}.
 * @class Types/_entity/adapter/RecordSet
 * @extends Types/_entity/adapter/Abstract
 * @public
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import RecordSetTable from './RecordSetTable';
import RecordSetRecord from './RecordSetRecord';
import {register} from '../../di';
import {object} from '../../util';

export default class RecordSet extends Abstract /** @lends Types/_entity/adapter/RecordSet.prototype */{
   /**
    * Возвращает интерфейс доступа к рекордсету в виде таблицы
    * @param {Types/_collection/RecordSet} data Рекордсет
    * @return {Types/_entity/adapter/ITable}
    */
   forTable(data) {
      return new RecordSetTable(data);
   }

   /**
    * Возвращает интерфейс доступа к record-у в виде записи
    * @param {Types/_entity/Record} data Запись
    * @param {Types/_collection/RecordSet} [tableData] Таблица
    * @return {Types/_entity/adapter/IRecord}
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

register('Types/entity:adapter.RecordSet', RecordSet, {instantiate: false});
//FIXME: deprecated
register('adapter.recordset', RecordSet, {instantiate: false});
