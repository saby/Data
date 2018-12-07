/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/format/XmlField'
], function(
   XmlField
) {
   'use strict';

   XmlField = XmlField.default;

   describe('Types/Format/XmlField', function() {
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

      describe('.clone()', function() {
         it('should return the clone', function() {
            var clone = field.clone();
            assert.instanceOf(clone, XmlField);
            assert.isTrue(field.isEqual(clone));
         });
      });
   });
});
