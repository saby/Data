define(["require", "exports", "chai", "Types/_display/itemsStrategy/MaterializedPath", "Types/_display/Tree", "Types/_display/TreeItem"], function (require, exports, chai_1, MaterializedPath_1, Tree_1, TreeItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_display/itemsStrategy/MaterializedPath', function () {
        function getOptions(display) {
            return {
                display: display,
                childrenProperty: display.getChildrenProperty(),
                root: display.getRoot.bind(display)
            };
        }
        var items;
        var expandedItems;
        var display;
        var strategy;
        beforeEach(function () {
            items = [
                { id: 1, children: [
                        { id: 11, children: [] },
                        { id: 12, children: [
                                { id: 121, children: [] },
                                { id: 122 }
                            ] },
                        { id: 13, children: [] }
                    ] },
                { id: 2, children: [
                        { id: 21 },
                        { id: 22 }
                    ] }
            ];
            expandedItems = [1, 11, 12, 121, 122, 13, 2, 21, 22];
            display = new Tree_1.default({
                collection: items,
                childrenProperty: 'children'
            });
            strategy = new MaterializedPath_1.default(getOptions(display));
        });
        afterEach(function () {
            items = undefined;
            expandedItems = undefined;
            display = undefined;
            strategy = undefined;
        });
        describe('.at()', function () {
            it('should return a CollectionItems', function () {
                expandedItems.forEach(function (id, index) {
                    chai_1.assert.instanceOf(strategy.at(index), TreeItem_1.default);
                    chai_1.assert.strictEqual(strategy.at(index).getContents().id, id);
                });
            });
            it('should return a CollectionItems in reverse order', function () {
                for (var index = expandedItems.length - 1; index >= 0; index--) {
                    chai_1.assert.strictEqual(strategy.at(index).getContents().id, expandedItems[index]);
                }
            });
            it('should return the same CollectionItem twice', function () {
                expandedItems.forEach(function (id, index) {
                    chai_1.assert.strictEqual(strategy.at(index), strategy.at(index));
                });
            });
            it('should return a CollectionItems with parent', function () {
                var display = new Tree_1.default({
                    collection: items,
                    childrenProperty: 'children',
                    root: { id: 0 }
                });
                var strategy = new MaterializedPath_1.default(getOptions(display));
                expandedItems.forEach(function (i, index) {
                    var item = strategy.at(index);
                    var id = item.getContents().id;
                    var parentId = Math.floor(id / 10);
                    chai_1.assert.strictEqual(item.getParent().getContents().id, parentId);
                });
            });
            it('should return a TreeItem as node', function () {
                var display = new Tree_1.default({
                    collection: [{ node: true }],
                    nodeProperty: 'node'
                });
                var strategy = new MaterializedPath_1.default(getOptions(display));
                chai_1.assert.isTrue(strategy.at(0).isNode());
            });
            it('should return a TreeItem as leaf', function () {
                var display = new Tree_1.default({
                    collection: [{ node: false }],
                    nodeProperty: 'node'
                });
                var strategy = new MaterializedPath_1.default(getOptions(display));
                chai_1.assert.isFalse(strategy.at(0).isNode());
            });
            it('should return a TreeItem with children', function () {
                var display = new Tree_1.default({
                    collection: [{ hasChildren: true }],
                    hasChildrenProperty: 'hasChildren'
                });
                var strategy = new MaterializedPath_1.default(getOptions(display));
                chai_1.assert.isTrue(strategy.at(0).isHasChildren());
            });
            it('should return a TreeItem without children', function () {
                var display = new Tree_1.default({
                    collection: [{ hasChildren: false }],
                    hasChildrenProperty: 'hasChildren'
                });
                var strategy = new MaterializedPath_1.default(getOptions(display));
                chai_1.assert.isFalse(strategy.at(0).isHasChildren());
            });
            it('should return a TreeItem with inverted children having', function () {
                var display = new Tree_1.default({
                    collection: [{ hasChildren: true }],
                    hasChildrenProperty: '!hasChildren'
                });
                var strategy = new MaterializedPath_1.default(getOptions(display));
                chai_1.assert.isFalse(strategy.at(0).isHasChildren());
            });
        });
        describe('.count', function () {
            it('should return items count', function () {
                chai_1.assert.strictEqual(strategy.count, expandedItems.length);
            });
        });
        describe('.items', function () {
            it('should return an items', function () {
                chai_1.assert.strictEqual(strategy.items.length, expandedItems.length);
                expandedItems.forEach(function (id, index) {
                    chai_1.assert.strictEqual(strategy.items[index].getContents().id, expandedItems[index]);
                });
            });
        });
        describe('.splice()', function () {
            it('should add items', function () {
                var item = { id: 10, children: [
                        { id: 100 },
                        { id: 101 }
                    ] };
                items[0].children.unshift(item);
                expandedItems.splice(1, 0, 10, 100, 101);
                strategy.splice(0, 0, [item]);
                chai_1.assert.strictEqual(strategy.items.length, expandedItems.length);
                expandedItems.forEach(function (id, index) {
                    chai_1.assert.strictEqual(strategy.at(index).getContents().id, id);
                });
            });
            it('should remove items', function () {
                items.splice(0, 1);
                expandedItems.splice(0, 6);
                strategy.splice(0, 1);
                chai_1.assert.strictEqual(strategy.items.length, expandedItems.length);
                expandedItems.forEach(function (id, index) {
                    chai_1.assert.strictEqual(strategy.at(index).getContents().id, id);
                });
            });
        });
        describe('.reset()', function () {
            it('should re-create items', function () {
                var prevItems = [];
                expandedItems.forEach(function (id, index) {
                    prevItems.push(strategy.at(index));
                });
                strategy.reset();
                expandedItems.forEach(function (id, index) {
                    chai_1.assert.notEqual(strategy.at(index), prevItems[index]);
                });
            });
        });
        describe('.getSorters()', function () {
            it('should append a "tree" sorter', function () {
                var sorters = strategy.getSorters();
                chai_1.assert.strictEqual(sorters[sorters.length - 1].name, 'tree');
            });
            it('should set the sorter options', function () {
                var sorters = strategy.getSorters();
                chai_1.assert.isFunction(sorters[0].options);
                chai_1.assert.isArray(sorters[0].options().indexToPath);
            });
        });
        describe('.sortItems()', function () {
            it('should expand all of the direct branches to the array', function () {
                // [0, 1, 2, 3, 4, 5, 6, 7, 8]
                var current = expandedItems.map(function (it, i) { return i; });
                var sorter = strategy.getSorters().pop();
                var options = {
                    indexToPath: sorter.options().indexToPath
                };
                var expect = [1, 11, 12, 121, 122, 13, 2, 21, 22];
                var items = strategy.items;
                var sorted = MaterializedPath_1.default.sortItems(items, current, options);
                var result = sorted.map(function (index) {
                    return items[index].getContents().id;
                });
                chai_1.assert.deepEqual(result, expect);
            });
            it('should expand all of the reversed branches to the array', function () {
                // [8, 7, 6, 5, 4, 3, 2, 1, 0]
                var current = expandedItems.map(function (it, i) { return i; }).reverse();
                var sorter = strategy.getSorters().pop();
                var options = {
                    indexToPath: sorter.options().indexToPath
                };
                // [1, 11, 12, 121, 122, 13, 2, 21, 22] => [2, 22, 21, 1, 13, 12, 122, 121, 11]
                var expect = [2, 22, 21, 1, 13, 12, 122, 121, 11];
                var items = strategy.items;
                var sorted = MaterializedPath_1.default.sortItems(items, current, options);
                var result = sorted.map(function (index) { return items[index].getContents().id; });
                chai_1.assert.deepEqual(result, expect);
            });
        });
    });
});
