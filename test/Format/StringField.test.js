/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/format/StringField'
], function(
   StringField
) {
   'use strict';

   StringField = StringField.default;

   describe('Types/Format/StringField', function() {
      var field;

      beforeEach(function() {
         field = new StringField();
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
            assert.instanceOf(clone, StringField);
            assert.isTrue(field.isEqual(clone));
         });
      });
   });
});
