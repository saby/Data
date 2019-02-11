define(["require", "exports"], function (require, exports) {
    "use strict";
    var I18n = /** @class */ (function () {
        function I18n() {
        }
        I18n.prototype.isEnabled = function () {
            return false;
        };
        I18n.prototype.setEnable = function (enable) {
        };
        I18n.prototype.getLang = function () {
            return '';
        };
        return I18n;
    }());
    var i18n = new I18n();
    return i18n;
});
