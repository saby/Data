import { EntityMarker } from '../../_declarations';

/**
 * Интерфейс канала серверных событий
 * @interface Types/_source/provider/IChannel
 * @public
 * @author Мальцев А.А.
 */
export default interface IChannel {
    readonly '[Types/_source/provider/IChannel]': EntityMarker;

    /**
     * @event При получении уведомления о серверном событии
     * @name Types/_source/provider/IChannel#onMessage
     * @param {Env/Event.Object} event Дескриптор события.
     * @param {String|Object} message Сообщение события.
     */
}
