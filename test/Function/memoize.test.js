/* global define, describe, it, assert */
define([
   'Types/function'
], function (
   functionUtil
) {
   'use strict';

   describe('Types/function.memoize', function() {
      it('should save result of the function', () => {
         let value = 1;
         const decorator = functionUtil.memoize(() => {
            return ++value;
         });
         assert.equal(decorator(), decorator());
      });
      it('should save result of the function', () => {
         let value = 1;
         const decorator = functionUtil.memoize(() => {
            return ++value;
         });
         assert.equal(decorator(), 2);
         assert.equal(decorator(1), 3);
      });
   });
});
