define(["require", "exports", "chai", "Types/_display/Flags", "Types/_collection/Flags"], function (require, exports, chai_1, Flags_1, Flags_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_display/FlagsItem', function () {
        var dict;
        var collection;
        var display;
        beforeEach(function () {
            dict = ['one', 'two', 'three'];
            collection = new Flags_2.default({
                dictionary: dict
            });
            display = new Flags_1.default({
                collection: collection
            });
        });
        afterEach(function () {
            dict = undefined;
            display.destroy();
            display = undefined;
            collection.destroy();
            collection = undefined;
        });
        describe('.isSelected()', function () {
            it('should return value from the Flags', function () {
                collection.set('two', true);
                collection.set('three', false);
                display.each(function (item) {
                    chai_1.assert.strictEqual(item.isSelected(), collection.get(item.getContents()));
                });
            });
            it('should return value from localized Flags', function () {
                var dict = ['one', 'two', 'three'];
                var localeDict = ['uno', 'dos', 'tres'];
                var expected = [true, false, true];
                collection = new Flags_2.default({
                    dictionary: dict,
                    localeDictionary: localeDict,
                    values: expected
                });
                var display = new Flags_1.default({
                    collection: collection
                });
                display.each(function (item, index) {
                    chai_1.assert.strictEqual(item.isSelected(), expected[index]);
                });
            });
        });
        describe('.setSelected()', function () {
            it('should translate value to the Flags', function () {
                var values = [true, false, null];
                display.each(function (item, index) {
                    item.setSelected(values[index]);
                    chai_1.assert.strictEqual(item.isSelected(), values[index]);
                    chai_1.assert.strictEqual(collection.get(item.getContents()), values[index]);
                });
            });
            it('should translate localized value to the Flags', function () {
                var dict = ['one', 'two', 'three'];
                var localeDict = ['uno', 'dos', 'tres'];
                var values = [true, false, null];
                collection = new Flags_2.default({
                    dictionary: dict,
                    localeDictionary: localeDict
                });
                var display = new Flags_1.default({
                    collection: collection
                });
                display.each(function (item, index) {
                    item.setSelected(values[index]);
                    chai_1.assert.strictEqual(item.isSelected(), values[index]);
                    chai_1.assert.strictEqual(collection.get(item.getContents(), true), values[index]);
                });
            });
        });
    });
});
