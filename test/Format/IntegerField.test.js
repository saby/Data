/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/format/IntegerField'
], function(
   IntegerField
) {
   'use strict';

   IntegerField = IntegerField.default;

   describe('Types/Format/IntegerField', function() {
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

      describe('.clone()', function() {
         it('should return the clone', function() {
            var clone = field.clone();
            assert.instanceOf(clone, IntegerField);
            assert.isTrue(field.isEqual(clone));
         });
      });
   });
});
