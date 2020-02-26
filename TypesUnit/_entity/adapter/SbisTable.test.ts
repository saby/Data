import {assert} from 'chai';
import SbisTable from 'Types/_entity/adapter/SbisTable';
import SbisFieldType from 'Types/_entity/adapter/SbisFieldType';
import fieldsFactory from 'Types/_entity/format/fieldsFactory';
import IntegerField from 'Types/_entity/format/IntegerField';
import StringField from 'Types/_entity/format/StringField';
import {IFieldFormat, ITableFormat} from 'Types/_entity/adapter/SbisFormatMixin';
import SbisFormatFinder from "../../../Types/_entity/adapter/SbisFormatFinder";

describe('Types/_entity/adapter/SbisTable', () => {
    const getFormat = (): IFieldFormat[] => [
        {n: 'id', t: 'Число целое'},
        {n: 'lastname', t: 'Строка'}
    ];

    let data: ITableFormat;
    let adapter: SbisTable;

    beforeEach(() => {
        data = {
            d: [
                [1, 'Smith'],
                [2, 'Green'],
                [3, 'Geller'],
                [4, 'Bing'],
                [5, 'Tribbiani'],
                [6, 'Buffay'],
                [7, 'Tyler']
            ],
            s: getFormat()
        };

        adapter = new SbisTable(data);
    });

    afterEach(() => {
        data = undefined;
        adapter = undefined;
    });

    describe('.getMetaDataDescriptor()', () => {
        it('should return an empty array for empty data', () => {
            const data = null;
            const adapter = new SbisTable(data);
            const descriptor = adapter.getMetaDataDescriptor();

            assert.equal(descriptor.length, 0);
        });

        it('should return results field', () => {
            const data = {
                d: [],
                r: {d: [], s: []}
            };
            const adapter = new SbisTable(data);
            const descriptor = adapter.getMetaDataDescriptor();

            assert.equal(descriptor[0].getName(), 'results');
            assert.equal(descriptor[0].getType(), 'record');
        });

        it('should return path field', () => {
            const data = {
                d: [],
                p: {d: [], s: []}
            };
            const adapter = new SbisTable(data);
            const descriptor = adapter.getMetaDataDescriptor();

            assert.equal(descriptor[0].getName(), 'path');
            assert.equal(descriptor[0].getType(), 'recordset');
        });

        it('should return total field for Number', () => {
            const data = {
                n: 1,
                d: []
            };
            const adapter = new SbisTable(data);
            const descriptor = adapter.getMetaDataDescriptor();

            assert.equal(descriptor[0].getName(), 'total');
            assert.equal(descriptor[0].getType(), 'integer');

            assert.equal(descriptor[1].getName(), 'more');
            assert.equal(descriptor[1].getType(), 'integer');
        });

        it('should return total field for Boolean', () => {
            const data = {
                n: true,
                d: []
            };
            const adapter = new SbisTable(data);
            const descriptor = adapter.getMetaDataDescriptor();

            assert.equal(descriptor[0].getName(), 'total');
            assert.equal(descriptor[0].getType(), 'boolean');

            assert.equal(descriptor[1].getName(), 'more');
            assert.equal(descriptor[1].getType(), 'boolean');
        });

        it('should return total field for Object', () => {
            const data = {
                n: {
                    after: false,
                    before: true
                },
                d: []
            };
            const adapter = new SbisTable(data);
            const descriptor = adapter.getMetaDataDescriptor();

            assert.equal(descriptor[0].getName(), 'total');
            assert.equal(descriptor[0].getType(), 'object');

            assert.equal(descriptor[1].getName(), 'more');
            assert.equal(descriptor[1].getType(), 'object');
        });

        it('should return total field for RecordSet', () => {
            const data = {
                n: {
                    _type: 'recordset',
                    d: [],
                    s: []
                },
                d: []
            };
            const adapter = new SbisTable(data);
            const descriptor = adapter.getMetaDataDescriptor();

            assert.equal(descriptor[0].getName(), 'total');
            assert.equal(descriptor[0].getType(), 'recordset');

            assert.equal(descriptor[1].getName(), 'more');
            assert.equal(descriptor[1].getType(), 'recordset');
        });

        it('should return meta fields', () => {
            const format = getFormat();
            const data = {
                m: {
                    d: [1, 'foo'],
                    s: format
                },
                d: []
            };
            const adapter = new SbisTable(data);
            const descriptor = adapter.getMetaDataDescriptor();

            assert.equal(descriptor.length, format.length);

            descriptor.forEach((field, index) => {
                assert.equal(field.getName(), format[index].n);
                assert.equal(SbisFieldType[field.getType()], format[index].t);
            });
        });
    });

    describe('.clone()', () => {
        it('should return new instance', () => {
            assert.notEqual(adapter.clone(), adapter);
            assert.instanceOf(adapter.clone(), SbisTable);
        });

        it('should return shared raw data if shallow', () => {
            assert.strictEqual(adapter.clone(true).getData(), data);
        });

        it('should return cloned raw data if not shallow', () => {
            const clone = adapter.clone();
            assert.notEqual(clone.getData(), data);
            assert.deepEqual(clone.getData(), data);
        });
    });

    describe('.getFields()', () => {
        it('should return fields list', () => {
            assert.deepEqual(
                adapter.getFields(),
                ['id', 'lastname']
            );
        });
    });

    describe('.getCount()', () => {
        it('should return records count', () => {
            assert.strictEqual(
                7,
                adapter.getCount()
            );

            assert.strictEqual(
                0,
                new SbisTable({} as any).getCount()
            );

            assert.strictEqual(
                0,
                new SbisTable('' as any).getCount()
            );

            assert.strictEqual(
                0,
                new SbisTable(0 as any).getCount()
            );

            assert.strictEqual(
                0,
                new SbisTable().getCount()
            );
        });
    });

    describe('.add()', () => {
        it('should append a record', () => {
            adapter.add({
                d: [30, 'Огурцов'],
                s: getFormat()
            }, undefined);

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

        it('should prepend a record', () => {
            adapter.add(
                {d: [40, 'Перцов'], s: getFormat()},
                0
            );

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

        it('should insert a record', () => {
            adapter.add({
                d: [50, 'Горохов'],
                s: getFormat()
            }, 2);

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

        it('should insert the first record', () => {
            const format = [{n: 'id', t: 'Число целое'}];
            const data = {
                d: [],
                s: format
            };
            const adapter = new SbisTable(data);

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

        it('should insert the last record', () => {
            const format = [{n: 'id', t: 'Число целое'}];
            const data = {
                d: [[1], [2]],
                s: format
            };
            const adapter = new SbisTable(data);

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

        it('should throw an error on invalid position', () => {
            assert.throws(() => {
                adapter.add({d: [30, 'aaa'], s: getFormat()}, 100);
            });
            assert.throws(() => {
                adapter.add({d: [30, 'aaa'], s: getFormat()}, -1);
            });
        });

        it('should take the format from the record if don\'t have own', () => {
            const table = {d: [], s: []};
            const adapter = new SbisTable(table);
            const format = [{n: 'id', t: 'Число целое'}];
            const rec = {d: [1], s: format};

            adapter.add(rec, 0);
            assert.strictEqual(table.s, rec.s);
        });

        it('should share own format with the record', () => {
            const getFormat = () => {
                return [{n: 'id', t: 'Число целое'}];
            };
            const format = getFormat();
            const table = {d: [], s: format};
            const adapter = new SbisTable(table);
            const rec = {d: [1], s: getFormat()};

            adapter.add(rec, 0);
            assert.strictEqual(rec.s, table.s);
        });

        it('should add a record with different columns count', () => {
            const format = getFormat();
            const count = data.d.length;

            format.push({n: 'test', t: 'Строка'});
            adapter.add({d: [30, 'Огурцов'], s: format}, undefined);

            assert.strictEqual(
                1 + count,
                data.d.length
            );
        });

        it('should add a record with different columns name', () => {
            const format = getFormat();
            const count = data.d.length;

            format[0].n = 'test';
            adapter.add({d: [30, 'Огурцов'], s: format}, undefined);

            assert.strictEqual(
                1 + count,
                data.d.length
            );
        });

        it('should add a record with different columns type', () => {
            const format = getFormat();
            const count = data.d.length;

            format[0].t = 'test';
            adapter.add({d: [30, 'Огурцов'], s: format}, undefined);

            assert.strictEqual(
                1 + count,
                data.d.length
            );
        });

        it('should take the format from the record if don\'t have own and not empty owns format', () => {
            const table = {
                d: [],
                s: [{n: 'id', t: 'Строка'}]
            };
            const adapter = new SbisTable(table);
            const format = [{n: 'id', t: 'Число целое'}];
            const rec = {d: [1], s: format};

            adapter.add(rec, 0);
            assert.strictEqual(table.s, rec.s);
        });
    });

    describe('.at()', () => {
        it('should return valid record', () => {
            assert.strictEqual(
                1,
                adapter.at(0).d[0] as any
            );
            assert.strictEqual(
                3,
                adapter.at(2).d[0] as any
            );
        });

        it('should return undefined on invalid position', () => {
            assert.isUndefined(
                adapter.at(-1)
            );
            assert.isUndefined(
                adapter.at(99)
            );
        });

        it('should return undefined on invalid data', () => {
            assert.isUndefined(
                new SbisTable({} as any).at(undefined)
            );
            assert.isUndefined(
                new SbisTable('' as any).at(undefined)
            );
            assert.isUndefined(
                new SbisTable(0 as any).at(undefined)
            );
            assert.isUndefined(
                new SbisTable().at(undefined)
            );
        });
    });

    describe('.remove()', () => {
        it('should remove the record', () => {
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

        it('should throw an error on invalid position', () => {
            assert.throws(() => {
                adapter.remove(-1);
            });
            assert.throws(() => {
                adapter.remove(99);
            });
        });
    });

    describe('.merge()', () => {
        it('should merge two records', () => {
            adapter.merge(0, 1);
            assert.strictEqual(
                'Green',
                data.d[0][1]
            );
        });
    });

    describe('.copy()', () => {
        it('should copy the record', () => {
            const copy = adapter.copy(1);
            assert.deepEqual(
                copy,
                data.d[1]
            );
        });

        it('should insert a copy after the original', () => {
            const copy = adapter.copy(1);
            assert.strictEqual(
                copy,
                data.d[2]
            );
        });
    });

    describe('.replace()', () => {
        it('should replace the record', () => {
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

        it('should throw an error on invalid position', () => {
            assert.throws(() => {
                adapter.replace({d: [13]}, -1);
            });
            assert.throws(() => {
                adapter.replace({d: [14]}, 99);
            });
        });

        it('should replace s in raw data', () => {
            const s = [{n: 'id', t: 'Число целое'}];
            const adapter = new SbisTable({d: [[1]], s: []});
            adapter.replace({d: [11], s}, 0);
            assert.strictEqual(adapter.getData().s,  s);
        });

        it('should set s in record', () => {
            const record = {d: [], s: getFormat()};
            adapter.replace(record, 0);
            assert.strictEqual(record.s,  adapter.getData().s);
        });
    });

    describe('.move()', () => {
        it('should move Smith instead Geller', () => {
            adapter.move(0, 2);
            assert.strictEqual(
                'Green',
                data.d[0][1]
            );
            assert.strictEqual(
                'Geller',
                data.d[1][1]
            );
            assert.strictEqual(
                'Smith',
                data.d[2][1]
            );
        });

        it('should move Geller instead Smith', () => {
            adapter.move(2, 0);
            assert.strictEqual(
                'Geller',
                data.d[0][1]
            );
            assert.strictEqual(
                'Smith',
                data.d[1][1]
            );
            assert.strictEqual(
                'Green',
                data.d[2][1]
            );
        });

        it('should move Green to the end', () => {
            adapter.move(1, 6);
            assert.strictEqual(
                'Green',
                data.d[6][1]
            );
            assert.strictEqual(
                'Tyler',
                data.d[5][1]
            );
        });

        it('should not move Green', () => {
            adapter.move(1, 1);
            assert.strictEqual(
                'Green',
                data.d[1][1]
            );
            assert.strictEqual(
                'Buffay',
                data.d[5][1]
            );
        });
    });

    describe('.clear()', () => {
        it('should return an empty table', () => {
            assert.isTrue(data.d.length > 0);
            assert.isTrue(data.s.length > 0);
            adapter.clear();
            assert.strictEqual(adapter.getData().d.length, 0);
            assert.strictEqual(adapter.getData().s, data.s);
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

    describe('.getFormat()', () => {
        it('should return integer field format', () => {
            const format = adapter.getFormat('id');
            assert.instanceOf(format, IntegerField);
            assert.strictEqual(format.getName(), 'id');
        });

        it('should return string field format', () => {
            const format = adapter.getFormat('lastname');
            assert.instanceOf(format, StringField);
            assert.strictEqual(format.getName(), 'lastname');
        });

        it('should throw an error for not exists field', () => {
            assert.throws(() => {
                adapter.getFormat('Some');
            });
        });
    });

    describe('.addField()', () => {
        it('should add a new field', () => {
            const fieldName = 'New';
            const fieldPos = 1;
            const field = fieldsFactory({
                type: 'string',
                name: fieldName
            });
            adapter.addField(field, fieldPos);
            assert.strictEqual(adapter.getFormat(fieldName).getName(), fieldName);
            for (let i = 0; i < adapter.getCount(); i++) {
                assert.strictEqual(adapter.at(i).s[fieldPos].n, fieldName);
            }
        });

        it('should use a field default value', () => {
            const fieldName = 'New';
            const fieldPos = 1;
            const def = 'abc';
            adapter.addField(fieldsFactory({
                type: 'string',
                name: fieldName,
                defaultValue: def
            }), fieldPos);
            for (let i = 0; i < adapter.getCount(); i++) {
                assert.strictEqual(adapter.at(i).d[fieldPos] as any, def);
            }
        });

        it('should throw an error for already exists field', () => {
            assert.throws(() => {
                adapter.addField(fieldsFactory({
                    type: 'string',
                    name: 'id'
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
            const name = 'id';
            const index = 0;
            const newFields = adapter.getData().s.slice();
            const newData = adapter.getData().d.slice().map((item) => {
                item.slice().splice(index, 1);
                return item;
            });

            adapter.removeField(name);
            newFields.splice(index, 1);

            assert.deepEqual(adapter.getData().s, newFields);
            assert.deepEqual(adapter.getData().d, newData);
            for (let i = 0; i < adapter.getCount(); i++) {
                assert.deepEqual(adapter.at(i).s, newFields);
            }
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
            const name = 'id';
            const index = 0;
            const newFields = adapter.getData().s.slice().splice(index - 1, 1);
            const newData = adapter.getData().d.slice().map((item) => {
                item.slice().splice(index, 1);
                return item;
            });

            adapter.removeFieldAt(index);
            assert.deepEqual(adapter.getData().s, newFields);
            assert.deepEqual(adapter.getData().d, newData);
            for (let i = 0; i < adapter.getCount(); i++) {
                assert.deepEqual(adapter.at(i).s, newFields);
            }
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

    describe('support compression data', () => {
        const data = {
            f: 0,
            s: [
                {n: 'id', t: 'Число целое'},
                {n: 'data', t: 'Запись'}
            ],
            d: [
                [0, {
                    f: 1,
                    s: [
                        {n: 'model', t: 'строка'},
                        {n: 'brand', t: 'строка'}
                    ],
                    d: [
                        'Ford', 'Focus2'
                    ]
                }],
                [1, {
                    f: 1,
                    d: [
                        'AUDI', 'Q5'
                    ]
                }],
                [2, {
                    f: 1,
                    d: [
                        'Hyundai', 'ix35'
                    ]
                }]
            ]
        };
        const adapter = new SbisTable(data);

        it('serialize data chunk from data table', () => {
            adapter.setFormatController(new SbisFormatFinder(data));
            const chunkData = adapter.at(1);
            assert.equal(JSON.stringify(chunkData), '{"d":[1,{"f":1,"d":["AUDI","Q5"],"s":[{"n":"model","t":"строка"},{"n":"brand","t":"строка"}]}],"s":[{"n":"id","t":"Число целое"},{"n":"data","t":"Запись"}]}');
        });
    });
});
