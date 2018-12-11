/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/format/DictionaryField'
], function(
   DictionaryField
) {
   'use strict';

   DictionaryField = DictionaryField.default;

   describe('Types/Format/DictionaryField', function() {
      var field;

      beforeEach(function() {
         field = new DictionaryField();
      });

      afterEach(function() {
         field = undefined;
      });

      describe('.getDictionary()', function() {
         it('should return null by default', function() {
            assert.isNull(field.getDictionary());
         });
         it('should return the value passed to the constructor', function() {
            var dict = [],
               field = new DictionaryField({
                  dictionary: dict
               });
            assert.strictEqual(field.getDictionary(), dict);
         });
      });

      describe('.getLocaleDictionary()', function() {
         it('should return null by default', function() {
            assert.isNull(field.getLocaleDictionary());
         });
         it('should return the value passed to the constructor', function() {
            var dict = [],
               field = new DictionaryField({
                  localeDictionary: dict
               });
            assert.strictEqual(field.getLocaleDictionary(), dict);
         });
      });

      describe('.clone()', function() {
         it('should return the clone', function() {
            var clone = field.clone();
            assert.instanceOf(clone, DictionaryField);
            assert.isTrue(field.isEqual(clone));
            assert.deepEqual(field.getDictionary(), clone.getDictionary());
         });
      });
   });
});
