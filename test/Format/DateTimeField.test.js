/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/format/DateTimeField'
], function(
   DateTimeField
) {
   'use strict';

   DateTimeField = DateTimeField.default;

   describe('Types/Format/DateTimeField', function() {
      var field;

      beforeEach(function() {
         field = new DateTimeField();
      });

      afterEach(function() {
         field = undefined;
      });

      describe('.getDefaultValue()', function() {
         it('should return null by default', function() {
            assert.isNull(field.getDefaultValue());
         });
      });

      describe('.isWithoutTimeZone()', function() {
         it('should return false by default', function() {
            assert.isFalse(field.isWithoutTimeZone());
         });

         it('should return value passed to the constructor', function() {
            var field = new DateTimeField({
               withoutTimeZone: true
            });
            assert.isTrue(field.isWithoutTimeZone());
         });
      });

      describe('.clone()', function() {
         it('should return the clone', function() {
            var clone = field.clone();
            assert.instanceOf(clone, DateTimeField);
            assert.isTrue(field.isEqual(clone));
         });
      });
   });
});
