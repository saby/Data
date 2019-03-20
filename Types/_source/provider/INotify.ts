import IChannel from './IChannel';

/**
 * Интерфейс провайдера c доступом к серверным событиям
 * @interface Types/_source/provider/INotify
 * @public
 * @author Мальцев А.А.
 * @example
 * <pre>
 *    require(['Types/source', 'Core/core-instance'], function(source, coreInstance) {
 *       //...
 *       if (dataSource instanceof source.Remote) {
 *          var provider = dataSource.getProvider();
 *          if (coreInstance.instanceOfMixin(provider, 'Types/_source/provider/INotify') {
 *             provider.getEventsChannel().subscribe('onMessage', function(event, message) {
 *                console.log('A message from the server: ' + message);
 *             });
 *          }
 *       }
 *    });
 * </pre>
 * @example
 * <pre>
 *    dataSource.getProvider().getEventsChannel('ErrorLog').subscribe('onMessage', function(event, message) {
 *       console.error('Something went wrong: ' + message);
 *    });
 * </pre>
 */
export default interface INotify {
   readonly '[Types/_source/provider/INotify]': boolean;

   /**
    * Возвращает канал серверных событий
    * @param [name] Имя канала событий
    */
   getEventsChannel(name: string): IChannel;
}
