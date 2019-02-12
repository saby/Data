/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/format/TimeIntervalField'
], function(
   TimeIntervalField
) {
   'use strict';

   TimeIntervalField = TimeIntervalField.default;

   describe('Types/_entity/format/TimeIntervalField', function() {
      var field;

      beforeEach(function() {
         field = new TimeIntervalField();
      });

      afterEach(function() {
         field = undefined;
      });

      describe('.getDefaultValue()', function() {
         it('should return 0 by default', function() {
            assert.strictEqual(field.getDefaultValue(), 0);
         });
      });
   });
});
