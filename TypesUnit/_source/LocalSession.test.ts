import {assert} from 'chai';
import LocalSession from 'Types/_source/LocalSession';
import DataSet from 'Types/_source/DataSet';
import Query from 'Types/_source/Query';
import Model from 'Types/_entity/Model';
import RecordSet from 'Types/_collection/RecordSet';
import List from 'Types/_collection/List';
import {LocalStorage} from 'Browser/Storage';
import * as coreExtend from 'Core/core-simpleExtend';

const ls = new LocalStorage('mdl_solarsystem');
const ls5 = new LocalStorage('mdl_solarsystem_5');
const ls6 = new LocalStorage('mdl_solarsystem_6');
const ls7 = new LocalStorage('mdl_solarsystem_7');
const existsId = 5;
const existsIdIndex = 6;
const existsId2 = '6';
const notExistsId = 33;

const mock = [
    {id: '1', title: 'Sun', kind: 'Star', material: 'dirt'},
    {id: '2', title: 'Mercury', kind: 'Planet', material: 'clay'},
    {id: '3', title: 'Neptune', kind: 'Planet', material: 'sand'},
    {id: '4', title: 'Earth', kind: 'Planet', material: 'gravel'},
    {id: 5, title: 'Mars', kind: 'Planet', material: 'dirt'},
    {id: '6', title: 'Jupiter', kind: 'Planet', material: 'gravel'},
    {id: '7', title: 'Saturn', kind: 'Planet', material: 'clay'},
    {id: '8', title: 'Uranus', kind: 'Planet', material: 'asphalt'},
    {id: '9', title: 'Neptune', kind: 'Planet', material: 'gravel'},
    {id: '10', title: 'Plutonis', kind: 'Da planet', material: null}
];

let source: LocalSession;

