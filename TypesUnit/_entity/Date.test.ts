import {assert} from 'chai';
import TheDate from 'Types/_entity/Date';

describe('Types/_entity/Date', () => {
    describe('.constructor()', () => {
        it('should create instance of Date', () => {
            const instance = new TheDate();
            assert.instanceOf(instance, TheDate);
        });

        it('should create instance with zero time', () => {
            const instance = new TheDate();
            assert.strictEqual(instance.getHours(), 0);
            assert.strictEqual(instance.getMinutes(), 0);
            assert.strictEqual(instance.getSeconds(), 0);
            assert.strictEqual(instance.getMilliseconds(), 0);
        });
    });

    describe('.toJSON()', () => {
        it('should serialize in custom format', () => {
            const instance = new TheDate(2019, 11, 21);
            assert.deepEqual(instance.toJSON().state, {
                $options: 'ISO:2019-12-21'
            });
        });
    });

    describe('::fromJSON()', () => {
        it('should create date from custom format', () => {
            const instance = TheDate.fromJSON({
                $serialized$: 'inst',
                module: '',
                id: 0,
                state: {
                    $options: 'ISO:2019-12-21'
                }
            });

            assert.equal(instance.getFullYear(), 2019);
            assert.equal(instance.getMonth(), 11);
            assert.equal(instance.getDate(), 21);
        });
    });
});
