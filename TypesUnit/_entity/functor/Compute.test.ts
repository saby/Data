import {assert} from 'chai';
import Abstract from 'Types/_entity/functor/Abstract';
import Compute from 'Types/_entity/functor/Compute';

describe('Types/_entity/functor/Compute', () => {
    describe('::create()', () => {
        it('should return Compute functor', () => {
            const functor = Compute.create(() => undefined);
            assert.isTrue(Compute.isFunctor(functor));
        });

        it('should return a functor with given properties', () => {
            const functor = Compute.create(() => undefined, ['foo', 'bar']);
            assert.deepEqual(functor.properties, ['foo', 'bar']);
        });

        it('should throw TypeError on invalid arguments', () => {
            let instance;

            assert.throws(() => {
                instance = Compute.create(() => undefined, {} as any);
            }, TypeError);

            assert.isUndefined(instance);
        });
    });

    describe('::isFunctor()', () => {
        it('should return true for Compute functor', () => {
            const functor = Compute.create(() => undefined);
            assert.isTrue(Compute.isFunctor(functor));
        });

        it('should return false for not Compute functor', () => {
            const functor = Abstract.create(() => undefined);
            assert.isFalse(Compute.isFunctor(functor));
        });
    });
});
