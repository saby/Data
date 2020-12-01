import IAbstract from './IAbstract';
import { EntityMarker } from '../../_declarations';
import {ICacheParameters, IOptions as IOptionsRemote, IProviderOptions} from '../Remote';
import 'Core/polyfill/PromiseAPIDeferred';

interface ITransportOptions {
    method: string;
    headers?: {
        [name: string]: string
    };
    body?: string;
}

type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE';

export type IHttpMethodBinding = {
    [name in keyof IOptionsRemote['binding']]: HttpMethod;
};

export interface IOptions extends IProviderOptions {
    transport?: typeof fetch;
    httpMethodBinding?: IHttpMethodBinding;
}

class Https implements IAbstract {
    readonly '[Types/_source/provider/IAbstract]': EntityMarker = true;

    protected _baseUrl: string;

    protected _transport: typeof fetch;

    protected _httpMethodBinding: IHttpMethodBinding = {
        create: 'POST',
        read: 'GET',
        update: 'POST',
        destroy: 'POST',
        query: 'POST',
        copy: 'POST',
        merge: 'POST',
        move: 'POST'
    }

    constructor(options: IOptions) {
        this._transport = options.transport || fetch;

        if (typeof options.httpMethodBinding === 'object') {
            this._httpMethodBinding = {...this._httpMethodBinding, ...options.httpMethodBinding};
        }

        this._baseUrl = options.endpoint.address;

        if (options.endpoint.contract) {
            this._baseUrl += `/${options.endpoint.contract}`;
        }
    }

    protected getTransportOptions(method: string, args: object = {}): ITransportOptions {
        return {
            method,
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: method === 'GET' ? undefined : JSON.stringify(args)
        };
    }

    protected buildUrl(name: string, arg?: object): string {
        const path = `${this._baseUrl}/${name}`;

        if (arg && Object.keys(arg).length) {
            const parameters = [];

            for (const key of Object.keys(arg)) {
                if (typeof arg[key] !== 'undefined') {
                    parameters.push(`${key}=${JSON.stringify(arg[key])}`);
                }
            }

            return encodeURI(`${path}?${parameters.join('&')}`);
        }

        return path;
    }

    call<T>(name: string, args: object, cache?: ICacheParameters, method?: string): Promise<T> {
        const httpMethod = method || this._httpMethodBinding[name];
        const url = httpMethod === 'GET' ? this.buildUrl(name, args) : this.buildUrl(name);

        return new Promise<T>((resolve, reject) => {
            this._transport(url, this.getTransportOptions(httpMethod, args)).then((response) => {
                if (response.ok) {
                    response.json().then(resolve).catch(reject);
                } else {
                    reject("Error HTTP: " + response.status);
                }
            }).catch(reject);
        });
    };
}

export default Https;
