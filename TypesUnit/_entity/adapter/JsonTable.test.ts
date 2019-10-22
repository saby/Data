import {assert} from 'chai';
import JsonTable from 'Types/_entity/adapter/JsonTable';
import fieldsFactory from 'Types/_entity/format/fieldsFactory';

interface IData {
    id: number;
    lastname: string;
}

describe('Types/_entity/adapter/JsonTable', () => {
    let data: IData[];
    let adapter: JsonTable;

    beforeEach(() => {
        data = [{
            id: 1,
            lastname: 'Smith'
        }, {
            id: 2,
            lastname: 'Green'
        }, {
            id: 3,
            lastname: 'Geller'
        }, {
            id: 4,
            lastname: 'Bing'
        }, {
            id: 5,
            lastname: 'Tribbiani'
        }, {
            id: 6,
            lastname: 'Buffay'
        }, {
            id: 7,
            lastname: 'Tyler'
        }];

        adapter = new JsonTable(data);
    });

    afterEach(() => {
        data = undefined;
        adapter = undefined;
    });

    describe('.getFields()', () => {
        it('should return fields list', () => {
            assert.deepEqual(
                adapter.getFields(),
                ['id', 'lastname']
            );
        });

        it('should return fields use each row', () => {
            const data = [{
                foo: 1
            }, {
                foo: 2,
                bar: 3
            }, {
                baz: 4
            }];
            const adapter = new JsonTable(data);

            assert.deepEqual(
                adapter.getFields(),
                ['foo', 'bar', 'baz']
            );
        });

        it('should return an empty array for no data', () => {
            const adapter = new JsonTable();
            const fields = adapter.getFields();
            assert.instanceOf(fields, Array);
            assert.strictEqual(fields.length, 0);
        });
    });

    describe('.getCount()', () => {
        it('should return records count', () => {
            assert.strictEqual(
                adapter.getCount(),
                7
            );

            assert.strictEqual(
                new JsonTable([]).getCount(),
                0
            );

            assert.strictEqual(
                new JsonTable({} as any).getCount(),
                0
            );

            assert.strictEqual(
                new JsonTable('' as any).getCount(),
                0
            );

            assert.strictEqual(
                new JsonTable(0 as any).getCount(),
                0
            );

            assert.strictEqual(
                new JsonTable().getCount(),
                0
            );
        });
    });

    describe('.add()', () => {
        it('should append a record', () => {
            adapter.add({
                id: 30
            });

            assert.strictEqual(
                8,
                data.length
            );

            assert.strictEqual(
                30,
                data[data.length - 1].id
            );
        });

        it('should prepend a record', () => {
            adapter.add({
                id: 31
            }, 0);

            assert.strictEqual(
                8,
                data.length
            );

            assert.strictEqual(
                31,
                data[0].id
            );
        });

        it('should insert a record', () => {
            adapter.add({
                id: 32
            }, 2);

            assert.strictEqual(
                8,
                data.length
            );

            assert.strictEqual(
                32,
                data[2].id
            );
        });

        it('should throw an error on invalid position', () => {
            assert.throws(() => {
                adapter.add({
                    id: 33
                }, 100);
            });

            assert.throws(() => {
                adapter.add({
                    id: 34
                }, -1);
            });
        });
    });

    describe('.at()', () => {
        it('should return valid record', () => {
            assert.strictEqual(
                1,
                adapter.at(0).id
            );

            assert.strictEqual(
                3,
                adapter.at(2).id
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
                new JsonTable({} as any).at(undefined)
            );

            assert.isUndefined(
                new JsonTable('' as any).at(undefined)
            );

            assert.isUndefined(
                new JsonTable(0 as any).at(undefined)
            );

            assert.isUndefined(
                new JsonTable().at(undefined)
            );
        });
    });

    describe('.remove()', () => {
        it('should remove the record', () => {
            adapter.remove(0);
            assert.strictEqual(
                2,
                data[0].id
            );

            adapter.remove(2);
            assert.strictEqual(
                5,
                data[2].id
            );

            adapter.remove(5);
            assert.isUndefined(
                data[5]
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

    describe('.replace()', () => {
        it('should replace the record', () => {
            adapter.replace({
                id: 11
            }, 0);
            assert.strictEqual(
                11,
                data[0].id
            );

            adapter.replace({
                id: 12
            }, 4);
            assert.strictEqual(
                12,
                data[4].id
            );

        });

        it('should throw an error on invalid position', () => {
            assert.throws(() => {
                adapter.replace({}, -1);
            });
            assert.throws(() => {
                adapter.replace({}, 99);
            });
        });
    });

    describe('.move()', () => {
        it('should move Smith instead Geller', () => {
            adapter.move(0, 2);
            assert.strictEqual(
                'Green',
                data[0].lastname
            );
            assert.strictEqual(
                'Geller',
                data[1].lastname
            );
            assert.strictEqual(
                'Smith',
                data[2].lastname
            );
        });

        it('should move Geller instead Smith', () => {
            adapter.move(2, 0);
            assert.strictEqual(
                'Geller',
                data[0].lastname
            );
            assert.strictEqual(
                'Smith',
                data[1].lastname
            );
            assert.strictEqual(
                'Green',
                data[2].lastname
            );
        });

        it('should move Green to the end', () => {
            adapter.move(1, 6);
            assert.strictEqual(
                'Green',
                data[6].lastname
            );
            assert.strictEqual(
                'Tyler',
                data[5].lastname
            );
        });

        it('should not move Green', () => {
            adapter.move(1, 1);
            assert.strictEqual(
                'Green',
                data[1].lastname
            );
            assert.strictEqual(
                'Buffay',
                data[5].lastname
            );
        });
    });

    describe('.merge()', () => {
        it('should merge two records', () => {
            adapter.merge(0, 1, 'id');
            assert.strictEqual(
                'Green',
                data[0].lastname
            );
        });
    });

    describe('.copy()', () => {
        it('should copy the record', () => {
            const copy = adapter.copy(1);
            assert.deepEqual(
                copy,
                data[1]
            );
        });

        it('should insert a copy after the original', () => {
            const copy = adapter.copy(1);
            assert.strictEqual(
                copy,
                data[2]
            );
        });
    });

    describe('.clear()', () => {
        it('should return an empty table', () => {
            assert.isTrue(data.length > 0);
            adapter.clear();
            assert.strictEqual(adapter.getData().length, 0);
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
        it('should return exists field format', () => {
            const format = adapter.getFormat('id');
            assert.strictEqual(format.getName(), 'id');
        });

        it('should return field format for any record', () => {
            const data = [{
                foo: 1
            }, {
                bar: 2
            }, {
                baz: 3
            }];
            const adapter = new JsonTable(data);

            assert.strictEqual(adapter.getFormat('foo').getName(), 'foo');
            assert.strictEqual(adapter.getFormat('bar').getName(), 'bar');
            assert.strictEqual(adapter.getFormat('baz').getName(), 'baz');
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
            }), undefined);
            for (let i = 0; i < adapter.getCount(); i++) {
                assert.strictEqual(adapter.at(i)[fieldName], def);
            }
        });

        it('should don\'t throw an error for already exists field', () => {
            adapter.addField(fieldsFactory({
                type: 'string',
                name: 'id'
            }), undefined);
        });

        it('should throw an error for not a field', () => {
            assert.throws(() => {
                adapter.addField(undefined, undefined);
            });

            assert.throws(() => {
                adapter.addField(null, undefined);
            });

            assert.throws(() => {
                adapter.addField({
                    type: 'string',
                    name: 'foo'
                } as any, undefined);
            });
        });
    });

    describe('.removeField()', () => {
        it('should remove exists field', () => {
            const name = 'id';
            adapter.removeField(name);
            for (let i = 0; i < adapter.getCount(); i++) {
                assert.isUndefined(adapter.at(i)[name]);
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
        it('should throw an error', () => {
            assert.throws(() => {
                adapter.removeFieldAt(0);
            });
        });
    });
});
