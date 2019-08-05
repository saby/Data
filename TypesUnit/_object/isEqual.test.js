define(["require", "exports", "chai", "Types/_object/isEqual", "Types/_entity/Record"], function (require, exports, chai_1, isEqual_1, Record_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_object/isEqual', function () {
        it('should return true for nulls', function () {
            chai_1.assert.isTrue(isEqual_1.default(null, null));
        });
        it('should return true for booleans', function () {
            chai_1.assert.isTrue(isEqual_1.default(false, false));
        });
        it('should return false for booleans', function () {
            chai_1.assert.isFalse(isEqual_1.default(false, null));
            chai_1.assert.isFalse(isEqual_1.default(true, false));
            chai_1.assert.isFalse(isEqual_1.default(true, 1));
        });
        it('should return true for numbers', function () {
            chai_1.assert.isTrue(isEqual_1.default(0, 0));
            chai_1.assert.isTrue(isEqual_1.default(1, 1));
        });
        it('should return false for numbers', function () {
            chai_1.assert.isFalse(isEqual_1.default(0, 1));
            chai_1.assert.isFalse(isEqual_1.default(0, true));
        });
        it('should return true for strings', function () {
            chai_1.assert.isTrue(isEqual_1.default('', ''));
            chai_1.assert.isTrue(isEqual_1.default('a', 'a'));
        });
        it('should return false for strings', function () {
            chai_1.assert.isFalse(isEqual_1.default('a', 'b'));
            chai_1.assert.isFalse(isEqual_1.default('0', 0));
        });
        it('should return true for dates', function () {
            chai_1.assert.isTrue(isEqual_1.default(new Date(1, 2, 3), new Date(1, 2, 3)));
        });
        it('should return false for dates', function () {
            chai_1.assert.isFalse(isEqual_1.default(new Date(1, 2, 3), new Date(1, 2, 4)));
            chai_1.assert.isFalse(isEqual_1.default(new Date(1, 2, 3), 1));
        });
        it('should return true for arrays', function () {
            chai_1.assert.isTrue(isEqual_1.default([], []));
            chai_1.assert.isTrue(isEqual_1.default([1, 2, '3'], [1, 2, '3']));
        });
        it('should return false for arrays', function () {
            chai_1.assert.isFalse(isEqual_1.default([1, 2, '3'], [1, 2]));
            chai_1.assert.isFalse(isEqual_1.default([1, 2, '3'], [1, 2, 3]));
        });
        it('should return true for objects', function () {
            chai_1.assert.isTrue(isEqual_1.default({}, {}));
            chai_1.assert.isTrue(isEqual_1.default({ a: 1, b: '2' }, { a: 1, b: '2' }));
            chai_1.assert.isTrue(isEqual_1.default({ a: 1, b: '2' }, { b: '2', a: 1 }));
        });
        it('should return false for objects', function () {
            chai_1.assert.isFalse(isEqual_1.default({ a: 1, b: '2' }, { a: 1, b: 2 }));
        });
        it('should return true for objects with dates', function () {
            chai_1.assert.isTrue(isEqual_1.default({ a: new Date(1, 2, 3) }, { a: new Date(1, 2, 3) }));
        });
        it('should return false for objects with dates', function () {
            chai_1.assert.isFalse(isEqual_1.default({ a: new Date(1, 2, 3) }, { a: new Date(1, 2, 4) }));
        });
        it('should return true for the same objects implements IEquatable', function () {
            var recA = new Record_1.default({ rawData: {} });
            var recB = new Record_1.default({ rawData: {} });
            chai_1.assert.isTrue(isEqual_1.default(recA, recB));
            chai_1.assert.isTrue(isEqual_1.default(recB, recA));
        });
        it('should return false for not the same objects implements IEquatable', function () {
            var recA = new Record_1.default({ rawData: {} });
            var recB = new Record_1.default({ rawData: { foo: 'bar' } });
            chai_1.assert.isFalse(isEqual_1.default(recA, recB));
            chai_1.assert.isFalse(isEqual_1.default(recB, recA));
        });
        it('should return false for mix of objects when some of them implements IEquatable', function () {
            var recA = new Record_1.default({ rawData: {} });
            var recB = {};
            chai_1.assert.isFalse(isEqual_1.default(recA, recB));
            chai_1.assert.isFalse(isEqual_1.default(recB, recA));
        });
        it('should return true for not plain objects', function () {
            var Foo = function () { };
            Foo.prototype = Object.create(Object.prototype);
            Foo.prototype.constructor = Foo;
            var fooA = new Foo();
            var fooB = fooA;
            chai_1.assert.isTrue(isEqual_1.default(fooA, fooB));
        });
        it('should return false for not plain objects', function () {
            var Foo = function () { };
            Foo.prototype = Object.create(Object.prototype);
            Foo.prototype.constructor = Foo;
            var fooA = new Foo();
            var fooB = new Foo();
            chai_1.assert.isFalse(isEqual_1.default(fooA, fooB));
        });
        it('should return false when compare an empty object and a date', function () {
            chai_1.assert.isFalse(isEqual_1.default({ dt: {} }, { dt: new Date() }));
        });
    });
});
