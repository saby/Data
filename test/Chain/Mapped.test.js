/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_chain/Mapped',
   './ArrayMock',
   './ObjectMock'
], function(
   MappedChainEs,
   ArrayMock,
   ObjectMock
) {
   'use strict';

   var MappedChain = MappedChainEs.default;

   describe('Types/Chain/Mapped', function() {
      var prev,
         items;

      beforeEach(function() {
         items = ['one', 'two'];
         prev = new ArrayMock(items);
      });

      afterEach(function() {
         items = undefined;
         prev = undefined;
      });

      describe('.getEnumerator()', function() {
         it('should return a valid enumerator', function() {
            var map = function() {},
               mapContext = {},
               chain = new MappedChain(prev, map, mapContext),
               enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
         });

         it('should return an enumerator with valid values for Array', function() {
            var map = function(item, index) {
                  return [item, index];
               },
               mapContext = {},
               chain = new MappedChain(prev, map, mapContext),
               enumerator = chain.getEnumerator(),
               index = 0;

            while (enumerator.moveNext()) {
               assert.deepEqual(enumerator.getCurrent(), [items[index], index]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, items.length);

            assert.deepEqual(enumerator.getCurrent(), [items[index - 1], index - 1]);
            assert.strictEqual(enumerator.getCurrentIndex(), index - 1);
         });

         it('should return an enumerator with valid values for Object', function() {
            var items = {foo: 'one', bar: 'two'},
               keys = Object.keys(items),
               prev = new ObjectMock(items),
               chain = new MappedChain(prev, function(val, key) {
                  return [val, key];
               }),
               enumerator = chain.getEnumerator(),
               index = 0;

            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrentIndex(), keys[index]);
               assert.deepEqual(enumerator.getCurrent(), [items[enumerator.getCurrentIndex()], enumerator.getCurrentIndex()]);
               index++;
            }
            assert.strictEqual(index, keys.length);
         });

         it('should return an enumerator and reset it', function() {
            var map = function(item) {
                  return [item];
               },
               mapContext = {},
               chain = new MappedChain(prev, map, mapContext),
               enumerator = chain.getEnumerator(),
               index = 0;

            enumerator.moveNext();
            enumerator.reset();

            while (enumerator.moveNext()) {
               assert.deepEqual(enumerator.getCurrent(), [items[index]]);
               assert.strictEqual(enumerator.getCurrentIndex(), index);
               index++;
            }
            assert.strictEqual(index, items.length);

            assert.deepEqual(enumerator.getCurrent(), [items[index - 1]]);
            assert.strictEqual(enumerator.getCurrentIndex(), index - 1);
         });
      });
   });
});
