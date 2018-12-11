/* global define, describe, it, assert */
define([
   'Types/object'
], function (
   objectUtils
) {

   describe('Types/object.merge', function () {
      it('should objectUtils.merge two objects', function () {
         let origin = {
            a: 1
         };
         let ext = {
            b: 1
         };
         objectUtils.merge(origin, ext);
         assert.deepEqual(origin, {a: 1, b: 1});
      });

      it('should replace value in the same fields', function () {
         let origin = {
            a: 1
         };
         let ext = {
            a: 2
         };
         objectUtils.merge(origin, ext);
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
         objectUtils.merge(origin, ext);
         assert.deepEqual(origin, {a: {b: 1, c: 2}});
      });

   });
});
