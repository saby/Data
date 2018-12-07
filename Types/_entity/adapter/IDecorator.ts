/// <amd-module name="Types/_entity/adapter/IDecorator" />

import IAdapter from './IAdapter';
import ITable from './ITable';
import IRecord from './IRecord';

export default interface IDecorator /** @lends Types/Adapter/IDecorator.prototype */{
   readonly '[Types/_entity/adapter/IDecorator]': boolean;
   /**
    * Возвращает оригинальный адаптер
    * @return {Types/Adapter/IAdapter|Types/Adapter/IRecord|Types/Adapter/ITable}
    */
   getOriginal(): IAdapter | ITable | IRecord
}
