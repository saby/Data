/* global define, describe, it, assert */
define([
   'Types/_collection/format/factory',
   'Types/_collection/format/Format'
], function(
   formatsFactory,
   Format
) {
   'use strict';

   formatsFactory = formatsFactory.default;
   Format = Format.default;

   describe('Types/_entity/format/factory', function() {
      it('should throw an error if not simple array passed', function() {
         assert.throws(function() {
            formatsFactory();
         });
         assert.throws(function() {
            formatsFactory(null);
         });
         assert.throws(function() {
            formatsFactory(false);
         });
         assert.throws(function() {
            formatsFactory(true);
         });
         assert.throws(function() {
            formatsFactory(0);
         });
         assert.throws(function() {
            formatsFactory(1);
         });
         assert.throws(function() {
            formatsFactory('');
         });
         assert.throws(function() {
            formatsFactory({});
         });
      });
      it('should return an empty formats list', function() {
         var format = formatsFactory([]);
         assert.instanceOf(format, Format);
         assert.strictEqual(format.getCount(), 0);
      });
      it('should return formats list', function() {
         var declaration = [{
               name: 'f1',
               type: 'boolean'
            }, {
               name: 'f2',
               type: 'integer'
            }, {
               name: 'f3',
               type: 'real'
            }, {
               name: 'f4',
               type: 'string'
            }],
            format = formatsFactory(declaration);

         assert.strictEqual(format.getCount(), 4);
         for (var i = 0; i < format.getCount(); i++) {
            assert.strictEqual(format.at(i).getName(), declaration[i].name);
         }
      });
   });
});
