/// <amd-module name="Types/_collection/factory/recordSet" />
/**
 * Фабрика для получения рекордсета из Types/Collection/IEnumerable.
 * @class Types/Collection/Factory/RecordSet
 * @public
 * @author Мальцев А.А.
 */

import IEnumerable from '../IEnumerable';
import RecordSet from '../RecordSet';
import {Record} from '../../entity';
import {resolve, isRegistered} from '../../di';

interface IOptions {
   rawData?: any
}

/**
 * @alias Types/Collection/Factory/RecordSet
 * @param {Types/Collection/IEnumerable.<Types/Entity/Record>} items Коллекция записей
 * @param {Object} [options] Опции конструктора рекордсета
 * @return {Types/Collection/RecordSet}
 */
export default function recordSet(items: IEnumerable<Record>, options?: IOptions): RecordSet<Record> {
   if (!items || !(items['[Types/_collection/IEnumerable]'])) {
      throw new TypeError('Argument "items" should implement Types/collection:IEnumerable');
   }

   const Factory = resolve(
      isRegistered('collection.$recordset') ? 'collection.$recordset' : 'Types/collection:RecordSet'
   );

   options = options || {};
   delete options.rawData;

   let result = new Factory(options);
   items.each((item) => {
      result.add(item);
   });

   return result;
}
