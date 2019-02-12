/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/format/IntegerField'
], function(
   IntegerField
) {
   'use strict';

   IntegerField = IntegerField.default;

   describe('Types/_entity/format/IntegerField', function() {
      var field;

      beforeEach(function() {
         field = new IntegerField();
      });

      afterEach(function() {
         field = undefined;
      });

      describe('.getDefaultValue()', function() {
         it('should return 0 by default', function() {
            assert.strictEqual(field.getDefaultValue(), 0);
         });
      });
   });
});
