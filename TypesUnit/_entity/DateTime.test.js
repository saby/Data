define(["require", "exports", "chai", "Types/_entity/DateTime"], function (require, exports, chai_1, DateTime_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_entity/DateTime', function () {
        describe('.constructor()', function () {
            it('should create instance of Date', function () {
                var instance = new DateTime_1.default();
                chai_1.assert.instanceOf(instance, Date);
            });
        });
        describe('.toJSON()', function () {
            it('should save milliseconds into $options', function () {
                var instance = new DateTime_1.default();
                var time = instance.getTime();
                var serialized = instance.toJSON();
                chai_1.assert.equal(serialized.state.$options, time);
            });
        });
        describe('::fromJSON()', function () {
            it('should create date from $options', function () {
                var time = 1234567890;
                var instance = DateTime_1.default.fromJSON({
                    $serialized$: 'inst',
                    module: '',
                    id: 0,
                    state: {
                        $options: time
                    }
                });
                chai_1.assert.equal(instance.getTime(), time);
            });
        });
    });
});
