/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_chain/Grouped',
   './ArrayMock',
   './ObjectMock'
], function(
   GroupedChainEs,
   ArrayMock,
   ObjectMock
) {
   'use strict';

   var GroupedChain = GroupedChainEs.default;

   describe('Types/Chain/Grouped', function() {
      describe('.getEnumerator()', function() {
         it('should return a valid enumerator', function() {
            var prev = new ArrayMock([]),
               chain = new GroupedChain(prev),
               enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.isUndefined(enumerator.getCurrentIndex());
         });

         it('should group array of string', function() {
            var items = ['one', 'two', 'three', 'two'],
               prev = new ArrayMock(items),
               chain = new GroupedChain(prev),
               enumerator = chain.getEnumerator(),
               expectedKeys = [
                  'one',
                  'two',
                  'three'
               ],
               expectedValues = [
                  ['one'],
                  ['two', 'two'],
                  ['three']
               ],
               index = 0;

            while (enumerator.moveNext()) {
               assert.deepEqual(enumerator.getCurrent(), expectedValues[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), expectedKeys[index]);
               index++;
            }
            assert.strictEqual(index, expectedKeys.length);
         });

         it('should group object of string', function() {
            var items = {one: 1, two: 2, three: 3, four: 2},
               prev = new ObjectMock(items),
               chain = new GroupedChain(prev),
               enumerator = chain.getEnumerator(),
               expectedKeys = [
                  1,
                  2,
                  3
               ],
               expectedValues = [
                  [1],
                  [2, 2],
                  [3]
               ],
               index = 0;

            while (enumerator.moveNext()) {
               assert.deepEqual(enumerator.getCurrent(), expectedValues[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), expectedKeys[index]);
               index++;
            }
            assert.strictEqual(index, expectedKeys.length);
         });

         it('should group by given property', function() {
            var items = [
                  {id: 1},
                  {id: 2},
                  {id: 1},
                  {id: 3}
               ],
               prev = new ArrayMock(items),
               chain = new GroupedChain(prev, 'id'),
               enumerator = chain.getEnumerator(),
               expectedKeys = [
                  1,
                  2,
                  3
               ],
               expectedValues = [
                  [items[0], items[2]],
                  [items[1]],
                  [items[3]]
               ],
               index = 0;

            while (enumerator.moveNext()) {
               assert.deepEqual(enumerator.getCurrent(), expectedValues[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), expectedKeys[index]);
               index++;
            }
            assert.strictEqual(index, expectedKeys.length);
         });

         it('should group and map by given property', function() {
            var items = [
                  {id: 1, value: 'one'},
                  {id: 2, value: 'two'},
                  {id: 1, value: 'three'},
                  {id: 3, value: 'four'}
               ],
               prev = new ArrayMock(items),
               chain = new GroupedChain(prev, 'id', 'value'),
               enumerator = chain.getEnumerator(),
               expectedKeys = [
                  1,
                  2,
                  3
               ],
               expectedValues = [
                  ['one', 'three'],
                  ['two'],
                  ['four']
               ],
               index = 0;

            while (enumerator.moveNext()) {
               assert.deepEqual(enumerator.getCurrent(), expectedValues[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), expectedKeys[index]);
               index++;
            }
            assert.strictEqual(index, expectedKeys.length);
         });

         it('should group by given key handler', function() {
            var items = [1, 2, 3, 4, 5],
               prev = new ArrayMock(items),
               chain = new GroupedChain(prev, function(item) {
                  return item % 2 === 0 ? 'even' : 'odd';
               }),
               enumerator = chain.getEnumerator(),
               expectedKeys = [
                  'odd',
                  'even'
               ],
               expectedValues = [
                  [1, 3, 5],
                  [2, 4]
               ],
               index = 0;

            while (enumerator.moveNext()) {
               assert.deepEqual(enumerator.getCurrent(), expectedValues[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), expectedKeys[index]);
               index++;
            }
            assert.strictEqual(index, expectedKeys.length);
         });

         it('should group by given map handler', function() {
            var items = [1, 2, 3, 4, 5],
               prev = new ArrayMock(items),
               chain = new GroupedChain(prev, function(item) {
                  return item % 2 === 0 ? 'even' : 'odd';
               }, function(item) {
                  return item * item;
               }),
               enumerator = chain.getEnumerator(),
               expectedKeys = [
                  'odd',
                  'even'
               ],
               expectedValues = [
                  [1, 9, 25],
                  [4, 16]
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
