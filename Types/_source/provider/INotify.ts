/// <amd-module name="Types/_source/provider/INotify" />
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

import IChannel from './IChannel';

export default interface INotify /** @lends Types/_source/provider/INotify.prototype */{
   readonly '[Types/_source/provider/INotify]': boolean;

   /**
    * Возвращает канал серверных событий
    * @param {String} [name] Имя канала событий
    * @return {Types/_source/provider/IChannel}
    */
   getEventsChannel(name: string): IChannel;
}
