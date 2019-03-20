import IAdapter from './IAdapter';
import ITable from './ITable';
import IRecord from './IRecord';

/**
 * Интерфейс адаптера, являющегося декоратором
 * @interface Types/_entity/adapter/IDecorator
 * @public
 * @author Мальцев А.А.
 */
export default interface IDecorator {
   readonly '[Types/_entity/adapter/IDecorator]': boolean;
   /**
    * Возвращает оригинальный адаптер
    */
   getOriginal(): IAdapter | ITable | IRecord;
}
