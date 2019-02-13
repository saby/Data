/* global define, beforeEach, afterEach, describe, context, it, assert */
define([
   'Types/_entity/adapter/Abstract',
   'Types/_entity/Record',
   'Types/_collection/RecordSet',
   'Types/_source/DataSet'
], function(
   AbstractAdapter,
   Record,
   RecordSet,
   DataSet
) {
   'use strict';

   AbstractAdapter = AbstractAdapter.default;
   Record = Record.default;
   RecordSet = RecordSet.default;
   DataSet = DataSet.default;

   describe('Types/_entity/adapter/Abstract', function() {
      var adapter;

      beforeEach(function() {
         adapter = new AbstractAdapter();
      });

      afterEach(function() {
         adapter = undefined;
      });

      describe('.serialize()', function() {
         it('should return data as is', function() {
            var data = {
               a: 1,
               b: '2',
               c: false,
               d: true,
               e: null,
               f: [1, false, true, null, [2], {foo: 'bar'}],
               g: {g1: 2, g2: 'q'}
            };
            assert.deepEqual(adapter.serialize(data), data);
         });

         it('should return Record\'s raw data', function() {
            var rawData = {foo: 'bar'},
               data = {rec: new Record({
                  rawData: rawData
               })
               };

            assert.deepEqual(adapter.serialize(data).rec, rawData);
         });

         it('should return RecordSet\'s raw data', function() {
            var rawData = [{foo: 'bar'}],
               data = {rs: new RecordSet({
                  rawData: rawData
               })
               };

            assert.deepEqual(adapter.serialize(data).rs, rawData);
         });

         it('should return DataSet\'s raw data', function() {
            var rawData = [[{foo: 'bar'}]],
               data = {ds: new DataSet({
                  rawData: rawData
               })
               };

            assert.deepEqual(adapter.serialize(data).ds, rawData);
         });

         it('should return wrapped scalar value', function() {
            var Foo = function(value) {
                  this.value = value;
               },
               foo;

            Foo.prototype = Object.create(Object.prototype);
            Foo.prototype.valueOf = function() {
               return this.value;
            };
            foo = new Foo('bar');

            assert.deepEqual(adapter.serialize(foo), 'bar');
         });

         it('should throw TypeError for unsupported complex object', function() {
            var Foo = function(value) {
                  this.value = value;
               },
               foo;

            Foo.prototype = Object.create(Object.prototype);
            foo = new Foo('bar');

            assert.throws(function() {
               adapter.serialize(foo);
            }, TypeError);
         });

         it('should return Date as string use default serialization mode', function() {
            var year = 2016,
               month = 11,
               day = 12,
               date = new Date(year, month, day);

            assert.isTrue(
               adapter.serialize(date).startsWith('2016-12-12 00:00:00')
            );
         });

         it('should return Date as string use "datetime" serialization mode', function() {
            var year = 2016,
               month = 11,
               day = 12,
               date = new Date(year, month, day);

            if (date.setSQLSerializationMode) {
               date.setSQLSerializationMode(Date.SQL_SERIALIZE_MODE_DATETIME);
               assert.isTrue(
                  adapter.serialize(date).startsWith('2016-12-12 00:00:00')
               );
            }
         });
      });
   });
});
