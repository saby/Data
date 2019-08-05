define(["require", "exports", "chai", "Types/_entity/Time"], function (require, exports, chai_1, Time_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_entity/Time', function () {
        describe('.constructor()', function () {
            it('should create instance of Time', function () {
                var instance = new Time_1.default();
                chai_1.assert.instanceOf(instance, Time_1.default);
            });
        });
    });
});
