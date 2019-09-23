import {assert} from 'chai';
import MemorySource from 'Types/_source/Memory';
import DataSet from 'Types/_source/DataSet';
import Query from 'Types/_source/Query';
import Model from 'Types/_entity/Model';
import List from 'Types/_collection/List';
import RecordSet from 'Types/_collection/RecordSet';
import SbisAdapter from 'Types/_entity/adapter/Sbis';
import * as coreExtend from 'Core/core-extend';

describe('Types/_source/Memory', () => {
    const existsId = 5;
    const existsIdIndex = 6;
    const existsId2 = 6;
    const notExistsId = 33;

    let data: Array<{
       Id?: number;
       Order?: number;
       ParentId?: number[];
       LastName?: string;
       FirstName?: string;
       MiddleName?: string;
       Position?: string;
    }>;

    let source: MemorySource;

    beforeEach(() => {
        data = [{
            Id: 6,
            Order: 3,
            ParentId: [null],
            LastName: 'Иванов',
            FirstName: 'Иван',
            MiddleName: 'Иванович',
            Position: 'Инженер'
        }, {
            Id: 4,
            Order: 1,
            ParentId: [null],
            LastName: 'Петров',
            FirstName: 'Федор',
            MiddleName: 'Иванович',
            Position: 'Директор'
        }, {
            Order: null
        }, {
            Id: 7,
            Order: 6,
            ParentId: [6],
            LastName: 'Аксенова',
            FirstName: 'Федора',
            MiddleName: 'Сергеевна',
            Position: 'Инженер'
        }, {
            Id: 2,
            Order: 0,
            ParentId: [4],
            LastName: 'Афанасьев',
            FirstName: 'Иван',
            MiddleName: 'Андреевич',
            Position: 'Директор'
        }, {
            Id: null
        }, {
            Id: 5,
            Order: 4,
            ParentId: [null],
            LastName: 'Баранов',
            FirstName: 'Иванко',
            MiddleName: 'Петрович',
            Position: 'Карапуз'
        }, {
            Id: 1,
            Order: 5,
            ParentId: [null],
            LastName: 'Годолцов',
            FirstName: 'Иван',
            MiddleName: 'Викторович',
            Position: 'Директор'
        }, {
            Id: 3,
            Order: 3,
            ParentId: [6],
            LastName: 'Иванов',
            FirstName: 'Ян',
            MiddleName: 'Яковлевич',
            Position: 'Маркетолог'
        }];

        source = new MemorySource({
            data,
            keyProperty: 'Id'
        });
    });

    afterEach(() => {
        data = undefined;
        source = undefined;
    });

    describe('.data', () => {
        it('should return data passed to constructor', () => {
            assert.strictEqual(source.data, data);
        });
    });

    describe('.create()', () => {
        it('should return an empty model', () => {
            return source.create().then((model) => {
                assert.instanceOf(model, Model);
                if (model instanceof Model) {
                   assert.isUndefined(model.getId());
                }
                assert.isUndefined(model.get('LastName'));
            });
        });

        it('should return an model with initial data', () => {
            return source.create({
                a: 1,
                b: true
            }).then((model) => {
                assert.strictEqual(model.get('a'), 1);
                assert.strictEqual(model.get('b'), true);
            });
        });

        it('should return an unlinked model', () => {
            const meta = {
                a: 1,
                b: true
            };
            return source.create(meta).then((model) => {
                model.set('a', 2);
                assert.strictEqual(meta.a, 1);
            });
        });
    });

    describe('.read()', () => {
        context('when the model is exists', () => {
            it('should return the valid model', () => {
                return source.read(existsId).then((model) => {
                    assert.instanceOf(model, Model);
                    if (model instanceof Model) {
                        assert.isTrue(model.getId() > 0);
                        assert.strictEqual(model.getId(), existsId);
                    }
                    assert.strictEqual(model.get('LastName'), 'Баранов');
                });
            });

            it('should return an unlinked model', () => {
                const oldValue = data[existsIdIndex].LastName;
                return source.read(existsId).then((model) => {
                    model.set('LastName', 'Test');
                    assert.strictEqual(data[existsIdIndex].LastName, oldValue);
                });
            });
        });

        context('when the model isn\'t exists', () => {
            it('should return an error', () => {
                return source.read(notExistsId).then(() => {
                    throw new Error('Method should return an error');
                }, (err) => {
                   assert.instanceOf(err, Error);
                });
            });
        });
    });

    describe('.update()', () => {
        context('when the model was stored', () => {
            it('should update the model', () => {
                return source.read(existsId).then((model) => {
                    model.set('LastName', 'Петров');
                    return source.update(model).then((success) => {
                        assert.isTrue(!!success);
                        assert.isFalse(model.isChanged());
                        return source.read(existsId).then((model) => {
                            assert.strictEqual(model.get('LastName'), 'Петров');
                        });
                    });
                });
            });
        });

        context('when the model was not stored', () => {
            const testModel = (success, model, length) => {
                assert.isTrue(!!success);
                assert.isFalse(model.isChanged());
                assert.isTrue(!!model.getId());
                assert.strictEqual(length, data.length);
                return source.read(model.getId()).then((modelToo) => {
                   assert.strictEqual(model.get('LastName'), modelToo.get('LastName'));
                });
            };

            it('should create the model by 1st way', () => {
                const oldLength = data.length;
                return source.create().then((model) => {
                    model.set('LastName', 'Козлов');
                    return source.update(model).then((success) => {
                        return testModel(success, model, 1 + oldLength);
                    });
                });
            });

            it('should create the model by 2nd way', () => {
                const oldLength = data.length;
                const model = new Model({
                    keyProperty: 'Id'
                });

                model.set('LastName', 'Овечкин');
                return source.update(model).then((success) => {
                    return testModel(success, model, 1 + oldLength);
                });
            });

            it('should generate id and set it in raw data', () => {
                const model = new Model({
                    keyProperty: 'Id'
                });

                return source.update(model).then((id) => {
                    assert.equal(model.get('Id'), id);
                    return source.read(id).then((readModel) => {
                        assert.equal(readModel.get('Id'), id);
                    });
                });
            });

            it('should generate ids and set it in raw data when updating recordset', () => {
                const data = new RecordSet({
                    rawData: [{
                        Id: null,
                        Order: 3,
                        ParentId: [null],
                        LastName: 'Иванов',
                        FirstName: 'Иван',
                        MiddleName: 'Иванович',
                        Position: 'Инженер'
                    }, {
                        Order: 1,
                        ParentId: [null],
                        LastName: 'Петровский',
                        FirstName: 'Федор',
                        MiddleName: 'Иванович',
                        Position: 'Директор'
                    }],
                    keyProperty: 'Id'
                });

                return source.update(data).then((ids) => {
                    const updates = [];

                    data.each((model, i) => {
                        const id = (ids as any)[i];
                        assert.equal(model.get('Id'), id);
                        updates.push(source.read(id).then((readModel) => {
                            assert.equal(readModel.get('Id'), id);
                        }));
                    });

                    return Promise.all(updates);
                });
            });
        });

        context('update few rows', () => {
            it('should insert new rows', () => {
                const source = new MemorySource({
                    data,
                    keyProperty: 'Id'
                });
                const rs = new RecordSet({
                    rawData: [{
                        Id: 25,
                        Order: 3,
                        ParentId: [null],
                        LastName: 'Иванов',
                        FirstName: 'Иван',
                        MiddleName: 'Иванович',
                        Position: 'Инженер'
                    }, {
                        Id: 15,
                        Order: 1,
                        ParentId: [null],
                        LastName: 'Петровский',
                        FirstName: 'Федор',
                        MiddleName: 'Иванович',
                        Position: 'Директор'
                   }]
                });

                return source.update(rs).then(() => {
                    return source.read(15).then((record) => {
                        assert.equal(record.get('LastName'), 'Петровский');
                    });
                });
            });
        });
    });

    describe('.destroy()', () => {
        context('when the model is exists', () => {
            it('should return success', () => {
                return source.destroy(existsId).then((success) => {
                    assert.isTrue(!!success);
                });
            });

            it('should really delete the model', () => {
                return source.destroy(existsId).then(() => {
                    return source.read(existsId).then(() => {
                        throw new Error('The model still exists');
                    }, (err) => {
                        // ok if err == Model is not found
                        assert.instanceOf(err, Error);
                    });
                });
            });

            it('should decrease the size of raw data', () => {
                const targetLength = data.length - 1;
                return source.destroy(existsId).then(() => {
                    assert.strictEqual(targetLength, data.length);
                });
            });

            it('should decrease the size of raw data when delete a few models', () => {
                const targetLength = data.length - 2;
                return source.destroy([existsId, existsId2]).then(() => {
                    assert.strictEqual(targetLength, data.length);
                });
            });
        });

        context('when the model isn\'t exists', () => {
            it('should return an error', () => {
                return source.destroy(notExistsId).then(() => {
                    throw new Error('Method should return an error');
                }, (err) => {
                    assert.instanceOf(err, Error);
                });
            });
        });
    });

    describe('.merge()', () => {
        context('when the model isn\'t exists', () => {
            it('should return an error', () => {
                return source.merge(notExistsId, existsId).then(() => {
                    throw new Error('Method should return an error');
                }, (err) => {
                    assert.instanceOf(err, Error);
                });
            });

            it('should return an error', () => {
                return source.merge(existsId, notExistsId).then(() => {
                    throw new Error('Method should return an error');
                }, (err) => {
                   assert.instanceOf(err, Error);
                 });
            });
        });

        it('should merge models', () => {
            return source.merge(existsId, existsId2).then(() => {
                return source.read(existsId).then(() => {
                    return source.read(existsId2).then(() => {
                        throw new Error('Exists extention model.');
                    }, (err) => {
                       assert.instanceOf(err, Error);
                    });
                });
            });
        });
    });

    describe('.copy()', () => {
        it('should copy model', () => {
            const oldLength = data.length;
            return source.copy(existsId).then((copy) => {
                assert.instanceOf(copy, Model);
                assert.deepEqual(copy.getRawData(), data[existsIdIndex]);
                assert.strictEqual(data.length, 1 + oldLength);
            });
        });
    });

    describe('.query()', () => {
        it('should return a valid dataset', () => {
            return source.query(new Query()).then((ds) => {
                assert.instanceOf(ds, DataSet);
                assert.strictEqual(ds.getAll().getCount(), data.length);
            });
        });

        it('should work with no query', () => {
            return source.query().then((ds) => {
                assert.instanceOf(ds, DataSet);
                assert.strictEqual(ds.getAll().getCount(), data.length);
            });
        });

        it('should return an unlinked collection', () => {
            return source.query().then((ds) => {
                const rec = ds.getAll().at(0);
                const oldId = data[0].Id;
                rec.set('Id', 'test');
                assert.strictEqual(data[0].Id, oldId);
            });
        });

        it('should keep functions in data', () => {
            const data = [{
                a: () => undefined
            }];
            const source = new MemorySource({
                data
            });

            return source.query().then((ds) => {
                const rec = ds.getAll().at(0);
                assert.strictEqual(rec.get('a'), data[0].a);
            });
        });

        it('should keep modules of cloned instances', () => {
            const data = [{
                a: new Model()
            }];
            const source = new MemorySource({
                data
            });

            return source.query().then((ds) => {
                const rec = ds.getAll().at(0);
                assert.instanceOf(rec.get('a'), Model);
            });
        });

        it('should return a list instance of injected module', () => {
            const MyList = coreExtend.extend(List, {});
            source.setListModule(MyList);
            return source.query().then((ds) => {
                assert.instanceOf(ds.getAll(), MyList);
            });
        });

        it('should return a model instance of injected module', () => {
            const MyModel = coreExtend.extend(Model, {});
            source.setModel(MyModel);
            return source.query().then((ds) => {
                assert.instanceOf(ds.getAll().at(0), MyModel);
            });
        });

        it('should keep data artifact if data is empty', () => {
            const artifact = [{foo: 'bar'}];
            const data = {
                d: [],
                s: artifact
            };
            const source = new MemorySource({
                data,
                adapter: 'Types/entity:adapter.Sbis'
            });

            return source.query().then((ds) => {
                assert.deepEqual(ds.getRawData().items.s, artifact);
            });
        });

        it('should keep data artifact if query selects empty', () => {
            const artifact = [{n: 'foo', t: 'Число целое'}];
            const data = {
                d: [[1]],
                s: artifact
            };
            const source = new MemorySource({
                data,
                adapter: 'Types/entity:adapter.Sbis'
            });
            const query = new Query();

            query.where({foo: 2});
            return source.query(query).then((ds) => {
                assert.deepEqual(ds.getRawData().items.s, artifact);
            });
        });

        it('should use filter from option', () => {
            const data = [
                {id: 1},
                {id: 2},
                {id: 3},
                {id: 4}
            ];
            const source = new MemorySource({
                data,
                filter: (item) => item.get('id') % 2 === 0
            });
            const expected = [2, 4];

            return source.query().then((ds) => {
                ds.getAll().each((record, index) => {
                    assert.equal(record.get('id'), expected[index]);
                });
                assert.equal(ds.getAll().getCount(), expected.length);
            });
        });

        it('should pass filters to filter from option', () => {
            const data = [
                {id: 1, title: 'a'},
                {id: 2, title: 'b'},
                {id: 3, title: 'c'},
                {id: 4, title: 'd'},
                {id: 5, title: 'e'}
            ];
            const source = new MemorySource({
                data,
                filter: (item, where) => Object.keys(where).reduce((match, field) => {
                    const value = item.get(field);
                    const check = where[field];
                    if (check[0] === '>') {
                        return value > check.substr(1);
                    } else {
                        return value === check;
                    }
                }, true)
            });
            const query = new Query();
            const expected = [3, 4, 5];

            query.where({id: '>2'});

            return source.query(query).then((ds) => {
                ds.getAll().each((record, index) => {
                    assert.equal(record.get('id'), expected[index]);
                });
                assert.equal(ds.getAll().getCount(), expected.length);
            });
        });

        context('when sort use several fields', () => {
            const getResult = (ds) => {
                const result = [];
                ds.getAll().forEach((item) => {
                    result.push([
                        item.get('first'),
                        item.get('second'),
                        item.get('third')
                    ].join(''));
                });
                return result;
            };

            const source = new MemorySource({
                data: [
                    {first: 'a', second: 'a', third: 'a'},
                    {first: 'a', second: 'a', third: 'b'},
                    {first: 'a', second: 'a', third: 'c'},
                    {first: 'a', second: 'b', third: 'a'},
                    {first: 'a', second: 'b', third: 'b'},
                    {first: 'a', second: 'b', third: 'c'},
                    {first: 'a', second: 'c', third: 'a'},
                    {first: 'a', second: 'c', third: 'b'},
                    {first: 'a', second: 'c', third: 'c'},
                    {first: 'b', second: 'a', third: 'a'},
                    {first: 'b', second: 'a', third: 'b'},
                    {first: 'b', second: 'a', third: 'c'},
                    {first: 'b', second: 'b', third: 'a'},
                    {first: 'b', second: 'b', third: 'b'},
                    {first: 'b', second: 'b', third: 'c'},
                    {first: 'b', second: 'c', third: 'a'},
                    {first: 'b', second: 'c', third: 'b'},
                    {first: 'b', second: 'c', third: 'c'},
                    {first: 'c', second: 'a', third: 'a'},
                    {first: 'c', second: 'a', third: 'b'},
                    {first: 'c', second: 'a', third: 'c'},
                    {first: 'c', second: 'b', third: 'a'},
                    {first: 'c', second: 'b', third: 'b'},
                    {first: 'c', second: 'b', third: 'c'},
                    {first: 'c', second: 'c', third: 'a'},
                    {first: 'c', second: 'c', third: 'b'},
                    {first: 'c', second: 'c', third: 'c'}
                ]
            });

            it('should sort asc from right to left', () => {
                const query = new Query();
                const expect = [
                    'aaa', 'baa', 'caa',
                    'aba', 'bba', 'cba',
                    'aca', 'bca', 'cca',

                    'aab', 'bab', 'cab',
                    'abb', 'bbb', 'cbb',
                    'acb', 'bcb', 'ccb',

                    'aac', 'bac', 'cac',
                    'abc', 'bbc', 'cbc',
                    'acc', 'bcc', 'ccc'
                ];
                query.orderBy([{third: false}, {second: false}, {first: false}]);
                return source.query(query).then((ds) => {
                    const given = getResult(ds);
                    assert.deepEqual(given, expect);
                });
            });

            it('should sort desc from left to right', () => {
                const query = new Query();
                const expect = [
                    'ccc', 'ccb', 'cca',
                    'cbc', 'cbb', 'cba',
                    'cac', 'cab', 'caa',

                    'bcc', 'bcb', 'bca',
                    'bbc', 'bbb', 'bba',
                    'bac', 'bab', 'baa',

                    'acc', 'acb', 'aca',
                    'abc', 'abb', 'aba',
                    'aac', 'aab', 'aaa'
                ];
                query.orderBy([{first: true}, {second: true}, {third: true}]);
                return source.query(query).then((ds) => {
                    const given = getResult(ds);
                    assert.deepEqual(given, expect);
                });
            });

            it('should sort mixed from right to left', () => {
                const query = new Query();
                const expect = [
                    'aca', 'bca', 'cca',
                    'aba', 'bba', 'cba',
                    'aaa', 'baa', 'caa',

                    'acb', 'bcb', 'ccb',
                    'abb', 'bbb', 'cbb',
                    'aab', 'bab', 'cab',

                    'acc', 'bcc', 'ccc',
                    'abc', 'bbc', 'cbc',
                    'aac', 'bac', 'cac'
                ];
                query.orderBy([{third: false}, {second: true}, {first: false}]);

                return source.query(query).then((ds) => {
                    const given = getResult(ds);
                    assert.deepEqual(given, expect);
                });
            });
        });

        context('when the filter applied', () => {
            const tests = [{
                filter: {LastName: 'Иванов'},
                expect: 2
            }, {
                filter: (item) => item.get('LastName') === 'Иванов',
                expect: 2
            }, {
                filter: (item, index) => index < 3,
                expect: 3
            }, {
                filter: {LastName: ['Иванов', 'Петров']},
                expect: 3
            }, {
                filter: {LastName: 'Иванов'},
                offset: 0,
                expect: 2
            }, {
                filter: {LastName: 'Иванов'},
                offset: 0,
                limit: 0,
                expect: 0
            }, {
                filter: {LastName: 'Иванов'},
                offset: 0,
                limit: 1,
                expect: 1
            }, {
                filter: {LastName: 'Иванов'},
                offset: 0,
                limit: 2,
                expect: 2
            }, {
                filter: {LastName: 'Иванов'},
                offset: 1,
                expect: 1
            }, {
                filter: {LastName: 'Иванов'},
                offset: 1,
                limit: 0,
                expect: 0
            }, {
                filter: {LastName: 'Иванов'},
                offset: 1,
                limit: 1,
                expect: 1
            }, {
                filter: {LastName: 'Иванов'},
                offset: 2,
                expect: 0
            }, {
                filter: {LastName: 'Иванов'},
                offset: 2,
                limit: 1,
                expect: 0
            }, {
                filter: {FirstName: 'Иван'},
                expect: 3
            }, {
                filter: {FirstName: 'Иван'},
                offset: 0,
                expect: 3
            }, {
                filter: {FirstName: 'Иван'},
                limit: 2,
                expect: 2
            }, {
                filter: {FirstName: 'Иван'},
                offset: 0,
                limit: 1,
                expect: 1
            }, {
                filter: {FirstName: 'Иван'},
                offset: 0,
                limit: 2,
                expect: 2
            }, {
                filter: {FirstName: 'Иван'},
                offset: 1,
                limit: 2,
                expect: 2
            }, {
                filter: {FirstName: 'Иван'},
                offset: 2,
                expect: 1
            }, {
                filter: {FirstName: 'Иван'},
                offset: 2,
                limit: 2,
                expect: 1
            }, {
                filter: {MiddleName: 'Оглы'},
                expect: 0
            }, {
                filter: {ParentId: null},
                expect: 6
            }, {
                filter: {ParentId: 6},
                expect: 2
            }, {
                filter: {ParentId: 99},
                expect: 0
            }];

            for (let i = 0; i < tests.length; i++) {
                ((test, num) => {
                    it(`#${num} should return ${test.expect} model(s)`, () => {
                        const query = new Query()
                            .where(test.filter)
                            .offset(test.offset)
                            .limit(test.limit);
                        return source.query(query).then((ds) => {
                            assert.strictEqual(ds.getAll().getCount(), test.expect);
                        });
                    });
                })(tests[i], 1 + i);
            }
        });

        context('when sorting applied', () => {
            const tests = [{
                sorting: 'Id',
                check: 'Id',
                expect: [7, 6, 5, 4, 3, 2, 1, undefined, null]
            }, {
                sorting: [{Id: true}],
                check: 'Id',
                expect: [7, 6, 5, 4, 3, 2, 1, undefined, null]
            }, {
                sorting: [{Id: false}],
                offset: 2,
                check: 'Id',
                expect: [1, 2, 3, 4, 5, 6, 7]
            }, {
                sorting: [{Id: true}],
                offset: 2,
                check: 'Id',
                expect: [5, 4, 3, 2, 1, undefined, null]
            }, {
                sorting: [{Id: false}],
                limit: 4,
                check: 'Id',
                expect: [undefined, null, 1, 2, 3, 4]
            }, {
                sorting: [{Id: true}],
                limit: 4,
                check: 'Id',
                expect: [7, 6, 5, 4]
            }, {
                sorting: [{Id: false}],
                offset: 3,
                limit: 2,
                check: 'Id',
                expect: [2, 3, 4]
            }, {
                sorting: [{Id: true}],
                offset: 3,
                limit: 2,
                check: 'Id',
                expect: [4, 3]
            }, {
                sorting: [{LastName: false}],
                limit: 5,
                check: 'LastName',
                expect: [undefined, undefined, 'Аксенова', 'Афанасьев', 'Баранов']
            }, {
                sorting: [{LastName: true}],
                limit: 3,
                check: 'LastName',
                expect: ['Петров', 'Иванов', 'Иванов']
            }, {
                sorting: [{FirstName: true}],
                limit: 4,
                check: 'FirstName',
                expect: ['Ян', 'Федора', 'Федор', 'Иванко']
            }, {
                sorting: [{LastName: false}, {FirstName: true}],
                check: ['LastName', 'FirstName'],
                expect: ['+', '+', 'Аксенова+Федора', 'Афанасьев+Иван', 'Баранов+Иванко', 'Годолцов+Иван', 'Иванов+Ян', 'Иванов+Иван', 'Петров+Федор']
            }, {
                sorting: [{FirstName: false}, {MiddleName: false}],
                limit: 7,
                check: ['FirstName', 'MiddleName'],
                expect: ['+', '+', 'Иван+Андреевич', 'Иван+Викторович', 'Иван+Иванович', 'Иванко+Петрович', 'Федор+Иванович']
            }, {
                sorting: [{FirstName: false}, {MiddleName: true}],
                limit: 7,
                check: ['FirstName', 'MiddleName'],
                expect: ['+', '+', 'Иван+Иванович', 'Иван+Викторович', 'Иван+Андреевич', 'Иванко+Петрович', 'Федор+Иванович']
            }, {
                sorting: [{Position: false}, {LastName: false}, {FirstName: false}],
                check: ['Position', 'LastName', 'FirstName'],
                expect: ['++', '++', 'Директор+Афанасьев+Иван', 'Директор+Годолцов+Иван', 'Директор+Петров+Федор', 'Инженер+Аксенова+Федора', 'Инженер+Иванов+Иван', 'Карапуз+Баранов+Иванко', 'Маркетолог+Иванов+Ян']
            }];

            for (let i = 0; i < tests.length; i++) {
                ((test, num) => {
                    if (!(test.check instanceof Array)) {
                        test.check = [test.check];
                    }

                    it(`#${num} should return ${test.expect} models order`, () => {
                        const query = new Query()
                            .where((test as any).filter)
                            .orderBy(test.sorting)
                            .offset(test.offset)
                            .limit(test.limit);
                        return source.query(query).then((ds) => {
                            let modelNum = 0;
                            ds.getAll().each((model) => {
                                const need = test.expect[modelNum];
                                let have;
                                if (test.check.length > 1) {
                                    have = [];
                                    for (let j = 0; j < test.check.length; j++) {
                                        have.push(model.get(test.check[j]));
                                    }
                                    have = have.join('+');
                                } else {
                                    have = model.get(test.check[0]);
                                }

                                assert.strictEqual(have, need, `on ${modelNum}`);
                                modelNum++;
                            });
                        });
                    });
                })(tests[i], 1 + i);
            }
        });
    });

    describe('.move()', () => {
        it('should move 5 to begin list', () => {
            return source.move(
                [5],
                6,
                {position: 'before'}
            ).then(() => {
                assert.strictEqual(data[0].Id, 5);
            });
        });

        it('should move 6 before 5', () => {
            return source.move(
                [6],
                5,
                {position: 'before'}
            ).then(() => {
               assert.strictEqual(data[5].Id, 6);
               assert.strictEqual(data[6].Id, 5);
            });
        });

        it('should move 6 after 5', () => {
            return source.move(
                [6],
                5,
                {position: 'after'}
            ).then(() => {
                assert.strictEqual(data[5].Id, 5);
                assert.strictEqual(data[6].Id, 6);
            });
        });

        it('should move 6 to end list', () => {
            return source.move(
                [6],
                3,
                {position: 'after'}
            ).then(() => {
                assert.strictEqual(data[data.length - 1].Id, 6);
            });
        });

        it('should move 6 to end list', () => {
            return source.move(
                [6],
                3,
                {position: 'after'}
            ).then(() => {
                assert.strictEqual(data[data.length - 1].Id, 6);
            });
        });

        it('should move 6 to end list', () => {
            return source.move(
                [6],
                3,
                {position: 'after'}
            ).then(() => {
                assert.strictEqual(data[data.length - 1].Id, 6);
            });
        });

        it('should move 6 to end list with use before', () => {
            return source.move(
                6,
                3,
                {before: false}
            ).then(() => {
                assert.strictEqual(data[data.length - 1].Id, 6);
            });
        });

        it('should move 6 before 3 with use before', () => {
            return source.move(
                6,
                3,
                {before: true}
            ).then(() => {
                assert.strictEqual(data[data.length - 2].Id, 6);
            });
        });
        it('should move row with ids 6 on 3', () => {
            return source.move(
                6,
                3,
                {position: 'on', parentProperty: 'ParentId'}
            ).then(() => {
                assert.equal(data[0].ParentId, 3 as any);
            });
        });

        it('should move row with ids 3 on root', () => {
            return source.move(
                3,
                null,
                {position: 'on', parentProperty: 'ParentId'}
            ).then(() => {
                assert.equal(data[8].ParentId, null);
            });
        });

        it('should move row up before targets', () => {
            return source.move(
                5,
                7,
                {position: 'before'}
            ).then(() => {
                assert.strictEqual(data[3].Id, 5);
            });
        });

        it('should move rows up after targets', () => {
            return source.move(
                5,
                7,
                {position: 'after'}
            ).then(() => {
                assert.strictEqual(data[4].Id, 5);
            });
        });

        it('should move rows up before targets', () => {
            return source.move(
                [5, 1],
                7,
                {position: 'after'}
            ).then(() => {
                assert.strictEqual(data[4].Id, 5);
                assert.strictEqual(data[5].Id, 1);
            });
        });

        it('should move rows down before targets', () => {
            return source.move(
                [5, 1],
                7,
                {position: 'before'}
            ).then(() => {
                assert.strictEqual(data[3].Id, 5);
                assert.strictEqual(data[4].Id, 1);
            });
        });

        it('should move row down after targets', () => {
            return source.move(
                [4, 7],
                1,
                {position: 'after'}
            ).then(() => {
                assert.strictEqual(data[6].Id, 4);
                assert.strictEqual(data[7].Id, 7);
            });
        });

        it('should move row up before targets', () => {
            return source.move(
                [4, 7],
                1,
                {position: 'before'}
            ).then(() => {
                assert.strictEqual(data[5].Id, 4);
                assert.strictEqual(data[6].Id, 7);
            });
        });
    });

    context('when use recordset as data', () => {
        let recordset: RecordSet;
        let source: MemorySource;

        beforeEach(() => {
            recordset = new RecordSet({
                rawData: data
            });

            source = new MemorySource({
                data: recordset,
                adapter: 'Types/entity:adapter.RecordSet',
                keyProperty: 'Id'
            });
        });

        describe('.create()', () => {
            it('should return an empty model', () => {
                return source.create().then((model) => {
                    assert.instanceOf(model, Model);
                });
            });

            it('should return an model with initial data', () => {
                return source.create(new Model({
                    rawData: {
                        a: 1,
                        b: true
                    }
                })).then((model) => {
                    assert.strictEqual(model.get('a'), 1);
                    assert.strictEqual(model.get('b'), true);
                });
            });
        });

        describe('.read()', () => {
            context('when the model is exists', () => {
                it('should return the valid model', () => {
                    return source.read(existsId).then((model) => {
                        assert.instanceOf(model, Model);
                        assert.strictEqual((model as Model).getId(), existsId);
                    });
                });
            });

            context('when the model isn\'t exists', () => {
                it('should return an error', () => {
                    return source.read(notExistsId).then(() => {
                        throw new Error('Method should return an error');
                    }, (err) => {
                        assert.instanceOf(err, Error);
                    });
                });
            });
        });

        describe('.update()', () => {
            it('should update data if it\'s null by default', () => {
                const source = new MemorySource({
                    keyProperty: 'foo'
                });
                const model = new Model({
                    rawData: {foo: 'bar'}
                });

                return source.update(model).then(() => {
                    return source.query().then((ds) => {
                        assert.equal(ds.getAll().at(0).get('foo'), 'bar');
                    });
                });
            });

            context('when the model was stored', () => {
                it('should update the model', () => {
                    return source.read(existsId).then((model) => {
                        model.set('LastName', 'Петров');
                        return source.update(model).then((success) => {
                            assert.isTrue(!!success);
                            return source.read(existsId).then((model) => {
                                assert.equal(model.get('LastName'), 'Петров');
                            });
                        });
                    });
                });
            });

            context('when the model was not stored', () => {
                const testModel = (success, model, length) => {
                    assert.isTrue(!!success);
                    assert.strictEqual(length, recordset.getCount());
                    return source.read(model.getId()).then((modelToo) => {
                        assert.strictEqual(model.get('LastName'), modelToo.get('LastName'));
                    });
                };

                it('should create the model by 1st way', () => {
                    const oldLength = recordset.getCount();
                    return source.create(new Model({
                        adapter: recordset.getAdapter()
                    })).then((model) => {
                        model.set('LastName', 'Козлов');
                        return source.update(model).then((success) => {
                            return testModel(success, model, 1 + oldLength);
                        });
                    });
                });

                it('should create the model by 2nd way', () => {
                    const oldLength = recordset.getCount();
                    const model = new Model({
                        rawData: new Model(),
                        keyProperty: 'Id',
                        adapter: 'Types/entity:adapter.RecordSet'
                    });

                    model.set('LastName', 'Овечкин');
                    return source.update(model).then((success) => {
                        return testModel(success, model, 1 + oldLength);
                    });
                });

                it('should nod clone row when it have key 0', () => {
                    const source = new MemorySource({
                         data: [{id: 0, name: 'name'}],
                         keyProperty: 'id'
                    });
                    const model = new Model({
                        rawData: {id: 0, name: '11'},
                        keyProperty: 'id'
                    });

                    source.update(model);
                    assert.equal((source as any)._$data.length, 1);
                });
            });
        });

        describe('.destroy()', () => {
            context('when the model is exists', () => {
                it('should return success', () => {
                    return source.destroy(existsId).then((success) => {
                        assert.isTrue(!!success);
                    });
                });

                it('should really delete the model', () => {
                    return source.destroy(existsId).then(() => {
                        source.read(existsId).then(() => {
                            throw new Error('The model still exists');
                        }, (err) => {
                            assert.instanceOf(err, Error);
                        });
                    });
                });

                it('should decrease the size of raw data', () => {
                    const targetLength = recordset.getCount() - 1;
                    return source.destroy(existsId).then(() => {
                        assert.strictEqual(targetLength, recordset.getCount());
                    });
                });
            });

            context('when the model isn\'t exists', () => {
                it('should return an error', () => {
                    return source.destroy(notExistsId).then(() => {
                        throw new Error('Method should return an error');
                    }, (err) => {
                        assert.instanceOf(err, Error);
                    });
                });
            });
        });

        describe('.merge()', () => {
            context('when the model isn\'t exists', () => {
                it('should return an error', () => {
                    return source.merge(notExistsId, existsId).then(() => {
                        throw new Error('Method should return an error');
                    }, (err) => {
                        assert.instanceOf(err, Error);
                    });
                });

                it('should return an error', () => {
                    return source.merge(existsId, notExistsId).then(() => {
                        throw new Error('Method should return an error');
                    }, (err) => {
                        assert.instanceOf(err, Error);
                    });
                });
            });

            it('should merge models', () => {
                return source.merge(existsId, existsId2).then(() => {
                    return source.read(existsId).then(() => {
                        return source.read(existsId2).then(() => {
                            throw new Error('Exists extention model.');
                        }, (err) => {
                            assert.instanceOf(err, Error);
                        });
                    });
                });
            });
        });

        describe('.copy()', () => {
            it('should copy model', () => {
                const oldLength = recordset.getCount();
                return source.copy(existsId).then(() => {
                    assert.strictEqual(recordset.getCount(), 1 + oldLength);
                });
            });
        });

        describe('.query()', () => {
            it('should return a valid dataset', () => {
                return source.query(new Query()).then((ds) => {
                    assert.instanceOf(ds, DataSet);
                    assert.strictEqual(ds.getAll().getCount(), recordset.getCount());
                });
            });

            it('should save data adapter', () => {
                const format = [{name: 'id', type: 'integer'}];
                const recordset = new RecordSet({
                    format,
                    adapter: 'Types/entity:adapter.Sbis'
                });
                const source = new MemorySource({
                    data: recordset,
                    adapter: 'Types/entity:adapter.RecordSet',
                    keyProperty: 'Id'
                });
                const record = new Model({
                    format: recordset.getFormat(),
                    adapter: recordset.getAdapter()
                });

                record.set('id', 1);
                recordset.add(record);
                return source.query().then((ds) => {
                    assert.instanceOf(ds.getAll().getRawData(true).getAdapter(), SbisAdapter);
                });
            });

            it('should work with no query', () => {
                return source.query().then((ds) => {
                    assert.instanceOf(ds, DataSet);
                    assert.strictEqual(ds.getAll().getCount(), recordset.getCount());
                });
            });

            it('should work if query select no items', () => {
                const query = new Query();
                query.where({someField: 'WithValueThatWillNotBeFind'});

                return source.query(query).then((ds) => {
                    assert.instanceOf(ds.getProperty(ds.getItemsProperty()), RecordSet);
                });
            });

            it('should return a list instance of injected module', () => {
                const MyList = coreExtend.extend(List, {});
                source.setListModule(MyList);
                return source.query().then((ds) => {
                    assert.instanceOf(ds.getAll(), MyList);
                });
            });

            it('should return a model instance of injected module', () => {
                const MyModel = coreExtend.extend(Model, {});
                source.setModel(MyModel);
                return source.query().then((ds) => {
                    assert.instanceOf(ds.getAll().at(0), MyModel);
                });
            });

            it('should keep property total', () => {
                return source.query(new Query().limit(2)).then((ds) => {
                    assert.instanceOf(ds, DataSet);
                    assert.strictEqual(ds.getMetaData<{total: number}>().total, recordset.getCount());
                });
            });

        });
    });
});
