import {assert} from 'chai';
import memoize from 'Types/_function/memoize';

describe('Types/_formatter/memoize', () => {
    it('should save result of the function', () => {
        let value = 1;
        const decorator = memoize(() => ++value);
        assert.equal(decorator(), decorator());
    });

    it('should save result of the function', () => {
        let value = 1;
        const decorator = memoize(() => ++value);
        assert.equal(decorator(), 2);
        assert.equal(decorator(1), 3);
    });

    it('should clear memoize for function and arguments', () => {
        let value = 1;
        const origin = () => ++value;
        const decorator = memoize(origin);
        decorator(1);
        memoize.clear(origin, 1);
        assert.equal(decorator(1), 3);
    });
});
