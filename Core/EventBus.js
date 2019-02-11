define(["require", "exports"], function (require, exports) {
    "use strict";
    var Channel = /** @class */ (function () {
        function Channel() {
            this.handlers = new Map();
        }
        Channel.prototype.publish = function (name) {
        };
        Channel.prototype.subscribe = function (event, handler, ctx) {
            var handlers = this.handlers.get(event) || [];
            handlers.push(handler);
            this.handlers.set(event, handlers);
        };
        Channel.prototype.unsubscribe = function (event, handler, ctx) {
            var handlers = this.handlers.get(event);
            if (handlers) {
                var index = 0;
                while (index > -1) {
                    index = handlers.indexOf(handler);
                    if (index > -1) {
                        handlers.splice(index, 1);
                    }
                }
            }
        };
        Channel.prototype.unsubscribeAll = function () {
            this.handlers = new Map();
        };
        Channel.prototype.getEventHandlers = function (event) {
            return [];
        };
        Channel.prototype.hasEventHandlers = function (event) {
            return false;
        };
        Channel.prototype.destroy = function () {
            this.unsubscribeAll();
        };
        Channel.prototype._notifyWithTarget = function (event, target) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
        };
        return Channel;
    }());
    var EventBus = /** @class */ (function () {
        function EventBus() {
        }
        EventBus.channel = function () {
            return new Channel();
        };
        return EventBus;
    }());
    return EventBus;
});
