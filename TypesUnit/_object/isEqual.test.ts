import {assert} from 'chai';
import isEqual from 'Types/_object/isEqual';
import Record from 'Types/_entity/Record';

describe('Types/_object/isEqual', () => {
    it('should return true for nulls', () => {
        assert.isTrue(isEqual(null, null));
    });

    it('should return true for booleans', () => {
        assert.isTrue(isEqual(false, false));
    });

    it('should return false for booleans', () => {
        assert.isFalse(isEqual(false, null));
        assert.isFalse(isEqual(true, false));
        assert.isFalse(isEqual(true, 1));
    });

    it('should return true for numbers', () => {
        assert.isTrue(isEqual(0, 0));
        assert.isTrue(isEqual(1, 1));
    });

    it('should return false for numbers', () => {
        assert.isFalse(isEqual(0, 1));
        assert.isFalse(isEqual(0, true));
    });

    it('should return true for strings', () => {
        assert.isTrue(isEqual('', ''));
        assert.isTrue(isEqual('a', 'a'));
    });

    it('should return false for strings', () => {
        assert.isFalse(isEqual('a', 'b'));
        assert.isFalse(isEqual('0', 0));
    });

    it('should return true for dates', () => {
        assert.isTrue(isEqual(new Date(1, 2, 3), new Date(1, 2, 3)));
    });

    it('should return false for dates', () => {
        assert.isFalse(isEqual(new Date(1, 2, 3), new Date(1, 2, 4)));
        assert.isFalse(isEqual(new Date(1, 2, 3), 1));
    });

    it('should return true for arrays', () => {
        assert.isTrue(isEqual([], []));
        assert.isTrue(isEqual([1, 2, '3'], [1, 2, '3']));
    });

    it('should return false for arrays', () => {
        assert.isFalse(isEqual([1, 2, '3'], [1, 2]));
        assert.isFalse(isEqual([1, 2, '3'], [1, 2, 3]));
    });

    it('should return true for objects', () => {
        assert.isTrue(isEqual({}, {}));
        assert.isTrue(isEqual({a: 1, b: '2'}, {a: 1, b: '2'}));
        assert.isTrue(isEqual({a: 1, b: '2'}, {b: '2', a: 1}));
    });

    it('should return false for objects', () => {
        assert.isFalse(isEqual({a: 1, b: '2'}, {a: 1, b: 2}));
    });

    it('should return true for objects with dates', () => {
        assert.isTrue(isEqual({a: new Date(1, 2, 3)}, {a: new Date(1, 2, 3)}));
    });

    it('should return false for objects with dates', () => {
        assert.isFalse(isEqual({a: new Date(1, 2, 3)}, {a: new Date(1, 2, 4)}));
    });

    it('should return true for the same objects implements IEquatable', () => {
        const recA = new Record({rawData: {}});
        const recB = new Record({rawData: {}});
        assert.isTrue(isEqual(recA, recB));
        assert.isTrue(isEqual(recB, recA));
    });

    it('should return false for not the same objects implements IEquatable', () => {
        const recA = new Record({rawData: {}});
        const recB = new Record({rawData: {foo: 'bar'}});
        assert.isFalse(isEqual(recA, recB));
        assert.isFalse(isEqual(recB, recA));
    });

    it('should return false for mix of objects when some of them implements IEquatable', () => {
        const recA = new Record({rawData: {}});
        const recB = {};
        assert.isFalse(isEqual(recA, recB));
        assert.isFalse(isEqual(recB, recA));
    });

    it('should return true for not plain objects', () => {
        const Foo = () => {/**/};
        Foo.prototype = Object.create(Object.prototype);
        Foo.prototype.constructor = Foo;

        const fooA = new Foo();
        const fooB = fooA;

        assert.isTrue(isEqual(fooA, fooB));
    });

    it('should return false for not plain objects', () => {
        const Foo = () => {/**/};
        Foo.prototype = Object.create(Object.prototype);
        Foo.prototype.constructor = Foo;

        const fooA = new Foo();
        const fooB = new Foo();

        assert.isFalse(isEqual(fooA, fooB));
    });

    it('should return false when compare an empty object and a date', () => {
        assert.isFalse(isEqual({dt: {}}, {dt: new Date()}));
    });
});
