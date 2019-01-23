/* global define, describe, it, assert */
define([
   'Types/object'
], function (
   object
) {

   describe('Types/object.merge', function () {
      it('should merge two objects', function () {
         let origin = {
            a: 1
         };
         let ext = {
            b: 1
         };
         object.merge(origin, ext);
         assert.deepEqual(origin, {a: 1, b: 1});
      });

      it('should replace value in the same fields', function () {
         let origin = {
            a: 1
         };
         let ext = {
            a: 2
         };
         object.merge(origin, ext);
         assert.equal(origin.a, 2);
      });

      it('should merge two objects recursive', function () {
         let origin = {
            a: {
               b: 1
            }
         };
         let ext = {
            a: {
               c: 2
            }
         };
         object.merge(origin, ext);
         assert.deepEqual(origin, {a: {b: 1, c: 2}});
      });

      it('should merge arrays', function () {
         let origin = ['one', 'two'];
         let ext = ['uno'];
         object.merge(origin, ext);
         assert.deepEqual(origin, ['uno', 'two']);
      });

      it('should merge array in object', function () {
         let origin = {foo: [1, 2, 3, 4]};
         let ext = {foo: [5, 4]};
         object.merge(origin, ext);
         assert.deepEqual(origin, {foo: [5, 4, 3, 4]});
      });

      it('should merge Dates', function () {
         var soThen = new Date(0);
         var soNow = new Date();
         let origin = {
            then: soThen,
            now: new Date()
         };
         let ext = {now: soNow};
         let result = object.merge({}, origin, ext);
         assert.deepEqual(result, {
            then: soThen,
            now: soNow
         });
      });
   });
});
