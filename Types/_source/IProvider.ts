/// <amd-module name="Types/_source/IProvider" />
/**
 * Интерфейс источника данных, поддерживающиего абстракцию взаимодействия через провайдера удаленного доступа.
 * @interface Types/_source/IProvider
 * @public
 * @author Мальцев А.А.
 */

import {IAbstract} from './provider';

export interface IEndpoint {
   contract: string,
   address?: string
}

export default interface IProvider /** @lends Types/_source/IProvider.prototype */{
   readonly '[Types/_source/IProvider]': boolean;

   /**
    * @typedef {Object} Endpoint
    * @property {String} [address] Адрес - указывает место расположения сервиса, к которому будет осуществлено подключение
    * @property {String} contract Контракт - определяет доступные операции
    */

   /**
    * @event onBeforeProviderCall Перед вызовом метода удаленного сервиса через провайдер
    * @param {Core/EventObject} eventObject Дескриптор события.
    * @param {String} name Имя метода
    * @param {Object} [args] Аргументы метода (передаются по ссылке, можно модифицировать, но при этом следует учитывать, что изменяется оригинальный объект)
    * @example
    * Добавляем в фильтр выборки поле enabled со значением true:
    * <pre>
    *    require(['Types/source'], function(source) {
    *       var dataSource = new source.SbisService({endpoint: 'Pickles'});
    *       dataSource.subscribe('onBeforeProviderCall', function(eventObject, name, args) {
    *          args = Object.assign({}, args);
    *          switch (name) {
    *             case 'getList':
    *                //Select only active users
    *                args.filter = args.filter || {};
    *                args.filter.active = true;
    *                break;
    *          }
    *          eventObject.setResult(args);
    *       });
    *
    *       dataSource.call('getList', {filter: {registered: true}});
    *    });
    * </pre>
    */

   /**
    * Возвращает объект, реализующий сетевой протокол для обмена в режиме клиент-сервер
    * @return {Types/_source/Provider/IAbstract}
    * @see provider
    */
   getProvider(): IAbstract;

   /**
    * Возвращает конечную точку, обеспечивающую доступ клиента к функциональным возможностям провайдера удаленного доступа.
    * @return {Endpoint}
    * @see endpoint
    * @example
    * Получим название контракта:
    * <pre>
    *    var dataSource = new RpcSource({
    *       endpoint: {
    *          address: '/api/',
    *          contract: 'User'
    *       }
    *    });
    *
    *    dataSource.getEndpoint().contract;//'User'
    * </pre>
    */
   getEndpoint(): IEndpoint;
}
