/* global define, describe, it, assert */
define([
   'Types/_formatter/cyrTranslit',
], function(
   cyrTranslit,
) {
   'use strict';

   describe('Types/_formatter/cyrTranslit', function() {
      it('should write phrase in translite', function() {
         assert.equal('Privet_mir', cyrTranslit.default('Привет мир'));
      });
   });
});
