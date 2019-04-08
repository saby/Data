/* global define, beforeEach, afterEach, describe, context, it, assert */
define([
   'Types/_entity/format/EnumField'
], function(
   EnumField
) {
   'use strict';

   EnumField = EnumField.default;

   describe('Types/_entity/format/EnumField', function() {
      var field;

      beforeEach(function() {
         field = new EnumField();
      });

      afterEach(function() {
         field = undefined;
      });

      describe('.getType()', function() {
         it('should return "Enum" by default', function() {
            assert.strictEqual(field.getType(), 'Enum');
         });
      });
   });
}
);
