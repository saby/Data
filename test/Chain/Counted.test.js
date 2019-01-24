/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_chain/Counted',
   './ArrayMock'
], function(
   CountedChainEs,
   ArrayMock
) {
   'use strict';

   var CountedChain = CountedChainEs.default;

   describe('Types/_chain/Counted', function() {
      describe('.getEnumerator()', function() {
         it('should return a valid enumerator', function() {
            var prev = new ArrayMock([]),
               chain = new CountedChain(prev),
               enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.isUndefined(enumerator.getCurrentIndex());
         });

         it('should count array of primitives', function() {
            var items = ['one', 'two', 'three', 'two'],
               prev = new ArrayMock(items),
               chain = new CountedChain(prev),
               enumerator = chain.getEnumerator(),
               expectedKeys = [
                  'one',
                  'two',
                  'three'
               ],
               expectedValues = [
                  1,
                  2,
                  1
               ],
               index = 0;

            while (enumerator.moveNext()) {
               assert.deepEqual(enumerator.getCurrent(), expectedValues[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), expectedKeys[index]);
               index++;
            }
            assert.strictEqual(index, expectedKeys.length);
         });

         it('should count by given property', function() {
            var items = [
                  {id: 1},
                  {id: 1},
                  {id: 3},
                  {id: 2}
               ],
               prev = new ArrayMock(items),
               chain = new CountedChain(prev, 'id'),
               enumerator = chain.getEnumerator(),
               expectedKeys = [
                  1,
                  3,
                  2
               ],
               expectedValues = [
                  2,
                  1,
                  1
               ],
               index = 0;

            while (enumerator.moveNext()) {
               assert.deepEqual(enumerator.getCurrent(), expectedValues[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), expectedKeys[index]);
               index++;
            }
            assert.strictEqual(index, expectedKeys.length);
         });

         it('should count by given handler', function() {
            var items = [1, 2, 3, 4, 5],
               prev = new ArrayMock(items),
               chain = new CountedChain(prev, function(item) {
                  return item % 2 === 0 ? 'even' : 'odd';
               }),
               enumerator = chain.getEnumerator(),
               expectedKeys = [
                  'odd',
                  'even'
               ],
               expectedValues = [
                  3,
                  2
               ],
               index = 0;

            while (enumerator.moveNext()) {
               assert.deepEqual(enumerator.getCurrent(), expectedValues[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), expectedKeys[index]);
               index++;
            }
            assert.strictEqual(index, expectedKeys.length);
         });
      });
   });
});
