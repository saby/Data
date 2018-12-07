/// <amd-module name="Types/_entity/IVersionable" />
/**
 * Интерфейс изменения версий объекта.
 * Позволяет быстро проверить изменилось ли что либо в объекте.
 * @interface Types/Entity/IVersionable
 * @public
 * @author Мальцев А.А.
 */

export default interface IVersionable /** @lends Types/Entity/IVersionable.prototype */{
   readonly '[Types/_entity/IVersionable]': boolean;

   /**
    * Возвращает версию объекта.
    * Версия соответсвует некому состоянию объекта и меняется при измении как то значимых свойств объекта,
    * например для рекорда это будет изменение полей.
    * @return {Number}
    * @example
    * Проверим изменился ли рекорд:
    * <pre>
    *    require(['Types/Entity/Record'], function(Record) {
    *       var record = new Record({
    *             rawData: {
    *                id: 1
    *             }
    *          }),
    *          method = function (record) {
    *             if (Math.round(Math.random() * 1000) % 2 === 0) {
    *                record.set('id', 2);
    *             }
    *          };
    *
    *       version = record.getVersion();
    *       method(record);
    *       if (version != record.getVersion()) {
    *          console.log('Изменился');
    *       }
    *    });
    * </pre>
    */
   getVersion(): number;
}
