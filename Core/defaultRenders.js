define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function real(value, decimals, delimiters, floor) {
        var ceil = decimals === 0 ? Math.round(value) : Math.round(value / decimals) * decimals;
        return String(ceil);
    }
    exports.real = real;
});
