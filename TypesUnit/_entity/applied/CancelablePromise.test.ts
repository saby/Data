import {assert} from 'chai';
import CancelablePromise, {PromiseCanceledError} from 'Types/_entity/applied/CancelablePromise';

class TransparentCancelablePromise<T> extends CancelablePromise<T> {
    get chained(): Promise<T | void> {
        return this._chained;
    }
}

describe('Types/_entity/applied/CancelablePromise', () => {
    describe('PromiseCanceledError', () => {
        const message = 'test-message';
        const instance = new PromiseCanceledError(message);

        it('extends Error', () => {
            assert.instanceOf(instance, Error);
        });

        it('sets message in constructor', () => {
            assert.strictEqual(instance.message, message);
        });

        it('isCanceled is true', () => {
            assert.isTrue(instance.isCanceled);
        });
    });

    describe('promise', () => {
        it('should return instance of Promise', () => {
            const origin = new Promise<void>((resolve) => resolve());
            const instance = new CancelablePromise(origin);
            assert.instanceOf(instance.promise, Promise);
        });

        it('should proceed resolved promise', () => {
            const origin = new Promise((resolve) => resolve('ok'));
            const instance = new CancelablePromise(origin);
            return instance.promise.then((result) => {
                assert.equal(result, 'ok');
            });
        });

        it('should proceed rejected promise', () => {
            const origin = new Promise((resolve, reject) => reject('fail'));
            const instance = new CancelablePromise(origin);
            return instance.promise.then((result) => {
                throw new Error('Shouldn\'t get here');
            }).catch((err) => {
                assert.equal(err, 'fail');
            });
        });

        it('should catch a rejection in original chain', () => {
            const origin = new Promise((resolve, reject) => reject(new Error('fail')));
            const instance = new TransparentCancelablePromise(origin);
            return instance.chained;
        });
    });

    describe('.cancel()', () => {
        it('should cancel resolved promise with PromiseCanceledError', () => {
            const origin = new Promise<void>((resolve) => resolve());
            const instance = new CancelablePromise(origin);
            instance.cancel();
            return instance.promise.then(() => {
                throw new Error('Shouldn\'t get here');
            }).catch((err) => {
                assert.instanceOf(err, PromiseCanceledError);
                assert.isTrue(err.isCanceled);
            });
        });

        it('should cancel resolved promise with given reason', () => {
            const origin = new Promise<void>((resolve) => resolve());
            const instance = new CancelablePromise(origin);
            instance.cancel('Something wrong');
            return instance.promise.then(() => {
                throw new Error('Shouldn\'t get here');
            }).catch((err) => {
                assert.equal(err.message, 'Something wrong');
            });
        });

        it('should cancel rejected promise with PromiseCanceledError', () => {
            const origin = new Promise((resolve, reject) => reject());
            const instance = new CancelablePromise(origin);
            instance.cancel();
            return instance.promise.then(() => {
                throw new Error('Shouldn\'t get here');
            }).catch((err) => {
                assert.instanceOf(err, PromiseCanceledError);
                assert.isTrue(err.isCanceled);
            });
        });
    });
});
