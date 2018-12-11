/* global beforeEach, afterEach, describe, context, assert, it */
define([
   'Types/source',
   'Types/entity'
], function(
   dataSource,
   type
) {
   'use strict';

   describe('Types/Source/HierarchicalMemory', function() {
      var HierarchicalMemory = dataSource.HierarchicalMemory;
      var data;
      var source;

      beforeEach(function() {
         data = [
            {id: 1, title: 'foo'},
            {id: 2, title: 'bar'}
         ];
         source = new HierarchicalMemory({
            data: data,
            idProperty: 'id'
         });
      });

      afterEach(function() {
         data = undefined;
         source = undefined;
      });

      describe('.create()', function() {
         it('should return record', function() {
            return source.create().then(function(model) {
               assert.instanceOf(model, type.Model);
            });
         });
      });

      describe('.read()', function() {
         it('should return record', function() {
            return source.read(1).then(function(model) {
               assert.instanceOf(model, type.Model);
               assert.equal(model.getId(), 1);
            });
         });
      });

      describe('.update()', function() {
         it('should update record', function() {
            var rec = new type.Record({
               rawData: {id: 1, title: 'one'}
            });
            return source.update(rec).then(function(result) {
               assert.equal(result, 1);
            });
         });
      });

      describe('.destroy()', function() {
         it('should delete record', function() {
            return source.destroy(1).then(function(result) {
               assert.equal(result, 1);
            });
         });
      });

      describe('.query()', function() {
         it('should return all source records', function() {
            return source.query().then(function(result) {
               assert.equal(result.getAll().getCount(), 2);
            });
         });

         it('should return items and path in metadata', function() {
            var source = new dataSource.HierarchicalMemory({
               data: [
                  {id: 1, parent: null, name: 'Laptops'},
                  {id: 10, parent: 1, name: 'Apple MacBook Pro'},
                  {id: 11, parent: 1, name: 'Xiaomi Mi Notebook Air'},
                  {id: 2, parent: null, name: 'Smartphones'},
                  {id: 20, parent: 2, name: 'Apple iPhone'},
                  {id: 21, parent: 2, name: 'Samsung Galaxy'}
               ],
               idProperty: 'id',
               parentProperty: 'parent'
            });

            var query = new dataSource.Query();
            query.where({parent: 1});

            var expectItems = ['Apple MacBook Pro', 'Xiaomi Mi Notebook Air'];
            var expectPath = ['Laptops'];

            return source.query(query).then(function(result) {
               var items = [];
               result.getAll().forEach(function(item) {
                  items.push(item.get('name'));
               });
               assert.deepEqual(items, expectItems);

               var path = [];
               result.getAll().getMetaData().path.forEach(function(item) {
                  path.push(item.get('name'));
               });
               assert.deepEqual(path, expectPath);
            });
         });
      });

      describe('.merge()', function() {
         it('should merge records', function() {
            return source.merge(1, 2).then(function(result) {
               assert.equal(result, 1);
            });
         });
      });

      describe('.copy()', function() {
         it('should copy record', function() {
            return source.copy(1).then(function(result) {
               assert.equal(result.getId(), 1);
            });
         });
      });

      describe('.move()', function() {
         it('should move record', function() {
            return source.move([1], 2).then(function(result) {
               assert.isUndefined(result);
            });
         });
      });
   });
});
