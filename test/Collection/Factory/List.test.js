/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_collection/factory/list',
   'Types/collection'
], function(
   listFactoryEs,
   collection
) {
   'use strict';

   var listFactory = listFactoryEs.default;

   describe('Types/Collection/Factory/List', function() {
      var List = collection.List;
      var items;
      var itemsList;

      beforeEach(function() {
         items = ['one', 'two', 'three'];
         itemsList = new List({items: items});
      });

      afterEach(function() {
         items = undefined;
         itemsList = undefined;
      });

      describe('constructor()', function() {
         it('should throw an error on invalid type of argument "items"', function() {
            assert.throws(function() {
               listFactory();
            });
            assert.throws(function() {
               listFactory({});
            });
            assert.throws(function() {
               listFactory(null);
            });
         });

         it('should return List', function() {
            assert.instanceOf(listFactory(itemsList), List);
         });

         it('should return List with given collection', function() {
            var list = listFactory(itemsList);

            list.each(function(record, index) {
               assert.strictEqual(record, items[index]);
            });
            assert.equal(list.getCount(), items.length);
         });
      });
   });
});
