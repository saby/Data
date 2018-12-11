/* global define, describe, it, assert */
define([
   'Types/object'
], function (
   objectUtils
) {
   let isEqual = objectUtils.isEqual;
   describe('Core/helpers/Object/isEqual', function () {
      it('should return true for nulls', function () {
         assert.isTrue(isEqual(null, null));
      });

      it('should return true for booleans', function () {
         assert.isTrue(isEqual(false, false));
      });

      it('should return false for booleans', function () {
         assert.isFalse(isEqual(false, null));
         assert.isFalse(isEqual(true, false));
         assert.isFalse(isEqual(true, 1));
      });

      it('should return true for numbers', function () {
         assert.isTrue(isEqual(0, 0));
         assert.isTrue(isEqual(1, 1));
      });

      it('should return false for numbers', function () {
         assert.isFalse(isEqual(0, 1));
         assert.isFalse(isEqual(0, true));
      });

      it('should return true for strings', function () {
         assert.isTrue(isEqual('', ''));
         assert.isTrue(isEqual('a', 'a'));
      });

      it('should return false for strings', function () {
         assert.isFalse(isEqual('a', 'b'));
         assert.isFalse(isEqual('0', 0));
      });

      it('should return true for dates', function () {
         assert.isTrue(isEqual(new Date(1, 2, 3), new Date(1, 2, 3)));
      });

      it('should return false for dates', function () {
         assert.isFalse(isEqual(new Date(1, 2, 3), new Date(1, 2, 4)));
         assert.isFalse(isEqual(new Date(1, 2, 3), 1));
      });

      it('should return true for arrays', function () {
         assert.isTrue(isEqual([], []));
         assert.isTrue(isEqual([1, 2, '3'], [1, 2, '3']));
      });

      it('should return false for arrays', function () {
         assert.isFalse(isEqual([1, 2, '3'], [1, 2]));
         assert.isFalse(isEqual([1, 2, '3'], [1, 2, 3]));
      });

      it('should return true for objects', function () {
         assert.isTrue(isEqual({}, {}));
         assert.isTrue(isEqual({a: 1, b: '2'}, {a: 1, b: '2'}));
         assert.isTrue(isEqual({a: 1, b: '2'}, {b: '2', a: 1}));
      });

      it('should return false for objects', function () {
         assert.isFalse(isEqual({a: 1, b: '2'}, {a: 1, b: 2}));
      });

      it('should return true for objects with dates', function () {
         assert.isTrue(isEqual({a: new Date(1, 2, 3)}, {a: new Date(1, 2, 3)}));
      });

      it('should return false for objects with dates', function () {
         assert.isFalse(isEqual({a: new Date(1, 2, 3)}, {a: new Date(1, 2, 4)}));
      });

      it('should return true for not plain objects', function () {
         var Foo = function(){},
            fooA,
            fooB;
         Foo.prototype = Object.create(Object.prototype);
         Foo.prototype.constructor = Foo;

         fooA = new Foo();
         fooB = fooA;

         assert.isTrue(isEqual(fooA, fooB));
      });

      it('should return false for not plain objects', function () {
         var Foo = function(){},
            fooA,
            fooB;
         Foo.prototype = Object.create(Object.prototype);
         Foo.prototype.constructor = Foo;

         fooA = new Foo();
         fooB = new Foo();

         assert.isFalse(isEqual(fooA, fooB));
      });

      it('should return false when compare an empty object and a date', function () {
         assert.isFalse(isEqual({dt: {}}, {dt: new Date()}));
      });
   });
});
