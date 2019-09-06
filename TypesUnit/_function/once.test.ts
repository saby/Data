import {assert} from 'chai';
import once from 'Types/_function/once';

describe('Types/_formatter/once', () => {
    it('should save result of the function', () => {
        let value = 1;
        const decorator = once(() => ++value);
        assert.equal(decorator(), decorator());
        assert.equal(value, 2);
    });
});
