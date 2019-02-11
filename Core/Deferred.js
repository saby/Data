define(["require", "exports"], function (require, exports) {
    "use strict";
    var Deferred = /** @class */ (function () {
        function Deferred() {
            var _this = this;
            this.wrapper = new Promise(function (resolve, reject) {
                _this.resolver = function (result) {
                    _this.result = result;
                    resolve(result);
                };
                _this.rejecter = function (result) {
                    _this.result = result;
                    reject(result);
                };
            });
        }
        Deferred.prototype.cancel = function () {
            this.rejecter(new Error('Cancelled'));
        };
        Deferred.prototype.callback = function (res) {
            this.resolver(res);
            return this;
        };
        Deferred.prototype.errback = function (res) {
            this.rejecter(res);
            return this;
        };
        Deferred.prototype.addCallback = function (fn) {
            this.wrapper.then(fn);
            return this;
        };
        Deferred.prototype.addErrback = function (fn) {
            this.wrapper.catch(fn);
            return this;
        };
        Deferred.prototype.addCallbacks = function (cb, eb) {
            this.wrapper.then(cb, eb);
            return this;
        };
        Deferred.prototype.dependOn = function (master) {
            master.then(this.resolver, this.rejecter);
            return this;
        };
        Deferred.prototype.createDependent = function () {
            var dependent = new Deferred();
            return dependent.dependOn(this);
        };
        Deferred.prototype.isReady = function () {
            return this.result !== undefined;
        };
        Deferred.prototype.getResult = function () {
            return this.result;
        };
        Deferred.success = function (result) {
            return new Deferred().callback(result);
        };
        Deferred.fail = function (result) {
            var err = result instanceof Error ? result : new Error(result ? String(result) : '');
            return new Deferred().errback(err);
        };
        return Deferred;
    }());
    return Deferred;
});
