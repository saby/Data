import {assert} from 'chai';
import throttle from 'Types/_function/throttle';

describe('Types/_formatter/throttle', () => {
    it('should call method only one time', (done) => {
        let value = 1;
        const decorator = throttle(() => {
            value += 1;
        }, 0);
        decorator();
        decorator();
        setTimeout(() => {
            assert.equal(value, 2);
            done();
        }, 150);
    });
});
