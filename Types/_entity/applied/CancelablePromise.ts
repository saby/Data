import {protect} from '../../util';

const $isCanceled = protect('isCanceled') as symbol;

export function PromiseCanceledError(message: string): void {
    this.isCanceled = true;
    this.name = 'PromiseCanceledError';
    this.message = message;
}
PromiseCanceledError.prototype = Object.create(Error.prototype);

/**
 * Обертка для функции Промис, которая позволяет разрешать её экземпляры, как отменённые.
 * @remark
 * В следующем примере сделаем экземпляр отмененным:
 * <pre>
 *     import {CancelablePromise} from 'Types/entity';
 *
 *     const promiseToDealWith = new Promise((resolve) => setTimeout(resolve, 1000));
 *
 *     // Сделаем отмененный Промис
 *     const cancelable = new CancelablePromise(promiseToDealWith);
 *
 *     // Посмотрим обёртку Промиса
 *     cancelable.promise
 *         .then(() => console.log('resolved'))
 *         .catch((err) => console.log('canceled', err.isCanceled, err.message));
 *
 *     // Отменим Промис
 *     cancelable.cancel('That\'s way too long');
 * </pre>
 * @class Types/_entity/applied/CancelablePromise
 * @public
 * @author Кудрявцев И.С.
 */

/*
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
 * @class Types/_entity/applied/CancelablePromise
 * @public
 * @author Кудрявцев И.С.
 */
export default class CancelablePromise<T> {
    readonly promise: Promise<T>;
    protected _chained: Promise<T | void>;

    constructor(origin: Promise<T>) {
        this.promise = new Promise((resolve, reject) => {
            this._chained = origin.then((result) =>
                this[$isCanceled] ? reject(this[$isCanceled]) : resolve(result)
            ).catch((error) =>
                this[$isCanceled] ? reject(this[$isCanceled]) : reject(error)
            );
        });
    }

    cancel(reason?: string): void {
        this[$isCanceled] = new PromiseCanceledError(reason || 'Unknown reason');
    }
}
