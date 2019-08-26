define(["require", "exports", "chai", "Types/_display/itemsStrategy/User", "Types/_display/CollectionItem"], function (require, exports, chai_1, User_1, CollectionItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_display/itemsStrategy/User', function () {
        function wrapItem(item) {
            return new CollectionItem_1.default({
                contents: item
            });
        }
        function getSource(items) {
            var wraps = items.map(wrapItem);
            return {
                '[Types/_display/IItemsStrategy]': true,
                options: {},
                source: null,
                get count() {
                    return wraps.length;
                },
                get items() {
                    return wraps.slice();
                },
                at: function (index) {
                    return wraps[index];
                },
                getDisplayIndex: function (index) {
                    return index;
                },
                getCollectionIndex: function (index) {
                    return index;
                },
                splice: function (start, deleteCount, added) {
                    added = added || [];
                    items.splice.apply(items, [start, deleteCount].concat(added));
                    return wraps.splice.apply(wraps, [start, deleteCount].concat(added.map(wrapItem)));
                },
                invalidate: function () {
                    // always up to date
                },
                reset: function () {
                    items.length = 0;
                    wraps.length = 0;
                }
            };
        }
        function getStrategy(source, handlers) {
            return new User_1.default({
                source: source,
                handlers: handlers
            });
        }
        var source;
        var strategy;
        beforeEach(function () {
            source = getSource(['one', 'two', 'three']);
            strategy = getStrategy(source, []);
        });
        afterEach(function () {
            source = undefined;
            strategy = undefined;
        });
        describe('.options', function () {
            it('should return the source options', function () {
                chai_1.assert.strictEqual(strategy.options, source.options);
            });
        });
        describe('.at()', function () {
            it('should return every item', function () {
                source.items.forEach(function (item, index) {
                    chai_1.assert.strictEqual(strategy.at(index), item);
                });
            });
            it('should return direct items order', function () {
                var source = getSource([1, 2, 3]);
                var strategy = getStrategy(source, [function (a, b) { return a.item.getContents() - b.item.getContents(); }]);
                var expected = [1, 2, 3];
                expected.forEach(function (item, index) {
                    chai_1.assert.strictEqual(strategy.at(index).getContents(), item);
                });
            });
            it('should return reversed items order', function () {
                var source = getSource([1, 2, 3]);
                var strategy = getStrategy(source, [function (a, b) { return b.item.getContents() - a.item.getContents(); }]);
                var expected = [3, 2, 1];
                expected.forEach(function (item, index) {
                    chai_1.assert.strictEqual(strategy.at(index).getContents(), item);
                });
            });
        });
        describe('.count', function () {
            it('should return items count', function () {
                chai_1.assert.strictEqual(strategy.count, source.items.length);
            });
        });
        describe('.items', function () {
            it('should return an items', function () {
                chai_1.assert.deepEqual(strategy.items, source.items);
            });
            it('should return direct items order', function () {
                var source = getSource([1, 2, 3]);
                var strategy = getStrategy(source, [function (a, b) { return a.item.getContents() - b.item.getContents(); }]);
                var items = strategy.items;
                var expected = [1, 2, 3];
                items.forEach(function (item, index) {
                    chai_1.assert.strictEqual(item.getContents(), expected[index]);
                });
                chai_1.assert.equal(items.length, expected.length);
            });
            it('should return direct items order', function () {
                var source = getSource([1, 2, 3]);
                var strategy = getStrategy(source, [function (a, b) { return b.item.getContents() - a.item.getContents(); }]);
                var items = strategy.items;
                var expected = [3, 2, 1];
                items.forEach(function (item, index) {
                    chai_1.assert.strictEqual(item.getContents(), expected[index]);
                });
                chai_1.assert.equal(items.length, expected.length);
            });
        });
        describe('.splice()', function () {
            it('should add items', function () {
                var items = ['1', '2'];
                var count = strategy.count;
                strategy.splice(0, 0, items);
                chai_1.assert.strictEqual(strategy.count, items.length + count);
            });
            it('should push item after latest source item', function () {
                var items = [1, 2, 3];
                var source = getSource(items);
                var strategy = getStrategy(source, []);
                var newItem = 4;
                strategy.splice(strategy.count, 0, [newItem]);
                chai_1.assert.strictEqual(items[items.length - 1], newItem);
            });
            it('should remove items', function () {
                strategy.splice(1, 2);
                chai_1.assert.strictEqual(strategy.at(0), source.items[0]);
                chai_1.assert.strictEqual(strategy.at(1), source.items[2]);
            });
        });
        describe('.reset()', function () {
            it('should reset items', function () {
                strategy.reset();
                chai_1.assert.strictEqual(strategy.items.length, 0);
            });
        });
        describe('.getDisplayIndex()', function () {
            it('should return equal indices', function () {
                source.items.forEach(function (item, index) {
                    chai_1.assert.strictEqual(strategy.getDisplayIndex(index), index);
                });
            });
            it('should return direct index', function () {
                var source = getSource([1, 2, 3]);
                var strategy = getStrategy(source, [function (a, b) { return a.item.getContents() - b.item.getContents(); }]);
                var expected = [0, 1, 2];
                expected.forEach(function (strategyIndex, collectionIndex) {
                    chai_1.assert.strictEqual(strategy.getDisplayIndex(collectionIndex), strategyIndex);
                });
            });
            it('should return reversed index', function () {
                var source = getSource([1, 2, 3]);
                var strategy = getStrategy(source, [function (a, b) { return b.item.getContents() - a.item.getContents(); }]);
                var expected = [2, 1, 0];
                expected.forEach(function (strategyIndex, collectionIndex) {
                    chai_1.assert.strictEqual(strategy.getDisplayIndex(collectionIndex), strategyIndex);
                });
            });
        });
        describe('.getCollectionIndex()', function () {
            it('should return equal indices', function () {
                source.items.forEach(function (item, index) {
                    chai_1.assert.strictEqual(strategy.getCollectionIndex(index), index);
                });
            });
            it('should return direct index', function () {
                var source = getSource([1, 2, 3]);
                var strategy = getStrategy(source, [function (a, b) { return a.item.getContents() - b.item.getContents(); }]);
                var expected = [0, 1, 2];
                expected.forEach(function (collectionIndex, strategyIndex) {
                    chai_1.assert.strictEqual(strategy.getCollectionIndex(collectionIndex), strategyIndex);
                });
            });
            it('should return reversed index', function () {
                var source = getSource([1, 2, 3]);
                var strategy = getStrategy(source, [function (a, b) { return b.item.getContents() - a.item.getContents(); }]);
                var expected = [2, 1, 0];
                expected.forEach(function (collectionIndex, strategyIndex) {
                    chai_1.assert.strictEqual(strategy.getCollectionIndex(collectionIndex), strategyIndex);
                });
            });
        });
        describe('.toJSON()', function () {
            it('should serialize the strategy', function () {
                var source = getSource([1, 2, 3]);
                var handlers = [];
                var strategy = getStrategy(source, handlers);
                var items = strategy.items;
                var json = strategy.toJSON();
                chai_1.assert.strictEqual(json.state.$options.source, source);
                chai_1.assert.strictEqual(json.state.$options.handlers, handlers);
                chai_1.assert.strictEqual(json.state._itemsOrder.length, items.length);
            });
            it('should serialize itemsOrder if handlers is defined', function () {
                var source = getSource([1, 2, 3]);
                var handlers = [function () { return 0; }];
                var strategy = getStrategy(source, handlers);
                var json = strategy.toJSON();
                chai_1.assert.strictEqual(json.state._itemsOrder.length, source.count);
            });
        });
        describe('::fromJSON()', function () {
            it('should clone the strategy', function () {
                var source = getSource([1, 2, 3]);
                var handlers = [];
                var strategy = getStrategy(source, handlers);
                var items = strategy.items;
                var clone = User_1.default.fromJSON(strategy.toJSON());
                chai_1.assert.deepEqual(clone.items, items);
            });
        });
    });
});
