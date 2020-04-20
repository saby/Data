import IAbstract from './IAbstract';
import {OptionsToPropertyMixin} from '../../entity';
import {register} from '../../di';
import {logger as defaultLogger, ILogger} from '../../util';
import {RPCJSON} from 'Browser/Transport';
import {constants} from 'Env/Env';
import Deferred = require('Core/Deferred');

export interface IEndPoint {
    contract?: string;
    address?: string;
}

export interface IOptions {
    endpoint?: IEndPoint;
    callTimeout?: number;
    logger?: ILogger;
    transport?: IRpcTransportConstructor;
}

export interface IRpcTransport {
    callMethod<T>(method: string, args: unknown): Promise<T>;
    abort(): void;
}

export interface IRpcTransportOptions {
    serviceUrl: string;
    timeout?: number;
}

export type IRpcTransportConstructor = new(options: IRpcTransportOptions) => IRpcTransport;

// Default timeout to produce a call (in seconds)
const DEFAULT_CALL_TIMEOUT: number = constants.isServerSide ? 5 : 0;

function throwError(err: Error, logger: ILogger): void {
    logger.info('Types/_source/provider/SbisBusinessLogic', err.message);
}

/**
 * Returns promise which rejecting with error if origin doesn't return any result during specified timeout.
 * @param origin Origin promise
 * @param timeout Timeout to wait
 * @param methodName Called method name
 * @param address Called address
 * @param logger Logger instance
 */
function getTimedOutResponse<T>(
    origin: Promise<T> | Deferred<T>,
    timeout: number,
    methodName: string,
    address: string,
    logger: ILogger
): Promise<T> {
    const itsPromise = !(origin as Deferred<T>).isReady;
    const timeoutError = `Timeout of ${timeout} seconds had expired before the method '${methodName}' at '${address}' returned any results`;
    let timeoutHandler: number;

    // Clear links to timeout and error instance in purpose of disappearing in memory allocation tree.
    const unallocate = () => {
        if (timeoutHandler) {
            clearTimeout(timeoutHandler);
            timeoutHandler = undefined;
        }
    };

    timeoutHandler = setTimeout(() => {
        throwError(new Error(timeoutError), logger);
        unallocate();
    }, 1000 * timeout);

    if (itsPromise) {
        return new Promise((resolve, reject) => {
            origin.then((response) => {
                unallocate();
                resolve(response);
            }).catch((err) => {
                unallocate();
                reject(err);
            });
        });
    }

    (origin as Deferred<T>).addCallbacks((result) => {
        unallocate();
        return result;
    }, (err) => {
        unallocate();
        return err;
    });

    return origin;
}

/**
 * JSON-RPC Провайдер для бизнес-логики СБиС
 * @class Types/_source/provider/SbisBusinessLogic
 * @implements Types/_source/provider/IAbstract
 * @mixes Types/_entity/OptionsMixin
 * @public
 * @author Мальцев А.А.
 */
export default class SbisBusinessLogic extends OptionsToPropertyMixin implements IAbstract {
    readonly '[Types/_source/provider/IAbstract]': boolean = true;

    protected _$logger: ILogger = defaultLogger;

    protected _$callTimeout: number = DEFAULT_CALL_TIMEOUT;

    /**
     * @cfg {Endpoint} Конечная точка, обеспечивающая доступ клиента к БЛ
     * @name Types/_source/provider/SbisBusinessLogic#endpoint
     * @see getEndPoint
     * @example
     * <pre>
     *     import {provider} from 'Types/source';
     *
     *     const dataSource = new provider.SbisBusinessLogic({
     *         endpoint: {
     *             address: '/service/url/',
     *             contract: 'Сотрудник'
     *         }
     *     });
     * </pre>
     */
    protected _$endpoint: IEndPoint = {};

    /**
     * @cfg {Function} Конструктор сетевого транспорта
     */
    protected _$transport: IRpcTransportConstructor | any = RPCJSON;

    /**
     * Разделитель пространств имен
     */
    protected _nameSpaceSeparator: string;

    constructor(options?: IOptions) {
        super();
        OptionsToPropertyMixin.call(this, options);
    }

    /**
     * Возвращает конечную точку, обеспечивающую доступ клиента к функциональным возможностям БЛ
     * @return {Endpoint}
     * @see endpoint
     */
    getEndpoint(): IEndPoint {
        return this._$endpoint;
    }

    call(name: string, args?: any[] | object): Promise<any> {
        const Transport = this._$transport as IRpcTransportConstructor;
        const endpoint = this.getEndpoint();

        let methodName = name + '';
        const contractIncluded = methodName.indexOf(this._nameSpaceSeparator) > -1;
        if (!contractIncluded && endpoint.contract) {
            methodName = endpoint.contract + this._nameSpaceSeparator + methodName;
        }

        const useTimeout = !!this._$callTimeout;
        const transportOptions: IRpcTransportOptions = {
            serviceUrl: endpoint.address
        };
        if (useTimeout) {
            transportOptions.timeout = this._$callTimeout;
        }

        let result = new Transport(transportOptions).callMethod(methodName, args || {});

        if (useTimeout) {
            result = getTimedOutResponse(
                result,
                this._$callTimeout,
                methodName,
                endpoint.address,
                this._$logger
            );
        }

        return result;
    }
}

Object.assign(SbisBusinessLogic.prototype, {
    '[Types/_source/provider/SbisBusinessLogic]': true,
    _nameSpaceSeparator: '.'
});

register('Types/source:provider.SbisBusinessLogic', SbisBusinessLogic, {instantiate: false});
