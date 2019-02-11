define(["require", "exports"], function (require, exports) {
    "use strict";
    function randomId(prefix) {
        return (prefix || 'ws-') + Math.random().toString(36).substr(2) + (+new Date());
    }
    return randomId;
});
