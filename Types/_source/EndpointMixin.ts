/// <amd-module name="Types/_source/EndpointMixin" />
/**
 * Миксин, позволяющий задавать конечную точку доступа.
 * @mixin Types/Source/EndpointMixin
 * @public
 * @author Мальцев А.А.
 */

import DataSet from './DataSet';

interface IEndpoint {
}

interface IOptions {
   endpoint?: IEndpoint | string;
}

const EndpointMixin = /** @lends Types/Source/EndpointMixin.prototype */{
   '[Types/_source/EndpointMixin]': true,

   /**
    * @cfg {Types/Source/IProvider/Endpoint.typedef[]|String} Конечная точка, обеспечивающая доступ клиента к функциональным возможностям источника данных.
    * @name Types/Source/EndpointMixin#endpoint
    * @remark
    * Можно успользовать сокращенную запись, передав значение в виде строки - в этом случае оно будет интерпретироваться как контракт (endpoint.contract).
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
   _$endpoint: null,

   constructor(options?: IOptions) {
      this._$endpoint = this._$endpoint || {};
      if (options) {
         //Shortcut support
         if (typeof options.endpoint === 'string') {
            options.endpoint = {contract: options.endpoint};
         }

         if (options.endpoint instanceof Object) {
            options.endpoint = Object.assign({}, this._$endpoint, options.endpoint);
         }
      }
   },

   getEndpoint(): IEndpoint {
      return Object.assign({}, this._$endpoint);
   }
};

export default EndpointMixin;
