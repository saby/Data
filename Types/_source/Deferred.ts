import { IDeferred, IDeferredConstructor } from '../_declarations';

const Deferred: IDeferredConstructor = requirejs.defined('Core/Deferred') ? requirejs('Core/Deferred') : null;
export default Deferred;

export function compatibleThen<T>(awaiter: Promise<T>, callback: Function, errback?: Function): Promise<T> {
    if (Deferred && awaiter instanceof Deferred) {
        (awaiter as IDeferred<T>).addCallback(callback);
        if (errback) {
            (awaiter as IDeferred<T>).addErrback(errback);
        }
        return awaiter;
    }

    let result = awaiter.then(callback as (v: T) => T);
    if (errback) {
        result = result.catch(errback as (v: T) => T);
    }

    if (!(result as IDeferred<T>).cancel) {
        (result as IDeferred<T>).cancel = () => {
            if ((awaiter as IDeferred<T>).cancel) {
                (awaiter as IDeferred<T>).cancel();
            }
        };
    }

    return result;
}
