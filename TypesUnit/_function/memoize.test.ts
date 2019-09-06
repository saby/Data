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
});
