/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_chain/Filtered',
   './ArrayMock'
], function(
   FilteredChainEs,
   Mock
) {
   'use strict';

   var FilteredChain = FilteredChainEs.default;

   describe('Types/_chain/Filtered', function() {
      var prev,
         items;

      beforeEach(function() {
         items = ['one', 'two', 'three'];
         prev = new Mock(items);
      });

      afterEach(function() {
         items = undefined;
         prev = undefined;
      });

      describe('.getEnumerator()', function() {
         it('should return a valid enumerator', function() {
            var filter = function() {},
               filterContext = {},
               chain = new FilteredChain(prev, filter, filterContext),
               enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
         });

         it('should return an enumerator with next value', function() {
            var filter = function(item) {
                  return item === 'one' || item === 'three';
               },
               expect = ['one', 'three'],
               filterContext = {},
               chain = new FilteredChain(prev, filter, filterContext),
               enumerator = chain.getEnumerator(),
               index = 0;

            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), expect[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), items.indexOf(enumerator.getCurrent()));
               index++;
            }
            assert.strictEqual(index, expect.length);

            assert.strictEqual(enumerator.getCurrent(), expect[index - 1]);
            assert.strictEqual(enumerator.getCurrentIndex(), items.indexOf(enumerator.getCurrent()));
         });

         it('should return an enumerator and reset it', function() {
            var filter = function(item) {
                  return item === 'one' || item === 'three';
               },
               expect = ['one', 'three'],
               filterContext = {},
               chain = new FilteredChain(prev, filter, filterContext),
               enumerator = chain.getEnumerator(),
               index = 0;

            enumerator.moveNext();
            enumerator.reset();

            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), expect[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), items.indexOf(enumerator.getCurrent()));
               index++;
            }
            assert.strictEqual(index, expect.length);

            assert.strictEqual(enumerator.getCurrent(), expect[index - 1]);
            assert.strictEqual(enumerator.getCurrentIndex(), items.indexOf(enumerator.getCurrent()));
         });
      });
   });
});
