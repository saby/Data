/* global define, beforeEach, afterEach, describe, context, it, assert */
define([
   'Types/_entity/format/RecordSetField'
], function(RecordSetField) {
   'use strict';

   RecordSetField = RecordSetField.default;

   describe('Types/Format/RecordSetField', function() {
      var field;

      beforeEach(function() {
         field = new RecordSetField();
      });

      afterEach(function() {
         field = undefined;
      });

      describe('.getType()', function() {
         it('should return "RecordSet" by default', function() {
            assert.strictEqual(field.getType(), 'RecordSet');
         });
      });
   });
}
);
