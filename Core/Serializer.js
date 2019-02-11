define(["require", "exports"], function (require, exports) {
    "use strict";
    var Serializer = /** @class */ (function () {
        function Serializer() {
        }
        Serializer.prototype.serialize = function (name, value) {
            return value;
        };
        Serializer.prototype.deserialize = function (name, value) {
            return value;
        };
        return Serializer;
    }());
    return Serializer;
});
