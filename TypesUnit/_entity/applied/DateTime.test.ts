import {assert} from 'chai';
import DateTime from 'Types/_entity/applied/DateTime';
import {global} from 'Types/util';

describe('Types/_entity/applied/DateTime', () => {
    describe('.constructor()', () => {
        it('should create instance of Date', () => {
            const instance = new DateTime();
            assert.instanceOf(instance, Date);
        });
    });

    describe('.withoutTimeZone', () => {
        it('should return false by default', () => {
            const instance = new DateTime();
            assert.isFalse(instance.withoutTimeZone);
        });

        it('should get the value from constructor argument', () => {
            const instanceA = new DateTime(true);
            assert.isTrue(instanceA.withoutTimeZone);

            const instanceB = new DateTime(new Date(), true);
            assert.isTrue(instanceB.withoutTimeZone);

            const instanceC = new DateTime(2020, 6, 21, true);
            assert.isTrue(instanceC.withoutTimeZone);
        });
    });

    describe('.toJSON()', () => {
        it('should save milliseconds into $options', () => {
            const instance = new DateTime();
            const time = instance.getTime();
            const serialized = instance.toJSON();

            assert.equal(serialized.state.$options, time);
        });

        it('should save withoutTimeZone flag into state', () => {
            const instance = new DateTime(true);
            const serialized = instance.toJSON();

            assert.isTrue(serialized.state.withoutTimeZone);
        });
    });

    describe('::fromJSON()', () => {
        it('should create date from $options', () => {
            const time = 1234567890;
            const instance = DateTime.fromJSON({
                $serialized$: 'inst',
                module: '',
                id: 0,
                state: {
                    $options: time
                }
            });

            assert.equal(instance.getTime(), time);
        });

        it('should create date with withoutTimeZone flag', () => {
            const instance = DateTime.fromJSON({
                $serialized$: 'inst',
                module: '',
                id: 0,
                state: {
                    withoutTimeZone: true
                }
            });

            assert.isTrue(instance.withoutTimeZone);
        });
    });

    describe('::getClientTimezoneOffset()', () => {
        it('should return local time zone by default', () => {
            const offset = DateTime.getClientTimezoneOffset();
            const now = new Date();

            assert.strictEqual(offset, now.getTimezoneOffset());
        });

        it('should return time zone from cookie on SSR environment', () => {
            const process = global.process;

            const tz = 123;
            global.process = {
                domain: {
                    req: {
                        cookies: {tz}
                    }
                }
            };
            const offset = DateTime.getClientTimezoneOffset();

            global.process = process;

            assert.strictEqual(offset, tz);
        });
    });
});
