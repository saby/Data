import {assert} from 'chai';
import Track from 'Types/_entity/functor/Track';

describe('Types/_entity/functor/Track', () => {
    describe('::create()', () => {
        it('should return Track functor', () => {
            const functor = Track.create(() => undefined);
            assert.isTrue(Track.isFunctor(functor));
        });

        it('should return a functor with given propertyName', () => {
            const functor = Track.create(() => undefined, 'foo');
            assert.deepEqual(functor.propertyName, 'foo');
        });
    });

    describe('::isFunctor()', () => {
        it('should return true for Track functor', () => {
            const functor = Track.create(() => undefined);
            assert.isTrue(Track.isFunctor(functor));
        });
    });
});
