define(["require", "exports"], function (require, exports) {
    "use strict";
    var Constants = /** @class */ (function () {
        function Constants() {
        }
        Object.defineProperty(Constants, "compatibility", {
            get: function () {
                return {
                    dateBug: false
                };
            },
            enumerable: true,
            configurable: true
        });
        return Constants;
    }());
    return Constants;
});
