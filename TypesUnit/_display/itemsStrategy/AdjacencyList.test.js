define(["require", "exports", "chai", "Types/_display/itemsStrategy/AdjacencyList", "Types/_display/CollectionItem", "Types/_display/TreeItem", "Types/_display/GroupItem"], function (require, exports, chai_1, AdjacencyList_1, CollectionItem_1, TreeItem_1, GroupItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_display/itemsStrategy/AdjacencyList', function () {
        function getDisplay(root) {
            return {
                getRoot: function () {
                    return this.root || (this.root = new TreeItem_1.default({
                        contents: root
                    }));
                },
                createItem: function (options) {
                    options.node = options.contents.node;
                    options.hasChildren = options.contents.hasChildren;
                    return new TreeItem_1.default(options);
                }
            };
        }
        function wrapItem(item) {
            if (item instanceof CollectionItem_1.default) {
                return item;
            }
            return new TreeItem_1.default({
                contents: item
            });
        }
        function getSource(items, root) {
            var display = getDisplay(root);
            var options = {
                display: display,
                items: items
            };
            var wraps = items.map(wrapItem);
            return {
                '[Types/_display/IItemsStrategy]': true,
                source: null,
                get options() {
                    return options;
                },
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
                    items.splice.apply(items, [start, deleteCount].concat(added));
                    return wraps.splice.apply(wraps, [start, deleteCount].concat(added.map(wrapItem)));
                },
                invalidate: function () {
                    this.invalidated = true;
                },
                reset: function () {
                    wraps.length = 0;
                    items.length = 0;
                }
            };
        }
        describe('.items', function () {
            it('should return items translated from source items contents', function () {
                var items = [
                    { id: 1 },
                    { id: 2 },
                    { id: 3 }
                ];
                var source = getSource(items);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                strategy.items.forEach(function (item, index) {
                    chai_1.assert.notEqual(item, source.items[index]);
                    chai_1.assert.strictEqual(item.getContents(), items[index]);
                });
                chai_1.assert.strictEqual(strategy.items.length, items.length);
            });
            it('should keep groups order', function () {
                var items = [
                    new GroupItem_1.default({ contents: 'a' }),
                    { id: 1 },
                    new GroupItem_1.default({ contents: 'b' }),
                    { id: 2 },
                    { id: 3 }
                ];
                var source = getSource(items);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var expectedInstances = [GroupItem_1.default, TreeItem_1.default, GroupItem_1.default, TreeItem_1.default, TreeItem_1.default];
                var expectedContents = ['a', items[1], 'b', items[3], items[4]];
                strategy.items.forEach(function (item, index) {
                    chai_1.assert.instanceOf(item, expectedInstances[index]);
                    chai_1.assert.strictEqual(item.getContents(), expectedContents[index]);
                });
                chai_1.assert.strictEqual(strategy.items.length, expectedInstances.length);
            });
            it('should keep groups order on several tree levels', function () {
                var items = [
                    new GroupItem_1.default({ contents: 'a' }),
                    { id: 11, pid: 1 },
                    { id: 1, pid: 0 },
                    new GroupItem_1.default({ contents: 'b' }),
                    { id: 2, pid: 0 }
                ];
                var source = getSource(items, 0);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var expected = ['a', items[2], items[1], 'b', items[4]];
                strategy.items.forEach(function (item, index) {
                    chai_1.assert.strictEqual(item.getContents(), expected[index]);
                });
                chai_1.assert.strictEqual(strategy.items.length, expected.length);
            });
            it('should revert parents\'s group if any child join another group', function () {
                var items = [
                    new GroupItem_1.default({ contents: 'a' }),
                    { id: 1, pid: 0 },
                    { id: 2, pid: 0 },
                    new GroupItem_1.default({ contents: 'b' }),
                    { id: 11, pid: 1 }
                ];
                var source = getSource(items, 0);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var expected = ['a', items[1], 'b', items[4], 'a', items[2]];
                strategy.items.forEach(function (item, index) {
                    chai_1.assert.strictEqual(item.getContents(), expected[index]);
                });
                chai_1.assert.strictEqual(strategy.items.length, expected.length);
            });
            it('shouldn\'t revert parents\'s group if any child joins another group but next parent\'s sibling has his' +
                ' own group', function () {
                var items = [
                    new GroupItem_1.default({ contents: 'a' }),
                    { id: 1, pid: 0 },
                    new GroupItem_1.default({ contents: 'c' }),
                    { id: 2, pid: 0 },
                    new GroupItem_1.default({ contents: 'b' }),
                    { id: 11, pid: 1 }
                ];
                var source = getSource(items, 0);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var expected = ['a', items[1], 'b', items[5], 'c', items[3]];
                strategy.items.forEach(function (item, index) {
                    chai_1.assert.strictEqual(item.getContents(), expected[index]);
                });
                chai_1.assert.strictEqual(strategy.items.length, expected.length);
            });
            it('should set valid parent if node joins another group then it\'s previous sibling', function () {
                var items = [
                    new GroupItem_1.default({ contents: 'a' }),
                    { id: 1 },
                    new GroupItem_1.default({ contents: 'b' }),
                    { id: 2 },
                    new GroupItem_1.default({ contents: 'aa' }),
                    { id: 11, pid: 1 },
                    new GroupItem_1.default({ contents: 'bb' }),
                    { id: 22, pid: 2 }
                ];
                var source = getSource(items);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var givenA = strategy.items.map(function (item) {
                    return item.getContents();
                });
                chai_1.assert.deepEqual(givenA, ['a', items[1], 'aa', items[5], 'b', items[3], 'bb', items[7]]);
                var givenB = strategy.items.map(function (item) {
                    return item instanceof GroupItem_1.default ? item.getContents() : item.getParent().getContents();
                });
                chai_1.assert.deepEqual(givenB, ['a', undefined, 'aa', items[1], 'b', undefined, 'bb', items[3]]);
            });
        });
        describe('.at()', function () {
            var items;
            var source;
            var strategy;
            beforeEach(function () {
                items = [
                    { id: 1, pid: 0 },
                    { id: 2, pid: 0 },
                    { id: 3, pid: 0 },
                    { id: 4, pid: 0 },
                    { id: 11, pid: 1 },
                    { id: 31, pid: 3 },
                    { id: 21, pid: 2 },
                    { id: 41, pid: 4 },
                    { id: 111, pid: 11 }
                ];
                source = getSource(items, 0);
                strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
            });
            afterEach(function () {
                items = undefined;
                strategy = undefined;
            });
            it('should return items in hierarchical order for root as Number', function () {
                var expected = [1, 11, 111, 2, 21, 3, 31, 4, 41];
                for (var index = 0; index < expected.length; index++) {
                    chai_1.assert.strictEqual(strategy.at(index).getContents().id, expected[index]);
                }
                chai_1.assert.strictEqual(strategy.count, expected.length);
            });
            it('should return items in hierarchical order for root as object', function () {
                var root = { id: 0 };
                var source = getSource(items, root);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var expected = [1, 11, 111, 2, 21, 3, 31, 4, 41];
                for (var index = 0; index < expected.length; index++) {
                    chai_1.assert.strictEqual(strategy.at(index).getContents().id, expected[index]);
                }
                chai_1.assert.strictEqual(strategy.count, expected.length);
            });
            it('should return items in hierarchical order for root as null', function () {
                var rootId = null;
                var items = [
                    { id: 1, pid: rootId },
                    { id: 2, pid: rootId },
                    { id: 11, pid: 1 },
                    { id: 21, pid: 2 }
                ];
                var source = getSource(items, rootId);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var expected = [1, 11, 2, 21];
                for (var index = 0; index < expected.length; index++) {
                    chai_1.assert.strictEqual(strategy.at(index).getContents().id, expected[index]);
                }
                chai_1.assert.strictEqual(strategy.count, expected.length);
            });
            it('should return items in hierarchical order for root as null and children related to undefined', function () {
                var rootId = null;
                var items = [
                    { id: 1 },
                    { id: 2 },
                    { id: 11, pid: 1 },
                    { id: 21, pid: 2 }
                ];
                var source = getSource(items, rootId);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var expected = [items[0], items[2], items[1], items[3]];
                var expectedParent = [rootId, items[0], rootId, items[1]];
                for (var index = 0; index < expected.length; index++) {
                    var item = strategy.at(index);
                    chai_1.assert.strictEqual(item.getContents(), expected[index]);
                    chai_1.assert.strictEqual(item.getParent().getContents(), expectedParent[index]);
                }
                chai_1.assert.strictEqual(strategy.count, expected.length);
            });
            it('should return items in hierarchical order for specified root', function () {
                var rootId = 1;
                var source = getSource(items, rootId);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var expected = [11, 111];
                for (var index = 0; index < expected.length; index++) {
                    chai_1.assert.strictEqual(strategy.at(index).getContents().id, expected[index]);
                }
                chai_1.assert.strictEqual(strategy.count, expected.length);
            });
            it('should lookup for const ious value types to root', function () {
                var items = [
                    { id: 1, pid: 0 },
                    { id: 2, pid: '0' },
                    { id: 11, pid: 1 },
                    { id: 12, pid: '1' }
                ];
                var source = getSource(items, 0);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var expected = [1, 11, 12, 2];
                for (var index = 0; index < expected.length; index++) {
                    chai_1.assert.strictEqual(strategy.at(index).getContents().id, expected[index]);
                }
                chai_1.assert.strictEqual(strategy.count, expected.length);
            });
            it('should work with scalar root wrapped using Object', function () {
                // tslint:disable-next-line:no-construct
                var root = new Number(0);
                var items = [
                    { id: 11, pid: 1 },
                    { id: 1, pid: 0 },
                    { id: 2, pid: 0 },
                    { id: 21, pid: 2 }
                ];
                var source = getSource(items, root);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var expected = [1, 11, 2, 21];
                for (var index = 0; index < expected.length; index++) {
                    chai_1.assert.strictEqual(strategy.at(index).getContents().id, expected[index]);
                }
                chai_1.assert.strictEqual(strategy.count, expected.length);
            });
            it('should return only root items if keyProperty is not injected', function () {
                var source = getSource(items, 0);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    parentProperty: 'pid'
                });
                var expected = [1, 2, 3, 4];
                for (var index = 0; index < expected.length; index++) {
                    chai_1.assert.strictEqual(strategy.at(index).getContents().id, expected[index]);
                }
                chai_1.assert.strictEqual(strategy.count, expected.length);
            });
            it('should return different TreeItem instances for repeats and duplicates', function () {
                var rootId = 0;
                var items = [
                    { id: 1, pid: 0 },
                    { id: 2, pid: 0 },
                    { id: 11, pid: 1 },
                    { id: 111, pid: 11 },
                    { id: 11, pid: 2 }
                ];
                var source = getSource(items, rootId);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var expected = [1, 11, 111, 2, 11, 111];
                var treeItems = [];
                for (var index = 0; index < expected.length; index++) {
                    var treeItem = strategy.at(index);
                    chai_1.assert.equal(treeItems.indexOf(treeItem), -1);
                    treeItems.push(treeItem);
                    chai_1.assert.strictEqual(treeItem.getContents().id, expected[index]);
                }
                chai_1.assert.strictEqual(strategy.count, expected.length);
            });
            it('should throw an Error if index is out of bounds', function () {
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                chai_1.assert.throws(function () {
                    strategy.at(99);
                });
            });
            it('should return a TreeItem as node', function () {
                var items = [{ node: true }];
                var source = getSource(items);
                var strategy = new AdjacencyList_1.default({
                    source: source
                });
                chai_1.assert.isTrue(strategy.at(0).isNode());
            });
            it('should return a TreeItem as leaf', function () {
                var items = [{ node: false }];
                var source = getSource(items);
                var strategy = new AdjacencyList_1.default({
                    source: source
                });
                chai_1.assert.isFalse(strategy.at(0).isNode());
            });
            it('should return a TreeItem with children', function () {
                var items = [{ hasChildren: true }];
                var source = getSource(items);
                var strategy = new AdjacencyList_1.default({
                    source: source
                });
                chai_1.assert.isTrue(strategy.at(0).isHasChildren());
            });
            it('should return a TreeItem without children', function () {
                var items = [{ hasChildren: false }];
                var source = getSource(items);
                var strategy = new AdjacencyList_1.default({
                    source: source
                });
                chai_1.assert.isFalse(strategy.at(0).isHasChildren());
            });
        });
        describe('.count', function () {
            var items;
            var source;
            beforeEach(function () {
                items = [
                    { id: 1, pid: 0 },
                    { id: 3, pid: 0 },
                    { id: 11, pid: 1 },
                    { id: 21, pid: 2 }
                ];
                source = getSource(items, 0);
            });
            afterEach(function () {
                items = undefined;
                source = undefined;
            });
            it('should return valid items count', function () {
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                chai_1.assert.strictEqual(strategy.count, 3);
            });
            it('should return valid items count if keyProperty is not injected', function () {
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    parentProperty: 'pid'
                });
                chai_1.assert.strictEqual(strategy.count, 2);
            });
            it('should return 0 if parentProperty is not injected', function () {
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id'
                });
                chai_1.assert.strictEqual(strategy.count, 0);
            });
        });
        describe('.splice()', function () {
            var items;
            beforeEach(function () {
                items = [
                    { id: 1, pid: 0 },
                    { id: 2, pid: 0 },
                    { id: 3, pid: 0 },
                    { id: 21, pid: 2 }
                ];
            });
            afterEach(function () {
                items = undefined;
            });
            it('should insert an item in valid order', function () {
                var source = getSource(items, 0);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var newItem = { id: 11, pid: 1 };
                var position = 3;
                var expected = [1, 11, 2, 21, 3];
                var result = strategy.splice(position, 0, [newItem]);
                for (var index = 0; index < expected.length; index++) {
                    chai_1.assert.strictEqual(strategy.at(index).getContents().id, expected[index]);
                }
                chai_1.assert.strictEqual(result.length, 0);
                chai_1.assert.strictEqual(strategy.count, expected.length);
            });
            it('should add items in valid order', function () {
                var source = getSource(items, 0);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var newItems = [
                    { id: 11, pid: 1 },
                    { id: 12, pid: 1 },
                    { id: 22, pid: 2 },
                    { id: 4, pid: 0 }
                ];
                var itemsCount = items.length;
                var expected = [1, 11, 12, 2, 21, 22, 3, 4];
                var result = strategy.splice(itemsCount, 0, newItems);
                for (var index = 0; index < expected.length; index++) {
                    chai_1.assert.strictEqual(strategy.at(index).getContents().id, expected[index]);
                }
                chai_1.assert.strictEqual(result.length, 0);
                chai_1.assert.strictEqual(strategy.count, expected.length);
            });
            it('should push item after latest source item', function () {
                var items = [
                    { id: 1, pid: 0 },
                    { id: 2, pid: 0 },
                    { id: 31, pid: 3 }
                ];
                var source = getSource(items, 0);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var newItem = { id: 4, pid: 0 };
                strategy.splice(items.length, 0, [newItem]);
                chai_1.assert.strictEqual(items[items.length - 1], newItem);
            });
            it('should add items duplicates in valid order', function () {
                var source = getSource(items, 0);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var newItems = [{ id: 2, pid: 0 }];
                var itemsCount = items.length;
                var expected = [1, 2, 21, 3, 2, 21];
                var displayItems = [];
                var result = strategy.splice(itemsCount, 0, newItems);
                for (var index = 0; index < expected.length; index++) {
                    var item = strategy.at(index);
                    chai_1.assert.strictEqual(item.getContents().id, expected[index]);
                    chai_1.assert.equal(displayItems.indexOf(item), -1);
                    displayItems.push(item);
                }
                chai_1.assert.strictEqual(result.length, 0);
                chai_1.assert.strictEqual(strategy.count, expected.length);
            });
            it('should remove items in valid order', function () {
                var items = [
                    { id: 1, pid: 0 },
                    { id: 2, pid: 0 },
                    { id: 3, pid: 0 },
                    { id: 21, pid: 2 },
                    { id: 211, pid: 21 },
                    { id: 22, pid: 2 }
                ];
                var source = getSource(items, 0);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var displayAt = 2;
                var removeAt = 3;
                var expected = [1, 2, 22, 3];
                // Force create item
                chai_1.assert.strictEqual(strategy.at(displayAt).getContents().id, 21);
                var result = strategy.splice(removeAt, 1, []);
                for (var index = 0; index < expected.length; index++) {
                    chai_1.assert.strictEqual(strategy.at(index).getContents().id, expected[index]);
                }
                chai_1.assert.strictEqual(result.length, 1);
                chai_1.assert.strictEqual(result[0].getContents().id, 21);
                chai_1.assert.strictEqual(strategy.count, expected.length);
            });
            it('should return removed items', function () {
                var items = [
                    { id: 1, pid: 0 },
                    { id: 2, pid: 0 },
                    { id: 3, pid: 0 },
                    { id: 4, pid: 0 }
                ];
                var source = getSource(items, 0);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var expected = [strategy.at(1), strategy.at(2)];
                var result = strategy.splice(1, 2, []);
                chai_1.assert.deepEqual(result, expected);
            });
            it('should return undefined for item that\'s not created yet', function () {
                var items = [
                    { id: 1, pid: 0 },
                    { id: 2, pid: 0 }
                ];
                var source = getSource(items, 0);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var result = strategy.splice(0, 1, []);
                chai_1.assert.deepEqual(result.length, 1);
                chai_1.assert.isUndefined(result[0]);
            });
            it('should remove duplicates in valid order', function () {
                var items = [
                    { id: 1, pid: 0 },
                    { id: 2, pid: 0 },
                    { id: 3, pid: 0 },
                    { id: 2, pid: 0 },
                    { id: 21, pid: 2 }
                ];
                var source = getSource(items, 0);
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var removeAt = 1;
                var expected = [1, 3, 2, 21];
                //Force create item
                chai_1.assert.strictEqual(strategy.at(removeAt).getContents().id, 2);
                var result = strategy.splice(removeAt, 1, []);
                for (var index = 0; index < expected.length; index++) {
                    chai_1.assert.strictEqual(strategy.at(index).getContents().id, expected[index]);
                }
                chai_1.assert.strictEqual(result.length, 1);
                chai_1.assert.strictEqual(result[0].getContents().id, 2);
                chai_1.assert.strictEqual(strategy.count, expected.length);
            });
        });
        describe('.invalidate', function () {
            var items;
            var source;
            beforeEach(function () {
                items = [];
                source = getSource(items, 0);
            });
            afterEach(function () {
                items = undefined;
                source = undefined;
            });
            it('should call source method', function () {
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                chai_1.assert.isUndefined(source.invalidated);
                strategy.invalidate();
                chai_1.assert.isTrue(source.invalidated);
            });
            it('should change items order and revert it back', function () {
                var items = [
                    { id: 1 },
                    { id: 2 },
                    { id: 11, pid: 1 },
                    { id: 22, pid: 2 }
                ];
                var sourceA = getSource(items);
                var strategy = new AdjacencyList_1.default({
                    source: sourceA,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var givenA = strategy.items.map(function (item) { return item.getContents().id; });
                var expectedA = [1, 11, 2, 22];
                chai_1.assert.deepEqual(givenA, expectedA);
                var affectedItemsB = [
                    items[1],
                    items[3],
                    items[0]
                ];
                var sourceB = getSource(affectedItemsB);
                strategy['_opt' + 'ions'].source = sourceB;
                strategy.invalidate();
                var givenB = strategy.items.map(function (item) { return item.getContents().id; });
                var expectedB = [2, 22, 1];
                chai_1.assert.deepEqual(givenB, expectedB);
                var affectedItemsC = items;
                var sourceC = getSource(affectedItemsC);
                strategy['_opt' + 'ions'].source = sourceC;
                strategy.invalidate();
                var givenC = strategy.items.map(function (item) { return item.getContents().id; });
                var expectedC = [1, 11, 2, 22];
                chai_1.assert.deepEqual(givenC, expectedC);
            });
        });
        describe('.getDisplayIndex()', function () {
            var items;
            var source;
            beforeEach(function () {
                items = [
                    { id: 1, pid: 0 },
                    { id: 2, pid: 0 },
                    { id: 3, pid: 0 },
                    { id: 11, pid: 1 },
                    { id: 21, pid: 2 }
                ];
                source = getSource(items, 0);
            });
            afterEach(function () {
                items = undefined;
                source = undefined;
            });
            it('should return valid item index', function () {
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var expected = [0, 2, 4, 1, 3];
                for (var index = 0; index < expected.length; index++) {
                    chai_1.assert.strictEqual(strategy.getDisplayIndex(index), expected[index]);
                }
            });
            it('should return index witch source index consideration', function () {
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var expected = [2, 4, 1, 3];
                source.getDisplayIndex = function (index) { return index + 1; };
                for (var index = 0; index < expected.length; index++) {
                    chai_1.assert.strictEqual(strategy.getDisplayIndex(index), expected[index]);
                }
            });
        });
        describe('.getCollectionIndex()', function () {
            var items;
            var source;
            beforeEach(function () {
                items = [
                    { id: 1, pid: 0 },
                    { id: 2, pid: 0 },
                    { id: 3, pid: 0 },
                    { id: 11, pid: 1 },
                    { id: 21, pid: 2 }
                ];
                source = getSource(items, 0);
            });
            afterEach(function () {
                items = undefined;
                source = undefined;
            });
            it('should return valid display index', function () {
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var expected = [0, 3, 1, 4, 2];
                for (var index = 0; index < expected.length; index++) {
                    chai_1.assert.strictEqual(strategy.getCollectionIndex(index), expected[index]);
                }
            });
            it('should return index witch source index consideration', function () {
                var strategy = new AdjacencyList_1.default({
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                var expected = [3, 1, 4, 2];
                source.getCollectionIndex = function (index) { return index + 1; };
                for (var index = 0; index < expected.length; index++) {
                    chai_1.assert.strictEqual(strategy.getCollectionIndex(index), expected[index]);
                }
            });
        });
        describe('.toJSON()', function () {
            it('should serialize the strategy', function () {
                var source = getSource([1, 2, 3]);
                var options = {
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                };
                var strategy = new AdjacencyList_1.default(options);
                var items = strategy.items;
                var json = strategy.toJSON();
                chai_1.assert.strictEqual(json.state.$options, options);
                chai_1.assert.strictEqual(json.state._items, items);
                chai_1.assert.strictEqual(json.state._itemsOrder.length, items.length);
                chai_1.assert.strictEqual(json.state._parentsMap.length, items.length);
            });
        });
        describe('::fromJSON()', function () {
            it('should clone the strategy', function () {
                var source = getSource([1, 2, 3]);
                var options = {
                    source: source,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                };
                var strategy = new AdjacencyList_1.default(options);
                var items = strategy.items;
                var clone = AdjacencyList_1.default.fromJSON(strategy.toJSON());
                chai_1.assert.deepEqual(clone.items, items);
            });
        });
    });
});
