/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/adapter/RecordSetRecord',
   'Types/_entity/Record',
   'Types/_entity/Model',
   'Types/_collection/RecordSet',
   'Types/_entity/format/fieldsFactory'
], function(
   RecordSetRecordAdapter,
   Record,
   Model,
   RecordSet,
   fieldsFactory
) {
   'use strict';

   RecordSetRecordAdapter = RecordSetRecordAdapter.default;
   Record = Record.default;
   Model = Model.default;
   RecordSet = RecordSet.default;
   fieldsFactory = fieldsFactory.default;

   describe('Types/Adapter/RecordSetRecord', function() {
      var data;
      var format;
      var adapter;

      beforeEach(function() {
         format = [
            {name: 'id', type: 'integer'},
            {name: 'name', type: 'string'}
         ];

         data = new Record({
            format: format,
            rawData: {
               id: 1,
               name: 'Sample'
            }
         });

         adapter = new RecordSetRecordAdapter(data);
      });

      afterEach(function() {
         format = undefined;
         data = undefined;
         adapter = undefined;
      });

      describe('.constructor()', function() {
         it('should throw TypeError for invalid data', function() {
            assert.throws(function() {
               adapter = new RecordSetRecordAdapter([]);
            }, TypeError);
            assert.throws(function() {
               adapter = new RecordSetRecordAdapter({});
            }, TypeError);
         });
      });

      describe('.has()', function() {
         it('should return true for exists property', function() {
            assert.isTrue(adapter.has('id'));
         });

         it('should return false for not exists property', function() {
            assert.isFalse(adapter.has('some'));
         });

         it('should return false for empty data', function() {
            var adapter = new RecordSetRecordAdapter();
            assert.isFalse(adapter.has('id'));
         });
      });

      describe('.get()', function() {
         it('should return the property value', function() {
            assert.strictEqual(
               1,
               adapter.get('id')
            );
            assert.strictEqual(
               'Sample',
               adapter.get('name')
            );
         });

         it('should return undefined for not exists property', function() {
            assert.isUndefined(
               adapter.get('age')
            );
            assert.isUndefined(
               new RecordSetRecordAdapter().get('age')
            );
            assert.isUndefined(
               new RecordSetRecordAdapter(null).get('age')
            );
            assert.isUndefined(
               new RecordSetRecordAdapter().get()
            );
         });

         it('should return undefined for empty data', function() {
            var adapter = new RecordSetRecordAdapter();
            assert.isUndefined(adapter.get('id'));
         });
      });

      describe('.set()', function() {
         it('should set the exists property value', function() {
            adapter.set('id', 20);
            assert.strictEqual(
               20,
               data.get('id')
            );
         });

         it('should set the not exists property value', function() {
            var data = new Record({
                  rawData: {
                     id: 1,
                     name: 'test'
                  }
               }),
               adapter = new RecordSetRecordAdapter(data);

            adapter.set('a', 5);
            assert.strictEqual(
               5,
               data.get('a')
            );

            adapter.set('b');
            assert.isUndefined(
               data.get('b')
            );
         });

         it('should create new Record from empty data if RecordSet given', function() {
            var rs = new RecordSet(),
               adapter = new RecordSetRecordAdapter(null, rs);

            adapter.set('id', 1);
            assert.strictEqual(adapter.get('id'), 1);
            assert.instanceOf(adapter.getData(), Record);
         });

         it('should throw ReferenceError for invalid name', function() {
            assert.throws(function() {
               adapter.set();
            }, ReferenceError);
            assert.throws(function() {
               adapter.set('');
            }, ReferenceError);
            assert.throws(function() {
               adapter.set(0);
            }, ReferenceError);
         });

         it('should throw TypeError for empty data', function() {
            var adapter = new RecordSetRecordAdapter();
            assert.throws(function() {
               adapter.set('id', 1);
            }, TypeError);
         });
      });

      describe('.clear()', function() {
         it('should become an empty record', function() {
            adapter.clear();
            var hasFields = false;
            adapter.getData().each(function() {
               hasFields = true;
            });
            assert.isFalse(hasFields);
         });

         it('should return a same instance', function() {
            adapter.clear();
            assert.strictEqual(data, adapter.getData());
         });

         it('should throw TypeError for empty data', function() {
            var adapter = new RecordSetRecordAdapter();
            assert.throws(function() {
               adapter.clear();
            }, TypeError);
         });
      });

      describe('.getData()', function() {
         it('should return raw data', function() {
            assert.strictEqual(adapter.getData(), data);
         });
      });

      describe('.getFields()', function() {
         it('should return fields list', function() {
            assert.deepEqual(
               adapter.getFields(),
               ['id', 'name']
            );
         });

         it('should return empty list for empty data', function() {
            var adapter = new RecordSetRecordAdapter();
            assert.isTrue(adapter.getFields().length === 0);
         });

         it('should return fields list without model properties', function() {
            var data = new Model({
                  properties: {
                     foo: {
                        get: function() {
                           return 'bar';
                        }
                     }
                  },
                  rawData: {
                     id: 1,
                     name: 'Sample'
                  }
               }),
               adapter = new RecordSetRecordAdapter(data);

            assert.deepEqual(
               adapter.getFields(),
               ['id', 'name']
            );
         });
      });

      describe('.getFormat()', function() {
         it('should return exists field format', function() {
            var format = adapter.getFormat('id');
            assert.strictEqual(format.getName(), 'id');
         });
         it('should throw an error for not exists field', function() {
            assert.throws(function() {
               adapter.getFormat('Some');
            });
         });
      });

      describe('.addField()', function() {
         it('should add a new field', function() {
            var fieldName = 'New',
               field = fieldsFactory({
                  type: 'string',
                  name: fieldName
               });
            adapter.addField(field, 0);
            assert.strictEqual(adapter.getFormat(fieldName).getName(), fieldName);
         });

         it('should use a field default value', function() {
            var fieldName = 'New',
               def = 'abc';
            adapter.addField(fieldsFactory({
               type: 'string',
               name: fieldName,
               defaultValue: def
            }));
            assert.strictEqual(adapter.get(fieldName), def);
            assert.strictEqual(data.get(fieldName), def);
         });

         it('should throw an error for already exists field', function() {
            assert.throws(function() {
               adapter.addField(fieldsFactory({
                  type: 'string',
                  name: 'name'
               }));
            });
         });

         it('should throw an error for not a field', function() {
            assert.throws(function() {
               adapter.addField();
            });
            assert.throws(function() {
               adapter.addField(null);
            });
         });

         it('should throw TypeError for empty data', function() {
            var adapter = new RecordSetRecordAdapter(),
               field = fieldsFactory({
                  type: 'string',
                  name: 'id'
               });

            assert.throws(function() {
               adapter.addField(field);
            }, TypeError);
         });
      });

      describe('.removeField()', function() {
         it('should remove exists field', function() {
            var name = 'id',
               oldFields = adapter.getFields();
            adapter.removeField(name);
            assert.isUndefined(adapter.get(name));
            assert.strictEqual(adapter.getFields().indexOf(name), -1);
            assert.strictEqual(adapter.getFields().length, oldFields.length - 1);
            assert.throws(function() {
               adapter.getFormat(name);
            });
         });

         it('should throw an error for not exists field', function() {
            assert.throws(function() {
               adapter.removeField('Some');
            });
         });

         it('should throw TypeError for empty data', function() {
            var adapter = new RecordSetRecordAdapter();
            assert.throws(function() {
               adapter.removeField('id');
            }, TypeError);
         });
      });

      describe('.removeFieldAt()', function() {
         var getRawData = function() {
            return {
               d: [
                  1,
                  'Sample'
               ],
               s: [
                  {'n': 'id', 't': 'Число целое'},
                  {'n': 'name', 't': 'Строка'}
               ]
            };
         };

         it('should remove exists field', function() {
            var data = new Record({
                  format: format,
                  rawData: getRawData(),
                  adapter: 'Types/entity:adapter.Sbis'
               }),
               adapter = new RecordSetRecordAdapter(data),
               oldF = adapter.getFields();

            adapter.removeFieldAt(0);
            var newF = adapter.getFields();
            assert.notEqual(oldF[0], newF[0]);
            assert.strictEqual(oldF[1], newF[0]);
            assert.throws(function() {
               adapter.getFormat(oldF.getName());
            });
         });

         it('should throw an error for not exists position', function() {
            var data = new Record({
                  format: format,
                  rawData: getRawData(),
                  adapter: 'Types/entity:adapter.Sbis'
               }),
               adapter = new RecordSetRecordAdapter(data);

            assert.throws(function() {
               adapter.removeFieldAt(-1);
            });
            assert.throws(function() {
               adapter.removeFieldAt(10);
            });
         });

         it('should throw TypeError for empty data', function() {
            var adapter = new RecordSetRecordAdapter();
            assert.throws(function() {
               adapter.removeFieldAt(0);
            }, TypeError);
         });
      });
   });
});
