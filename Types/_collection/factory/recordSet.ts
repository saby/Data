import IEnumerable from '../IEnumerable';
import RecordSet from '../RecordSet';
import {Record} from '../../entity';
import {create} from '../../di';

interface IOptions {
   rawData?: any;
}

/**
 * Фабрика для получения рекордсета из Types/_collection/IEnumerable.
 * @class Types/_collection/factory/recordSet
 * @param Коллекция записей
 * @param Опции конструктора рекордсета
 * @public
 * @author Мальцев А.А.
 */
export default function recordSet(items: IEnumerable<Record>, options?: IOptions): RecordSet {
   if (!items || !(items['[Types/_collection/IEnumerable]'])) {
      throw new TypeError('Argument "items" should implement Types/collection:IEnumerable');
   }

   options = options || {};
   delete options.rawData;

   const result = create<RecordSet>('Types/collection:RecordSet', options);
   items.each((item) => {
      result.add(item);
   });

   return result;
}
