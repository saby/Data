/* global define, describe, it, assert */
define([
   'Types/function'
], function (
   functionUtil
) {
   'use strict';

   describe('Types/function.delay', function() {
      it('should call method', function (done) {
         functionUtil.delay(function () {
            done();
         }, 0)
      });
   });
});
