define(["require", "exports", "chai", "Types/_display/itemsStrategy/Direct", "Types/_display/Collection", "Types/_display/CollectionItem", "Types/_collection/List", "Types/_collection/Enum"], function (require, exports, chai_1, Direct_1, Collection_1, CollectionItem_1, List_1, Enum_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_display/itemsStrategy/Direct', function () {
        function getStrategy(display) {
            return new Direct_1.default({
                display: display
            });
        }
        var items;
        var list;
        var display;
        var strategy;
        beforeEach(function () {
            items = [1, 2, 3];
            list = new List_1.default({ items: items });
            display = new Collection_1.default({ collection: list });
            strategy = getStrategy(display);
        });
        afterEach(function () {
            items = undefined;
            list = undefined;
            display = undefined;
            strategy = undefined;
        });
        describe('.at()', function () {
            it('should return a CollectionItem', function () {
                items.forEach(function (item, index) {
                    chai_1.assert.instanceOf(strategy.at(index), CollectionItem_1.default);
                    chai_1.assert.strictEqual(strategy.at(index).getContents(), item);
                });
            });
            it('should return the same CollectionItem twice', function () {
                items.forEach(function (item, index) {
                    chai_1.assert.strictEqual(strategy.at(index), strategy.at(index));
                });
            });
        });
        describe('.count', function () {
            it('should return items count for List', function () {
                chai_1.assert.strictEqual(strategy.count, items.length);
            });
            it('should return items count for Enumerable', function () {
                var list = new Enum_1.default({ dictionary: items });
                var display = new Collection_1.default({ collection: list });
                var strategy = getStrategy(display);
                chai_1.assert.strictEqual(strategy.count, items.length);
            });
            it('should return intitial items count if List count changed', function () {
                var expect = list.getCount();
                chai_1.assert.strictEqual(strategy.count, expect);
                list.removeAt(0);
                chai_1.assert.strictEqual(strategy.count, expect);
            });
        });
        describe('.items', function () {
            it('should return an items', function () {
                chai_1.assert.strictEqual(strategy.items.length, items.length);
                items.forEach(function (item, index) {
                    chai_1.assert.strictEqual(strategy.items[index].getContents(), items[index]);
                });
            });
        });
        describe('.splice()', function () {
            it('should add items', function () {
                chai_1.assert.strictEqual(strategy.items.length, items.length);
                items.splice(0, 0, 4, 5);
                strategy.splice(0, 0, items.slice(0, 2));
                chai_1.assert.strictEqual(strategy.items.length, items.length);
                chai_1.assert.strictEqual(strategy.items[0].getContents(), items[0]);
                chai_1.assert.strictEqual(strategy.items[1].getContents(), items[1]);
            });
            it('should remove items', function () {
                strategy.splice(0, 2);
                chai_1.assert.strictEqual(strategy.items.length, items.length - 2);
            });
        });
        describe('.reset()', function () {
            it('should re-create items', function () {
                var prevItems = [];
                items.forEach(function (item, index) {
                    prevItems.push(strategy.at(index));
                });
                strategy.reset();
                items.forEach(function (item, index) {
                    chai_1.assert.notEqual(strategy.at(index), prevItems[index]);
                });
            });
        });
        describe('.getDisplayIndex()', function () {
            it('should return equal indices', function () {
                items.forEach(function (item, index) {
                    chai_1.assert.strictEqual(strategy.getDisplayIndex(index), index);
                });
            });
            it('should return shifted indices in unique mode if source has repeats', function () {
                var items = [
                    { id: 1 },
                    { id: 1 },
                    { id: 2 }
                ];
                var list = new List_1.default({ items: items });
                var display = new Collection_1.default({ collection: list });
                var strategy = new Direct_1.default({
                    display: display,
                    keyProperty: 'id',
                    unique: true
                });
                var expected = [0, 2, 1];
                items.forEach(function (item, index) {
                    chai_1.assert.strictEqual(strategy.getDisplayIndex(index), expected[index]);
                });
            });
        });
        describe('.getCollectionIndex()', function () {
            it('should return equal indices', function () {
                items.forEach(function (item, index) {
                    chai_1.assert.strictEqual(strategy.getCollectionIndex(index), index);
                });
            });
            it('should return shifted indices in unique mode if source has repeats', function () {
                var items = [
                    { id: 1 },
                    { id: 1 },
                    { id: 2 }
                ];
                var list = new List_1.default({ items: items });
                var display = new Collection_1.default({ collection: list });
                var strategy = new Direct_1.default({
                    display: display,
                    keyProperty: 'id',
                    unique: true
                });
                var expected = [0, 2, -1];
                items.forEach(function (item, index) {
                    chai_1.assert.strictEqual(strategy.getCollectionIndex(index), expected[index]);
                });
            });
        });
        describe('::sortItems()', function () {
            it('should return original order by default', function () {
                var items = [{}, {}, {}];
                var expected = [0, 1, 2];
                var given = Direct_1.default.sortItems(items, {});
                chai_1.assert.deepEqual(given, expected);
            });
            it('should return items with unique ids', function () {
                var items = [
                    new CollectionItem_1.default({ contents: { id: 1 } }),
                    new CollectionItem_1.default({ contents: { id: 2 } }),
                    new CollectionItem_1.default({ contents: { id: 1 } }),
                    new CollectionItem_1.default({ contents: { id: 3 } })
                ];
                var options = {
                    unique: true,
                    keyProperty: 'id'
                };
                var expected = [0, 1, 3];
                var given = Direct_1.default.sortItems(items, options);
                chai_1.assert.deepEqual(given, expected);
            });
        });
    });
});
