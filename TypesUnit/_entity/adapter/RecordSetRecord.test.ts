import {assert} from 'chai';
import RecordSetRecordAdapter from 'Types/_entity/adapter/RecordSetRecord';
import Record from 'Types/_entity/Record';
import Model from 'Types/_entity/Model';
import RecordSet from 'Types/_collection/RecordSet';
import fieldsFactory, {IDeclaration} from 'Types/_entity/format/fieldsFactory';

describe('Types/_entity/adapter/RecordSetRecord', () => {
    let format: IDeclaration[];
    let data: Record;
    let adapter: RecordSetRecordAdapter;

    beforeEach(() => {
        format = [
            {name: 'id', type: 'integer'},
            {name: 'name', type: 'string'}
        ];

        data = new Record({
            format,
            rawData: {
                id: 1,
                name: 'Sample'
            }
        });

        adapter = new RecordSetRecordAdapter(data);
    });

    afterEach(() => {
        format = undefined;
        data = undefined;
        adapter = undefined;
    });

    describe('.constructor()', () => {
        it('should throw TypeError for invalid data', () => {
            assert.throws(() => {
                adapter = new RecordSetRecordAdapter([] as any);
            }, TypeError);

            assert.throws(() => {
                adapter = new RecordSetRecordAdapter({} as any);
            }, TypeError);
        });
    });

    describe('.has()', () => {
        it('should return true for exists property', () => {
            assert.isTrue(adapter.has('id'));
        });

        it('should return false for not exists property', () => {
            assert.isFalse(adapter.has('some'));
        });

        it('should return false for empty data', () => {
            const adapter = new RecordSetRecordAdapter();
            assert.isFalse(adapter.has('id'));
        });
    });

    describe('.get()', () => {
        it('should return the property value', () => {
            assert.strictEqual(
                1,
                adapter.get('id')
            );
            assert.strictEqual(
                'Sample',
                adapter.get('name')
            );
        });

        it('should return undefined for not exists property', () => {
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
                new RecordSetRecordAdapter().get(undefined)
            );
        });

        it('should return undefined for empty data', () => {
            const adapter = new RecordSetRecordAdapter();
            assert.isUndefined(adapter.get('id'));
        });
    });

    describe('.set()', () => {
        it('should init raw data as Record', () => {
            const adapter = new RecordSetRecordAdapter();

            adapter.set('foo', 'bar');

            assert.instanceOf(adapter.getData(), Record);
            assert.strictEqual(adapter.getData().get('foo'), 'bar');
        });

        it('should set the exists property value', () => {
            adapter.set('id', 20);
            assert.strictEqual(
                20,
                data.get('id')
            );
        });

        it('should set the not exists property value', () => {
            const data = new Record({
                rawData: {
                    id: 1,
                    name: 'test'
                }
            });
            const adapter = new RecordSetRecordAdapter(data);

            adapter.set('a', 5);
            assert.strictEqual(
                5,
                data.get('a')
            );

            adapter.set('b', undefined);
            assert.isUndefined(
                data.get('b')
            );
        });

        it('should create new Record from empty data if RecordSet given', () => {
            const rs = new RecordSet();
            const adapter = new RecordSetRecordAdapter(null, rs);

            adapter.set('id', 1);
            assert.strictEqual(adapter.get('id'), 1);
            assert.instanceOf(adapter.getData(), Record);
        });

        it('should throw ReferenceError for invalid name', () => {
            assert.throws(() => {
                adapter.set(undefined, undefined);
            }, ReferenceError);

            assert.throws(() => {
                adapter.set('', undefined);
            }, ReferenceError);

            assert.throws(() => {
                adapter.set(0 as any, undefined);
            }, ReferenceError);
        });
    });

    describe('.clear()', () => {
        it('should become an empty record', () => {
            adapter.clear();
            let hasFields = false;
            adapter.getData().each(() => {
                hasFields = true;
            });
            assert.isFalse(hasFields);
        });

        it('should return a same instance', () => {
            adapter.clear();
            assert.strictEqual(data, adapter.getData());
        });

        it('should init empty data as Record', () => {
            const adapter = new RecordSetRecordAdapter();
            adapter.clear();
            assert.instanceOf(adapter.getData(), Record);
        });
    });

    describe('.getData()', () => {
        it('should return raw data', () => {
            assert.strictEqual(adapter.getData(), data);
        });
    });

    describe('.getTableData()', () => {
        it('should return data passed to the constructor', () => {
            const tableData = new RecordSet();
            const localAdapter = new RecordSetRecordAdapter(data, tableData);
            assert.strictEqual(localAdapter.getTableData(), tableData);
        });
    });

    describe('.getFields()', () => {
        it('should return fields list', () => {
            assert.deepEqual(
                adapter.getFields(),
                ['id', 'name']
            );
        });

        it('should return empty list for empty data', () => {
            const adapter = new RecordSetRecordAdapter();
            assert.isTrue(adapter.getFields().length === 0);
        });

        it('should return fields list without model properties', () => {
            const data = new Model({
                properties: {
                    foo: {
                        get: () => {
                            return 'bar';
                        }
                    }
                },
                rawData: {
                    id: 1,
                    name: 'Sample'
                }
            });
            const adapter = new RecordSetRecordAdapter(data);

            assert.deepEqual(
                adapter.getFields(),
                ['id', 'name']
            );
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
                name: fieldName
            });

            adapter.addField(field, 0);
            assert.strictEqual(adapter.getFormat(fieldName).getName(), fieldName);
        });

        it('should use a field default value', () => {
            const fieldName = 'New';
            const def = 'abc';

            adapter.addField(fieldsFactory({
                type: 'string',
                name: fieldName,
                defaultValue: def
            }), 0);
            assert.strictEqual(adapter.get(fieldName), def);
            assert.strictEqual(data.get(fieldName), def);
        });

        it('should throw an error for already exists field', () => {
            assert.throws(() => {
                adapter.addField(fieldsFactory({
                    type: 'string',
                    name: 'name'
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

        it('should init empty data and add a field in there', () => {
            const adapter = new RecordSetRecordAdapter();
            const field = fieldsFactory({
                type: 'string',
                name: 'id'
            });

            adapter.addField(field, 0);
            assert.strictEqual(adapter.getData().getFormat().getFieldIndex('id'), 0);
        });
    });

    describe('.removeField()', () => {
        it('should remove exists field', () => {
            const name = 'id';
            const oldFields = adapter.getFields();
            adapter.removeField(name);
            assert.isUndefined(adapter.get(name));
            assert.strictEqual(adapter.getFields().indexOf(name), -1);
            assert.strictEqual(adapter.getFields().length, oldFields.length - 1);
            assert.throws(() => {
                adapter.getFormat(name);
            });
        });

        it('should throw an error for not exists field', () => {
            assert.throws(() => {
                adapter.removeField('Some');
            });
        });

        it('should throw ReferenceError for empty data', () => {
            const adapter = new RecordSetRecordAdapter();
            assert.throws(() => {
                adapter.removeField('id');
            }, ReferenceError);
        });
    });

    describe('.removeFieldAt()', () => {
        const getRawData = () => {
            return {
                d: [
                    1,
                    'Sample'
                ],
                s: [
                    {n: 'id', t: 'Число целое'},
                    {n: 'name', t: 'Строка'}
                ]
            };
        };

        it('should remove exists field', () => {
            const data = new Record({
                format,
                rawData: getRawData(),
                adapter: 'Types/entity:adapter.Sbis'
            });
            const adapter = new RecordSetRecordAdapter(data);
            const oldF = adapter.getFields();

            adapter.removeFieldAt(0);
            const newF = adapter.getFields();
            assert.notEqual(oldF[0], newF[0]);
            assert.strictEqual(oldF[1], newF[0]);
            assert.throws(() => {
                adapter.getFormat(oldF[0]);
            });
        });

        it('should throw an error for not exists position', () => {
            const data = new Record({
                format,
                rawData: getRawData(),
                adapter: 'Types/entity:adapter.Sbis'
            });
            const adapter = new RecordSetRecordAdapter(data);

            assert.throws(() => {
                adapter.removeFieldAt(-1);
            });
            assert.throws(() => {
                adapter.removeFieldAt(10);
            });
        });

        it('should throw Error for empty data', () => {
            const adapter = new RecordSetRecordAdapter();
            assert.throws(() => {
                adapter.removeFieldAt(0);
            }, Error);
        });
    });
});
