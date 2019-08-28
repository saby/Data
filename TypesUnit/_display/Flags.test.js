define(["require", "exports", "chai", "Types/_display/Flags", "Types/_collection/Flags", "Core/core-instance"], function (require, exports, chai_1, Flags_1, Flags_2, coreInstance) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_display/Flags', function () {
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
        describe('.constructor()', function () {
            it('should throw an error for not IFlags', function () {
                var display;
                chai_1.assert.throws(function () {
                    display = new Flags_1.default({
                        collection: []
                    });
                });
                chai_1.assert.throws(function () {
                    display = new Flags_1.default({
                        collection: {}
                    });
                });
                chai_1.assert.throws(function () {
                    display = new Flags_1.default({
                        collection: null
                    });
                });
                chai_1.assert.throws(function () {
                    display = new Flags_1.default();
                });
                chai_1.assert.isUndefined(display);
            });
            it('should take selection from the Flags', function () {
                display.each(function (item) {
                    chai_1.assert.strictEqual(item.isSelected(), collection.get(item.getContents()));
                });
                collection.set('one', true);
                var displayToo = new Flags_1.default({
                    collection: collection
                });
                displayToo.each(function (item) {
                    chai_1.assert.strictEqual(item.isSelected(), collection.get(item.getContents()));
                });
            });
        });
        describe('.each()', function () {
            it('should return FlagsItem', function () {
                display.each(function (item) {
                    chai_1.assert.isTrue(coreInstance.instanceOfModule(item, 'Types/_display/FlagsItem'));
                });
            });
        });
        describe('.subscribe()', function () {
            it('should trigger "onCollectionChange" if flag changed', function () {
                var given = {};
                var handler = function (event, action, newItems, newItemsIndex) {
                    given.item = newItems[0];
                    given.index = newItemsIndex;
                };
                display.subscribe('onCollectionChange', handler);
                collection.set('one', true);
                display.unsubscribe('onCollectionChange', handler);
                chai_1.assert.strictEqual(given.item.getContents(), 'one');
                chai_1.assert.strictEqual(given.index, 0);
            });
            it('should trigger "onCollectionChange" if all flags changed', function () {
                var given = [];
                var handler = function (event, action, items, index) {
                    given.push({
                        action: action,
                        items: items,
                        index: index
                    });
                };
                display.subscribe('onCollectionChange', handler);
                collection.fromArray([true, true, true]);
                display.unsubscribe('onCollectionChange', handler);
                var expected = [{
                        action: 'ch',
                        items: [display.at(0)],
                        index: 0
                    }, {
                        action: 'ch',
                        items: [display.at(1)],
                        index: 1
                    }, {
                        action: 'ch',
                        items: [display.at(2)],
                        index: 2
                    }];
                chai_1.assert.deepEqual(given, expected);
            });
        });
        it('should trigger "onCollectionChange" if flag with string index changed', function () {
            var dict = { 1: 'one', 2: 'two', 3: 'three' };
            var collection = new Flags_2.default({
                dictionary: dict
            });
            var display = new Flags_1.default({
                collection: collection
            });
            var given = {};
            var handler = function (event, action, newItems, newItemsIndex) {
                given.item = newItems[0];
                given.index = newItemsIndex;
            };
            display.subscribe('onCollectionChange', handler);
            collection.set('two', true);
            display.unsubscribe('onCollectionChange', handler);
            chai_1.assert.strictEqual(given.item.getContents(), 'two');
            chai_1.assert.strictEqual(given.index, 1);
        });
    });
});
