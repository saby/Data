define(["require", "exports", "chai", "Types/_object/merge"], function (require, exports, chai_1, merge_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_object/merge', function () {
        it('should merge two objects', function () {
            var origin = {
                a: 1
            };
            var ext = {
                b: 1
            };
            chai_1.assert.deepEqual(merge_1.default(origin, ext), { a: 1, b: 1 });
        });
        it('should replace value in the same fields', function () {
            var origin = {
                a: 1
            };
            var ext = {
                a: 2
            };
            merge_1.default(origin, ext);
            chai_1.assert.equal(origin.a, 2);
        });
        it('should merge two objects recursive', function () {
            var origin = {
                a: {
                    b: 1,
                    c: 2
                }
            };
            var ext = {
                a: {
                    c: 3
                }
            };
            merge_1.default(origin, ext);
            chai_1.assert.deepEqual(origin, { a: { b: 1, c: 3 } });
        });
        it('should merge arrays', function () {
            var origin = ['one', 'two'];
            var ext = ['uno'];
            merge_1.default(origin, ext);
            chai_1.assert.deepEqual(origin, ['uno', 'two']);
        });
        it('should merge array in object', function () {
            var origin = { foo: [1, 2, 3, 4] };
            var ext = { foo: [5, 4] };
            merge_1.default(origin, ext);
            chai_1.assert.deepEqual(origin, { foo: [5, 4, 3, 4] });
        });
        it('should merge Dates', function () {
            var soThen = new Date(0);
            var soNow = new Date(1);
            var origin = {
                then: soThen,
                now: new Date(2)
            };
            var ext = { now: soNow };
            var result = merge_1.default({}, origin, ext);
            chai_1.assert.deepEqual(result, {
                then: soThen,
                now: soNow
            });
        });
        it('should prevent endless recursiion', function () {
            var repeat = {
                a: {
                    b: null
                }
            };
            repeat.a.b = repeat;
            var result = merge_1.default({
                a: {
                    b: {
                        a: {}
                    }
                }
            }, repeat);
            chai_1.assert.strictEqual(result.a.b.a, repeat.a);
        });
    });
});
