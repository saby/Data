/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_chain/Sliced',
   './ArrayMock'
], function(
   SlicedChainEs,
   Mock
) {
   'use strict';

   var SlicedChain = SlicedChainEs.default;

   describe('Types/Chain/Sliced', function() {
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
            var chain = new SlicedChain(prev, 0, 0),
               enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
         });

         it('should return an enumerator with first item', function() {
            var begin = 0,
               end = 1,
               expect = ['one'],
               chain = new SlicedChain(prev, begin, end),
               enumerator = chain.getEnumerator(),
               index = 0;

            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), expect[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, expect.length);

            assert.strictEqual(enumerator.getCurrent(), expect[index - 1]);
            assert.strictEqual(enumerator.getCurrentIndex(), index - 1);
         });

         it('should return an enumerator with second item', function() {
            var begin = 1,
               end = 2,
               expect = ['two'],
               chain = new SlicedChain(prev, begin, end),
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

         it('should return an enumerator with first and second items', function() {
            var begin = 0,
               end = 2,
               expect = ['one', 'two'],
               chain = new SlicedChain(prev, begin, end),
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

         it('should return an enumerator with no items', function() {
            var chain = new SlicedChain(prev, 3, 4);
            assert.isFalse(chain.getEnumerator().moveNext());

            chain = new SlicedChain(prev, 0, 0);
            assert.isFalse(chain.getEnumerator().moveNext());

            chain = new SlicedChain(prev, 1, 1);
            assert.isFalse(chain.getEnumerator().moveNext());

            chain = new SlicedChain(prev, 1, 0);
            assert.isFalse(chain.getEnumerator().moveNext());
         });
      });
   });
});
