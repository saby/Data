define(["require", "exports"], function (require, exports) {
    "use strict";
    var RPCJSON = /** @class */ (function () {
        function RPCJSON() {
        }
        RPCJSON.prototype.callMethod = function (name, args) {
            throw new Error("RPCJSON::callMethod(" + name + ", " + args + ")");
        };
        return RPCJSON;
    }());
    return RPCJSON;
});
