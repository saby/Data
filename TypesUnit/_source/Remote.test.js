define(["require", "exports", "tslib", "chai", "Types/_source/Remote", "Types/_source/Query", "Types/_entity/Record", "Types/_entity/Model", "Types/_collection/RecordSet", "Types/di", "Core/core-extend", "Core/Deferred"], function (require, exports, tslib_1, chai_1, Remote_1, Query_1, Record_1, Model_1, RecordSet_1, di, coreExtend, Deferred) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RemoteTesting = /** @class */ (function (_super) {
        tslib_1.__extends(RemoteTesting, _super);
        function RemoteTesting(options) {
            return _super.call(this, options) || this;
        }
        return RemoteTesting;
    }(Remote_1.default));
    Object.assign(RemoteTesting.prototype, {
        _moduleName: 'RemoteTesing'
    });
    var ProviderMock = /** @class */ (function () {
        function ProviderMock() {
            this.result = null;
        }
        ProviderMock.prototype.call = function (name, args) {
            this.lastName = name;
            this.lastArgs = args;
            return Deferred.success(this.result);
        };
        return ProviderMock;
    }());
    describe('Types/_source/Remote', function () {
        var dataSource;
        var provider;
        beforeEach(function () {
            provider = new ProviderMock();
            dataSource = new RemoteTesting({
                endpoint: '/users/',
                provider: provider,
                binding: {
                    create: 'createUser',
                    read: 'readUser',
                    update: 'updateUser',
                    destroy: 'deleteUser',
                    query: 'getUsers',
                    copy: 'copyUser',
                    merge: 'mergeUsers'
                }
            });
        });
        afterEach(function () {
            dataSource = undefined;
            provider = undefined;
        });
        describe('.constructor()', function () {
            it('should merge property _$passing value from prototype with option', function () {
                var passing = {
                    create: function () {
                        return {};
                    },
                    read: function () {
                        return {};
                    }
                };
                var source = new RemoteTesting({
                    passing: passing
                });
                var passingOption = source['_$' + 'passing'];
                var passingProto = Remote_1.default.prototype['_$' + 'passing'];
                chai_1.assert.strictEqual(passingOption.create, passing.create);
                chai_1.assert.strictEqual(passingOption.read, passing.read);
                chai_1.assert.strictEqual(passingOption.update, passingProto.update);
                chai_1.assert.strictEqual(passingOption.destroy, passingProto.destroy);
            });
        });
        describe('.getEndpoint()', function () {
            it('should return normalized endpoint from String', function () {
                var source = new RemoteTesting({
                    endpoint: 'Test'
                });
                var ep = source.getEndpoint();
                chai_1.assert.equal(ep.contract, 'Test');
            });
            it('should return value passed to the constructor', function () {
                var source = new RemoteTesting({
                    endpoint: {
                        contract: 'Test',
                        address: '//stdin'
                    }
                });
                var ep = source.getEndpoint();
                chai_1.assert.equal(ep.contract, 'Test');
                chai_1.assert.equal(ep.address, '//stdin');
            });
            it('should return merged value of the prototype and the constructor', function () {
                var source = new RemoteTesting({
                    endpoint: { contract: 'foo' }
                });
                var endpointProto = Remote_1.default.prototype['_$' + 'endpoint'];
                chai_1.assert.notEqual(source.getEndpoint(), endpointProto);
                chai_1.assert.equal(source.getEndpoint().contract, 'foo');
            });
            it('should return value of the subclass', function () {
                var SubRemoteSource = coreExtend.extend(Remote_1.default, {
                    _$endpoint: { foo: 'bar' }
                });
                var source = new SubRemoteSource();
                chai_1.assert.equal(source.getEndpoint().foo, 'bar');
            });
        });
        describe('.getBinding()', function () {
            it('should return value passed to the constructor', function () {
                var binding = {
                    create: 'c',
                    read: 'r',
                    update: 'u',
                    destroy: 'd'
                };
                var source = new RemoteTesting({
                    binding: binding
                });
                chai_1.assert.strictEqual(source.getBinding().create, binding.create);
                chai_1.assert.strictEqual(source.getBinding().read, binding.read);
                chai_1.assert.strictEqual(source.getBinding().update, binding.update);
                chai_1.assert.strictEqual(source.getBinding().destroy, binding.destroy);
            });
            it('should return merged value of the prototype and the constructor', function () {
                var source = new RemoteTesting({
                    binding: { read: 'foo' }
                });
                chai_1.assert.equal(source.getBinding().create, 'create');
                chai_1.assert.equal(source.getBinding().read, 'foo');
            });
        });
        describe('.setBinding()', function () {
            it('should set the new value', function () {
                var binding = {
                    create: 'c',
                    read: 'r',
                    update: 'u',
                    destroy: 'd'
                };
                var source = new RemoteTesting();
                source.setBinding(binding);
                chai_1.assert.deepEqual(source.getBinding(), binding);
            });
        });
        describe('.getProvider()', function () {
            it('should throw an Error by default', function () {
                var source = new RemoteTesting();
                chai_1.assert.throws(function () {
                    source.getProvider();
                });
            });
            it('should return Provider', function () {
                chai_1.assert.instanceOf(dataSource.getProvider(), ProviderMock);
            });
        });
        describe('.create()', function () {
            it('should return writable Record', function () {
                var dataSource = new RemoteTesting({
                    provider: provider
                });
                provider.result = { foo: 'bar' };
                return dataSource.create().then(function (record) {
                    chai_1.assert.instanceOf(record, Record_1.default);
                    chai_1.assert.isTrue(record.writable);
                    chai_1.assert.equal(record.get('foo'), 'bar');
                });
            });
        });
        describe('.read()', function () {
            it('should send primary key value', function () {
                var dataSource = new RemoteTesting({
                    provider: provider
                });
                var value = 'foo';
                provider.result = { foo: 'bar' };
                return dataSource.read(value).then(function (record) {
                    var sent = provider.lastArgs[0];
                    chai_1.assert.equal(sent, 'foo');
                    chai_1.assert.instanceOf(record, Record_1.default);
                    chai_1.assert.isTrue(record.writable);
                    chai_1.assert.equal(record.get('foo'), 'bar');
                });
            });
        });
        describe('.update()', function () {
            it('should send all record fields', function () {
                var dataSource = new RemoteTesting({
                    provider: provider
                });
                var record = new Record_1.default({
                    rawData: { a: 1, b: 2, c: 3 }
                });
                return dataSource.update(record).then(function () {
                    var sent = provider.lastArgs[0];
                    chai_1.assert.equal(sent.a, 1);
                    chai_1.assert.equal(sent.b, 2);
                    chai_1.assert.equal(sent.c, 3);
                });
            });
            it('should send only changed record fields and key property', function () {
                var dataSource = new RemoteTesting({
                    provider: provider,
                    keyProperty: 'a',
                    options: {
                        updateOnlyChanged: true
                    }
                });
                var record = new Record_1.default({
                    rawData: { a: 1, b: 2, c: 3 }
                });
                record.set('b', 20);
                return dataSource.update(record).then(function () {
                    var sent = provider.lastArgs[0];
                    chai_1.assert.equal(sent.a, 1);
                    chai_1.assert.equal(sent.b, 20);
                    chai_1.assert.isUndefined(sent.c);
                });
            });
            it('should send only changed model fields and key property (source priority)', function () {
                var dataSource = new RemoteTesting({
                    provider: provider,
                    keyProperty: 'a',
                    options: {
                        updateOnlyChanged: true
                    }
                });
                var model = new Model_1.default({
                    idProperty: 'c',
                    rawData: { a: 1, b: 2, c: 3 }
                });
                model.set('b', 20);
                return dataSource.update(model).then(function () {
                    var sent = provider.lastArgs[0];
                    chai_1.assert.equal(sent.a, 1);
                    chai_1.assert.equal(sent.b, 20);
                    chai_1.assert.isUndefined(sent.c);
                    chai_1.assert.isFalse(model.isChanged());
                });
            });
            it('should send only primary key', function () {
                var dataSource = new RemoteTesting({
                    provider: provider,
                    options: {
                        updateOnlyChanged: true
                    }
                });
                var model = new Model_1.default({
                    idProperty: 'a',
                    rawData: { a: 1, b: 2, c: 3 }
                });
                return dataSource.update(model).then(function () {
                    var sent = provider.lastArgs[0];
                    chai_1.assert.isTrue(sent.hasOwnProperty('a'));
                    chai_1.assert.isFalse(sent.hasOwnProperty('b'));
                    chai_1.assert.isFalse(sent.hasOwnProperty('c'));
                    chai_1.assert.isFalse(model.isChanged());
                });
            });
            it('should send all records', function () {
                var dataSource = new RemoteTesting({
                    provider: provider
                });
                var data = [
                    { id: 1 },
                    { id: 2 },
                    { id: 3 },
                    { id: 4 },
                    { id: 5 }
                ];
                var rs = new RecordSet_1.default({
                    rawData: data
                });
                return dataSource.update(rs).then(function () {
                    var sent = provider.lastArgs[0];
                    chai_1.assert.equal(sent.length, data.length);
                });
            });
            it('should send only changed records', function () {
                var dataSource = new RemoteTesting({
                    provider: provider,
                    keyProperty: 'id',
                    options: {
                        updateOnlyChanged: true
                    }
                });
                var rs = new RecordSet_1.default({
                    rawData: [
                        { id: 1 },
                        { id: 2 },
                        { id: 3 },
                        { id: 4 },
                        { id: 5 }
                    ]
                });
                rs.at(0).set('a', 1);
                rs.at(2).set('a', 2);
                return dataSource.update(rs).then(function () {
                    var sent = provider.lastArgs[0];
                    chai_1.assert.equal(sent.length, 2);
                    chai_1.assert.equal(sent[0].id, 1);
                    chai_1.assert.equal(sent[0].a, 1);
                    chai_1.assert.equal(sent[1].id, 3);
                    chai_1.assert.equal(sent[1].a, 2);
                });
            });
        });
        describe('.destroy()', function () {
            it('should send primary key value', function () {
                var dataSource = new RemoteTesting({
                    provider: provider
                });
                var value = 'foo';
                return dataSource.destroy(value).then(function () {
                    var sent = provider.lastArgs[0];
                    chai_1.assert.equal(sent, 'foo');
                });
            });
        });
        describe('.query()', function () {
            it('should send query', function () {
                var dataSource = new RemoteTesting({
                    provider: provider
                });
                var query = new Query_1.default();
                return dataSource.query(query).then(function () {
                    chai_1.assert.deepEqual(provider.lastArgs.length, 6);
                });
            });
        });
        describe('.merge()', function () {
            it('should send two keys', function () {
                var dataSource = new RemoteTesting({
                    provider: provider
                });
                var from = 'foo';
                var to = 'bar';
                return dataSource.merge(from, to).then(function () {
                    chai_1.assert.equal(provider.lastArgs[0], from);
                    chai_1.assert.equal(provider.lastArgs[1], to);
                });
            });
        });
        describe('.copy()', function () {
            it('should copy model', function () {
                var id = 'test';
                var data = { a: 1 };
                provider.result = data;
                return dataSource.copy(id).then(function (copy) {
                    chai_1.assert.instanceOf(copy, Model_1.default);
                    chai_1.assert.equal(provider.lastName, 'copyUser');
                    chai_1.assert.equal(provider.lastArgs[0], 'test');
                    chai_1.assert.deepEqual(copy.getRawData(), data);
                });
            });
        });
        describe('.move()', function () {
            it('should send two keys', function () {
                var dataSource = new RemoteTesting({
                    provider: provider
                });
                var from = 'foo';
                var to = 'bar';
                return dataSource.move(from, to).then(function () {
                    chai_1.assert.equal(provider.lastArgs[0], from);
                    chai_1.assert.equal(provider.lastArgs[1], to);
                });
            });
        });
        describe('.subscribe()', function () {
            context('onBeforeProviderCall', function () {
                it('should receive service name', function () {
                    var lastName;
                    var handler = function (e, name) {
                        lastName = name;
                    };
                    dataSource.subscribe('onBeforeProviderCall', handler);
                    return dataSource.query().then(function () {
                        dataSource.unsubscribe('onBeforeProviderCall', handler);
                        chai_1.assert.strictEqual(lastName, dataSource.getBinding().query);
                    });
                });
                it('should receive service name and arguments', function () {
                    var serviceArgs = [{}, [], 'a', 1, 0, false, true, null];
                    var lastName;
                    var lastArgs;
                    var handler = function (e, name, args) {
                        lastName = name;
                        lastArgs = args;
                    };
                    dataSource.subscribe('onBeforeProviderCall', handler);
                    return dataSource.create(serviceArgs).then(function () {
                        dataSource.unsubscribe('onBeforeProviderCall', handler);
                        chai_1.assert.strictEqual(lastName, dataSource.getBinding().create);
                        chai_1.assert.deepEqual(lastArgs, [serviceArgs]);
                    });
                });
                it('should change service arguments as an object', function () {
                    var handler = function (e, name, args) {
                        args[0].a = 9;
                        delete args[0].b;
                        args[0].c = 3;
                    };
                    var serviceArgs = { a: 1, b: 2 };
                    var expectArgs = [{ a: 9, c: 3 }];
                    dataSource.subscribe('onBeforeProviderCall', handler);
                    dataSource.create(serviceArgs);
                    dataSource.unsubscribe('onBeforeProviderCall', handler);
                    chai_1.assert.deepEqual(provider.lastArgs, expectArgs);
                    chai_1.assert.deepEqual([serviceArgs], expectArgs);
                });
                it('should change service arguments as an array', function () {
                    var handler = function (e, name, args) {
                        args[0].push('new');
                    };
                    var serviceArgs = [1, 2];
                    var expectArgs = [[1, 2, 'new']];
                    dataSource.subscribe('onBeforeProviderCall', handler);
                    dataSource.create(serviceArgs);
                    dataSource.unsubscribe('onBeforeProviderCall', handler);
                    chai_1.assert.deepEqual(provider.lastArgs, expectArgs);
                    chai_1.assert.deepEqual([serviceArgs], expectArgs);
                });
                it('should change service arguments and leave original untouched', function () {
                    var handler = function (e, name, args) {
                        var result = tslib_1.__assign({}, args[0]);
                        result.a = 9;
                        delete result.b;
                        result.c = 3;
                        e.setResult(result);
                    };
                    var serviceArgs = { a: 1, b: 2 };
                    var serviceArgsCopy = { a: 1, b: 2 };
                    var expectArgs = { a: 9, c: 3 };
                    dataSource.subscribe('onBeforeProviderCall', handler);
                    dataSource.create(serviceArgs);
                    dataSource.unsubscribe('onBeforeProviderCall', handler);
                    chai_1.assert.deepEqual(provider.lastArgs, expectArgs);
                    chai_1.assert.deepEqual(serviceArgs, serviceArgsCopy);
                });
            });
        });
        describe('.toJSON()', function () {
            it('should serialize "provider" option', function () {
                var Foo = function () { };
                di.register('Foo', Foo);
                var source = new RemoteTesting({
                    provider: 'Foo'
                });
                var provider = source.getProvider();
                var json = source.toJSON();
                di.unregister('Foo');
                chai_1.assert.instanceOf(provider, Foo);
                chai_1.assert.equal(json.state.$options.provider, 'Foo');
            });
            it('should serialize "passing" option exactly as it was passed to the constructor', function () {
                var read = function () {
                    return {};
                };
                var source = new RemoteTesting({
                    passing: {
                        read: read
                    }
                });
                var json = source.toJSON();
                chai_1.assert.deepEqual(json.state.$options.passing, {
                    read: read
                });
            });
        });
    });
});
