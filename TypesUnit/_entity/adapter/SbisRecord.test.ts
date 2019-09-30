import {assert} from 'chai';
import SbisRecord from 'Types/_entity/adapter/SbisRecord';
import SbisFormatFinder from 'Types/_entity/adapter/SbisFormatFinder';
import {
    IArrayFieldType,
    IDateTimeFieldType, IDictFieldType,
    IFieldType,
    IMoneyFieldType,
    IRealFieldType,
    IRecordFormat
} from 'Types/_entity/adapter/SbisFormatMixin';
import * as fieldFormat from 'Types/_entity/format';
import fieldsFactory from 'Types/_entity/format/fieldsFactory';
import {IDateTimeMeta, IDictionaryMeta, IMoneyMeta, IArrayMeta} from 'Types/_entity/format/UniversalField';
import FlagsField from 'Types/_entity/format/FlagsField';
import RecordSet from 'Types/_collection/RecordSet';

describe('Types/_entity/adapter/SbisRecord', () => {
    let data: IRecordFormat;
    let adapter: SbisRecord;

    beforeEach(() => {
        data = {
            d: [1, 'Иванов', 'Иван', 'Иванович'],
            s: [
                {n: 'Ид', t: 'Число целое'},
                {n: 'Фамилия', t: 'Строка'},
                {n: 'Имя', t: 'Строка'},
                {n: 'Отчество', t: 'Строка'}
            ]
        };

        adapter = new SbisRecord(data);
    });

    afterEach(() => {
        data = undefined;
        adapter = undefined;
    });

    describe('.constructor()', () => {
        it('should throw an error on invalid data', () => {
            let adapter;

            assert.throws(() => {
                adapter = new SbisRecord([] as any);
            });

            assert.throws(() => {
                adapter = new SbisRecord(new Date() as any);
            });

            assert.throws(() => {
                adapter = new SbisRecord({
                    _type: 'recordset'
                } as any);
            });

            assert.isUndefined(adapter);
        });
    });

    describe('.clone()', () => {
        it('should return new instance', () => {
            assert.notEqual(adapter.clone(), adapter);
            assert.instanceOf(adapter.clone(), SbisRecord);
        });

        it('should clone an empty instance', () => {
            const adapter = new SbisRecord();
            const data = adapter.getData();
            assert.strictEqual(adapter.clone().getData(), data);
        });

        it('should clone an instance with null', () => {
            const adapter = new SbisRecord(null);
            assert.isNull(adapter.clone().getData());
        });

        it('should return shared raw data if shallow', () => {
            assert.strictEqual(adapter.clone(true).getData(), data);
        });

        it('should return cloned raw data if not shallow', () => {
            const clone = adapter.clone();
            assert.notEqual(clone.getData(), data);
            assert.deepEqual(clone.getData(), data);
        });

        it('should return raw data with shared "s" if not shallow', () => {
            assert.strictEqual(adapter.clone().getData().s, data.s);
        });
    });

    describe('.get()', () => {
        it('should return the property value', () => {
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
                adapter.get(undefined)
            );
            assert.isUndefined(
                new SbisRecord({} as any).get('Должность')
            );
            assert.isUndefined(
                new SbisRecord('' as any).get(undefined)
            );
            assert.isUndefined(
                new SbisRecord(0 as any).get(undefined)
            );
            assert.isUndefined(
                new SbisRecord(undefined).get(undefined)
            );
        });

        it('should return type "Идентификатор" as is from Array with Number', () => {
            const data = {
                d: [[1]],
                s: [{
                    n: 'id',
                    t: 'Идентификатор'
                }]
            };
            const adapter = new SbisRecord(data);

            assert.strictEqual(adapter.get('id'), 1);
        });

        it('should return type "Идентификатор" as is from Array with Number and String', () => {
            const data = {
                d: [[1, 'foo']],
                s: [{
                    n: 'id',
                    t: 'Идентификатор'
                }]
            };
            const adapter = new SbisRecord(data);

            assert.strictEqual(adapter.get('id'), '1,foo');
        });

        it('should return type "Идентификатор" as is from Array with null', () => {
            const data = {
                d: [[null]],
                s: [{
                    n: 'id',
                    t: 'Идентификатор'
                }]
            };
            const adapter = new SbisRecord(data);

            assert.strictEqual(adapter.get('id'), null);
        });
    });

    describe('.set()', () => {
        it('should set the value', () => {
            adapter.set('Ид', 20);
            assert.strictEqual(
                20,
                data.d[0]
            );
        });

        it('should set type "Идентификатор" from Array', () => {
            const data = {
                d: [[null]],
                s: [{
                    n: 'id',
                    t: 'Идентификатор'
                }]
            };
            const adapter = new SbisRecord(data);

            adapter.set('id', [1]);
            assert.deepEqual(data.d[0], [1]);
        });

        it('should set type "Идентификатор" from Array with null', () => {
            const data = {
                d: [null],
                s: [{
                    n: 'id',
                    t: 'Идентификатор'
                }]
            };
            const adapter = new SbisRecord(data);

            adapter.set('id', [null]);
            assert.deepEqual(data.d[0], [null]);
        });

        it('should set type "Идентификатор" from null', () => {
            const data = {
                d: [[null]],
                s: [{
                    n: 'id',
                    t: 'Идентификатор'
                }]
            };
            const adapter = new SbisRecord(data);

            adapter.set('id', null);
            assert.deepEqual(data.d[0], [null]);
        });

        it('should throw an error on undefined property', () => {
            assert.throws(() => {
                adapter.set('а', 5);
            });
            assert.throws(() => {
                adapter.set('б', undefined);
            });
        });

        it('should throw an error on invalid data', () => {
            assert.throws(() => {
                adapter.set(undefined, undefined);
            });
            assert.throws(() => {
                adapter.set('', undefined);
            });
            assert.throws(() => {
                adapter.set(0 as any, undefined);
            });
        });
    });

    describe('.clear()', () => {
        it('should return an empty record', () => {
            assert.isTrue(data.d.length > 0);
            assert.isTrue(data.s.length > 0);
            adapter.clear();
            assert.strictEqual(adapter.getData().d.length, 0);
            assert.strictEqual(adapter.getData().s.length, 0);
        });

        it('should return a same instance', () => {
            adapter.clear();
            assert.strictEqual(data, adapter.getData());
        });
    });

    describe('.getData()', () => {
        it('should return raw data', () => {
            assert.strictEqual(adapter.getData(), data);
        });
    });

    describe('.getFields()', () => {
        it('should return fields list', () => {
            assert.deepEqual(
                adapter.getFields(),
                ['Ид', 'Фамилия', 'Имя', 'Отчество']
            );
        });
    });

    describe('.getFormat()', () => {
        it('should return Integer field format', () => {
            const format = adapter.getFormat('Ид');
            assert.instanceOf(format, fieldFormat.IntegerField);
            assert.strictEqual(format.getName(), 'Ид');
        });

        it('should return Real field format', () => {
            const data = {
                d: [100.9999],
                s: [{
                    n: 'real',
                    t: {n: 'Число вещественное', p: 20}
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat<fieldFormat.RealField>('real');

            assert.instanceOf(format, fieldFormat.RealField);
            assert.strictEqual(format.getPrecision(), 20);
        });

        it('should return Money field format', () => {
            const data = {
                d: [100.9999],
                s: [{
                    n: 'money',
                    t: {n: 'Деньги', p: 2}
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat<fieldFormat.RealField>('money');

            assert.instanceOf(format, fieldFormat.MoneyField);
            assert.strictEqual(format.getPrecision(), 2);
        });

        it('should return String field format', () => {
            const format = adapter.getFormat('Фамилия');
            assert.instanceOf(format, fieldFormat.StringField);
            assert.strictEqual(format.getName(), 'Фамилия');
        });

        it('should return XML field format', () => {
            const data = {
                d: ['<?xml version="1.1" encoding="UTF-8"?>'],
                s: [{
                    n: 'xml',
                    t: 'XML-файл'
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('xml');
            assert.instanceOf(format, fieldFormat.XmlField);
        });

        it('should return DateTime with time zone field format', () => {
            const data = {
                d: [123],
                s: [{
                    n: 'dt',
                    t: 'Дата и время'
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat<fieldFormat.DateTimeField>('dt');
            assert.instanceOf(format, fieldFormat.DateTimeField);
            assert.isFalse(format.isWithoutTimeZone());
        });

        it('should return DateTime without time zone field format', () => {
            const data = {
                d: [123],
                s: [{
                    n: 'dt',
                    t: {
                        n: 'Дата и время',
                        tz: false
                    }
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat<fieldFormat.DateTimeField>('dt');

            assert.isTrue(format.isWithoutTimeZone());
        });

        it('should return Date field format', () => {
            const data = {
                d: [123],
                s: [{
                    n: 'date',
                    t: 'Дата'
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('date');
            assert.instanceOf(format, fieldFormat.DateField);
        });

        it('should return Time field format', () => {
            const data = {
                d: [123],
                s: [{
                    n: 'time',
                    t: 'Время'
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('time');
            assert.instanceOf(format, fieldFormat.TimeField);
        });

        it('should return TimeInterval field format', () => {
            const data = {
                d: [123],
                s: [{
                    n: 'timeint',
                    t: 'Временной интервал'
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('timeint');
            assert.instanceOf(format, fieldFormat.TimeIntervalField);
        });

        it('should return Link field format', () => {
            const adapter = new SbisRecord({
                d: [0],
                s: [{n: 'Ид', t: 'Связь'}]
            });
            const format = adapter.getFormat('Ид');
            assert.instanceOf(format, fieldFormat.LinkField);
        });

        it('should return Identity field format', () => {
            const data = {
                d: [123],
                s: [{
                    n: 'id',
                    t: 'Идентификатор'
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('id');
            assert.instanceOf(format, fieldFormat.IdentityField);
        });

        it('should return Enum field format', () => {
            const data = {
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
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat<fieldFormat.DictionaryField>('enum');
            assert.instanceOf(format, fieldFormat.EnumField);
            assert.deepEqual(format.getDictionary(), data.s[0].t.s);
        });

        it('should return Flags field format', () => {
            const data = {
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
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat<fieldFormat.DictionaryField>('flags');
            assert.instanceOf(format, fieldFormat.FlagsField);
            assert.deepEqual(format.getDictionary(), data.s[0].t.s);
        });

        it('should return Record field format', () => {
            const data = {
                d: [{d: [], s: []}],
                s: [{
                    n: 'rec',
                    t: 'Запись'
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('rec');
            assert.instanceOf(format, fieldFormat.RecordField);
        });

        it('should return RecordSet field format', () => {
            const data = {
                d: [{d: [], s: []}],
                s: [{
                    n: 'rs',
                    t: 'Выборка'
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('rs');
            assert.instanceOf(format, fieldFormat.RecordSetField);
        });

        it('should return Binary field format', () => {
            const data = {
                d: [''],
                s: [{
                    n: 'bin',
                    t: 'Двоичное'
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('bin');
            assert.instanceOf(format, fieldFormat.BinaryField);
        });

        it('should return UUID field format', () => {
            const data = {
                d: [''],
                s: [{
                    n: 'uuid',
                    t: 'UUID'
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('uuid');
            assert.instanceOf(format, fieldFormat.UuidField);
        });

        it('should return RPC-File field format', () => {
            const data = {
                d: [''],
                s: [{
                    n: 'file',
                    t: 'Файл-rpc'
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('file');
            assert.instanceOf(format, fieldFormat.RpcFileField);
        });

        it('should return Array field format', () => {
            const data = {
                d: [''],
                s: [{
                    n: 'arr',
                    t: {
                        n: 'Массив',
                        t: 'Логическое'
                    }
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat<fieldFormat.ArrayField>('arr');
            assert.instanceOf(format, fieldFormat.ArrayField);
            assert.strictEqual(format.getKind(), 'boolean');
        });

        it('should return String field format for unknown type', () => {
            const adapter = new SbisRecord({
                d: [0],
                s: [{n: 'Ид', t: 'Foo'}]
            });
            const format = adapter.getFormat('Ид');
            assert.instanceOf(format, fieldFormat.StringField);
            assert.strictEqual(format.getName(), 'Ид');
        });

        it('should throw an error for not exists field', () => {
            assert.throws(() => {
                adapter.getFormat('Some');
            });
        });

        it('should return format for reused data', () => {
            const data = {
                d: [1],
                s: [{n: 'foo', t: 'Число целое'}]
            };

            const adapterA = new SbisRecord(data);
            assert.strictEqual(adapterA.getFormat('foo').getType(), 'integer');

            data.d.push(2);
            data.s.push({n: 'bar', t: 'Строка'});
            const adapterB = new SbisRecord(data);
            assert.strictEqual(adapterB.getFormat('bar').getType(), 'string');
        });

        it('should return the format after adding it', () => {
            const data: any = {};
            const adapter = new SbisRecord(data);
            const field = fieldsFactory({
                type: 'string',
                name: 'foo'
            });
            adapter.addField(field);

            assert.deepEqual(data.s[0].n, 'foo');
        });
    });

    describe('.getSharedFormat()', () => {
        it('should return Money format with large property as true', () => {
            const data = {
                d: [123],
                s: [{
                    n: 'foo',
                    t: {
                        n: 'Деньги',
                        l: true
                    }
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('foo');

            assert.isTrue((format.meta as IMoneyMeta).large);
        });

        it('should return Money format with large property as false', () => {
            const data = {
                d: [123],
                s: [{
                    n: 'foo',
                    t: 'Деньги'
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('foo');

            assert.isFalse((format.meta as IMoneyMeta).large);
        });

        it('should return DateTime with time zone field format', () => {
            const data = {
                d: [123],
                s: [{
                    n: 'dt',
                    t: 'Дата и время'
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('dt');

            assert.isFalse((format.meta as IDateTimeMeta).withoutTimeZone);
        });

        it('should return DateTime without time zone field format', () => {
            const data = {
                d: [123],
                s: [{
                    n: 'dt',
                    t: {
                        n: 'Дата и время',
                        tz: false
                    }
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('dt');

            assert.isTrue((format.meta as IDateTimeMeta).withoutTimeZone);
        });

        it('should return Enum field format', () => {
            const declaration = {
                n: 'enum',
                t: {
                    n: 'Перечисляемое',
                    s: {
                        0: 'one',
                        1: 'two'
                    }
                }
            };
            const data = {
                d: [1],
                s: [declaration]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('enum');

            assert.deepEqual(format.name, 'enum');
            assert.deepEqual(format.type, 'enum');
            assert.deepEqual((format.meta as IDictionaryMeta).dictionary, declaration.t.s);
            assert.isUndefined((format.meta as IDictionaryMeta).localeDictionary);
        });

        it('should return localized Enum field format', () => {
            const declaration = {
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
            };
            const data = {
                d: [1],
                s: [declaration]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('enum');

            assert.deepEqual(format.name, 'enum');
            assert.deepEqual(format.type, 'enum');
            assert.deepEqual((format.meta as IDictionaryMeta).dictionary, declaration.t.s);
            assert.deepEqual((format.meta as IDictionaryMeta).localeDictionary, declaration.t.sl);
        });

        it('should return Array of Money format', () => {
            const data = {
                d: [123],
                s: [{
                    n: 'foo',
                    t: {
                        n: 'Массив',
                        t: 'Деньги'
                    }
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('foo');

            assert.equal(format.type, 'array');
            assert.equal((format.meta as IArrayMeta).kind, 'money');
            assert.isFalse((format.meta as IMoneyMeta).large);
        });

        it('should return Array of Money format with "precision" property', () => {
            const data = {
                d: [123],
                s: [{
                    n: 'foo',
                    t: {
                        n: 'Массив',
                        t: 'Деньги',
                        p: 3
                    }
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('foo');

            assert.equal(format.type, 'array');
            assert.equal((format.meta as IArrayMeta).kind, 'money');
            assert.equal((format.meta as IMoneyMeta).precision, 3);
        });

        it('should return Array of Money format with "large" property', () => {
            const data = {
                d: [123],
                s: [{
                    n: 'foo',
                    t: {
                        n: 'Массив',
                        t: 'Деньги',
                        l: true
                    }
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('foo');

            assert.equal(format.type, 'array');
            assert.equal((format.meta as IArrayMeta).kind, 'money');
            assert.isTrue((format.meta as IMoneyMeta).large);
        });

        it('should return Array of DateTime format', () => {
            const data = {
                d: [123],
                s: [{
                    n: 'foo',
                    t: {
                        n: 'Массив',
                        t: 'Дата и время'
                    }
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('foo');

            assert.equal(format.type, 'array');
            assert.equal((format.meta as IArrayMeta).kind, 'datetime');
            assert.isFalse((format.meta as IDateTimeMeta).withoutTimeZone);
        });

        it('should return Array of DateTime format with "withoutTimeZone" property', () => {
            const data = {
                d: [123],
                s: [{
                    n: 'foo',
                    t: {
                        n: 'Массив',
                        t: 'Дата и время',
                        tz: false
                    }
                }]
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('foo');

            assert.equal(format.type, 'array');
            assert.equal((format.meta as IArrayMeta).kind, 'datetime');
            assert.isTrue((format.meta as IDateTimeMeta).withoutTimeZone);
        });
    });

    describe('.addField()', () => {
        it('should add a Boolean field', () => {
            const fieldName = 'New';
            const fieldIndex = 1;
            const field = fieldsFactory({
                type: 'boolean',
                name: fieldName
            });
            adapter.addField(field, fieldIndex);

            assert.strictEqual(adapter.getFormat(fieldName).getName(), fieldName);
            assert.strictEqual(adapter.getFields()[fieldIndex], fieldName);
            assert.isNull(adapter.get(fieldName));
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Логическое');
        });

        it('should add an Integer field', () => {
            const fieldName = 'New';
            const fieldIndex = 1;
            const field = fieldsFactory({
                type: 'integer',
                name: fieldName
            });
            adapter.addField(field, fieldIndex);

            assert.strictEqual(adapter.get(fieldName), 0);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Число целое');
        });

        it('should add a Real field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'real',
                name: fieldName
            });
            adapter.addField(field, fieldIndex);

            assert.strictEqual(adapter.get(fieldName), 0);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Число вещественное');
        });

        it('should add a Real field with custom precision', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const precision = 4;
            const field = fieldsFactory({
                type: 'real',
                name: fieldName,
                precision
            });
            adapter.addField(field, fieldIndex);

            assert.strictEqual(adapter.get(fieldName), 0);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Число вещественное');
        });

        it('should add a Money field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'money',
                name: fieldName
            });
            adapter.addField(field, fieldIndex);

            assert.strictEqual(adapter.get(fieldName), 0);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Деньги');
        });

        it('should add a Money field with custom precision', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const precision = 3;
            const field = fieldsFactory({
                type: 'money',
                name: fieldName,
                precision
            });
            adapter.addField(field, fieldIndex);

            assert.strictEqual(adapter.get(fieldName), 0);
            const format = adapter.getData().s[fieldIndex];
            assert.strictEqual((format.t as IFieldType).n, 'Деньги');
            assert.strictEqual((format.t as IRealFieldType).p, 3);
        });

        it('should add a Money field with large flag', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'money',
                name: fieldName,
                large: true
            });
            adapter.addField(field, fieldIndex);

            const format = adapter.getData().s[fieldIndex];
            assert.strictEqual((format.t as IFieldType).n, 'Деньги');
            assert.isTrue((format.t as IMoneyFieldType).l);
        });

        it('should add a String field', () => {
            const fieldName = 'New';
            const fieldIndex = 2;
            const field = fieldsFactory({
                type: 'string',
                name: fieldName
            });
            adapter.addField(field, fieldIndex);

            assert.isNull(adapter.get(fieldName));
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Строка');
        });

        it('should add a deprecated Text field as String field', () => {
            const fieldName = 'New';
            const fieldIndex = 2;
            const field = fieldsFactory({
                type: 'text',
                name: fieldName
            });
            adapter.addField(field, fieldIndex);

            assert.isNull(adapter.get(fieldName));
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Строка');
        });

        it('should add a XML field', () => {
            const fieldName = 'New';
            const fieldIndex = 3;
            const field = fieldsFactory({
                type: 'xml',
                name: fieldName
            });

            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), '');
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'XML-файл');
        });

        it('should add a DateTime field with time zone', () => {
            const fieldName = 'New';
            const fieldIndex = 3;
            const field = fieldsFactory({
                type: 'datetime',
                name: fieldName
            });

            adapter.addField(field, fieldIndex);
            const result = adapter.getData().s[fieldIndex];

            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(result.t, 'Дата и время');
        });

        it('should add an empty DateTime field without time zone', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'datetime',
                name: fieldName,
                withoutTimeZone: true
            });

            adapter.addField(field, fieldIndex);
            const result = adapter.getData().s[fieldIndex];

            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual((result.t as IFieldType).n, 'Дата и время');
            assert.strictEqual((result.t as IDateTimeFieldType).tz, false);
        });

        it('should add a DateTime field without time zone use default value', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const fieldValue = new Date(2018, 7, 15, 16, 50, 33);
            const field = fieldsFactory({
                type: 'datetime',
                name: fieldName,
                withoutTimeZone: true,
                defaultValue: fieldValue
            });
            adapter.addField(field, fieldIndex);

            assert.equal(adapter.get(fieldName), '2018-08-15 16:50:33');
        });

        it('should add a Date field', () => {
            const fieldName = 'New';
            const fieldIndex = 4;
            const field = fieldsFactory({
                type: 'date',
                name: fieldName
            });
            adapter.addField(field, fieldIndex);

            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Дата');
        });

        it('should add a Time field', () => {
            const fieldName = 'New';
            const fieldIndex = 4;
            const field = fieldsFactory({
                type: 'time',
                name: fieldName
            });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Время');
        });

        it('should add a TimeInterval field', () => {
            const fieldName = 'New';
            const fieldIndex = 4;
            const field = fieldsFactory({
                type: 'timeinterval',
                name: fieldName
            });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), 'P0DT0H0M0S');
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Временной интервал');
        });

        it('should add a Identity field', () => {
            const fieldName = 'New';
            const fieldIndex = 4;
            const field = fieldsFactory({
                type: 'identity',
                name: fieldName
            });
            adapter.addField(field, fieldIndex);

            assert.deepEqual(data.d[fieldIndex], [null]);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Идентификатор');
        });

        it('should add an Enum field with Array dictionary', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'enum',
                name: fieldName,
                defaultValue: 1,
                dictionary: ['1st', '2nd']
            });
            const expectedDict = {0: '1st', 1: '2nd'};
            adapter.addField(field, fieldIndex);

            assert.strictEqual(adapter.get(fieldName), 1);
            const format = adapter.getData().s[fieldIndex];
            assert.strictEqual((format.t as IFieldType).n, 'Перечисляемое');
            assert.deepEqual((format.t as IDictFieldType).s, expectedDict);
        });

        it('should add an Enum field with Object dictionary', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'enum',
                name: fieldName,
                defaultValue: 1,
                dictionary: {0: '1st', 1: '2nd'}
            });
            const expectedDict = {0: '1st', 1: '2nd'};
            adapter.addField(field, fieldIndex);

            assert.strictEqual(adapter.get(fieldName), 1);
            const format = adapter.getData().s[fieldIndex];
            assert.strictEqual((format.t as IFieldType).n, 'Перечисляемое');
            assert.deepEqual((format.t as IDictFieldType).s, expectedDict);
        });

        it('should add a Flags field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory<FlagsField>({
                type: 'flags',
                name: fieldName,
                defaultValue: [1],
                dictionary: {0: '1st', 1: '2nd'}
            });
            adapter.addField(field, fieldIndex);

            assert.deepEqual(adapter.get(fieldName), [1]);
            const format = adapter.getData().s[fieldIndex];
            assert.strictEqual((format.t as IFieldType).n, 'Флаги');
            assert.strictEqual((format.t as IDictFieldType).s, field.getDictionary());
        });

        it('should add a Record field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'record',
                name: fieldName
            });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Запись');
        });

        it('should add a RecordSet field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'recordset',
                name: fieldName
            });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Выборка');
        });

        it('should add a RecordSet field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: RecordSet,
                name: fieldName
            });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Выборка');
        });

        it('should add a Binary field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'binary',
                name: fieldName
            });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Двоичное');
        });

        it('should add a UUID field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'uuid',
                name: fieldName
            });
            adapter.addField(field, fieldIndex);
            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'UUID');
        });

        it('should add a RPC-File field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'rpcfile',
                name: fieldName
            });
            adapter.addField(field, fieldIndex);

            assert.strictEqual(adapter.get(fieldName), null);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Файл-rpc');
        });

        it('should add a deprecated Hierarchy field as Identity field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'hierarchy',
                name: fieldName,
                kind: 'Identity'
            });
            adapter.addField(field, fieldIndex);

            assert.deepEqual(data.d[fieldIndex], [null]);
            assert.strictEqual(adapter.getData().s[fieldIndex].t, 'Идентификатор');
        });

        it('should add an Array field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'array',
                name: fieldName,
                kind: 'Boolean'
            });
            adapter.addField(field, fieldIndex);

            assert.strictEqual(adapter.get(fieldName), null);
            const format = adapter.getData().s[fieldIndex];
            assert.strictEqual((format.t as IFieldType).n, 'Массив');
            assert.strictEqual((format.t as IArrayFieldType).t, 'Логическое');
        });

        it('should use a field default value', () => {
            const fieldName = 'New';
            const def = 'abc';
            adapter.addField(fieldsFactory({
                type: 'string',
                name: fieldName,
                defaultValue: def
            }));

            assert.strictEqual(adapter.get(fieldName), def);
        });

        it('should throw an error for already exists field', () => {
            assert.throws(() => {
                adapter.addField(fieldsFactory({
                    type: 'string',
                    name: 'Ид'
                }));
            });
        });

        it('should throw an error for not a field', () => {
            assert.throws(() => {
                adapter.addField(undefined);
            });
            assert.throws(() => {
                adapter.addField(null);
            });
            assert.throws(() => {
                adapter.addField({
                    type: 'string',
                    name: 'New'
                } as any);
            });
        });
    });

    describe('.removeField()', () => {
        it('should remove exists field', () => {
            const name = 'Ид';
            const index = 0;
            const newFields = adapter.getFields();
            const newData = adapter.getData().d.slice();

            adapter.removeField(name);
            newFields.splice(index, 1);
            newData.splice(index, 1);

            assert.isUndefined(adapter.get(name));
            assert.deepEqual(adapter.getFields(), newFields);
            assert.deepEqual(adapter.getData().d, newData);
            assert.throws(() => {
                adapter.getFormat(name);
            });
        });

        it('should throw an error for not exists field', () => {
            assert.throws(() => {
                adapter.removeField('Some');
            });
        });
    });

    describe('.removeFieldAt()', () => {
        it('should remove exists field', () => {
            const name = 'Ид';
            const index = 0;
            const newFields = adapter.getFields();
            const newData = adapter.getData().d.slice();

            adapter.removeFieldAt(0);
            newFields.splice(index, 1);
            newData.splice(index, 1);

            assert.isUndefined(adapter.get(name));
            assert.deepEqual(adapter.getFields(), newFields);
            assert.deepEqual(adapter.getData().d, newData);
            assert.throws(() => {
                adapter.getFormat(name);
            });
        });

        it('should throw an error for not exists field', () => {
            assert.throws(() => {
                adapter.removeFieldAt(9);
            });
        });
    });

    describe('.setFormatController()', () => {
        it('should create enumerable property named "s" after add a field', () => {
            const data: any = {};
            const adapter = new SbisRecord(data);
            const controller = new SbisFormatFinder(data);
            const field = fieldsFactory({
                type: 'string',
                name: 'foo'
            });
            adapter.setFormatController(controller);
            adapter.addField(field);

            const keys = Object.keys(data);
            assert.notEqual(keys.indexOf('s'), -1);
            assert.strictEqual(data.s[0].n, 'foo');
        });
    });
});
