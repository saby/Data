/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/format/StringField'
], function(
   StringField
) {
   'use strict';

   StringField = StringField.default;

   describe('Types/_entity/format/StringField', function() {
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
   });
});
