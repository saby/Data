define(["require", "exports", "chai", "Types/_source/DataSet", "Types/_entity/Model", "Types/_entity/adapter/Json", "Types/_collection/RecordSet", "Core/core-extend"], function (require, exports, chai_1, DataSet_1, Model_1, Json_1, RecordSet_1, coreExtend) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_source/DataSet', function () {
        var list;
        beforeEach(function () {
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
        afterEach(function () {
            list = undefined;
        });
        describe('.writable', function () {
            it('should return true by defalt', function () {
                var ds = new DataSet_1.default();
                chai_1.assert.isTrue(ds.writable);
            });
            it('should return value from option', function () {
                var ds = new DataSet_1.default({
                    writable: false
                });
                chai_1.assert.isFalse(ds.writable);
            });
            it('should overwrite value', function () {
                var ds = new DataSet_1.default();
                ds.writable = false;
                chai_1.assert.isFalse(ds.writable);
            });
        });
        describe('.getAdapter()', function () {
            it('should return the adapter', function () {
                var adapter = new Json_1.default();
                var ds = new DataSet_1.default({
                    adapter: adapter
                });
                chai_1.assert.strictEqual(ds.getAdapter(), adapter);
            });
            it('should return default adapter', function () {
                var ds = new DataSet_1.default();
                chai_1.assert.instanceOf(ds.getAdapter(), Json_1.default);
            });
        });
        describe('.getModel()', function () {
            it('should return a given model', function () {
                var ds = new DataSet_1.default({
                    model: Model_1.default
                });
                chai_1.assert.strictEqual(ds.getModel(), Model_1.default);
            });
            it('should return "Types/entity:Model"', function () {
                var ds = new DataSet_1.default();
                chai_1.assert.strictEqual(ds.getModel(), 'Types/entity:Model');
            });
        });
        describe('.setModel()', function () {
            it('should set the model', function () {
                var MyModel = coreExtend.extend(Model_1.default, {});
                var ds = new DataSet_1.default();
                ds.setModel(MyModel);
                chai_1.assert.strictEqual(ds.getModel(), MyModel);
            });
        });
        describe('.getListModule()', function () {
            it('should return a default list', function () {
                var ds = new DataSet_1.default();
                chai_1.assert.strictEqual(ds.getListModule(), 'Types/collection:RecordSet');
            });
            it('should return the given list', function () {
                var MyList = coreExtend.extend(RecordSet_1.default, {});
                var ds = new DataSet_1.default({
                    listModule: MyList
                });
                chai_1.assert.strictEqual(ds.getListModule(), MyList);
            });
        });
        describe('.setListModule()', function () {
            it('should set the model', function () {
                var MyList = coreExtend.extend(RecordSet_1.default, {});
                var ds = new DataSet_1.default();
                ds.setListModule(MyList);
                chai_1.assert.strictEqual(ds.getListModule(), MyList);
            });
        });
        describe('.getKeyProperty()', function () {
            it('should return the key property', function () {
                var ds = new DataSet_1.default({
                    keyProperty: '123'
                });
                chai_1.assert.strictEqual(ds.getKeyProperty(), '123');
            });
            it('should return an empty string', function () {
                var ds = new DataSet_1.default();
                chai_1.assert.strictEqual(ds.getKeyProperty(), '');
            });
        });
        describe('.setKeyProperty()', function () {
            it('should set the key property', function () {
                var ds = new DataSet_1.default();
                ds.setKeyProperty('987');
                chai_1.assert.strictEqual(ds.getKeyProperty(), '987');
            });
        });
        describe('.getAll()', function () {
            it('should return a recordset', function () {
                var ds = new DataSet_1.default();
                chai_1.assert.instanceOf(ds.getAll(), RecordSet_1.default);
            });
            it('should return pass idProperty to the model', function () {
                var ds = new DataSet_1.default({
                    rawData: [{}],
                    keyProperty: 'myprop'
                });
                chai_1.assert.strictEqual(ds.getAll().at(0).getIdProperty(), 'myprop');
            });
            it('should return a recordset of 2 by default', function () {
                var ds = new DataSet_1.default({
                    rawData: [1, 2]
                });
                chai_1.assert.equal(ds.getAll().getCount(), 2);
            });
            it('should return a recordset of 2 from given property', function () {
                var ds = new DataSet_1.default({
                    rawData: { some: { prop: [1, 2] } }
                });
                chai_1.assert.equal(ds.getAll('some.prop').getCount(), 2);
            });
            it('should return an empty recordset from undefined property', function () {
                var ds = new DataSet_1.default({
                    rawData: {}
                });
                chai_1.assert.equal(ds.getAll('some.prop').getCount(), 0);
            });
            it('should return recordset with metadata from given property', function () {
                var ds = new DataSet_1.default({
                    rawData: {
                        meta: { bar: 'foo' }
                    },
                    metaProperty: 'meta'
                });
                var meta = ds.getAll().getMetaData();
                chai_1.assert.strictEqual(meta.bar, 'foo');
            });
            it('should throw an error', function () {
                var ds = new DataSet_1.default({
                    rawData: {
                        d: [1],
                        s: [{ n: 'Id', t: 'Число целое' }],
                        _type: 'record'
                    },
                    adapter: 'Types/entity:adapter.Sbis'
                });
                chai_1.assert.throws(function () {
                    ds.getAll();
                });
            });
        });
        describe('.getRow()', function () {
            it('should return a model', function () {
                var ds = new DataSet_1.default();
                chai_1.assert.instanceOf(ds.getRow(), Model_1.default);
            });
            it('should return a model by default', function () {
                var ds = new DataSet_1.default({
                    rawData: { a: 1, b: 2 }
                });
                chai_1.assert.strictEqual(ds.getRow().get('a'), 1);
                chai_1.assert.strictEqual(ds.getRow().get('b'), 2);
            });
            it('should return writable model', function () {
                var ds = new DataSet_1.default();
                chai_1.assert.isTrue(ds.getRow().writable);
            });
            it('should return read only model', function () {
                var ds = new DataSet_1.default({
                    writable: false
                });
                chai_1.assert.isFalse(ds.getRow().writable);
            });
            it('should return a model with sbis adapter', function () {
                var data = {
                    _type: 'record',
                    d: ['Test'],
                    s: [
                        { n: 'Name', t: 'Строка' }
                    ]
                };
                var ds = new DataSet_1.default({
                    adapter: 'Types/entity:adapter.Sbis',
                    rawData: data
                });
                chai_1.assert.equal(ds.getRow().get('Name'), 'Test');
            });
            it('should return a model from given property', function () {
                var ds = new DataSet_1.default({
                    rawData: { some: { prop: { a: 1, b: 2 } } }
                });
                chai_1.assert.equal(ds.getRow('some.prop').get('a'), 1);
                chai_1.assert.equal(ds.getRow('some.prop').get('b'), 2);
            });
            it('should return an empty recordset from undefined property', function () {
                var ds = new DataSet_1.default({
                    rawData: {}
                });
                chai_1.assert.instanceOf(ds.getRow('some.prop'), Model_1.default);
            });
            it('should return a first item of recordset', function () {
                var data = [{ a: 1 }, { a: 2 }];
                var ds = new DataSet_1.default({
                    rawData: data
                });
                data._type = 'recordset';
                chai_1.assert.equal(ds.getRow().get('a'), 1);
            });
            it('should return undefined from empty recordset', function () {
                var data = [];
                var ds = new DataSet_1.default({
                    rawData: data
                });
                data._type = 'recordset';
                chai_1.assert.isUndefined(ds.getRow());
            });
            it('should set id property to model', function () {
                var ds = new DataSet_1.default({
                    rawData: list,
                    keyProperty: 'lastname'
                });
                chai_1.assert.equal(ds.getRow().getIdProperty(), 'lastname');
            });
        });
        describe('.getScalar()', function () {
            it('should return a default value', function () {
                var ds = new DataSet_1.default({
                    rawData: 'qwe'
                });
                chai_1.assert.equal(ds.getScalar(), 'qwe');
            });
            it('should return a value from given property', function () {
                var ds = new DataSet_1.default({
                    rawData: {
                        some: {
                            propA: 'a',
                            propB: 'b'
                        }
                    }
                });
                chai_1.assert.equal(ds.getScalar('some.propA'), 'a');
                chai_1.assert.equal(ds.getScalar('some.propB'), 'b');
            });
            it('should return undefined from undefined property', function () {
                var ds = new DataSet_1.default({
                    rawData: {}
                });
                chai_1.assert.isUndefined(ds.getScalar('some.prop'));
            });
        });
        describe('.hasProperty()', function () {
            it('should return true for defined property', function () {
                var ds = new DataSet_1.default({
                    rawData: { a: { b: { c: {} } } }
                });
                chai_1.assert.isTrue(ds.hasProperty('a'));
                chai_1.assert.isTrue(ds.hasProperty('a.b'));
                chai_1.assert.isTrue(ds.hasProperty('a.b.c'));
                chai_1.assert.isFalse(ds.hasProperty(''));
                chai_1.assert.isFalse(ds.hasProperty());
            });
            it('should return false for undefined property', function () {
                var ds = new DataSet_1.default({
                    rawData: { a: { b: { c: {} } } }
                });
                chai_1.assert.isFalse(ds.hasProperty('e'));
                chai_1.assert.isFalse(ds.hasProperty('a.e'));
                chai_1.assert.isFalse(ds.hasProperty('a.b.e'));
            });
        });
        describe('.getProperty()', function () {
            it('should return defined property', function () {
                var data = { a: { b: { c: {} } } };
                var ds = new DataSet_1.default({
                    rawData: data
                });
                chai_1.assert.strictEqual(ds.getProperty('a'), data.a);
                chai_1.assert.strictEqual(ds.getProperty('a.b'), data.a.b);
                chai_1.assert.strictEqual(ds.getProperty('a.b.c'), data.a.b.c);
                chai_1.assert.strictEqual(ds.getProperty(''), data);
                chai_1.assert.strictEqual(ds.getProperty(), data);
            });
            it('should return undefined for undefined property', function () {
                var ds = new DataSet_1.default({
                    rawData: { a: { b: { c: {} } } }
                });
                chai_1.assert.isUndefined(ds.getProperty('e'));
                chai_1.assert.isUndefined(ds.getProperty('a.e'));
                chai_1.assert.isUndefined(ds.getProperty('a.b.e'));
            });
        });
        describe('.gestRawData()', function () {
            it('should return raw data', function () {
                var data = { a: { b: { c: {} } } };
                var ds = new DataSet_1.default({
                    rawData: data
                });
                chai_1.assert.strictEqual(ds.getRawData(), data);
            });
        });
        describe('.setRawData()', function () {
            it('should set raw data', function () {
                var data = { a: { b: { c: {} } } };
                var ds = new DataSet_1.default();
                ds.setRawData(data);
                chai_1.assert.strictEqual(ds.getRawData(), data);
            });
        });
        describe('.toJSON()', function () {
            it('should return valid signature', function () {
                var options = {
                    rawData: { foo: 'bar' }
                };
                var ds = new DataSet_1.default(options);
                var json = ds.toJSON();
                chai_1.assert.deepEqual(json.$serialized$, 'inst');
                chai_1.assert.deepEqual(json.module, 'Types/source:DataSet');
                chai_1.assert.deepEqual(json.state.$options, options);
            });
        });
    });
});
