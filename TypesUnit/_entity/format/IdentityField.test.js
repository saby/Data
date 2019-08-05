/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/format/IdentityField'
], function(
   IdentityField
) {
   'use strict';

   IdentityField = IdentityField.default;

   describe('Types/_entity/format/IdentityField', function() {
      var field;

      beforeEach(function() {
         field = new IdentityField();
      });

      afterEach(function() {
         field = undefined;
      });

      describe('.getDefaultValue()', function() {
         it('should return 0 by default', function() {
            assert.deepEqual(field.getDefaultValue(), [null]);
         });
      });

      describe('.clone()', function() {
         it('should return the clone', function() {
            var clone = field.clone();
            assert.instanceOf(clone, IdentityField);
            assert.isTrue(field.isEqual(clone));
         });
      });
   });
});
