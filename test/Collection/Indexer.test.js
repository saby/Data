/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_collection/Indexer'
], function(
   IndexerEs
) {
   'use strict';

   var Indexer = IndexerEs.default;

   describe('Types/Collection/Indexer', function() {
      var items,
         indexer;

      beforeEach(function() {
         items = [{
            id: 1,
            name: 'John',
            gender: 'm'
         }, {
            id: 2,
            name: 'Bill',
            gender: 'm'
         }, {
            id: 3,
            name: 'Eva',
            gender: 'f'
         }, {
            id: 4,
            name: 'Ken',
            gender: 'm'
         }];

         indexer = new Indexer(
            items,
            function(items) {
               return items.length;
            },
            function(items, at) {
               return items[at];
            },
            function(item, property) {
               return item[property];
            }
         );
      });

      afterEach(function() {
         items = undefined;
      });

      describe('.getIndexByValue()', function() {
         it('should return item index for scalar', function() {
            for (var i = 0; i < items.length; i++) {
               assert.strictEqual(
                  i,
                  indexer.getIndexByValue('id', items[i].id)
               );
               assert.strictEqual(
                  i,
                  indexer.getIndexByValue('name', items[i].name)
               );
            }
         });

         it('should return item index for Array', function() {
            items = [
               {id: [1]},
               {id: [2, 1]},
               {id: [3, 'a']},
               {id: [4]}
            ];

            indexer = new Indexer(
               items,
               function(items) {
                  return items.length;
               },
               function(items, at) {
                  return items[at];
               },
               function(item, property) {
                  return item[property];
               }
            );

            for (var i = 0; i < items.length; i++) {
               assert.strictEqual(
                  i,
                  indexer.getIndexByValue('id', items[i].id)
               );
            }
         });

         it('should return -1 with not exists property', function() {
            assert.strictEqual(
               -1,
               indexer.getIndexByValue('some', 0)
            );
         });

         it('should return -1 for not a property name', function() {
            assert.strictEqual(indexer.getIndexByValue(), -1);
            assert.strictEqual(indexer.getIndexByValue(null), -1);
            assert.strictEqual(indexer.getIndexByValue(false), -1);
            assert.strictEqual(indexer.getIndexByValue(0), -1);
            assert.strictEqual(indexer.getIndexByValue(''), -1);
         });

         it('should work fine with names from Object.prototype', function() {
            var items = [
                  {'constructor': 'a'},
                  {'hasOwnProperty': 1},
                  {'toString': false},
                  {'isPrototypeOf': null}
               ],
               indexer = new Indexer(
                  items,
                  function(items) {
                     return items.length;
                  },
                  function(items, at) {
                     return items[at];
                  },
                  function(item, property) {
                     return item[property];
                  }
               );
            for (var i = 0; i < items.length; i++) {
               for (var k in items[i]) {
                  if (Object.prototype.hasOwnProperty.call(items[i], k)) {
                     assert.strictEqual(
                        i,
                        indexer.getIndexByValue(k, items[i][k])
                     );
                  }
               }
            }
         });

         it('should work fine with values from Object.prototype', function() {
            var items = [
                  {id: 'constructor'},
                  {id: 'hasOwnProperty'},
                  {id: 'toString'},
                  {id: 'isPrototypeOf'}
               ],
               indexer = new Indexer(
                  items,
                  function(items) {
                     return items.length;
                  },
                  function(items, at) {
                     return items[at];
                  },
                  function(item, property) {
                     return item[property];
                  }
               );

            for (var i = 0; i < items.length; i++) {
               assert.strictEqual(
                  i,
                  indexer.getIndexByValue('id', items[i].id)
               );
            }
         });
      });

      describe('.getIndicesByValue()', function() {
         it('should return items indices with given property', function() {
            assert.deepEqual(
               [0],
               indexer.getIndicesByValue('id', 1)
            );
            assert.deepEqual(
               [0, 1, 3],
               indexer.getIndicesByValue('gender', 'm')
            );
            assert.deepEqual(
               [2],
               indexer.getIndicesByValue('gender', 'f')
            );
         });

         it('should return no indices with not exists property', function() {
            assert.strictEqual(
               0,
               indexer.getIndicesByValue('some', 0).length
            );
         });
      });

      describe('.resetIndex()', function() {
         it('should build equal indices', function() {
            var v1 = indexer.getIndicesByValue('id', 1),
               v2;

            indexer.resetIndex();
            v2 = indexer.getIndicesByValue('id', 1);

            assert.deepEqual(v1, v2);
         });
      });

      describe('.updateIndex()', function() {
         it('should update indices', function() {
            var pos = 1,
               oldV = items[pos].id,
               newV = 100;

            items[pos].id = newV;

            var indices = indexer.getIndicesByValue('id', newV);
            assert.strictEqual(indices[0], pos);

            assert.strictEqual(indexer.getIndicesByValue('id', oldV).length, 0);
         });
      });

      describe('.shiftIndex()', function() {
         it('should shift indices', function() {
            var offset = 11,
               start = 1,
               count = 2,
               oldIndices = indexer.getIndicesByValue('gender', 'm'),
               expect = oldIndices.map(function(index) {
                  return index >= start && index < start + count ? index + offset : index;
               }),
               newIndices;

            indexer.shiftIndex(start, count, offset);
            newIndices = indexer.getIndicesByValue('gender', 'm');
            assert.deepEqual(newIndices, expect);
         });
      });

      describe('.removeFromIndex()', function() {
         it('should remove indices', function() {
            var indices;

            indices = indexer.getIndicesByValue('id', 2);
            assert.equal(indices[0], 1);
            indexer.removeFromIndex(1, 1);
            assert.equal(indexer.getIndicesByValue('id', 1).length, 1);
            assert.equal(indexer.getIndicesByValue('id', 2).length, 0);
            assert.equal(indexer.getIndicesByValue('id', 3).length, 1);
            assert.equal(indexer.getIndicesByValue('id', 4).length, 1);

            indices = indexer.getIndicesByValue('id', 1);
            assert.equal(indices[0], 0);
            indexer.removeFromIndex(0, 2);
            assert.equal(indexer.getIndicesByValue('id', 1).length, 0);
            assert.equal(indexer.getIndicesByValue('id', 2).length, 0);
            assert.equal(indexer.getIndicesByValue('id', 3).length, 1);
            assert.equal(indexer.getIndicesByValue('id', 4).length, 1);
         });
      });
   });
});
