define(["require", "exports", "chai", "Types/_util/mixin"], function (require, exports, chai_1, mixin_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_util/mixin', function () {
        describe('applyMixins()', function () {
            it('should\'t inherit static method toJSON', function () {
                var Foo = /** @class */ (function () {
                    function Foo() {
                    }
                    return Foo;
                }());
                var BarMixin = /** @class */ (function () {
                    function BarMixin() {
                    }
                    BarMixin.toJSON = function () {
                        return {};
                    };
                    return BarMixin;
                }());
                mixin_1.applyMixins(Foo, BarMixin);
                chai_1.assert.isFalse(Foo.hasOwnProperty('toJSON'));
            });
        });
    });
});
