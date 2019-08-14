define(["require", "exports", "chai", "Types/di", "Types/_source/SbisService", "Types/_source/DataSet", "Types/_source/Query", "Types/_entity/Model", "Types/_collection/RecordSet", "Types/_collection/List", "Core/Deferred", "Core/core-extend", "Types/_entity/adapter/Sbis"], function (require, exports, chai_1, di, SbisService_1, DataSet_1, Query_1, Model_1, RecordSet_1, List_1, Deferred, coreExtend) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // tslint:disable-next-line:ban-comma-operator
    var global = (0, eval)('this');
    var DeferredCanceledError = global.DeferredCanceledError;
    describe('Types/_source/SbisService', function () {
        var provider = 'Types/source:provider.SbisBusinessLogic';
        var meta = [
            { n: 'LastName', t: 'Строка' },
            { n: 'FirstName', t: 'Строка' },
            { n: 'MiddleName', t: 'Строка' },
            { n: '@ID', t: 'Число целое' },
            { n: 'Position', t: 'Строка' },
            { n: 'Hired', t: 'Логическое' }
        ];
        // Mock of Types/_source/provider/SbisBusinessLogic
        var SbisBusinessLogic = (function () {
            var lastId = 0;
            var existsId = 7;
            var existsTooId = 987;
            var notExistsId = 99;
            var textId = 'uuid';
            var Mock = coreExtend({
                _cfg: {},
                _$binding: {},
                constructor: function (cfg) {
                    this._cfg = cfg;
                },
                call: function (method, args) {
                    var _this = this;
                    var def = new Deferred();
                    var idPosition = 3;
                    var error = '';
                    var data;
                    switch (this._cfg.endpoint.contract) {
                        case 'USP':
                        case 'Goods':
                            switch (method) {
                                case 'Создать':
                                    data = {
                                        _type: 'record',
                                        d: [
                                            '',
                                            '',
                                            '',
                                            ++lastId,
                                            '',
                                            false
                                        ],
                                        s: meta
                                    };
                                    break;
                                case 'Прочитать':
                                    if (args.ИдО === existsId) {
                                        data = {
                                            _type: 'record',
                                            d: [
                                                'Smith',
                                                'John',
                                                'Levitt',
                                                existsId,
                                                'Engineer',
                                                true
                                            ],
                                            s: meta
                                        };
                                    }
                                    else {
                                        error = 'Model is not found';
                                    }
                                    break;
                                case 'Записать':
                                    if (args.Запись) {
                                        if (args.Запись.d && args.Запись.d[idPosition]) {
                                            data = args.Запись.d[idPosition];
                                        }
                                        else {
                                            data = 99;
                                        }
                                    }
                                    else {
                                        data = true;
                                    }
                                    break;
                                case 'Goods.Удалить':
                                case 'Удалить':
                                    if (args.ИдО === existsId ||
                                        args.ИдО.indexOf(String(existsId)) !== -1) {
                                        data = existsId;
                                    }
                                    else if (args.ИдО === textId ||
                                        args.ИдО.indexOf(String(textId)) !== -1) {
                                        data = textId;
                                    }
                                    else if (args.ИдО === existsTooId ||
                                        args.ИдО.indexOf(String(existsTooId)) !== -1) {
                                        data = existsTooId;
                                    }
                                    else {
                                        error = 'Model is not found';
                                    }
                                    break;
                                case 'Список':
                                    data = {
                                        _type: 'recordset',
                                        d: [
                                            [
                                                'Smith',
                                                'John',
                                                'Levitt',
                                                existsId,
                                                'Engineer',
                                                true
                                            ],
                                            [
                                                'Cameron',
                                                'David',
                                                'William Donald',
                                                1 + existsId,
                                                'Prime minister',
                                                true
                                            ]
                                        ],
                                        s: meta
                                    };
                                    break;
                                case 'Sync':
                                case 'ВставитьДо':
                                case 'ВставитьПосле':
                                case 'Dummy':
                                case 'IndexNumber.Move':
                                case 'Product.Mymove':
                                case 'ПорядковыйНомер.ВставитьДо':
                                case 'ПорядковыйНомер.ВставитьПосле':
                                    break;
                                default:
                                    error = "Method \"" + method + "\" is undefined";
                            }
                            break;
                        case 'ПорядковыйНомер':
                            switch (method) {
                                case 'ВставитьДо':
                                case 'ВставитьПосле':
                                    break;
                            }
                            break;
                        case 'IndexNumber.Move':
                            break;
                        default:
                            error = "Contract \"" + this._cfg.endpoint.contract + "\" is not found";
                    }
                    setTimeout(function () {
                        Mock.lastRequest = {
                            cfg: _this._cfg,
                            method: method,
                            args: args
                        };
                        if (error) {
                            return def.errback(error);
                        }
                        def.callback(data);
                    }, 0);
                    Mock.lastDeferred = def;
                    return def;
                }
            });
            Mock.existsId = existsId;
            Mock.notExistsId = notExistsId;
            return Mock;
        })();
        var getSampleModel = function () {
            var model = new Model_1.default({
                adapter: 'Types/entity:adapter.Sbis',
                idProperty: '@ID'
            });
            model.addField({ name: '@ID', type: 'integer' }, undefined, 1);
            model.addField({ name: 'LastName', type: 'string' }, undefined, 'tst');
            return model;
        };
        var getSampleMeta = function () {
            return {
                a: 1,
                b: 2,
                c: 3
            };
        };
        var testArgIsModel = function (arg, model) {
            chai_1.assert.strictEqual(arg._type, 'record');
            chai_1.assert.deepEqual(arg.d, model.getRawData().d);
            chai_1.assert.deepEqual(arg.s, model.getRawData().s);
        };
        var testArgIsDataSet = function (arg, dataSet) {
            chai_1.assert.strictEqual(arg._type, 'recordset');
            chai_1.assert.deepEqual(arg.d, dataSet.getRawData().d);
            chai_1.assert.deepEqual(arg.s, dataSet.getRawData().s);
        };
        var service;
        beforeEach(function () {
            SbisBusinessLogic.lastRequest = {};
            SbisBusinessLogic.lastDeferred = null;
            // Replace of standard with mock
            di.register(provider, SbisBusinessLogic);
            service = new SbisService_1.default({
                endpoint: 'USP'
            });
        });
        afterEach(function () {
            service = undefined;
        });
        describe('.create()', function () {
            context('when the service is exists', function () {
                it('should return an empty model', function () {
                    return service.create().then(function (model) {
                        chai_1.assert.isTrue(model instanceof Model_1.default);
                        chai_1.assert.isTrue(model.getId() > 0);
                        chai_1.assert.strictEqual(model.get('LastName'), '');
                    });
                });
                it('should generate a valid request', function () {
                    return service.create().then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.isNull(args.ИмяМетода);
                        chai_1.assert.strictEqual(args.Фильтр.d[0], true, 'Wrong value for argument Фильтр.ВызовИзБраузера');
                        chai_1.assert.strictEqual(args.Фильтр.s[0].n, 'ВызовИзБраузера', 'Wrong name for argument Фильтр.ВызовИзБраузера');
                        chai_1.assert.strictEqual(args.Фильтр.s[0].t, 'Логическое', 'Wrong type for argument Фильтр.ВызовИзБраузера');
                    });
                });
                it('should generate request with additional fields from record', function () {
                    var model = getSampleModel();
                    return service.create(model).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        testArgIsModel(args.Фильтр, model);
                    });
                });
                it('should generate request with additional fields from object', function () {
                    var meta = getSampleMeta();
                    return service.create(meta).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        var fields = Object.keys(meta);
                        meta.ВызовИзБраузера = true;
                        fields.push('ВызовИзБраузера');
                        chai_1.assert.strictEqual(args.Фильтр.s.length, fields.length);
                        for (var i = 0; i < args.Фильтр.d.length; i++) {
                            chai_1.assert.strictEqual(args.Фильтр.s[i].n, fields[i]);
                            chai_1.assert.strictEqual(args.Фильтр.d[i], meta[fields[i]]);
                        }
                    });
                });
                it('should generate request with Date field', function () {
                    var date = new Date();
                    if (!date.setSQLSerializationMode) {
                        return;
                    }
                    date.setSQLSerializationMode(Date.SQL_SERIALIZE_MODE_DATE);
                    var meta = { foo: date };
                    return service.create(meta).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Фильтр.s[0].n, 'foo');
                        chai_1.assert.strictEqual(args.Фильтр.s[0].t, 'Дата');
                    });
                });
                it('should generate request with Time field', function () {
                    var date = new Date();
                    if (!date.setSQLSerializationMode) {
                        return;
                    }
                    date.setSQLSerializationMode(Date.SQL_SERIALIZE_MODE_TIME);
                    var meta = { foo: date };
                    return service.create(meta).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Фильтр.s[0].n, 'foo');
                        chai_1.assert.strictEqual(args.Фильтр.s[0].t, 'Время');
                    });
                });
                it('should generate request with custom method name in the filter', function () {
                    var service = new SbisService_1.default({
                        endpoint: 'USP',
                        binding: {
                            format: 'ПрочитатьФормат'
                        }
                    });
                    return service.create().then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.ИмяМетода, 'ПрочитатьФормат');
                    });
                });
                it('should cancel the inner request', function () {
                    var def = service.create();
                    var lastDef = SbisBusinessLogic.lastDeferred;
                    def.cancel();
                    chai_1.assert.instanceOf(lastDef.getResult(), DeferredCanceledError);
                });
                it('should sort fields in filter', function () {
                    var filter = {
                        Раздел: 1,
                        Тип: 3,
                        'Раздел@': true,
                        Демо: true,
                        Раздел$: true
                    };
                    return service.create(filter).then(function () {
                        var s = SbisBusinessLogic.lastRequest.args.Фильтр.s;
                        var sortNames = s.map(function (i) { return i.n; }).sort();
                        for (var i = 0; i < sortNames.length; i++) {
                            chai_1.assert.strictEqual(s[i].n, sortNames[i]);
                        }
                    });
                });
            });
            context('when the service isn\'t exists', function () {
                it('should return an error', function () {
                    var service = new SbisService_1.default({
                        endpoint: 'Unknown'
                    });
                    return service.create().then(function (err) {
                        chai_1.assert.instanceOf(err, Error);
                    }, function (err) {
                        chai_1.assert.instanceOf(err, Error);
                    });
                });
            });
        });
        describe('.read()', function () {
            context('when the service is exists', function () {
                context('and the model is exists', function () {
                    it('should return valid model', function () {
                        return service.read(SbisBusinessLogic.existsId).then(function (model) {
                            chai_1.assert.isTrue(model instanceof Model_1.default);
                            chai_1.assert.strictEqual(model.getId(), SbisBusinessLogic.existsId);
                            chai_1.assert.strictEqual(model.get('LastName'), 'Smith');
                        });
                    });
                    it('should generate a valid request', function () {
                        var service = new SbisService_1.default({
                            endpoint: 'USP',
                            binding: {
                                format: 'Формат'
                            }
                        });
                        return service.read(SbisBusinessLogic.existsId).then(function () {
                            var args = SbisBusinessLogic.lastRequest.args;
                            chai_1.assert.strictEqual(args.ИмяМетода, 'Формат');
                            chai_1.assert.strictEqual(args.ИдО, SbisBusinessLogic.existsId);
                        });
                    });
                    it('should generate request with additional fields from record', function () {
                        return service.read(SbisBusinessLogic.existsId, getSampleModel()).then(function () {
                            var args = SbisBusinessLogic.lastRequest.args;
                            testArgIsModel(args.ДопПоля, getSampleModel());
                        });
                    });
                    it('should generate request with additional fields from object', function () {
                        return service.read(SbisBusinessLogic.existsId, getSampleMeta()).then(function () {
                            var args = SbisBusinessLogic.lastRequest.args;
                            chai_1.assert.deepEqual(args.ДопПоля, getSampleMeta());
                        });
                    });
                });
                context('and the model isn\'t exists', function () {
                    it('should return an error', function () {
                        return service.read(SbisBusinessLogic.notExistsId).then(function (err) {
                            chai_1.assert.instanceOf(err, Error);
                        }, function (err) {
                            chai_1.assert.instanceOf(err, Error);
                        });
                    });
                });
            });
            context('when the service isn\'t exists', function () {
                it('should return an error', function () {
                    var service = new SbisService_1.default({
                        endpoint: 'Unknown'
                    });
                    return service.read(SbisBusinessLogic.existsId).then(function (err) {
                        chai_1.assert.instanceOf(err, Error);
                    }, function (err) {
                        chai_1.assert.instanceOf(err, Error);
                    });
                });
            });
        });
        describe('.update()', function () {
            context('when the service is exists', function () {
                context('and the model was stored', function () {
                    it('should update the model', function () {
                        return service.read(SbisBusinessLogic.existsId).then(function (model) {
                            model.set('LastName', 'Cameron');
                            return service.update(model).then(function (success) {
                                chai_1.assert.isTrue(success > 0);
                                chai_1.assert.isFalse(model.isChanged());
                                chai_1.assert.strictEqual(model.get('LastName'), 'Cameron');
                            });
                        });
                    });
                });
                context('and the model was not stored', function () {
                    var testModel = function (success, model) {
                        chai_1.assert.isTrue(success > 0);
                        chai_1.assert.isFalse(model.isChanged());
                        chai_1.assert.isTrue(model.getId() > 0);
                    };
                    it('should create the model by 1st way', function () {
                        var service = new SbisService_1.default({
                            endpoint: 'USP',
                            keyProperty: '@ID'
                        });
                        return service.create().then(function (model) {
                            return service.update(model).then(function (success) {
                                testModel(success, model);
                            });
                        });
                    });
                    it('should create the model by 2nd way', function () {
                        var service = new SbisService_1.default({
                            endpoint: 'USP',
                            keyProperty: '@ID'
                        });
                        var model = getSampleModel();
                        return service.update(model).then(function (success) {
                            testModel(success, model);
                        });
                    });
                });
                it('should generate a valid request', function () {
                    var service = new SbisService_1.default({
                        endpoint: 'USP',
                        binding: {
                            format: 'Формат'
                        }
                    });
                    return service.read(SbisBusinessLogic.existsId).then(function (model) {
                        return service.update(model).then(function () {
                            var args = SbisBusinessLogic.lastRequest.args;
                            testArgIsModel(args.Запись, model);
                        });
                    });
                });
                it('should generate request with additional fields from record', function () {
                    var meta = new Model_1.default({
                        adapter: 'Types/entity:adapter.Sbis'
                    });
                    meta.addField({ name: 'Тест', type: 'integer' }, undefined, 7);
                    return service.update(getSampleModel(), meta).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        testArgIsModel(args.ДопПоля, meta);
                    });
                });
                it('should generate request with additional fields from object', function () {
                    return service.update(getSampleModel(), getSampleMeta()).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.deepEqual(args.ДопПоля, getSampleMeta());
                    });
                });
                it('should cancel the inner request', function () {
                    var model = getSampleModel();
                    var def = service.update(model);
                    var lastDef = SbisBusinessLogic.lastDeferred;
                    def.cancel();
                    chai_1.assert.instanceOf(lastDef.getResult(), DeferredCanceledError);
                });
            });
            context('when the service isn\'t exists', function () {
                it('should return an error', function () {
                    return service.create().then(function (model) {
                        var service = new SbisService_1.default({
                            endpoint: 'Unknown'
                        });
                        return service.update(model).then(function (err) {
                            chai_1.assert.instanceOf(err, Error);
                        }, function (err) {
                            chai_1.assert.instanceOf(err, Error);
                        });
                    });
                });
            });
            context('when is updating few rows', function () {
                it('should accept RecordSet', function () {
                    var rs = new RecordSet_1.default({
                        rawData: {
                            _type: 'recordset',
                            d: [[
                                    'Smith',
                                    'John',
                                    'Levitt',
                                    1,
                                    'Engineer',
                                    true
                                ]],
                            s: meta
                        },
                        adapter: 'Types/entity:adapter.Sbis'
                    });
                    var service = new SbisService_1.default({
                        endpoint: 'Goods'
                    });
                    return service.update(rs).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.isObject(args.Записи);
                    });
                });
                it('should call updateBatch', function () {
                    var RecordState = Model_1.default.RecordState;
                    var format = [
                        { name: 'id', type: 'integer' },
                        { name: 'name', type: 'string' }
                    ];
                    var rs = new RecordSet_1.default({
                        format: format,
                        adapter: 'Types/entity:adapter.Sbis'
                    });
                    var service = new SbisService_1.default({
                        endpoint: 'Goods'
                    });
                    var binding = service.getBinding();
                    var record;
                    var addRecord = function (data) {
                        record = new Model_1.default({
                            format: rs.getFormat(),
                            adapter: rs.getAdapter()
                        });
                        record.set(data);
                        rs.add(record);
                    };
                    binding.updateBatch = 'Sync';
                    service.setBinding(binding);
                    addRecord({ id: 1, name: 'sample1' });
                    addRecord({ id: 2, name: 'sample2' });
                    addRecord({ id: 3, name: 'sample3' });
                    rs.acceptChanges();
                    addRecord({ id: 4, name: 'sample4' });
                    rs.at(0).set('name', 'foo');
                    rs.at(1).setState(RecordState.DELETED);
                    return service.update(rs).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.equal(args.changed.d.length, 1);
                        chai_1.assert.equal(args.changed.d[0][0], 1);
                        chai_1.assert.equal(args.added.d.length, 1);
                        chai_1.assert.equal(args.added.d[0][0], 4);
                        chai_1.assert.deepEqual(args.removed, [2]);
                    });
                });
            });
        });
        describe('.destroy()', function () {
            context('when the service is exists', function () {
                context('and the model is exists', function () {
                    it('should return success', function () {
                        return service.destroy(SbisBusinessLogic.existsId).then(function (success) {
                            chai_1.assert.strictEqual(success, SbisBusinessLogic.existsId);
                        });
                    });
                });
                context('and the model isn\'t exists', function () {
                    it('should return an error', function () {
                        return service.destroy(SbisBusinessLogic.notExistsId).then(function (err) {
                            chai_1.assert.instanceOf(err, Error);
                        }, function (err) {
                            chai_1.assert.instanceOf(err, Error);
                        });
                    });
                });
                it('should delete a few records', function () {
                    return service.destroy([0, SbisBusinessLogic.existsId, 1]).then(function (success) {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.equal(args.ИдО[0], 0);
                        chai_1.assert.equal(args.ИдО[1], SbisBusinessLogic.existsId);
                        chai_1.assert.equal(args.ИдО[2], 1);
                        chai_1.assert.equal(success[0], SbisBusinessLogic.existsId);
                    });
                });
                it('should delete records by a composite key', function () {
                    var anId = 987;
                    return service.destroy([SbisBusinessLogic.existsId + ',USP', anId + ',Goods']).then(function (success) {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.equal(args.ИдО, anId);
                        chai_1.assert.equal(success[0], SbisBusinessLogic.existsId);
                        chai_1.assert.equal(success[1], anId);
                    });
                });
                it('should handle not a composite key', function () {
                    var notABlName = SbisBusinessLogic.existsId + ',(USP)';
                    return service.destroy([notABlName]).addCallbacks(function () {
                        throw new Error('It shouldn\'t be a successful call');
                    }, function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.equal(args.ИдО, notABlName);
                    });
                });
                it('should delete records by text key', function () {
                    var anId = 'uuid';
                    return service.destroy([anId]).then(function (success) {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.ИдО[0], anId);
                        chai_1.assert.strictEqual(success[0], anId);
                    });
                });
                it('should generate a valid request', function () {
                    return service.destroy(SbisBusinessLogic.existsId).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.equal(args.ИдО[0], SbisBusinessLogic.existsId);
                    });
                });
                it('should generate request with additional fields from record', function () {
                    return service.destroy(SbisBusinessLogic.existsId, getSampleModel()).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        testArgIsModel(args.ДопПоля, getSampleModel());
                    });
                });
                it('should generate request with additional fields from object', function () {
                    return service.destroy(SbisBusinessLogic.existsId, getSampleMeta()).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.deepEqual(args.ДопПоля, getSampleMeta());
                    });
                });
            });
            context('when the service isn\'t exists', function () {
                it('should return an error', function () {
                    var service = new SbisService_1.default({
                        endpoint: 'Unknown'
                    });
                    return service.destroy(SbisBusinessLogic.existsId).then(function (err) {
                        chai_1.assert.instanceOf(err, Error);
                    }, function (err) {
                        chai_1.assert.instanceOf(err, Error);
                    });
                });
            });
        });
        describe('.query()', function () {
            context('when the service is exists', function () {
                it('should return a valid dataset', function () {
                    return service.query(new Query_1.default()).then(function (ds) {
                        chai_1.assert.isTrue(ds instanceof DataSet_1.default);
                        chai_1.assert.strictEqual(ds.getAll().getCount(), 2);
                    });
                });
                it('should take key property for dataset from raw data', function () {
                    return service.query(new Query_1.default()).then(function (ds) {
                        chai_1.assert.strictEqual(ds.getKeyProperty(), '@ID');
                    });
                });
                it('should work with no query', function () {
                    return service.query().then(function (ds) {
                        chai_1.assert.isTrue(ds instanceof DataSet_1.default);
                        chai_1.assert.strictEqual(ds.getAll().getCount(), 2);
                    });
                });
                it('should return a list instance of injected module', function () {
                    var MyList = coreExtend.extend(List_1.default, {});
                    service.setListModule(MyList);
                    return service.query().then(function (ds) {
                        chai_1.assert.isTrue(ds.getAll() instanceof MyList);
                    });
                });
                it('should return a model instance of injected module', function () {
                    var MyModel = coreExtend.extend(Model_1.default, {});
                    service.setModel(MyModel);
                    return service.query().then(function (ds) {
                        chai_1.assert.isTrue(ds.getAll().at(0) instanceof MyModel);
                    });
                });
                it('should generate a valid request', function () {
                    var recData = {
                        d: [1],
                        s: [{ n: 'Число целое' }]
                    };
                    var rsData = {
                        d: [[1], [2]],
                        s: [{ n: 'Число целое' }]
                    };
                    var query = new Query_1.default()
                        .from('Goods')
                        .where({
                        id: 5,
                        enabled: true,
                        title: 'abc*',
                        path: [1, 2, 3],
                        obj: { a: 1, b: 2 },
                        rec: new Model_1.default({
                            adapter: 'Types/entity:adapter.Sbis',
                            rawData: recData
                        }),
                        rs: new RecordSet_1.default({
                            adapter: 'Types/entity:adapter.Sbis',
                            rawData: rsData
                        })
                    })
                        .orderBy({
                        id: false,
                        enabled: true
                    })
                        .offset(100)
                        .limit(33);
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Фильтр.d[1], 5);
                        chai_1.assert.strictEqual(args.Фильтр.s[1].n, 'id');
                        chai_1.assert.strictEqual(args.Фильтр.s[1].t, 'Число целое');
                        chai_1.assert.isTrue(args.Фильтр.d[0]);
                        chai_1.assert.strictEqual(args.Фильтр.s[0].n, 'enabled');
                        chai_1.assert.strictEqual(args.Фильтр.s[0].t, 'Логическое');
                        chai_1.assert.strictEqual(args.Фильтр.d[6], 'abc*');
                        chai_1.assert.strictEqual(args.Фильтр.s[6].n, 'title');
                        chai_1.assert.strictEqual(args.Фильтр.s[6].t, 'Строка');
                        chai_1.assert.deepEqual(args.Фильтр.d[3], [1, 2, 3]);
                        chai_1.assert.strictEqual(args.Фильтр.s[3].n, 'path');
                        chai_1.assert.strictEqual(args.Фильтр.s[3].t.n, 'Массив');
                        chai_1.assert.strictEqual(args.Фильтр.s[3].t.t, 'Число целое');
                        chai_1.assert.deepEqual(args.Фильтр.d[2], { a: 1, b: 2 });
                        chai_1.assert.strictEqual(args.Фильтр.s[2].n, 'obj');
                        chai_1.assert.strictEqual(args.Фильтр.s[2].t, 'JSON-объект');
                        chai_1.assert.deepEqual(args.Фильтр.d[4].d, recData.d);
                        chai_1.assert.deepEqual(args.Фильтр.d[4].s, recData.s);
                        chai_1.assert.strictEqual(args.Фильтр.s[4].n, 'rec');
                        chai_1.assert.strictEqual(args.Фильтр.s[4].t, 'Запись');
                        chai_1.assert.deepEqual(args.Фильтр.d[5].d, rsData.d);
                        chai_1.assert.deepEqual(args.Фильтр.d[5].s, rsData.s);
                        chai_1.assert.strictEqual(args.Фильтр.s[5].n, 'rs');
                        chai_1.assert.strictEqual(args.Фильтр.s[5].t, 'Выборка');
                        chai_1.assert.strictEqual(args.Сортировка.d[0][1], 'id');
                        chai_1.assert.isFalse(args.Сортировка.d[0][2]);
                        chai_1.assert.isTrue(args.Сортировка.d[0][0]);
                        chai_1.assert.strictEqual(args.Сортировка.d[1][1], 'enabled');
                        chai_1.assert.isTrue(args.Сортировка.d[1][2]);
                        chai_1.assert.isFalse(args.Сортировка.d[1][0]);
                        chai_1.assert.strictEqual(args.Сортировка.s[0].n, 'l');
                        chai_1.assert.strictEqual(args.Сортировка.s[1].n, 'n');
                        chai_1.assert.strictEqual(args.Сортировка.s[2].n, 'o');
                        chai_1.assert.strictEqual(args.Навигация.d[2], 3);
                        chai_1.assert.strictEqual(args.Навигация.s[2].n, 'Страница');
                        chai_1.assert.strictEqual(args.Навигация.d[1], 33);
                        chai_1.assert.strictEqual(args.Навигация.s[1].n, 'РазмерСтраницы');
                        chai_1.assert.isTrue(args.Навигация.d[0]);
                        chai_1.assert.strictEqual(args.Навигация.s[0].n, 'ЕстьЕще');
                        chai_1.assert.strictEqual(args.ДопПоля.length, 0);
                    });
                });
                it('should generate request with filter contains only given data', function () {
                    var MyModel = coreExtend.extend(Model_1.default, {
                        $protected: {
                            _options: {
                                rawData: {
                                    a: 1
                                }
                            }
                        }
                    });
                    var query = new Query_1.default();
                    service.setModel(MyModel);
                    query.where({
                        b: 2
                    });
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Фильтр.s.length, 1);
                        chai_1.assert.strictEqual(args.Фильтр.s[0].n, 'b');
                    });
                });
                it('should generate request with an empty filter', function () {
                    var query = new Query_1.default();
                    query.where({});
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Фильтр.s.length, 0);
                        chai_1.assert.strictEqual(args.Фильтр.d.length, 0);
                    });
                });
                it('should generate request with given null policy', function () {
                    var query = new Query_1.default();
                    query.orderBy('id', true, true);
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Сортировка.s.length, 3);
                        chai_1.assert.strictEqual(args.Сортировка.s[0].n, 'l');
                        chai_1.assert.strictEqual(args.Сортировка.s[1].n, 'n');
                        chai_1.assert.strictEqual(args.Сортировка.s[2].n, 'o');
                        chai_1.assert.strictEqual(args.Сортировка.d.length, 1);
                        chai_1.assert.strictEqual(args.Сортировка.d[0].length, 3);
                        chai_1.assert.strictEqual(args.Сортировка.d[0][0], true);
                        chai_1.assert.strictEqual(args.Сортировка.d[0][1], 'id');
                        chai_1.assert.strictEqual(args.Сортировка.d[0][2], true);
                    });
                });
                it('should generate request with expand "None" mode', function () {
                    var query = new Query_1.default();
                    query.meta({
                        expand: Query_1.ExpandMode.None
                    });
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Фильтр.s.length, 1);
                        chai_1.assert.strictEqual(args.Фильтр.s[0].n, 'Разворот');
                        chai_1.assert.strictEqual(args.Фильтр.d[0], 'Без разворота');
                    });
                });
                it('should generate request with expand "Nodes" mode', function () {
                    var query = new Query_1.default();
                    query.meta({
                        expand: Query_1.ExpandMode.Nodes
                    });
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Фильтр.s.length, 2);
                        chai_1.assert.strictEqual(args.Фильтр.s[0].n, 'ВидДерева');
                        chai_1.assert.strictEqual(args.Фильтр.d[0], 'Только узлы');
                        chai_1.assert.strictEqual(args.Фильтр.s[1].n, 'Разворот');
                        chai_1.assert.strictEqual(args.Фильтр.d[1], 'С разворотом');
                    });
                });
                it('should generate request with expand "Leaves" mode', function () {
                    var query = new Query_1.default();
                    query.meta({
                        expand: Query_1.ExpandMode.Leaves
                    });
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Фильтр.s.length, 2);
                        chai_1.assert.strictEqual(args.Фильтр.s[0].n, 'ВидДерева');
                        chai_1.assert.strictEqual(args.Фильтр.d[0], 'Только листья');
                        chai_1.assert.strictEqual(args.Фильтр.s[1].n, 'Разворот');
                        chai_1.assert.strictEqual(args.Фильтр.d[1], 'С разворотом');
                    });
                });
                it('should generate request with expand "All" mode', function () {
                    var query = new Query_1.default();
                    query.meta({
                        expand: Query_1.ExpandMode.All
                    });
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Фильтр.s.length, 2);
                        chai_1.assert.strictEqual(args.Фильтр.s[0].n, 'ВидДерева');
                        chai_1.assert.strictEqual(args.Фильтр.d[0], 'Узлы и листья');
                        chai_1.assert.strictEqual(args.Фильтр.s[1].n, 'Разворот');
                        chai_1.assert.strictEqual(args.Фильтр.d[1], 'С разворотом');
                    });
                });
                it('should generate request with additional fields from query select', function () {
                    var query = new Query_1.default();
                    query.select(['Foo']);
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.deepEqual(args.ДопПоля, ['Foo']);
                    });
                });
                it('should generate request with null navigation and undefined limit', function () {
                    var query = new Query_1.default();
                    query.limit(undefined);
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.isNull(args.Навигация);
                    });
                });
                it('should generate request with null navigation and null limit', function () {
                    var query = new Query_1.default();
                    query.limit(null);
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.isNull(args.Навигация);
                    });
                });
                it('should generate request with offset type navigation by option', function () {
                    var service = new SbisService_1.default({
                        endpoint: 'USP',
                        options: {
                            navigationType: SbisService_1.default.NAVIGATION_TYPE.OFFSET
                        }
                    });
                    var query = new Query_1.default();
                    var offset = 15;
                    var limit = 50;
                    query
                        .offset(offset)
                        .limit(limit);
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Навигация.s[0].n, 'HasMore');
                        chai_1.assert.strictEqual(args.Навигация.d[0], true);
                        chai_1.assert.strictEqual(args.Навигация.s[1].n, 'Limit');
                        chai_1.assert.strictEqual(args.Навигация.d[1], limit);
                        chai_1.assert.strictEqual(args.Навигация.s[2].n, 'Offset');
                        chai_1.assert.strictEqual(args.Навигация.d[2], offset);
                    });
                });
                it('should generate request with offset type navigation by meta data', function () {
                    var service = new SbisService_1.default({
                        endpoint: 'USP'
                    });
                    var query = new Query_1.default();
                    var offset = 15;
                    var limit = 50;
                    query
                        .meta({ navigationType: Query_1.NavigationType.Offset })
                        .offset(offset)
                        .limit(limit);
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Навигация.s[0].n, 'HasMore');
                        chai_1.assert.strictEqual(args.Навигация.d[0], true);
                        chai_1.assert.strictEqual(args.Навигация.s[1].n, 'Limit');
                        chai_1.assert.strictEqual(args.Навигация.d[1], limit);
                        chai_1.assert.strictEqual(args.Навигация.s[2].n, 'Offset');
                        chai_1.assert.strictEqual(args.Навигация.d[2], offset);
                    });
                });
                it('should generate request with null navigation if there is no limit', function () {
                    var service = new SbisService_1.default({
                        endpoint: 'USP'
                    });
                    var query = new Query_1.default()
                        .meta({ navigationType: Query_1.NavigationType.Position });
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.isNull(args.Навигация);
                        chai_1.assert.strictEqual(args.Фильтр.d.length, 0);
                    });
                });
                it('should generate request with position navigation and null position and "after" order', function () {
                    var service = new SbisService_1.default({
                        endpoint: 'USP'
                    });
                    var limit = 9;
                    var query = new Query_1.default()
                        .meta({ navigationType: Query_1.NavigationType.Position })
                        .where({ 'id>=': null })
                        .limit(limit);
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Навигация.s[0].n, 'HasMore');
                        chai_1.assert.strictEqual(args.Навигация.d[0], true);
                        chai_1.assert.strictEqual(args.Навигация.s[1].n, 'Limit');
                        chai_1.assert.strictEqual(args.Навигация.d[1], limit);
                        chai_1.assert.strictEqual(args.Навигация.s[2].n, 'Order');
                        chai_1.assert.strictEqual(args.Навигация.d[2], 'after');
                        chai_1.assert.strictEqual(args.Навигация.s[3].n, 'Position');
                        chai_1.assert.strictEqual(args.Навигация.s[3].t, 'Строка');
                        chai_1.assert.strictEqual(args.Навигация.d[3], null);
                    });
                });
                it('should generate request with position navigation and null position and "before" order', function () {
                    var service = new SbisService_1.default({
                        endpoint: 'USP'
                    });
                    var limit = 9;
                    var query = new Query_1.default()
                        .meta({ navigationType: Query_1.NavigationType.Position })
                        .where({ 'id<=': null })
                        .limit(limit);
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Навигация.s[0].n, 'HasMore');
                        chai_1.assert.strictEqual(args.Навигация.d[0], true);
                        chai_1.assert.strictEqual(args.Навигация.s[1].n, 'Limit');
                        chai_1.assert.strictEqual(args.Навигация.d[1], limit);
                        chai_1.assert.strictEqual(args.Навигация.s[2].n, 'Order');
                        chai_1.assert.strictEqual(args.Навигация.d[2], 'before');
                        chai_1.assert.strictEqual(args.Навигация.s[3].n, 'Position');
                        chai_1.assert.strictEqual(args.Навигация.s[3].t, 'Строка');
                        chai_1.assert.strictEqual(args.Навигация.d[3], null);
                    });
                });
                it('should generate request with position navigation and null position if there is undefined value in ' +
                    'conditions', function () {
                    var service = new SbisService_1.default({
                        endpoint: 'USP'
                    });
                    var limit = 9;
                    var query = new Query_1.default()
                        .meta({ navigationType: Query_1.NavigationType.Position })
                        .where({ 'id>=': undefined })
                        .limit(limit);
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Навигация.s[0].n, 'HasMore');
                        chai_1.assert.strictEqual(args.Навигация.d[0], true);
                        chai_1.assert.strictEqual(args.Навигация.s[1].n, 'Limit');
                        chai_1.assert.strictEqual(args.Навигация.d[1], limit);
                        chai_1.assert.strictEqual(args.Навигация.s[2].n, 'Order');
                        chai_1.assert.strictEqual(args.Навигация.d[2], 'after');
                        chai_1.assert.strictEqual(args.Навигация.s[3].n, 'Position');
                        chai_1.assert.strictEqual(args.Навигация.s[3].t, 'Строка');
                        chai_1.assert.strictEqual(args.Навигация.d[3], null);
                    });
                });
                it('should generate request with position navigation and "after" order as default', function () {
                    var service = new SbisService_1.default({
                        endpoint: 'USP'
                    });
                    var query = new Query_1.default();
                    var limit = 50;
                    query
                        .meta({ navigationType: Query_1.NavigationType.Position })
                        .limit(limit);
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Навигация.s[0].n, 'HasMore');
                        chai_1.assert.strictEqual(args.Навигация.d[0], true);
                        chai_1.assert.strictEqual(args.Навигация.s[1].n, 'Limit');
                        chai_1.assert.strictEqual(args.Навигация.d[1], limit);
                        chai_1.assert.strictEqual(args.Навигация.s[2].n, 'Order');
                        chai_1.assert.strictEqual(args.Навигация.d[2], 'after');
                        chai_1.assert.strictEqual(args.Навигация.s[3].n, 'Position');
                        chai_1.assert.strictEqual(args.Навигация.s[3].t, 'Строка');
                        chai_1.assert.strictEqual(args.Навигация.d[3], null);
                        chai_1.assert.strictEqual(args.Фильтр.d.length, 0);
                    });
                });
                it('should generate request with position navigation and "after" order', function () {
                    var service = new SbisService_1.default({
                        endpoint: 'USP'
                    });
                    var query = new Query_1.default();
                    var where = { 'id>=': 10 };
                    var limit = 50;
                    query
                        .meta({ navigationType: Query_1.NavigationType.Position })
                        .where(where)
                        .limit(limit);
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Навигация.s[0].n, 'HasMore');
                        chai_1.assert.strictEqual(args.Навигация.d[0], true);
                        chai_1.assert.strictEqual(args.Навигация.s[1].n, 'Limit');
                        chai_1.assert.strictEqual(args.Навигация.d[1], limit);
                        chai_1.assert.strictEqual(args.Навигация.s[2].n, 'Order');
                        chai_1.assert.strictEqual(args.Навигация.d[2], 'after');
                        chai_1.assert.strictEqual(args.Навигация.s[3].n, 'Position');
                        chai_1.assert.strictEqual(args.Навигация.s[3].t, 'Запись');
                        chai_1.assert.strictEqual(args.Навигация.d[3].s.length, 1);
                        chai_1.assert.strictEqual(args.Навигация.d[3].s[0].n, 'id');
                        chai_1.assert.strictEqual(args.Навигация.d[3].d.length, 1);
                        chai_1.assert.strictEqual(args.Навигация.d[3].d[0], 10);
                        chai_1.assert.strictEqual(args.Фильтр.d.length, 0);
                    });
                });
                it('should generate request with position navigation and "before" order', function () {
                    var service = new SbisService_1.default({
                        endpoint: 'USP'
                    });
                    var query = new Query_1.default();
                    var where = { 'id<=': 10 };
                    var limit = 50;
                    query
                        .meta({ navigationType: Query_1.NavigationType.Position })
                        .where(where)
                        .limit(limit);
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Навигация.s[2].n, 'Order');
                        chai_1.assert.strictEqual(args.Навигация.d[2], 'before');
                        chai_1.assert.strictEqual(args.Навигация.s[3].n, 'Position');
                        chai_1.assert.strictEqual(args.Навигация.s[3].t, 'Запись');
                        chai_1.assert.strictEqual(args.Навигация.d[3].s.length, 1);
                        chai_1.assert.strictEqual(args.Навигация.d[3].s[0].n, 'id');
                        chai_1.assert.strictEqual(args.Навигация.d[3].d.length, 1);
                        chai_1.assert.strictEqual(args.Навигация.d[3].d[0], 10);
                        chai_1.assert.strictEqual(args.Фильтр.d.length, 0);
                    });
                });
                it('should generate request with position navigation and "both" order', function () {
                    var service = new SbisService_1.default({
                        endpoint: 'USP'
                    });
                    var query = new Query_1.default();
                    var where = { 'id~': 10 };
                    var limit = 50;
                    query
                        .meta({ navigationType: Query_1.NavigationType.Position })
                        .where(where)
                        .limit(limit);
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Навигация.s[2].n, 'Order');
                        chai_1.assert.strictEqual(args.Навигация.d[2], 'both');
                        chai_1.assert.strictEqual(args.Фильтр.d.length, 0);
                    });
                });
                it('should generate request with "hasMore" from given meta property', function () {
                    var hasMore = 'test';
                    var query = new Query_1.default();
                    query
                        .offset(0)
                        .limit(10)
                        .meta({
                        hasMore: hasMore
                    });
                    return service.query(query).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.strictEqual(args.Навигация.d[0], hasMore);
                        chai_1.assert.strictEqual(args.Навигация.s[0].n, 'ЕстьЕще');
                    });
                });
                it('should cancel the inner request', function () {
                    var def = service.query();
                    var lastDef = SbisBusinessLogic.lastDeferred;
                    def.cancel();
                    chai_1.assert.instanceOf(lastDef.getResult(), DeferredCanceledError);
                });
            });
            context('when the service isn\'t exists', function () {
                it('should return an error', function () {
                    var service = new SbisService_1.default({
                        endpoint: 'Unknown'
                    });
                    return service.query(new Query_1.default()).then(function () {
                        throw new Error('Shouldn\'t reach here');
                    }, function (err) {
                        chai_1.assert.instanceOf(err, Error);
                    });
                });
            });
        });
        describe('.call()', function () {
            context('when the method is exists', function () {
                it('should accept an object', function () {
                    var rs = new RecordSet_1.default({
                        rawData: [
                            { f1: 1, f2: 2 },
                            { f1: 3, f2: 4 }
                        ]
                    });
                    var sent = {
                        bool: false,
                        intgr: 1,
                        real: 1.01,
                        string: 'test',
                        obj: { a: 1, b: 2, c: 3 },
                        rec: getSampleModel(),
                        rs: rs
                    };
                    return service.call('Dummy', sent).then(function () {
                        chai_1.assert.strictEqual(SbisBusinessLogic.lastRequest.method, 'Dummy');
                        var args = SbisBusinessLogic.lastRequest.args;
                        chai_1.assert.deepEqual(args.rec, getSampleModel().getRawData());
                        delete sent.rec;
                        delete args.rec;
                        chai_1.assert.deepEqual(args.rs, rs.getRawData());
                        delete sent.rs;
                        delete args.rs;
                        chai_1.assert.deepEqual(args, sent);
                    });
                });
                it('should accept a model', function () {
                    var model = getSampleModel();
                    return service.call('Dummy', model).then(function () {
                        chai_1.assert.strictEqual(SbisBusinessLogic.lastRequest.method, 'Dummy');
                        var args = SbisBusinessLogic.lastRequest.args;
                        testArgIsModel(args, model);
                    });
                });
                it('should accept a dataset', function () {
                    var dataSet = new DataSet_1.default({
                        adapter: 'Types/entity:adapter.Sbis',
                        rawData: {
                            _type: 'recordset',
                            d: [
                                [1, true],
                                [2, false],
                                [5, true]
                            ],
                            s: [
                                { n: '@ID', t: 'Идентификатор' },
                                { n: 'Флаг', t: 'Логическое' }
                            ]
                        }
                    });
                    return service.call('Dummy', dataSet).then(function () {
                        chai_1.assert.strictEqual(SbisBusinessLogic.lastRequest.method, 'Dummy');
                        var args = SbisBusinessLogic.lastRequest.args;
                        testArgIsDataSet(args, dataSet);
                    });
                });
            });
            context('when the method isn\'t exists', function () {
                it('should return an error', function () {
                    return service.call('МойМетод').then(function (err) {
                        chai_1.assert.instanceOf(err, Error);
                    }, function (err) {
                        chai_1.assert.instanceOf(err, Error);
                    });
                });
            });
        });
        describe('.move', function () {
            it('should call move', function () {
                return service.move([1], 2, {
                    parentProperty: 'parent',
                    position: 'before'
                }).then(function () {
                    var args = SbisBusinessLogic.lastRequest.args;
                    var etalon = {
                        IndexNumber: 'ПорНомер',
                        HierarchyName: 'parent',
                        ObjectName: 'USP',
                        ObjectId: ['1'],
                        DestinationId: '2',
                        Order: 'before',
                        ReadMethod: 'USP.Прочитать',
                        UpdateMethod: 'USP.Записать'
                    };
                    chai_1.assert.deepEqual(etalon, args);
                });
            });
            it('should call move method when binding has contract', function () {
                var service = new SbisService_1.default({
                    endpoint: 'Goods',
                    binding: {
                        move: 'Product.Mymove'
                    }
                });
                return service.move([1], 2, {
                    parentProperty: 'parent',
                    position: 'before'
                }).then(function () {
                    var args = SbisBusinessLogic.lastRequest.args;
                    var etalon = {
                        IndexNumber: 'ПорНомер',
                        HierarchyName: 'parent',
                        ObjectName: 'Goods',
                        ObjectId: ['1'],
                        DestinationId: '2',
                        Order: 'before',
                        ReadMethod: 'Goods.Прочитать',
                        UpdateMethod: 'Goods.Записать'
                    };
                    chai_1.assert.deepEqual(etalon, args);
                });
            });
            it('should call move with complex ids', function () {
                return service.move(['1,Item'], '2,Item', {
                    parentProperty: 'parent',
                    position: 'before'
                }).then(function () {
                    var args = SbisBusinessLogic.lastRequest.args;
                    var etalon = {
                        IndexNumber: 'ПорНомер',
                        HierarchyName: 'parent',
                        ObjectName: 'Item',
                        ObjectId: ['1'],
                        DestinationId: '2',
                        Order: 'before',
                        ReadMethod: 'Item.Прочитать',
                        UpdateMethod: 'Item.Записать'
                    };
                    chai_1.assert.deepEqual(etalon, args);
                });
            });
            it('should return origin error', function () {
                var originError = new Error();
                var SbisBusinessLogic2 = coreExtend(SbisBusinessLogic, {
                    call: function () {
                        return new Deferred().errback(originError);
                    }
                });
                di.register(provider, SbisBusinessLogic2);
                service = new SbisService_1.default({
                    endpoint: 'USP'
                });
                return service.move(['1,Item'], '2,Item', {
                    parentProperty: 'parent',
                    position: 'before'
                }).then(function (error) {
                    throw new Error('Method should return an error');
                }, function (error) {
                    chai_1.assert.equal(error, originError);
                });
            });
            context('test move way with moveBefore or moveAfter', function () {
                var oldWayService;
                beforeEach(function () {
                    oldWayService = new SbisService_1.default({
                        endpoint: {
                            contract: 'USP',
                            moveContract: 'ПорядковыйНомер'
                        },
                        binding: {
                            moveBefore: 'ВставитьДо',
                            moveAfter: 'ВставитьПосле'
                        }
                    });
                });
                it('should call move', function () {
                    return oldWayService.move(1, 2, {
                        before: true,
                        hierField: 'parent'
                    }).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        var etalon = {
                            ПорядковыйНомер: 'ПорНомер',
                            Иерархия: 'parent',
                            Объект: 'ПорядковыйНомер',
                            ИдО: ['1', 'USP'],
                            ИдОДо: ['2', 'USP']
                        };
                        chai_1.assert.deepEqual(etalon, args);
                    });
                });
                it('should call move with complex ids', function () {
                    return oldWayService.move('1,Item', '2,Item', {
                        before: true,
                        hierField: 'parent'
                    }).then(function () {
                        var args = SbisBusinessLogic.lastRequest.args;
                        var etalon = {
                            ПорядковыйНомер: 'ПорНомер',
                            Иерархия: 'parent',
                            Объект: 'ПорядковыйНомер',
                            ИдО: ['1', 'Item'],
                            ИдОДо: ['2', 'Item']
                        };
                        chai_1.assert.deepEqual(etalon, args);
                    });
                });
            });
        });
        describe('.getOrderProperty()', function () {
            it('should return an empty string by default', function () {
                var source = new SbisService_1.default();
                chai_1.assert.strictEqual(source.getOrderProperty(), 'ПорНомер');
            });
            it('should return value passed to the constructor', function () {
                var source = new SbisService_1.default({
                    orderProperty: 'test'
                });
                chai_1.assert.equal(source.getOrderProperty(), 'test');
            });
        });
        describe('.setOrderProperty()', function () {
            it('should set the new value', function () {
                var source = new SbisService_1.default();
                source.setOrderProperty('test');
                chai_1.assert.equal(source.getOrderProperty(), 'test');
            });
        });
        describe('.toJSON()', function () {
            it('should serialize provider option', function () {
                var Foo = function () { };
                di.register('Foo', Foo);
                var source = new SbisService_1.default({
                    provider: 'Foo'
                });
                var provider = source.getProvider();
                var json = source.toJSON();
                di.unregister('Foo');
                chai_1.assert.instanceOf(provider, Foo);
                chai_1.assert.equal(json.state.$options.provider, 'Foo');
            });
        });
    });
});
