import Abstract from './Abstract';
import RecordSetTable from './RecordSetTable';
import RecordSetRecord from './RecordSetRecord';
import Record from '../Record';
import {RecordSet as collectionRecordSet} from '../../collection';
import {register} from '../../di';
import {object} from '../../util';

/**
 * Адаптер для рекордсета.
 * Работает с данными, представленными в виде рекорда/рекордсета.
 * Примеры можно посмотреть в модулях {@link Types/_entity/adapter/RecordSetRecord} и
 * {@link Types/_entity/adapter/RecordSetTable}.
 * @class Types/_entity/adapter/RecordSet
 * @extends Types/_entity/adapter/Abstract
 * @public
 * @author Мальцев А.А.
 */
export default class RecordSet extends Abstract {
    /**
     * Возвращает интерфейс доступа к рекордсету в виде таблицы
     * @param {Types/_collection/RecordSet} data Рекордсет
     * @return {Types/_entity/adapter/ITable}
     */
    forTable(data: collectionRecordSet): RecordSetTable {
        return new RecordSetTable(data);
    }

    /**
     * Возвращает интерфейс доступа к record-у в виде записи
     * @param {Types/_entity/Record} data Запись
     * @param {Types/_collection/RecordSet} [tableData] Таблица
     * @return {Types/_entity/adapter/IRecord}
     */
    forRecord(data: Record, tableData?: collectionRecordSet): RecordSetRecord {
        return new RecordSetRecord(data, tableData);
    }

    getProperty(data: object, property: string): any {
        return object.getPropertyValue(data, property);
    }

    setProperty(data: object, property: string, value: any): void {
        return object.setPropertyValue(data, property, value);
    }

   getKeyField(data: any): string {
      if (data && typeof data.getKeyProperty === 'function') {
         return data.getKeyProperty();
      }
      return undefined;
   }
}

Object.assign(RecordSet.prototype, {
    '[Types/_entity/adapter/RecordSet]': true,
    _moduleName: 'Types/entity:adapter.RecordSet'
});

register('Types/entity:adapter.RecordSet', RecordSet, {instantiate: false});
// FIXME: deprecated
register('adapter.recordset', RecordSet, {instantiate: false});
