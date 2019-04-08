/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_source/Query',
   'Types/_entity/Record'
], function(
   QueryModule,
   Record
) {
   'use strict';

   describe('Types/_source/Query', function() {
      var Query = QueryModule.default;
      Record = Record.default;

      var query;

      beforeEach(function() {
         query = new Query();
      });

      afterEach(function() {
         query = undefined;
      });

      describe('.select', function() {
         it('should set select from array', function() {
            var fields = ['id', 'name'];
            query.select(fields);
            assert.deepEqual(query.getSelect(), {'id': 'id', 'name': 'name'});
         });

         it('should set select from string', function() {
            var fields = ['id', 'name'];
            query.select(fields.join(','));
            assert.deepEqual(query.getSelect(), { id: 'id', name: 'name' });
         });

         it('should throw an error fields is a invalid', function() {
            var fields = 12;
            assert.throws(function() {
               query.select(fields);
            });
         });
      });

      describe('.clear', function() {
         it('should clear query', function() {
            query.clear();
            assert.deepEqual(query.getSelect(), {});
         });
      });

      describe('.clone', function() {
         it('should clone query', function() {
            assert.deepEqual(query, query.clone());
         });

         it('should clone Record in meta', function() {
            var rec = new Record(),
               clone;
            rec.set('foo', 'bar');
            query.meta(rec);
            clone = query.clone();

            assert.instanceOf(clone.getMeta(), Record);
            assert.notEqual(clone.getMeta(), rec);
            assert.isTrue(clone.getMeta().isEqual(rec));
         });
      });

      describe('.getAs', function() {
         it('should return as', function() {
            query.from('product', 'item');
            assert.equal(query.getAs(), 'item');
         });
      });

      describe('.orderBy', function() {
         it('should set order by', function() {
            query.orderBy({
               customerId: true,
               date: false
            });
            assert.equal(query.getOrderBy().length, 2);
         });
      });

      describe('.groupBy', function() {
         it('should set group by from array', function() {
            var groupBy = ['date', 'customerId'];
            query.groupBy(groupBy);
            assert.equal(query.getGroupBy(), groupBy);
         });

         it('should set group by from string', function() {
            var groupBy = 'customerId';
            query.groupBy(groupBy);
            assert.deepEqual(query.getGroupBy(), [groupBy]);
         });

         it('should set group by from string', function() {
            var groupBy = {'customerId': true};
            assert.throws(function() {
               query.groupBy(groupBy);
            });
         });
      });

      describe('.where', function() {
         it('should set expression as object', function() {
            var where  = {id: 10};
            query.where(where);
            assert.strictEqual(query.getWhere(), where);
         });

         it('should set expression as predicate', function() {
            var where  = function() {};
            query.where(where);
            assert.strictEqual(query.getWhere(), where);
         });

         it('should throw an error', function() {
            var where = 'where';
            assert.throws(function() {
               query.where(where);
            });
         });
      });

      describe('.join', function() {
         it('should set join', function() {
            query.join(
               'Customers',
               {id: 'customerId'},
               {
                  customerName: 'name',
                  customerEmail: 'email'
               }
            );
            assert.equal(query.getJoin().length, 1);
         });
      });
   });

   describe('Types/_source/Query.Join', function() {
      var QueryJoin = QueryModule.Join;

      var select,
         on,
         as,
         resource,
         inner,
         join;

      beforeEach(function() {
         select = {id: 'id', name: 'name'};
         on = {id: 'productId'};
         as = 'prod';
         resource = 'product';
         inner = true;
         join = new QueryJoin({
            resource: resource,
            as: as,
            on: on,
            select: select,
            inner: inner
         });
      });

      afterEach(function() {
         select = undefined;
         on = undefined;
         as = undefined;
         resource = undefined;
         inner = undefined;
         join = undefined;
      });

      describe('.getResource', function() {
         it('should return resource', function() {
            assert.equal(join.getResource(), resource);
         });
      });
      describe('.getAs', function() {
         it('should return as', function() {
            assert.equal(join.getAs(), as);
         });
      });
      describe('.getOn', function() {
         it('should return on', function() {
            assert.deepEqual(join.getOn(), on);
         });
      });
      describe('.getSelect', function() {
         it('should return select', function() {
            assert.deepEqual(join.getSelect(), select);
         });
      });
      describe('.isInner', function() {
         it('should return inner', function() {
            assert.equal(join.isInner(), inner);
         });
      });
   });

   describe('Types/_source/Query.Order', function() {
      var Order = QueryModule.Order;

      describe('.getSelector', function() {
         it('should return empty string by default', function() {
            var order = new Order();
            assert.strictEqual(order.getSelector(), '');
         });
         it('should return value passed to the constructor', function() {
            var order = new Order({
               selector: 'test'
            });
            assert.equal(order.getSelector(), 'test');
         });
      });

      describe('.getOrder', function() {
         it('should return false by default', function() {
            var order = new Order();
            assert.isFalse(order.getOrder());
         });
         it('should return boolean value passed to the constructor', function() {
            var order = new Order({
               order: false
            });
            assert.isFalse(order.getOrder());
         });
         it('should return false from string "ASC" passed to the constructor', function() {
            var order = new Order({
               order: 'ASC'
            });
            assert.isFalse(order.getOrder());

            order = new Order({
               order: 'asc'
            });
            assert.isFalse(order.getOrder());

            order = new Order({
               order: 'Asc'
            });
            assert.isFalse(order.getOrder());
         });
         it('should return true from string "DESC" passed to the constructor', function() {
            var order = new Order({
               order: 'DESC'
            });
            assert.isTrue(order.getOrder());

            order = new Order({
               order: 'desc'
            });
            assert.isTrue(order.getOrder());

            order = new Order({
               order: 'Desc'
            });
            assert.isTrue(order.getOrder());
         });
      });
   });
});
