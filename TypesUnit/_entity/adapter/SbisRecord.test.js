/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/adapter/SbisRecord',
   'Types/_entity/format',
   'Types/_entity/format/fieldsFactory',
   'Types/_collection/RecordSet'
], function(
   SbisRecord,
   fieldFormat,
   fieldsFactory,
   RecordSet
) {
   'use strict';

   SbisRecord = SbisRecord.default;
   fieldsFactory = fieldsFactory.default;
   RecordSet = RecordSet.default;

   describe('Types/_entity/adapter/SbisRecord', function() {
      var data,
         adapter;

      beforeEach(function() {
         data = {
            d: [1, 'Иванов', 'Иван', 'Иванович'],
            s: [
               {'n': 'Ид', 't': 'Число целое'},
               {'n': 'Фамилия', 't': 'Строка'},
               {'n': 'Имя', 't': 'Строка'},
               {'n': 'Отчество', 't': 'Строка'}
            ]
         };

         adapter = new SbisRecord(data);
      });

      afterEach(function() {
         data = undefined;
         adapter = undefined;
      });

      describe('.constructor()', function() {
         it('should throw an error on invalid data', function() {
            assert.throws(function() {
               new SbisRecord([]);
            });

            assert.throws(function() {
               new SbisRecord(new Date());
            });

            assert.throws(function() {
               new SbisRecord({
                  _type: 'recordset'
               });
            });
         });
      });

      describe('.clone()', function() {
         it('should return new instance', function() {
            assert.notEqual(adapter.clone(), adapter);
            assert.instanceOf(adapter.clone(), SbisRecord);
         });

         it('should clone an empty instance', function() {
            var adapter = new SbisRecord(),
               data = adapter.getData();
            assert.strictEqual(adapter.clone().getData(), data);
         });

         it('should clone an instance with null', function() {
            var adapter = new SbisRecord(null);
            assert.isNull(adapter.clone().getData());
         });

         it('should return shared raw data if shallow', function() {
            assert.strictEqual(adapter.clone(true).getData(), data);
         });

         it('should return cloned raw data if not shallow', function() {
            var clone = adapter.clone();
            assert.notEqual(clone.getData(), data);
            assert.deepEqual(clone.getData(), data);
         });

         it('should return raw data with shared "s" if not shallow', function() {
            assert.strictEqual(adapter.clone().getData().s, data.s);
         });
      });

      describe('.get()', function() {
         it('should return the property value', function() {
            assert.strictEqual(
               1,
               adapter.get('Ид')
            );
            assert.strictEqual(
               'Иванов',
               adapter.get('Фамилия')
            );
            assert.isUndefined(
               adapter.get('Должность')
            );
            assert.isUndefined(
               adapter.get()
            );
            assert.isUndefined(
               new SbisRecord({}).get('Должность')
            );
            assert.isUndefined(
               new SbisRecord('').get()
            );
            assert.isUndefined(
               new SbisRecord(0).get()
            );
            assert.isUndefined(
               new SbisRecord().get()
            );
         });

         it('should return type "Идентификатор" as is from Array with Number', function() {
            var data = {
                  d: [[1]],
                  s: [{
                     n: 'id',
                     t: 'Идентификатор'
                  }]
               },
               adapter = new SbisRecord(data);

            assert.strictEqual(adapter.get('id'), 1);
         });

         it('should return type "Идентификатор" as is from Array with Number and String', function() {
            var data = {
                  d: [[1, 'foo']],
                  s: [{
                     n: 'id',
                     t: 'Идентификатор'
                  }]
               },
               adapter = new SbisRecord(data);

            assert.strictEqual(adapter.get('id'), '1,foo');
         });

         it('should return type "Идентификатор" as is from Array with null', function() {
            var data = {
                  d: [[null]],
                  s: [{
                     n: 'id',
                     t: 'Идентификатор'
                  }]
               },
               adapter = new SbisRecord(data);

            assert.strictEqual(adapter.get('id'), null);
         });
      });

      describe('.set()', function() {
         it('should set the value', function() {
            adapter.set('Ид', 20);
            assert.strictEqual(
               20,
               data.d[0]
            );
         });

         it('should set type "Идентификатор" from Array', function() {
            var data = {
                  d: [[null]],
                  s: [{
                     n: 'id',
                     t: 'Идентификатор'
                  }]
               },
               adapter = new SbisRecord(data);

            adapter.set('id', [1]);
            assert.deepEqual(data.d[0], [1]);
         });

         it('should set type "Идентификатор" from Array with null', function() {
            var data = {
                  d: [null],
                  s: [{
                     n: 'id',
                     t: 'Идентификатор'
                  }]
               },
               adapter = new SbisRecord(data);

            adapter.set('id', [null]);
            assert.deepEqual(data.d[0], [null]);
         });

         it('should set type "Идентификатор" from null', function() {
            var data = {
                  d: [[null]],
                  s: [{
                     n: 'id',
                     t: 'Идентификатор'
                  }]
               },
               adapter = new SbisRecord(data);

            adapter.set('id', null);
            assert.deepEqual(data.d[0], [null]);
         });

         it('should throw an error on undefined property', function() {
            assert.throws(function() {
               adapter.set('а', 5);
            });
            assert.throws(function() {
               adapter.set('б');
            });
         });

         it('should throw an error on invalid data', function() {
            assert.throws(function() {
               adapter.set();
            });
            assert.throws(function() {
               adapter.set('');
            });
            assert.throws(function() {
               adapter.set(0);
            });
         });
      });

      describe('.clear()', function() {
         it('should return an empty record', function() {
            assert.isTrue(data.d.length > 0);
            assert.isTrue(data.s.length > 0);
            adapter.clear();
            assert.strictEqual(adapter.getData().d.length, 0);
            assert.strictEqual(adapter.getData().s.length, 0);
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

      describe('.getFields()', function() {
         it('should return fields list', function() {
            assert.deepEqual(
               adapter.getFields(),
               ['Ид', 'Фамилия', 'Имя', 'Отчество']
            );
         });
      });

      describe('.getFormat()', function() {
         it('should return Integer field format', function() {
            var format = adapter.getFormat('Ид');
            assert.instanceOf(format, fieldFormat.IntegerField);
            assert.strictEqual(format.getName(), 'Ид');
         });

         it('should return Real field format', function() {
            var data = {
                  d: [100.9999],
                  s: [{
                     n: 'real',
                     t: {n: 'Число вещественное', p: 20}
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getFormat('real');
            assert.instanceOf(format, fieldFormat.RealField);
            assert.strictEqual(format.getPrecision(), 20);
         });

         it('should return Money field format', function() {
            var data = {
                  d: [100.9999],
                  s: [{
                     n: 'money',
                     t: {n: 'Деньги', p: 2}
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getFormat('money');
            assert.instanceOf(format, fieldFormat.MoneyField);
            assert.strictEqual(format.getPrecision(), 2);
         });

         it('should return String field format', function() {
            var format = adapter.getFormat('Фамилия');
            assert.instanceOf(format, fieldFormat.StringField);
            assert.strictEqual(format.getName(), 'Фамилия');
         });

         it('should return XML field format', function() {
            var data = {
                  d: ['<?xml version="1.1" encoding="UTF-8"?>'],
                  s: [{
                     n: 'xml',
                     t: 'XML-файл'
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getFormat('xml');
            assert.instanceOf(format, fieldFormat.XmlField);
         });

         it('should return DateTime with time zone field format', function() {
            var data = {
                  d: [123],
                  s: [{
                     n: 'dt',
                     t: 'Дата и время'
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getFormat('dt');
            assert.instanceOf(format, fieldFormat.DateTimeField);
            assert.isFalse(format.isWithoutTimeZone());
         });

         it('should return DateTime without time zone field format', function() {
            var data = {
                  d: [123],
                  s: [{
                     n: 'dt',
                     t: {
                        n: 'Дата и время',
                        tz: false
                     }
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getFormat('dt');

            assert.isTrue(format.isWithoutTimeZone());
         });

         it('should return Date field format', function() {
            var data = {
                  d: [123],
                  s: [{
                     n: 'date',
                     t: 'Дата'
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getFormat('date');
            assert.instanceOf(format, fieldFormat.DateField);
         });

         it('should return Time field format', function() {
            var data = {
                  d: [123],
                  s: [{
                     n: 'time',
                     t: 'Время'
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getFormat('time');
            assert.instanceOf(format, fieldFormat.TimeField);
         });

         it('should return TimeInterval field format', function() {
            var data = {
                  d: [123],
                  s: [{
                     n: 'timeint',
                     t: 'Временной интервал'
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getFormat('timeint');
            assert.instanceOf(format, fieldFormat.TimeIntervalField);
         });

         it('should return Link field format', function() {
            var adapter = new SbisRecord({
                  d: [0],
                  s: [{n: 'Ид', t: 'Связь'}]
               }),
               format = adapter.getFormat('Ид');
            assert.instanceOf(format, fieldFormat.LinkField);
         });

         it('should return Identity field format', function() {
            var data = {
                  d: [123],
                  s: [{
                     n: 'id',
                     t: 'Идентификатор'
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getFormat('id');
            assert.instanceOf(format, fieldFormat.IdentityField);
         });

         it('should return Enum field format', function() {
            var data = {
                  d: [1],
                  s: [{
                     n: 'enum',
                     t: {
                        n: 'Перечисляемое',
                        s: {
                           0: 'one',
                           1: 'two'
                        }
                     }
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getFormat('enum');
            assert.instanceOf(format, fieldFormat.EnumField);
            assert.deepEqual(format.getDictionary(), data.s[0].t.s);
         });

         it('should return Flags field format', function() {
            var data = {
                  d: [1],
                  s: [{
                     n: 'flags',
                     t: {
                        n: 'Флаги',
                        s: {
                           0: 'one',
                           1: 'two'
                        }
                     }
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getFormat('flags');
            assert.instanceOf(format, fieldFormat.FlagsField);
            assert.deepEqual(format.getDictionary(), data.s[0].t.s);
         });

         it('should return Record field format', function() {
            var data = {
                  d: [{d: [], s: []}],
                  s: [{
                     n: 'rec',
                     t: 'Запись'
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getFormat('rec');
            assert.instanceOf(format, fieldFormat.RecordField);
         });

         it('should return RecordSet field format', function() {
            var data = {
                  d: [{d: [], s: []}],
                  s: [{
                     n: 'rs',
                     t: 'Выборка'
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getFormat('rs');
            assert.instanceOf(format, fieldFormat.RecordSetField);
         });

         it('should return Binary field format', function() {
            var data = {
                  d: [''],
                  s: [{
                     n: 'bin',
                     t: 'Двоичное'
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getFormat('bin');
            assert.instanceOf(format, fieldFormat.BinaryField);
         });

         it('should return UUID field format', function() {
            var data = {
                  d: [''],
                  s: [{
                     n: 'uuid',
                     t: 'UUID'
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getFormat('uuid');
            assert.instanceOf(format, fieldFormat.UuidField);
         });

         it('should return RPC-File field format', function() {
            var data = {
                  d: [''],
                  s: [{
                     n: 'file',
                     t: 'Файл-rpc'
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getFormat('file');
            assert.instanceOf(format, fieldFormat.RpcFileField);
         });

         it('should return Array field format', function() {
            var data = {
                  d: [''],
                  s: [{
                     n: 'arr',
                     t: {
                        n: 'Массив',
                        t: 'Логическое'
                     }
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getFormat('arr');
            assert.instanceOf(format, fieldFormat.ArrayField);
            assert.strictEqual(format.getKind(), 'boolean');
         });

         it('should return String field format for unknown type', function() {
            var adapter = new SbisRecord({
                  d: [0],
                  s: [{n: 'Ид', t: 'Foo'}]
               }),
               format = adapter.getFormat('Ид');
            assert.instanceOf(format, fieldFormat.StringField);
            assert.strictEqual(format.getName(), 'Ид');
         });

         it('should throw an error for not exists field', function() {
            assert.throws(function() {
               adapter.getFormat('Some');
            });
         });

         it('should return format for reused data', function() {
            var data = {
               d: [1],
               s: [{'n': 'foo', 't': 'Число целое'}]
            };

            var adapterA = new SbisRecord(data);
            assert.strictEqual(adapterA.getFormat('foo').getType(), 'integer');

            data.d.push('a');
            data.s.push({'n': 'bar', 't': 'Строка'});
            var adapterB = new SbisRecord(data);
            assert.strictEqual(adapterB.getFormat('bar').getType(), 'string');
         });
      });

      describe('.getSharedFormat()', function() {
         it('should return Money format with large property as true', function() {
            var data = {
                  d: [123],
                  s: [{
                     n: 'foo',
                     t: {
                        n: 'Деньги',
                        l: true
                     }
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getSharedFormat('foo');

            assert.isTrue(format.meta.large);
         });

         it('should return Money format with large property as false', function() {
            var data = {
                  d: [123],
                  s: [{
                     n: 'foo',
                     t: 'Деньги'
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getSharedFormat('foo');

            assert.isFalse(format.meta.large);
         });

         it('should return DateTime with time zone field format', function() {
            var data = {
                  d: [123],
                  s: [{
                     n: 'dt',
                     t: 'Дата и время'
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getSharedFormat('dt');

            assert.isFalse(format.meta.withoutTimeZone);
         });

         it('should return DateTime without time zone field format', function() {
            var data = {
                  d: [123],
                  s: [{
                     n: 'dt',
                     t: {
                        n: 'Дата и время',
                        tz: false
                     }
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getSharedFormat('dt');

            assert.isTrue(format.meta.withoutTimeZone);
         });

         it('should return Enum field format', function() {
            var declaration = {
                  n: 'enum',
                  t: {
                     n: 'Перечисляемое',
                     s: {
                        0: 'one',
                        1: 'two'
                     }
                  }
               },
               data = {
                  d: [1],
                  s: [declaration]
               },
               adapter = new SbisRecord(data),
               format = adapter.getSharedFormat('enum');

            assert.deepEqual(format.name, 'enum');
            assert.deepEqual(format.type, 'enum');
            assert.deepEqual(format.meta.dictionary, declaration.t.s);
            assert.isUndefined(format.meta.localeDictionary);
         });

         it('should return localized Enum field format', function() {
            var declaration = {
                  n: 'enum',
                  t: {
                     n: 'Перечисляемое',
                     s: {
                        0: 'one',
                        1: 'two'
                     },
                     sl: {
                        0: 'uno',
                        1: 'dos'
                     }
                  }
               },
               data = {
                  d: [1],
                  s: [declaration]
               },
               adapter = new SbisRecord(data),
               format = adapter.getSharedFormat('enum');

            assert.deepEqual(format.name, 'enum');
            assert.deepEqual(format.type, 'enum');
            assert.deepEqual(format.meta.dictionary, declaration.t.s);
            assert.deepEqual(format.meta.localeDictionary, declaration.t.sl);
         });

         it('should return Array of Money format', function() {
            var data = {
                  d: [123],
                  s: [{
                     n: 'foo',
                     t: {
                        n: 'Массив',
                        t: 'Деньги'
                     }
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getSharedFormat('foo');

            assert.equal(format.type, 'array');
            assert.equal(format.meta.kind, 'money');
            assert.isFalse(format.meta.large);
         });

         it('should return Array of Money format with "precision" property', function() {
            var data = {
                  d: [123],
                  s: [{
                     n: 'foo',
                     t: {
                        n: 'Массив',
                        t: 'Деньги',
                        p: 3
                     }
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getSharedFormat('foo');

            assert.equal(format.type, 'array');
            assert.equal(format.meta.kind, 'money');
            assert.equal(format.meta.precision, 3);
         });

         it('should return Array of Money format with "large" property', function() {
            var data = {
                  d: [123],
                  s: [{
                     n: 'foo',
                     t: {
                        n: 'Массив',
                        t: 'Деньги',
                        l: true
                     }
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getSharedFormat('foo');

            assert.equal(format.type, 'array');
            assert.equal(format.meta.kind, 'money');
            assert.isTrue(format.meta.large);
         });

         it('should return Array of DateTime format', function() {
            var data = {
                  d: [123],
                  s: [{
                     n: 'foo',
                     t: {
                        n: 'Массив',
                        t: 'Дата и время'
                     }
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getSharedFormat('foo');

            assert.equal(format.type, 'array');
            assert.equal(format.meta.kind, 'datetime');
            assert.isFalse(format.meta.withoutTimeZone);
         });

         it('should return Array of DateTime format with "withoutTimeZone" property', function() {
            var data = {
                  d: [123],
                  s: [{
                     n: 'foo',
                     t: {
                        n: 'Массив',
                        t: 'Дата и время',
                        tz: false
                     }
                  }]
               },
               adapter = new SbisRecord(data),
               format = adapter.getSharedFormat('foo');

            assert.equal(format.type, 'array');
            assert.equal(format.meta.kind, 'datetime');
            assert.isTrue(format.meta.withoutTimeZone);
         });
      });

      describe('.addField()', function() {
         it('should add a Boolean field', function() {
            var fieldName = 'New',
               fieldIndex = 1,
               field = fieldsFactory({
                  type: 'boolean',
                  name: fieldName
               });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.getFormat(fieldName).getName(), fieldName);
            assert.strictEqual(adapter.getFields()[fieldIndex], fieldName);
            assert.isNull(adapter.get(fieldName));
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Логическое');
         });

         it('should add an Integer field', function() {
            var fieldName = 'New',
               fieldIndex = 1,
               field = fieldsFactory({
                  type: 'integer',
                  name: fieldName
               });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), 0);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Число целое');
         });

         it('should add a Real field', function() {
            var fieldName = 'New',
               fieldIndex = 0,
               field = fieldsFactory({
                  type: 'real',
                  name: fieldName
               });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), 0);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Число вещественное');
         });

         it('should add a Real field with custom precision', function() {
            var fieldName = 'New',
               fieldIndex = 0,
               precision = 4,
               field = fieldsFactory({
                  type: 'real',
                  name: fieldName,
                  precision: precision
               });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), 0);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Число вещественное');
         });

         it('should add a Money field', function() {
            var fieldName = 'New',
               fieldIndex = 0,
               field = fieldsFactory({
                  type: 'money',
                  name: fieldName
               });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), 0);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Деньги');
         });

         it('should add a Money field with custom precision', function() {
            var fieldName = 'New',
               fieldIndex = 0,
               precision = 3,
               field = fieldsFactory({
                  type: 'money',
                  name: fieldName,
                  precision: precision
               });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), 0);
            assert.strictEqual(adapter.getData().s[fieldIndex].t.n, 'Деньги');
            assert.strictEqual(adapter.getData().s[fieldIndex].t.p, 3);
         });

         it('should add a Money field with large flag', function() {
            var fieldName = 'New',
               fieldIndex = 0,
               field = fieldsFactory({
                  type: 'money',
                  name: fieldName,
                  large: true
               });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.getData().s[fieldIndex].t.n, 'Деньги');
            assert.isTrue(adapter.getData().s[fieldIndex].t.l);
         });

         it('should add a String field', function() {
            var fieldName = 'New',
               fieldIndex = 2,
               field = fieldsFactory({
                  type: 'string',
                  name: fieldName
               });
            adapter.addField(field, fieldIndex);
            assert.isNull(adapter.get(fieldName));
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Строка');
         });

         it('should add a deprecated Text field as String field', function() {
            var fieldName = 'New',
               fieldIndex = 2,
               field = fieldsFactory({
                  type: 'text',
                  name: fieldName
               });
            adapter.addField(field, fieldIndex);
            assert.isNull(adapter.get(fieldName));
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Строка');
         });

         it('should add a XML field', function() {
            var fieldName = 'New',
               fieldIndex = 3,
               field = fieldsFactory({
                  type: 'xml',
                  name: fieldName
               });

            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), '');
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'XML-файл');
         });

         it('should add a DateTime field with time zone', function() {
            var fieldName = 'New',
               fieldIndex = 3,
               field = fieldsFactory({
                  type: 'datetime',
                  name: fieldName
               }),
               result;

            adapter.addField(field, fieldIndex);
            result = adapter.getData().s[fieldIndex];

            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(result.t, 'Дата и время');
         });

         it('should add an empty DateTime field without time zone', function() {
            var fieldName = 'New',
               fieldIndex = 0,
               field = fieldsFactory({
                  type: 'datetime',
                  name: fieldName,
                  withoutTimeZone: true
               });

            adapter.addField(field, fieldIndex);
            var result = adapter.getData().s[fieldIndex];

            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(result.t.n, 'Дата и время');
            assert.strictEqual(result.t.tz, false);
         });

         it('should add a DateTime field without time zone use default value', function() {
            var fieldName = 'New',
               fieldIndex = 0,
               fieldValue = new Date(2018, 7, 15, 16, 50, 33),
               field = fieldsFactory({
                  type: 'datetime',
                  name: fieldName,
                  withoutTimeZone: true,
                  defaultValue: fieldValue
               });

            adapter.addField(field, fieldIndex);

            assert.equal(adapter.get(fieldName), '2018-08-15 16:50:33');
         });

         it('should add a Date field', function() {
            var fieldName = 'New',
               fieldIndex = 4,
               field = fieldsFactory({
                  type: 'date',
                  name: fieldName
               });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Дата');
         });

         it('should add a Time field', function() {
            var fieldName = 'New',
               fieldIndex = 4,
               field = fieldsFactory({
                  type: 'time',
                  name: fieldName
               });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Время');
         });

         it('should add a TimeInterval field', function() {
            var fieldName = 'New',
               fieldIndex = 4,
               field = fieldsFactory({
                  type: 'timeinterval',
                  name: fieldName
               });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), 'P0DT0H0M0S');
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Временной интервал');
         });

         it('should add a Identity field', function() {
            var fieldName = 'New',
               fieldIndex = 4,
               field = fieldsFactory({
                  type: 'identity',
                  name: fieldName
               });
            adapter.addField(field, fieldIndex);
            assert.deepEqual(data.d[fieldIndex], [null]);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Идентификатор');
         });

         it('should add an Enum field with Array dictionary', function() {
            var fieldName = 'New',
               fieldIndex = 0,
               field = fieldsFactory({
                  type: 'enum',
                  name: fieldName,
                  defaultValue: 1,
                  dictionary: ['1st', '2nd']
               }),
               expectedDict = {0: '1st', 1: '2nd'};

            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), 1);
            assert.strictEqual(adapter.getData().s[fieldIndex].t.n, 'Перечисляемое');
            assert.deepEqual(adapter.getData().s[fieldIndex].t.s, expectedDict);
         });

         it('should add an Enum field with Object dictionary', function() {
            var fieldName = 'New',
               fieldIndex = 0,
               field = fieldsFactory({
                  type: 'enum',
                  name: fieldName,
                  defaultValue: 1,
                  dictionary: {0: '1st', 1: '2nd'}
               }),
               expectedDict = {0: '1st', 1: '2nd'};

            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), 1);
            assert.strictEqual(adapter.getData().s[fieldIndex].t.n, 'Перечисляемое');
            assert.deepEqual(adapter.getData().s[fieldIndex].t.s, expectedDict);
         });

         it('should add a Flags field', function() {
            var fieldName = 'New',
               fieldIndex = 0,
               field = fieldsFactory({
                  type: 'flags',
                  name: fieldName,
                  defaultValue: [1],
                  dictionary: {0: '1st', 1: '2nd'}
               });
            adapter.addField(field, fieldIndex);
            assert.deepEqual(adapter.get(fieldName), [1]);
            assert.strictEqual(adapter.getData().s[fieldIndex].t.n, 'Флаги');
            assert.strictEqual(adapter.getData().s[fieldIndex].t.s, field.getDictionary());
         });

         it('should add a Record field', function() {
            var fieldName = 'New',
               fieldIndex = 0,
               field = fieldsFactory({
                  type: 'record',
                  name: fieldName
               });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Запись');
         });

         it('should add a RecordSet field', function() {
            var fieldName = 'New',
               fieldIndex = 0,
               field = fieldsFactory({
                  type: 'recordset',
                  name: fieldName
               });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Выборка');
         });

         it('should add a RecordSet field', function() {
            var fieldName = 'New',
               fieldIndex = 0,
               field = fieldsFactory({
                  type: RecordSet,
                  name: fieldName
               });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Выборка');
         });

         it('should add a Binary field', function() {
            var fieldName = 'New',
               fieldIndex = 0,
               field = fieldsFactory({
                  type: 'binary',
                  name: fieldName
               });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Двоичное');
         });

         it('should add a UUID field', function() {
            var fieldName = 'New',
               fieldIndex = 0,
               field = fieldsFactory({
                  type: 'uuid',
                  name: fieldName
               });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'UUID');
         });

         it('should add a RPC-File field', function() {
            var fieldName = 'New',
               fieldIndex = 0,
               field = fieldsFactory({
                  type: 'rpcfile',
                  name: fieldName
               });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Файл-rpc');
         });

         it('should add a deprecated Hierarchy field as Identity field', function() {
            var fieldName = 'New',
               fieldIndex = 0,
               field = fieldsFactory({
                  type: 'hierarchy',
                  name: fieldName,
                  kind: 'Identity'
               });
            adapter.addField(field, fieldIndex);
            assert.deepEqual(data.d[fieldIndex], [null]);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Идентификатор');
         });

         it('should add an Array field', function() {
            var fieldName = 'New',
               fieldIndex = 0,
               field = fieldsFactory({
                  type: 'array',
                  name: fieldName,
                  kind: 'Boolean'
               });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(adapter.getData().s[fieldIndex].t.n, 'Массив');
            assert.strictEqual(adapter.getData().s[fieldIndex].t.t, 'Логическое');
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
               newFields = adapter.getFields(),
               newData = adapter.getData().d.slice();
            adapter.removeField(name);
            newFields.splice(index, 1);
            newData.splice(index, 1);

            assert.isUndefined(adapter.get(name));
            assert.deepEqual(adapter.getFields(), newFields);
            assert.deepEqual(adapter.getData().d, newData);
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
               newFields = adapter.getFields(),
               newData = adapter.getData().d.slice();
            adapter.removeFieldAt(0);
            newFields.splice(index, 1);
            newData.splice(index, 1);

            assert.isUndefined(adapter.get(name));
            assert.deepEqual(adapter.getFields(), newFields);
            assert.deepEqual(adapter.getData().d, newData);
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
