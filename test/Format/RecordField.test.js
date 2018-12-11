/* global define, beforeEach, afterEach, describe, context, it, assert */
define([
   'Types/_entity/format/RecordField'
], function(RecordField) {
   'use strict';

   RecordField = RecordField.default;

   describe('Types/Format/RecordField', function() {
      var field;

      beforeEach(function() {
         field = new RecordField();
      });

      afterEach(function() {
         field = undefined;
      });

      describe('.getType()', function() {
         it('should return "Record" by default', function() {
            assert.strictEqual(field.getType(), 'Record');
         });
      });
   });
}
);
