import IAbstract from './IAbstract';
import { OptionsToPropertyMixin } from '../../entity';
import { logger as defaultLogger, ILogger } from '../../util';
import { constants } from 'Env/Env';
import { ICacheParameters } from '../Remote';
import { EntityMarker, IDeferred } from '../../_declarations';

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
    callMethod<T>(
        method: string,
        args: unknown,
        recent?: boolean,
        protocol?: number,
        cache?: ICacheParameters
    ): Promise<T>;
    abort(): void;
}

export interface IRpcTransportOptions {
    serviceUrl: string;
    timeout?: number;
}

export type IRpcTransportConstructor = new(options: IRpcTransportOptions) => IRpcTransport;

// Default timeout to produce a call (in seconds)
const DEFAULT_CALL_TIMEOUT: number = constants.isServerSide ? 5000 : 0;

// Module name with default transport constructor
const DEFAULT_TRANSPORT_MODULE = 'Browser/Transport';

// Default transport constructor
let defaultTransportConstructor: IRpcTransportConstructor;

function throwError(err: Error, logger: ILogger): void {
    logger.info('Types/_source/provider/SbisBusinessLogic', err.message);
}

/**
 * Loads default transport implementation.
 * @param overrided Overrided implementation
 */
function getDefaultTransport(
    overrided: IRpcTransportConstructor
): IRpcTransportConstructor | Promise<IRpcTransportConstructor> {
    if (overrided) {
        return overrided;
    }

    if (defaultTransportConstructor) {
        return defaultTransportConstructor;
    }

    // Go with sync require on server side
    if (constants.isServerSide) {
        const {RPCJSON} = requirejs(DEFAULT_TRANSPORT_MODULE);
        defaultTransportConstructor = RPCJSON;
        return RPCJSON;
    }

    // Otherwise go with async require
    return import(DEFAULT_TRANSPORT_MODULE).then(({RPCJSON}) => {
        defaultTransportConstructor = RPCJSON;
        return RPCJSON;
    });
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
    origin: Promise<T> | IDeferred<T>,
    timeout: number,
    methodName: string,
    address: string,
    logger: ILogger
): Promise<T> {
    const itsPromise = !(origin as IDeferred<T>).isReady;
    const timeoutError = `Timeout of ${timeout} ms had expired before the method '${methodName}' at '${address}' returned any results`;
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
    }, timeout);

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

    (origin as IDeferred<T>).addCallbacks((result) => {
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
    readonly '[Types/_source/provider/IAbstract]': EntityMarker = true;

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
    protected _$transport: IRpcTransportConstructor;

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

    call<T>(name: string, args?: unknown[] | object, cache?: ICacheParameters): Promise<T> {
        const invoke = <TInvokeResult>(Transport: IRpcTransportConstructor): Promise<TInvokeResult> => {
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

            let result = new Transport(transportOptions).callMethod<TInvokeResult>(
                methodName,
                args || {},
                undefined,
                undefined,
                cache
            );

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
        };

        const transport = getDefaultTransport(this._$transport);
        if (transport instanceof Promise) {
            return transport.then<T>(invoke);
        }

        return invoke<T>(transport);
    }
}

Object.assign(SbisBusinessLogic.prototype, {
    '[Types/_source/provider/SbisBusinessLogic]': true,
    _$transport: null,
    _nameSpaceSeparator: '.'
});
