/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_chain/Concatenated',
   'Types/_collection/List',
   './ArrayMock'
], function(
   ConcatenatedChain,
   List,
   Mock
) {
   'use strict';

   ConcatenatedChain = ConcatenatedChain.default;
   List = List.default;

   describe('Types/Chain/Concatenated', function() {
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
            var chain = new ConcatenatedChain(prev),
               enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
         });

         it('should return an enumerator with concatenated items', function() {
            var toConcat = [[4, 5], ['6', '7']],
               expect = ['one', 'two', 'three', 4, 5, '6', '7'],
               chain = new ConcatenatedChain(prev, toConcat),
               enumerator = chain.getEnumerator(),
               index = 0;

            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), expect[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, expect.length);
         });

         it('should return an enumerator with concatenated items include IEnumerable', function() {
            var toConcat = [[4, 5], new List({items: ['6', '7']})],
               expect = ['one', 'two', 'three', 4, 5, '6', '7'],
               chain = new ConcatenatedChain(prev, toConcat),
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
