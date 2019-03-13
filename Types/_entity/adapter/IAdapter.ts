/**
 * Интерфейс адаптера, осуществляющиего операции с "сырыми" данными.
 * Назначение адаптера - предоставить общий интерфейс для работы различными форматами данных.
 * @interface Types/_entity/adapter/IAdapter
 * @public
 * @author Мальцев А.А.
 */

import ITable from './ITable';
import IRecord from './IRecord';

export default interface IAdapter /** @lends Types/_entity/adapter/IAdapter.prototype */{
   readonly '[Types/_entity/adapter/IAdapter]': boolean;

   /**
    * Возвращает интерфейс доступа к данным в виде таблицы
    * @param {*} data Сырые данные
    * @return {Types/_entity/adapter/ITable}
    */
   forTable(data: any): ITable;

   /**
    * Возвращает интерфейс доступа к данным в виде записи
    * @param {*} data Сырые данные
    * @param {*} [tableData] Сырые данные таблицы (передаются, когда data пустой)
    * @return {Types/_entity/adapter/IRecord}
    */
   forRecord(data: any, tableData?: any): IRecord;

   /**
    * Возвращает название поля, которое является первичным ключом
    * @param {*} data Сырые данные
    * @return {String}
    */
   getKeyField(data: any): string;

   /**
    * Возвращает значение свойства
    * @param {*} data Сырые данные
    * @param {String} property Название свойства
    * @return {*}
    */
   getProperty(data: any, property: string): any;

   setProperty(data: any, property: string, value: any): void;

   /**
    * Сериализует данные - переводит из внешнего формата в формат адаптера
    * @param {*} data Сериализуемые данные
    * @return {Object} Сериализованные данные
    * @static
    */
   serialize(data: any): any;
}
