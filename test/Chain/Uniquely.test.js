/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_chain/Uniquely',
   './ArrayMock'
], function(
   UniquelyChainEs,
   Mock
) {
   'use strict';

   var UniquelyChain = UniquelyChainEs.default;

   describe('Types/Chain/Uniquely', function() {
      var prev,
         items;

      beforeEach(function() {
         items = ['one', 'two', 'three', 'two', 1, 2, 'One'];
         prev = new Mock(items);
      });

      afterEach(function() {
         items = undefined;
         prev = undefined;
      });

      describe('.getEnumerator()', function() {
         it('should return a valid enumerator', function() {
            var chain = new UniquelyChain(prev),
               enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
         });

         it('should return an enumerator with unique scalars', function() {
            var expect = ['one', 'two', 'three', 1, 2, 'One'],
               chain = new UniquelyChain(prev),
               enumerator = chain.getEnumerator(),
               index = 0;

            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), expect[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), items.indexOf(enumerator.getCurrent()));
               index++;
            }
            assert.strictEqual(index, expect.length);
         });

         it('should return an enumerator with unique objects', function() {
            var sameItem = {id: 2},
               items = [
                  {id: 1},
                  sameItem,
                  {id: 3},
                  sameItem,
                  {id: 5}
               ],
               prev = new Mock(items),
               expect = [1, 2, 3, 5],
               chain = new UniquelyChain(prev),
               enumerator = chain.getEnumerator(),
               index = 0;

            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent().id, expect[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), items.indexOf(enumerator.getCurrent()));
               index++;
            }
            assert.strictEqual(index, expect.length);
         });

         it('should return an enumerator with items with unique property value', function() {
            var items = [
                  {id: 1, foo: 'bar'},
                  {id: 2, foo: 'bar'},
                  {id: 3, foo: 'baz'},
                  {id: 4, foo: 'bar'}
               ],
               prev = new Mock(items),
               expect = [1, 3],
               chain = new UniquelyChain(prev, function(item) {
                  return item.foo;
               }),
               enumerator = chain.getEnumerator(),
               index = 0;

            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent().id, expect[index]);
               assert.strictEqual(enumerator.getCurrentIndex(), items.indexOf(enumerator.getCurrent()));
               index++;
            }
            assert.strictEqual(index, expect.length);
         });
      });
   });
});
