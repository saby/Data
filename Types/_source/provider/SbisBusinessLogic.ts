import IAbstract from './IAbstract';
import {OptionsToPropertyMixin} from '../../entity';
import {register} from '../../di';
import {logger as defaultLogger, ILogger} from '../../util';
import {RPCJSON} from 'Browser/Transport';
import {constants} from 'Env/Env';
import Deferred = require('Core/Deferred');

interface IEndPoint {
    contract?: string;
    address?: string;
}

interface IOptions {
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
}

export type IRpcTransportConstructor = new(options: IRpcTransportOptions) => IRpcTransport;

// Default timeout to produce a call (in seconds)
const DEFAULT_CALL_TIMEOUT: number = constants.isServerSide ? 5 : 0;

function throwError(err: Error, logger: ILogger): void {
    logger.error('Types/_source/provider/SbisBusinessLogic', err);
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
    let result = origin;
    const itsPromise = !(origin as Deferred<T>).isReady;
    const timeoutMs = 1000 * timeout;
    const timeoutError = new Error(
        `Timeout of ${timeout} seconds had expired before the method '${methodName}' at '${address}' returned any results`
    );

    if (itsPromise) {
        result = new Promise((resolve, reject) => {
            let gotTheResult = false;
            origin.then((response) => {
                gotTheResult = true;
                resolve(response);
            }).catch((err) => {
                gotTheResult = true;
                reject(err);
            });

            setTimeout(() => {
                if (!gotTheResult) {
                    throwError(timeoutError, logger);
                }
            }, timeoutMs);
        });
    } else {
        setTimeout(() => {
            if (!(origin as Deferred<T>).isReady()) {
                throwError(timeoutError, logger);
            }
        }, timeoutMs);
    }

    return result;
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

        let result = new Transport({
            serviceUrl: endpoint.address
        }).callMethod(methodName, args || {}) as any;

        if (result && this._$callTimeout) {
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
