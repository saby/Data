/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/format/DictionaryField'
], function(
   DictionaryField
) {
   'use strict';

   DictionaryField = DictionaryField.default;

   describe('Types/_entity/format/DictionaryField', function() {
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
   });
});
