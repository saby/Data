import IChannel from './IChannel';
import { EntityMarker } from '../../_declarations';

/**
 * Интерфейс провайдера c доступом к серверным событиям
 * @interface Types/_source/provider/INotify
 * @public
 * @author Мальцев А.А.
 * @example
 * <pre>
 *     import {DataSet} from 'Types/source';
 *
 *     // ...
 *     if (dataSource instanceof source.Remote) {
 *         const provider = dataSource.getProvider();
 *         if (provider['[Types/_source/provider/INotify]']) {
 *             provider.getEventsChannel().subscribe('onMessage', (event, message) => {
 *                 console.log(`A message from the server: ${message}`);
 *             });
 *         }
 *     }
 * </pre>
 * @example
 * <pre>
 *     dataSource.getProvider().getEventsChannel('ErrorLog').subscribe('onMessage', (event, message) => {
 *         console.error(`Something went wrong: ${message}`);
 *     });
 * </pre>
 */
export default interface INotify {
    readonly '[Types/_source/provider/INotify]': EntityMarker;

    /**
     * Возвращает канал серверных событий
     * @param [name] Имя канала событий
     */
    getEventsChannel(name: string): IChannel;
}
