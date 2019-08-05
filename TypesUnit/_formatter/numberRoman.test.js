/* global define, describe, it, assert */
define([
   'Types/formatter',
], function(
   formatter,
) {
   'use strict';

   describe('Types/_formatter/numberRoman', function() {
      it('should format 5 in roman numerals', function() {
         assert.equal('V', formatter.numberRoman(5));
      });

      it('should format 1236 in roman numerals', function() {
         assert.equal('MCCXXXVI', formatter.numberRoman(1236));
      });
   });
});
