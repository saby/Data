/* global beforeEach, afterEach, describe, context, assert, it */
define([
   'Types/source',
   'Types/entity'
], function(
   dataSource,
   type
) {
   'use strict';

   describe('Types/_source/HierarchicalMemory', function() {
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
            keyProperty: 'id'
         });
      });

      afterEach(function() {
         data = undefined;
         source = undefined;
      });

      describe('.getOriginal()', function() {
         it('should return Memory instance', function() {
            assert.instanceOf(source.getOriginal(), dataSource.Memory);
         });
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
                  {id: 1, parent: null, name: 'Catalogue'},
                  {id: 10, parent: 1, name: 'Computers'},
                  {id: 100, parent: 10, name: 'Laptops'},
                  {id: 1000, parent: 100, name: 'Apple MacBook Pro'},
                  {id: 1001, parent: 100, name: 'Xiaomi Mi Notebook Air'},
                  {id: 11, parent: 1, name: 'Smartphones'},
                  {id: 110, parent: 11, name: 'Apple iPhone'}
               ],
               keyProperty: 'id',
               parentProperty: 'parent'
            });

            var query = new dataSource.Query();
            query.where({parent: 100});

            var expectItems = ['Apple MacBook Pro', 'Xiaomi Mi Notebook Air'];
            var expectPath = ['Catalogue', 'Computers', 'Laptops'];

            return source.query(query).then(function(result) {
               var items = [];
               result.getAll().forEach(function(item) {
                  items.push(item.get('name'));
               });
               assert.deepEqual(items, expectItems);

               var path = [];
               result.getAll().getMetaData().path.each(function(item) {
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

      describe('.toJSON()', function() {
         it('should serialize its own options', function() {
            var data = {foo: 'bar'};
            var options = {
               parentProperty: 'id'
            };
            var source = new HierarchicalMemory(Object.assign({data: data}, options));
            var serialized = source.toJSON();

            assert.deepEqual(serialized.state.$options, options);
            assert.deepEqual(serialized.state._source._$data, data);
         });
      });
   });
});
