import {assert} from 'chai';
import DataSet from 'Types/_source/DataSet';
import Model from 'Types/_entity/Model';
import JsonAdapter from 'Types/_entity/adapter/Json';
import RecordSet from 'Types/_collection/RecordSet';
import * as coreExtend from 'Core/core-extend';

describe('Types/_source/DataSet', () => {
    let list;

    beforeEach(() => {
        list = [{
            id: 1,
            lastname: 'Иванов'
        }, {
            id: 2,
            lastname: 'Петров'
        }, {
            id: 3,
            lastname: 'Сидоров'
        }];
    });

    afterEach(() => {
        list = undefined;
    });

    describe('.writable', () => {
        it('should return true by defalt', () => {
            const ds = new DataSet();
            assert.isTrue(ds.writable);
        });

        it('should return value from option', () => {
            const ds = new DataSet({
                writable: false
            });
            assert.isFalse(ds.writable);
        });

        it('should overwrite value', () => {
            const ds = new DataSet();
            ds.writable = false;
            assert.isFalse(ds.writable);
        });
    });

    describe('.getAdapter()', () => {
        it('should return the adapter', () => {
            const adapter = new JsonAdapter();
            const ds = new DataSet({
                adapter
            });
            assert.strictEqual(ds.getAdapter(), adapter);
        });

        it('should return default adapter', () => {
            const ds = new DataSet();
            assert.instanceOf(ds.getAdapter(), JsonAdapter);
        });
    });

    describe('.getModel()', () => {
        it('should return a given model', () => {
            const ds = new DataSet({
                model: Model
            });
            assert.strictEqual(ds.getModel(), Model);
        });

        it('should return "Types/entity:Model"', () => {
            const ds = new DataSet();
            assert.strictEqual(ds.getModel(), 'Types/entity:Model');
        });
    });

    describe('.setModel()', () => {
        it('should set the model', () => {
            const MyModel = coreExtend.extend(Model, {});
            const ds = new DataSet();
            ds.setModel(MyModel);
            assert.strictEqual(ds.getModel(), MyModel);
        });
    });

    describe('.getListModule()', () => {
        it('should return a default list', () => {
            const ds = new DataSet();
            assert.strictEqual(ds.getListModule(), 'Types/collection:RecordSet');
        });

        it('should return the given list', () => {
            const MyList = coreExtend.extend(RecordSet, {});
            const ds = new DataSet({
                listModule: MyList
            });
            assert.strictEqual(ds.getListModule(), MyList);
        });
    });

    describe('.setListModule()', () => {
        it('should set the model', () => {
            const MyList = coreExtend.extend(RecordSet, {});
            const ds = new DataSet();
            ds.setListModule(MyList);
            assert.strictEqual(ds.getListModule(), MyList);
        });
    });

    describe('.getKeyProperty()', () => {
        it('should return the key property', () => {
            const ds = new DataSet({
                keyProperty: '123'
            });
            assert.strictEqual(ds.getKeyProperty(), '123');
        });

        it('should return an empty string', () => {
            const ds = new DataSet();
            assert.strictEqual(ds.getKeyProperty(), '');
        });
    });

    describe('.setKeyProperty()', () => {
        it('should set the key property', () => {
            const ds = new DataSet();
            ds.setKeyProperty('987');
            assert.strictEqual(ds.getKeyProperty(), '987');
        });
    });

    describe('.getAll()', () => {
        it('should return a recordset', () => {
            const ds = new DataSet();
            assert.instanceOf(ds.getAll(), RecordSet);
        });

        it('should return pass keyProperty to the model', () => {
            const ds = new DataSet({
                rawData: [{}],
                keyProperty: 'myprop'
            });
            assert.strictEqual(ds.getAll().at(0).getKeyProperty(), 'myprop');
        });

        it('should return a recordset of 2 by default', () => {
            const ds = new DataSet({
                rawData: [1, 2]
            });
            assert.equal(ds.getAll().getCount(), 2);
        });

        it('should return a recordset of 2 from given property', () => {
            const ds = new DataSet({
                rawData: {some: {prop: [1, 2]}}
            });
            assert.equal(ds.getAll('some.prop' as never).getCount(), 2);
        });

        it('should return an empty recordset from undefined property', () => {
            const ds = new DataSet({
                rawData: {}
            });
            assert.equal(ds.getAll('some.prop' as never).getCount(), 0);
        });

        it('should return recordset with metadata from given property', () => {
            const ds = new DataSet({
                rawData: {
                    meta: {bar: 'foo'}
                },
                metaProperty: 'meta'
            });
            const meta = ds.getAll().getMetaData();

            assert.strictEqual(meta.bar, 'foo');
        });

        it('should throw an error', () => {
            const ds = new DataSet({
                rawData: {
                    d: [1],
                    s: [{n: 'Id', t: 'Число целое'}],
                    _type: 'record'
                },
                adapter: 'Types/entity:adapter.Sbis'
            });
            assert.throws(() => {
                ds.getAll();
            });
        });
    });

    describe('.getRow()', () => {
        it('should return a model', () => {
            const ds = new DataSet();
            assert.instanceOf(ds.getRow(), Model);
        });

        it('should return a model by default', () => {
            const ds = new DataSet({
                rawData: {a: 1, b: 2}
            });
            assert.strictEqual(ds.getRow().get('a'), 1);
            assert.strictEqual(ds.getRow().get('b'), 2);
        });

        it('should return writable model', () => {
            const ds = new DataSet();
            assert.isTrue(ds.getRow().writable);
        });

        it('should return read only model', () => {
            const ds = new DataSet({
                writable: false
            });
            assert.isFalse(ds.getRow().writable);
        });

        it('should return a model with sbis adapter', () => {
            const data = {
                _type: 'record',
                d: ['Test'],
                s: [
                    {n: 'Name', t: 'Строка'}
                ]
            };
            const ds = new DataSet({
                adapter: 'Types/entity:adapter.Sbis',
                rawData: data
            });
            assert.equal(ds.getRow().get('Name'), 'Test');
        });

        it('should return a model from given property', () => {
            const ds = new DataSet({
                rawData: {some: {prop: {a: 1, b: 2}}}
            });
            assert.equal(ds.getRow('some.prop' as never).get('a'), 1);
            assert.equal(ds.getRow('some.prop' as never).get('b'), 2);
        });

        it('should return an empty recordset from undefined property', () => {
            const ds = new DataSet({
                rawData: {}
            });
            assert.instanceOf(ds.getRow('some.prop' as never), Model);
        });

        it('should return a first item of recordset', () => {
            const data: any = [{a: 1}, {a: 2}];
            const ds = new DataSet({
                rawData: data
            });
            data._type = 'recordset';
            assert.equal(ds.getRow().get('a'), 1);
        });

        it('should return undefined from empty recordset', () => {
            const data: any = [];
            const ds = new DataSet({
                rawData: data
            });
            data._type = 'recordset';
            assert.isUndefined(ds.getRow());
        });

        it('should set id property to model', () => {
            const ds = new DataSet({
                rawData: list,
                keyProperty: 'lastname'
            });
            assert.equal(ds.getRow().getKeyProperty(), 'lastname');
        });
    });

    describe('.getScalar()', () => {
        it('should return a default value', () => {
            const ds = new DataSet({
                rawData: 'qwe'
            });
            assert.equal(ds.getScalar(), 'qwe');
        });

        it('should return a value from given property', () => {
            const ds = new DataSet({
                rawData: {
                    some: {
                        propA: 'a',
                        propB: 'b'
                    }
                }
            });
            assert.equal(ds.getScalar('some.propA' as never), 'a');
            assert.equal(ds.getScalar('some.propB' as never), 'b');
        });

        it('should return undefined from undefined property', () => {
            const ds = new DataSet({
                rawData: {}
            });
            assert.isUndefined(ds.getScalar('some.prop' as never));
        });
    });

    describe('.hasProperty()', () => {
        it('should return true for defined property', () => {
            const ds = new DataSet({
                rawData: {a: {b: {c: {}}}}
            });
            assert.isTrue(ds.hasProperty('a'));
            assert.isTrue(ds.hasProperty('a.b'));
            assert.isTrue(ds.hasProperty('a.b.c'));
            assert.isFalse(ds.hasProperty(''));
            assert.isFalse(ds.hasProperty());
        });

        it('should return false for undefined property', () => {
            const ds = new DataSet({
                rawData: {a: {b: {c: {}}}}
            });
            assert.isFalse(ds.hasProperty('e'));
            assert.isFalse(ds.hasProperty('a.e'));
            assert.isFalse(ds.hasProperty('a.b.e'));
        });
    });

    describe('.getProperty()', () => {
        it('should return defined property', () => {
            const data = {a: {b: {c: {}}}};
            const ds = new DataSet({
                rawData: data
            });
            assert.strictEqual(ds.getProperty('a'), data.a);
            assert.strictEqual(ds.getProperty('a.b' as never), data.a.b);
            assert.strictEqual(ds.getProperty('a.b.c' as never), data.a.b.c);
            assert.strictEqual(ds.getProperty('' as never), data);
            assert.strictEqual(ds.getProperty(), data);
        });

        it('should return undefined for undefined property', () => {
            const ds = new DataSet({
                rawData: {a: {b: {c: {}}}}
            });
            assert.isUndefined(ds.getProperty('e' as never));
            assert.isUndefined(ds.getProperty('a.e' as never));
            assert.isUndefined(ds.getProperty('a.b.e' as never));
        });
    });

    describe('.gestRawData()', () => {
        it('should return raw data', () => {
            const data = {a: {b: {c: {}}}};
            const ds = new DataSet({
                rawData: data
            });
            assert.strictEqual(ds.getRawData(), data);
        });
    });

    describe('.setRawData()', () => {
        it('should set raw data', () => {
            const data = {a: {b: {c: {}}}};
            const ds = new DataSet();
            ds.setRawData(data);
            assert.strictEqual(ds.getRawData(), data);
        });
    });

    describe('.toJSON()', () => {
        it('should return valid signature', () => {
            const options = {
                rawData: {foo: 'bar'}
            };
            const ds = new DataSet(options);
            const json = ds.toJSON();

            assert.deepEqual(json.$serialized$, 'inst');
            assert.deepEqual(json.module, 'Types/source:DataSet');
            assert.deepEqual(json.state.$options, options);
        });
    });
});
