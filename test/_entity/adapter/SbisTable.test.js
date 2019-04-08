/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/adapter/SbisTable',
   'Types/_entity/adapter/SbisFieldType',
   'Types/_entity/format/fieldsFactory',
   'Types/_entity/format/IntegerField',
   'Types/_entity/format/StringField'
], function(
   SbisTable,
   SbisFieldType,
   fieldsFactory,
   IntegerField,
   StringField
) {
   'use strict';

   SbisTable = SbisTable.default;
   SbisFieldType = SbisFieldType.default;
   fieldsFactory = fieldsFactory.default;
   IntegerField = IntegerField.default;
   StringField = StringField.default;

   describe('Types/_entity/adapter/SbisTable', function() {
      var getFormat = function() {
            return [
               {'n': 'Ид', 't': 'Число целое'},
               {'n': 'Фамилия', 't': 'Строка'}
            ];
         },
         data,
         adapter;

      beforeEach(function() {
         data = {
            d: [
               [1, 'Иванов'],
               [2, 'Петров'],
               [3, 'Сидоров'],
               [4, 'Пухов'],
               [5, 'Молодцов'],
               [6, 'Годолцов'],
               [7, 'Арбузнов']
            ],
            s: getFormat()
         };

         adapter = new SbisTable(data);
      });

      afterEach(function() {
         data = undefined;
         adapter = undefined;
      });

      describe('.getMetaDataDescriptor()', function() {
         it('should return an empty array for empty data', function() {
            var data = null,
               adapter = new SbisTable(data),
               descriptor = adapter.getMetaDataDescriptor();

            assert.equal(descriptor.length, 0);
         });

         it('should return results field', function() {
            var data = {
                  r: {d: [], s: []}
               },
               adapter = new SbisTable(data),
               descriptor = adapter.getMetaDataDescriptor();

            assert.equal(descriptor[0].getName(), 'results');
            assert.equal(descriptor[0].getType(), 'record');
         });

         it('should return path field', function() {
            var data = {
                  p: {d: [], s: []}
               },
               adapter = new SbisTable(data),
               descriptor = adapter.getMetaDataDescriptor();

            assert.equal(descriptor[0].getName(), 'path');
            assert.equal(descriptor[0].getType(), 'recordset');
         });

         it('should return total field for Number', function() {
            var data = {
                  n: 1
               },
               adapter = new SbisTable(data),
               descriptor = adapter.getMetaDataDescriptor();

            assert.equal(descriptor[0].getName(), 'total');
            assert.equal(descriptor[0].getType(), 'integer');

            assert.equal(descriptor[1].getName(), 'more');
            assert.equal(descriptor[1].getType(), 'integer');
         });

         it('should return total field for Boolean', function() {
            var data = {
                  n: true
               },
               adapter = new SbisTable(data),
               descriptor = adapter.getMetaDataDescriptor();

            assert.equal(descriptor[0].getName(), 'total');
            assert.equal(descriptor[0].getType(), 'boolean');

            assert.equal(descriptor[1].getName(), 'more');
            assert.equal(descriptor[1].getType(), 'boolean');
         });

         it('should return total field for Object', function() {
            var data = {
                  n: {
                     after: false,
                     before: true
                  }
               },
               adapter = new SbisTable(data),
               descriptor = adapter.getMetaDataDescriptor();

            assert.equal(descriptor[0].getName(), 'total');
            assert.equal(descriptor[0].getType(), 'object');

            assert.equal(descriptor[1].getName(), 'more');
            assert.equal(descriptor[1].getType(), 'object');
         });

         it('should return meta fields', function() {
            var format = getFormat(),
               data = {
                  m: {
                     d: [1, 'foo'],
                     s: format
                  }
               },
               adapter = new SbisTable(data),
               descriptor = adapter.getMetaDataDescriptor();

            assert.equal(descriptor.length, format.length);

            descriptor.forEach(function(field, index) {
               assert.equal(field.getName(), format[index].n);
               assert.equal(SbisFieldType[field.getType()], format[index].t);
            });
         });
      });

      describe('.clone()', function() {
         it('should return new instance', function() {
            assert.notEqual(adapter.clone(), adapter);
            assert.instanceOf(adapter.clone(), SbisTable);
         });

         it('should return shared raw data if shallow', function() {
            assert.strictEqual(adapter.clone(true).getData(), data);
         });

         it('should return cloned raw data if not shallow', function() {
            var clone = adapter.clone();
            assert.notEqual(clone.getData(), data);
            assert.deepEqual(clone.getData(), data);
         });
      });

      describe('.getFields()', function() {
         it('should return fields list', function() {
            assert.deepEqual(
               adapter.getFields(),
               ['Ид', 'Фамилия']
            );
         });
      });

      describe('.getCount()', function() {
         it('should return records count', function() {
            assert.strictEqual(
               7,
               adapter.getCount()
            );
            assert.strictEqual(
               0,
               new SbisTable({}).getCount()
            );
            assert.strictEqual(
               0,
               new SbisTable('').getCount()
            );
            assert.strictEqual(
               0,
               new SbisTable(0).getCount()
            );
            assert.strictEqual(
               0,
               new SbisTable().getCount()
            );
         });
      });

      describe('.add()', function() {
         it('should append a record', function() {
            adapter.add({d: [30, 'Огурцов'], s: getFormat()});
            assert.strictEqual(
               8,
               data.d.length
            );
            assert.strictEqual(
               30,
               data.d[data.d.length - 1][0]
            );
            assert.strictEqual(
               'Огурцов',
               data.d[data.d.length - 1][1]
            );
         });

         it('should prepend a record', function() {
            adapter.add({d: [40, 'Перцов'], s: getFormat()}, 0);
            assert.strictEqual(
               8,
               data.d.length
            );
            assert.strictEqual(
               40,
               data.d[0][0]
            );
            assert.strictEqual(
               'Перцов',
               data.d[0][1]
            );
         });

         it('should insert a record', function() {
            adapter.add({d: [50, 'Горохов'], s: getFormat()}, 2);
            assert.strictEqual(
               8,
               data.d.length
            );
            assert.strictEqual(
               50,
               data.d[2][0]
            );
            assert.strictEqual(
               'Горохов',
               data.d[2][1]
            );
         });

         it('should insert the first record', function() {
            var format = [{'n': 'id', 't': 'Число целое'}],
               data = {
                  d: [],
                  s: format
               },
               adapter = new SbisTable(data);
            adapter.add({d: [5], s: format}, 0);
            assert.strictEqual(
               1,
               data.d.length
            );
            assert.strictEqual(
               5,
               data.d[0][0]
            );
         });

         it('should insert the last record', function() {
            var format = [{'n': 'id', 't': 'Число целое'}],
               data = {
                  d: [[1], [2]],
                  s: format
               },
               adapter = new SbisTable(data);
            adapter.add({d: [33], s: format}, 2);
            assert.strictEqual(
               3,
               data.d.length
            );
            assert.strictEqual(
               33,
               data.d[2][0]
            );
         });

         it('should throw an error on invalid position', function() {
            assert.throws(function() {
               adapter.add({d: [30, 'aaa'], s: getFormat()}, 100);
            });
            assert.throws(function() {
               adapter.add({d: [30, 'aaa'], s: getFormat()}, -1);
            });
         });

         it('should take the format from the record if don\'t have own', function() {
            var table = {d: [], s: []},
               adapter = new SbisTable(table),
               format = [{n: 'Ид', t: 'Число целое'}],
               rec = {d: [1], s: format};

            adapter.add(rec);
            assert.strictEqual(table.s, rec.s);
         });

         it('should share own format with the record', function() {
            var getFormat = function() {
                  return  {n: 'Ид', t: 'Число целое'};
               },
               format = getFormat(),
               table = {d: [], s: format},
               adapter = new SbisTable(table),
               rec = {d: [1], s: getFormat()};

            adapter.add(rec);
            assert.strictEqual(rec.s, table.s);
         });

         it('should add a record with different columns count', function() {
            var format = getFormat(),
               count = data.d.length;

            format.push({n: 'test', t: 'Строка'});
            adapter.add({d: [30, 'Огурцов'], s: format});

            assert.strictEqual(
               1 + count,
               data.d.length
            );
         });

         it('should add a record with different columns name', function() {
            var format = getFormat(),
               count = data.d.length;

            format[0].n = 'test';
            adapter.add({d: [30, 'Огурцов'], s: format});

            assert.strictEqual(
               1 + count,
               data.d.length
            );
         });

         it('should add a record with different columns type', function() {
            var format = getFormat(),
               count = data.d.length;

            format[0].t = 'test';
            adapter.add({d: [30, 'Огурцов'], s: format});

            assert.strictEqual(
               1 + count,
               data.d.length
            );
         });

         it('should take the format from the record if don\'t have own and not empty owns format', function() {
            var table = {d: [], s: [{'n': 'Ид', 't': 'Строка'}]},
               adapter = new SbisTable(table),
               format = [{n: 'Ид', t: 'Число целое'}],
               rec = {d: [1], s: format};

            adapter.add(rec);
            assert.strictEqual(table.s, rec.s);
         });
      });

      describe('.at()', function() {
         it('should return valid record', function() {
            assert.strictEqual(
               1,
               adapter.at(0).d[0]
            );
            assert.strictEqual(
               3,
               adapter.at(2).d[0]
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

         it('should return undefined on invalid data', function() {
            assert.isUndefined(
               new SbisTable({}).at()
            );
            assert.isUndefined(
               new SbisTable('').at()
            );
            assert.isUndefined(
               new SbisTable(0).at()
            );
            assert.isUndefined(
               new SbisTable().at()
            );
         });
      });

      describe('.remove()', function() {
         it('should remove the record', function() {
            adapter.remove(0);
            assert.strictEqual(
               2,
               data.d[0][0]
            );

            adapter.remove(2);
            assert.strictEqual(
               5,
               data.d[2][0]
            );

            adapter.remove(4);
            assert.isUndefined(
               data.d[4]
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
      });

      describe('.merge()', function() {
         it('should merge two records', function() {
            adapter.merge(0, 1, 'Ид');
            assert.strictEqual(
               'Петров',
               data.d[0][1]
            );
         });
      });

      describe('.copy()', function() {
         it('should copy the record', function() {
            var copy = adapter.copy(1);
            assert.deepEqual(
               copy,
               data.d[1]
            );
         });

         it('should insert a copy after the original', function() {
            var copy = adapter.copy(1);
            assert.strictEqual(
               copy,
               data.d[2]
            );
         });
      });

      describe('.replace()', function() {
         it('should replace the record', function() {
            adapter.replace({d: [11], s: getFormat()}, 0);
            assert.strictEqual(
               11,
               data.d[0][0]
            );

            adapter.replace({d: [12], s: getFormat()}, 4);
            assert.strictEqual(
               12,
               data.d[4][0]
            );

         });

         it('should throw an error on invalid position', function() {
            assert.throws(function() {
               adapter.replace({d: [13]}, -1);
            });
            assert.throws(function() {
               adapter.replace({d: [14]}, 99);
            });
         });

         it('should replace s in raw data', function() {
            var s = [{'n': 'Ид', 't': 'Число целое'}],
               adapter = new SbisTable({d: [1], s: []});
            adapter.replace({d: [11], s: s}, 0);
            assert.strictEqual(adapter.getData().s,  s);
         });

         it('should set s in record', function() {
            var record = {d: [], s: getFormat()};
            adapter.replace(record, 0);
            assert.strictEqual(record.s,  adapter._data.s);
         });
      });

      describe('.move()', function() {
         it('should move Иванов instead Сидоров', function() {
            adapter.move(0, 2);
            assert.strictEqual(
               'Петров',
               data.d[0][1]
            );
            assert.strictEqual(
               'Сидоров',
               data.d[1][1]
            );
            assert.strictEqual(
               'Иванов',
               data.d[2][1]
            );
         });
         it('should move Сидоров instead Иванов', function() {
            adapter.move(2, 0);
            assert.strictEqual(
               'Сидоров',
               data.d[0][1]
            );
            assert.strictEqual(
               'Иванов',
               data.d[1][1]
            );
            assert.strictEqual(
               'Петров',
               data.d[2][1]
            );
         });
         it('should move Петров to the end', function() {
            adapter.move(1, 6);
            assert.strictEqual(
               'Петров',
               data.d[6][1]
            );
            assert.strictEqual(
               'Арбузнов',
               data.d[5][1]
            );
         });
         it('should not move Петров', function() {
            adapter.move(1, 1);
            assert.strictEqual(
               'Петров',
               data.d[1][1]
            );
            assert.strictEqual(
               'Годолцов',
               data.d[5][1]
            );
         });
      });

      describe('.clear()', function() {
         it('should return an empty table', function() {
            assert.isTrue(data.d.length > 0);
            assert.isTrue(data.s.length > 0);
            adapter.clear();
            assert.strictEqual(adapter.getData().d.length, 0);
            assert.strictEqual(adapter.getData().s, data.s);
         });
         it('should return a same instance', function() {
            adapter.clear();
            assert.strictEqual(data, adapter.getData());
         });
      });

      describe('.getData()', function() {
         it('should return raw data', function() {
            assert.strictEqual(adapter.getData(), data);
         });
      });

      describe('.getFormat()', function() {
         it('should return integer field format', function() {
            var format = adapter.getFormat('Ид');
            assert.instanceOf(format, IntegerField);
            assert.strictEqual(format.getName(), 'Ид');
         });
         it('should return string field format', function() {
            var format = adapter.getFormat('Фамилия');
            assert.instanceOf(format, StringField);
            assert.strictEqual(format.getName(), 'Фамилия');
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
               fieldPos = 1,
               field = fieldsFactory({
                  type: 'string',
                  name: fieldName
               });
            adapter.addField(field, fieldPos);
            assert.strictEqual(adapter.getFormat(fieldName).getName(), fieldName);
            for (var i = 0; i < adapter.getCount(); i++) {
               assert.strictEqual(adapter.at(i).s[fieldPos].n, fieldName);
            }
         });
         it('should use a field default value', function() {
            var fieldName = 'New',
               fieldPos = 1,
               def = 'abc';
            adapter.addField(fieldsFactory({
               type: 'string',
               name: fieldName,
               defaultValue: def
            }), fieldPos);
            for (var i = 0; i < adapter.getCount(); i++) {
               assert.strictEqual(adapter.at(i).d[fieldPos], def);
            }
         });
         it('should throw an error for already exists field', function() {
            assert.throws(function() {
               adapter.addField(fieldsFactory({
                  type: 'string',
                  name: 'Ид'
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
            assert.throws(function() {
               adapter.addField({
                  type: 'string',
                  name: 'New'
               });
            });
         });
      });

      describe('.removeField()', function() {
         it('should remove exists field', function() {
            var name = 'Ид',
               index = 0,
               newFields = adapter.getData().s.slice(),
               newData = adapter.getData().d.slice().map(function(item) {
                  item.slice().splice(index, 1);
                  return item;
               });

            adapter.removeField(name);
            newFields.splice(index, 1);

            assert.deepEqual(adapter.getData().s, newFields);
            assert.deepEqual(adapter.getData().d, newData);
            for (var i = 0; i < adapter.getCount(); i++) {
               assert.deepEqual(adapter.at(i).s, newFields);
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
      });

      describe('.removeFieldAt()', function() {
         it('should remove exists field', function() {
            var name = 'Ид',
               index = 0,
               newFields = adapter.getData().s.slice().splice(index - 1, 1),
               newData = adapter.getData().d.slice().map(function(item) {
                  item.slice().splice(index, 1);
                  return item;
               });
            adapter.removeFieldAt(index);
            assert.deepEqual(adapter.getData().s, newFields);
            assert.deepEqual(adapter.getData().d, newData);
            for (var i = 0; i < adapter.getCount(); i++) {
               assert.deepEqual(adapter.at(i).s, newFields);
            }
            assert.throws(function() {
               adapter.getFormat(name);
            });
         });
         it('should throw an error for not exists field', function() {
            assert.throws(function() {
               adapter.removeFieldAt(9);
            });
         });
      });
   });
});
