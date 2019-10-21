import {assert} from 'chai';
import JsonRecord from 'Types/_entity/adapter/JsonRecord';
import fieldsFactory from 'Types/_entity/format/fieldsFactory';

interface IData {
    id: number;
    lastname: string;
    firstname: string;
    middlename: string;
}

describe('Types/_entity/adapter/JsonRecord', () => {
    let data: IData;
    let adapter: JsonRecord;

    beforeEach(() => {
        data = {
            id: 1,
            lastname: 'Smith',
            firstname: 'John',
            middlename: 'Joshua',
        };

        adapter = new JsonRecord(data);
    });

    afterEach(() => {
        data = undefined;
        adapter = undefined;
    });

    describe('.get()', () => {
        it('should return the property value', () => {
            assert.strictEqual(
                1,
                adapter.get('id'),
            );

            assert.strictEqual(
                'Smith',
                adapter.get('lastname'),
            );

            assert.isUndefined(
                adapter.get('position'),
            );

            assert.isUndefined(
                new JsonRecord({}).get('position'),
            );

            assert.isUndefined(
                new JsonRecord().get(undefined),
            );

            assert.isUndefined(
                new JsonRecord('' as any).get(undefined),
            );

            assert.isUndefined(
                new JsonRecord(0 as any).get(undefined),
            );

            assert.isUndefined(
                new JsonRecord().get(undefined),
            );
        });
    });

    describe('.set()', () => {
        it('should set the property value', () => {
            adapter.set('id', 20);
            assert.strictEqual(
                20,
                data.id,
            );

            adapter.set('foo', 5);
            assert.strictEqual(
                5,
                (data as any).foo,
            );

            adapter.set('bar', undefined);
            assert.isUndefined(
                (data as any).bar,
            );
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
            assert.notEqual(Object.keys(data).length, 0);
            adapter.clear();
            assert.equal(Object.keys(adapter.getData()).length, 0);
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
                ['id', 'lastname', 'firstname', 'middlename'],
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
            const fieldName = 'foo';
            const field = fieldsFactory({
                type: 'string',
                name: fieldName,
            });
            adapter.addField(field, 0);
            assert.strictEqual(adapter.getFormat(fieldName).getName(), fieldName);
        });

        it('should use a field default value', () => {
            const fieldName = 'foo';
            const def = 'abc';

            adapter.addField(fieldsFactory({
                type: 'string',
                name: fieldName,
                defaultValue: def,
            }), 0);
            assert.strictEqual(adapter.get(fieldName), def);
        });

        it('should set already exists field', () => {
            adapter.addField(fieldsFactory({
                type: 'string',
                name: 'id',
            }), 0);
            assert.strictEqual(data.id, 1);
        });

        it('should throw an error for not a field', () => {
            assert.throws(() => {
                adapter.addField(undefined, 0);
            });

            assert.throws(() => {
                adapter.addField(null, 0);
            });

            assert.throws(() => {
                adapter.addField({
                    type: 'string',
                    name: 'foo',
                } as any, 0);
            });
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
    });

    describe('.removeFieldAt()', () => {
        it('should throw an error', () => {
            assert.throws(() => {
                adapter.removeFieldAt(0);
            });
        });
    });
});
