/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_chain/Flattened',
   'Types/_collection/List',
   './ArrayMock'
], function(
   FlattenedChain,
   List,
   Mock
) {
   'use strict';

   FlattenedChain = FlattenedChain.default;
   List = List.default;

   describe('Types/_chain/Flattened', function() {
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
            var chain = new FlattenedChain(prev),
               enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
         });

         it('should return an enumerator with flat items', function() {
            var chain = new FlattenedChain(prev),
               enumerator = chain.getEnumerator(),
               index = 0;

            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), items[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, items.length);
         });

         it('should return an enumerator with flat items after reset', function() {
            var chain = new FlattenedChain(prev),
               enumerator = chain.getEnumerator(),
               index = 0;

            enumerator.moveNext();
            enumerator.reset();

            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), items[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, items.length);
         });

         it('should return an enumerator with nesting arrays', function() {
            var items = ['one', ['two', [['three']]]],
               expect = ['one', 'two', 'three'],
               prev = new Mock(items),
               chain = new FlattenedChain(prev),
               enumerator = chain.getEnumerator(),
               index = 0;

            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), expect[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, expect.length);
         });

         it('should return an enumerator which works well with empty arrays by the way', function() {
            var items = [[], 1, [2, 3]];
            var expect = [1, 2, 3];
            var prev = new Mock(items);
            var chain = new FlattenedChain(prev);
            var enumerator = chain.getEnumerator();
            var index = 0;

            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), expect[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, expect.length);
         });

         it('should return an enumerator with nesting IEnumerable', function() {
            var items = [
                  'one',
                  new List({items: ['two', [['three']]]})
               ],
               expect = ['one', 'two', 'three'],
               prev = new Mock(items),
               chain = new FlattenedChain(prev),
               enumerator = chain.getEnumerator(),
               index = 0;

            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), expect[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, expect.length);
         });
      });
   });
});
