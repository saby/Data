import IEnumerable from '../IEnumerable';
import RecordSet, {IOptions} from '../RecordSet';
import {Record} from '../../entity';
import {create} from '../../di';

/**
 * Фабрика для получения рекордсета из Types/_collection/IEnumerable.
 * @class Types/_collection/factory/recordSet
 * @param items Коллекция записей
 * @param options Опции конструктора рекордсета
 * @public
 * @author Кудрявцев И.С.
 */
export default function recordSet(items: IEnumerable<Record>, options: IOptions = {}): RecordSet<unknown, Record> {
    if (!items || !(items['[Types/_collection/IEnumerable]'])) {
        throw new TypeError('Argument "items" should implement Types/collection:IEnumerable');
    }

    delete options.rawData;

    const result = create<RecordSet<unknown, Record>>('Types/collection:RecordSet', options);
    items.each((item) => {
        result.add(item);
    });

    return result;
}
