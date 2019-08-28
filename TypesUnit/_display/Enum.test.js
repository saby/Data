define(["require", "exports", "chai", "Types/_display/Enum", "Types/_collection/Enum"], function (require, exports, chai_1, Enum_1, Enum_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_display/Enum', function () {
        var dict;
        var localeDict;
        var collection;
        var display;
        var holeyDict;
        var holeyCollection;
        var holeyDisplay;
        beforeEach(function () {
            dict = ['one', 'two', 'three'];
            localeDict = ['uno', 'dos', 'tres'];
            holeyDict = { 1: 'one', 4: 'two', 6: 'three' };
            collection = new Enum_2.default({
                dictionary: dict
            });
            holeyCollection = new Enum_2.default({
                dictionary: holeyDict
            });
            display = new Enum_1.default({
                collection: collection
            });
            holeyDisplay = new Enum_1.default({
                collection: holeyCollection
            });
        });
        afterEach(function () {
            dict = undefined;
            display.destroy();
            display = undefined;
            collection.destroy();
            collection = undefined;
        });
        describe('.constructor()', function () {
            it('should throw an error for not IEnum', function () {
                var display;
                chai_1.assert.throws(function () {
                    display = new Enum_1.default({
                        collection: []
                    });
                });
                chai_1.assert.throws(function () {
                    display = new Enum_1.default({
                        collection: {}
                    });
                });
                chai_1.assert.throws(function () {
                    display = new Enum_1.default({
                        collection: null
                    });
                });
                chai_1.assert.throws(function () {
                    display = new Enum_1.default();
                });
                chai_1.assert.isUndefined(display);
            });
            it('should take current from the Enum', function () {
                chai_1.assert.strictEqual(display.getCurrent(), undefined);
                chai_1.assert.strictEqual(display.getCurrentPosition(), -1);
                collection.set(1);
                var displayToo = new Enum_1.default({
                    collection: collection
                });
                chai_1.assert.strictEqual(displayToo.getCurrent().getContents(), collection.getAsValue());
                chai_1.assert.strictEqual(displayToo.getCurrentPosition(), collection.get());
            });
        });
        describe('.each()', function () {
            it('should return original values', function () {
                var collection = new Enum_2.default({
                    dictionary: dict
                });
                var display = new Enum_1.default({
                    collection: collection
                });
                display.each(function (item, index) {
                    chai_1.assert.strictEqual(item.getContents(), dict[index]);
                });
            });
            it('should return localized values', function () {
                var collection = new Enum_2.default({
                    dictionary: dict,
                    localeDictionary: localeDict
                });
                var display = new Enum_1.default({
                    collection: collection
                });
                display.each(function (item, index) {
                    chai_1.assert.strictEqual(item.getContents(), localeDict[index]);
                });
            });
        });
        describe('.setCurrent()', function () {
            it('should change current of the Enum', function () {
                for (var index = 0; index < dict.length; index++) {
                    var item = display.at(index);
                    display.setCurrent(item);
                    chai_1.assert.strictEqual(collection.get(), index);
                    chai_1.assert.strictEqual(collection.getAsValue(), item.getContents());
                }
            });
        });
        describe('.setCurrentPosition()', function () {
            it('should change current of the Enum', function () {
                for (var index = 0; index < dict.length; index++) {
                    display.setCurrentPosition(index);
                    var item = display.getCurrent();
                    chai_1.assert.strictEqual(collection.get(), index);
                    chai_1.assert.strictEqual(collection.getAsValue(), item.getContents());
                }
            });
            it('should reset the Enum', function () {
                var collection = new Enum_2.default({
                    dictionary: dict,
                    index: 0
                });
                var display = new Enum_1.default({
                    collection: collection
                });
                chai_1.assert.strictEqual(collection.get(), 0);
                display.setCurrentPosition(-1);
                chai_1.assert.isNull(collection.get());
            });
        });
        describe('.moveToNext()', function () {
            it('should change current of the Enum', function () {
                while (display.moveToNext()) {
                    var index = display.getCurrentPosition();
                    var item = display.getCurrent();
                    chai_1.assert.strictEqual(collection.get(), index);
                    chai_1.assert.strictEqual(collection.getAsValue(), item.getContents());
                }
            });
        });
        describe('.moveToPrevious()', function () {
            it('should change current of the Enum', function () {
                display.moveToLast();
                while (display.moveToPrevious()) {
                    var index = display.getCurrentPosition();
                    var item = display.getCurrent();
                    chai_1.assert.strictEqual(collection.get(), index);
                    chai_1.assert.strictEqual(collection.getAsValue(), item.getContents());
                }
            });
        });
        describe('.getIndexBySourceItem()', function () {
            it('should return value index', function () {
                for (var index = 0; index < dict.length; index++) {
                    chai_1.assert.equal(display.getIndexBySourceItem(dict[index]), index);
                }
            });
            it('should return localized value index', function () {
                var collection = new Enum_2.default({
                    dictionary: dict,
                    localeDictionary: localeDict
                });
                var display = new Enum_1.default({
                    collection: collection
                });
                for (var index = 0; index < localeDict.length; index++) {
                    chai_1.assert.equal(display.getIndexBySourceItem(localeDict[index]), index);
                }
            });
        });
        describe('.getSourceIndexByItem()', function () {
            it('should return localized value index', function () {
                var collection = new Enum_2.default({
                    dictionary: dict,
                    localeDictionary: localeDict
                });
                var display = new Enum_1.default({
                    collection: collection
                });
                var item = display.at(0);
                chai_1.assert.equal(display.getSourceIndexByItem(item), 0);
            });
            it('should return right source index if enum have holes', function () {
                var item = holeyDisplay.at(1);
                chai_1.assert.equal(holeyDisplay.getSourceIndexByItem(item), 4);
            });
        });
        describe('.getIndexBySourceIndex()', function () {
            it('should return right source index if enum have holes', function () {
                chai_1.assert.equal(holeyDisplay.getIndexBySourceIndex(4), 1);
            });
        });
        describe('.subscribe()', function () {
            it('should trigger "onCurrentChange" if current of the Enum changed', function () {
                var given = {};
                var handler = function (event, newCurrent, oldCurrent, newPosition, oldPosition) {
                    given.newCurrent = newCurrent;
                    given.oldCurrent = oldCurrent;
                    given.newPosition = newPosition;
                    given.oldPosition = oldPosition;
                };
                display.subscribe('onCurrentChange', handler);
                collection.set(0);
                display.unsubscribe('onCurrentChange', handler);
                chai_1.assert.strictEqual(given.newCurrent.getContents(), collection.getAsValue());
                chai_1.assert.strictEqual(given.oldCurrent, undefined);
                chai_1.assert.strictEqual(given.newPosition, collection.get());
                chai_1.assert.strictEqual(given.oldPosition, -1);
            });
        });
    });
});
