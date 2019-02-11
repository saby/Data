define("Lib/Storage/LocalStorage", ["require", "exports", "Browser/Storage", "Env/Env"], function (require, exports, Storage_1, Env_1) {
    "use strict";
    Env_1.IoC.resolve('ILogger').log("Lib/Storage/LocalStorage", 'module has been moved to "Browser/Storage:LocalStorage" and will be removed');
    return Storage_1.LocalStorage;
});
