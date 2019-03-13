/**
 * Фабрика для получения рекордсета из Types/_collection/IEnumerable.
 * @class Types/_collection/Factory/RecordSet
 * @public
 * @author Мальцев А.А.
 */

import IEnumerable from '../IEnumerable';
import RecordSet from '../RecordSet';
import {Record} from '../../entity';
import {create} from '../../di';

interface IOptions {
   rawData?: any;
}

/**
 * @alias Types/_collection/Factory/RecordSet
 * @param {Types/_collection/IEnumerable.<Types/_entity/Record>} items Коллекция записей
 * @param {Object} [options] Опции конструктора рекордсета
 * @return {Types/_collection/RecordSet}
 */
export default function recordSet(items: IEnumerable<Record>, options?: IOptions): RecordSet<Record> {
   if (!items || !(items['[Types/_collection/IEnumerable]'])) {
      throw new TypeError('Argument "items" should implement Types/collection:IEnumerable');
   }

   options = options || {};
   delete options.rawData;

   const result = create<RecordSet<Record>>('Types/collection:RecordSet', options);
   items.each((item) => {
      result.add(item);
   });

   return result;
}
