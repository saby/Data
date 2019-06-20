/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/Record',
   'Types/_collection/ObservableList',
   'Types/_collection/RecordSet',
   'Types/_collection/format/Format',
   'Types/_entity/adapter/Sbis',
   'Types/_entity/format/IntegerField',
   'Types/_entity/format/fieldsFactory',
   'Core/core-extend',
   'Types/_collection/Enum',
   'Types/_collection/Flags',
   'Core/Date'
], function(
   Record,
   ObservableList,
   RecordSet,
   Format,
   SbisAdapter,
   IntegerField,
   fieldsFactory,
   extend
) {
   'use strict';

   Record = Record.default;
   ObservableList = ObservableList.default;
   RecordSet = RecordSet.default;
   SbisAdapter = SbisAdapter.default;
   Format = Format.default;
   IntegerField = IntegerField.default;
   fieldsFactory = fieldsFactory.default;

   describe('Types/_entity/Record', function() {
      var getRecordData = function() {
            return {
               max: 10,
               title: 'A',
               id: 1
            };
         },
         getRecordSbisData = function() {
            return {
               _type: 'record',
               d: [
                  1,
                  'A',
                  10,
                  {d: [], s: []}
               ],
               s: [{
                  n: 'id',
                  t: 'Число целое'
               }, {
                  n: 'title',
                  t: 'Строка'
               }, {
                  n: 'max',
                  t: 'Число целое'
               }, {
                  n: 'rec',
                  t: 'Запись'
               }]
            };
         },
         getRecordFormat = function() {
            return [
               {name: 'id', type: 'integer'},
               {name: 'title', type: 'string'},
               {name: 'max', type: 'integer'},
               {name: 'rec', type: 'record'}
            ];
         },
         getRecord = function(data) {
            return new Record({
               rawData: data || getRecordData()
            });
         },
         record,
         recordData;

      beforeEach(function() {
         recordData = getRecordData();
         record = getRecord(recordData);
      });

      afterEach(function() {
         recordData = undefined;
         record = undefined;
      });

      describe('.constructor()', function() {
         var getFormatDeclaration = function() {
            return [{
               name: 'id',
               type: 'integer'
            }, {
               name: 'title',
               type: 'string'
            }, {
               name: 'descr',
               type: 'string',
               defaultValue: '-'
            }, {
               name: 'main',
               type: 'boolean',
               defaultValue: true
            }];
         };

         it('should add the default values from injected format to the raw data', function() {
            var record = new Record({
                  format: getFormatDeclaration()
               }),
               data = record.getRawData();
            assert.strictEqual(data.id, 0);
            assert.strictEqual(data.title, null);
            assert.strictEqual(data.descr, '-');
            assert.strictEqual(data.main, true);
         });

         it('should add the default values from inherited format to the raw data', function() {
            var SubRecord = function() {
                  return new Record({
                     format: getFormatDeclaration()
                  });
               },
               record = new SubRecord(),
               data = record.getRawData();
            assert.strictEqual(data.id, 0);
            assert.strictEqual(data.title, null);
            assert.strictEqual(data.descr, '-');
            assert.strictEqual(data.main, true);
         });

         it('should ignore option "format" value if "owner" passed', function() {
            var record = new Record({
               format: getFormatDeclaration(),
               owner: new RecordSet()
            });
            assert.isNull(record.getRawData());
         });

         it('should throw TypeError if option "owner" value is not a RecordSet', function() {
            assert.throws(function() {
               new Record({
                  owner: {}
               });
            }, TypeError);
         });

         it('should create writable record by default', function() {
            var record = new Record();
            assert.isTrue(record.writable);
         });

         it('should create read only record with option value', function() {
            var record = new Record({
               writable: false
            });
            assert.isFalse(record.writable);
         });
      });

      describe('.destroy()', function() {
         it('should destroy only instances of Types/_entity/DestroyableMixin', function() {
            var root = new Record();
            var foo = {
               destroy: function() {
                  this.destroyed = true;
               }
            };
            var bar = new Record();
            root.set('foo', foo);
            root.set('bar', bar);

            root.destroy();
            assert.isTrue(root.destroyed);
            assert.isUndefined(foo.destroyed);
            assert.isTrue(bar.destroyed);
         });

         it('shouldn\'t destroy same child twice', function() {
            var root = new Record();
            var foo = new Record();
            var bar = new Record();
            root.set('foo', foo);
            foo.set('bar', bar);
            root.set('bar', bar);

            root.destroy();
            assert.isTrue(root.destroyed);
            assert.isTrue(foo.destroyed);
            assert.isTrue(bar.destroyed);
         });

         it('should throw ReferenceError on any method call after destroy', function() {
            var record = new Record();
            record.get('foo');
            record.destroy();
            assert.throws(function() {
               record.get('foo');
            }, ReferenceError);
         });
      });

      describe('.get()', function() {
         it('should return a value from the raw data', function() {
            assert.strictEqual(record.get('max'), recordData.max);
            assert.strictEqual(record.get('title'), recordData.title);
            assert.strictEqual(record.get('id'), recordData.id);
         });

         it('should return a value with given type', function() {
            var MyNumber = function(value) {
                  this.value = value;
               },
               record,
               value;

            MyNumber.prototype = Object.create(Number.prototype);
            MyNumber.prototype.constructor = MyNumber;
            MyNumber.prototype.valueOf = function() {
               return this.value;
            };

            record = new Record({
               format: [
                  {name: 'foo', type: MyNumber}
               ],
               rawData: {
                  foo: 1000
               }
            });

            value = record.get('foo');
            assert.instanceOf(value, MyNumber);
            assert.equal(value, 1000);
         });

         it('should return a single instance for Object', function() {
            var record = new Record({
                  adapter: 'Types/entity:adapter.Sbis',
                  rawData: getRecordSbisData()
               }),
               value = record.get('rec');

            assert.instanceOf(value, Record);
            assert.strictEqual(record.get('rec'), value);
            assert.strictEqual(record.get('rec'), value);
         });

         it('should return cached field value', function() {
            var values = [1, 2, 3],
               model = new Record({
                  cacheMode: Record.CACHE_MODE_ALL,
                  rawData: {
                     get foo() {
                        return values.pop();
                     }
                  }
               });

            assert.strictEqual(model.get('foo'), 3);
            assert.strictEqual(values.length, 2);
            assert.strictEqual(model.get('foo'), 3);
            assert.strictEqual(values.length, 2);
         });

         it('should return value from the raw data if it\'s even not defined in the format', function() {
            var record = new Record({
               format: [
                  {name: 'a', type: 'integer'}
               ],
               rawData: {
                  a: 1,
                  b: 2
               }
            });

            assert.strictEqual(record.get('a'), 1);
            assert.strictEqual(record.get('b'), 2);
         });

         it('should inherit the field format from the recordset format', function() {
            var rs = new RecordSet({
                  format: [{
                     name: 'created',
                     type: 'date',
                     defaultValue: new Date()
                  }]
               }),
               record,
               format;

            rs.add(new Record({
               rawData: {
                  created: '2015-01-02 10:11:12'
               }
            }));
            record = rs.at(0);
            format = record.getFormat();

            assert.strictEqual(format.at(0).getName(), 'created');
            assert.strictEqual(format.at(0).getType(), 'date');

            assert.instanceOf(record.get('created'), Date);
         });

         it('should create inner record with different mediator', function() {
            var data = {
                  foo: {
                     bar: 'baz'
                  }
               },
               record = new Record({
                  format: [
                     {name: 'foo', type: 'record'}
                  ],
                  rawData: data
               });

            assert.notEqual(
               record.get('foo')._getMediator(),
               record._getMediator()
            );
         });
      });

      describe('.set()', function() {
         it('should set value', function() {
            record.set('max', 13);
            assert.strictEqual(record.get('max'), 13);
         });

         it('should set values', function() {
            record.set({
               max: 13,
               title: 'test'
            });
            assert.strictEqual(record.get('max'), 13);
            assert.strictEqual(record.get('title'), 'test');
         });

         it('should revert changed value with old scalar', function() {
            var old = record.get('title');

            record.set('title', 'foo');
            assert.include(record.getChanged(), 'title');

            record.set('title', old);
            assert.notInclude(record.getChanged(), 'title');
         });

         it('should revert changed value with old Object-wrapper', function() {
            var old = new Date(),
               record = new Record({
                  rawData: {foo: old}
               });

            record.set('foo', new Date(0, 0, 0));
            assert.include(record.getChanged(), 'foo');

            record.set('foo', old);
            assert.notInclude(record.getChanged(), 'foo');
         });

         it('should update raw data if child\'s record raw data replaced', function() {
            var root = new Record({
                  rawData: {rec: {foo: 'bar'}},
                  format: [{name: 'rec', type: 'record'}]
               }),
               rec = root.get('rec');

            rec.setRawData({foo: 'baz'});

            assert.equal(root.getRawData().rec.foo, 'baz');
         });

         it('should update raw data for Array', function() {
            var record = new Record({
               format: [{name: 'foo', type: 'array', kind: 'string'}],
               rawData: {
                  foo: ['bar']
               }
            });

            var foo = record.get('foo');
            foo.push('new');
            record.set('foo', foo);

            var data = record.getRawData();
            assert.strictEqual(data.foo[0], 'bar');
            assert.strictEqual(data.foo[1], 'new');
         });

         it('should set value to the raw data if it\'s even not defined in the format', function() {
            var record = new Record({
               format: [
                  {name: 'a', type: 'integer'}
               ]
            });

            record.set('a', 1);
            assert.strictEqual(record.getRawData().a, 1);

            record.set('b', 2);
            assert.strictEqual(record.getRawData().b, 2);
         });

         it('should set value if field is not defined in raw data but defined in format', function() {
            var data = {
                  d: [1],
                  s: [{n: 'a', t: 'Число целое'}]
               },
               record = new Record({
                  format: {'b': 'integer'},
                  adapter: 'Types/entity:adapter.Sbis',
                  rawData: data
               });

            record.set('a', 10);
            assert.strictEqual(record.getRawData().d[0], 10);

            record.set('b', 2);
            assert.strictEqual(record.getRawData().d[1], 2);
         });

         it('should throw an TypeError if adapters incompatible', function() {
            var record = new Record(),
               sub = new Record({
                  adapter: 'Types/entity:adapter.Sbis'
               });

            assert.throws(function() {
               record.set('sub', sub);
            }, TypeError);
         });

         it('should don\'t throw an TypeError if adapters incompatible but object already aggregated', function() {
            var sub = new Record({
                  adapter: 'Types/entity:adapter.Sbis',
                  format: [{name: 'foo', type: 'string'}]
               }),
               record = new Record({
                  rawData: {
                     sub: sub
                  }
               });

            sub.set('foo', 'bar');
            assert.strictEqual(record.get('sub').get('foo'), 'bar');
         });

         it('should change cached field', function() {
            var record = new Record({
                  rawData: {date: '2016-10-10'},
                  format: [{name: 'date', type: 'date'}]
               }),
               curr = new Date();

            record.set('date', curr);
            assert.strictEqual(record.get('date'), curr);
            assert.isTrue(record.isChanged('date'));
         });

         it('should don\'t change cached field', function() {
            var record = new Record({
                  rawData: {date: '2016-10-10'},
                  format: [{name: 'date', type: 'date'}]
               }),
               prev = record.get('date');

            record.set('date', prev);
            assert.strictEqual(record.get('date'), prev);
            assert.isFalse(record.isChanged('date'));
         });


         it('should return the same instance of Object', function() {
            var obj = {};
            record.set('obj', obj);
            assert.strictEqual(record.get('obj'), obj);
         });

         it('should change value if it is RecordSet', function() {
            var record = new Record(),
               oldRs = new RecordSet(),
               newRs = new RecordSet();

            record.addField(
               {name: 'rs', type: 'recordset', defaultValue: null},
               0,
               oldRs
            );

            record.set('rs', newRs);
            assert.strictEqual(record.get('rs'), newRs);
         });

         it('should set value after set raw data null if record has format', function() {
            var record = new Record({
               format: [
                  {name: 'name', type: 'string'}
               ],
               adapter: 'Types/entity:adapter.Sbis'
            });
            record.setRawData(null);
            assert.doesNotThrow(function() {
               record.set('name', 'name');
            });
         });
      });

      describe('.subscribe()', function() {
         it('should trigger event handler from "handlers" option', function() {
            var triggered = false,
               handler = function() {
                  triggered = true;
               },
               record = new Record({
                  handlers: {
                     onPropertyChange: handler
                  }
               });

            record.set('foo', 'bar');
            record.destroy();

            assert.isTrue(triggered);
         });

         it('should trigger onPropertyChange if value changed', function() {
            var name,
               newV;
            record.subscribe('onPropertyChange', function(e, properties) {
               for (var key in properties) {
                  if (properties.hasOwnProperty(key)) {
                     name = key;
                     newV = properties[key];
                  }
               }
            });
            record.set('max', 13);
            assert.strictEqual(name, 'max');
            assert.strictEqual(newV, 13);
         });

         it('should not trigger onPropertyChange in read only mode', function() {
            var record = new Record({
                  writable: false,
                  rawData: recordData
               }),
               triggered = false;

            record.subscribe('onPropertyChange', function() {
               triggered = true;
            });
            record.set('max', 13);

            assert.isFalse(triggered);
         });

         it('should trigger onPropertyChange if values changed', function() {
            var name,
               newV;
            record.subscribe('onPropertyChange', function(e, properties) {
               for (var key in properties) {
                  if (properties.hasOwnProperty(key)) {
                     name = key;
                     newV = properties[key];
                  }
               }
            });
            record.set({
               max: 13,
               title: 'new'
            });
            assert.strictEqual(name, 'title');
            assert.strictEqual(newV, 'new');
         });

         it('should trigger onPropertyChange one by one', function() {
            var expect = ['f1', 'f2', 'f3'],
               order = [];
            record.subscribe('onPropertyChange', function(e, properties) {
               record.set('f2', 'v2');
               record.set('f3', 'v3');
               for (var k in properties) {
                  if (properties.hasOwnProperty(k)) {
                     order.push(k);
                  }
               }
            });
            record.set('f1', 'v1');

            assert.deepEqual(order, expect);
         });

         it('should not trigger onPropertyChange if value not changed', function() {
            var name,
               newV;
            record.subscribe('onPropertyChange', function(e, properties) {
               for (var key in properties) {
                  if (properties.hasOwnProperty(key)) {
                     name = key;
                     newV = properties[key];
                  }
               }
            });
            record.set('max', record.get('max'));
            assert.isUndefined(name);
            assert.isUndefined(newV);
         });

         it('should not trigger onPropertyChange if value is the same instance', function() {
            var firedCount = 0,
               instance = {},
               handler = function() {
                  firedCount++;
               };

            record.set('instance', instance);
            record.subscribe('onPropertyChange', handler);
            record.set('instance', instance);
            record.unsubscribe('onPropertyChange', handler);

            assert.equal(firedCount, 0);
         });

         it('should trigger onPropertyChange with deep changed item', function(done) {
            var sub = new Record(),
               list = new ObservableList(),
               top = new Record(),
               handler = function(event, map) {
                  try {
                     assert.strictEqual(map.list, list);
                     done();
                  } catch (err) {
                     done(err);
                  }
               };

            top.set('list', list);
            list.add(sub);

            top.subscribe('onPropertyChange', handler);
            sub.set('test', 'ok');
            top.unsubscribe('onPropertyChange', handler);
         });
      });

      describe('.getChanged()', function() {
         it('should return a changed value', function() {
            record.set('max', 15);
            record.set('title', 'B');
            assert.include(record.getChanged(), 'max');
            assert.include(record.getChanged(), 'title');
         });

         it('should return result without saved field on save same Number as String', function() {
            var record = new Record({
               format: {
                  foo: 'integer'
               },
               rawData: {
                  foo: 1
               }
            });

            var foo = record.get('foo');
            assert.typeOf(foo, 'number');
            record.set('foo', String(foo));
            assert.notInclude(record.getChanged(), 'foo');
         });

         it('should return result without saved field on save same Enum value', function() {
            var record = new Record({
               rawData: {
                  d: [0],
                  s: [{
                     n: 'enum',
                     t: {n: 'Перечисляемое', s: {'0': 'one', '1': 'two'}}
                  }]
               },
               adapter: 'Types/entity:adapter.Sbis'
            });
            record.set('enum', 0);
            assert.notInclude(record.getChanged(), 'enum');
         });
      });

      describe('.acceptChanges()', function() {
         it('should reset "Changed" state to "Unchanged"', function() {
            record.setState(Record.RecordState.CHANGED);
            record.acceptChanges();
            assert.strictEqual(record.getState(), Record.RecordState.UNCHANGED);
         });

         it('should reset "Added" state to "Unchanged"', function() {
            record.setState(Record.RecordState.ADDED);
            record.acceptChanges();
            assert.strictEqual(record.getState(), Record.RecordState.UNCHANGED);
         });

         it('should reset "Deleted" state to "Detached"', function() {
            record.setState(Record.RecordState.DELETED);
            record.acceptChanges();
            assert.strictEqual(record.getState(), Record.RecordState.DETACHED);
         });

         it('should keep "Detached" state', function() {
            record.setState(Record.RecordState.DETACHED);
            record.acceptChanges();
            assert.strictEqual(record.getState(), Record.RecordState.DETACHED);
         });

         it('should throw an error on invalid argument', function() {
            assert.throws(function() {
               record.acceptChanges(null);
            }, TypeError);

            assert.throws(function() {
               record.acceptChanges(0);
            }, TypeError);

            assert.throws(function() {
               record.acceptChanges('foo');
            }, TypeError);

            assert.throws(function() {
               record.acceptChanges({});
            }, TypeError);
         });

         it('should force getChanged() return an empty array', function() {
            record.set('max', 15);
            record.set('title', 'B');
            assert.isAbove(record.getChanged().length, 0);
            record.acceptChanges();
            assert.strictEqual(record.getChanged().length, 0);
         });

         it('should force getChanged() on parent record return an array with sub record', function() {
            var format = {
                  id: 'integer',
                  subrec: 'record'
               },
               record = new Record({
                  format: format,
                  rawData: {
                     id: 'foo',
                     subrec: {
                        id: 'bar'
                     }
                  }
               }),
               subRecord = record.get('subrec');

            subRecord.set('id', 'baz');
            assert.notEqual(record.getChanged().indexOf('subrec'), -1);
         });

         it('should force getChanged() on parent record return an array without sub record after accepting changes', function() {
            var format = {
                  id: 'integer',
                  subrec: 'record'
               },
               record = new Record({
                  format: format,
                  rawData: {
                     id: 'foo',
                     subrec: {
                        id: 'bar'
                     }
                  }
               }),
               subRecord = record.get('subrec');

            subRecord.set('id', 'baz');
            subRecord.acceptChanges();
            assert.equal(record.getChanged().indexOf('subrec'), -1);
         });

         it('should force getChanged() of parent record return an array without record field', function() {
            var format = {
                  id: 'integer',
                  subrec: 'record'
               },
               record = new Record({
                  format: format,
                  rawData: {
                     id: 'foo',
                     subrec: {
                        id: 'bar'
                     }
                  }
               }),
               subRecord = record.get('subrec');

            subRecord.set('id', 'baz');
            assert.isAbove(record.getChanged().indexOf('subrec'), -1);

            subRecord.acceptChanges(true);
            assert.equal(record.getChanged().indexOf('subrec'), -1);
         });

         it('should spread changes through the RecordSet to the top Record', function() {
            var top = new Record();
            var rs = new RecordSet({
               rawData: [{foo: ''}]
            });
            var sub = rs.at(0);
            top.set('items', rs);

            sub.set('foo', 'bar');
            assert.isTrue(top.isChanged('items'));

            sub.acceptChanges(true);
            assert.isFalse(top.isChanged('items'));
         });

         it('should accept changes only for given fields and keep the state', function() {
            record.set('max', 15);
            record.set('title', 'B');
            record.setState(Record.RecordState.CHANGED);
            record.acceptChanges(['max']);

            assert.strictEqual(record.getChanged().indexOf('max'), -1);
            assert.strictEqual(record.getChanged().indexOf('title'), 0);
            assert.strictEqual(record.getState(), Record.RecordState.CHANGED);
         });

         it('should accept changes only for given fields and change the state to "Unchanged"', function() {
            record.set('max', 15);
            record.set('title', 'B');
            record.setState(Record.RecordState.CHANGED);
            record.acceptChanges(['max', 'title']);

            assert.strictEqual(record.getChanged().indexOf('max'), -1);
            assert.strictEqual(record.getChanged().indexOf('title'), -1);
            assert.strictEqual(record.getState(), Record.RecordState.UNCHANGED);
         });
      });

      describe('.rejectChanges()', function() {
         it('should reset "Changed" state to "Detached"', function() {
            record.setState(Record.RecordState.CHANGED);
            record.rejectChanges();
            assert.strictEqual(record.getState(), Record.RecordState.DETACHED);
         });

         it('should reset "Changed" state to "Unchanged"', function() {
            record.setState(Record.RecordState.UNCHANGED);
            record.acceptChanges();

            record.setState(Record.RecordState.CHANGED);
            record.rejectChanges();
            assert.strictEqual(record.getState(), Record.RecordState.UNCHANGED);
         });

         it('should throw an error on invalid argument', function() {
            assert.throws(function() {
               record.rejectChanges(null);
            }, TypeError);

            assert.throws(function() {
               record.rejectChanges(0);
            }, TypeError);

            assert.throws(function() {
               record.rejectChanges('foo');
            }, TypeError);

            assert.throws(function() {
               record.rejectChanges({});
            }, TypeError);
         });

         it('should force get() return unchanged value', function() {
            var prev = {
               max: record.get('max'),
               title: record.get('title')
            };
            record.set('max', 15);
            record.set('title', 'B');
            record.rejectChanges();
            assert.strictEqual(record.get('max'), prev.max);
            assert.strictEqual(record.get('title'), prev.title);
         });

         it('should spread changes through the RecordSet to the top Record', function() {
            var top = new Record();
            var rs = new RecordSet({
               rawData: [{foo: ''}]
            });
            var sub = rs.at(0);
            top.set('items', rs);

            sub.set('foo', 'bar');
            assert.isTrue(top.isChanged('items'));

            sub.rejectChanges(true);
            assert.isFalse(top.isChanged('items'));
         });

         it('should don\'t revert value for Enum if option cloneChanged is disabled', function() {
            var record = new Record({
               format: {
                  foo: {
                     type: 'enum',
                     dictionary: ['one', 'two']
                  }
               },
               rawData: {
                  foo: 1
               }
            });

            record.get('foo').set(0);
            assert.strictEqual(record.isChanged('foo'), true);
            assert.strictEqual(record.get('foo').get(), 0);

            record.rejectChanges();
            assert.strictEqual(record.isChanged('foo'), false);
            assert.strictEqual(record.get('foo').get(), 0);
         });

         it('should revert value for Enum if option cloneChanged is enabled', function() {
            var record = new Record({
               cloneChanged: true,
               format: {
                  foo: {
                     type: 'enum',
                     dictionary: ['one', 'two']
                  }
               },
               rawData: {
                  foo: 1
               }
            });

            record.get('foo').set(0);
            assert.strictEqual(record.isChanged('foo'), true);
            assert.strictEqual(record.get('foo').get(), 0);

            record.rejectChanges();
            assert.strictEqual(record.isChanged('foo'), false);
            assert.strictEqual(record.get('foo').get(), 1);
         });

         it('should force getChanged() return an empty array', function() {
            record.set('max', 15);
            record.set('title', 'B');
            record.rejectChanges();
            assert.strictEqual(record.getChanged().length, 0);
         });

         it('should force getChanged() on parent record return an array with sub record', function() {
            var format = {
                  id: 'integer',
                  subrec: 'record'
               },
               record = new Record({
                  format: format,
                  rawData: {
                     id: 'foo',
                     subrec: {
                        id: 'bar'
                     }
                  }
               }),
               subRecord = record.get('subrec');

            subRecord.set('id', 'baz');
            assert.notEqual(record.getChanged().indexOf('subrec'), -1);
         });

         it('should force getChanged() on parent record return an array without sub record after accepting changes', function() {
            var format = {
                  id: 'integer',
                  subrec: 'record'
               },
               record = new Record({
                  format: format,
                  rawData: {
                     id: 'foo',
                     subrec: {
                        id: 'bar'
                     }
                  }
               }),
               subRecord = record.get('subrec');

            subRecord.set('id', 'baz');
            subRecord.rejectChanges();
            assert.equal(record.getChanged().indexOf('subrec'), -1);
         });

         it('should force getChanged() of parent record return an array without record field', function() {
            var format = {
                  id: 'integer',
                  subrec: 'record'
               },
               record = new Record({
                  format: format,
                  rawData: {
                     id: 'foo',
                     subrec: {
                        id: 'bar'
                     }
                  }
               }),
               subRecord = record.get('subrec');

            subRecord.set('id', 'baz');
            assert.isAbove(record.getChanged().indexOf('subrec'), -1);

            subRecord.rejectChanges(true);
            assert.equal(record.getChanged().indexOf('subrec'), -1);
         });

         it('should accept changes only for given fields and keep the state', function() {
            var prev = {
               max: record.get('max'),
               title: record.get('title')
            };

            record.set('max', 15);
            record.set('title', 'B');
            record.setState(Record.RecordState.CHANGED);
            record.rejectChanges(['max']);

            assert.strictEqual(record.get('max'), prev.max);
            assert.strictEqual(record.get('title'), 'B');
            assert.strictEqual(record.getChanged().indexOf('max'), -1);
            assert.strictEqual(record.getChanged().indexOf('title'), 0);
            assert.strictEqual(record.getState(), Record.RecordState.CHANGED);
         });

         it('should accept changes only for given fields and change the state to "Unchanged"', function() {
            var prev = {
               max: record.get('max'),
               title: record.get('title')
            };

            record.set('max', 15);
            record.set('title', 'B');
            record.setState(Record.RecordState.CHANGED);
            record.rejectChanges(['max', 'title']);

            assert.strictEqual(record.get('max'), prev.max);
            assert.strictEqual(record.get('title'), prev.title);
            assert.strictEqual(record.getChanged().indexOf('max'), -1);
            assert.strictEqual(record.getChanged().indexOf('title'), -1);
            assert.strictEqual(record.getState(), Record.RecordState.DETACHED);
         });
         it('should not throw error if given fields have never been changed', function() {
            var max = record.get('max');
            record.set('max', 15);
            record.setState(Record.RecordState.CHANGED);
            assert.doesNotThrow(function() {
               record.rejectChanges(['max', 'title']);
            });
            assert.strictEqual(record.get('max'), max);
         });
      });

      describe('.has()', function() {
         it('should return true for defined field', function() {
            for (var key in recordData) {
               if (recordData.hasOwnProperty(key)) {
                  assert.isTrue(record.has(key));
               }
            }
         });
         it('should return false for undefined field', function() {
            assert.isFalse(record.has('blah'));
            assert.isFalse(record.has('blah'));
         });
      });

      describe('.getEnumerator()', function() {
         it('should return fields in given order', function() {
            var enumerator = record.getEnumerator(),
               names = Object.keys(recordData),
               i = 0;
            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), names[i]);
               i++;
            }
         });
         it('should traverse all of fields', function() {
            var enumerator = record.getEnumerator(),
               count = Object.keys(recordData).length;
            assert.isTrue(count > 0);
            while (enumerator.moveNext()) {
               count--;
            }
            assert.strictEqual(count, 0);
         });
      });

      describe('.each()', function() {
         it('should return equivalent values', function() {
            record.each(function(name, value) {
               assert.strictEqual(record.get(name), value);
            });
         });
         it('should traverse all of fields', function() {
            var count = Object.keys(recordData).length;
            assert.isTrue(count > 0);
            record.each(function() {
               count--;
            });
            assert.strictEqual(count, 0);
         });
      });

      describe('.getRawData()', function() {
         it('should return a record data', function() {
            assert.notEqual(recordData, record.getRawData());
            assert.deepEqual(recordData, record.getRawData());
         });

         it('should return a shared record data', function() {
            assert.strictEqual(recordData, record.getRawData(true));
         });

         it('should change raw data if Enum property changed', function() {
            var record = new Record({
               rawData: {
                  d: [0],
                  s: [{
                     n: 'enum',
                     t: {n: 'Перечисляемое', s: {'0': 'one', '1': 'two'}}
                  }]
               },
               adapter: 'Types/entity:adapter.Sbis'
            });
            record.get('enum').set(1);
            assert.equal(record.getRawData().d[0], 1);
            assert.isTrue(record.isChanged('enum'));
         });

         it('should change raw data if Flags property changed', function() {
            var record = new Record({
               rawData: {
                  d: [[true, false]],
                  s: [{
                     n: 'flags',
                     t: {n: 'Флаги', s: {0: 'one', 1: 'two'}}
                  }]
               },
               adapter: 'Types/entity:adapter.Sbis'
            });
            record.get('flags').set('two', true);
            assert.equal(record.getRawData().d[0][1], true);
            assert.isTrue(record.isChanged('flags'));
         });
      });

      describe('.setRawData()', function() {
         it('should set data', function() {
            var newRecord = new Record({
               rawData: {}
            });
            newRecord.setRawData(recordData);
            assert.deepEqual(newRecord.getRawData(), recordData);
         });

         it('should trigger onPropertyChange with empty "properties" argument', function() {
            var given = {},
               handler = function(e, properties) {
                  given.properties = properties;
               };

            record.subscribe('onPropertyChange', handler);
            record.setRawData({a: 1, b: 2});
            record.unsubscribe('onPropertyChange', handler);

            assert.isObject(given.properties);
            assert.deepEqual(given.properties, {});
         });
      });

      describe('.getAdapter()', function() {
         it('should return an adapter', function() {
            var adapter = new SbisAdapter(),
               record = new Record({
                  adapter: adapter
               });
            assert.strictEqual(record.getAdapter(), adapter);
         });
      });

      describe('.getFormat()', function() {
         it('should build the empty format by default', function() {
            var record = new Record(),
               format = record.getFormat();
            assert.strictEqual(format.getCount(), 0);
         });

         it('should build the format from raw data', function() {
            var format = record.getFormat();
            assert.strictEqual(format.getCount(), Object.keys(recordData).length);
            format.each(function(item) {
               assert.isTrue(recordData.hasOwnProperty(item.getName()));
            });
         });

         it('should build the record format from Array', function() {
            var format = [{
                  name: 'id',
                  type: 'integer'
               }, {
                  name: 'title',
                  type: 'string'
               }, {
                  name: 'max',
                  type: 'integer'
               }, {
                  name: 'main',
                  type: 'boolean'
               }],
               record = new Record({
                  format: format,
                  rawData: recordData
               }),
               recordFormat = record.getFormat();

            assert.strictEqual(recordFormat.getCount(), format.length);
            recordFormat.each(function(item, index) {
               assert.strictEqual(item.getName(), format[index].name);
               assert.strictEqual(item.getType().toLowerCase(), format[index].type);
            });
         });

         it('should accept the record format from instance', function() {
            var format = new Format({
                  items: [new IntegerField({name: 'id'})]
               }),
               record = new Record({
                  format: format,
                  rawData: recordData
               });

            assert.isTrue(format.isEqual(record.getFormat()));
         });

         it('should set the field format from Object with declaration', function() {
            var format = {
                  id: {type: 'integer'}
               },
               fields = Object.keys(recordData),
               record = new Record({
                  format: format,
                  rawData: recordData
               }),
               recordFormat = record.getFormat();

            assert.equal(recordFormat.getCount(), fields.length);
            recordFormat.each(function(item, index) {
               assert.strictEqual(item.getName(), fields[index]);
               if (item.getName() === 'id') {
                  assert.strictEqual(item.getType(), 'integer');
               }
            });
         });

         it('should add the field format from Object with declaration', function() {
            var format = {
                  foo: {type: 'integer'}
               },
               fields = Object.keys(recordData),
               record = new Record({
                  format: format,
                  rawData: recordData
               }),
               recordFormat = record.getFormat();

            assert.equal(recordFormat.getCount(), fields.length + 1);
            recordFormat.each(function(item, index) {
               assert.strictEqual(item.getName(), fields[index] || 'foo');
            });
         });

         it('should set the field format from Object with string declaration', function() {
            var format = {
                  id: 'integer'
               },
               fields = Object.keys(recordData),
               record = new Record({
                  format: format,
                  rawData: recordData
               }),
               recordFormat = record.getFormat();

            assert.equal(recordFormat.getCount(), fields.length);
            recordFormat.each(function(item, index) {
               assert.strictEqual(item.getName(), fields[index]);
               if (item.getName() === 'id') {
                  assert.strictEqual(item.getType(), 'integer');
               }
            });
         });

         it('should set the field format from Object with custom type declaration', function() {
            var format = {
                  id: Date
               },
               fields = Object.keys(recordData),
               record = new Record({
                  format: format,
                  rawData: recordData
               }),
               recordFormat = record.getFormat();

            assert.equal(recordFormat.getCount(), fields.length);
            recordFormat.each(function(item, index) {
               assert.strictEqual(item.getName(), fields[index]);
               if (item.getName() === 'id') {
                  assert.strictEqual(item.getType(), Date);
               }
            });
         });

         it('should set the field format from Object with field instance', function() {
            var idField = new IntegerField(),
               format = {
                  id: idField
               },
               fields = Object.keys(recordData),
               record = new Record({
                  format: format,
                  rawData: recordData
               }),
               recordFormat = record.getFormat();

            assert.equal(recordFormat.getCount(), fields.length);
            recordFormat.each(function(item, index) {
               assert.strictEqual(item.getName(), fields[index]);
               if (item.getName() === 'id') {
                  assert.strictEqual(item.getType(), 'Integer');
               }
            });
         });

         it('should inherit from the recordset format', function() {
            var record = new Record({
                  rawData: {
                     date: '2015-01-02 10:11:12'
                  }
               }),
               rs = new RecordSet({
                  format: [{
                     name: 'date',
                     type: 'date',
                     defaultValue: new Date()
                  }]
               }),
               format;
            rs.add(record);
            format = record.getFormat();
            assert.strictEqual(format.at(0).getName(), 'date');
         });
      });

      describe('.addField()', function() {
         it('should add the field from the declaration', function() {
            var index = 1,
               fieldName = 'login',
               fieldDefault = 'user';

            record.addField({
               name: fieldName,
               type: 'string',
               defaultValue: fieldDefault
            }, index);

            assert.strictEqual(record.getFormat().at(index).getName(), fieldName);
            assert.strictEqual(record.getFormat().at(index).getDefaultValue(), fieldDefault);
            assert.strictEqual(record.get(fieldName), fieldDefault);
            assert.strictEqual(record.getRawData()[fieldName], fieldDefault);
         });

         it('should add the field from the instance', function() {
            var fieldName = 'login',
               fieldDefault = 'username';
            record.addField(fieldsFactory({
               name: fieldName,
               type: 'string',
               defaultValue: fieldDefault
            }));
            var index = record.getFormat().getCount() - 1;

            assert.strictEqual(record.getFormat().at(index).getName(), fieldName);
            assert.strictEqual(record.getFormat().at(index).getDefaultValue(), fieldDefault);
            assert.strictEqual(record.get(fieldName), fieldDefault);
            assert.strictEqual(record.getRawData()[fieldName], fieldDefault);
         });

         it('should add the field with the value', function() {
            var fieldName = 'login',
               fieldValue = 'root';
            record.addField({name: fieldName, type: 'string', defaultValue: 'user'}, 0, fieldValue);

            assert.strictEqual(record.get(fieldName), fieldValue);
            assert.strictEqual(record.getRawData()[fieldName], fieldValue);
         });

         it('should throw an error if the field is already defined', function() {
            assert.throws(function() {
               record.addField({name: 'title', type: 'string'});
            });
         });

         it('should throw an error if add the field twice', function() {
            record.addField({name: 'new', type: 'string'});
            assert.throws(function() {
               record.addField({name: 'new', type: 'string'});
            });
         });

         it('should throw an error if the record has an owner', function() {
            var rs = new RecordSet(),
               record;
            rs.add(new Record());
            record = rs.at(0);
            assert.throws(function() {
               record.addField({name: 'new', type: 'string'});
            });
         });

         it('should add the empty record field', function() {
            var fieldName = 'rec';
            record.addField({name: fieldName, type: 'record'});

            assert.isNull(record.get(fieldName));
            assert.isNull(record.getRawData()[fieldName]);
         });

         it('should add the filled record field', function() {
            var fieldName = 'rec';
            record.addField(
               {name: fieldName, type: 'record'},
               0,
               new Record({rawData: {a: 1}})
            );

            assert.strictEqual(record.get(fieldName).get('a'), 1);
            assert.strictEqual(record.getRawData()[fieldName].a, 1);
         });

         it('should add the empty recordset field', function() {
            var fieldName = 'rs';
            record.addField({name: fieldName, type: 'recordset'});

            assert.isNull(record.get(fieldName));
            assert.isNull(record.getRawData()[fieldName]);
         });

         it('should add the filled recordset field', function() {
            var fieldName = 'rs';
            record.addField(
               {name: fieldName, type: 'recordset'},
               0,
               new RecordSet({rawData: [{a: 1}]})
            );

            assert.strictEqual(record.get(fieldName).at(0).get('a'), 1);
            assert.strictEqual(record.getRawData()[fieldName][0].a, 1);
         });

         it('should add a sbis hierarhy field', function() {
            var
               record = new Record({
                  adapter: 'Types/entity:adapter.Sbis',
                  rawData: {
                     _type: 'record',
                     s: [
                        {n: 'parent', t: 'Идентификатор'},
                        {n: 'parent@', t: 'Логическое'},
                        {n: 'parent$', t: 'Логическое'}
                     ],
                     d: [[null], null, null]
                  }
               }),
               record2 = new Record({
                  adapter: 'Types/entity:adapter.Sbis'
               });
            record.getFormat().each(function(field) {
               record2.addField(field, undefined, record.get(field.getName()));
            });
            assert.deepEqual(record.getRawData(), record2.getRawData());
         });

         it('should trigger onPropertyChange event with default value', function() {
            var result;
            var handler = function(event, map) {
               result = map;
            };

            record.subscribe('onPropertyChange', handler);
            record.addField({name: 'foo', type: 'string', defaultValue: 'bar'}, 0);
            record.unsubscribe('onPropertyChange', handler);

            assert.equal(result.foo, 'bar');
         });

         it('should trigger onPropertyChange event with argument value', function() {
            var result;
            var handler = function(event, map) {
               result = map;
            };

            record.subscribe('onPropertyChange', handler);
            record.addField({name: 'foo', type: 'string', defaultValue: 'bar'}, 0, 'baz');
            record.unsubscribe('onPropertyChange', handler);

            assert.equal(result.foo, 'baz');
         });

         it('should change owner\'s raw data', function() {
            var parent = new Record();
            var child = new Record();

            parent.set('foo', child);
            assert.strictEqual(parent.getRawData().foo, null);

            child.addField({name: 'bar', type: 'string'});
            assert.deepEqual(parent.getRawData().foo, {bar: null});
         });
      });

      describe('.removeField()', function() {
         it('should remove the exists field', function() {
            var fieldName = 'title',
               record = new Record({
                  rawData: {title: 'test'},
                  format: [{name: fieldName, type: 'string'}]
               });
            record.removeField(fieldName);

            assert.strictEqual(record.getFormat().getFieldIndex(fieldName), -1);
            assert.isFalse(record.has(fieldName));
            assert.isUndefined(record.get(fieldName));
            assert.isUndefined(record.getRawData()[fieldName]);
         });

         it('should throw an error for not defined field', function() {
            assert.throws(function() {
               record.removeField('some');
            });
         });

         it('should throw an error if remove the field twice', function() {
            var fieldName = 'title',
               record = new Record({
                  format: [{name: fieldName, type: 'string'}]
               });
            record.removeField(fieldName);
            assert.throws(function() {
               record.removeField(fieldName);
            });
         });

         it('should throw an error if the record has an owner', function() {
            var rs = new RecordSet(),
               record;

            rs.add(new Record({
               rawData: {a: 1}
            }));

            record = rs.at(0);
            assert.throws(function() {
               record.removeField('a');
            });
         });

         it('should remove cached field value', function() {
            var value = {bar: 'baz'},
               record = new Record({
                  rawData: {foo: value}
               });

            assert.strictEqual(record.get('foo'), value);
            record.removeField('foo');
            assert.isUndefined(record.get('foo'));
         });

         it('should trigger onPropertyChange event', function() {
            var record = new Record({
               rawData: {foo: 'bar'}
            });
            var result;
            var handler = function(event, map) {
               result = map;
            };

            record.subscribe('onPropertyChange', handler);
            record.removeField('foo');
            record.unsubscribe('onPropertyChange', handler);

            assert.isTrue(result.hasOwnProperty('foo'));
            assert.isUndefined(result.foo);
         });

         it('should change owner\'s raw data', function() {
            var parent = new Record();
            var child = new Record({rawData: {bar: 'baz'}});

            parent.set('foo', child);
            assert.deepEqual(parent.getRawData().foo, {bar: 'baz'});

            child.removeField('bar');
            assert.deepEqual(parent.getRawData().foo, {});
         });
      });

      describe('.removeFieldAt()', function() {
         it('should throw an error if adapter doesn\'t support fields indexes', function() {
            assert.throws(function() {
               record.removeFieldAt(1);
            });
         });

         it('should remove the exists field', function() {
            var format = getRecordFormat(),
               fieldIndex = 1,
               fieldName = format[fieldIndex].name,
               record = new Record({
                  format: format,
                  adapter: 'Types/entity:adapter.Sbis',
                  rawData: getRecordSbisData()
               });
            record.clone();
            record.removeFieldAt(fieldIndex);

            assert.notEqual(record.getFormat().at(fieldIndex).getName(), fieldName);
            assert.isFalse(record.has(fieldName));
            assert.isUndefined(record.get(fieldName));
            assert.isUndefined(record.getRawData()[fieldName]);
         });

         it('should throw an error for not exists index', function() {
            assert.throws(function() {
               var record = new Record({
                  adapter: 'Types/entity:adapter.Sbis'
               });
               record.removeFieldAt(0);
            });
         });

         it('should throw an error if the record has an owner', function() {
            var record = new Record({
                  adapter: 'Types/entity:adapter.Sbis'
               }),
               rs = new RecordSet({
                  adapter: 'Types/entity:adapter.Sbis'
               });

            record.addField({name: 'a', type: 'string'});
            record.removeFieldAt(0);

            record.addField({name: 'a', type: 'string'});
            rs.add(record);

            record = rs.at(0);
            assert.throws(function() {
               record.removeFieldAt(0);
            });
         });

         it('should remove cached field value', function() {
            var value = {bar: 'baz'},
               record = new Record({
                  format: {
                     foo: 'object'
                  },
                  adapter: 'Types/entity:adapter.Sbis'
               });

            record.set('foo', value);

            assert.strictEqual(record.get('foo'), value);
            record.removeFieldAt(0);
            assert.isUndefined(record.get('foo'));
         });

         it('should trigger onPropertyChange event', function() {
            var record = new Record({
               format: {
                  foo: 'string'
               },
               adapter: 'Types/entity:adapter.Sbis'
            });
            record.set('foo', 'bar');
            var result;
            var handler = function(event, map) {
               result = map;
            };

            record.subscribe('onPropertyChange', handler);
            record.removeFieldAt(0);
            record.unsubscribe('onPropertyChange', handler);

            assert.isTrue(result.hasOwnProperty('foo'));
            assert.isUndefined(result.foo);
         });

         it('should change owner\'s raw data', function() {
            var parent = new Record({
               adapter: new SbisAdapter(),
               format: {foo: 'record'}
            });
            var child = new Record({
               adapter: new SbisAdapter(),
               format: {bar: 'string'}
            });
            child.set('bar', 'baz');

            parent.set('foo', child);
            assert.deepEqual(parent.getRawData().d[0].d, ['baz']);

            child.removeFieldAt(0);
            assert.deepEqual(parent.getRawData().d[0].d, []);
         });
      });

      describe('.isChanged()', function() {
         it('should return false by default', function() {
            assert.isFalse(record.isChanged('id'));
            assert.isFalse(record.isChanged());
         });

         it('should return false for undefined property', function() {
            assert.isFalse(record.isChanged('not-exists-prop'));
         });

         it('should return true after field change', function() {
            record.set('id', 123);
            assert.isTrue(record.isChanged('id'));
            assert.isTrue(record.isChanged());
         });

         it('should return true after set a new field', function() {
            record.set('aaa', 321);
            assert.isTrue(record.isChanged('aaa'));
            assert.isTrue(record.isChanged());
         });

         it('should return true for deep changed item', function() {
            var sub = new Record(),
               list = new ObservableList(),
               top = new Record();

            sub.set('test', 'v1');
            list.add(sub);
            top.set('list', list);
            top.acceptChanges();

            assert.isFalse(top.isChanged('list'));
            sub.set('test', 'v2');
            assert.isTrue(top.isChanged('list'));
         });
      });

      describe('.isEqual()', function() {
         it('should accept an invalid argument', function() {
            assert.isFalse(record.isEqual());
            assert.isFalse(record.isEqual(null));
            assert.isFalse(record.isEqual(false));
            assert.isFalse(record.isEqual(true));
            assert.isFalse(record.isEqual(0));
            assert.isFalse(record.isEqual(1));
            assert.isFalse(record.isEqual({}));
            assert.isFalse(record.isEqual([]));
         });

         it('should return true for the same record', function() {
            var same = new Record({
               rawData: getRecordData()
            });
            assert.isTrue(record.isEqual(same));
         });

         it('should return true for itself', function() {
            assert.isTrue(record.isEqual(record));
         });

         it('should return true for the clone', function() {
            assert.isTrue(record.isEqual(record.clone()));
         });

         it('should return true for empties', function() {
            var record = new Record();
            assert.isTrue(record.isEqual(new Record()));
         });

         it('should return false if field changed', function() {
            var same = new Record({
               rawData: getRecordData()
            });
            same.set('title', 'B');
            assert.isFalse(record.isEqual(same));
         });

         it('should return true with shared raw data', function() {
            var anotherRecord = getRecord();
            assert.isTrue(record.isEqual(anotherRecord));
         });

         it('should return true with same raw data', function() {
            var anotherRecord = getRecord(getRecordData());
            assert.isTrue(record.isEqual(anotherRecord));
         });

         it('should return false with different raw data', function() {
            var data = getRecordData();
            data.someField = 'someValue';
            var anotherRecord = getRecord(data);
            assert.isFalse(record.isEqual(anotherRecord));

            data = getRecordData();
            for (var key in data) {
               if (data.hasOwnProperty(key)) {
                  delete data[key];
                  break;
               }
            }
            anotherRecord = getRecord(data);
            assert.isFalse(record.isEqual(anotherRecord));
         });

         it('should return false for changed and true for reverted back record', function() {
            var anotherRecord = getRecord(getRecordData());
            anotherRecord.set('max', 1 + record.get('max'));
            assert.isFalse(record.isEqual(anotherRecord));

            anotherRecord.set('max', record.get('max'));
            assert.isTrue(record.isEqual(anotherRecord));
         });

         it('should return true with itself', function() {
            assert.isTrue(record.isEqual(record));

            record.set('max', 1 + record.get('max'));
            assert.isTrue(record.isEqual(record));
         });

         it('should return true for same module and submodule', function() {
            var MyRecord = extend.extend(Record, {}),
               recordA = new Record(),
               recordB = new Record(),
               recordC = new MyRecord();
            assert.isTrue(recordA.isEqual(recordB));
            assert.isTrue(recordA.isEqual(recordC));
         });

         it('should work fine with invalid argument', function() {
            assert.isFalse(record.isEqual());
            assert.isFalse(record.isEqual(null));
            assert.isFalse(record.isEqual(false));
            assert.isFalse(record.isEqual(true));
            assert.isFalse(record.isEqual(0));
            assert.isFalse(record.isEqual(1));
            assert.isFalse(record.isEqual(''));
            assert.isFalse(record.isEqual('a'));
            assert.isFalse(record.isEqual([]));
            assert.isFalse(record.isEqual({}));
         });
      });

      describe('.clone()', function() {
         it('should not be same as original', function() {
            assert.notEqual(record.clone(), record);
            assert.notEqual(record.clone(true), record);
         });

         it('should not be same as previous clone', function() {
            assert.notEqual(record.clone(), record.clone());
         });

         it('should clone rawData', function() {
            var clone = record.clone();
            assert.notEqual(record.getRawData(), clone.getRawData());
            assert.deepEqual(record.getRawData(), clone.getRawData());
         });

         it('should clone changed fields', function() {
            var cloneA = record.clone();
            assert.isFalse(cloneA.isChanged('id'));
            assert.strictEqual(record.isChanged('id'), cloneA.isChanged('id'));
            assert.strictEqual(record.isChanged(), cloneA.isChanged());
            assert.isFalse(cloneA.isChanged());

            record.set('a', 1);
            var cloneB = record.clone();
            assert.strictEqual(record.isChanged('a'), cloneB.isChanged('a'));
            assert.isTrue(cloneB.isChanged('a'));
            assert.strictEqual(record.isChanged('id'), cloneB.isChanged('id'));
            assert.isFalse(cloneB.isChanged('id'));
            assert.strictEqual(record.isChanged(), cloneB.isChanged());
            assert.isTrue(cloneB.isChanged());
         });

         it('should give equal fields', function() {
            var clone = record.clone();
            record.each(function(name, value) {
               assert.strictEqual(value, clone.get(name));
            });
            clone.each(function(name, value) {
               assert.strictEqual(value, record.get(name));
            });
         });

         it('should clone state markers', function() {
            var cloneA = record.clone();
            assert.strictEqual(record.getState(), cloneA.getState());

            record.setState(Record.RecordState.DELETED);
            var cloneB = record.clone();
            assert.strictEqual(record.getState(), cloneB.getState());
         });

         it('should keep recordset format', function() {
            var rs = new RecordSet({
                  format: {
                     foo: Date
                  },
                  rawData: [
                     {foo: '2008-09-28'}
                  ]
               }),
               item = rs.at(0),
               clone = item.clone();

            assert.instanceOf(clone.get('foo'), Date);
         });

         it('should make raw data unlinked from original', function() {
            var cloneA = record.clone();
            assert.equal(cloneA.get('max'), record.get('max'));
            cloneA.set('max', 1);
            assert.notEqual(cloneA.get('max'), record.get('max'));

            var cloneB = record.clone();
            assert.equal(cloneB.get('max'), record.get('max'));
            record.set('max', 12);
            assert.notEqual(cloneB.get('max'), record.get('max'));
         });

         it('should make raw data linked to original if shallow', function() {
            var clone = record.clone(true);
            assert.strictEqual(record.getRawData(true), clone.getRawData(true));
         });

         it('should make data unlinked between several clones', function() {
            var cloneA = record.clone();
            var cloneB = record.clone();
            assert.equal(cloneA.get('max'), cloneB.get('max'));
            cloneA.set('max', 1);
            assert.notEqual(cloneA.get('max'), cloneB.get('max'));
         });

         it('should return equal rawData if data container signature presented', function() {
            var rawData = {
                  _type: 'record',
                  _mustRevive: true,
                  s: [],
                  d: []
               },
               record = new Record({
                  rawData: rawData,
                  adapter: 'Types/entity:adapter.Sbis'
               }),
               clone = record.clone();
            assert.deepEqual(clone.getRawData(true), rawData);
         });
      });

      describe('.getOwner()', function() {
         it('should return null by default', function() {
            assert.isNull(record.getOwner());
         });

         it('should return value passed to the constructor', function() {
            var owner = new RecordSet(),
               record = new Record({
                  owner: owner
               });
            assert.strictEqual(record.getOwner(), owner);
         });
      });

      describe('.detach()', function() {
         it('should reset owner to the null', function() {
            var record = new Record({
               owner: new RecordSet()
            });
            record.detach();
            assert.isNull(record.getOwner());
         });

         it('should reset state to Detached', function() {
            var record = new Record({
               owner: new RecordSet(),
               state: Record.RecordState.UNCHANGED
            });
            record.detach();
            assert.strictEqual(record.getState(), Record.RecordState.DETACHED);
         });
      });

      describe('.getState()', function() {
         it('should return Detached by default', function() {
            assert.strictEqual(record.getState(), Record.RecordState.DETACHED);
         });
         it('should return state passed to the constructor', function() {
            var record = new Record({
               state: Record.RecordState.UNCHANGED
            });
            assert.strictEqual(record.getState(), Record.RecordState.UNCHANGED);
         });
         it('should return "Changed" from previous "Unchanged" after change any field value', function() {
            var record = new Record({
               state: Record.RecordState.UNCHANGED
            });
            record.set('id', -1);
            assert.strictEqual(record.getState(), Record.RecordState.CHANGED);
         });
         it('should keep "Detached" after change any field value', function() {
            var record = new Record({
               state: Record.RecordState.DETACHED
            });
            record.set('id', -1);
            assert.strictEqual(record.getState(), Record.RecordState.DETACHED);
         });
         it('should keep "Added" after change any field value', function() {
            var record = new Record({
               state: Record.RecordState.ADDED
            });
            record.set('id', -1);
            assert.strictEqual(record.getState(), Record.RecordState.ADDED);
         });
         it('should keep "Deleted" after change any field value', function() {
            var record = new Record({
               state: Record.RecordState.DELETED
            });
            record.set('id', -1);
            assert.strictEqual(record.getState(), Record.RecordState.DELETED);
         });
      });

      describe('.setState()', function() {
         it('should set the new state', function() {
            record.setState(Record.RecordState.DELETED);
            assert.strictEqual(record.getState(), Record.RecordState.DELETED);
         });
      });

      describe('.toJSON()', function() {
         it('should serialize a Record', function() {
            var json = record.toJSON(),
               options = record._getOptions();
            delete options.owner;

            assert.strictEqual(json.module, 'Types/entity:Record');
            assert.isNumber(json.id);
            assert.isTrue(json.id > 0);
            assert.deepEqual(json.state.$options, options);
            assert.deepEqual(json.state._changedFields, record._changedFields);
         });

         it('should serialize a Record with format', function() {
            var record = new Record({
                  format: [{name: 'id', type: 'integer'}]
               }),
               json = record.toJSON();

            assert.isTrue(
               record.getFormat().isEqual(
                  json.state.$options.format
               )
            );
         });

         it('should set subclass\'s module name', function() {
            var Sub = extend.extend(Record, {
                  _moduleName: 'My.Sub'
               }),
               record = new Sub(),
               json = record.toJSON();
            assert.strictEqual(json.module, 'My.Sub');
         });

         it('should throw an error if subclass\'s module name is not defined', function() {
            var Sub = extend.extend(Record, {}),
               record = new Sub();
            assert.throws(function() {
               record.toJSON();
            });
         });

         it('should keep original raw data if old extend used', function() {
            var SubRecord = extend.extend(Record, {
                  _moduleName: 'SubRecord',
                  $protected: {
                     _options: {
                        foo: 'bar'
                     }
                  }
               }),
               getFirstData = function() {
                  return {first: true};
               },
               getSecondData = function() {
                  return {second: true};
               },
               record = new SubRecord({
                  rawData: getFirstData()
               });

            record.setRawData(getSecondData());
            assert.deepEqual(record.getRawData(), getSecondData());
            record.toJSON();
            assert.deepEqual(record.getRawData(), getSecondData());
         });

         it('should don\'t serialize writable property if old extend used', function() {
            var SubRecord = extend.extend(Record, {
                  _moduleName: 'SubRecord',
                  $protected: {
                     _options: {
                        foo: 'bar'
                     }
                  }
               }),
               record = new SubRecord({
                  writable: false
               }),
               json = record.toJSON();

            assert.isUndefined(json.state.$options.writable);
         });
      });

      describe('::fromObject', function() {
         it('should make record from object with various adapter but with equal fields', function() {
            var data = {
                  id: 1,
                  title: 'title',
                  selected: true,
                  pid: null,
                  lost: undefined
               },
               recordA = Record.fromObject(data),
               recordB = Record.fromObject(data, 'Types/entity:adapter.Sbis'),
               key;

            for (key in data) {
               if (data.hasOwnProperty(key)) {
                  assert.strictEqual(recordA.get(key), data[key]);
                  assert.strictEqual(recordB.get(key), data[key]);
               }
            }
         });

         it('should create DateTime field by default', function() {
            var record = Record.fromObject({date: new Date()}),
               field = record.getFormat().at(0);

            assert.equal(field.getType(), 'datetime');
         });

         it('should create Date field if SQL_SERIALIZE_MODE_DATETIME', function() {
            var date = new Date(),
               record,
               field;

            date.setSQLSerializationMode(Date.SQL_SERIALIZE_MODE_DATETIME);
            record = Record.fromObject({date: date});
            field = record.getFormat().at(0);

            assert.equal(field.getType(), 'datetime');
         });

         it('should create Date field if SQL_SERIALIZE_MODE_DATE', function() {
            var date = new Date(),
               record,
               field;

            date.setSQLSerializationMode(Date.SQL_SERIALIZE_MODE_DATE);
            record = Record.fromObject({date: date});
            field = record.getFormat().at(0);

            assert.equal(field.getType(), 'date');
         });

         it('should create Time field if SQL_SERIALIZE_MODE_TIME', function() {
            var date = new Date(),
               record,
               field;

            date.setSQLSerializationMode(Date.SQL_SERIALIZE_MODE_TIME);
            record = Record.fromObject({date: date});
            field = record.getFormat().at(0);

            assert.equal(field.getType(), 'time');
         });

         it('should create DateTime field if SQL_SERIALIZE_MODE_AUTO', function() {
            var date = new Date(),
               record,
               field;

            date.setSQLSerializationMode(Date.SQL_SERIALIZE_MODE_AUTO);
            record = Record.fromObject({date: date});
            field = record.getFormat().at(0);

            assert.equal(field.getType(), 'datetime');
         });

         it('should create Array field with kind of String', function() {
            var record = Record.fromObject({foo: [1, '2']}),
               field = record.getFormat().at(0);
            assert.equal(field.getType(), 'array');
            assert.equal(field.getKind(), 'string');
         });

         it('should create Array field with kind of String when it consist from null only', function() {
            var record = Record.fromObject({foo: [null]}),
               field = record.getFormat().at(0);
            assert.equal(field.getType(), 'array');
            assert.equal(field.getKind(), 'string');
         });

         it('should create Array field with kind of Integer', function() {
            var record = Record.fromObject({foo: [1, 2]}),
               field = record.getFormat().at(0);
            assert.equal(field.getType(), 'array');
            assert.equal(field.getKind(), 'integer');
         });

         it('should create Array field with kind of Integer when one item is null', function() {
            var record = Record.fromObject({foo: [1, null]}),
               field = record.getFormat().at(0);
            assert.equal(field.getType(), 'array');
            assert.equal(field.getKind(), 'integer');
         });

         it('should create Array field with kind of Real', function() {
            var record = Record.fromObject({foo: [1, 2.5]});
            var field = record.getFormat().at(0);
            assert.equal(field.getType(), 'array');
            assert.equal(field.getKind(), 'real');
         });



         it('should create Array field with kind of Boolean', function() {
            var record = Record.fromObject({foo: [true, 'false']}),
               field = record.getFormat().at(0);
            assert.equal(field.getType(), 'array');
            assert.equal(field.getKind(), 'boolean');
         });

         it('should create Array field with kind of DateTime', function() {
            var record = Record.fromObject({foo: [new Date()]}),
               field = record.getFormat().at(0);
            assert.equal(field.getType(), 'array');
            assert.equal(field.getKind(), 'datetime');
         });

         it('should create Array field with kind of first not null element', function() {
            var record = Record.fromObject({foo: [null, 1]}),
               field = record.getFormat().at(0);
            assert.equal(field.getType(), 'array');
            assert.equal(field.getKind(), 'integer');
         });

         it('should create Array field with kind of first not undefined element', function() {
            var record = Record.fromObject({foo: [null, false]}),
               field = record.getFormat().at(0);
            assert.equal(field.getType(), 'array');
            assert.equal(field.getKind(), 'boolean');
         });
      });

      describe('::produceInstance()', function() {
         it('should return an instance with the given raw data', function() {
            var data = {},
               instance = Record.produceInstance(data);

            assert.instanceOf(instance, Record);
            assert.strictEqual(instance.getRawData(true), data);
         });

         it('should return an instance with the given adapter', function() {
            var adapter = new SbisAdapter(),
               instance = Record.produceInstance(null, {adapter: adapter});

            assert.instanceOf(instance, Record);
            assert.strictEqual(instance.getAdapter(), adapter);
         });

         it('should return an instance with inherited adapter', function() {
            var adapter = new SbisAdapter(),
               Foo = extend.extend(Record, {
                  _$adapter: adapter
               }),
               instance = Foo.produceInstance(null);

            assert.instanceOf(instance, Foo);
            assert.strictEqual(instance.getAdapter(), adapter);
         });
      });

      describe('.getVersion()', function() {
         it('should change version if has been changed a value', function() {
            var rec = new Record({
                  adapter: 'Types/entity:adapter.Sbis',
                  rawData: {
                     _type: 'record',
                     d: [1],
                     s: [{
                        n: 'id',
                        t: 'Число целое'
                     }]
                  }
               }),
               version = rec.getVersion();
            rec.set('id', 5);
            assert.notEqual(rec.getVersion(), version);
         });

         it('should change version if has been changed a inner Record', function() {
            var rec = new Record({
                  adapter: 'Types/entity:adapter.Sbis',
                  rawData: {
                     _type: 'record',
                     d: [{
                        _type: 'record',
                        d: [1],
                        s: [{
                           n: 'id',
                           t: 'Число целое'
                        }]
                     }],
                     s: [{
                        n: 'record',
                        t: 'Запись'
                     }]
                  }
               }),
               version = rec.getVersion();
            rec.get('record').set('id', 5);
            assert.notEqual(rec.getVersion(), version);
         });

         it('should change version if has been changed an inner RecordSet', function() {
            var rec = new Record({
                  adapter: 'Types/entity:adapter.Sbis',
                  rawData: {
                     _type: 'record',
                     d: [{
                        _type: 'recordset',
                        d: [[1], [2], [3], [4]],
                        s: [{
                           n: 'id',
                           t: 'Число целое'
                        }]
                     }],
                     s: [{
                        n: 'rs',
                        t: 'Выборка'
                     }]
                  }
               }),
               version = rec.getVersion();
            rec.get('rs').at(0).set('id', 5);
            assert.notEqual(rec.getVersion(), version);
         });

         it('should change version if has been changed an inner Flags', function() {
            var rec = new Record({
               adapter: 'Types/entity:adapter.Sbis',
               rawData: {
                  _type: 'record',
                  d: [[]],
                  s: [{
                     n: 'foo',
                     t: {n: 'Флаги', s: {0: 'one', 1: 'two'}}
                  }]
               }
            });

            var version = rec.getVersion();
            rec.get('foo').set('one', true);
            assert.notEqual(rec.getVersion(), version);
         });

         it('should change version if a field has been added in the format', function() {
            var rec = new Record({
                  adapter: 'Types/entity:adapter.Sbis',
                  rawData: {
                     _type: 'record',
                     d: [1],
                     s: [{
                        n: 'id',
                        t: 'Число целое'
                     }]
                  }
               }),
               version = rec.getVersion();
            rec.addField({name: 'name', type: 'string'});
            assert.notEqual(rec.getVersion(), version);
         });

         it('should change version if a field has been removed from the format', function() {
            var format = getRecordFormat(),
               rec = new Record({
                  format: format,
                  adapter: 'Types/entity:adapter.Sbis',
                  rawData: getRecordSbisData()
               }),
               version = rec.getVersion();
            rec.removeField('max');
            assert.notEqual(rec.getVersion(), version);
         });
      });

      describe('::filter()', function() {
         it('should return only odd fields values', function() {
            var data = {
                  a: 1,
                  b: 2,
                  c: 3,
                  d: 4,
                  e: 5
               },
               record = new Record({
                  rawData: data
               }),
               expect = [1, 3, 5],
               result = Record.filter(record, function(name, value) {
                  return value % 2;
               }),
               index;

            index = 0;
            result.each(function(name, value) {
               assert.strictEqual(value, expect[index]);
               index++;
            });
            assert.strictEqual(index, expect.length);
         });

         it('should all fields values', function() {
            var data = {
                  a: 1,
                  b: 2,
                  c: 3,
                  d: 4,
                  e: 5
               },
               record = new Record({
                  rawData: data
               }),
               expect = [1, 2, 3, 4, 5],
               result = Record.filter(record),
               index;

            index = 0;
            result.each(function(name, value) {
               assert.strictEqual(value, expect[index]);
               index++;
            });
            assert.strictEqual(index, expect.length);
         });
      });

      describe('::filterFields()', function() {
         it('should return only given fields', function() {
            var data = {
                  a: 1,
                  b: 2,
                  c: 3,
                  d: 4,
                  e: 5
               },
               record = new Record({
                  rawData: data
               }),
               fields = ['a', 'b', 'd'],
               result = Record.filterFields(record, fields),
               index;

            index = 0;
            result.each(function(name, value) {
               assert.include(fields, name);
               assert.strictEqual(name, fields[index]);
               assert.strictEqual(value, record.get(name));
               index++;
            });
            assert.strictEqual(index, fields.length);
         });

         it('should not return undefined fields', function() {
            var data = {
                  a: 1,
                  b: 2,
                  c: 3,
                  d: 4,
                  e: 5
               },
               record = new Record({
                  rawData: data
               }),
               fields = ['a', 'z', 'c'],
               result = Record.filterFields(record, fields),
               index;

            index = 0;
            result.each(function(name, value) {
               assert.include(fields, name);
               assert.strictEqual(value, record.get(name));
               index++;
            });
            assert.strictEqual(index, fields.length - 1);
         });
      });
   });
});
