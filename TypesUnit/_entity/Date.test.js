define(["require", "exports", "chai", "Types/_entity/Date"], function (require, exports, chai_1, Date_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_entity/Date', function () {
        describe('.constructor()', function () {
            it('should create instance of Date', function () {
                var instance = new Date_1.default();
                chai_1.assert.instanceOf(instance, Date_1.default);
            });
        });
    });
});
