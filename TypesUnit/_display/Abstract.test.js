define(["require", "exports", "chai", "Types/_display/Abstract", "Types/_display/Collection", "Types/_collection/List", "Types/_collection/Enum", "Types/_display/Enum", "Types/_collection/Flags", "Types/_display/Flags", "Types/display"], function (require, exports, chai_1, Abstract_1, Collection_1, List_1, Enum_1, Enum_2, Flags_1, Flags_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_display/Abstract', function () {
        describe('.getDefaultDisplay()', function () {
            it('should return a display', function () {
                var list = new List_1.default();
                chai_1.assert.instanceOf(Abstract_1.default.getDefaultDisplay(list), Abstract_1.default);
            });
            it('should return the special display for Array', function () {
                var options = { keyProperty: 'foo' };
                var display = Abstract_1.default.getDefaultDisplay([], options);
                chai_1.assert.instanceOf(display, Collection_1.default);
                chai_1.assert.equal(display.getKeyProperty(), options.keyProperty);
            });
            it('should return the special display for List', function () {
                var collection = new List_1.default();
                var display = Abstract_1.default.getDefaultDisplay(collection);
                chai_1.assert.instanceOf(display, Collection_1.default);
            });
            it('should return the special display for Enum', function () {
                var collection = new Enum_1.default();
                var display = Abstract_1.default.getDefaultDisplay(collection);
                chai_1.assert.instanceOf(display, Enum_2.default);
            });
            it('should return the special display for Flags', function () {
                var collection = new Flags_1.default();
                var display = Abstract_1.default.getDefaultDisplay(collection);
                chai_1.assert.instanceOf(display, Flags_2.default);
            });
            it('should throw an error for not IEnumerable', function () {
                chai_1.assert.throws(function () {
                    Abstract_1.default.getDefaultDisplay({});
                });
                chai_1.assert.throws(function () {
                    Abstract_1.default.getDefaultDisplay(null);
                });
                chai_1.assert.throws(function () {
                    Abstract_1.default.getDefaultDisplay(undefined);
                });
            });
            it('should return various instances', function () {
                var list = new List_1.default();
                var displayA = Abstract_1.default.getDefaultDisplay(list);
                var displayB = Abstract_1.default.getDefaultDisplay(list);
                chai_1.assert.notEqual(displayA, displayB);
            });
            it('should return same instances', function () {
                var list = new List_1.default();
                var displayA = Abstract_1.default.getDefaultDisplay(list, {}, true);
                var displayB = Abstract_1.default.getDefaultDisplay(list, {}, true);
                chai_1.assert.strictEqual(displayA, displayB);
            });
        });
        describe('.releaseDefaultDisplay()', function () {
            it('should return true if the display has been retrieved as singleton', function () {
                var list = new List_1.default();
                var display = Abstract_1.default.getDefaultDisplay(list, {}, true);
                chai_1.assert.isTrue(Abstract_1.default.releaseDefaultDisplay(display));
            });
            it('should return true if the display has been retrieved as not singleton', function () {
                var list = new List_1.default();
                var display = Abstract_1.default.getDefaultDisplay(list);
                chai_1.assert.isFalse(Abstract_1.default.releaseDefaultDisplay(display));
            });
            it('should destroy the instance after last one was released', function () {
                var list = new List_1.default();
                var displayA = Abstract_1.default.getDefaultDisplay(list, {}, true);
                var displayB = Abstract_1.default.getDefaultDisplay(list, {}, true);
                Abstract_1.default.releaseDefaultDisplay(displayA);
                chai_1.assert.isFalse(displayA.destroyed);
                Abstract_1.default.releaseDefaultDisplay(displayB);
                chai_1.assert.isTrue(displayA.destroyed);
                chai_1.assert.isTrue(displayB.destroyed);
            });
            it('should force getDefaultDisplay return a new instance after last one was released', function () {
                var list = new List_1.default();
                var displayA = Abstract_1.default.getDefaultDisplay(list, {}, true);
                var displayB = Abstract_1.default.getDefaultDisplay(list, {}, true);
                Abstract_1.default.releaseDefaultDisplay(displayA);
                Abstract_1.default.releaseDefaultDisplay(displayB);
                var displayC = Abstract_1.default.getDefaultDisplay(list, {}, true);
                chai_1.assert.notEqual(displayC, displayA);
                chai_1.assert.notEqual(displayC, displayB);
            });
        });
    });
});
