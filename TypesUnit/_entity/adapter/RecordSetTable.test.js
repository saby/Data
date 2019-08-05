/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/adapter/RecordSetTable',
   'Types/_entity/Record',
   'Types/_entity/Model',
   'Types/_entity/format/fieldsFactory',
   'Types/_collection/RecordSet',
   'Types/_entity/adapter/Sbis'
], function(
   RecordSetTableAdapter,
   Record,
   Model,
   fieldsFactory,
   RecordSet
) {
   'use strict';

   RecordSetTableAdapter = RecordSetTableAdapter.default;
   Record = Record.default;
   Model = Model.default;
   fieldsFactory = fieldsFactory.default;
   RecordSet = RecordSet.default;

   describe('Types/_entity/adapter/RecordSetTable', function() {
      var data,
         format,
         adapter;

      beforeEach(function() {
         format = [
            {name: 'id', type: 'integer'},
            {name: 'name', type: 'string'}
         ];

         data = new RecordSet({
            format: format,
            rawData: [{
               id: 1,
               name: 'Ivanoff'
            }, {
               id: 2,
               name: 'Petroff'
            }, {
               id: 3,
               name: 'Sidoroff'
            }]
         });

         adapter = new RecordSetTableAdapter(data);
      });

      afterEach(function() {
         data = undefined;
         adapter = undefined;
      });

      describe('.constructor()', function() {
         it('should throw TypeError for invalid data', function() {
            assert.throws(function() {
               adapter = new RecordSetTableAdapter([]);
            }, TypeError);
            assert.throws(function() {
               adapter = new RecordSetTableAdapter({});
            }, TypeError);
         });
      });

      describe('.getFields()', function() {
         it('should return fields list', function() {
            var fields = adapter.getFields();
            for (var i = 0; i < format.length; i++) {
               assert.equal(
                  fields[i],
                  format[i].name
               );
            }
         });

         it('should return empty list for empty data', function() {
            var adapter = new RecordSetTableAdapter(),
               fields = adapter.getFields();
            assert.isTrue(fields.length === 0);
         });

         it('should return fields list without model properties', function() {
            var Foo = function(opts) {
                  return new Model(Object.assign({
                     properties: {
                        foo: {
                           get: function() {
                              return 'bar';
                           }
                        }
                     }
                  }), opts || {});
               },
               data = new RecordSet({
                  model: Foo,
                  rawData: [{
                     id: 1,
                     name: 'Sample'
                  }]
               }),
               adapter = new RecordSetTableAdapter(data);

            assert.deepEqual(
               adapter.getFields(),
               ['id', 'name']
            );
         });
      });

      describe('.getCount()', function() {
         it('should return records count', function() {
            assert.deepEqual(
               adapter.getCount(),
               data.getCount()
            );
         });

         it('should return 0 for empty data', function() {
            var adapter = new RecordSetTableAdapter();
            assert.isTrue(adapter.getCount() === 0);
         });
      });

      describe('.add()', function() {
         it('should append a record', function() {
            var count = data.getCount(),
               rec = new Record({
                  rawData: {id: 9, name: 'foo'}
               });
            adapter.add(rec);
            assert.strictEqual(
               data.at(count).get('name'),
               'foo'
            );
         });

         it('should prepend a record', function() {
            var rec = new Record({
               rawData: {id: 9, name: 'foo'}
            });
            adapter.add(rec, 0);
            assert.strictEqual(
               data.at(0).get('name'),
               'foo'
            );
         });

         it('should insert a record', function() {
            var rec = new Record({
               rawData: {id: 9, name: 'foo'}
            });
            adapter.add(rec, 1);
            assert.strictEqual(
               data.at(1).get('name'),
               'foo'
            );
         });

         it('should initialize RecordSet for empty data', function() {
            var adapter = new RecordSetTableAdapter(),
               rec = new Record();
            adapter.add(rec);
            assert.instanceOf(adapter.getData(), RecordSet);
         });

         it('should take adapter from record if empty data', function() {
            var adapter = new RecordSetTableAdapter(),
               rec = new Record({
                  format: [],
                  adapter: 'Types/entity:adapter.Sbis'
               });
            adapter.add(rec);
            assert.strictEqual(adapter.getData().getAdapter(), rec.getAdapter());
         });

         it('should take idProperty from record if empty data', function() {
            var adapter = new RecordSetTableAdapter(),
               rec = new Model({
                  format: [],
                  adapter: 'Types/entity:adapter.Sbis',
                  idProperty: 'id'
               });
            adapter.add(rec);
            assert.strictEqual(adapter.getData().getIdProperty(), rec.getIdProperty());
         });

         it('should throw an error on invalid position', function() {
            assert.throws(function() {
               var rec = new Record();
               adapter.add(rec, 100);
            });
            assert.throws(function() {
               var rec = new Record();
               adapter.add(rec, -1);
            });
         });
      });

      describe('.at()', function() {
         it('should return valid record', function() {
            assert.strictEqual(
               data.at(0),
               adapter.at(0)
            );
         });

         it('should return undefined on invalid position', function() {
            assert.isUndefined(
               adapter.at(-1)
            );
            assert.isUndefined(
               adapter.at(99)
            );
         });

         it('should return undefined for empty data', function() {
            var adapter = new RecordSetTableAdapter();
            assert.isUndefined(adapter.at(0));
         });
      });

      describe('.remove()', function() {
         it('should remove the record', function() {
            var rec = adapter.at(0);
            adapter.remove(0);
            assert.notEqual(
               rec,
               adapter.at(0)
            );
         });

         it('should throw an error on invalid position', function() {
            assert.throws(function() {
               adapter.remove(-1);
            });
            assert.throws(function() {
               adapter.remove(99);
            });
         });

         it('should throw TypeError for empty data', function() {
            var adapter = new RecordSetTableAdapter();
            assert.throws(function() {
               adapter.remove(0);
            }, TypeError);
         });
      });

      describe('.replace()', function() {
         it('should replace the record', function() {
            var rec = new Record({
               rawData: {id: 9, name: 'foo'}
            });
            adapter.replace(rec, 0);
            assert.strictEqual(
               data.at(0).get('name'),
               'foo'
            );
         });

         it('should throw an error on invalid position', function() {
            var rec = new Record();
            assert.throws(function() {
               adapter.replace(rec, -1);
            });
            assert.throws(function() {
               adapter.replace(rec, 99);
            });
         });

         it('should throw TypeError for empty data', function() {
            var adapter = new RecordSetTableAdapter(),
               rec = new Record();
            assert.throws(function() {
               adapter.replace(rec, 0);
            }, TypeError);
         });
      });

      describe('.move()', function() {
         it('should move Ivanoff instead Petroff', function() {
            adapter.move(0, 2);
            assert.strictEqual(
               'Petroff',
               adapter.at(0).get('name')
            );
            assert.strictEqual(
               'Sidoroff',
               adapter.at(1).get('name')
            );
            assert.strictEqual(
               'Ivanoff',
               adapter.at(2).get('name')
            );
         });

         it('should move Sidoroff instead Ivanoff', function() {
            adapter.move(2, 0);
            assert.strictEqual(
               'Sidoroff',
               adapter.at(0).get('name')
            );
            assert.strictEqual(
               'Ivanoff',
               adapter.at(1).get('name')
            );
            assert.strictEqual(
               'Petroff',
               adapter.at(2).get('name')
            );
         });

         it('should move Petroff to the end', function() {
            adapter.move(1, 2);
            assert.strictEqual(
               'Petroff',
               adapter.at(2).get('name')
            );
            assert.strictEqual(
               'Sidoroff',
               adapter.at(1).get('name')
            );
         });

         it('should not move Petroff', function() {
            adapter.move(1, 1);
            assert.strictEqual(
               'Petroff',
               adapter.at(1).get('name')
            );
         });

         it('should throw TypeError for empty data', function() {
            var adapter = new RecordSetTableAdapter();
            assert.throws(function() {
               adapter.move(0, 0);
            }, TypeError);
         });
      });

      describe('.merge()', function() {
         it('should throw TypeError for empty data', function() {
            var adapter = new RecordSetTableAdapter();
            assert.throws(function() {
               adapter.merge(0, 0);
            }, TypeError);
         });
      });

      describe('.copy()', function() {
         it('should throw TypeError for empty data', function() {
            var adapter = new RecordSetTableAdapter();
            assert.throws(function() {
               adapter.copy(0);
            }, TypeError);
         });
      });

      describe('.copy()', function() {
         it('should copy the record', function() {
            var copy = adapter.copy(1);
            assert.isTrue(
               copy.isEqual(
                  data.at(1)
               )
            );
         });

         it('should insert a copy after the original', function() {
            var copy = adapter.copy(1);
            assert.isTrue(copy.get('id') > 0);
            assert.strictEqual(
               copy.get('id'),
               data.at(2).get('id')
            );
         });
      });

      describe('.clear()', function() {
         it('should return an empty table', function() {
            assert.isTrue(data.getCount() > 0);
            adapter.clear();
            assert.strictEqual(adapter.getData().getCount(), 0);
         });

         it('should return a same instance', function() {
            adapter.clear();
            assert.strictEqual(data, adapter.getData());
         });

         it('should throw TypeError for empty data', function() {
            var adapter = new RecordSetTableAdapter();
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
            assert.strictEqual(data.getFormat().at(0).getName(), fieldName);
         });

         it('should use a field default value', function() {
            var fieldName = 'New',
               def = 'abc';
            adapter.addField(fieldsFactory({
               type: 'string',
               name: fieldName,
               defaultValue: def
            }));
            for (var i = 0; i < adapter.getCount(); i++) {
               assert.strictEqual(adapter.at(i).get(fieldName), def);
               assert.strictEqual(data.at(i).get(fieldName), def);
            }
         });

         it('should throw an error for already exists field', function() {
            assert.throws(function() {
               adapter.addField(fieldsFactory({
                  type: 'string',
                  name: 'id'
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
            var adapter = new RecordSetTableAdapter(),
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
            var name = 'id';
            adapter.removeField(name);
            for (var i = 0; i < adapter.getCount(); i++) {
               assert.isUndefined(adapter.at(i).get(name));
               assert.isUndefined(data.at(i).get(name));
            }
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
            var adapter = new RecordSetTableAdapter();
            assert.throws(function() {
               adapter.removeField('id');
            }, TypeError);
         });
      });

      describe('.removeFieldAt()', function() {
         var getRawData = function() {
            return {
               d: [
                  [1, 'Ivanoff'],
                  [2, 'Petroff'],
                  [3, 'Sidoroff']
               ],
               s: [
                  {'n': 'id', 't': 'Число целое'},
                  {'n': 'name', 't': 'Строка'}
               ]
            };
         };

         it('should remove exists field', function() {
            var data = new RecordSet({
                  format: format,
                  rawData: getRawData(),
                  adapter: 'Types/entity:adapter.Sbis'
               }),
               adapter = new RecordSetTableAdapter(data),
               oldF = adapter.getFields();

            adapter.removeFieldAt(0);
            var newF = adapter.getFields();
            assert.notEqual(oldF[0], newF[0]);
            assert.strictEqual(oldF[1], newF[0]);
            assert.throws(function() {
               adapter.getFormat(oldF.getName());
            });
         });

         it('should throw an error', function() {
            var data = new RecordSet({
                  rawData: getRawData(),
                  adapter: 'Types/entity:adapter.Sbis'
               }),
               adapter = new RecordSetTableAdapter(data);

            assert.throws(function() {
               adapter.removeFieldAt(-1);
            });
            assert.throws(function() {
               adapter.removeFieldAt(10);
            });
         });

         it('should throw TypeError for empty data', function() {
            var adapter = new RecordSetTableAdapter();
            assert.throws(function() {
               adapter.removeFieldAt(0);
            }, TypeError);
         });
      });
   });
});
