define(["require", "exports", "tslib", "chai", "Types/_source/Local", "Types/_entity/adapter/JsonTable"], function (require, exports, tslib_1, chai_1, Local_1, JsonTable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestLocal = /** @class */ (function (_super) {
        tslib_1.__extends(TestLocal, _super);
        function TestLocal(options) {
            return _super.call(this, options) || this;
        }
        TestLocal.prototype._applyFrom = function (from) {
            return undefined;
        };
        TestLocal.prototype._applyJoin = function (data, join) {
            return undefined;
        };
        TestLocal.prototype._getTableAdapter = function () {
            return new JsonTable_1.default();
        };
        return TestLocal;
    }(Local_1.default));
    describe('Types/_source/Local', function () {
        var source;
        beforeEach(function () {
            source = new TestLocal();
        });
        afterEach(function () {
            source = undefined;
        });
        describe('.create()', function () {
            it('should generate a request with Date field', function (done) {
                var date = new Date();
                if (!date.setSQLSerializationMode) {
                    done();
                }
                date.setSQLSerializationMode(Date.SQL_SERIALIZE_MODE_DATE);
                var meta = { foo: date };
                source.create(meta).addCallbacks(function (data) {
                    try {
                        chai_1.assert.instanceOf(data.get('foo'), Date);
                        chai_1.assert.strictEqual(data.get('foo').getSQLSerializationMode(), Date.SQL_SERIALIZE_MODE_DATE);
                        done();
                    }
                    catch (err) {
                        done(err);
                    }
                }, function (err) {
                    done(err);
                });
            });
            it('should generate a request with Time field', function (done) {
                var date = new Date();
                if (!date.setSQLSerializationMode) {
                    done();
                }
                date.setSQLSerializationMode(Date.SQL_SERIALIZE_MODE_TIME);
                var meta = { foo: date };
                source.create(meta).addCallbacks(function (data) {
                    try {
                        chai_1.assert.instanceOf(data.get('foo'), Date);
                        chai_1.assert.strictEqual(data.get('foo').getSQLSerializationMode(), Date.SQL_SERIALIZE_MODE_TIME);
                        done();
                    }
                    catch (err) {
                        done(err);
                    }
                }, function (err) {
                    done(err);
                });
            });
        });
    });
});
