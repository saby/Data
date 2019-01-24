/* global define, beforeEach, afterEach, describe, context, it, assert */
define([
   'Types/_entity/format/FlagsField'
], function(FlagsField) {
   'use strict';

   FlagsField = FlagsField.default;

   describe('Types/_entity/format/FlagsField', function() {
      var field;

      beforeEach(function() {
         field = new FlagsField();
      });

      afterEach(function() {
         field = undefined;
      });

      describe('.getType()', function() {
         it('should return "Flags" by default', function() {
            assert.strictEqual(field.getType(), 'Flags');
         });
      });
   });
}
);
