define(["require", "exports", "chai", "Types/_display/Tree", "Types/_collection/List", "Types/_collection/ObservableList", "Types/_display/TreeItem", "Types/_collection/IObservable", "Types/_collection/RecordSet", "Core/Serializer", "Types/display"], function (require, exports, chai_1, Tree_1, List_1, ObservableList_1, TreeItem_1, IObservable_1, RecordSet_1, Serializer) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_display/Tree', function () {
        function getData() {
            return [{
                    id: 10,
                    pid: 1,
                    node: true,
                    title: 'AA'
                }, {
                    id: 11,
                    pid: 1,
                    node: true,
                    title: 'AB'
                }, {
                    id: 12,
                    pid: 1,
                    node: true,
                    title: 'AC'
                }, {
                    id: 121,
                    pid: 12,
                    node: true,
                    title: 'ACA'
                }, {
                    id: 122,
                    pid: 12,
                    node: false,
                    title: 'ACB'
                }, {
                    id: 123,
                    pid: 12,
                    node: false,
                    title: 'ACC'
                }, {
                    id: 1,
                    pid: 0,
                    node: true,
                    title: 'A'
                }, {
                    id: 2,
                    pid: 0,
                    node: true,
                    title: 'B'
                }, {
                    id: 20,
                    pid: 2,
                    node: true,
                    title: 'BA'
                }, {
                    id: 200,
                    pid: 20,
                    node: true,
                    title: 'BAA'
                }, {
                    id: 2000,
                    pid: 200,
                    title: 'BAAA'
                }, {
                    id: 3,
                    pid: 0,
                    node: false,
                    title: 'C'
                }, {
                    id: 4,
                    pid: 0,
                    title: 'D'
                }];
        }
        function getItems() {
            return new List_1.default({
                items: getData()
            });
        }
        function getObservableItems() {
            return new ObservableList_1.default({
                items: getData()
            });
        }
        function getTree(items) {
            return new Tree_1.default({
                collection: items || getItems(),
                root: {
                    id: 0,
                    title: 'Root'
                },
                keyProperty: 'id',
                parentProperty: 'pid',
                nodeProperty: 'node'
            });
        }
        function getObservableTree(items) {
            return new Tree_1.default({
                collection: items || getObservableItems(),
                root: {
                    id: 0,
                    title: 'Root'
                },
                keyProperty: 'id',
                parentProperty: 'pid',
                nodeProperty: 'node'
            });
        }
        function getRecordSetTree() {
            var rs = new RecordSet_1.default({
                rawData: getData(),
                idProperty: 'id'
            });
            return getObservableTree(rs);
        }
        var items;
        var tree;
        beforeEach(function () {
            items = getItems();
            tree = getTree(items);
        });
        afterEach(function () {
            tree.destroy();
            tree = undefined;
            items = undefined;
        });
        describe('.getEnumerator()', function () {
            it('should traverse items in hierarchical order use AdjacencyList strategy', function () {
                var enumerator = tree.getEnumerator();
                var expect = ['A', 'AA', 'AB', 'AC', 'ACA', 'ACB', 'ACC', 'B', 'BA', 'BAA', 'BAAA', 'C', 'D'];
                var index = 0;
                while (enumerator.moveNext()) {
                    var item = enumerator.getCurrent();
                    chai_1.assert.strictEqual(item.getContents().title, expect[index]);
                    index++;
                }
            });
            it('should traverse items in hierarchical order use MaterializedPath strategy', function () {
                var items = [
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
                var tree = new Tree_1.default({
                    collection: items,
                    root: {
                        id: 0,
                        title: 'Root'
                    },
                    childrenProperty: 'children'
                });
                var enumerator = tree.getEnumerator();
                var expect = [1, 11, 12, 121, 122, 13, 2, 21, 22];
                var index = 0;
                while (enumerator.moveNext()) {
                    var item = enumerator.getCurrent();
                    chai_1.assert.strictEqual(item.getContents().id, expect[index]);
                    index++;
                }
            });
            it('should traverse all items', function () {
                var enumerator = tree.getEnumerator();
                var index = 0;
                while (enumerator.moveNext()) {
                    index++;
                }
                chai_1.assert.strictEqual(tree.getCount(), index);
                chai_1.assert.strictEqual(items.getCount(), index);
            });
            it('should traverse all items as flat list if no options specified', function () {
                var tree = new Tree_1.default({
                    collection: items
                });
                var enumerator = tree.getEnumerator();
                var index = 0;
                while (enumerator.moveNext()) {
                    var item = enumerator.getCurrent();
                    chai_1.assert.strictEqual(item.getContents(), items.at(index));
                    index++;
                }
                chai_1.assert.strictEqual(tree.getCount(), index);
                chai_1.assert.strictEqual(items.getCount(), index);
            });
            it('should traverse root if "rootEnumerable" option is true', function () {
                var tree = new Tree_1.default({
                    collection: items,
                    root: {
                        id: 0,
                        title: 'Root'
                    },
                    rootEnumerable: true,
                    keyProperty: 'id',
                    parentProperty: 'pid',
                    nodeProperty: 'node'
                });
                var enumerator = tree.getEnumerator();
                var expect = ['Root', 'A', 'AA', 'AB', 'AC', 'ACA', 'ACB', 'ACC', 'B', 'BA', 'BAA', 'BAAA', 'C', 'D'];
                var index = 0;
                while (enumerator.moveNext()) {
                    var item = enumerator.getCurrent();
                    chai_1.assert.strictEqual(item.getContents().title, expect[index]);
                    index++;
                }
                chai_1.assert.strictEqual(tree.getCount(), index);
                chai_1.assert.strictEqual(items.getCount(), index - 1);
            });
        });
        describe('.each()', function () {
            it('should update the display after move grouped item out of the root', function () {
                var rs = new RecordSet_1.default({
                    rawData: [
                        { id: 1, pid: 1, group: 'a' },
                        { id: 2, pid: 1, group: 'a' },
                        { id: 3, pid: 1, group: 'a' }
                    ]
                });
                var tree = new Tree_1.default({
                    collection: rs,
                    root: 1,
                    keyProperty: 'id',
                    parentProperty: 'pid',
                    group: function (item) { return item.get('group'); }
                });
                var model = rs.at(1);
                var expectedBefore = ['a', rs.at(0), rs.at(1), rs.at(2)];
                var expectedAfter = ['a', rs.at(0), rs.at(2)];
                tree.each(function (item, i) {
                    chai_1.assert.equal(expectedBefore[i], item.getContents());
                });
                model.set('pid', 0);
                tree.each(function (item, i) {
                    chai_1.assert.equal(expectedAfter[i], item.getContents());
                });
            });
        });
        describe('.getItemBySourceItem()', function () {
            it('should return projection item if it collection item have been changed', function () {
                var tree = getRecordSetTree();
                var collection = tree.getCollection();
                var item = collection.getRecordById(10);
                tree.setFilter(function (collItem) { return (collItem.get('pid') === 0) ? true : false; });
                item.set('pid', 0);
                chai_1.assert.isDefined(tree.getItemBySourceItem(item));
            });
        });
        describe('.getParentProperty()', function () {
            it('should return given value', function () {
                chai_1.assert.equal(tree.getParentProperty(), 'pid');
            });
        });
        describe('.setParentProperty()', function () {
            it('should change the value', function () {
                tree.setParentProperty('uid');
                chai_1.assert.equal(tree.getParentProperty(), 'uid');
            });
            it('should bring all items to the root', function () {
                tree.setRoot(null);
                tree.setParentProperty('');
                var count = 0;
                tree.each(function (item) {
                    chai_1.assert.equal(item.getContents(), items.at(count));
                    count++;
                });
                chai_1.assert.strictEqual(count, items.getCount());
                chai_1.assert.strictEqual(tree.getCount(), items.getCount());
            });
        });
        describe('.getNodeProperty()', function () {
            it('should return given value', function () {
                chai_1.assert.equal(tree.getNodeProperty(), 'node');
            });
        });
        describe('.getChildrenProperty()', function () {
            it('should return given value', function () {
                chai_1.assert.strictEqual(tree.getChildrenProperty(), '');
            });
        });
        describe('.getRoot()', function () {
            it('should return given root from a number', function () {
                var tree = new Tree_1.default({
                    collection: items,
                    root: 0,
                    keyProperty: 'id'
                });
                chai_1.assert.strictEqual(tree.getRoot().getContents(), 0);
            });
            it('should return given root from a string', function () {
                var tree = new Tree_1.default({
                    collection: items,
                    root: '',
                    keyProperty: 'id'
                });
                chai_1.assert.strictEqual(tree.getRoot().getContents(), '');
            });
            it('should return given root from an object', function () {
                var tree = new Tree_1.default({
                    collection: items,
                    root: { id: 1, title: 'Root' },
                    keyProperty: 'id'
                });
                chai_1.assert.strictEqual(tree.getRoot().getContents().id, 1);
                chai_1.assert.strictEqual(tree.getRoot().getContents().title, 'Root');
            });
            it('should return given root from a TreeItem', function () {
                var root = new TreeItem_1.default({ contents: {
                        id: null,
                        title: 'Root'
                    } });
                var tree = new Tree_1.default({
                    collection: items,
                    root: root,
                    keyProperty: 'id'
                });
                chai_1.assert.strictEqual(tree.getRoot(), root);
            });
            it('should return a valid enumerable root if it have children without link by contents', function () {
                var tree = new Tree_1.default({
                    collection: items,
                    root: null,
                    rootEnumerable: true,
                    keyProperty: 'id'
                });
                var root = tree.getRoot();
                chai_1.assert.isNull(root.getContents());
                chai_1.assert.isTrue(root.isRoot());
                chai_1.assert.isUndefined(root.getParent());
            });
            it('should return a root without trigger property change event', function () {
                var tree = new Tree_1.default({
                    collection: items,
                    root: 0,
                    keyProperty: 'id'
                });
                var triggered = false;
                var handler = function () {
                    triggered = true;
                };
                tree.subscribe('onCollectionChange', handler);
                tree.getRoot();
                tree.unsubscribe('onCollectionChange', handler);
                chai_1.assert.isFalse(triggered);
            });
        });
        describe('.setRoot()', function () {
            it('should set root as scalar', function () {
                tree.setRoot(1);
                chai_1.assert.strictEqual(tree.getRoot().getContents(), 1);
            });
            it('should set root as object', function () {
                var root = { id: 1 };
                tree.setRoot(root);
                chai_1.assert.strictEqual(tree.getRoot().getContents(), root);
            });
            it('should set root as tree item', function () {
                var root = new TreeItem_1.default({ contents: {
                        id: null,
                        title: 'Root'
                    } });
                tree.setRoot(root);
                chai_1.assert.strictEqual(tree.getRoot(), root);
            });
            it('should update count', function () {
                chai_1.assert.notEqual(tree.getCount(), 6);
                tree.setRoot(1);
                chai_1.assert.strictEqual(tree.getCount(), 6);
            });
            it('should keep old instances', function () {
                var oldItems = [];
                var newItems = [];
                tree.each(function (item) {
                    oldItems.push(item);
                });
                tree.setRoot(1);
                tree.each(function (item) {
                    newItems.push(item);
                });
                chai_1.assert.deepEqual(oldItems.slice(1, 7), newItems);
            });
            it('should change items and then the revert it back', function () {
                var before = [];
                tree.each(function (item) {
                    before.push(item.getContents());
                });
                chai_1.assert.notEqual(before.length, 6);
                // Change items
                tree.setRoot(1);
                var after = [];
                tree.each(function (item) {
                    after.push(item.getContents());
                });
                chai_1.assert.strictEqual(after.length, 6);
                // Revert back
                tree.setRoot(0);
                var revert = [];
                tree.each(function (item) {
                    revert.push(item.getContents());
                });
                chai_1.assert.deepEqual(revert, before);
            });
            it('should set root if grouping has used', function () {
                var items = [
                    { id: 1, pid: 0, g: 0 },
                    { id: 2, pid: 0, g: 1 },
                    { id: 11, pid: 1, g: 0 }
                ];
                var list = new List_1.default({
                    items: items
                });
                var tree = new Tree_1.default({
                    collection: list,
                    root: 0,
                    keyProperty: 'id',
                    parentProperty: 'pid',
                    group: function (item) { return item.g; }
                });
                tree.setRoot(1);
                chai_1.assert.strictEqual(tree.getCount(), 2);
            });
        });
        describe('.isRootEnumerable()', function () {
            it('should return false by default', function () {
                chai_1.assert.isFalse(tree.isRootEnumerable());
            });
        });
        describe('.setRootEnumerable()', function () {
            it('should change root to enumerable', function () {
                tree.setRootEnumerable(true);
                chai_1.assert.isTrue(tree.isRootEnumerable());
            });
            it('should not change root to enumerable', function () {
                tree.setRootEnumerable(false);
                chai_1.assert.isFalse(tree.isRootEnumerable());
            });
            it('should traverse root after change to true', function () {
                tree.setRootEnumerable(true);
                var expect = ['Root', 'A', 'AA', 'AB', 'AC', 'ACA', 'ACB', 'ACC', 'B', 'BA', 'BAA', 'BAAA', 'C', 'D'];
                var index = 0;
                tree.each(function (item) {
                    chai_1.assert.strictEqual(item.getContents().title, expect[index]);
                    index++;
                });
                chai_1.assert.strictEqual(tree.getCount(), index);
                chai_1.assert.strictEqual(items.getCount(), index - 1);
            });
            it('should not traverse root after change to false', function () {
                tree.setRootEnumerable(true);
                tree.setRootEnumerable(false);
                var expect = ['A', 'AA', 'AB', 'AC', 'ACA', 'ACB', 'ACC', 'B', 'BA', 'BAA', 'BAAA', 'C', 'D'];
                var index = 0;
                tree.each(function (item) {
                    chai_1.assert.strictEqual(item.getContents().title, expect[index]);
                    index++;
                });
                chai_1.assert.strictEqual(tree.getCount(), index);
                chai_1.assert.strictEqual(items.getCount(), index);
            });
        });
        describe('.getChildren()', function () {
            it('should return children of a root', function () {
                var children = tree.getChildren(tree.getRoot());
                var expect = ['A', 'B', 'C', 'D'];
                chai_1.assert.equal(children.getCount(), expect.length);
                children.each(function (child, index) {
                    chai_1.assert.strictEqual(child.getContents().title, expect[index]);
                });
            });
            it('should return children of the first node', function () {
                var children = tree.getChildren(tree.at(0));
                var expect = ['AA', 'AB', 'AC'];
                chai_1.assert.equal(children.getCount(), expect.length);
                children.each(function (child, index) {
                    chai_1.assert.strictEqual(child.getContents().title, expect[index]);
                });
            });
            it('should return children hidden by the filter', function () {
                var expect = ['AA', 'AB', 'AC'];
                tree.setFilter(function (item) { return item.title !== 'AB'; });
                chai_1.assert.equal(tree.getChildren(tree.at(0), true).getCount(), expect.length - 1);
                var children = tree.getChildren(tree.at(0), false);
                chai_1.assert.equal(children.getCount(), expect.length);
                children.each(function (child, index) {
                    chai_1.assert.strictEqual(child.getContents().title, expect[index]);
                });
            });
            it('should throw an error for invalid node', function () {
                chai_1.assert.throws(function () {
                    tree.getChildren(undefined);
                });
                chai_1.assert.throws(function () {
                    tree.getChildren({});
                });
            });
        });
        describe('.getItemUid()', function () {
            it('should return path from item to the root', function () {
                var data = [
                    { id: 1, pid: 0 },
                    { id: 2, pid: 1 },
                    { id: 3, pid: 2 }
                ];
                var items = new List_1.default({
                    items: data
                });
                var tree = getTree(items);
                var expect = ['1', '2:1', '3:2:1'];
                var index = 0;
                tree.each(function (item) {
                    chai_1.assert.strictEqual(tree.getItemUid(item), expect[index]);
                    index++;
                });
                chai_1.assert.equal(index, expect.length);
            });
            it('should return path for items with duplicated ids', function () {
                var data = [
                    { id: 1, pid: 0 },
                    { id: 2, pid: 1 },
                    { id: 3, pid: 2 },
                    { id: 2, pid: 1 }
                ];
                var items = new List_1.default({
                    items: data
                });
                var tree = getTree(items);
                var expect = ['1', '2:1', '3:2:1', '2:1-1', '3:2:1-1'];
                var index = 0;
                tree.each(function (item) {
                    chai_1.assert.strictEqual(tree.getItemUid(item), expect[index]);
                    index++;
                });
                chai_1.assert.equal(index, expect.length);
            });
        });
        describe('.getIndexBySourceItem()', function () {
            it('should return 0 for root contents if root is enumerable', function () {
                var tree = new Tree_1.default({
                    collection: items,
                    root: items[1],
                    rootEnumerable: true,
                    keyProperty: 'id'
                });
                chai_1.assert.strictEqual(tree.getIndexBySourceItem(items[1]), 0);
            });
        });
        describe('.getIndexBySourceIndex()', function () {
            it('should return valid tree index if root is enumerable', function () {
                tree.setRootEnumerable(true);
                for (var i = 0; i < items.getCount(); i++) {
                    var index = tree.getIndexBySourceIndex(i);
                    chai_1.assert.strictEqual(items.at(i), tree.at(index).getContents());
                }
            });
        });
        describe('.getSourceIndexByIndex()', function () {
            it('should return valid source collection index if root is enumerable', function () {
                tree.setRootEnumerable(true);
                for (var i = 0; i < tree.getCount(); i++) {
                    var index = tree.getSourceIndexByIndex(i);
                    if (index === -1) {
                        chai_1.assert.strictEqual(tree.at(i), tree.getRoot());
                    }
                    else {
                        chai_1.assert.strictEqual(tree.at(i).getContents(), items.at(index));
                    }
                }
            });
        });
        describe('.getNext()', function () {
            it('should return next item', function () {
                var item = tree.getNext(tree.at(0));
                chai_1.assert.equal(item.getContents().id, 2);
            });
            it('should skip groups', function () {
                var items = [
                    { id: 1, pid: 0, g: 0 },
                    { id: 2, pid: 0, g: 1 },
                    { id: 11, pid: 1, g: 0 },
                    { id: 12, pid: 1, g: 0 },
                    { id: 22, pid: 2, g: 2 }
                ];
                var list = new List_1.default({
                    items: items
                });
                var display = new Tree_1.default({
                    collection: list,
                    root: 0,
                    keyProperty: 'id',
                    parentProperty: 'pid',
                    group: function (item) { return item.g; }
                });
                var item = display.at(1); // id = 1
                chai_1.assert.strictEqual(display.getNext(item).getContents().id, 2);
                item = display.at(2); // id = 11
                chai_1.assert.strictEqual(display.getNext(item).getContents().id, 12);
            });
        });
        describe('.getPrevious()', function () {
            it('should return previous item', function () {
                var item = tree.getPrevious(tree.at(2));
                chai_1.assert.equal(item.getContents().id, 10);
            });
            it('should skip groups', function () {
                var items = [
                    { id: 1, pid: 0, g: 0 },
                    { id: 2, pid: 0, g: 1 },
                    { id: 11, pid: 1, g: 0 },
                    { id: 12, pid: 1, g: 0 },
                    { id: 22, pid: 2, g: 2 }
                ];
                var list = new List_1.default({
                    items: items
                });
                var display = new Tree_1.default({
                    collection: list,
                    root: 0,
                    keyProperty: 'id',
                    parentProperty: 'pid',
                    group: function (item) { return item.g; }
                });
                var item = display.at(5); // id = 2
                chai_1.assert.strictEqual(display.getPrevious(item).getContents().id, 1);
                item = display.at(1); // id = 1
                chai_1.assert.isUndefined(display.getPrevious(item));
            });
        });
        describe('.moveToNext()', function () {
            it('should move current through direct children of the root', function () {
                chai_1.assert.isTrue(tree.moveToNext());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'A');
                chai_1.assert.isTrue(tree.moveToNext());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'B');
                chai_1.assert.isTrue(tree.moveToNext());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'C');
                chai_1.assert.isTrue(tree.moveToNext());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'D');
                chai_1.assert.isFalse(tree.moveToNext());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'D');
            });
            it('should move current through direct children of the given node', function () {
                tree.setCurrentPosition(1);
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'AA');
                chai_1.assert.isTrue(tree.moveToNext());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'AB');
                chai_1.assert.isTrue(tree.moveToNext());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'AC');
                chai_1.assert.isFalse(tree.moveToNext());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'AC');
            });
            it('should notify onCurrentChange', function () {
                var fired = false;
                tree.subscribe('onCurrentChange', function () {
                    fired = true;
                });
                tree.moveToNext();
                chai_1.assert.isTrue(fired);
            });
        });
        describe('.moveToPrevious()', function () {
            it('should move current through direct children of the root', function () {
                tree.setCurrentPosition(tree.getCount() - 1);
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'D');
                chai_1.assert.isTrue(tree.moveToPrevious());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'C');
                chai_1.assert.isTrue(tree.moveToPrevious());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'B');
                chai_1.assert.isTrue(tree.moveToPrevious());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'A');
                chai_1.assert.isFalse(tree.moveToPrevious());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'A');
            });
            it('should move current through direct children of the given node', function () {
                tree.setCurrentPosition(3);
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'AC');
                chai_1.assert.isTrue(tree.moveToPrevious());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'AB');
                chai_1.assert.isTrue(tree.moveToPrevious());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'AA');
                chai_1.assert.isFalse(tree.moveToPrevious());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'AA');
            });
            it('should notify onCurrentChange', function () {
                var fired = false;
                tree.setCurrentPosition(3);
                tree.subscribe('onCurrentChange', function () {
                    fired = true;
                });
                tree.moveToPrevious();
                chai_1.assert.isTrue(fired);
            });
        });
        describe('.moveToAbove()', function () {
            it('should keep current undefined', function () {
                chai_1.assert.isFalse(tree.moveToAbove());
                chai_1.assert.isUndefined(tree.getCurrent());
            });
            it('should not move if parent is the root', function () {
                tree.moveToNext();
                var current = tree.getCurrent();
                chai_1.assert.isFalse(tree.moveToAbove());
                chai_1.assert.strictEqual(tree.getCurrent(), current);
            });
            it('should move to the parent', function () {
                tree.setCurrentPosition(4);
                chai_1.assert.isTrue(tree.moveToAbove());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'AC');
                chai_1.assert.isTrue(tree.moveToAbove());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'A');
                chai_1.assert.isFalse(tree.moveToAbove());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'A');
            });
        });
        describe('.moveToBelow()', function () {
            it('should keep current undefined', function () {
                chai_1.assert.isFalse(tree.moveToBelow());
                chai_1.assert.isUndefined(tree.getCurrent());
            });
            it('should not move if current is not a node', function () {
                tree.setCurrentPosition(tree.getCount() - 1);
                var current = tree.getCurrent();
                chai_1.assert.isFalse(current.isNode());
                chai_1.assert.isFalse(tree.moveToBelow());
                chai_1.assert.strictEqual(tree.getCurrent(), current);
            });
            it('should not move if current has no children', function () {
                tree.setCurrentPosition(11);
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'C');
                var current = tree.getCurrent();
                chai_1.assert.strictEqual(tree.getChildren(current).getCount(), 0);
                chai_1.assert.isFalse(tree.moveToBelow());
                chai_1.assert.strictEqual(tree.getCurrent(), current);
            });
            it('should move to the first child', function () {
                tree.setCurrentPosition(7);
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'B');
                chai_1.assert.isTrue(tree.moveToBelow());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'BA');
                chai_1.assert.isTrue(tree.moveToBelow());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'BAA');
                chai_1.assert.isTrue(tree.moveToBelow());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'BAAA');
                chai_1.assert.isFalse(tree.moveToBelow());
                chai_1.assert.strictEqual(tree.getCurrent().getContents().title, 'BAAA');
            });
        });
        describe('.setSort', function () {
            it('should sort put folders before leafs', function () {
                var items = [
                    { id: 1, pid: 0, node: false },
                    { id: 2, pid: 0, node: false },
                    { id: 3, pid: 0, node: true },
                    { id: 4, pid: 0, node: true }
                ];
                var collection = new List_1.default({
                    items: items
                });
                var display = new Tree_1.default({
                    collection: collection,
                    root: 0,
                    keyProperty: 'id',
                    parentProperty: 'pid',
                    nodeProperty: 'node'
                });
                var exected = [
                    items[2],
                    items[3],
                    items[0],
                    items[1]
                ];
                var given = [];
                display.setSort(function (a, b) {
                    var isNodeA = a.item.isNode();
                    var isNodeB = b.item.isNode();
                    if (isNodeA === isNodeB) {
                        return 0;
                    }
                    else {
                        return isNodeA ? -1 : 1;
                    }
                });
                display.each(function (item) {
                    given.push(item.getContents());
                });
                chai_1.assert.deepEqual(given, exected);
            });
        });
        describe('.setGroup()', function () {
            it('should place nodes before leafs', function () {
                var items = [
                    { id: 1, node: false, group: 'a' },
                    { id: 2, node: false, group: 'b' },
                    { id: 3, node: true, group: 'a' },
                    { id: 4, node: true, group: 'b' },
                    { id: 5, node: false, group: 'a' }
                ];
                var list = new List_1.default({
                    items: items
                });
                var display = new Tree_1.default({
                    collection: list,
                    keyProperty: 'id',
                    parentProperty: 'pid',
                    nodeProperty: 'node'
                });
                var expected = [
                    'a',
                    items[0],
                    items[2],
                    items[4],
                    'b',
                    items[1],
                    items[3]
                ];
                var given = [];
                display.setGroup(function (item) { return item.group; });
                display.each(function (item) {
                    given.push(item.getContents());
                });
                chai_1.assert.deepEqual(given, expected);
            });
            it('should place groups inside nodes', function () {
                var items = [
                    { id: 1, pid: 0, node: true, group: 'a' },
                    { id: 2, pid: 0, node: true, group: 'a' },
                    { id: 3, pid: 0, node: false, group: 'a' },
                    { id: 11, pid: 1, node: false, group: 'b' },
                    { id: 12, pid: 1, node: false, group: 'b' },
                    { id: 13, pid: 1, node: false, group: 'c' }
                ];
                var list = new List_1.default({
                    items: items
                });
                var display = new Tree_1.default({
                    collection: list,
                    root: 0,
                    keyProperty: 'id',
                    parentProperty: 'pid',
                    nodeProperty: 'node'
                });
                var expectedA = [
                    items[0],
                    items[3],
                    items[4],
                    items[5],
                    items[1],
                    items[2]
                ];
                var givenA = [];
                display.each(function (item) {
                    givenA.push(item.getContents());
                });
                chai_1.assert.deepEqual(givenA, expectedA);
                display.setGroup(function (item) { return item.group; });
                var expectedB = [
                    'a',
                    items[0],
                    'b',
                    items[3],
                    items[4],
                    'c',
                    items[5],
                    'a',
                    items[1],
                    items[2]
                ];
                var givenB = [];
                display.each(function (item) {
                    givenB.push(item.getContents());
                });
                chai_1.assert.deepEqual(givenB, expectedB);
            });
            it('should leave groups inside nodes after add items', function () {
                var items = [
                    { id: 1, pid: 0, node: true, group: 'a' },
                    { id: 2, pid: 0, node: false, group: 'b' }
                ];
                var addItems = [
                    { id: 11, pid: 1, node: false, group: 'c' }
                ];
                var list = new ObservableList_1.default({
                    items: items
                });
                var display = new Tree_1.default({
                    collection: list,
                    root: 0,
                    keyProperty: 'id',
                    parentProperty: 'pid',
                    nodeProperty: 'node',
                    group: function (item) { return item.group; }
                });
                var expected = [
                    'a',
                    items[0],
                    'c',
                    addItems[0],
                    'b',
                    items[1]
                ];
                var given = [];
                list.append(addItems);
                display.each(function (item) {
                    given.push(item.getContents());
                });
                chai_1.assert.deepEqual(given, expected);
            });
        });
        describe('.setEventRaising()', function () {
            it('should save expanded when unfreeze collection', function () {
                var tree = getObservableTree();
                var item = tree.getNext(tree.at(0));
                item.setExpanded(true);
                tree.getCollection().setEventRaising(false);
                tree.getCollection().setEventRaising(true);
                chai_1.assert.isTrue(item.isExpanded());
            });
        });
        describe('.subscribe()', function () {
            var getCollectionChangeHandler = function (given, itemsMapper) {
                return function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    given.push({
                        action: action,
                        newItems: itemsMapper ? newItems.map(itemsMapper) : newItems,
                        newItemsIndex: newItemsIndex,
                        oldItems: itemsMapper ? oldItems.map(itemsMapper) : oldItems,
                        oldItemsIndex: oldItemsIndex
                    });
                };
            };
            context('onCollectionChange', function () {
                it('should fire with all of children if add a node', function () {
                    var tree = getObservableTree();
                    var list = tree.getCollection();
                    var newItems = [
                        { id: 51, pid: 5, title: 'EA' },
                        { id: 52, pid: 5, title: 'EB' },
                        { id: 521, pid: 52, title: 'EBA' },
                        { id: 53, pid: 5, title: 'EC' }
                    ];
                    var newNode = { id: 5, pid: 0, title: 'E' };
                    var expected = [{
                            action: IObservable_1.default.ACTION_ADD,
                            newItems: ['E', 'EA', 'EB', 'EBA', 'EC'],
                            newItemsIndex: list.getCount(),
                            oldItems: [],
                            oldItemsIndex: 0
                        }];
                    var given = [];
                    var handler = getCollectionChangeHandler(given, function (item) { return item.getContents().title; });
                    tree.subscribe('onCollectionChange', handler);
                    list.append(newItems);
                    list.add(newNode);
                    tree.unsubscribe('onCollectionChange', handler);
                    chai_1.assert.deepEqual(given, expected);
                });
                it('should fire with all of children after remove a node', function () {
                    var tree = getObservableTree();
                    var firstNodeItemIndex = 6;
                    var expected = [{
                            action: IObservable_1.default.ACTION_REMOVE,
                            newItems: [],
                            newItemsIndex: 0,
                            oldItems: ['A', 'AA', 'AB', 'AC', 'ACA', 'ACB', 'ACC'],
                            oldItemsIndex: 0
                        }];
                    var given = [];
                    var handler = getCollectionChangeHandler(given, function (item) { return item.getContents().title; });
                    tree.subscribe('onCollectionChange', handler);
                    tree.getCollection().removeAt(firstNodeItemIndex);
                    tree.unsubscribe('onCollectionChange', handler);
                    chai_1.assert.deepEqual(given, expected);
                });
                it('should fire with only removed node if filter used', function () {
                    var data = [
                        { id: 1, pid: 0 },
                        { id: 11, pid: 1 },
                        { id: 2, pid: 0 },
                        { id: 3, pid: 0 }
                    ];
                    var list = new ObservableList_1.default({
                        items: data
                    });
                    var tree = new Tree_1.default({
                        collection: list,
                        root: 0,
                        keyProperty: 'id',
                        parentProperty: 'pid',
                        filter: function (item) { return item.pid === 0; }
                    });
                    var given = [];
                    var handler = getCollectionChangeHandler(given);
                    var expected = [{
                            action: IObservable_1.default.ACTION_REMOVE,
                            newItems: [],
                            newItemsIndex: 0,
                            oldItems: [tree.at(0)],
                            oldItemsIndex: 0
                        }];
                    tree.subscribe('onCollectionChange', handler);
                    list.removeAt(0);
                    tree.unsubscribe('onCollectionChange', handler);
                    chai_1.assert.deepEqual(given, expected);
                });
                it('should fire on move a node down', function () {
                    var items = [
                        { id: 1, pid: 0 },
                        { id: 2, pid: 0 },
                        { id: 3, pid: 0 }
                    ];
                    var list = new ObservableList_1.default({
                        items: items
                    });
                    var tree = new Tree_1.default({
                        collection: list,
                        root: 0,
                        keyProperty: 'id',
                        parentProperty: 'pid'
                    });
                    var moveFrom = 1;
                    var moveTo = 2;
                    var expected = [{
                            action: IObservable_1.default.ACTION_MOVE,
                            newItems: [items[moveTo]],
                            newItemsIndex: moveFrom,
                            oldItems: [items[moveTo]],
                            oldItemsIndex: moveTo
                        }];
                    var given = [];
                    var handler = getCollectionChangeHandler(given, function (item) { return item.getContents(); });
                    tree.subscribe('onCollectionChange', handler);
                    list.move(moveFrom, moveTo);
                    tree.unsubscribe('onCollectionChange', handler);
                    chai_1.assert.deepEqual(given, expected);
                });
                it('should fire on move a node up', function () {
                    var items = [
                        { id: 1, pid: 0 },
                        { id: 2, pid: 0 },
                        { id: 3, pid: 0 }
                    ];
                    var list = new ObservableList_1.default({
                        items: items
                    });
                    var tree = new Tree_1.default({
                        collection: list,
                        root: 0,
                        keyProperty: 'id',
                        parentProperty: 'pid'
                    });
                    var moveFrom = 2;
                    var moveTo = 0;
                    var expected = [{
                            action: IObservable_1.default.ACTION_MOVE,
                            newItems: [items[moveFrom]],
                            newItemsIndex: moveTo,
                            oldItems: [items[moveFrom]],
                            oldItemsIndex: moveFrom
                        }];
                    var given = [];
                    var handler = getCollectionChangeHandler(given, function (item) { return item.getContents(); });
                    tree.subscribe('onCollectionChange', handler);
                    list.move(moveFrom, moveTo);
                    tree.unsubscribe('onCollectionChange', handler);
                    chai_1.assert.deepEqual(given, expected);
                });
                it('shouldn\'t fire on move a node in sorted tree', function () {
                    var sort = function (a, b) {
                        var isNodeA = a.item.isNode();
                        var isNodeB = b.item.isNode();
                        if (isNodeA === isNodeB) {
                            return a.index > b.index ? 1 : -1;
                        }
                        else {
                            return isNodeA ? -1 : 1;
                        }
                    };
                    var list = new ObservableList_1.default({
                        items: [
                            { id: 1, pid: 0, node: true },
                            { id: 2, pid: 0, node: true },
                            { id: 3, pid: 0, node: false },
                            { id: 4, pid: 1, node: false },
                            { id: 5, pid: 1, node: false },
                            { id: 6, pid: 0, node: true }
                        ]
                    });
                    var tree = new Tree_1.default({
                        collection: list,
                        root: 0,
                        keyProperty: 'id',
                        parentProperty: 'pid',
                        nodeProperty: 'node',
                        sort: sort
                    });
                    var moveFrom = 5;
                    var moveTo = 2;
                    var given = [];
                    var handler = getCollectionChangeHandler(given, function (item) { return item.getContents(); });
                    tree.subscribe('onCollectionChange', handler);
                    list.move(moveFrom, moveTo);
                    tree.unsubscribe('onCollectionChange', handler);
                    chai_1.assert.deepEqual(given, []);
                });
                it('should fire properly with duplicates', function () {
                    var list = new ObservableList_1.default({
                        items: [
                            { id: 'a', pid: 0 },
                            { id: 'aa', pid: 'a' },
                            { id: 'aaa', pid: 'aa' },
                            { id: 'b', pid: 0 },
                            { id: 'ba', pid: 'b' },
                            { id: 'bb', pid: 'b' }
                        ]
                    });
                    var tree = getObservableTree(list);
                    /*
                       0  +-a
                       1  | +-aa
                       2  |   +-aaa
                       3  +-b
                       4    +-ba
                       5      +-bb
                       =>
                       0  +-a
                       1  | +-aa
                       2  |   +-aaa
                       3  |     +-aa1  1st event
                       4  +-b
                       5  | +-ba
                       6  |   +-bb
                       7  +-a          2nd event
                       8    +-aa       2nd event
                       9      +-aaa    2nd event
                       10       +-aa1  2nd event
                    */
                    var expected = [{
                            action: IObservable_1.default.ACTION_ADD,
                            newItems: ['aa1'],
                            newItemsIndex: 3,
                            oldItems: [],
                            oldItemsIndex: 0
                        }, {
                            action: IObservable_1.default.ACTION_ADD,
                            newItems: ['a', 'aa', 'aaa', 'aa1'],
                            newItemsIndex: 7,
                            oldItems: [],
                            oldItemsIndex: 0
                        }];
                    var given = [];
                    var handler = getCollectionChangeHandler(given, function (item) { return item.getContents().id; });
                    tree.subscribe('onCollectionChange', handler);
                    list.append([
                        { id: 'a', pid: 0 },
                        { id: 'aa1', pid: 'a' }
                    ]);
                    tree.unsubscribe('onCollectionChange', handler);
                    chai_1.assert.deepEqual(given, expected);
                });
                it('should fire after call setRootEnumerable with change to true', function () {
                    var given = [];
                    var handler = getCollectionChangeHandler(given);
                    tree.subscribe('onCollectionChange', handler);
                    tree.setRootEnumerable(true);
                    tree.unsubscribe('onCollectionChange', handler);
                    var expected = [{
                            action: IObservable_1.default.ACTION_ADD,
                            newItems: [tree.at(0)],
                            newItemsIndex: 0,
                            oldItems: [],
                            oldItemsIndex: 0
                        }];
                    chai_1.assert.deepEqual(given, expected);
                });
                it('should fire after call setRootEnumerable with change to false', function () {
                    var given = [];
                    var handler = getCollectionChangeHandler(given);
                    tree.setRootEnumerable(true);
                    var expected = [{
                            action: IObservable_1.default.ACTION_REMOVE,
                            newItems: [],
                            newItemsIndex: 0,
                            oldItems: [tree.at(0)],
                            oldItemsIndex: 0
                        }];
                    tree.subscribe('onCollectionChange', handler);
                    tree.setRootEnumerable(false);
                    tree.unsubscribe('onCollectionChange', handler);
                    chai_1.assert.deepEqual(given, expected);
                });
                it('should fire with valid newItemsIndex if root is enumerable', function () {
                    var tree = getObservableTree();
                    var collection = tree.getCollection();
                    var newItem = { id: 999, pid: 0, title: 'New' };
                    var index = 1;
                    // Add newItem into root will affect: add newItem, change root
                    var expected = [{
                            action: IObservable_1.default.ACTION_ADD,
                            newItems: [999],
                            newItemsIndex: 1,
                            oldItems: [],
                            oldItemsIndex: 0
                        }, {
                            action: IObservable_1.default.ACTION_CHANGE,
                            newItems: [0],
                            newItemsIndex: 0,
                            oldItems: [0],
                            oldItemsIndex: 0
                        }];
                    var given = [];
                    var handler = getCollectionChangeHandler(given, function (item) { return item.getContents().id; });
                    tree.at(0);
                    tree.setRootEnumerable(true);
                    tree.subscribe('onCollectionChange', handler);
                    collection.add(newItem, index);
                    tree.unsubscribe('onCollectionChange', handler);
                    chai_1.assert.deepEqual(given, expected);
                });
                it('should fire with valid oldItemsIndex if root is enumerable', function () {
                    var tree = getObservableTree();
                    var collection = tree.getCollection();
                    var index = 1;
                    var item = collection.at(index);
                    // Remove AB from A will affect: remove AB, change A
                    var expected = [{
                            action: IObservable_1.default.ACTION_REMOVE,
                            newItems: [],
                            newItemsIndex: 0,
                            oldItems: [item.title],
                            oldItemsIndex: 3
                        }, {
                            action: IObservable_1.default.ACTION_CHANGE,
                            newItems: ['A'],
                            newItemsIndex: 1,
                            oldItems: ['A'],
                            oldItemsIndex: 1
                        }];
                    var given = [];
                    var handler = getCollectionChangeHandler(given, function (item) { return item.getContents().title; });
                    tree.setRootEnumerable(true);
                    tree.subscribe('onCollectionChange', handler);
                    collection.removeAt(index);
                    tree.unsubscribe('onCollectionChange', handler);
                    chai_1.assert.deepEqual(given, expected);
                });
                it('should fire with updated hierarchy level', function () {
                    var tree = getRecordSetTree();
                    var collection = tree.getCollection();
                    var index = collection.getIndexByValue('id', 4);
                    var item = collection.at(index);
                    var treeItem = tree.getItemBySourceItem(item);
                    var oldLevel = treeItem.getLevel();
                    var level;
                    tree.subscribe('onCollectionChange', function (e, action, newItems) {
                        if (newItems[0].getContents() === item) {
                            level = newItems[0].getLevel();
                        }
                    });
                    item.set('pid', 1);
                    chai_1.assert.strictEqual(oldLevel + 1, level);
                });
                it('should fire with updated hierarchy level if grouped', function () {
                    var tree = getRecordSetTree();
                    var collection = tree.getCollection();
                    var index = collection.getIndexByValue('id', 4);
                    var item = collection.at(index);
                    var treeItem = tree.getItemBySourceItem(item);
                    var oldLevel = treeItem.getLevel();
                    tree.setGroup(function () {
                        return 'foo';
                    });
                    var level;
                    tree.subscribe('onCollectionChange', function (e, action, newItems) {
                        if (newItems[0].getContents() === item) {
                            level = newItems[0].getLevel();
                        }
                    });
                    item.set('pid', 1);
                    chai_1.assert.strictEqual(oldLevel + 1, level);
                });
                it('should fire with an item that changed the level with the parent', function () {
                    var rawData = [
                        { id: 1, pid: 0 },
                        { id: 11, pid: 1 },
                        { id: 111, pid: 11 },
                        { id: 1111, pid: 111 }
                    ];
                    var items = new RecordSet_1.default({
                        rawData: rawData
                    });
                    var tree = new Tree_1.default({
                        collection: items,
                        root: 0,
                        keyProperty: 'id',
                        parentProperty: 'pid'
                    });
                    var expected = [{
                            action: IObservable_1.default.ACTION_CHANGE,
                            newItems: [1, 11, 111, 1111],
                            newItemsIndex: 0,
                            oldItems: [1, 11, 111, 1111],
                            oldItemsIndex: 0
                        }];
                    var given = [];
                    var handler = getCollectionChangeHandler(given, function (item) { return item.getContents().get('id'); });
                    var record = items.at(2);
                    tree.subscribe('onCollectionChange', handler);
                    record.set('pid', 1);
                    tree.unsubscribe('onCollectionChange', handler);
                    chai_1.assert.deepEqual(given, expected);
                });
                it('should fire on changed node if item has been moved to one', function () {
                    var tree = getRecordSetTree();
                    var collection = tree.getCollection();
                    var positionD = collection.getIndexByValue('title', 'D');
                    var itemD = collection.at(positionD);
                    // Move D into AC will affect: move D, change AC
                    var expected = [{
                            action: IObservable_1.default.ACTION_MOVE,
                            newItems: [itemD.get('title')],
                            newItemsIndex: 7,
                            oldItems: [itemD.get('title')],
                            oldItemsIndex: 12
                        }, {
                            action: IObservable_1.default.ACTION_CHANGE,
                            newItems: ['AC'],
                            newItemsIndex: 3,
                            oldItems: ['AC'],
                            oldItemsIndex: 3
                        }];
                    var given = [];
                    var handler = getCollectionChangeHandler(given, function (item) { return item.getContents().get('title'); });
                    tree.subscribe('onCollectionChange', handler);
                    itemD.set('pid', 12); // Root -> AC
                    tree.unsubscribe('onCollectionChange', handler);
                    chai_1.assert.deepEqual(given, expected);
                });
                it('should fire on changed node if it\'s item has been moved to another node', function () {
                    var tree = getRecordSetTree();
                    var collection = tree.getCollection();
                    var item = collection.getRecordById(200);
                    // Move BAA into AC will affect: move BAA, move BAAA, change BAA, change AC, change BA
                    var expected = [{
                            action: IObservable_1.default.ACTION_MOVE,
                            newItems: ['BAA', 'BAAA'],
                            newItemsIndex: 7,
                            oldItems: ['BAA', 'BAAA'],
                            oldItemsIndex: 9
                        }, {
                            action: IObservable_1.default.ACTION_CHANGE,
                            newItems: ['AC'],
                            newItemsIndex: 3,
                            oldItems: ['AC'],
                            oldItemsIndex: 3
                        }, {
                            action: IObservable_1.default.ACTION_CHANGE,
                            newItems: ['BA'],
                            newItemsIndex: 10,
                            oldItems: ['BA'],
                            oldItemsIndex: 10
                        }];
                    var given = [];
                    var handler = getCollectionChangeHandler(given, function (item) { return item.getContents().get('title'); });
                    tree.subscribe('onCollectionChange', handler);
                    item.set('pid', 12);
                    tree.unsubscribe('onCollectionChange', handler);
                    chai_1.assert.deepEqual(given, expected);
                });
                it('should fire on parent node if item has been added to it but filtered', function () {
                    var tree = getRecordSetTree();
                    var collection = tree.getCollection();
                    var itemId = 2000;
                    var parentId = 1;
                    var item = collection.getRecordById(itemId);
                    // Add BAAA (2000) into A (1) as hidden will affect: change A
                    var expected = [{
                            action: IObservable_1.default.ACTION_CHANGE,
                            newItems: ['A'],
                            newItemsIndex: 0,
                            oldItems: ['A'],
                            oldItemsIndex: 0
                        }];
                    var given = [];
                    var handler = getCollectionChangeHandler(given, function (item) { return item.getContents().get('title'); });
                    collection.remove(item);
                    tree.setFilter(function (item) { return item.get('pid') !== parentId; });
                    tree.subscribe('onCollectionChange', handler);
                    item.set('pid', parentId);
                    collection.add(item);
                    tree.unsubscribe('onCollectionChange', handler);
                    chai_1.assert.deepEqual(given, expected);
                });
                it('should fire with inherited "expanded" property after replace an item', function () {
                    var tree = getObservableTree();
                    var collection = tree.getCollection();
                    var itemIndex = 1;
                    var item = tree.at(itemIndex);
                    var sourceIndex = collection.getIndex(item.getContents());
                    var expected = [{
                            action: IObservable_1.default.ACTION_REMOVE,
                            newItems: [],
                            newItemsIndex: 0,
                            oldItems: [true],
                            oldItemsIndex: 1
                        }, {
                            action: IObservable_1.default.ACTION_ADD,
                            newItems: [true],
                            newItemsIndex: 1,
                            oldItems: [],
                            oldItemsIndex: 0
                        }];
                    var given = [];
                    var handler = getCollectionChangeHandler(given, function (item) { return item.isExpanded(); });
                    var newItem = Object.create(item.getContents());
                    item.setExpanded(true);
                    tree.subscribe('onCollectionChange', handler);
                    collection.replace(newItem, sourceIndex);
                    tree.unsubscribe('onCollectionChange', handler);
                    chai_1.assert.deepEqual(given, expected);
                });
                it('should dont with inherited "expanded" property after replace an item which no longer presented ' +
                    'in the tree', function () {
                    var tree = getObservableTree();
                    var collection = tree.getCollection();
                    var itemIndex = 1;
                    var item = tree.at(itemIndex);
                    var sourceIndex = collection.getIndex(item.getContents());
                    var expected = [{
                            action: IObservable_1.default.ACTION_REMOVE,
                            newItems: [],
                            newItemsIndex: 0,
                            oldItems: [true],
                            oldItemsIndex: 1
                        }, {
                            action: IObservable_1.default.ACTION_CHANGE,
                            newItems: [false],
                            newItemsIndex: 0,
                            oldItems: [false],
                            oldItemsIndex: 0
                        }];
                    var given = [];
                    var handler = getCollectionChangeHandler(given, function (item) { return item.isExpanded(); });
                    var newItem = Object.create(item.getContents());
                    newItem.pid = -1;
                    item.setExpanded(true);
                    tree.subscribe('onCollectionChange', handler);
                    collection.replace(newItem, sourceIndex);
                    tree.unsubscribe('onCollectionChange', handler);
                    chai_1.assert.deepEqual(given, expected);
                });
                it('should fire after remove-collapse-add-expand a node if filter used', function () {
                    var items = [
                        { id: 'a', pid: null },
                        { id: 'b', pid: null },
                        { id: 'c', pid: 'a' }
                    ];
                    var list = new ObservableList_1.default({
                        items: items
                    });
                    var hidden = [];
                    var tree = new Tree_1.default({
                        keyProperty: 'id',
                        parentProperty: 'pid',
                        root: null,
                        collection: list,
                        filter: function (item) { return hidden.indexOf(item.id) === -1; }
                    });
                    var expected = [];
                    var given = [];
                    var handler = getCollectionChangeHandler(given, function (item) { return item.getContents().id; });
                    var nodeA = tree.at(0);
                    nodeA.setExpanded(true);
                    tree.subscribe('onCollectionChange', handler);
                    var removedItem = nodeA.getContents();
                    list.remove(removedItem);
                    expected.push({
                        action: IObservable_1.default.ACTION_REMOVE,
                        newItems: [],
                        newItemsIndex: 0,
                        oldItems: ['a', 'c'],
                        oldItemsIndex: 0
                    });
                    hidden = ['c'];
                    nodeA.setExpanded(false);
                    expected.push({
                        action: IObservable_1.default.ACTION_CHANGE,
                        newItems: ['a'],
                        newItemsIndex: -1,
                        oldItems: ['a'],
                        oldItemsIndex: -1
                    });
                    list.add(removedItem);
                    var nodeB = tree.at(1);
                    expected.push({
                        action: IObservable_1.default.ACTION_ADD,
                        newItems: ['a'],
                        newItemsIndex: 1,
                        oldItems: [],
                        oldItemsIndex: 0
                    });
                    hidden = [];
                    nodeB.setExpanded(true);
                    expected.push({
                        action: IObservable_1.default.ACTION_ADD,
                        newItems: ['c'],
                        newItemsIndex: 2,
                        oldItems: [],
                        oldItemsIndex: 0
                    });
                    expected.push({
                        action: IObservable_1.default.ACTION_CHANGE,
                        newItems: ['a'],
                        newItemsIndex: 1,
                        oldItems: ['a'],
                        oldItemsIndex: 1
                    });
                    tree.unsubscribe('onCollectionChange', handler);
                    chai_1.assert.deepEqual(given, expected);
                });
            });
        });
        describe('.toJSON()', function () {
            it('should clone the tree', function () {
                var serializer = new Serializer();
                var json = JSON.stringify(tree, serializer.serialize);
                var clone = JSON.parse(json, serializer.deserialize);
                var items = tree.getItems();
                var cloneItems = clone.getItems();
                for (var i = 0; i < items.length; i++) {
                    chai_1.assert.strictEqual(items[i].getInstanceId(), cloneItems[i].getInstanceId(), 'at ' + i);
                    var parent_1 = items[i].getParent();
                    var cloneParent = cloneItems[i].getParent();
                    chai_1.assert.strictEqual(parent_1.getInstanceId(), cloneParent.getInstanceId(), 'at parent for ' + i);
                }
            });
            it('should keep relation between a tree item contents and the source collection', function () {
                var serializer = new Serializer();
                var json = JSON.stringify(tree, serializer.serialize);
                var clone = JSON.parse(json, serializer.deserialize);
                clone.each(function (item) {
                    chai_1.assert.notEqual(clone.getCollection().getIndex(item.getContents()), -1);
                });
            });
        });
    });
});
