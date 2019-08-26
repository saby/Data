define(["require", "exports", "chai", "Types/_display/itemsStrategy/Root"], function (require, exports, chai_1, Root_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_display/itemsStrategy/Root', function () {
        function getSource(items) {
            return {
                '[Types/_display/IItemsStrategy]': true,
                options: {},
                source: null,
                get count() {
                    return items.length;
                },
                get items() {
                    return items.slice();
                },
                at: function (index) {
                    return items[index];
                },
                getDisplayIndex: function (index) {
                    return index;
                },
                getCollectionIndex: function (index) {
                    return index;
                },
                splice: function (start, deleteCount, added) {
                    return items.splice.apply(items, [start, deleteCount].concat((added || [])));
                },
                invalidate: function () {
                    // always up to date
                },
                reset: function () {
                    items.length = 0;
                }
            };
        }
        var root = function () {
            return 'root';
        };
        var items;
        var source;
        var strategy;
        beforeEach(function () {
            items = ['one', 'two', 'three'];
            source = getSource(items);
            strategy = new Root_1.default({
                source: source,
                root: root
            });
        });
        afterEach(function () {
            items = undefined;
            source = undefined;
            strategy = undefined;
        });
        describe('.getOptions()', function () {
            it('should return the source options', function () {
                chai_1.assert.strictEqual(strategy.options, source.options);
            });
        });
        describe('.at()', function () {
            it('should return root at 0', function () {
                chai_1.assert.strictEqual(strategy.at(0), root());
            });
            it('should return item with offset', function () {
                source.items.forEach(function (item, index) {
                    chai_1.assert.strictEqual(strategy.at(1 + index), item);
                });
            });
        });
        describe('.count', function () {
            it('should return items count with root', function () {
                chai_1.assert.strictEqual(strategy.count, 1 + source.items.length);
            });
        });
        describe('.items', function () {
            it('should return an items with root', function () {
                chai_1.assert.deepEqual(strategy.items, [root()].concat(source.items));
            });
        });
        describe('.getDisplayIndex()', function () {
            it('should return an index with offset', function () {
                chai_1.assert.strictEqual(strategy.getDisplayIndex(0), 1);
                chai_1.assert.strictEqual(strategy.getDisplayIndex(1), 2);
            });
        });
        describe('.getCollectionIndex()', function () {
            it('should return an index with offset', function () {
                chai_1.assert.strictEqual(strategy.getCollectionIndex(1), 0);
                chai_1.assert.strictEqual(strategy.getCollectionIndex(2), 1);
            });
        });
        describe('.splice()', function () {
            it('should add items', function () {
                var items = ['a', 'b'];
                var count = strategy.count;
                strategy.splice(0, 0, items);
                chai_1.assert.strictEqual(strategy.count, items.length + count);
            });
        });
        describe('.reset()', function () {
            it('should reset items', function () {
                strategy.reset();
                chai_1.assert.strictEqual(strategy.items.length, 1);
            });
        });
    });
});
