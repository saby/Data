import {assert} from 'chai';
import isEmpty from 'Types/_object/isEmpty';

describe('Types/_object/isEmpty', () => {
    it('should return true for empty object', () => {
        assert.isTrue(isEmpty({}));
    });

    it('should return false for not empty object', () => {
        assert.isFalse(isEmpty({foo: 'bar'}));
    });

    it('should return false for null', () => {
        assert.isFalse(isEmpty(false));
    });

    it('should return false for not an object', () => {
        assert.isFalse(isEmpty(undefined));
        assert.isFalse(isEmpty(false));
        assert.isFalse(isEmpty(true));
        assert.isFalse(isEmpty(0));
        assert.isFalse(isEmpty(1));
    });

    it('should return true for empty Map', () => {
        assert.isTrue(isEmpty(new Map()));
    });
});