describe('Types/_source/LocalSession', () => {
    beforeEach(() => {
        source = new LocalSession({
            prefix: 'mdl_solarsystem',
            keyProperty: 'id',
            data: mock
        });
    });

    afterEach(() => {
        source = undefined;
        ls.clear();
    });

    describe('.create()', () => {
        it('should return an empty model', () => {
            return source.create().then((model) => {
                assert.instanceOf(model, Model);
                assert.isUndefined(model.get('title'));
            });
        });

        it('should return an model with initial data', () => {
            const mockObj = {id: '11', name: 'Moon', kind: 'Satellite'};
            return source.create(mockObj).then((model) => {
               assert.strictEqual(model.get('name'), 'Moon');
               assert.strictEqual(model.get('kind'), 'Satellite');
            });
        });

        it('should return an unlinked model', () => {
            const meta = {id: '11', name: 'Moon', kind: 'Satellite'};
            return source.create(meta).then((model) => {
                model.set('name', 'Mars');
                assert.strictEqual(meta.name, 'Moon');
            });
        });
    });

    describe('read()', () => {
        context('when the model is exists', () => {
            it('should return the valid model', () => {
               return source.read(existsId).then((model) => {
                    assert.instanceOf(model, Model);
                    if (model instanceof Model) {
                        assert.isTrue(model.getId() > 0);
                        assert.strictEqual(model.getId(), existsId);
                        assert.strictEqual(model.get('title'), 'Mars');
                    }
                });
            });

            it('should return an unlinked model', () => {
                const oldValue = mock[existsIdIndex].title; // Saturn
                return source.read(existsId).then((model) => {
                    model.set('title', 'Test');
                    assert.strictEqual(mock[existsIdIndex].title, oldValue);
                });
            });
        });

        context('when the model isn\'t exists', () => {
            it('should return an error', () => {
                return source.read(notExistsId).then(() => {
                    throw new Error('That\'s no Error');
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
                    model.set('title', 'MarsUpdated');
                    return source.update(model).then((success) => {
                        assert.isTrue(!!success);
                        assert.isFalse(model.isChanged());
                        return source.read(existsId).then((model) => {
                           assert.strictEqual(model.get('title'), 'MarsUpdated');
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
                assert.strictEqual(length, ls.getItem('k'));
                return source.read(model.getId()).then((modelToo) => {
                    assert.strictEqual(model.get('title'), modelToo.get('title'));
                });
            };

            it('should create the model by 1st way', () => {
                const oldLength = mock.length;

                return source.create().then((model) => {
                    model.set('title', 'Козлов');
                    return source.update(model).then((success) => {
                        return testModel(success, model, 1 + oldLength);
                    });
                });
            });

            it('should create the model by 2nd way', () => {
                const oldLength = mock.length;
                const model = new Model({
                    keyProperty: 'id'
                });

                model.set('title', 'Овечкин');
                return source.update(model).then((success) => {
                    return testModel(success, model, 1 + oldLength);
                });
            });

            it('should generate id and set it in raw data', () => {
                const model = new Model({
                    keyProperty: 'id'
                });

                return source.update(model).addCallback((id) => {
                    assert.equal(model.get('id'), id);
                    return source.read(id).addCallback((readModel) => {
                        assert.equal(readModel.get('id'), id);
                    });
                });
            });

            it('should generate ids and set it in raw data when updating recordset', () => {
                const data = new RecordSet({
                    rawData: [
                        {id: null, title: 'Neptune', kind: 'Planet'},
                        {id: 90, title: 'Pluto', kind: 'Dwarf planet'}
                    ],
                    keyProperty: 'id'
                });

                source.update(data).addCallback((ids) => {
                    data.each((model, i) => {
                        assert.equal(model.get('id'), ids[i]);
                        source.read(ids[i]).addCallback((readModel) => {
                            assert.equal(readModel.get('id'), ids[i]);
                        });
                    });
                });
            });
        });

        context('update few rows', () => {
            it('should insert new rows', () => {
                const rs = new RecordSet({
                    rawData: [
                        {id: 90, title: 'Pluto', kind: 'Dwarf planet'},
                        {id: null, title: 'Neptune', kind: 'COCO-COLA Planet'}
                    ],
                    keyProperty: 'id'
                });

                return source.update(rs).then(() => {
                    return source.read(90).then((record) => {
                        assert.equal(record.get('title'), 'Pluto');
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
                    source.read(existsId).then(() => {
                        throw new Error('The model still exists');
                    }, (err) => {
                        //ok if err == Model is not found
                        assert.isTrue(!!err);
                    });
                });
            });

            it('should decrease the size of raw data', () => {
                const targetLength = ls.getItem('k') - 1;

                return source.destroy(existsId).then(() => {
                    assert.strictEqual(targetLength, ls.getItem('k'));
                });
            });

            it('should decrease the size of raw data when delete a few models', () => {
                const targetLength = ls.getItem('k') - 2;

                return source.destroy([existsId, existsId2]).then(() => {
                    assert.strictEqual(targetLength, ls.getItem('k'));
                });
            });
        });

        context('when the model isn\'t exists', () => {
            it('should return an error', () => {
                return source.destroy(notExistsId).then(() => {
                    throw new Error('That\'s no Error');
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
                    throw new Error('That\'s no Error');
                }, (err) => {
                    assert.instanceOf(err, Error);
                });
            });

            it('should return an error', () => {
                return source.merge(existsId, notExistsId).then(() => {
                    throw new Error('That\'s no Error');
                }, (err) => {
                    assert.instanceOf(err, Error);
                });
            });
        });

        context('when the model is exists', () => {
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
    });

    describe('.copy()', () => {
        it('should copy model', () => {
            const oldLength = ls.getItem('k');
            return source.copy(existsId).then((copy) => {
                assert.instanceOf(copy, Model);
                assert.deepEqual(copy.getRawData(), ls.getItem('d' + existsId));
                assert.strictEqual(ls.getItem('k'), 1 + oldLength);
            });
        });
    });

    describe('.query()', () => {
        it('should return a valid dataset', () => {
            return source.query(new Query()).then((ds) => {
                assert.instanceOf(ds, DataSet);
                assert.strictEqual(ds.getAll().getCount(), mock.length);
            });
        });

        it('should work with no query', () => {
            return source.query().then((ds) => {
                assert.instanceOf(ds, DataSet);
                assert.strictEqual(ds.getAll().getCount(), mock.length);
            });
        });

        it('should do not change order', () => {
            const meta = {id: '3i24qr5a-cqsq-raqj-6sla-c0sr9s5', title: 'Moon', kind: 'Satellite', material: null};
            const result = mock.slice();
            result.push(meta);
            return source.create(meta).then((model) => {
                return source.update(model).then(() => {
                    return source.query().then((ds) => {
                        assert.instanceOf(ds, DataSet);
                        const data = ds.getAll().getRawData();
                        assert.deepEqual(data, result);
                    });
                });
            });
        });

        it('should return an unlinked collection', () => {
            return source.query().then((ds) => {
                const rec = ds.getAll().at(0);
                const oldId = mock[0].id;
                rec.set('id', 'test');
                assert.strictEqual(mock[0].id, oldId);
            });
        });

        it('should keep modules of cloned instances', () => {
            const data = [{
                a: new Model()
            }];
            const source2 = new LocalSession({
                keyProperty: 'id',
                prefix: 'mdl_solarsystem_2',
                data
            });

            return source2.query().then((ds) => {
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

            let source5;

            beforeEach(() => {
                source5 = new LocalSession({
                    keyProperty: 'id',
                    prefix: 'mdl_solarsystem_5',
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
            });

            afterEach(() => {
                ls5.clear();
            });

            it('should sort asc from right to left', () => {
                const query = new Query();
                const expect = [
                    'aaa',
                    'baa',
                    'caa',
                    'aba',
                    'bba',
                    'cba',
                    'aca',
                    'bca',
                    'cca',
                    'aab',
                    'bab',
                    'cab',
                    'abb',
                    'bbb',
                    'cbb',
                    'acb',
                    'bcb',
                    'ccb',
                    'aac',
                    'bac',
                    'cac',
                    'abc',
                    'bbc',
                    'cbc',
                    'acc',
                    'bcc',
                    'ccc'
                ];
                query.orderBy([{third: false}, {second: false}, {first: false}]);

                return source5.query(query).then((ds) => {
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

                return source5.query(query).then((ds) => {
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

                return source5.query(query).then((ds) => {
                    const given = getResult(ds);
                    assert.deepEqual(given, expect);
                });
            });
        });

        context('when the filter applied', () => {
            const tests = [{
                filter: {title: 'Neptune'},
                expect: 2
            }, {
                filter: (item) => item.get('title') === 'Neptune',
                expect: 2
            }, {
                filter: (item, index) => index < 3,
                expect: 3
            }, {
                filter: {title: ['Neptune', 'Uranus'], material: ['asphalt', 'sand']},
                expect: 2
            }, {
                filter: {title: 'Neptune'},
                offset: 0,
                expect: 2
            }, {
                filter: {title: 'Neptune'},
                offset: 0,
                limit: 0,
                expect: 0
            }, {
                filter: {title: 'Sun'},
                offset: 0,
                limit: 1,
                expect: 1
            }, {
                filter: {title: 'Mercury'},
                offset: 0,
                limit: 2,
                expect: 1
            }, {
                filter: {title: 'Mercury'},
                offset: 1,
                expect: 0
            }, {
                filter: {title: 'Sun'},
                offset: 1,
                limit: 0,
                expect: 0
            }, {
                filter: {title: 'Neptune'},
                offset: 1,
                limit: 1,
                expect: 1
            }, {
                filter: {title: 'Neptune'},
                offset: 2,
                expect: 0
            }, {
                filter: {title: 'Neptune'},
                offset: 2,
                limit: 1,
                expect: 0
            }, {
                filter: {material: null},
                expect: 1
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
            const order1 = 'id';
            const tests = [{
                check: order1,
                expect: ['1', '2', '3', '4', 5, '6', '7', '8', '9', '10']
            }, {
                offset: 2,
                check: order1,
                expect: ['3', '4', 5, '6', '7', '8', '9', '10']
            }, {
                limit: 4,
                check: order1,
                expect: ['1', '2', '3', '4']
            }, {
               offset: 3,
                limit: 2,
                check: order1,
                expect: ['4', 5]
            }, {
                sorting: [{title: false}],
                limit: 5,
                check: 'title',
                expect: ['Earth', 'Jupiter', 'Mars', 'Mercury', 'Neptune']
            }, {
                sorting: [{title: true}],
                limit: 3,
                check: 'title',
                expect: ['Uranus', 'Sun', 'Saturn']
            }, {
                sorting: [{material: true}],
                limit: 4,
                check: 'material',
                expect: ['sand', 'gravel', 'gravel', 'gravel']
            }, {
                sorting: [{title: false}, {material: true}],
                check: ['title', 'material'],
                expect: ['Earth+gravel', 'Jupiter+gravel', 'Mars+dirt', 'Mercury+clay', 'Neptune+sand',
                    'Neptune+gravel', 'Plutonis+', 'Saturn+clay', 'Sun+dirt', 'Uranus+asphalt']
            }, {
                sorting: [{title: false}, {material: false}],
                limit: 7,
                check: ['title', 'material'],
                expect: ['Earth+gravel', 'Jupiter+gravel', 'Mars+dirt', 'Mercury+clay', 'Neptune+gravel',
                    'Neptune+sand', 'Plutonis+']
            }, {
                sorting: [{title: false}, {material: true}],
                limit: 7,
                check: ['title', 'material'],
                expect: ['Earth+gravel', 'Jupiter+gravel', 'Mars+dirt', 'Mercury+clay', 'Neptune+sand',
                    'Neptune+gravel', 'Plutonis+']
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
                               assert.strictEqual(have, need, `On model number ${modelNum}`);
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
                [existsId],
                '6',
                {position: 'before'}
            ).then(() => {
                assert.strictEqual(ls.getItem('i')[4], existsId);
            });
        });

        it('should move 6 before 5', () => {
            return source.move(
                ['6'],
                existsId,
                {position: 'before'}
            ).then(() => {
                assert.strictEqual(ls.getItem('i')[4], '6');
                assert.strictEqual(ls.getItem('i')[5], existsId);
            });
        });

        it('should move 6 after 5', () => {
            return source.move(
                ['6'],
                existsId,
                {position: 'after'}
            ).then(() => {
                assert.strictEqual(ls.getItem('i')[4], existsId);
                assert.strictEqual(ls.getItem('i')[5], '6');
            });
        });

        it('should move 6 to end list', () => {
            return source.move(
                ['6'],
                '3',
                {position: 'after'}
            ).then(() => {
                assert.strictEqual(ls.getItem('i')[3], '6');
            });
        });

        it('should move 6 to end list', () => {
            return source.move(
                ['6'],
                '3',
                {position: 'after'}
            ).then(() => {
                assert.strictEqual(ls.getItem('i')[3], '6');
            });
        });

        it('should move 6 to end list', () => {
            return source.move(
                ['6'],
                '3',
                {position: 'after'}
            ).then(() => {
                assert.strictEqual(ls.getItem('i')[3], '6');
            });
        });

        it('should move 6 to end list with use before', () => {
            return source.move(
                '6',
                '3',
                {before: false}
            ).then(() => {
                assert.strictEqual(ls.getItem('i')[3], '6');
            });
        });

        it('should move 6 before 3 with use before', () => {
            return source.move(
                ['6', '5'],
                '3',
                {before: true}
            ).then(() => {
                assert.strictEqual(ls.getItem('i')[2], '6');
            });
        });

        it('should move row with ids 6 on 3', () => {
            return source.move(
                '6',
                '3',
                {position: 'on', parentProperty: 'title'}
            ).then(() => {
                assert.equal(ls.getItem('d' + '6').title, 'Neptune');
            });
        });

        it('should move row with ids 3 on root', () => {
            return source.move(
                '6',
                null,
                {position: 'on', parentProperty: 'title'}
            ).then(() => {
                assert.equal(ls.getItem('d' + '6').title, null);
            });
        });
    });

    context('when use recordset as data', () => {
        let recordset;
        let source6;

        beforeEach(() => {
            recordset = new RecordSet({
                keyProperty: 'id',
                rawData: mock
            });

            source6 = new LocalSession({
                prefix: 'mdl_solarsystem_6',
                adapter: 'Types/entity:adapter.RecordSet',
                keyProperty: 'id',
                data: recordset
            });
        });

        afterEach(() => {
            ls6.clear();
        });

        describe('.create()', () => {
            it('should return an empty model', () => {
                return source6.create().then((model) => {
                    assert.instanceOf(model, Model);
                });
            });

            it('should return an model with initial data', () => {
                const model = new Model({
                    rawData: {
                        a: 1,
                        b: true
                    }
                });

                return source6.create(model).then((model) => {
                    const a = model.get('a');
                    assert.strictEqual(a, 1);
                    assert.strictEqual(model.get('b'), true);
                });
            });
        });

        describe('.read()', () => {
            context('when the model is exists', () => {
                it('should return the valid model', () => {
                    return source6.read(existsId).then((model) => {
                        assert.instanceOf(model, Model);
                        assert.strictEqual(model.getId(), existsId);
                    });
                });
            });

            context('when the model isn\'t exists', () => {
                it('should return an error', () => {
                    return source6.read(notExistsId).then(() => {
                        throw new Error('That\'s not error');
                    }, (err) => {
                       assert.instanceOf(err, Error);
                    });
                });
            });
        });

        describe('.update()', () => {
            context('when the model was stored', () => {
                it('should update the model', () => {
                    return source6.read(existsId).then((model) => {
                        model.set('Фамилия', 'Петров');
                        return source6.update(model).then((success) => {
                            assert.isTrue(!!success);
                            return source6.read(existsId).then((model) => {
                                assert.equal(model.get('Фамилия'), 'Петров');
                            });
                        });
                    });
                });
            });

            context('when the model was not stored', () => {
                const testModel = (success, model, length) => {
                    assert.isTrue(!!success);
                    assert.strictEqual(length, ls6.getItem('k'));

                    return source6.read(model.getId()).then((modelToo) => {
                        assert.strictEqual(model.get('Фамилия'), modelToo.get('Фамилия'));
                    });
                };

                it('should create the model by 1st way', () => {
                    const oldLength = ls6.getItem('k');
                    return source6.create(new Model({
                        adapter: recordset.getAdapter()
                    })).then((model) => {
                        model.set('Фамилия', 'Козлов');
                        return source6.update(model).then((success) => {
                            return testModel(success, model, 1 + oldLength);
                        });
                    });
                });

                it('should create the model by 2nd way', () => {
                    const oldLength = recordset.getCount();
                    const model = new Model({
                        rawData: new Model(),
                        keyProperty: 'Ид',
                        adapter: 'Types/entity:adapter.RecordSet'
                    });
                    model.set('Фамилия', 'Овечкин');
                    return source6.update(model).then((success) => {
                        return testModel(success, model, 1 + oldLength);
                    });
                });

                it('should nod clone row when it have key 0', () => {
                    const source7 = new LocalSession({
                        prefix: 'mdl_solarsystem_7',
                        data: [{id: 0, name: 'name'}],
                        keyProperty: 'id'
                    });
                    const model = new Model({
                        rawData: {id: 0, name: '11'},
                        keyProperty: 'id'
                    });
                    source7.update(model);
                    assert.equal(ls7.getItem('i').length, 1);
                });
            });
        });

        describe('.destroy()', () => {
            context('when the model is exists', () => {
                it('should return success', () => {
                    return source6.destroy(existsId).then((success) => {
                        assert.isTrue(!!success);
                    });
                });

                it('should really delete the model', () => {
                    return source6.destroy(existsId).then(() => {
                       return source6.read(existsId).then(() => {
                           throw new Error('The model still exists');
                       }, (err) => {
                           assert.instanceOf(err, Error);
                       });
                    });
                });

                it('should decrease the size of raw data', () => {
                    const targetLength = ls6.getItem('k') - 1;
                    return source6.destroy(existsId).then(() => {
                        assert.strictEqual(targetLength, ls6.getItem('k'));
                    });
                });
            });

            context('when the model isn\'t exists', () => {
                it('should return an error', () => {
                    return source6.destroy(notExistsId).then(() => {
                        throw new Error('An error expected');
                    }, (err) => {
                        assert.instanceOf(err, Error);
                    });
                });
            });
        });

        describe('.merge()', () => {
            context('when the model isn\'t exists', () => {
                it('should return an error', () => {
                    return source6.merge(notExistsId, existsId).then(() => {
                        throw new Error('An error expected');
                    }, (err) => {
                        assert.instanceOf(err, Error);
                    });
                });

                it('should return an error', () => {
                    return source6.merge(existsId, notExistsId).then(() => {
                        throw new Error('An error expected');
                    }, (err) => {
                        assert.instanceOf(err, Error);
                    });
                });
            });

            it('should merge models', () => {
                return source6.merge(existsId, existsId2).then(() => {
                    return source6.read(existsId).then(() => {
                        return source6.read(existsId2).then(() => {
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
                const oldLength = ls6.getItem('k');
                return source6.copy(existsId).then(() => {
                    assert.strictEqual(ls6.getItem('k'), 1 + oldLength);
                });
            });
        });

        describe('.query()', () => {
            it('should return a valid dataset', () => {
                const query = new Query();
                return source6.query(query).then((ds) => {
                    assert.instanceOf(ds, DataSet);
                    assert.strictEqual(ds.getAll().getCount(), ls6.getItem('k'));
                });
            });

            it('should work with no query', () => {
                return source6.query().then((ds) => {
                    assert.instanceOf(ds, DataSet);
                    assert.strictEqual(ds.getAll().getCount(), ls6.getItem('k'));
                });
            });

            it('should work if query select no items', () => {
                const query = new Query();
                query.where({someField: 'WithValueThatWillNotBeFind'});

                return source6.query(query).then((ds) => {
                    const itemsProperty = ds.getItemsProperty();
                    const property = ds.getProperty(itemsProperty);
                    assert.instanceOf(property, RecordSet);
                });
            });

            it('should return a list instance of injected module', () => {
                const MyList = coreExtend.extend(List, {});
                source6.setListModule(MyList);
                return source6.query().then((ds) => {
                    assert.instanceOf(ds.getAll(), MyList);
                });
            });

            it('should return a model instance of injected module', () => {
                const  MyModel = coreExtend.extend(Model, {});
                source6.setModel(MyModel);
                return source6.query().then((ds) => {
                    assert.instanceOf(ds.getAll().at(0), MyModel);
                });
            });

            it('should keep property total', () => {
                return source6.query(new Query().limit(2)).then((ds) => {
                    assert.instanceOf(ds, DataSet);
                    assert.strictEqual(ds.getMetaData().total, 2);
                });
            });
        });
    });
});
