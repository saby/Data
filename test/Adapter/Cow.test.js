/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/adapter/Cow',
   'Types/_entity/adapter/CowTable',
   'Types/_entity/adapter/CowRecord'
], function(
   CowEs,
   CowTableEs,
   CowRecordEs
) {
   'use strict';

   var CowAdapter = CowEs.default;
   var CowTable = CowTableEs.default;
   var CowRecord = CowRecordEs.default;

   describe('Types/_entity/adapter/Cow', function() {
      var Mock,
         original,
         adapter;

      Mock = function() {};

      Mock.prototype.forTable = function(data) {
         return {
            getData: function() {
               return data;
            }
         };
      };

      Mock.prototype.forRecord = function(data) {
         return {
            getData: function() {
               return data;
            }
         };
      };

      Mock.prototype.getKeyField = function() {
         return 'id';
      };

      Mock.prototype.getProperty = function(data, property) {
         return data[property];
      };

      Mock.prototype.setProperty = function(data, property, value) {
         data[property] = value;
      };

      Mock.prototype.serialize = function() {
         return '{}';
      };

      beforeEach(function() {
         original = new Mock();
         adapter = new CowAdapter(original);
      });

      afterEach(function() {
         original = undefined;
         adapter = undefined;
      });

      describe('.forTable()', function() {
         it('should return table adapter', function() {
            assert.instanceOf(
               adapter.forTable(),
               CowTable
            );
         });

         it('should pass data to the table adapter', function() {
            var data = [{foo: 'bar'}];
            assert.strictEqual(
               adapter.forTable(data).getData(),
               data
            );
         });
      });

      describe('.forRecord()', function() {
         it('should return record adapter', function() {
            assert.instanceOf(
               adapter.forRecord(),
               CowRecord
            );
         });

         it('should pass data to the record adapter', function() {
            var data = {foo: 'bar'};
            assert.strictEqual(
               adapter.forRecord(data).getData(),
               data
            );
         });
      });

      describe('.getKeyField()', function() {
         it('should return "id"', function() {
            assert.equal(adapter.getKeyField({}), 'id');
         });
      });

      describe('.getProperty()', function() {
         it('should return the property value', function() {
            assert.equal(
               adapter.getProperty({foo: 'bar'}, 'foo'),
               'bar'
            );
         });
      });

      describe('.setProperty()', function() {
         it('should set the property value', function() {
            var data = {foo: 'bar'};
            adapter.setProperty(data, 'foo', 'baz');
            assert.equal(
               data.foo,
               'baz'
            );
         });
      });

      describe('.serialize()', function() {
         it('should return "{}"', function() {
            assert.equal(adapter.serialize({}), '{}');
         });
      });

      describe('.getOriginal()', function() {
         it('should return original adapter', function() {
            assert.strictEqual(adapter.getOriginal(), original);
         });
      });

      describe('.toJSON()', function() {
         it('should serialize the adapter', function() {
            var json = adapter.toJSON();

            assert.strictEqual(json.module, 'Types/entity:adapter.Cow');
         });
      });

      describe('.fromJSON()', function() {
         it('should restore the wrapped original', function() {
            var json = adapter.toJSON(),
               clone = CowAdapter.prototype.fromJSON.call(CowAdapter, json);

            assert.instanceOf(clone.getOriginal(), Mock);
         });
      });
   });
});
