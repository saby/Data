/* global define, describe, context, it, assert */
define([
   'Types/entity',
   'Types/collection',
   'Types/_entity/Model',
   'Types/_formatter/dateToSql'
], function(
   type,
   collection,
   TypesModel,
   toSql
) {
   'use strict';
   TypesModel = TypesModel.default;
   describe('Types/_entity/factory', function() {
      var Factory = type.factory;
      var JsonAdapter = type.adapter.Json;
      var Model = type.Model;
      var Enum = collection.Enum;
      var Flags = collection.Flags;
      var List = collection.List;
      var RecordSet = collection.RecordSet;
      var TimeInterval = type.TimeInterval;
      var getFormatMock = function(type) {
         var format = {};
         format.getType = function() {
            return type;
         };
         return format;
      };

      var getUniversalFormatMock = function(type) {
         var format = {};
         format.type = type;
         return format;
      };

      describe('.cast()', function() {
         context('for integer', function() {
            it('should return a Number', function() {
               assert.strictEqual(Factory.cast(1, 'integer'), 1);
               assert.strictEqual(Factory.cast('1', 'integer'), 1);
               assert.strictEqual(Factory.cast('1a', 'integer'), 1);
               assert.strictEqual(Factory.cast('0890', 'integer'), 890);
            });

            it('should return null', function() {
               assert.strictEqual(Factory.cast('a', 'integer'), null);
               assert.strictEqual(Factory.cast('a1', 'integer'), null);
            });

            it('should return passed value', function() {
               assert.isNull(Factory.cast(null, 'integer'));
               assert.isUndefined(Factory.cast(undefined, 'integer'));
            });
         });

         context('for string', function() {
            it('should return passed value', function() {
               assert.strictEqual(Factory.cast('bar', 'string'), 'bar');
               assert.strictEqual(Factory.cast(1, 'string'), 1);
               assert.isNull(Factory.cast(null, 'string'));
               assert.isUndefined(Factory.cast(undefined, 'string'));
            });
         });

         context('for link', function() {
            it('should return a Number', function() {
               assert.strictEqual(Factory.cast(1, 'link'), 1);
               assert.strictEqual(Factory.cast('1', 'link'), 1);
               assert.strictEqual(Factory.cast('1a', 'link'), 1);
               assert.strictEqual(Factory.cast('0890', 'link'), 890);
            });

            it('should return null', function() {
               assert.strictEqual(Factory.cast('a', 'link'), null);
               assert.strictEqual(Factory.cast('a1', 'link'), null);
            });

            it('should return passed value', function() {
               assert.isNull(Factory.cast(null, 'integer'));
               assert.isUndefined(Factory.cast(undefined, 'link'));
            });
         });

         context('for real and double', function() {
            it('should return a Number', function() {
               assert.strictEqual(Factory.cast(1.2, 'real'), 1.2);
               assert.strictEqual(Factory.cast('1.2', 'real'), 1.2);
               assert.strictEqual(Factory.cast('1a', 'real'), 1);
               assert.strictEqual(Factory.cast('0890', 'real'), 890);
            });

            it('should return null', function() {
               assert.strictEqual(Factory.cast('a', 'real'), null);
               assert.strictEqual(Factory.cast('a1', 'real'), null);
            });

            it('should return passed value', function() {
               assert.isNull(Factory.cast(null, 'real'));
               assert.isUndefined(Factory.cast(undefined, 'real'));
            });
         });

         context('for money', function() {
            it('should return a Number', function() {
               assert.strictEqual(Factory.cast(1.2, 'money'), 1.2);
            });

            it('should return passed value', function() {
               assert.strictEqual(Factory.cast('1.2', 'money'), '1.2');
               assert.strictEqual(Factory.cast('0890', 'money'), '0890');
               assert.strictEqual(Factory.cast('1a', 'money'), '1a');
               assert.strictEqual(Factory.cast('a', 'money'), 'a');
               assert.strictEqual(Factory.cast('a1', 'money'), 'a1');

               assert.isNull(Factory.cast(null, 'money'));
               assert.isUndefined(Factory.cast(undefined, 'money'));
            });

            it('should return passed value if precision less or equal 3 ', function() {
               var format = getFormatMock('money');
               format.getPrecision = function() {
                  return 3;
               };

               assert.strictEqual(Factory.cast(1.2, format.getType(), {format: format}), 1.2);
            });

            it('should return formatted value if precision more then 3 ', function() {
               var format = getFormatMock('money');
               format.getPrecision = function() {
                  return 4;
               };

               assert.strictEqual(
                  Factory.cast(1.2, format.getType(), {format: format}),
                  '1.2000'
               );
            });

            it('should return passed value if "large" flag is enabled ', function() {
               var format = getFormatMock('money');
               format.isLarge = function() {
                  return true;
               };

               assert.strictEqual(Factory.cast('1.2', format.getType(), {format: format}), '1.2');
            });
         });

         context('for datetime, date and time', function() {
            it('should return a Date for datetime', function() {
               var datetime = '2015-09-24 15:54:28.981+03',
                  value = Factory.cast(datetime, 'datetime');

               assert.instanceOf(value, Date);
               assert.strictEqual(value.getTime(), 1443099268981);
               assert.strictEqual(value.getSQLSerializationMode(), Date.SQL_SERIALIZE_MODE_DATETIME);
            });

            it('should return a Date for date', function() {
               var date = '2015-09-24',
                  value = Factory.cast(date, 'date');

               assert.instanceOf(value, Date);
               assert.strictEqual(value.getTime(), 1443042000000);
               assert.strictEqual(value.getSQLSerializationMode(), Date.SQL_SERIALIZE_MODE_DATE);
            });

            it('should return a Date for time', function() {
               var time = '15:54:28.981+03',
                  value = Factory.cast(time, 'time');

               assert.instanceOf(value, Date);
               assert.strictEqual(value.getHours(), 15);
               assert.strictEqual(value.getMinutes(), 54);
               assert.strictEqual(value.getSeconds(), 28);
               assert.strictEqual(value.getMilliseconds(), 981);
               assert.strictEqual(value.getTimezoneOffset(), -180);
               assert.strictEqual(value.getSQLSerializationMode(), Date.SQL_SERIALIZE_MODE_TIME);
            });

            it('should return Infinity', function() {
               var time = 'infinity',
                  value = Factory.cast(time, 'date');

               assert.strictEqual(value, Infinity);
            });

            it('should return -Infinity', function() {
               var time = '-infinity',
                  value = Factory.cast(time, 'date');

               assert.strictEqual(value, -Infinity);
            });

            it('should return passed value', function() {
               var value = new Date();
               assert.strictEqual(Factory.cast(value, 'datetime'), value);

               assert.isNull(Factory.cast(null, 'datetime'));
               assert.isUndefined(Factory.cast(undefined, 'datetime'));
            });
         });

         context('for timeinterval', function() {
            it('should return a String', function() {
               var interval = new TimeInterval('P10DT0H0M0S');
               assert.strictEqual(Factory.cast(interval, 'timeinterval'), 'P10DT0H0M0S');
            });

            it('should return passed value', function() {
               assert.strictEqual(Factory.cast('P10DT0H0M0S', 'timeinterval'), 'P10DT0H0M0S');
               assert.isNull(Factory.cast(null, 'timeinterval'));
               assert.isUndefined(Factory.cast(undefined, 'timeinterval'));
            });
         });

         context('for array', function() {
            it('should return an Array of String from Field', function() {
               var format = getFormatMock('array'),
                  array = ['foo', 'bar'];

               format.getKind = function() {
                  return 'string';
               };
               assert.deepEqual(
                  Factory.cast(array, format.getType(), {format: format}),
                  ['foo', 'bar']
               );
            });

            it('should return an Array of Number from UniversalField', function() {
               var format = getUniversalFormatMock('array'),
                  array = ['1', '2a', 3];

               format.meta = {
                  kind: 'integer'
               };

               assert.deepEqual(
                  Factory.cast(array, format.type, {format: format}),
                  [1, 2, 3]
               );
            });

            it('should return an Array from scalar', function() {
               var format = getFormatMock('array');
               format.getKind = function() {
                  return 'string';
               };
               assert.deepEqual(
                  Factory.cast('foo', format.getType(), {format: format}),
                  ['foo']
               );
            });

            it('should return passed value', function() {
               var format = getFormatMock('array');
               format.getKind = function() {
                  return 'string';
               };
               assert.isNull(Factory.cast(null, format.getType(), {format: format}));
               assert.isUndefined(Factory.cast(undefined, format.getType(), {format: format}));
            });
         });

         context('for identity', function() {
            it('should return same value for Identity', function() {
               var value = ['bar'];
               assert.strictEqual(Factory.cast(value, 'identity'), value);
               assert.isNull(Factory.cast(null, 'identity'));
            });

            it('should return null', function() {
               assert.isNull(Factory.cast(null, 'identity'));
            });
         });

         context('for hierarchy', function() {
            it('should return passed value', function() {
               assert.strictEqual(Factory.cast('bar', 'hierarchy'), 'bar');
               assert.strictEqual(Factory.cast(1, 'hierarchy'), 1);
               assert.isNull(Factory.cast(null, 'hierarchy'));
               assert.isUndefined(Factory.cast(undefined, 'hierarchy'));
            });
         });

         context('for enum', function() {
            it('should return an Enum from Field', function() {
               var format = getFormatMock('enum'),
                  value;

               format.getDictionary = function() {
                  return ['one', 'two'];
               };
               value = Factory.cast(1, Enum, {format: format});
               assert.instanceOf(value, Enum);
               assert.strictEqual(value.get(), 1);
            });

            it('should return an Enum for null if dictionary contains null', function() {
               var format = new type.format.EnumField({
                  dictionary: {null: 'null', 0: 'one', 1: 'two'}
               });

               var value = Factory.cast(null, Enum, {format: format});
               assert.instanceOf(value, Enum);
               assert.strictEqual(value.get(), null);
               assert.strictEqual(value.getAsValue(), 'null');
            });

            it('should return null for null if dictionary don\'t contains null', function() {
               var format = getFormatMock('enum'),
                  value;

               format.getDictionary = function() {
                  return {0: 'one', 1: 'two'};
               };
               value = Factory.cast(null, Enum, {format: format});
               assert.isNull(value);
            });

            it('should return an Enum from UniversalField', function() {
               var format = getUniversalFormatMock('enum'),
                  value;

               format.meta = {
                  dictionary: ['one', 'two']
               };

               value = Factory.cast(1, Enum, {format: format});
               assert.instanceOf(value, Enum);
               assert.strictEqual(value.get(), 1);
            });

            it('should return an Enum from UniversalField', function() {
               var format = getUniversalFormatMock('enum'),
                  value;

               format.meta = {
                  dictionary: ['one', 'two']
               };

               value = Factory.cast(1, Enum, {format: format});
               assert.instanceOf(value, Enum);
               assert.strictEqual(value.get(), 1);
            });

            it('should return an Enum from shortcut', function() {
               var format = getFormatMock('enum'),
                  value;

               format.getDictionary = function() {
                  return [];
               };
               value = Factory.cast(1, 'enum', {format: format});
               assert.instanceOf(value, Enum);
            });

            it('should return same instance for Enum', function() {
               var value = new Enum();

               assert.strictEqual(
                  Factory.cast(value, Enum),
                  value
               );
            });

            it('should return passed value', function() {
               var format = getFormatMock('enum');
               assert.isNull(Factory.cast(null, Enum, {format: format}));
               assert.isUndefined(Factory.cast(undefined, Enum, {format: format}));
            });
         });

         context('for flags', function() {
            it('should return a Flags from Field', function() {
               var format = getFormatMock('flags'),
                  value;

               format.getDictionary = function() {
                  return ['one', 'two', 'three'];
               };
               value = Factory.cast([true, null, false], Flags, {format: format});
               assert.instanceOf(value, Flags);
               assert.isTrue(value.get('one'));
               assert.isNull(value.get('two'));
               assert.isFalse(value.get('three'));
               assert.isUndefined(value.get('four'));
            });

            it('should return a Flags from UniversalField', function() {
               var format = getUniversalFormatMock('flags'),
                  value;

               format.meta = {
                  dictionary: ['one', 'two', 'three']
               };

               value = Factory.cast([true, null, false], Flags, {format: format});
               assert.instanceOf(value, Flags);
               assert.isTrue(value.get('one'));
               assert.isNull(value.get('two'));
               assert.isFalse(value.get('three'));
               assert.isUndefined(value.get('four'));
            });

            it('should return a Flags from shortcut', function() {
               var format = getFormatMock('flags'),
                  value;

               format.getDictionary = function() {
                  return [];
               };
               value = Factory.cast([true, null, false], 'flags', {format: format});
               assert.instanceOf(value, Flags);
            });

            it('should return same instance for Flags', function() {
               var value = new Flags();

               assert.strictEqual(
                  Factory.cast(value, Flags),
                  value
               );
            });

            it('should return passed value', function() {
               var format = getFormatMock('flags');
               assert.isNull(Factory.cast(null, Flags, {format: format}));
               assert.isUndefined(Factory.cast(undefined, Flags, {format: format}));
            });
         });

         context('for record', function() {
            it('should return a Model from UniversalField', function() {
               var value = Factory.cast(
                  {foo: 'bar'},
                  Model,
                  {format: getUniversalFormatMock('record'), adapter: 'Types/entity:adapter.Json'}
               );
               assert.instanceOf(value, Model);
               assert.instanceOf(value.getAdapter(), JsonAdapter);
               assert.strictEqual(value.get('foo'), 'bar');
            });

            it('should return a Model from shortcut', function() {
               var value = Factory.cast(
                  {foo: 'bar'},
                  'record',
                  {format: getUniversalFormatMock('record'), adapter: 'Types/entity:adapter.Json'}
               );
               assert.instanceOf(value, Model);
               assert.strictEqual(value.get('foo'), 'bar');
            });

            it('should return same instance for Record', function() {
               var value = new TypesModel();
               assert.strictEqual(Factory.cast(value, 'record'), value);
            });

            it('should return passed value', function() {
               assert.isNull(Factory.cast(
                  null,
                  'record',
                  {format: getUniversalFormatMock('record'), adapter: 'Types/entity:adapter.Json'}
               ));
               assert.isUndefined(
                  Factory.cast(
                     undefined,
                     'record',
                     {format: getUniversalFormatMock('record'), adapter: 'Types/entity:adapter.Json'}
                  ));
            });
         });

         context('for recordset', function() {
            it('should return a RecordSet from UniversalField', function() {
               var value = Factory.cast(
                  [{foo: 'bar'}],
                  RecordSet,
                  {format: getUniversalFormatMock('recordset'), adapter: 'Types/entity:adapter.Json'}
               );
               assert.instanceOf(value, RecordSet);
               assert.instanceOf(value.getAdapter(), JsonAdapter);
               assert.strictEqual(value.getCount(), 1);
               assert.strictEqual(value.at(0).get('foo'), 'bar');
            });

            it('should return a RecordSet from shortcut', function() {
               var value = Factory.cast(
                  [{foo: 'bar'}],
                  'recordset',
                  {format: getUniversalFormatMock('recordset'), adapter: 'Types/entity:adapter.Json'}
               );
               assert.instanceOf(value, RecordSet);
               assert.strictEqual(value.at(0).get('foo'), 'bar');
            });

            it('should return same instance for RecordSet', function() {
               var value = new RecordSet();
               assert.strictEqual(Factory.cast(value, RecordSet), value);
            });

            it('should return passed value', function() {
               assert.isNull(Factory.cast(
                  null,
                  'recordset',
                  {format: getUniversalFormatMock('recordset'), adapter: 'Types/entity:adapter.Json'}
               ));
               assert.isUndefined(Factory.cast(
                  undefined,
                  'recordset',
                  {format: getUniversalFormatMock('recordset'), adapter: 'Types/entity:adapter.Json'}
               ));
            });

            it('should return a RecordSet with the injected model', function() {
               var Model = function() {};
               var value = Factory.cast([], RecordSet, {
                  format: {
                     name: 'foo',
                     type: 'recordset'
                  },
                  adapter: 'Types/entity:adapter.Json',
                  model: Model
               });

               assert.strictEqual(value.getModel(), Model);
            });
         });

         context('for only type constructor', function() {
            it('should return a Number', function() {
               var value = Factory.cast(10, Number);
               assert.instanceOf(value, Number);
               assert.equal(value, 10);
            });

            it('should return a Date', function() {
               var value = Factory.cast('2001-02-03', Date);
               assert.instanceOf(value, Date);
               assert.equal(value.getFullYear(), 2001);
               assert.equal(value.getMonth(), 1);
               assert.equal(value.getDate(), 3);
            });
         });
      });

      describe('.serialize()', function() {
         context('for integer', function() {
            it('should return a Number', function() {
               assert.strictEqual(
                  Factory.serialize(1, {format: getUniversalFormatMock('integer')}),
                  1
               );
               assert.strictEqual(
                  Factory.serialize('1', {format: getUniversalFormatMock('integer')}),
                  1
               );
               assert.strictEqual(
                  Factory.serialize('0890', {format: getUniversalFormatMock('integer')}),
                  890
               );
            });

            it('should return a Number from Object', function() {
               var obj = {};
               obj.valueOf = function() {
                  return 33;
               };
               assert.strictEqual(
                  Factory.serialize(obj, {format: getUniversalFormatMock('integer')}),
                  33
               );
            });

            it('should return a Number from Array', function() {
               var arr = [1];
               assert.strictEqual(
                  Factory.serialize(arr, {format: getUniversalFormatMock('integer')}),
                  1
               );
            });

            it('should return null', function() {
               assert.strictEqual(
                  Factory.serialize('1a', {format: getUniversalFormatMock('integer')}),
                  null
               );
               assert.strictEqual(
                  Factory.serialize('a', {format: getUniversalFormatMock('integer')}),
                  null
               );
               assert.strictEqual(
                  Factory.serialize('a1', {format: getUniversalFormatMock('integer')}),
                  null
               );
            });

            it('should return passed value', function() {
               assert.isNull(Factory.serialize(null, {format: getUniversalFormatMock('integer')}));
               assert.isUndefined(Factory.serialize(undefined, {format: getUniversalFormatMock('integer')}));
            });
         });

         context('for string', function() {
            it('should return passed value', function() {
               assert.strictEqual(Factory.serialize('bar', getUniversalFormatMock('string')), 'bar');
               assert.strictEqual(Factory.serialize(1, getUniversalFormatMock('string')), 1);
               assert.isNull(Factory.serialize(null, getUniversalFormatMock('string')));
               assert.isUndefined(Factory.serialize(undefined, getUniversalFormatMock('string')));
            });
         });

         context('for link', function() {
            it('should return a Number', function() {
               assert.strictEqual(
                  Factory.serialize(1, {format: getUniversalFormatMock('link')}),
                  1
               );
               assert.strictEqual(
                  Factory.serialize('1', {format: getUniversalFormatMock('link')}),
                  1
               );
               assert.strictEqual(
                  Factory.serialize('1a', {format: getUniversalFormatMock('link')}),
                  1
               );
               assert.strictEqual(
                  Factory.serialize('0890', {format: getUniversalFormatMock('link')}),
                  890
               );
            });

            it('should return NaN', function() {
               assert.isTrue(
                  isNaN(Factory.serialize('a', {format: getUniversalFormatMock('link')}))
               );
               assert.isTrue(
                  isNaN(Factory.serialize('a1', {format: getUniversalFormatMock('link')}))
               );
            });

            it('should return passed value', function() {
               assert.isNull(Factory.serialize(null, 'integer'));
               assert.isUndefined(Factory.serialize(undefined, {format: getUniversalFormatMock('link')}));
            });
         });

         context('for real and double', function() {
            it('should return passed value', function() {
               assert.strictEqual(
                  Factory.serialize(1.2, {format: getUniversalFormatMock('real')}),
                  1.2
               );
               assert.strictEqual(
                  Factory.serialize('1.2', {format: getUniversalFormatMock('real')}),
                  '1.2'
               );
               assert.strictEqual(
                  Factory.serialize('1a', {format: getUniversalFormatMock('real')}),
                  '1a'
               );
               assert.strictEqual(
                  Factory.serialize('0890', {format: getUniversalFormatMock('real')}),
                  '0890'
               );
               assert.strictEqual(
                  Factory.serialize('a', {format: getUniversalFormatMock('real')}),
                  'a'
               );
               assert.strictEqual(
                  Factory.serialize('a1', {format: getUniversalFormatMock('real')}),
                  'a1'
               );
               assert.isNull(Factory.serialize(null, {format: getUniversalFormatMock('real')}));
               assert.isUndefined(Factory.serialize(undefined, {format: getUniversalFormatMock('real')}));
            });
         });

         context('for money', function() {
            it('should return passed value', function() {
               assert.strictEqual(
                  Factory.serialize('1.2', {format: getUniversalFormatMock('money')}),
                  '1.2'
               );
               assert.strictEqual(
                  Factory.serialize('0890', {format: getUniversalFormatMock('money')}),
                  '0890'
               );
               assert.strictEqual(
                  Factory.serialize('1a', {format: getUniversalFormatMock('money')}),
                  '1a'
               );
               assert.strictEqual(
                  Factory.serialize('a', {format: getUniversalFormatMock('money')}),
                  'a'
               );
               assert.strictEqual(
                  Factory.serialize('a1', {format: getUniversalFormatMock('money')}),
                  'a1'
               );
               assert.isNull(Factory.serialize(null, {format: getUniversalFormatMock('money')}));
               assert.isUndefined(Factory.serialize(undefined, {format: getUniversalFormatMock('money')}));
            });

            it('should return passed value if precision less or equal 3', function() {
               var format = getFormatMock('money');
               format.getPrecision = function() {
                  return 3;
               };

               assert.strictEqual(
                  Factory.serialize(1.2, {format: format}),
                  1.2
               );
            });

            it('should return formatted value if precision more than 3', function() {
               var format = new type.format.MoneyField({
                  precision: 4
               });

               assert.strictEqual(
                  Factory.serialize(1.2, {format: format}),
                  '1.2000'
               );
            });

            it('should return passed value if "large" flag is enabled', function() {
               var format = getFormatMock('money');
               format.isLarge = function() {
                  return true;
               };

               assert.strictEqual(
                  Factory.serialize('1.2', {format: format}),
                  '1.2'
               );
            });
         });

         context('for datetime, date and time', function() {
            it('should return a String with time zone for datetime', function() {
               var datetime = new Date(1443099268981);
               assert.strictEqual(
                  Factory.serialize(datetime, {format: getUniversalFormatMock('datetime')}),
                  '2015-09-24 15:54:28.981+03'
               );
            });

            it('should return a String without timezone for datetime and UniversalField', function() {
               var datetime = new Date(2001, 3, 15),
                  format = getUniversalFormatMock('datetime');
               format.meta = {
                  withoutTimeZone: true
               };

               assert.strictEqual(
                  Factory.serialize(datetime, {format: format}),
                  '2001-04-15 00:00:00'
               );
            });

            it('should return a String without timezone for datetime and DateTimeField', function() {
               var format = new type.format.DateTimeField({
                  withoutTimeZone: true
               });
               var datetime = new Date(2001, 3, 15);

               assert.strictEqual(
                  Factory.serialize(datetime, {format: format}),
                  '2001-04-15 00:00:00'
               );
            });

            it('should return a String for date', function() {
               var datetime = new Date(1443099268981);
               assert.strictEqual(
                  Factory.serialize(datetime, {format: getUniversalFormatMock('date')}),
                  '2015-09-24'
               );
            });

            it('should return a String for time', function() {
               var datetime = new Date(1443099268981);
               assert.strictEqual(
                  Factory.serialize(datetime, {format: getUniversalFormatMock('time')}),
                  '15:54:28.981+03'
               );
            });

            it('should return a String for Infinity', function() {
               assert.equal(
                  Factory.serialize(Infinity, {format: getUniversalFormatMock('date')}),
                  'infinity'
               );
            });

            it('should return a String for -Infinity', function() {
               assert.equal(
                  Factory.serialize(-Infinity, {format: getUniversalFormatMock('date')}),
                  '-infinity'
               );
            });

            it('should return a String with current date for empty string', function() {
               assert.strictEqual(
                  Factory.serialize('', {format: getUniversalFormatMock('date')}),
                  toSql(new Date(), toSql.MODE_DATE)
               );
            });

            it('should return passed value', function() {
               assert.strictEqual(
                  Factory.serialize('bar', {format: getUniversalFormatMock('datetime')}),
                  'bar'
               );
               assert.isNull(Factory.serialize(null, {format: getUniversalFormatMock('datetime')}));
               assert.isUndefined(Factory.serialize(undefined, {format: getUniversalFormatMock('datetime')}));
            });
         });

         context('for timeinterval', function() {
            it('should return a String', function() {
               var interval = new TimeInterval('P10DT0H0M0S');
               assert.strictEqual(
                  Factory.serialize(interval, {format: getUniversalFormatMock('timeinterval')}),
                  'P10DT0H0M0S'
               );
            });

            it('should return passed value', function() {
               assert.strictEqual(
                  Factory.serialize('P10DT0H0M0S', {format: getUniversalFormatMock('timeinterval')}),
                  'P10DT0H0M0S'
               );
               assert.isNull(Factory.serialize(null, {format: getUniversalFormatMock('timeinterval')}));
               assert.isUndefined(Factory.serialize(undefined, {format: getUniversalFormatMock('timeinterval')}));
            });
         });

         context('for array', function() {
            it('should return an Array of String from Field', function() {
               var format = getFormatMock('array'),
                  array = ['foo', 'bar'];

               format.getKind = function() {
                  return 'string';
               };
               assert.deepEqual(
                  Factory.serialize(array, {format: format}),
                  ['foo', 'bar']
               );
            });

            it('should return an Array of Number from UniversalField', function() {
               var format = getUniversalFormatMock('array'),
                  array = ['1', '2a', 3];

               format.meta = {
                  kind: 'integer'
               };

               assert.deepEqual(
                  Factory.serialize(array, {format: format}),
                  [1, null, 3]
               );
            });
            it('should return an Array from scalar', function() {
               var format = new type.format.ArrayField({
                  kind: 'string'
               });

               assert.deepEqual(
                  Factory.serialize('foo', {format: format}),
                  ['foo']
               );
            });

            it('should return passed value', function() {
               var format = getFormatMock('array');
               assert.isNull(Factory.serialize(null, {format: format}));
               assert.isUndefined(Factory.serialize(undefined, {format: format}));
            });
         });

         context('for identity', function() {
            it('should return passed value', function() {
               assert.deepEqual(
                  Factory.serialize('foo', {format: getUniversalFormatMock('identity')}),
                  'foo'
               );

               assert.deepEqual(
                  Factory.serialize(['foo'], {format: getUniversalFormatMock('identity')}),
                  ['foo']
               );
            });

            it('should return null', function() {
               assert.isNull(
                  Factory.serialize(null, {format: getUniversalFormatMock('identity')})
               );
            });
         });

         context('for hierarchy', function() {
            it('should return passed value', function() {
               assert.strictEqual(
                  Factory.serialize('bar', {format: getUniversalFormatMock('hierarchy')}),
                  'bar'
               );
               assert.strictEqual(
                  Factory.serialize(1, {format: getUniversalFormatMock('hierarchy')}),
                  1
               );
               assert.isNull(Factory.serialize(null, {format: getUniversalFormatMock('hierarchy')}));
               assert.isUndefined(Factory.serialize(undefined, {format: getUniversalFormatMock('hierarchy')}));
            });
         });

         context('for enum', function() {
            it('should return Number from Enum', function() {
               var value = new Enum({
                  dictionary: ['one', 'two'],
                  index: 1
               });

               assert.strictEqual(
                  Factory.serialize(value, {format: getUniversalFormatMock('enum')}),
                  1
               );
            });

            it('should return passed value', function() {
               assert.strictEqual(
                  Factory.serialize('bar', {format: getUniversalFormatMock('enum')}),
                  'bar'
               );
               assert.isNull(Factory.serialize(null, {format: getUniversalFormatMock('enum')}));
               assert.isUndefined(Factory.serialize(undefined, {format: getUniversalFormatMock('enum')}));
            });
         });

         context('for flags', function() {
            it('should return an Array from Flags', function() {
               var value = new Flags({
                  dictionary: ['one', 'two', 'three'],
                  values: [null, true, false]
               });

               assert.deepEqual(
                  Factory.serialize(value, {format: getUniversalFormatMock('flags')}),
                  [null, true, false]
               );
            });

            it('should return an Array from Array', function() {
               var value = [true, null, false];
               assert.strictEqual(
                  Factory.serialize(value, {format: getUniversalFormatMock('flags')}),
                  value
               );
            });

            it('should return passed value', function() {
               assert.isNull(Factory.serialize(null, {format: getUniversalFormatMock('flags')}));
               assert.isUndefined(Factory.serialize(undefined, {format: getUniversalFormatMock('flags')}));
            });
         });

         context('for record', function() {
            it('should return Model\'s raw data', function() {
               var data = {foo: 'bar'},
                  value = new Model({rawData: data});

               assert.strictEqual(
                  Factory.serialize(value, {format: getUniversalFormatMock('record')}),
                  data
               );
            });

            it('should return passed value', function() {
               assert.isNull(Factory.serialize(null, {format: getUniversalFormatMock('record')}));
               assert.isUndefined(Factory.serialize(undefined, {format: getUniversalFormatMock('record')}));
            });
         });

         context('for recordset', function() {
            it('should return RecordSet\'s raw data', function() {
               var data = [{foo: 'bar'}],
                  value = new RecordSet({rawData: data});

               assert.strictEqual(
                  Factory.serialize(value, {format: getUniversalFormatMock('recordset')}),
                  data
               );
            });

            it('should return build RecordSet from List', function() {
               var data = {foo: 'bar'},
                  rec = new Model({rawData: data}),
                  value = new List({items: [rec]});

               assert.deepEqual(
                  Factory.serialize(value, {format: getUniversalFormatMock('recordset')}),
                  [data]
               );
            });

            it('should return passed value', function() {
               assert.isNull(Factory.serialize(null, {format: getUniversalFormatMock('recordset')}));
               assert.isUndefined(Factory.serialize(undefined, {format: getUniversalFormatMock('recordset')}));
            });
         });
      });
   });
});
