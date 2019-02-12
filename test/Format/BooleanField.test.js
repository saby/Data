/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/format/BooleanField'
], function(
   BooleanField
) {
   'use strict';

   BooleanField = BooleanField.default;

   describe('Types/_entity/format/BooleanField', function() {
      var field;

      beforeEach(function() {
         field = new BooleanField();
      });

      afterEach(function() {
         field = undefined;
      });

      describe('.getDefaultValue()', function() {
         it('should return null by default', function() {
            assert.isNull(field.getDefaultValue());
         });
      });
   });
});
