/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/format/LinkField'
], function(
   LinkField
) {
   'use strict';

   LinkField = LinkField.default;

   describe('Types/Format/LinkField', function() {
      var field;

      beforeEach(function() {
         field = new LinkField();
      });

      afterEach(function() {
         field = undefined;
      });

      describe('.getDefaultValue()', function() {
         it('should return 0 by default', function() {
            assert.strictEqual(field.getDefaultValue(), 0);
         });
      });

      describe('.clone()', function() {
         it('should return the clone', function() {
            var clone = field.clone();
            assert.instanceOf(clone, LinkField);
            assert.isTrue(field.isEqual(clone));
         });
      });
   });
});
