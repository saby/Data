import {assert} from 'chai';
import TheDate from 'Types/_entity/Date';

describe('Types/_entity/Date', () => {
    describe('.constructor()', () => {
        it('should create instance of Date', () => {
            const instance = new TheDate();
            assert.instanceOf(instance, TheDate);
        });
    });
});
