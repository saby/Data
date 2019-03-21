import {IEndpoint} from './IProvider';

export interface IOptions {
   endpoint?: IEndpoint | string;
}

/**
 * Миксин, позволяющий задавать конечную точку доступа.
 * @mixin Types/_source/EndpointMixin
 * @public
 * @author Мальцев А.А.
 */
export default abstract class EndpointMixin {
   readonly '[Types/_source/EndpointMixin]': boolean;

   /**
    * @cfg {Types/_source/IProvider/Endpoint.typedef[]|String} Конечная точка, обеспечивающая доступ клиента к
    * функциональным возможностям источника данных.
    * @name Types/_source/EndpointMixin#endpoint
    * @remark
    * Можно успользовать сокращенную запись, передав значение в виде строки - в этом случае оно будет
    * интерпретироваться как контракт (endpoint.contract).
    * @see getEndPoint
    * @example
    * Подключаем пользователей через HTTP API:
    * <pre>
    *    var dataSource = new HttpSource({
    *       endpoint: {
    *          address: '/api/',
    *          contract: 'users/'
    *       }
    *    });
    * </pre>
    * Подключаем пользователей через HTTP API с использованием сокращенной нотации:
    * <pre>
    *    var dataSource = new HttpSource({
    *       endpoint: '/users/'
    *    });
    * </pre>
    * Подключаем пользователей через HTTP API с указанием адреса подключения:
    * <pre>
    *    var dataSource = new RpcSource({
    *       endpoint: {
    *          address: '//server.name/api/rpc/',
    *          contract: 'Users'
    *       }
    *    });
    * </pre>
    */
   protected _$endpoint: IEndpoint;

   constructor(options?: IOptions) {
      this._$endpoint = this._$endpoint || {};
      if (options) {
         // Shortcut support
         if (typeof options.endpoint === 'string') {
            options.endpoint = {contract: options.endpoint};
         }

         if (options.endpoint instanceof Object) {
            options.endpoint = {...this._$endpoint, ...options.endpoint};
         }
      }
   }

   getEndpoint(): IEndpoint {
      return {...this._$endpoint};
   }
}

Object.assign(EndpointMixin.prototype, {
   '[Types/_source/EndpointMixin]': true,
   _$endpoint: null
});
