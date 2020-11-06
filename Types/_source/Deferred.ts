import { IDeferred, IDeferredConstructor } from '../_declarations';

export function getDeferredConstructor(): IDeferredConstructor {
    return requirejs.defined('Core/Deferred') ? requirejs('Core/Deferred') : null;
}

export function compatibleThen<T>(awaiter: Promise<T>, callback: Function, errback?: Function): Promise<T> {
    const Deferred = getDeferredConstructor();

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

    if ((awaiter as IDeferred<T>).cancel && !(result as IDeferred<T>).cancel) {
        (result as IDeferred<T>).cancel = () => {
            if ((awaiter as IDeferred<T>).cancel) {
                (awaiter as IDeferred<T>).cancel();
            }
        };
    }

    return result;
}

/**
 * Hides an async callback in call logs
 * @param callback Callback to hide
 */
export function skipLogExecutionTime<T = Function>(callback: T): T {
    const Deferred = getDeferredConstructor();

    if (!Deferred) {
        return callback;
    }

    return Deferred.skipLogExecutionTime(callback as unknown as Function) as unknown as T;
}

// tslint:disable-next-line:ban-comma-operator
const global = (0, eval)('this');
export const DeferredCanceledError = global.DeferredCanceledError;
