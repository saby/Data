/* global define, describe */
define([
   'Types/_source/SbisService',
   './SbisService.case'
], function(
   SbisService,
   testCases
) {
   describe('Types/Source/SbisService', function() {
      testCases(SbisService.default, 'Types/source:provider.SbisBusinessLogic');
   });
});
