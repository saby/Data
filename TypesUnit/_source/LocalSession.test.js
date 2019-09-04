define(["require", "exports", "chai", "Types/_source/LocalSession", "Types/_source/DataSet", "Types/_source/Query", "Types/_entity/Model", "Types/_collection/RecordSet", "Types/_collection/List", "Browser/Storage", "Core/core-simpleExtend"], function (require, exports, chai_1, LocalSession_1, DataSet_1, Query_1, Model_1, RecordSet_1, List_1, Storage_1, coreExtend) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ls = new Storage_1.LocalStorage('mdl_solarsystem');
    var ls5 = new Storage_1.LocalStorage('mdl_solarsystem_5');
    var ls6 = new Storage_1.LocalStorage('mdl_solarsystem_6');
    var ls7 = new Storage_1.LocalStorage('mdl_solarsystem_7');
    var existsId = 5;
    var existsIdIndex = 6;
    var existsId2 = '6';
    var notExistsId = 33;
    var mock = [
        { id: '1', title: 'Sun', kind: 'Star', material: 'dirt' },
        { id: '2', title: 'Mercury', kind: 'Planet', material: 'clay' },
        { id: '3', title: 'Neptune', kind: 'Planet', material: 'sand' },
        { id: '4', title: 'Earth', kind: 'Planet', material: 'gravel' },
        { id: 5, title: 'Mars', kind: 'Planet', material: 'dirt' },
        { id: '6', title: 'Jupiter', kind: 'Planet', material: 'gravel' },
        { id: '7', title: 'Saturn', kind: 'Planet', material: 'clay' },
        { id: '8', title: 'Uranus', kind: 'Planet', material: 'asphalt' },
        { id: '9', title: 'Neptune', kind: 'Planet', material: 'gravel' },
        { id: '10', title: 'Plutonis', kind: 'Da planet', material: null }
    ];
    var source;
    describe('Types/_source/LocalSession', function () {
        beforeEach(function () {
            source = new LocalSession_1.default({
                prefix: 'mdl_solarsystem',
                keyProperty: 'id',
                data: mock
            });
        });
        afterEach(function () {
            source = undefined;
            ls.clear();
        });
        describe('.create()', function () {
            it('should return an empty model', function () {
                return source.create().then(function (model) {
                    chai_1.assert.instanceOf(model, Model_1.default);
                    chai_1.assert.isUndefined(model.get('title'));
                });
            });
            it('should return an model with initial data', function () {
                var mockObj = { id: '11', name: 'Moon', kind: 'Satellite' };
                return source.create(mockObj).then(function (model) {
                    chai_1.assert.strictEqual(model.get('name'), 'Moon');
                    chai_1.assert.strictEqual(model.get('kind'), 'Satellite');
                });
            });
            it('should return an unlinked model', function () {
                var meta = { id: '11', name: 'Moon', kind: 'Satellite' };
                return source.create(meta).then(function (model) {
                    model.set('name', 'Mars');
                    chai_1.assert.strictEqual(meta.name, 'Moon');
                });
            });
        });
        describe('read()', function () {
            context('when the model is exists', function () {
                it('should return the valid model', function () {
                    return source.read(existsId).then(function (model) {
                        chai_1.assert.instanceOf(model, Model_1.default);
                        if (model instanceof Model_1.default) {
                            chai_1.assert.isTrue(model.getId() > 0);
                            chai_1.assert.strictEqual(model.getId(), existsId);
                            chai_1.assert.strictEqual(model.get('title'), 'Mars');
                        }
                    });
                });
                it('should return an unlinked model', function () {
                    var oldValue = mock[existsIdIndex].title; // Saturn
                    return source.read(existsId).then(function (model) {
                        model.set('title', 'Test');
                        chai_1.assert.strictEqual(mock[existsIdIndex].title, oldValue);
                    });
                });
            });
            context('when the model isn\'t exists', function () {
                it('should return an error', function () {
                    return source.read(notExistsId).then(function () {
                        throw new Error('That\'s no Error');
                    }, function (err) {
                        chai_1.assert.instanceOf(err, Error);
                    });
                });
            });
        });
        describe('.update()', function () {
            context('when the model was stored', function () {
                it('should update the model', function () {
                    return source.read(existsId).then(function (model) {
                        model.set('title', 'MarsUpdated');
                        return source.update(model).then(function (success) {
                            chai_1.assert.isTrue(!!success);
                            chai_1.assert.isFalse(model.isChanged());
                            return source.read(existsId).then(function (model) {
                                chai_1.assert.strictEqual(model.get('title'), 'MarsUpdated');
                            });
                        });
                    });
                });
            });
            context('when the model was not stored', function () {
                var testModel = function (success, model, length) {
                    chai_1.assert.isTrue(!!success);
                    chai_1.assert.isFalse(model.isChanged());
                    chai_1.assert.isTrue(!!model.getId());
                    chai_1.assert.strictEqual(length, ls.getItem('k'));
                    return source.read(model.getId()).then(function (modelToo) {
                        chai_1.assert.strictEqual(model.get('title'), modelToo.get('title'));
                    });
                };
                it('should create the model by 1st way', function () {
                    var oldLength = mock.length;
                    return source.create().then(function (model) {
                        model.set('title', 'Козлов');
                        return source.update(model).then(function (success) {
                            return testModel(success, model, 1 + oldLength);
                        });
                    });
                });
                it('should create the model by 2nd way', function () {
                    var oldLength = mock.length;
                    var model = new Model_1.default({
                        keyProperty: 'id'
                    });
                    model.set('title', 'Овечкин');
                    return source.update(model).then(function (success) {
                        return testModel(success, model, 1 + oldLength);
                    });
                });
                it('should generate id and set it in raw data', function () {
                    var model = new Model_1.default({
                        keyProperty: 'id'
                    });
                    return source.update(model).addCallback(function (id) {
                        chai_1.assert.equal(model.get('id'), id);
                        return source.read(id).addCallback(function (readedModel) {
                            chai_1.assert.equal(readedModel.get('id'), id);
                        });
                    });
                });
                it('should generate ids and set it in raw data when updating recordset', function () {
                    var data = new RecordSet_1.default({
                        rawData: [
                            { id: null, title: 'Neptune', kind: 'Planet' },
                            { id: 90, title: 'Pluto', kind: 'Dwarf planet' }
                        ],
                        keyProperty: 'id'
                    });
                    source.update(data).addCallback(function (ids) {
                        data.each(function (model, i) {
                            chai_1.assert.equal(model.get('id'), ids[i]);
                            source.read(ids[i]).addCallback(function (readedModel) {
                                chai_1.assert.equal(readedModel.get('id'), ids[i]);
                            });
                        });
                    });
                });
            });
            context('update few rows', function () {
                it('should insert new rows', function () {
                    var rs = new RecordSet_1.default({
                        rawData: [
                            { id: 90, title: 'Pluto', kind: 'Dwarf planet' },
                            { id: null, title: 'Neptune', kind: 'COCO-COLA Planet' }
                        ],
                        keyProperty: 'id'
                    });
                    return source.update(rs).then(function () {
                        return source.read(90).then(function (record) {
                            chai_1.assert.equal(record.get('title'), 'Pluto');
                        });
                    });
                });
            });
        });
        describe('.destroy()', function () {
            context('when the model is exists', function () {
                it('should return success', function () {
                    return source.destroy(existsId).then(function (success) {
                        chai_1.assert.isTrue(!!success);
                    });
                });
                it('should really delete the model', function () {
                    return source.destroy(existsId).then(function () {
                        source.read(existsId).then(function () {
                            throw new Error('The model still exists');
                        }, function (err) {
                            //ok if err == Model is not found
                            chai_1.assert.isTrue(!!err);
                        });
                    });
                });
                it('should decrease the size of raw data', function () {
                    var targetLength = ls.getItem('k') - 1;
                    return source.destroy(existsId).then(function () {
                        chai_1.assert.strictEqual(targetLength, ls.getItem('k'));
                    });
                });
                it('should decrease the size of raw data when delete a few models', function () {
                    var targetLength = ls.getItem('k') - 2;
                    return source.destroy([existsId, existsId2]).then(function () {
                        chai_1.assert.strictEqual(targetLength, ls.getItem('k'));
                    });
                });
            });
            context('when the model isn\'t exists', function () {
                it('should return an error', function () {
                    return source.destroy(notExistsId).then(function () {
                        throw new Error('That\'s no Error');
                    }, function (err) {
                        chai_1.assert.instanceOf(err, Error);
                    });
                });
            });
        });
        describe('.merge()', function () {
            context('when the model isn\'t exists', function () {
                it('should return an error', function () {
                    return source.merge(notExistsId, existsId).then(function () {
                        throw new Error('That\'s no Error');
                    }, function (err) {
                        chai_1.assert.instanceOf(err, Error);
                    });
                });
                it('should return an error', function () {
                    return source.merge(existsId, notExistsId).then(function () {
                        throw new Error('That\'s no Error');
                    }, function (err) {
                        chai_1.assert.instanceOf(err, Error);
                    });
                });
            });
            context('when the model is exists', function () {
                it('should merge models', function () {
                    return source.merge(existsId, existsId2).then(function () {
                        return source.read(existsId).then(function () {
                            return source.read(existsId2).then(function () {
                                throw new Error('Exists extention model.');
                            }, function (err) {
                                chai_1.assert.instanceOf(err, Error);
                            });
                        });
                    });
                });
            });
        });
        describe('.copy()', function () {
            it('should copy model', function () {
                var oldLength = ls.getItem('k');
                return source.copy(existsId).then(function (copy) {
                    chai_1.assert.instanceOf(copy, Model_1.default);
                    chai_1.assert.deepEqual(copy.getRawData(), ls.getItem('d' + existsId));
                    chai_1.assert.strictEqual(ls.getItem('k'), 1 + oldLength);
                });
            });
        });
        describe('.query()', function () {
            it('should return a valid dataset', function () {
                return source.query(new Query_1.default()).then(function (ds) {
                    chai_1.assert.instanceOf(ds, DataSet_1.default);
                    chai_1.assert.strictEqual(ds.getAll().getCount(), mock.length);
                });
            });
            it('should work with no query', function () {
                return source.query().then(function (ds) {
                    chai_1.assert.instanceOf(ds, DataSet_1.default);
                    chai_1.assert.strictEqual(ds.getAll().getCount(), mock.length);
                });
            });
            it('should do not change order', function () {
                var meta = { id: '3i24qr5a-cqsq-raqj-6sla-c0sr9s5', title: 'Moon', kind: 'Satellite', material: null };
                var result = mock.slice();
                result.push(meta);
                return source.create(meta).then(function (model) {
                    return source.update(model).then(function () {
                        return source.query().then(function (ds) {
                            chai_1.assert.instanceOf(ds, DataSet_1.default);
                            var data = ds.getAll().getRawData();
                            chai_1.assert.deepEqual(data, result);
                        });
                    });
                });
            });
            it('should return an unlinked collection', function () {
                return source.query().then(function (ds) {
                    var rec = ds.getAll().at(0);
                    var oldId = mock[0].id;
                    rec.set('id', 'test');
                    chai_1.assert.strictEqual(mock[0].id, oldId);
                });
            });
            it('should keep modules of cloned instances', function () {
                var data = [{
                        a: new Model_1.default()
                    }];
                var source2 = new LocalSession_1.default({
                    keyProperty: 'id',
                    prefix: 'mdl_solarsystem_2',
                    data: data
                });
                return source2.query().then(function (ds) {
                    var rec = ds.getAll().at(0);
                    chai_1.assert.instanceOf(rec.get('a'), Model_1.default);
                });
            });
            it('should return a list instance of injected module', function () {
                var MyList = coreExtend.extend(List_1.default, {});
                source.setListModule(MyList);
                return source.query().then(function (ds) {
                    chai_1.assert.instanceOf(ds.getAll(), MyList);
                });
            });
            it('should return a model instance of injected module', function () {
                var MyModel = coreExtend.extend(Model_1.default, {});
                source.setModel(MyModel);
                return source.query().then(function (ds) {
                    chai_1.assert.instanceOf(ds.getAll().at(0), MyModel);
                });
            });
            context('when sort use several fields', function () {
                var getResult = function (ds) {
                    var result = [];
                    ds.getAll().forEach(function (item) {
                        result.push([
                            item.get('first'),
                            item.get('second'),
                            item.get('third')
                        ].join(''));
                    });
                    return result;
                };
                var source5;
                beforeEach(function () {
                    source5 = new LocalSession_1.default({
                        keyProperty: 'id',
                        prefix: 'mdl_solarsystem_5',
                        data: [
                            { first: 'a', second: 'a', third: 'a' },
                            { first: 'a', second: 'a', third: 'b' },
                            { first: 'a', second: 'a', third: 'c' },
                            { first: 'a', second: 'b', third: 'a' },
                            { first: 'a', second: 'b', third: 'b' },
                            { first: 'a', second: 'b', third: 'c' },
                            { first: 'a', second: 'c', third: 'a' },
                            { first: 'a', second: 'c', third: 'b' },
                            { first: 'a', second: 'c', third: 'c' },
                            { first: 'b', second: 'a', third: 'a' },
                            { first: 'b', second: 'a', third: 'b' },
                            { first: 'b', second: 'a', third: 'c' },
                            { first: 'b', second: 'b', third: 'a' },
                            { first: 'b', second: 'b', third: 'b' },
                            { first: 'b', second: 'b', third: 'c' },
                            { first: 'b', second: 'c', third: 'a' },
                            { first: 'b', second: 'c', third: 'b' },
                            { first: 'b', second: 'c', third: 'c' },
                            { first: 'c', second: 'a', third: 'a' },
                            { first: 'c', second: 'a', third: 'b' },
                            { first: 'c', second: 'a', third: 'c' },
                            { first: 'c', second: 'b', third: 'a' },
                            { first: 'c', second: 'b', third: 'b' },
                            { first: 'c', second: 'b', third: 'c' },
                            { first: 'c', second: 'c', third: 'a' },
                            { first: 'c', second: 'c', third: 'b' },
                            { first: 'c', second: 'c', third: 'c' }
                        ]
                    });
                });
                afterEach(function () {
                    ls5.clear();
                });
                it('should sort asc from right to left', function () {
                    var query = new Query_1.default();
                    var expect = [
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
                    query.orderBy([{ third: false }, { second: false }, { first: false }]);
                    return source5.query(query).then(function (ds) {
                        var given = getResult(ds);
                        chai_1.assert.deepEqual(given, expect);
                    });
                });
                it('should sort desc from left to right', function () {
                    var query = new Query_1.default();
                    var expect = [
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
                    query.orderBy([{ first: true }, { second: true }, { third: true }]);
                    return source5.query(query).then(function (ds) {
                        var given = getResult(ds);
                        chai_1.assert.deepEqual(given, expect);
                    });
                });
                it('should sort mixed from right to left', function () {
                    var query = new Query_1.default();
                    var expect = [
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
                    query.orderBy([{ third: false }, { second: true }, { first: false }]);
                    return source5.query(query).then(function (ds) {
                        var given = getResult(ds);
                        chai_1.assert.deepEqual(given, expect);
                    });
                });
            });
            context('when the filter applied', function () {
                var tests = [{
                        filter: { title: 'Neptune' },
                        expect: 2
                    }, {
                        filter: function (item) { return item.get('title') === 'Neptune'; },
                        expect: 2
                    }, {
                        filter: function (item, index) { return index < 3; },
                        expect: 3
                    }, {
                        filter: { title: ['Neptune', 'Uranus'], material: ['asphalt', 'sand'] },
                        expect: 2
                    }, {
                        filter: { title: 'Neptune' },
                        offset: 0,
                        expect: 2
                    }, {
                        filter: { title: 'Neptune' },
                        offset: 0,
                        limit: 0,
                        expect: 0
                    }, {
                        filter: { title: 'Sun' },
                        offset: 0,
                        limit: 1,
                        expect: 1
                    }, {
                        filter: { title: 'Mercury' },
                        offset: 0,
                        limit: 2,
                        expect: 1
                    }, {
                        filter: { title: 'Mercury' },
                        offset: 1,
                        expect: 0
                    }, {
                        filter: { title: 'Sun' },
                        offset: 1,
                        limit: 0,
                        expect: 0
                    }, {
                        filter: { title: 'Neptune' },
                        offset: 1,
                        limit: 1,
                        expect: 1
                    }, {
                        filter: { title: 'Neptune' },
                        offset: 2,
                        expect: 0
                    }, {
                        filter: { title: 'Neptune' },
                        offset: 2,
                        limit: 1,
                        expect: 0
                    }, {
                        filter: { material: null },
                        expect: 1
                    }];
                for (var i = 0; i < tests.length; i++) {
                    (function (test, num) {
                        it("#" + num + " should return " + test.expect + " model(s)", function () {
                            var query = new Query_1.default()
                                .where(test.filter)
                                .offset(test.offset)
                                .limit(test.limit);
                            return source.query(query).then(function (ds) {
                                chai_1.assert.strictEqual(ds.getAll().getCount(), test.expect);
                            });
                        });
                    })(tests[i], 1 + i);
                }
            });
            context('when sorting applied', function () {
                var order1 = 'id';
                var tests = [{
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
                        sorting: [{ title: false }],
                        limit: 5,
                        check: 'title',
                        expect: ['Earth', 'Jupiter', 'Mars', 'Mercury', 'Neptune']
                    }, {
                        sorting: [{ title: true }],
                        limit: 3,
                        check: 'title',
                        expect: ['Uranus', 'Sun', 'Saturn']
                    }, {
                        sorting: [{ material: true }],
                        limit: 4,
                        check: 'material',
                        expect: ['sand', 'gravel', 'gravel', 'gravel']
                    }, {
                        sorting: [{ title: false }, { material: true }],
                        check: ['title', 'material'],
                        expect: ['Earth+gravel', 'Jupiter+gravel', 'Mars+dirt', 'Mercury+clay', 'Neptune+sand',
                            'Neptune+gravel', 'Plutonis+', 'Saturn+clay', 'Sun+dirt', 'Uranus+asphalt']
                    }, {
                        sorting: [{ title: false }, { material: false }],
                        limit: 7,
                        check: ['title', 'material'],
                        expect: ['Earth+gravel', 'Jupiter+gravel', 'Mars+dirt', 'Mercury+clay', 'Neptune+gravel',
                            'Neptune+sand', 'Plutonis+']
                    }, {
                        sorting: [{ title: false }, { material: true }],
                        limit: 7,
                        check: ['title', 'material'],
                        expect: ['Earth+gravel', 'Jupiter+gravel', 'Mars+dirt', 'Mercury+clay', 'Neptune+sand',
                            'Neptune+gravel', 'Plutonis+']
                    }];
                for (var i = 0; i < tests.length; i++) {
                    (function (test, num) {
                        if (!(test.check instanceof Array)) {
                            test.check = [test.check];
                        }
                        it("#" + num + " should return " + test.expect + " models order", function () {
                            var query = new Query_1.default()
                                .where(test.filter)
                                .orderBy(test.sorting)
                                .offset(test.offset)
                                .limit(test.limit);
                            return source.query(query).then(function (ds) {
                                var modelNum = 0;
                                ds.getAll().each(function (model) {
                                    var need = test.expect[modelNum];
                                    var have;
                                    if (test.check.length > 1) {
                                        have = [];
                                        for (var j = 0; j < test.check.length; j++) {
                                            have.push(model.get(test.check[j]));
                                        }
                                        have = have.join('+');
                                    }
                                    else {
                                        have = model.get(test.check[0]);
                                    }
                                    chai_1.assert.strictEqual(have, need, "On model number " + modelNum);
                                    modelNum++;
                                });
                            });
                        });
                    })(tests[i], 1 + i);
                }
            });
        });
        describe('.move()', function () {
            it('should move 5 to begin list', function () {
                return source.move([existsId], '6', { position: 'before' }).then(function () {
                    chai_1.assert.strictEqual(ls.getItem('i')[4], existsId);
                });
            });
            it('should move 6 before 5', function () {
                return source.move(['6'], existsId, { position: 'before' }).then(function () {
                    chai_1.assert.strictEqual(ls.getItem('i')[4], '6');
                    chai_1.assert.strictEqual(ls.getItem('i')[5], existsId);
                });
            });
            it('should move 6 after 5', function () {
                return source.move(['6'], existsId, { position: 'after' }).then(function () {
                    chai_1.assert.strictEqual(ls.getItem('i')[4], existsId);
                    chai_1.assert.strictEqual(ls.getItem('i')[5], '6');
                });
            });
            it('should move 6 to end list', function () {
                return source.move(['6'], '3', { position: 'after' }).then(function () {
                    chai_1.assert.strictEqual(ls.getItem('i')[3], '6');
                });
            });
            it('should move 6 to end list', function () {
                return source.move(['6'], '3', { position: 'after' }).then(function () {
                    chai_1.assert.strictEqual(ls.getItem('i')[3], '6');
                });
            });
            it('should move 6 to end list', function () {
                return source.move(['6'], '3', { position: 'after' }).then(function () {
                    chai_1.assert.strictEqual(ls.getItem('i')[3], '6');
                });
            });
            it('should move 6 to end list with use before', function () {
                return source.move('6', '3', { before: false }).then(function () {
                    chai_1.assert.strictEqual(ls.getItem('i')[3], '6');
                });
            });
            it('should move 6 before 3 with use before', function () {
                return source.move(['6', '5'], '3', { before: true }).then(function () {
                    chai_1.assert.strictEqual(ls.getItem('i')[2], '6');
                });
            });
            it('should move row with ids 6 on 3', function () {
                return source.move('6', '3', { position: 'on', parentProperty: 'title' }).then(function () {
                    chai_1.assert.equal(ls.getItem('d' + '6').title, 'Neptune');
                });
            });
            it('should move row with ids 3 on root', function () {
                return source.move('6', null, { position: 'on', parentProperty: 'title' }).then(function () {
                    chai_1.assert.equal(ls.getItem('d' + '6').title, null);
                });
            });
        });
        context('when use recordset as data', function () {
            var recordset;
            var source6;
            beforeEach(function () {
                recordset = new RecordSet_1.default({
                    keyProperty: 'id',
                    rawData: mock
                });
                source6 = new LocalSession_1.default({
                    prefix: 'mdl_solarsystem_6',
                    adapter: 'Types/entity:adapter.RecordSet',
                    keyProperty: 'id',
                    data: recordset
                });
            });
            afterEach(function () {
                ls6.clear();
            });
            describe('.create()', function () {
                it('should return an empty model', function () {
                    return source6.create().then(function (model) {
                        chai_1.assert.instanceOf(model, Model_1.default);
                    });
                });
                it('should return an model with initial data', function () {
                    var model = new Model_1.default({
                        rawData: {
                            a: 1,
                            b: true
                        }
                    });
                    return source6.create(model).then(function (model) {
                        var a = model.get('a');
                        chai_1.assert.strictEqual(a, 1);
                        chai_1.assert.strictEqual(model.get('b'), true);
                    });
                });
            });
            describe('.read()', function () {
                context('when the model is exists', function () {
                    it('should return the valid model', function () {
                        return source6.read(existsId).then(function (model) {
                            chai_1.assert.instanceOf(model, Model_1.default);
                            chai_1.assert.strictEqual(model.getId(), existsId);
                        });
                    });
                });
                context('when the model isn\'t exists', function () {
                    it('should return an error', function () {
                        return source6.read(notExistsId).then(function () {
                            throw new Error('That\'s not error');
                        }, function (err) {
                            chai_1.assert.instanceOf(err, Error);
                        });
                    });
                });
            });
            describe('.update()', function () {
                context('when the model was stored', function () {
                    it('should update the model', function () {
                        return source6.read(existsId).then(function (model) {
                            model.set('Фамилия', 'Петров');
                            return source6.update(model).then(function (success) {
                                chai_1.assert.isTrue(!!success);
                                return source6.read(existsId).then(function (model) {
                                    chai_1.assert.equal(model.get('Фамилия'), 'Петров');
                                });
                            });
                        });
                    });
                });
                context('when the model was not stored', function () {
                    var testModel = function (success, model, length) {
                        chai_1.assert.isTrue(!!success);
                        chai_1.assert.strictEqual(length, ls6.getItem('k'));
                        return source6.read(model.getId()).then(function (modelToo) {
                            chai_1.assert.strictEqual(model.get('Фамилия'), modelToo.get('Фамилия'));
                        });
                    };
                    it('should create the model by 1st way', function () {
                        var oldLength = ls6.getItem('k');
                        return source6.create(new Model_1.default({
                            adapter: recordset.getAdapter()
                        })).then(function (model) {
                            model.set('Фамилия', 'Козлов');
                            return source6.update(model).then(function (success) {
                                return testModel(success, model, 1 + oldLength);
                            });
                        });
                    });
                    it('should create the model by 2nd way', function () {
                        var oldLength = recordset.getCount();
                        var model = new Model_1.default({
                            rawData: new Model_1.default(),
                            keyProperty: 'Ид',
                            adapter: 'Types/entity:adapter.RecordSet'
                        });
                        model.set('Фамилия', 'Овечкин');
                        return source6.update(model).then(function (success) {
                            return testModel(success, model, 1 + oldLength);
                        });
                    });
                    it('should nod clone row when it have key 0', function () {
                        var source7 = new LocalSession_1.default({
                            prefix: 'mdl_solarsystem_7',
                            data: [{ id: 0, name: 'name' }],
                            keyProperty: 'id'
                        });
                        var model = new Model_1.default({
                            rawData: { id: 0, name: '11' },
                            keyProperty: 'id'
                        });
                        source7.update(model);
                        chai_1.assert.equal(ls7.getItem('i').length, 1);
                    });
                });
            });
            describe('.destroy()', function () {
                context('when the model is exists', function () {
                    it('should return success', function () {
                        return source6.destroy(existsId).then(function (success) {
                            chai_1.assert.isTrue(!!success);
                        });
                    });
                    it('should really delete the model', function () {
                        return source6.destroy(existsId).then(function () {
                            return source6.read(existsId).then(function () {
                                throw new Error('The model still exists');
                            }, function (err) {
                                chai_1.assert.instanceOf(err, Error);
                            });
                        });
                    });
                    it('should decrease the size of raw data', function () {
                        var targetLength = ls6.getItem('k') - 1;
                        return source6.destroy(existsId).then(function () {
                            chai_1.assert.strictEqual(targetLength, ls6.getItem('k'));
                        });
                    });
                });
                context('when the model isn\'t exists', function () {
                    it('should return an error', function () {
                        return source6.destroy(notExistsId).then(function () {
                            throw new Error('An error expected');
                        }, function (err) {
                            chai_1.assert.instanceOf(err, Error);
                        });
                    });
                });
            });
            describe('.merge()', function () {
                context('when the model isn\'t exists', function () {
                    it('should return an error', function () {
                        return source6.merge(notExistsId, existsId).then(function () {
                            throw new Error('An error expected');
                        }, function (err) {
                            chai_1.assert.instanceOf(err, Error);
                        });
                    });
                    it('should return an error', function () {
                        return source6.merge(existsId, notExistsId).then(function () {
                            throw new Error('An error expected');
                        }, function (err) {
                            chai_1.assert.instanceOf(err, Error);
                        });
                    });
                });
                it('should merge models', function () {
                    return source6.merge(existsId, existsId2).then(function () {
                        return source6.read(existsId).then(function () {
                            return source6.read(existsId2).then(function () {
                                throw new Error('Exists extention model.');
                            }, function (err) {
                                chai_1.assert.instanceOf(err, Error);
                            });
                        });
                    });
                });
            });
            describe('.copy()', function () {
                it('should copy model', function () {
                    var oldLength = ls6.getItem('k');
                    return source6.copy(existsId).then(function () {
                        chai_1.assert.strictEqual(ls6.getItem('k'), 1 + oldLength);
                    });
                });
            });
            describe('.query()', function () {
                it('should return a valid dataset', function () {
                    var query = new Query_1.default();
                    return source6.query(query).then(function (ds) {
                        chai_1.assert.instanceOf(ds, DataSet_1.default);
                        chai_1.assert.strictEqual(ds.getAll().getCount(), ls6.getItem('k'));
                    });
                });
                it('should work with no query', function () {
                    return source6.query().then(function (ds) {
                        chai_1.assert.instanceOf(ds, DataSet_1.default);
                        chai_1.assert.strictEqual(ds.getAll().getCount(), ls6.getItem('k'));
                    });
                });
                it('should work if query select no items', function () {
                    var query = new Query_1.default();
                    query.where({ someField: 'WithValueThatWillNotBeFind' });
                    return source6.query(query).then(function (ds) {
                        var itemsProperty = ds.getItemsProperty();
                        var property = ds.getProperty(itemsProperty);
                        chai_1.assert.instanceOf(property, RecordSet_1.default);
                    });
                });
                it('should return a list instance of injected module', function () {
                    var MyList = coreExtend.extend(List_1.default, {});
                    source6.setListModule(MyList);
                    return source6.query().then(function (ds) {
                        chai_1.assert.instanceOf(ds.getAll(), MyList);
                    });
                });
                it('should return a model instance of injected module', function () {
                    var MyModel = coreExtend.extend(Model_1.default, {});
                    source6.setModel(MyModel);
                    return source6.query().then(function (ds) {
                        chai_1.assert.instanceOf(ds.getAll().at(0), MyModel);
                    });
                });
                it('should keep property total', function () {
                    return source6.query(new Query_1.default().limit(2)).then(function (ds) {
                        chai_1.assert.instanceOf(ds, DataSet_1.default);
                        chai_1.assert.strictEqual(ds.getMetaData().total, 2);
                    });
                });
            });
        });
    });
});
