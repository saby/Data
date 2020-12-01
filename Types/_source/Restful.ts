import Remote, { IOptions as IOptionsRemote, IProviderOptions } from './Remote';
import ICrud from './ICrud';
import ICrudPlus from './ICrudPlus';
import {IAbstract, Https, IHttpMethodBinding, IHttpOptions} from './provider';

interface IOptions extends IOptionsRemote {
    httpMethodBinding?: IHttpMethodBinding;
}

class Restful extends Remote implements ICrud, ICrudPlus {
    protected _$provider: IAbstract | string;

    protected _$httpMethodBinding: IHttpMethodBinding;

    constructor(options: IOptions) {
        super(options);
    }

    protected _createProvider(provider: IAbstract | string, options: IProviderOptions): IAbstract {
        return new Https({...this.providerOptions, ...options});
    }

    get providerOptions(): IHttpOptions {
        return {
            httpMethodBinding: this._$httpMethodBinding
        }
    }

    invoke<T>(name: string, method: string, args: object): Promise<T> {
        return this.getProvider().call(name, args, undefined, method);
    }
}

export default Restful;
