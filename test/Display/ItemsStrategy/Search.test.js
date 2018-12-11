/* global define, describe, it, assert, beforeEach, afterEach */
define([
   'Types/_display/itemsStrategy/Search',
   'Types/_display/BreadcrumbsItem',
   'Types/_display/TreeItem'
], function(
   Search,
   BreadcrumbsItem,
   TreeItem
) {
   'use strict';

   Search = Search.default;
   BreadcrumbsItem = BreadcrumbsItem.default;
   TreeItem = TreeItem.default;

   describe('Types/Display/ItemsStrategy/Search', function() {
      var getSource = function(items) {
            return {
               options: {foo: 'bar'},
               get count() {
                  return items.length;
               },
               get items() {
                  return items.slice();
               },
               at: function(index) {
                  return items[index];
               },
               getDisplayIndex: function(index) {
                  return index;
               },
               getCollectionIndex: function(index) {
                  return index;
               },
               splice: function(start, deleteCount, added) {
                  return Array.prototype.splice.apply(
                     items,
                     [start, deleteCount].concat(added)
                  );
               },
               reset: function() {
                  items.length = 0;
               },
               getSorters: function() {
                  return [];
               }
            };
         },
         items,
         source,
         strategy;

      beforeEach(function() {
         items = [];
         items[0] = new TreeItem({
            contents: 'A',
            node: true
         });
         items[1] = new TreeItem({
            parent: items[0],
            contents: 'AA',
            node: true
         });
         items[2] = new TreeItem({
            parent: items[1],
            contents: 'AAA',
            node: true
         });
         items[3] = new TreeItem({
            parent: items[2],
            contents: 'AAAa'
         });
         items[4] = new TreeItem({
            parent: items[2],
            contents: 'AAAb'
         });
         items[5] = new TreeItem({
            parent: items[1],
            contents: 'AAB',
            node: true
         });
         items[6] = new TreeItem({
            parent: items[1],
            contents: 'AAC',
            node: true
         });
         items[7] = new TreeItem({
            parent: items[6],
            contents: 'AACa'
         });
         items[8] = new TreeItem({
            parent: items[1],
            contents: 'AAD',
            node: true
         });
         items[9] = new TreeItem({
            contents: 'B',
            node: true
         });
         items[10] = new TreeItem({
            contents: 'C',
            node: true
         });
         items[11] = new TreeItem({
            contents: 'd'
         });
         items[12] = new TreeItem({
            contents: 'e'
         });

         source = getSource(items);
         strategy = new Search({
            source: source
         });
      });

      afterEach(function() {
         items = undefined;
         source = undefined;
         strategy = undefined;
      });

      describe('.options', function() {
         it('should return the source options', function() {
            assert.strictEqual(strategy.options, source.options);
         });
      });

      describe('.items', function() {
         it('should group breadcrumbs nodes', function() {
            var expected = ['#A,AA,AAA', 'AAAa', 'AAAb', '#A,AA,AAB', '#A,AA,AAC', 'AACa', '#A,AA,AAD', '#B', '#C', 'd', 'e'];

            strategy.items.forEach(function(item, index) {
               var contents = item.getContents();
               assert.equal(
                  item instanceof BreadcrumbsItem ? '#' + contents.join(',') : contents,
                  expected[index],
                  'at ' + index
               );
            });

            assert.strictEqual(strategy.items.length, expected.length);
         });

         it('return breadcrumbs as 1st level parent for leaves', function() {
            strategy.items.forEach(function(item, index) {
               if (item instanceof TreeItem) {
                  assert.instanceOf(
                     item.getParent(),
                     BreadcrumbsItem,
                     'at ' + index
                  );
                  assert.equal(
                     item.getLevel(),
                     1,
                     'at ' + index
                  );
               }
            });
         });
      });

      describe('.count', function() {
         it('should return items count', function() {
            assert.equal(strategy.count, 11);
         });
      });

      describe('.getDisplayIndex()', function() {
         it('should return index in projection', function() {
            var next = strategy.count;
            var expected = [next, next, next, 1, 2, next, next, 5, next, next, next, 9, 10];
            items.forEach(function(item, index) {
               assert.equal(strategy.getDisplayIndex(index), expected[index], 'at ' + index);
            });
         });
      });

      describe('.getCollectionIndex()', function() {
         it('should return index in collection', function() {
            var expected = [-1, 3, 4, -1, -1, 7, -1, -1, -1, 11, 12];
            strategy.items.forEach(function(item, index) {
               assert.equal(strategy.getCollectionIndex(index), expected[index], 'at ' + index);
            });
         });
      });

      describe('.splice()', function() {
         it('should add items', function() {
            var newItems = [new TreeItem({
               parent: items[2],
               contents: 'AAAc'
            })];
            var at = 3;
            var expected = ['#A,AA,AAA', 'AAAc', 'AAAa', 'AAAb', '#A,AA,AAB', '#A,AA,AAC', 'AACa', '#A,AA,AAD', '#B', '#C', 'd', 'e'];

            strategy.splice(at, 0, newItems);

            strategy.items.forEach(function(item, index) {
               var contents = item.getContents();
               assert.equal(
                  item instanceof BreadcrumbsItem ? '#' + contents.join(',') : contents,
                  expected[index],
                  'at ' + index
               );
            });

            assert.strictEqual(strategy.items.length, expected.length);
         });

         it('should remove items', function() {
            // AA
            var at = 1;

            // AA + AAA
            var removeCount = 2;
            var count = source.items.length;
            var expected = ['#A', 'AAAa', 'AAAb', '#A,AA,AAB', '#A,AA,AAC', 'AACa', '#A,AA,AAD', '#B', '#C', 'd', 'e'];

            strategy.splice(at, removeCount, []);

            assert.strictEqual(strategy.count, count - removeCount);
            assert.strictEqual(strategy.count, expected.length);
            strategy.items.forEach(function(item, index) {
               var contents = item.getContents();
               assert.equal(
                  item instanceof BreadcrumbsItem ? '#' + contents.join(',') : contents,
                  expected[index],
                  'at ' + index
               );
            });
         });
      });

      describe('.reset()', function() {
         it('should reset items', function() {
            strategy.reset();
            assert.strictEqual(strategy.items.length, 0);
         });
      });
   });
});
