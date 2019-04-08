/* global define, describe, it, assert */
define([
   'Types/function'
], function (
   functionUtil
) {
   'use strict';

   describe('Types/_formatter/debounce', function() {
      it('should call method only one time', function (done) {
         let value = 1;
         const decorator = functionUtil.debounce(() => {
            value += 1;
         }, 0);
         decorator();
         decorator();
         setTimeout(() => {
            assert.equal(value, 2);
            done();
         }, 150);
      });
   });
});
