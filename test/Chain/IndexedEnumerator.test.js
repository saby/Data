/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_chain/IndexedEnumerator',
   './ArrayMock'
], function(
   IndexedEnumeratorEs,
   ArrayMock
) {
   'use strict';

   var IndexedEnumerator = IndexedEnumeratorEs.default;

   describe('Types/Chain/IndexedEnumerator', function() {
      var prev,
         items;

      beforeEach(function() {
         items = ['a', 'b', 'c'];
         prev = new ArrayMock(items);
      });

      afterEach(function() {
         items = undefined;
         prev = undefined;
      });

      describe('.getCurrent()', function() {
         it('should return undefined by default', function() {
            var enumerator = new IndexedEnumerator(prev);
            assert.isUndefined(enumerator.getCurrent());
         });
      });

      describe('.getCurrentIndex()', function() {
         it('should return -1 by default', function() {
            var enumerator = new IndexedEnumerator(prev);
            assert.equal(enumerator.getCurrentIndex(), -1);
         });
      });

      describe('.moveNext()', function() {
         it('should enum items with original indices', function() {
            var enumerator = new IndexedEnumerator(prev),
               index = 0;

            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), items[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), items.indexOf(enumerator.getCurrent()));
               index++;
            }
            assert.strictEqual(index, items.length);
         });
      });
   });
});
