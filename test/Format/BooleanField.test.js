/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/format/BooleanField'
], function(
   BooleanField
) {
   'use strict';

   BooleanField = BooleanField.default;

   describe('Types/Format/BooleanField', function() {
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

      describe('.clone()', function() {
         it('should return the clone', function() {
            var clone = field.clone();
            assert.instanceOf(clone, BooleanField);
            assert.isTrue(field.isEqual(clone));
         });
      });
   });
});
