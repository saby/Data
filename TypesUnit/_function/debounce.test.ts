import {assert} from 'chai';
import * as sinon from 'sinon';
import debounce from 'Types/_function/debounce';

describe('Types/_formatter/debounce', () => {
    let stubTimeout;
    let stubClear;
    const global = (function(): any {
        // tslint:disable-next-line:ban-comma-operator
        return this || (0, eval)('this');
    })();

    beforeEach(() => {
        stubTimeout = sinon.stub(global, 'setTimeout').callsFake((callback) => callback());
        stubClear = sinon.stub(global, 'clearTimeout').callsFake(() => {
           // void
        });
    });

    afterEach(() => {
        stubTimeout.restore();
        stubClear.restore();
    });

    it('should call method with given arguments later', () => {
        let given;
        const decorator = debounce((...args) => given = args, 10, true);
        const expected = ['a', 'b', 'c'];

        decorator(...expected);
        assert.equal(stubTimeout.getCall(0).args[1], 10);
        assert.deepEqual(given, expected);
    });

    it('should immediately call method with given arguments', () => {
        let given;
        const decorator = debounce((...args) => given = args, 10, true);
        const expected = ['a', 'b', 'c'];

        decorator(...expected);
        assert.deepEqual(given, expected);
    });

    it('should call method once', () => {
        let value = 0;
        const decorator = debounce(() => value++, 10);

        decorator();
        assert.equal(value, 1);
    });

    it('should call method twice if argument "first" is true', () => {
        let value = 0;
        const decorator = debounce(() => value++, 10, true);
        decorator();
        assert.equal(value, 2);
    });

    it('should call method 4 times in 2 series if argument "first" is true', () => {
        let value = 0;
        const decorator = debounce(() => value++, 10, true);

        decorator();
        decorator();
        assert.equal(value, 4);
    });
});
