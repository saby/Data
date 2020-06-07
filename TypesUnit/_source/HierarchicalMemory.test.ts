import {assert} from 'chai';
import HierarchicalMemory from 'Types/_source/HierarchicalMemory';
import Memory from 'Types/_source/Memory';
import Query from 'Types/_source/Query';
import Model from 'Types/_entity/Model';
import Record from 'Types/_entity/Record';

describe('Types/_source/HierarchicalMemory', () => {
    let data;
    let source;

    beforeEach(() => {
        data = [
            {id: 1, title: 'foo'},
            {id: 2, title: 'bar'}
        ];

        source = new HierarchicalMemory({
            data,
            keyProperty: 'id'
        });
    });

    afterEach(() => {
        data = undefined;
        source = undefined;
    });

    describe('.getOriginal()', () => {
        it('should return Memory instance', () => {
            assert.instanceOf(source.getOriginal(), Memory);
        });
    });

    describe('.create()', () => {
        it('should return record', () => {
            return source.create().then((model) => {
                assert.instanceOf(model, Model);
            });
        });
    });

    describe('.read()', () => {
        it('should return record', () => {
            return source.read(1).then((model) => {
                assert.instanceOf(model, Model);
                assert.equal(model.getKey(), 1);
            });
        });
    });

    describe('.update()', () => {
        it('should update record', () => {
            const rec = new Record({
                rawData: {id: 1, title: 'one'}
            });
            return source.update(rec).then((result) => {
                assert.equal(result, 1);
            });
        });
    });

    describe('.destroy()', () => {
        it('should delete record', () => {
            return source.destroy(1).then(() => {
                assert.isOk('fine');
            });
        });
    });

    describe('.query()', () => {
        it('should return all source records', () => {
            return source.query().then((result) => {
                assert.equal(result.getAll().getCount(), 2);
            });
        });

        it('should return items and path in metadata', () => {
            const source = new HierarchicalMemory({
                data: [
                    {id: 1, parent: null, name: 'Catalogue'},
                    {id: 10, parent: 1, name: 'Computers'},
                    {id: 100, parent: 10, name: 'Laptops'},
                    {id: 1000, parent: 100, name: 'Apple MacBook Pro'},
                    {id: 1001, parent: 100, name: 'Xiaomi Mi Notebook Air'},
                    {id: 11, parent: 1, name: 'Smartphones'},
                    {id: 110, parent: 11, name: 'Apple iPhone'}
                ],
                keyProperty: 'id',
                parentProperty: 'parent'
            });

            const query = new Query();
            query.where({parent: 100});

            const expectItems = ['Apple MacBook Pro', 'Xiaomi Mi Notebook Air'];
            const expectPath = ['Catalogue', 'Computers', 'Laptops'];

            return source.query(query).then((result) => {
                const items = [];
                result.getAll().forEach((item) => {
                    items.push(item.get('name'));
                });
                assert.deepEqual(items, expectItems);

                const path = [];
                result.getAll().getMetaData().path.each((item) => {
                    path.push(item.get('name'));
                });
                assert.deepEqual(path, expectPath);
            });
        });

        it('should return an empty path if query\'s filter doesn\'t have property related to parentProperty', () => {
            const source = new HierarchicalMemory({
                data: [
                    {id: 1, parent: null, name: 'Catalogue'},
                    {id: 10, parent: 1, name: 'Computers'},
                    {id: 100, parent: 10, name: 'Laptops'}
                ],
                keyProperty: 'id',
                parentProperty: 'parent'
            });

            const query = new Query();
            return source.query(query).then((result) => {
                assert.strictEqual(result.getAll().getMetaData().path.getCount(), 0);
            });
        });
    });

    describe('.merge()', () => {
        it('should merge records', () => {
            return source.merge(1, 2).then((result) => {
                assert.equal(result, 1);
            });
        });
    });

    describe('.copy()', () => {
        it('should copy record', () => {
            return source.copy(1).then((result) => {
                assert.equal(result.getKey(), 1);
            });
        });
    });

    describe('.move()', () => {
        it('should move record', () => {
            return source.move([1], 2).then((result) => {
                assert.isUndefined(result);
            });
        });
    });

    describe('.toJSON()', () => {
        it('should serialize its own options', () => {
            const data = {foo: 'bar'};
            const options = {
                parentProperty: 'id'
            };
            const source = new HierarchicalMemory({data, ...options});
            const serialized = source.toJSON();

            assert.deepEqual(serialized.state.$options, options);
            assert.deepEqual((serialized.state as any)._source._$data, data);
        });
    });
});
