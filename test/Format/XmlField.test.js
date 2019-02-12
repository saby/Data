/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/format/XmlField'
], function(
   XmlField
) {
   'use strict';

   XmlField = XmlField.default;

   describe('Types/_entity/format/XmlField', function() {
      var field;

      beforeEach(function() {
         field = new XmlField();
      });

      afterEach(function() {
         field = undefined;
      });

      describe('.getDefaultValue()', function() {
         it('should return an empty string by default', function() {
            assert.strictEqual(field.getDefaultValue(), '');
         });
      });
   });
});
