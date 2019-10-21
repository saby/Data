import {assert} from 'chai';
import RecordSetTableAdapter from 'Types/_entity/adapter/RecordSetTable';
import Record from 'Types/_entity/Record';
import Model from 'Types/_entity/Model';
import fieldsFactory, {IDeclaration} from 'Types/_entity/format/fieldsFactory';
import RecordSet from 'Types/_collection/RecordSet';
import 'Types/_entity/adapter/Sbis';

describe('Types/_entity/adapter/RecordSetTable', () => {
    let format: IDeclaration[];
    let data: RecordSet;
    let adapter: RecordSetTableAdapter;

    beforeEach(() => {
        format = [
            {name: 'id', type: 'integer'},
            {name: 'name', type: 'string'},
        ];

        data = new RecordSet({
            format,
            rawData: [{
                id: 1,
                name: 'Smith',
            }, {
                id: 2,
                name: 'Green',
            }, {
                id: 3,
                name: 'Geller',
            }],
        });

        adapter = new RecordSetTableAdapter(data);
    });

    afterEach(() => {
        format = undefined;
        data = undefined;
        adapter = undefined;
    });

    describe('.constructor()', () => {
        it('should throw TypeError for invalid data', () => {
            assert.throws(() => {
                adapter = new RecordSetTableAdapter([] as any);
            }, TypeError);
            assert.throws(() => {
                adapter = new RecordSetTableAdapter({} as any);
            }, TypeError);
        });
    });

    describe('.getFields()', () => {
        it('should return fields list', () => {
            const fields = adapter.getFields();
            for (let i = 0; i < format.length; i++) {
                assert.equal(
                    fields[i],
                    format[i].name,
                );
            }
        });

        it('should return empty list for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            const fields = adapter.getFields();
            assert.isTrue(fields.length === 0);
        });

        it('should return fields list without model properties', () => {
            const Foo = (opts) => {
                return new Model({...{
                    properties: {
                        foo: {
                            get: () => {
                                return 'bar';
                            },
                        },
                    },
                }, ...opts});
            };

            const data = new RecordSet({
                model: Foo,
                rawData: [{
                    id: 1,
                    name: 'Sample',
                }],
            });

            const adapter = new RecordSetTableAdapter(data);

            assert.deepEqual(
                adapter.getFields(),
                ['id', 'name'],
            );
        });
    });

    describe('.getCount()', () => {
        it('should return records count', () => {
            assert.deepEqual(
                adapter.getCount(),
                data.getCount(),
            );
        });

        it('should return 0 for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            assert.isTrue(adapter.getCount() === 0);
        });
    });

    describe('.add()', () => {
        it('should append a record', () => {
            const count = data.getCount();
            const rec = new Record({
                rawData: {id: 9, name: 'foo'},
            });

            adapter.add(rec, undefined);
            assert.strictEqual(
                data.at(count).get('name'),
                'foo',
            );
        });

        it('should prepend a record', () => {
            const rec = new Record({
                rawData: {id: 9, name: 'foo'},
            });
            adapter.add(rec, 0);
            assert.strictEqual(
                data.at(0).get('name'),
                'foo',
            );
        });

        it('should insert a record', () => {
            const rec = new Record({
                rawData: {id: 9, name: 'foo'},
            });
            adapter.add(rec, 1);
            assert.strictEqual(
                data.at(1).get('name'),
                'foo',
            );
        });

        it('should initialize RecordSet for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            const rec = new Record();
            adapter.add(rec, undefined);
            assert.instanceOf(adapter.getData(), RecordSet);
        });

        it('should take adapter from record if empty data', () => {
            const adapter = new RecordSetTableAdapter();
            const rec = new Record({
                format: [],
                adapter: 'Types/entity:adapter.Sbis',
            });
            adapter.add(rec, undefined);
            assert.strictEqual(adapter.getData().getAdapter(), rec.getAdapter());
        });

        it('should take keyProperty from record if empty data', () => {
            const adapter = new RecordSetTableAdapter();
            const rec = new Model({
                format: [],
                adapter: 'Types/entity:adapter.Sbis',
                keyProperty: 'id',
            });
            adapter.add(rec, undefined);
            assert.strictEqual(adapter.getData().getKeyProperty(), rec.getKeyProperty());
        });

        it('should throw an error on invalid position', () => {
            assert.throws(() => {
                const rec = new Record();
                adapter.add(rec, 100);
            });
            assert.throws(() => {
                const rec = new Record();
                adapter.add(rec, -1);
            });
        });
    });

    describe('.at()', () => {
        it('should return valid record', () => {
            assert.strictEqual(
                data.at(0),
                adapter.at(0),
            );
        });

        it('should return undefined on invalid position', () => {
            assert.isUndefined(
                adapter.at(-1),
            );
            assert.isUndefined(
                adapter.at(99),
            );
        });

        it('should return undefined for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            assert.isUndefined(adapter.at(0));
        });
    });

    describe('.remove()', () => {
        it('should remove the record', () => {
            const rec = adapter.at(0);
            adapter.remove(0);
            assert.notEqual(
                rec,
                adapter.at(0),
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

        it('should throw TypeError for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            assert.throws(() => {
                adapter.remove(0);
            }, TypeError);
        });
    });

    describe('.replace()', () => {
        it('should replace the record', () => {
            const rec = new Record({
                rawData: {id: 9, name: 'foo'},
            });
            adapter.replace(rec, 0);
            assert.strictEqual(
                data.at(0).get('name'),
                'foo',
            );
        });

        it('should throw an error on invalid position', () => {
            const rec = new Record();
            assert.throws(() => {
                adapter.replace(rec, -1);
            });
            assert.throws(() => {
                adapter.replace(rec, 99);
            });
        });

        it('should throw TypeError for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            const rec = new Record();
            assert.throws(() => {
                adapter.replace(rec, 0);
            }, TypeError);
        });
    });

    describe('.move()', () => {
        it('should move Smith instead Green', () => {
            adapter.move(0, 2);
            assert.strictEqual(
                'Green',
                adapter.at(0).get('name'),
            );
            assert.strictEqual(
                'Geller',
                adapter.at(1).get('name'),
            );
            assert.strictEqual(
                'Smith',
                adapter.at(2).get('name'),
            );
        });

        it('should move Geller instead Smith', () => {
            adapter.move(2, 0);
            assert.strictEqual(
                'Geller',
                adapter.at(0).get('name'),
            );
            assert.strictEqual(
                'Smith',
                adapter.at(1).get('name'),
            );
            assert.strictEqual(
                'Green',
                adapter.at(2).get('name'),
            );
        });

        it('should move Green to the end', () => {
            adapter.move(1, 2);
            assert.strictEqual(
                'Green',
                adapter.at(2).get('name'),
            );
            assert.strictEqual(
                'Geller',
                adapter.at(1).get('name'),
            );
        });

        it('should not move Green', () => {
            adapter.move(1, 1);
            assert.strictEqual(
                'Green',
                adapter.at(1).get('name'),
            );
        });

        it('should throw TypeError for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            assert.throws(() => {
                adapter.move(0, 0);
            }, TypeError);
        });
    });

    describe('.merge()', () => {
        it('should throw TypeError for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            assert.throws(() => {
                adapter.merge(0, 0, undefined);
            }, TypeError);
        });
    });

    describe('.copy()', () => {
        it('should throw TypeError for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            assert.throws(() => {
                adapter.copy(0);
            }, TypeError);
        });
    });

    describe('.copy()', () => {
        it('should copy the record', () => {
            const copy = adapter.copy(1);
            assert.isTrue(
                copy.isEqual(
                    data.at(1),
                ),
            );
        });

        it('should insert a copy after the original', () => {
            const copy = adapter.copy(1);
            assert.isTrue(copy.get('id') > 0);
            assert.strictEqual(
                copy.get('id'),
                data.at(2).get('id'),
            );
        });
    });

    describe('.clear()', () => {
        it('should return an empty table', () => {
            assert.isTrue(data.getCount() > 0);
            adapter.clear();
            assert.strictEqual(adapter.getData().getCount(), 0);
        });

        it('should return a same instance', () => {
            adapter.clear();
            assert.strictEqual(data, adapter.getData());
        });

        it('should throw TypeError for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            assert.throws(() => {
                adapter.clear();
            }, TypeError);
        });
    });

    describe('.getData()', () => {
        it('should return raw data', () => {
            assert.strictEqual(adapter.getData(), data);
        });
    });

    describe('.getFormat()', () => {
        it('should return exists field format', () => {
            const format = adapter.getFormat('id');
            assert.strictEqual(format.getName(), 'id');
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
            const field = fieldsFactory({
                type: 'string',
                name: fieldName,
            });
            adapter.addField(field, 0);
            assert.strictEqual(adapter.getFormat(fieldName).getName(), fieldName);
            assert.strictEqual(data.getFormat().at(0).getName(), fieldName);
        });

        it('should use a field default value', () => {
            const fieldName = 'New';
            const def = 'abc';
            adapter.addField(fieldsFactory({
                type: 'string',
                name: fieldName,
                defaultValue: def,
            }), 0);
            for (let i = 0; i < adapter.getCount(); i++) {
                assert.strictEqual(adapter.at(i).get(fieldName), def);
                assert.strictEqual(data.at(i).get(fieldName), def);
            }
        });

        it('should throw an error for already exists field', () => {
            assert.throws(() => {
                adapter.addField(fieldsFactory({
                    type: 'string',
                    name: 'id',
                }), 0);
            });
        });

        it('should throw an error for not a field', () => {
            assert.throws(() => {
                adapter.addField(undefined, undefined);
            });

            assert.throws(() => {
                adapter.addField(null, undefined);
            });
        });

        it('should throw TypeError for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            const field = fieldsFactory({
                type: 'string',
                name: 'id',
            });
            assert.throws(() => {
                adapter.addField(field, undefined);
            }, TypeError);
        });
    });

    describe('.removeField()', () => {
        it('should remove exists field', () => {
            const name = 'id';
            adapter.removeField(name);
            for (let i = 0; i < adapter.getCount(); i++) {
                assert.isUndefined(adapter.at(i).get(name));
                assert.isUndefined(data.at(i).get(name));
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

        it('should throw TypeError for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            assert.throws(() => {
                adapter.removeField('id');
            }, TypeError);
        });
    });

    describe('.removeFieldAt()', () => {
        const getRawData = () => {
            return {
                d: [
                    [1, 'Smith'],
                    [2, 'Green'],
                    [3, 'Geller'],
                ],
                s: [
                    {n: 'id', t: 'Число целое'},
                    {n: 'name', t: 'Строка'},
                ],
            };
        };

        it('should remove exists field', () => {
            const data = new RecordSet({
                format,
                rawData: getRawData(),
                adapter: 'Types/entity:adapter.Sbis',
            });
            const adapter = new RecordSetTableAdapter(data);
            const oldF = adapter.getFields();

            adapter.removeFieldAt(0);
            const newF = adapter.getFields();
            assert.notEqual(oldF[0], newF[0]);
            assert.strictEqual(oldF[1], newF[0]);
            assert.throws(() => {
                adapter.getFormat(oldF[0]);
            });
        });

        it('should throw an error', () => {
            const data = new RecordSet({
                rawData: getRawData(),
                adapter: 'Types/entity:adapter.Sbis',
            });
            const adapter = new RecordSetTableAdapter(data);

            assert.throws(() => {
                adapter.removeFieldAt(-1);
            });
            assert.throws(() => {
                adapter.removeFieldAt(10);
            });
        });

        it('should throw TypeError for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            assert.throws(() => {
                adapter.removeFieldAt(0);
            }, TypeError);
        });
    });
});
