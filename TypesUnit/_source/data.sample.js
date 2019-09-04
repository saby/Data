define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var barFunction = (function () {
        var bar = function () { return undefined; };
        bar.toJSON = function () {
            return {
                $serialized$: 'func',
                module: 'test/_source/data.sample',
                path: 'barFunction'
            };
        };
        return bar;
    })();
    exports.barFunction = barFunction;
    var arrayWithFunctions = [{
            foo: 'foo',
            bar: barFunction
        }];
    exports.arrayWithFunctions = arrayWithFunctions;
});
