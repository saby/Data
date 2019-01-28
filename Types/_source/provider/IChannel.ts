/// <amd-module name="Types/_source/provider/IChannel" />
/**
 * Интерфейс канала серверных событий
 * @interface Types/_source/provider/IChannel
 * @public
 * @author Мальцев А.А.
 */

export default interface IChannel /** @lends Types/_source/provider/IChannel.prototype */{
   readonly '[Types/_source/provider/IChannel]': boolean;

   /**
    * @event onMessage При получении уведомления о серверном событии
    * @param {Core/EventObject} event Дескриптор события.
    * @param {String|Object} message Сообщение события.
    */
}
