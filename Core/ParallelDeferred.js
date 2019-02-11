define(["require", "exports", "./Deferred"], function (require, exports, Deferred) {
    "use strict";
    var ParallelDeferred = /** @class */ (function () {
        function ParallelDeferred() {
        }
        ParallelDeferred.prototype.push = function (item) {
        };
        ParallelDeferred.prototype.done = function () {
            return this;
        };
        ParallelDeferred.prototype.getResult = function () {
            return new Deferred();
        };
        return ParallelDeferred;
    }());
    return ParallelDeferred;
});
