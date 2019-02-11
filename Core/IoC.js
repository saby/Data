define(["require", "exports"], function (require, exports) {
    "use strict";
    var IoC = /** @class */ (function () {
        function IoC() {
            this.bindings = new Map();
        }
        IoC.prototype.resolve = function (name) {
            return this.bindings.get(name);
        };
        IoC.prototype.bind = function (name, value) {
            this.bindings.set(name, value);
        };
        IoC.prototype.bindSingle = function (name, value) {
            this.bindings.set(name, value);
        };
        return IoC;
    }());
    var ioc = new IoC();
    return ioc;
});
