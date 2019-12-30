import IAbstract from './IAbstract';
import {OptionsToPropertyMixin} from '../../entity';
import {register} from '../../di';
import {ExtendPromise} from '../../_declarations';
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

/**
 * Returns promise which rejecting with error if origin doesn't return any result during specified timeout.
 * @param origin Origin promise
 * @param timeout Timeout to wait
 * @param methodName Called method name
 * @param address Called address
 */
function getTimedOutResponse<T>(
    origin: Promise<T> | Deferred<T>,
    timeout: number,
    methodName: string,
    address: string
): Promise<T> {
    let result = origin;
    const itsPromise = !(origin as Deferred<T>).isReady;
    const timeoutMs = 1000 * timeout;
    const timeoutError = new Error(
        `Timeout of ${timeout} seconds has expired earlier than call for method '${methodName}' at '${address}' has returned any results.`
    );

    if (itsPromise) {
        result = new Promise((resolve, reject) => {
            let originHasResult = false;
            origin.then((response) => {
                originHasResult = true;
                resolve(response);
            }).catch((err) => {
                originHasResult = true;
                reject(err);
            });

            setTimeout(() => {
                if (!originHasResult) {
                    reject(timeoutError);
                }
            }, timeoutMs);
        });
    } else {
        setTimeout(() => {
            if ((origin as Deferred<T>).isReady()) {
                (origin as Deferred<T>).errback(timeoutError);
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
    protected _$transport: IRpcTransportConstructor = RPCJSON;

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

    call(name: string, args?: any[] | object): ExtendPromise<any> {
        const Transport = this._$transport;
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
            result = getTimedOutResponse(result, this._$callTimeout, methodName, endpoint.address);
        }

        return result;
    }
}

Object.assign(SbisBusinessLogic.prototype, {
    '[Types/_source/provider/SbisBusinessLogic]': true,
    _nameSpaceSeparator: '.'
});

register('Types/source:provider.SbisBusinessLogic', SbisBusinessLogic, {instantiate: false});
