/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_chain/Reversed',
   './ObjectMock',
   './ArrayMock'
], function(
   ReversedChainEs,
   ObjectMock,
   ArrayMock
) {
   'use strict';

   var ReversedChain = ReversedChainEs.default;

   describe('Types/Chain/Reversed', function() {
      var prevObject,
         prevArray,
         itemsObject,
         itemsArray;

      beforeEach(function() {
         itemsObject = {a: 1, b: 2};
         prevObject = new ObjectMock(itemsObject);

         itemsArray = [1, 2];
         prevArray = new ArrayMock(itemsArray);
      });

      afterEach(function() {
         prevObject = undefined;
         prevArray = undefined;
         itemsObject = undefined;
         itemsArray = undefined;
      });

      describe('.getEnumerator()', function() {
         it('should return a valid enumerator for Object', function() {
            var chain = new ReversedChain(prevObject),
               enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
         });

         it('should return a valid enumerator for Array', function() {
            var chain = new ReversedChain(prevArray),
               enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
         });

         it('should return an enumerator with next value for Object', function() {
            var chain = new ReversedChain(prevObject),
               enumerator = chain.getEnumerator(),
               keys = Object.keys(itemsObject).reverse(),
               key,
               index = 0;

            while (enumerator.moveNext()) {
               key = keys[index];
               assert.strictEqual(enumerator.getCurrent(), itemsObject[key]);
               assert.strictEqual(enumerator.getCurrentIndex(), key);
               index++;
            }
         });

         it('should return an enumerator with next value for Array', function() {
            var chain = new ReversedChain(prevArray),
               enumerator = chain.getEnumerator(),
               max = itemsArray.length - 1,
               index = 0;

            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), itemsArray[max - index]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, itemsArray.length);

            assert.strictEqual(enumerator.getCurrent(), itemsArray[0]);
            assert.strictEqual(enumerator.getCurrentIndex(), max);
         });

         it('should return an enumerator and reset it', function() {
            var chain = new ReversedChain(prevArray),
               enumerator = chain.getEnumerator(),
               max = itemsArray.length - 1,
               index = 0;

            enumerator.moveNext();
            enumerator.reset();

            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), itemsArray[max - index]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, itemsArray.length);

            assert.strictEqual(enumerator.getCurrent(), itemsArray[0]);
            assert.strictEqual(enumerator.getCurrentIndex(), max);
         });
      });
   });
});

