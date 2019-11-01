define(["require", "exports", "chai", "Types/_entity/functor/Abstract", "Types/_entity/functor/Compute"], function (require, exports, chai_1, Abstract_1, Compute_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_entity/functor/Compute', function () {
        describe('::create()', function () {
            it('should return Compute functor', function () {
                var functor = Compute_1.default.create(function () { return undefined; });
                chai_1.assert.isTrue(Compute_1.default.isFunctor(functor));
            });
            it('should return a functor with given properties', function () {
                var functor = Compute_1.default.create(function () { return undefined; }, ['foo', 'bar']);
                chai_1.assert.deepEqual(functor.properties, ['foo', 'bar']);
            });
            it('should throw TypeError on invalid arguments', function () {
                var instance;
                chai_1.assert.throws(function () {
                    instance = Compute_1.default.create(function () { return undefined; }, {});
                }, TypeError);
                chai_1.assert.isUndefined(instance);
            });
        });
        describe('::isFunctor()', function () {
            it('should return true for Compute functor', function () {
                var functor = Compute_1.default.create(function () { return undefined; });
                chai_1.assert.isTrue(Compute_1.default.isFunctor(functor));
            });
            it('should return false for not Compute functor', function () {
                var functor = Abstract_1.default.create(function () { return undefined; });
                chai_1.assert.isFalse(Compute_1.default.isFunctor(functor));
            });
        });
    });
});
