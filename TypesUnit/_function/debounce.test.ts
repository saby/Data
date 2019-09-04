import {assert} from 'chai';
import debounce from 'Types/_function/debounce';

describe('Types/_formatter/debounce', () => {
    function runIt(handler: Function, interval: number, timeout: number, callback: Function): void {
        const begin = Date.now();
        const intervalHandle = setInterval(() => {
            handler();
            if (Date.now() - begin > timeout) {
                clearInterval(intervalHandle);
                setTimeout(callback, 2 * interval);
            }
        }, interval);

    }

    it('should call method once', (done) => {
        let value = 0;
        const decorator = debounce(() => value++, 10);

        runIt(decorator, 5, 50, () => {
            assert.equal(value, 1);
            done();
        });
    });

    it('should call method twice if argument "first" is true', (done) => {
        let value = 0;
        const decorator = debounce(() => value++, 10, true);

        runIt(decorator, 5, 50, () => {
            assert.equal(value, 2);
            done();
        });
    });
});
