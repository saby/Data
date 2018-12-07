/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_chain/Zipped',
   'Types/_collection/List',
   './ArrayMock'
], function(
   ZippedChain,
   List,
   Mock
) {
   'use strict';

   ZippedChain = ZippedChain.default;
   List = List.default;

   describe('Types/Chain/Zipped', function() {
      var prev,
         items;

      beforeEach(function() {
         items = ['one', 'two'];
         prev = new Mock(items);
      });

      afterEach(function() {
         items = undefined;
         prev = undefined;
      });

      describe('.getEnumerator()', function() {
         it('should return a valid enumerator', function() {
            var chain = new ZippedChain(prev, []),
               enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
         });

         it('should return an enumerator with zipped items', function() {
            var itemsMap = [1, 2],
               expect = [
                  ['one', 1],
                  ['two', 2]
               ],
               chain = new ZippedChain(prev, [itemsMap]),
               enumerator = chain.getEnumerator(),
               index = 0;

            while (enumerator.moveNext()) {
               assert.deepEqual(enumerator.getCurrent(), expect[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, items.length);
         });

         it('should return an enumerator with IEnumerable-zipped items', function() {
            var itemsMap = new List({items: [1, 2]}),
               expect = [
                  ['one', 1],
                  ['two', 2]
               ],
               chain = new ZippedChain(prev, [itemsMap]),
               enumerator = chain.getEnumerator(),
               index = 0;

            while (enumerator.moveNext()) {
               assert.deepEqual(enumerator.getCurrent(), expect[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, items.length);
         });

         it('should return an enumerator with zipped items and reset it', function() {
            var itemsMap = [1, 2],
               expect = [
                  ['one', 1],
                  ['two', 2]
               ],
               chain = new ZippedChain(prev, [itemsMap]),
               enumerator = chain.getEnumerator(),
               index = 0;

            enumerator.moveNext();
            enumerator.reset();

            while (enumerator.moveNext()) {
               assert.deepEqual(enumerator.getCurrent(), expect[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, items.length);
         });
      });
   });
});
