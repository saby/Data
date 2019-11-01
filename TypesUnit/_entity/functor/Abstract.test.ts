import {assert} from 'chai';
import Abstract from 'Types/_entity/functor/Abstract';

describe('Types/_entity/functor/Abstract', () => {
    describe('.constructor()', () => {
        it('should return Abstract functor', () => {
            const functor = new Abstract(() => undefined);
            assert.instanceOf(functor, Function);
            assert.isTrue(Abstract.isFunctor(functor));
        });
    });

    describe('::create()', () => {
        it('should return Abstract functor', () => {
            const functor = Abstract.create(() => undefined);
            assert.instanceOf(functor, Function);
            assert.isTrue(Abstract.isFunctor(functor));
        });

        it('should return a callable functor', () => {
            const given = {a: undefined, b: undefined};
            const expect = {
                a: 'foo',
                b: 'bar'
            };
            const functor = Abstract.create((a, b) => {
                given.a = a;
                given.b = b;
                return a + b;
            });

            const result = functor('foo', 'bar');
            assert.equal(result, 'foo' + 'bar');
            assert.equal(given.a, expect.a);
            assert.equal(given.b, expect.b);
        });

        it('should throw TypeError on invalid arguments', () => {
            let instance;

            assert.throws(() => {
                instance = Abstract.create(undefined);
            }, TypeError);

            assert.throws(() => {
                instance = Abstract.create([]);
            }, TypeError);

            assert.throws(() => {
                instance = Abstract.create({});
            }, TypeError);

            assert.isUndefined(instance);
        });
    });

    describe('::isFunctor()', () => {
        it('should return true for Abstract functor', () => {
            const functor = new Abstract(() => undefined);
            assert.isTrue(Abstract.isFunctor(functor));
        });

        it('should return false for not a Functor', () => {
            assert.isFalse(Abstract.isFunctor(() => undefined));
        });
    });
});
