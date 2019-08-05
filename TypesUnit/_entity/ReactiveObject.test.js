define(["require", "exports", "chai", "Types/_entity/ReactiveObject"], function (require, exports, chai_1, ReactiveObject_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_entity/ReactiveObject', function () {
        describe('.constructor()', function () {
            it('should create instance of ReactiveObject', function () {
                var instance = new ReactiveObject_1.default({});
                chai_1.assert.instanceOf(instance, ReactiveObject_1.default);
            });
        });
        describe('[key: string]', function () {
            it('should return property value', function () {
                var instance = new ReactiveObject_1.default({
                    foo: 'bar'
                });
                chai_1.assert.equal(instance.foo, 'bar');
            });
            it('should update property value', function () {
                var instance = new ReactiveObject_1.default({
                    foo: 'bar'
                });
                instance.foo = 'baz';
                chai_1.assert.equal(instance.foo, 'baz');
            });
            it('should return read-only property value', function () {
                var instance = new ReactiveObject_1.default({
                    get foo() {
                        return 'bar';
                    }
                });
                chai_1.assert.equal(instance.foo, 'bar');
            });
            it('should throw an Error on write into read-only property value', function () {
                var instance = new ReactiveObject_1.default({
                    get foo() {
                        return 'bar';
                    }
                });
                chai_1.assert.throws(function () {
                    // @ts-ignore TS knows it's read only
                    instance.foo = 'baz';
                });
            });
            it('should update calculated property value', function () {
                var instance = new ReactiveObject_1.default({
                    email: 'foo@bar.com',
                    get domain() {
                        return this.email.split('@')[1];
                    },
                    set domain(value) {
                        var parts = this.email.split('@');
                        parts[1] = value;
                        this.email = parts.join('@');
                    }
                });
                chai_1.assert.equal(instance.domain, 'bar.com');
                instance.domain = 'bar.org';
                chai_1.assert.equal(instance.domain, 'bar.org');
                chai_1.assert.equal(instance.email, 'foo@bar.org');
            });
            it('should update not-reactive property value', function () {
                var instance = new ReactiveObject_1.default({});
                instance.foo = 'bar';
                chai_1.assert.equal(instance.foo, 'bar');
            });
        });
        describe('.getVersion()', function () {
            it('should update version after update property', function () {
                var instance = new ReactiveObject_1.default({
                    foo: 'bar'
                });
                var initialVersion = instance.getVersion();
                instance.foo = 'baz';
                chai_1.assert.notEqual(instance.getVersion(), initialVersion);
            });
            it('shouldn\'t update version after set the same property value', function () {
                var instance = new ReactiveObject_1.default({
                    foo: 'bar'
                });
                var initialVersion = instance.getVersion();
                instance.foo = 'bar';
                chai_1.assert.equal(instance.getVersion(), initialVersion);
            });
            it('should update version after update calculated property value', function () {
                var instance = new ReactiveObject_1.default({
                    get foo() {
                        return 'bar';
                    },
                    set foo(value) {
                        // do nothing
                    }
                });
                var initialVersion = instance.getVersion();
                instance.foo = 'baz';
                chai_1.assert.notEqual(instance.getVersion(), initialVersion);
            });
            it('shouldn\'t update version after set the same calculated property value', function () {
                var instance = new ReactiveObject_1.default({
                    get foo() {
                        return 'bar';
                    },
                    set foo(value) {
                        // do nothing
                    }
                });
                var initialVersion = instance.getVersion();
                instance.foo = 'bar';
                chai_1.assert.equal(instance.getVersion(), initialVersion);
            });
            it('shouldn\'t update version after update not-reactive property', function () {
                var instance = new ReactiveObject_1.default({});
                var initialVersion = instance.getVersion();
                instance.foo = 'bar';
                chai_1.assert.equal(instance.getVersion(), initialVersion);
            });
            it('should update version on nested object update', function () {
                var instance = new ReactiveObject_1.default({
                    foo: new ReactiveObject_1.default({
                        bar: 'baz'
                    })
                });
                var initialVersion = instance.getVersion();
                chai_1.assert.equal(initialVersion, instance.getVersion());
                instance.foo.bar = 'newbie';
                var version = instance.getVersion();
                chai_1.assert.notEqual(version, initialVersion);
                chai_1.assert.equal(version, instance.getVersion());
                instance.foo.bar = 'dewbie';
                chai_1.assert.notEqual(version, instance.getVersion());
            });
        });
    });
});
