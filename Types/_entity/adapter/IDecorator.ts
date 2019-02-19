/// <amd-module name="Types/_entity/adapter/IDecorator" />

import IAdapter from './IAdapter';
import ITable from './ITable';
import IRecord from './IRecord';

export default interface IDecorator /** @lends Types/_entity/adapter/IDecorator.prototype */{
   readonly '[Types/_entity/adapter/IDecorator]': boolean;
   /**
    * Возвращает оригинальный адаптер
    * @return {Types/_entity/adapter/IAdapter|Types/_entity/adapter/IRecord|Types/_entity/adapter/ITable}
    */
   getOriginal(): IAdapter | ITable | IRecord;
}
