import {assert} from 'chai';
import merge from 'Types/_object/merge';

describe('Types/_object/merge', () => {
    it('should merge two objects', () => {
        const origin = {
            a: 1
        };
        const ext = {
            b: 1
        };
        assert.deepEqual(merge(origin, ext), {a: 1, b: 1});
    });

    it('should replace value in the same fields', () => {
        const origin = {
            a: 1
        };
        const ext = {
            a: 2
        };
        merge(origin, ext);
        assert.equal(origin.a, 2);
    });

    it('should merge two objects recursive', () => {
        const origin = {
            a: {
                b: 1,
                c: 2
            }
        };
        const ext = {
            a: {
                c: 3
            }
        };
        merge(origin, ext);
        assert.deepEqual(origin, {a: {b: 1, c: 3}});
    });

    it('should replace primitive with object', () => {
        const origin: any = {
            a: 1
        };
        const ext = {
            a: {
                b: 2
            }
        };
        merge(origin, ext);
        assert.deepEqual(origin, {a: {b: 2}});
    });

    it('should merge arrays', () => {
        const origin = ['one', 'two'];
        const ext = ['uno'];
        merge(origin, ext);
        assert.deepEqual(origin, ['uno', 'two']);
    });

    it('should merge array in object', () => {
        const origin = {foo: [1, 2, 3, 4]};
        const ext = {foo: [5, 4]};
        merge(origin, ext);
        assert.deepEqual(origin, {foo: [5, 4, 3, 4]});
    });

    it('should merge Dates', () => {
        const soThen = new Date(0);
        const soNow = new Date(1);

        const origin: object = {
            then: soThen,
            now: new Date(2)
        };
        const ext: object = {now: soNow};

        const result = merge({}, origin, ext);
        assert.deepEqual(result, {
            then: soThen,
            now: soNow
        });
    });

    it('should prevent endless recursiion', () => {
        const repeat = {
            a: {
                b: null
            }
        };
        repeat.a.b = repeat;

        const result = merge({
            a: {
                b: {
                    a: {}
                }
            }
        }, repeat);
        assert.strictEqual(result.a.b.a, repeat.a);
    });
});
