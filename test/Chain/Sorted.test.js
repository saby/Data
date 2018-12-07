/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_chain/Sorted',
   './ArrayMock',
   './ObjectMock'
], function(
   SortedChainEs,
   ArrayMock,
   ObjectMock
) {
   'use strict';

   var SortedChain = SortedChainEs.default;

   describe('Types/Chain/Sorted', function() {
      var itemsArray,
         itemsObject,
         prevArray,
         prevObject;

      beforeEach(function() {
         itemsArray = [1, 3, 2];
         itemsObject = {a: 1, c: 3, b: 2};
         prevArray = new ArrayMock(itemsArray);
         prevObject = new ObjectMock(itemsObject);
      });

      afterEach(function() {
         itemsArray = undefined;
         itemsObject = undefined;
         prevArray = undefined;
         prevObject = undefined;
      });

      describe('.getEnumerator()', function() {
         it('should return a valid enumerator for Array', function() {
            var chain = new SortedChain(prevArray),
               enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
         });

         it('should return a valid enumerator for Object', function() {
            var chain = new SortedChain(prevObject),
               enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
         });

         it('should enum values in direct order for Array', function() {
            var chain = new SortedChain(prevArray),
               enumerator = chain.getEnumerator(),
               sortedItems,
               index = 0;

            sortedItems = itemsArray.slice().sort();
            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), sortedItems[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, itemsArray.length);
         });

         it('should enum pairs in direct order for Object', function() {
            var chain = new SortedChain(prevObject),
               enumerator = chain.getEnumerator(),
               keys = Object.keys(itemsObject),
               pairs = keys.reduce(function(prev, current) {
                  prev[itemsObject[current]] = current;
                  return prev;
               }, {}),
               sortedItems,
               index = 0;

            sortedItems = keys.map(function(key) {
               return itemsObject[key];
            }).sort();
            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), sortedItems[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), pairs[enumerator.getCurrent()]);
               index++;
            }
            assert.strictEqual(index, keys.length);
         });

         it('should enum strings in direct order for Array', function() {
            var itemsArray = ['a', 'w', 'e', 's', 'o', 'me'],
               sortedItems = itemsArray.slice(),
               prevArray = new ArrayMock(itemsArray),
               chain = new SortedChain(prevArray),
               enumerator = chain.getEnumerator(),
               index = 0;

            sortedItems.sort();
            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), sortedItems[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, itemsArray.length);
         });

         it('should enum objects in direct order for Array', function() {
            var itemsArray = [{name: 'x'}, {name: 'a'}, {name: 'f'}],
               sortedItems = itemsArray.slice(),
               compare = function(a, b) {
                  return a.name > b.name;
               },
               prevArray = new ArrayMock(itemsArray),
               chain = new SortedChain(prevArray, compare),
               enumerator = chain.getEnumerator(),
               index = 0;

            sortedItems.sort(compare);
            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), sortedItems[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, itemsArray.length);
         });

         it('should enum numbers in direct order use compareFunction for Array', function() {
            var sortedItems = itemsArray.slice(),
               compare = function(a, b) {
                  return a - b;
               },
               chain = new SortedChain(prevArray, compare),
               enumerator = chain.getEnumerator(),
               index = 0;

            sortedItems.sort(compare);
            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), sortedItems[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, itemsArray.length);
         });

         it('should enum numbers in reverse order', function() {
            var sortedItems = itemsArray.slice(),
               compare = function(a, b) {
                  return b - a;
               },
               chain = new SortedChain(prevArray, compare),
               enumerator = chain.getEnumerator(),
               index = 0;

            sortedItems.sort(compare);
            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), sortedItems[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, itemsArray.length);
         });

         it('should enum numbers in direct order after reset', function() {
            var sortedItems = itemsArray.slice(),
               chain = new SortedChain(prevArray),
               enumerator = chain.getEnumerator(),
               index = 0;

            sortedItems.sort();

            enumerator.moveNext();
            enumerator.reset();

            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), sortedItems[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, itemsArray.length);
         });
      });
   });
});
