import IAdapter from './IAdapter';
import ITable from './ITable';
import IRecord from './IRecord';
import { EntityMarker } from '../../_declarations';

/**
 * Интерфейс адаптера, являющегося декоратором
 * @interface Types/_entity/adapter/IDecorator
 * @public
 * @author Кудрявцев И.С.
 */
export default interface IDecorator {
    readonly '[Types/_entity/adapter/IDecorator]': EntityMarker;
    /**
     * Возвращает оригинальный адаптер
     */
    getOriginal(): IAdapter | ITable | IRecord;
}
