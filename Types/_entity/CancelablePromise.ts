import {protect} from '../util';

const $isCanceled = protect('isCanceled') as symbol;

export function PromiseCanceledError(message: string): void {
    this.isCanceled = true;
    this.name = 'PromiseCanceledError';
    this.message = message;
}
PromiseCanceledError.prototype = Object.create(Error.prototype);

/**
 * Wrapper for Promise which makes it possible to treat promise instance as canceled.
 * @remark
 * Let's make the promise instance cancelable
 * <pre>
 *     import {CancelablePromise} from 'Types/entity';
 *
 *     const promiseToDealWith = new Promise((resolve) => setTimeout(resolve, 1000));
 *
 *     // Make cancelable promise
 *     const cancelable = new CancelablePromise(promiseToDealWith);
 *
 *     // Watch the promise wrapper
 *     cancelable.promise
 *         .then(() => console.log('resolved'))
 *         .catch((err) => console.log('canceled', err.isCanceled, err.message));
 *
 *     // Cancel the promise
 *     cancelable.cancel('That\'s way too long');
 * </pre>
 * @class Types/_entity/CancelablePromise
 * @public
 * @author Мальцев А.А.
 */
export default class CancelablePromise<T> {
    readonly promise: Promise<T>;

    constructor(origin: Promise<T>) {
        this.promise = new Promise((resolve, reject) => {
            origin.then((result) =>
                this[$isCanceled] ? reject(this[$isCanceled]) : resolve(result)
            );
            origin.catch((error) =>
                this[$isCanceled] ? reject(this[$isCanceled]) : reject(error)
            );
        });
    }

    cancel(reason?: string): void {
        this[$isCanceled] = new PromiseCanceledError(reason || 'Unknown reason');
    }
}
