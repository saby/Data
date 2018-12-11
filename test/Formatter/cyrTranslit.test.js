/* global define, describe, it, assert */
define([
   'Types/formatter',
], function(
   formatter,
) {
   'use strict';

   describe('Types/formatter.cyrTranslit', function() {
      it('should write phrase in translite', function() {
         assert.equal('Privet_mir', formatter.cyrTranslit('Привет мир'));
      });
   });
});
