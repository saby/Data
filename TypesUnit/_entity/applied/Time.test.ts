import {assert} from 'chai';
import Time from 'Types/_entity/applied/Time';

describe('Types/_entity/applied/Time', () => {
    describe('.constructor()', () => {
        it('should create instance of Time', () => {
            const instance = new Time();
            assert.instanceOf(instance, Time);
        });
    });
});
