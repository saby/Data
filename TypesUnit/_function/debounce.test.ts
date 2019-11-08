import {assert} from 'chai';
import debounce from 'Types/_function/debounce';

describe('Types/_formatter/debounce', () => {
    function runIt<T>(
        handler: Function,
        args: T[],
        callback: Function,
        interval: number = 5,
        timeout: number = 10
    ): void {
        const begin = Date.now();
        const intervalHandle = setInterval(() => {
            handler(...args);
            if (Date.now() - begin > timeout) {
                clearInterval(intervalHandle);
                setTimeout(callback, 2 * interval);
            }
        }, interval);

    }

    it('should call method with given arguments later', (done) => {
        let given;
        const decorator = debounce((...args) => given = args, 10);
        const expected = ['a', 'b', 'c'];

        runIt(decorator, expected, () => {
            assert.deepEqual(given, expected);
            done();
        });
    });

    it('should immediately call method with given arguments', () => {
        let given;
        const decorator = debounce((...args) => given = args, 10, true);
        const expected = ['a', 'b', 'c'];

        decorator(...expected);
        assert.deepEqual(given, expected);
    });

    it('should call method once', (done) => {
        let value = 0;
        const decorator = debounce(() => value++, 10);

        runIt(decorator, [], () => {
            assert.equal(value, 1);
            done();
        });
    });

    it('should call method twice if argument "first" is true', (done) => {
        let value = 0;
        const decorator = debounce(() => value++, 10, true);

        runIt(decorator, [], () => {
            assert.equal(value, 2);
            done();
        });
    });

    it('should call method 4 times in 2 series if argument "first" is true', (done) => {
        let value = 0;
        const decorator = debounce(() => value++, 10, true);

        runIt(decorator, [], () => {
            runIt(decorator, [], () => {
                assert.equal(value, 4);
                done();
            });
        });
    });
});
