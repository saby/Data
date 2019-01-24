/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_source/Query',
   'Types/_entity/Record'
], function(
   Query,
   Record
) {
   'use strict';

   Query = Query.default;
   Record = Record.default;

   describe('Types/_source/Query', function() {
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
});
