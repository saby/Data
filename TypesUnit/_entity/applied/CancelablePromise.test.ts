import {assert} from 'chai';
import CancelablePromise, {PromiseCanceledError} from 'Types/_entity/applied/CancelablePromise';

describe('Types/_entity/applied/CancelablePromise', () => {
    describe('promise', () => {
        it('should return instance of Promise', () => {
            const origin = new Promise((resolve) => resolve());
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
    });

    describe('.cancel()', () => {
        it('should cancel resolved promise with PromiseCanceledError', () => {
            const origin = new Promise((resolve) => resolve());
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
            const origin = new Promise((resolve) => resolve());
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
