import {assert} from 'chai';
import Time from 'Types/_entity/Time';

describe('Types/_entity/Time', () => {
    describe('.constructor()', () => {
        it('should create instance of Time', () => {
            const instance = new Time();
            assert.instanceOf(instance, Time);
        });
    });
});
