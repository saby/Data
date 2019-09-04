define(["require", "exports", "tslib", "chai", "Types/_source/Base", "Types/_entity/adapter/Json"], function (require, exports, tslib_1, chai_1, Base_1, Json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestSource = /** @class */ (function (_super) {
        tslib_1.__extends(TestSource, _super);
        function TestSource(options) {
            return _super.call(this, options) || this;
        }
        return TestSource;
    }(Base_1.default));
    Object.assign(TestSource.prototype, {
        _moduleName: '[TestSource]'
    });
    describe('Types/_source/Base', function () {
        var source;
        beforeEach(function () {
            source = new TestSource();
        });
        afterEach(function () {
            source = undefined;
        });
        describe('.getAdapter()', function () {
            it('should return the JSON adapter by default', function () {
                var adapter = source.getAdapter();
                chai_1.assert.instanceOf(adapter, Json_1.default);
            });
            it('should return value passed to the constructor', function () {
                var adapter = new Json_1.default();
                var source = new TestSource({
                    adapter: adapter
                });
                chai_1.assert.strictEqual(source.getAdapter(), adapter);
            });
        });
        describe('.getModel()', function () {
            it('should return "Types/entity:Model" by default', function () {
                chai_1.assert.equal(source.getModel(), 'Types/entity:Model');
            });
            it('should return value passed to the constructor', function () {
                var source = new TestSource({
                    model: 'my.model'
                });
                chai_1.assert.equal(source.getModel(), 'my.model');
            });
        });
        describe('.setModel()', function () {
            it('should set the new value', function () {
                source.setModel('my.model');
                chai_1.assert.equal(source.getModel(), 'my.model');
            });
        });
        describe('.getListModule()', function () {
            it('should return "Types/collection:RecordSet" by default', function () {
                chai_1.assert.equal(source.getListModule(), 'Types/collection:RecordSet');
            });
            it('should return value passed to the constructor', function () {
                var source = new TestSource({
                    listModule: 'my.list'
                });
                chai_1.assert.equal(source.getListModule(), 'my.list');
            });
        });
        describe('.setListModule()', function () {
            it('should set the new value', function () {
                source.setListModule('my.list');
                chai_1.assert.equal(source.getListModule(), 'my.list');
            });
        });
        describe('.getKeyProperty()', function () {
            it('should return an empty string by default', function () {
                chai_1.assert.strictEqual(source.getKeyProperty(), '');
            });
            it('should return value passed to the constructor', function () {
                var source = new TestSource({
                    keyProperty: 'test'
                });
                chai_1.assert.equal(source.getKeyProperty(), 'test');
            });
        });
        describe('.setKeyProperty()', function () {
            it('should set the new value', function () {
                source.setKeyProperty('test');
                chai_1.assert.equal(source.getKeyProperty(), 'test');
            });
        });
        describe('.getOptions()', function () {
            it('should return an Object by default', function () {
                chai_1.assert.strictEqual(source.getOptions().debug, false);
            });
            it('should return value passed to the constructor', function () {
                var source = new TestSource({
                    options: { debug: true }
                });
                chai_1.assert.strictEqual(source.getOptions().debug, true);
            });
            it('should return merged value of the prototype and the constructor', function () {
                var source = new TestSource({
                    options: { foo: 'bar' }
                });
                chai_1.assert.isFalse(source.getOptions().debug);
                chai_1.assert.equal(source.getOptions().foo, 'bar');
            });
        });
        describe('.setOptions()', function () {
            it('should set new value', function () {
                var options = {
                    debug: true,
                    foo: 'bar'
                };
                source = new TestSource({ options: options });
                source.setOptions({ debug: true });
                chai_1.assert.strictEqual(options.debug, true);
                chai_1.assert.strictEqual(options.foo, 'bar');
            });
            it('should leave the prototype options untouched', function () {
                var source = new TestSource();
                chai_1.assert.deepEqual(TestSource.prototype._$options, source.getOptions());
                source.setOptions({ debug: true });
                chai_1.assert.notDeepEqual(TestSource.prototype._$options, source.getOptions());
            });
        });
        describe('.toJSON()', function () {
            it('should return valid signature', function () {
                var options = {};
                var source = new TestSource(options);
                var json = source.toJSON();
                chai_1.assert.deepEqual(json.$serialized$, 'inst');
                chai_1.assert.deepEqual(json.module, '[TestSource]');
                chai_1.assert.deepEqual(json.state.$options, options);
            });
        });
    });
});
