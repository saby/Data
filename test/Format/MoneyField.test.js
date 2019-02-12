/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/format/MoneyField'
], function(
   MoneyField
) {
   'use strict';

   MoneyField = MoneyField.default;

   describe('Types/_entity/format/MoneyField', function() {
      var field;

      beforeEach(function() {
         field = new MoneyField();
      });

      afterEach(function() {
         field = undefined;
      });

      describe('.getPrecision()', function() {
         it('should return 2 by default', function() {
            assert.strictEqual(field.getPrecision(), 2);
         });
      });

      describe('.isLarge()', function() {
         it('should return false by default', function() {
            assert.isFalse(field.isLarge());
         });

         it('should return the value passed to the constructor', function() {
            var field = new MoneyField({
               large: true
            });
            assert.isTrue(field.isLarge());
         });
      });
   });
});
