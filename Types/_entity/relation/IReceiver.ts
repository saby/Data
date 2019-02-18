/// <amd-module name="Types/_entity/relation/IReceiver" />
/**
 * Интерфейс сущности, взаимодействующей с посредником
 * @interface Types/_entity/relation/IReceiver
 * @author Мальцев А.А.
 */

export default interface IReceiver /** @lends Types/_entity/relation/IReceiver.prototype */{
   readonly '[Types/_entity/relation/IReceiver]': boolean;

   /**
    * Принимает уведомление от посредника об изменении отношений
    * @param {Object} which Объект, уведомивший об изменении отношений
    * @param {Array.<String>} route Маршрут до объекта
    * @return {Object} Модификация объекта, уведомившего об изменении отношений
    */
   relationChanged(which: any, route: string[]): any;
}
