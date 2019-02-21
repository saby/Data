/// <amd-module name="Types/_entity/adapter/IMetaData" />
/**
 * Интерфейс адаптера для работы с метаданными
 * @interface Types/_entity/adapter/IMetaData
 * @public
 * @author Мальцев А.А.
 */

import Field from '../format/Field';

export default interface IMetaData /** @lends Types/_entity/adapter/IMetaData.prototype */{
   readonly '[Types/_entity/adapter/IMetaData]': boolean;

   /**
    * Возвращает описание метаданных
    * @return {Array.<Types/_entity/format/Field>}
    */
   getMetaDataDescriptor(): Field[];

   /**
    * Возвращает значение из метаданных по имени
    * @param {String} name Поле метаданных
    * @return {*}
    */
   getMetaData(name: string): any;

   /**
    * Сохраняет значение в метаданных с указанным именем
    * @param {String} name Поле метаданных
    * @param {*} value Значение
    */
   setMetaData(name: string, value: any): void;
}
