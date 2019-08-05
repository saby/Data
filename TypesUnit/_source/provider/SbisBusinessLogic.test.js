/* global define, describe */
define([
   'Types/_source/provider/SbisBusinessLogic',
   './SbisBusinessLogic.case'
], function(
   SbisBusinessLogic,
   testCases
) {
   'use strict';

   describe('Types/_source/provider/SbisBusinessLogic', function() {
      testCases(SbisBusinessLogic.default);
   });
});
