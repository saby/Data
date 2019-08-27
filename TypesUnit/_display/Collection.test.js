define(["require", "exports", "chai", "Types/_collection/IObservable", "Types/_display/Abstract", "Types/_display/Collection", "Types/_display/GroupItem", "Types/_collection/RecordSet", "Types/_collection/ObservableList", "Types/_collection/List", "Types/_entity/functor/Compute", "Types/_entity/Model", "Core/Serializer", "Core/core-instance"], function (require, exports, chai_1, IObservable_1, Abstract_1, Collection_1, GroupItem_1, RecordSet_1, ObservableList_1, List_1, Compute_1, Model_1, Serializer, coreInstance) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_display/Collection', function () {
        function getItems() {
            return [{
                    id: 1,
                    name: 'Иванов'
                }, {
                    id: 2,
                    name: 'Петров'
                }, {
                    id: 3,
                    name: 'Сидоров'
                }, {
                    id: 4,
                    name: 'Пухов'
                }, {
                    id: 5,
                    name: 'Молодцов'
                }, {
                    id: 6,
                    name: 'Годолцов'
                }, {
                    id: 7,
                    name: 'Арбузнов'
                }];
        }
        var items;
        var list;
        var display;
        beforeEach(function () {
            items = getItems();
            list = new ObservableList_1.default({
                items: items
            });
            display = new Collection_1.default({
                collection: list,
                keyProperty: 'id'
            });
        });
        afterEach(function () {
            display.destroy();
            display = undefined;
            list.destroy();
            list = undefined;
            items = undefined;
        });
        describe('.constructor()', function () {
            it('should use filter from options', function () {
                var list = new List_1.default({
                    items: [1, 2, 3, 4]
                });
                var display = new Collection_1.default({
                    collection: list,
                    filter: function (item) { return item === 3; }
                });
                var count = 0;
                display.each(function (item) {
                    chai_1.assert.equal(item.getContents(), 3);
                    count++;
                });
                chai_1.assert.equal(count, 1);
            });
            it('should use group from options', function () {
                var list = new List_1.default({
                    items: [
                        { id: 1, group: 1 },
                        { id: 2, group: 2 },
                        { id: 3, group: 1 },
                        { id: 4, group: 3 }
                    ]
                });
                var display = new Collection_1.default({
                    collection: list,
                    group: function (item) { return item.group; }
                });
                var groupedItems = [1, list.at(0), list.at(2), 2, list.at(1), 3, list.at(3)];
                display.each(function (item, i) {
                    chai_1.assert.strictEqual(groupedItems[i], item.getContents());
                });
            });
            it('should use sort from options', function () {
                var list = new ObservableList_1.default({
                    items: [5, 4, 3, 2, 1]
                });
                var display = new Collection_1.default({
                    collection: list,
                    sort: function (a, b) { return a.collectionItem - b.collectionItem; }
                });
                var sortedItems = [1, 2, 3, 4, 5];
                display.each(function (item, i) {
                    chai_1.assert.equal(sortedItems[i], item.getContents());
                });
            });
            it('should throw an error on invalid argument', function () {
                var display;
                chai_1.assert.throws(function () {
                    display = new Collection_1.default({
                        collection: {}
                    });
                });
                chai_1.assert.throws(function () {
                    display = new Collection_1.default({
                        collection: 'a'
                    });
                });
                chai_1.assert.throws(function () {
                    display = new Collection_1.default({
                        collection: 1
                    });
                });
                chai_1.assert.throws(function () {
                    display = new Collection_1.default({
                        collection: undefined
                    });
                });
                chai_1.assert.isUndefined(display);
            });
            it('should add an important property if Compute functor for sort used', function () {
                var importantProps = ['bar'];
                var functor = new Compute_1.default(function (a, b) { return a - b; }, ['foo']);
                var display = new Collection_1.default({
                    collection: list,
                    sort: functor,
                    importantItemProperties: importantProps
                });
                chai_1.assert.isTrue(importantProps.indexOf('foo') > -1);
                chai_1.assert.isTrue(importantProps.indexOf('bar') > -1);
                display.destroy();
            });
            it('should add an important property if Compute functor for group used', function () {
                var importantProps = ['bar'];
                var functor = new Compute_1.default(function () { return 'banana'; }, ['foo']);
                var display = new Collection_1.default({
                    collection: list,
                    group: functor,
                    importantItemProperties: importantProps
                });
                chai_1.assert.isTrue(importantProps.indexOf('foo') > -1);
                chai_1.assert.isTrue(importantProps.indexOf('bar') > -1);
                display.destroy();
            });
        });
        describe('.getEnumerator()', function () {
            it('should return a display enumerator', function () {
                var display = new Collection_1.default({
                    collection: new ObservableList_1.default()
                });
                chai_1.assert.isTrue(coreInstance.instanceOfModule(display.getEnumerator(), 'Types/_display/CollectionEnumerator'));
            });
            context('if has repeatable ids', function () {
                var items;
                var display;
                beforeEach(function () {
                    items = new ObservableList_1.default({
                        items: [
                            { id: 'a' },
                            { id: 'aa' },
                            { id: 'ab' },
                            { id: 'b' },
                            { id: 'ba' },
                            { id: 'b' },
                            { id: 'bb' }
                        ]
                    });
                    display = new Collection_1.default({
                        collection: items,
                        keyProperty: 'id'
                    });
                });
                afterEach(function () {
                    display.destroy();
                    display = undefined;
                    items = undefined;
                });
                it('should include repeatable elements if unique=false', function () {
                    var enumerator = display.getEnumerator();
                    var expected = ['a', 'aa', 'ab', 'b', 'ba', 'b', 'bb'];
                    var index = 0;
                    while (enumerator.moveNext()) {
                        var item = enumerator.getCurrent();
                        chai_1.assert.strictEqual(item.getContents().id, expected[index]);
                        index++;
                    }
                    chai_1.assert.equal(index, expected.length);
                });
                it('should skip repeatable elements if unique=true', function () {
                    display.setUnique(true);
                    var enumerator = display.getEnumerator();
                    var expected = ['a', 'aa', 'ab', 'b', 'ba', 'bb'];
                    var index = 0;
                    while (enumerator.moveNext()) {
                        var item = enumerator.getCurrent();
                        chai_1.assert.strictEqual(item.getContents().id, expected[index]);
                        index++;
                    }
                    chai_1.assert.equal(index, expected.length);
                });
            });
        });
        describe('.each()', function () {
            it('should return every item in original order', function () {
                var ok = true;
                var index = 0;
                display.each(function (item) {
                    if (item.getContents() !== items[index]) {
                        ok = false;
                    }
                    index++;
                });
                chai_1.assert.isTrue(ok);
            });
            it('should return every item index in original order', function () {
                var ok = true;
                var index = 0;
                display.each(function (item, innerIndex) {
                    if (index !== innerIndex) {
                        ok = false;
                    }
                    index++;
                });
                chai_1.assert.isTrue(ok);
            });
            it('should return items in order of sort function', function () {
                var list = new RecordSet_1.default({
                    rawData: [
                        { id: 1, title: 1 },
                        { id: 2, title: 2 },
                        { id: 3, title: 3 },
                        { id: 4, title: 4 }
                    ],
                    idProperty: 'id'
                });
                var display = new Collection_1.default({
                    collection: list,
                    importantItemProperties: ['title'],
                    filter: function (a) { return a.get('title') < 3; },
                    sort: function (a, b) { return a.collectionItem.get('title') - b.collectionItem.get('title'); }
                });
                var sortedItems = [1, 4, 2];
                list.at(3).set('title', 1);
                var result = [];
                display.each(function (item) {
                    result.push(item.getContents().getId());
                });
                chai_1.assert.deepEqual(result, sortedItems);
            });
            it('should return groups and items together', function () {
                var expected = [];
                var groups = [];
                items.forEach(function (item) {
                    if (groups.indexOf(item.id) === -1) {
                        groups.push(item.id);
                        expected.push(item.id);
                    }
                    expected.push(item);
                });
                display.setGroup(function (item) { return item.id; });
                var count = 0;
                display.each(function (item, index) {
                    chai_1.assert.equal(item.getContents(), expected[index]);
                    count++;
                });
                chai_1.assert.equal(count, expected.length);
            });
            it.skip('should remain empty group that match filter after remove last it member', function () {
                var items = [
                    { id: 1, group: 1 },
                    { id: 2, group: 2 }
                ];
                var list = new ObservableList_1.default({
                    items: items
                });
                var display = new Collection_1.default({
                    collection: list,
                    keyProperty: 'id',
                    group: function (item) { return item.group; },
                    filter: function () { return true; }
                });
                var expected = [2, items[1], 1];
                var count = 0;
                list.removeAt(0);
                display.each(function (item, index) {
                    chai_1.assert.equal(item.getContents(), expected[index], 'at ' + index);
                    count++;
                });
                chai_1.assert.equal(count, expected.length);
            });
            it('should return new group after prepend an item with filter', function () {
                var items = [
                    { id: 1, group: 1 },
                    { id: 2, group: 2 }
                ];
                var list = new ObservableList_1.default({
                    items: items
                });
                var display = new Collection_1.default({
                    collection: list,
                    keyProperty: 'id',
                    group: function (item) { return item.group; },
                    filter: function () { return true; }
                });
                var item = { id: 2, group: 3 };
                var expected = [3, item, 1, items[0], 2, items[1]];
                var count = 0;
                list.add(item, 0);
                display.each(function (item, index) {
                    chai_1.assert.equal(item.getContents(), expected[index]);
                    count++;
                });
                chai_1.assert.equal(count, expected.length);
            });
            it('should remove empty groups after add an item', function () {
                var items = [
                    { id: 1, group: 1 },
                    { id: 2, group: 2 }
                ];
                var list = new ObservableList_1.default({
                    items: items
                });
                var display = new Collection_1.default({
                    collection: list,
                    keyProperty: 'id',
                    group: function (item) { return item.group; }
                });
                var item = { id: 2, group: 3 };
                var expected = [2, items[1], 3, item];
                var count = 0;
                list.removeAt(0);
                list.add(item);
                display.each(function (item, index) {
                    chai_1.assert.equal(item.getContents(), expected[index]);
                    count++;
                });
                chai_1.assert.equal(count, expected.length);
            });
            it('should return groups and items together', function () {
                var expected = [];
                var groups = [];
                var count;
                items.forEach(function (item) {
                    if (groups.indexOf(item.id) === -1) {
                        groups.push(item.id);
                        expected.push(item.id);
                    }
                    expected.push(item);
                });
                display.setGroup(function (item) { return item.id; });
                count = 0;
                display.each(function (item, index) {
                    chai_1.assert.equal(item.getContents(), expected[index]);
                    count++;
                });
                chai_1.assert.equal(count, expected.length);
            });
        });
        describe('.getCount()', function () {
            var items;
            var list;
            var display;
            beforeEach(function () {
                items = [1, 2, 3, 4];
                list = new ObservableList_1.default({ items: items });
                display = new Collection_1.default({
                    collection: list,
                    group: function (item) { return item % 2; }
                });
            });
            it('should consider groups', function () {
                chai_1.assert.equal(display.getCount(), 1.5 * items.length);
            });
            it('should skip groups', function () {
                chai_1.assert.equal(display.getCount(true), items.length);
            });
        });
        describe('.setFilter()', function () {
            function getItems() {
                return [1, 2, 3, 4];
            }
            it('should filter display by collection item', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var filter = function (item) { return item === 3; };
                var display = new Collection_1.default({
                    collection: list
                });
                display.setFilter(filter);
                var count = 0;
                display.each(function (item) {
                    chai_1.assert.equal(item.getContents(), 3);
                    count++;
                });
                chai_1.assert.equal(count, 1);
            });
            it('should filter display by collection position', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var filter = function (item, index) { return index === 1; };
                var display = new Collection_1.default({
                    collection: list
                });
                display.setFilter(filter);
                var count = 0;
                display.each(function (item) {
                    chai_1.assert.equal(list.getIndex(item.getContents()), 1);
                    count++;
                });
                chai_1.assert.equal(count, 1);
            });
            it('should filter display by display item', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var filter = function (item, index, displayItem) { return displayItem.getContents() === 2; };
                var display = new Collection_1.default({
                    collection: list
                });
                display.setFilter(filter);
                var count = 0;
                display.each(function (item) {
                    chai_1.assert.equal(item.getContents(), 2);
                    count++;
                });
                chai_1.assert.equal(count, 1);
            });
            it('should filter display by display index', function () {
                var filter = function (item, index, displayItem, displayIndex) { return displayIndex === 3; };
                var sort = function (a, b) { return b.collectionItem - a.collectionItem; };
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var display = new Collection_1.default({
                    collection: list,
                    filter: filter,
                    sort: sort
                });
                display.setFilter(filter);
                var count = 0;
                display.each(function (item) {
                    chai_1.assert.equal(list.getIndex(item.getContents()), 0);
                    count++;
                });
                chai_1.assert.equal(count, 1);
            });
            it('should call filter for all items if it use display index', function () {
                var data = [{ id: 1 }, { id: 2 }, { id: 3 }];
                var list = new RecordSet_1.default({
                    rawData: data
                });
                var display = new Collection_1.default({
                    collection: list,
                    importantItemProperties: ['id'],
                    filter: function (item, index, displayItem, displayIndex) {
                        count++;
                        return displayIndex > -1;
                    }
                });
                var count = 0;
                list.at(0).set('id', 'foo');
                chai_1.assert.equal(count, data.length);
                display.destroy();
                list.destroy();
            });
            it('should filter display use array of filters', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var filterA = function (item) { return item > 2; };
                var filterB = function (item) { return item < 4; };
                var display = new Collection_1.default({
                    collection: list
                });
                display.setFilter([filterA, filterB]);
                var count = 0;
                display.each(function (item) {
                    chai_1.assert.equal(item.getContents(), 3);
                    count++;
                });
                chai_1.assert.equal(count, 1);
            });
            it('should filter display use several filters', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var filterA = function (item) { return item > 2; };
                var filterB = function (item) { return item < 4; };
                var display = new Collection_1.default({
                    collection: list
                });
                display.setFilter(filterA, filterB);
                var count = 0;
                display.each(function (item) {
                    chai_1.assert.equal(item.getContents(), 3);
                    count++;
                });
                chai_1.assert.equal(count, 1);
            });
            it('should filter display after assign an items', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var filter = function (item) { return item === 5 || item === 6; };
                var display = new Collection_1.default({
                    collection: list
                });
                display.setFilter(filter);
                list.assign([4, 5, 6, 7]);
                var count = 0;
                display.each(function (item) {
                    chai_1.assert.equal(item.getContents(), 5 + count);
                    count++;
                });
                chai_1.assert.equal(count, 2);
            });
            it('should filter display after add item', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var filter = function (item) { return item === 3; };
                var display = new Collection_1.default({
                    collection: list
                });
                display.setFilter(filter);
                list.add(4);
                list.add(3);
                var count = 0;
                display.each(function (item) {
                    chai_1.assert.equal(item.getContents(), 3);
                    count++;
                });
                chai_1.assert.equal(count, 2);
            });
            it('should filter display after remove item', function () {
                var list = new ObservableList_1.default({
                    items: [1, 2, 3, 3]
                });
                var filter = function (item) { return item === 3; };
                var display = new Collection_1.default({
                    collection: list
                });
                display.setFilter(filter);
                list.removeAt(3);
                var count = 0;
                display.each(function (item) {
                    chai_1.assert.equal(item.getContents(), 3);
                    count++;
                });
                chai_1.assert.equal(count, 1);
            });
            it('should filter display after replace item', function () {
                var list = new ObservableList_1.default({
                    items: [1, 2, 3, 2]
                });
                var filter = function (item) { return item === 3; };
                var display = new Collection_1.default({
                    collection: list
                });
                display.setFilter(filter);
                list.replace(3, 1);
                var count = 0;
                display.each(function (item) {
                    chai_1.assert.equal(item.getContents(), 3);
                    count++;
                });
                chai_1.assert.equal(count, 2);
            });
            it('should not refilter display after change item', function () {
                var changeModel = new Model_1.default({
                    rawData: { max: 2 }
                });
                var list = new ObservableList_1.default({
                    items: [
                        new Model_1.default({
                            rawData: { max: 1 }
                        }),
                        new Model_1.default({
                            rawData: { max: 3 }
                        }),
                        new Model_1.default({
                            rawData: { max: 4 }
                        }),
                        changeModel
                    ]
                });
                var filter = function (item) { return item.get('max') === 3; };
                var display = new Collection_1.default({
                    collection: list
                });
                display.setFilter(filter);
                changeModel.set('max', 3);
                var count = 0;
                display.each(function (item) {
                    chai_1.assert.equal(item.getContents().get('max'), 3);
                    count++;
                });
                chai_1.assert.equal(count, 1);
            });
            it('should refilter display after change item', function () {
                var changeModel = new Model_1.default({
                    rawData: { max: 2 }
                });
                var list = new ObservableList_1.default({
                    items: [
                        new Model_1.default({
                            rawData: { max: 1 }
                        }),
                        new Model_1.default({
                            rawData: { max: 3 }
                        }),
                        new Model_1.default({
                            rawData: { max: 4 }
                        }),
                        changeModel
                    ]
                });
                var filter = function (item) { return item.get('max') === 3; };
                var display = new Collection_1.default({
                    collection: list,
                    importantItemProperties: ['max']
                });
                display.setFilter(filter);
                changeModel.set('max', 3);
                var count = 0;
                display.each(function (item) {
                    chai_1.assert.equal(item.getContents().get('max'), 3);
                    count++;
                });
                chai_1.assert.equal(count, 2);
            });
        });
        describe('.getFilter()', function () {
            it('should return a display filters', function () {
                var display = new Collection_1.default({
                    collection: new ObservableList_1.default()
                });
                var filter = function () {
                    return true;
                };
                display.setFilter(filter);
                chai_1.assert.deepEqual(display.getFilter(), [filter]);
                display.setFilter(filter);
                chai_1.assert.deepEqual(display.getFilter(), [filter]);
            });
        });
        describe('.addFilter()', function () {
            function getItems() {
                return [1, 2, 3, 4];
            }
            it('should add a filter', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var filter = function (item) { return item === 3; };
                var display = new Collection_1.default({
                    collection: list
                });
                display.addFilter(filter);
                var count = 0;
                display.each(function (item) {
                    chai_1.assert.equal(item.getContents(), 3);
                    count++;
                });
                chai_1.assert.equal(count, 1);
            });
            it('should trigger onCollectionChange', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var expected = [{
                        action: IObservable_1.default.ACTION_REMOVE,
                        newItems: [],
                        newItemsIndex: 0,
                        oldItems: [display.at(0), display.at(1)],
                        oldItemsIndex: 0
                    }, {
                        action: IObservable_1.default.ACTION_REMOVE,
                        newItems: [],
                        newItemsIndex: 0,
                        oldItems: [display.at(3)],
                        oldItemsIndex: 1
                    }];
                var given = [];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    given.push({
                        action: action,
                        newItems: newItems,
                        newItemsIndex: newItemsIndex,
                        oldItems: oldItems,
                        oldItemsIndex: oldItemsIndex
                    });
                };
                var filter = function (item) { return item === 3; };
                display.subscribe('onCollectionChange', handler);
                display.addFilter(filter);
                display.unsubscribe('onCollectionChange', handler);
                for (var i = 0; i < Math.max(expected.length, given.length); i++) {
                    chai_1.assert.equal(given[i].action, expected[i].action);
                    chai_1.assert.deepEqual(given[i].newItems, expected[i].newItems);
                    chai_1.assert.deepEqual(given[i].oldItems, expected[i].oldItems);
                    chai_1.assert.strictEqual(given[i].newItemsIndex, expected[i].newItemsIndex);
                    chai_1.assert.strictEqual(given[i].oldItemsIndex, expected[i].oldItemsIndex);
                }
            });
        });
        describe('.removeFilter()', function () {
            function getItems() {
                return [1, 2, 3, 4];
            }
            it('should remove a filter', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var filter = function (item) { return item === 3; };
                var display = new Collection_1.default({
                    collection: list,
                    filter: filter
                });
                display.removeFilter(filter);
                var count = 0;
                display.each(function (item, index) {
                    chai_1.assert.equal(item.getContents(), list.at(index));
                    count++;
                });
                chai_1.assert.equal(count, list.getCount());
            });
            it('should trigger onCollectionChange', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var expected = [{
                        action: IObservable_1.default.ACTION_ADD,
                        newItems: [display.at(0), display.at(1)],
                        newItemsIndex: 0,
                        oldItems: [],
                        oldItemsIndex: 0
                    }, {
                        action: IObservable_1.default.ACTION_ADD,
                        newItems: [display.at(3)],
                        newItemsIndex: 3,
                        oldItems: [],
                        oldItemsIndex: 0
                    }];
                var given = [];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    given.push({
                        action: action,
                        newItems: newItems,
                        newItemsIndex: newItemsIndex,
                        oldItems: oldItems,
                        oldItemsIndex: oldItemsIndex
                    });
                };
                var filter = function (item) { return item === 3; };
                display.setFilter(filter);
                display.subscribe('onCollectionChange', handler);
                display.removeFilter(filter);
                display.unsubscribe('onCollectionChange', handler);
                for (var i = 0; i < Math.max(expected.length, given.length); i++) {
                    chai_1.assert.equal(given[i].action, expected[i].action);
                    chai_1.assert.deepEqual(given[i].newItems, expected[i].newItems);
                    chai_1.assert.deepEqual(given[i].oldItems, expected[i].oldItems);
                    chai_1.assert.strictEqual(given[i].newItemsIndex, expected[i].newItemsIndex);
                    chai_1.assert.strictEqual(given[i].oldItemsIndex, expected[i].oldItemsIndex);
                }
            });
        });
        describe('.setSort()', function () {
            var getItems = function () {
                return [1, 2, 3, 4];
            };
            var getSortedItems = function () {
                return [4, 3, 2, 1];
            };
            var sort = function (a, b) { return b.collectionItem - a.collectionItem; };
            it('should sort display', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var sortedItems = getSortedItems();
                var display = new Collection_1.default({
                    collection: list
                });
                display.setSort(sort);
                display.each(function (item, i) {
                    chai_1.assert.equal(sortedItems[i], item.getContents());
                });
            });
            it('should sort display use several sorters', function () {
                var items = [
                    { id: 0, x: 1, y: 1 },
                    { id: 1, x: 1, y: 2 },
                    { id: 2, x: 2, y: 1 },
                    { id: 3, x: 2, y: 2 }
                ];
                var list = new ObservableList_1.default({
                    items: items
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var sortX = function (a, b) { return a.collectionItem.x - b.collectionItem.x; };
                var sortY = function (a, b) { return b.collectionItem.y - a.collectionItem.y; };
                var expected = [1, 3, 0, 2];
                display.setSort(sortY, sortX);
                display.each(function (item, i) {
                    chai_1.assert.equal(item.getContents().id, expected[i]);
                });
            });
            it('should trigger onCollectionChange', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var expected = [{
                        action: IObservable_1.default.ACTION_MOVE,
                        newItems: [display.at(3)],
                        newItemsIndex: 0,
                        oldItems: [display.at(3)],
                        oldItemsIndex: 3
                    }, {
                        action: IObservable_1.default.ACTION_MOVE,
                        newItems: [display.at(2)],
                        newItemsIndex: 1,
                        oldItems: [display.at(2)],
                        oldItemsIndex: 3
                    }, {
                        action: IObservable_1.default.ACTION_MOVE,
                        newItems: [display.at(1)],
                        newItemsIndex: 2,
                        oldItems: [display.at(1)],
                        oldItemsIndex: 3
                    }];
                var given = [];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    given.push({
                        action: action,
                        newItems: newItems,
                        newItemsIndex: newItemsIndex,
                        oldItems: oldItems,
                        oldItemsIndex: oldItemsIndex
                    });
                };
                display.subscribe('onCollectionChange', handler);
                display.setSort(sort);
                display.unsubscribe('onCollectionChange', handler);
                chai_1.assert.deepEqual(given, expected);
            });
            it('should reset a sort display', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var sortedItems = getItems();
                var display = new Collection_1.default({
                    collection: list
                });
                display.setSort(sort);
                display.setSort();
                display.each(function (item, i) {
                    chai_1.assert.equal(sortedItems[i], item.getContents());
                });
            });
            it('should sort display after add item', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var sortedItems = [5, 4, 3, 2, 1];
                var display = new Collection_1.default({
                    collection: list
                });
                display.setSort(sort);
                list.add(5);
                display.each(function (item, i) {
                    chai_1.assert.equal(sortedItems[i], item.getContents());
                });
            });
            it('should sort display after remove item', function () {
                var list = new ObservableList_1.default({
                    items: [1, 2, 10, 3, 4]
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var expected = [4, 3, 2, 1];
                var given = [];
                display.setSort(sort);
                list.removeAt(2);
                display.each(function (item) {
                    given.push(item.getContents());
                });
                chai_1.assert.deepEqual(given, expected);
            });
            it('should sort display after replace item', function () {
                var list = new ObservableList_1.default({
                    items: [1, 2, 2, 3, 5]
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var expected = [5, 4, 3, 2, 1];
                display.setSort(sort);
                list.replace(4, 2);
                display.each(function (item, i) {
                    chai_1.assert.equal(expected[i], item.getContents());
                });
            });
            it('should not resort display after change item', function () {
                var changeModel = new Model_1.default({
                    rawData: { max: 2 }
                });
                var list = new ObservableList_1.default({
                    items: [
                        new Model_1.default({
                            rawData: { max: 1 }
                        }),
                        new Model_1.default({
                            rawData: { max: 3 }
                        }),
                        new Model_1.default({
                            rawData: { max: 4 }
                        }),
                        changeModel
                    ]
                });
                var sortedItems = [4, 3, 10, 1];
                var display = new Collection_1.default({
                    collection: list
                });
                display.setSort(function (a, b) { return b.collectionItem.get('max') - a.collectionItem.get('max'); });
                changeModel.set('max', 10);
                display.each(function (item, i) {
                    chai_1.assert.equal(sortedItems[i], item.getContents().get('max'));
                });
            });
            it('should resort display after change item', function () {
                var changeModel = new Model_1.default({
                    rawData: { max: 2 }
                });
                var list = new ObservableList_1.default({
                    items: [
                        new Model_1.default({
                            rawData: { max: 1 }
                        }),
                        new Model_1.default({
                            rawData: { max: 3 }
                        }),
                        new Model_1.default({
                            rawData: { max: 4 }
                        }),
                        changeModel
                    ]
                });
                var sortedItems = [10, 4, 3, 1];
                var display = new Collection_1.default({
                    collection: list,
                    importantItemProperties: ['max']
                });
                display.setSort(function (a, b) { return b.collectionItem.get('max') - a.collectionItem.get('max'); });
                changeModel.set('max', 10);
                display.each(function (item, i) {
                    chai_1.assert.equal(sortedItems[i], item.getContents().get('max'));
                });
            });
            it('should add an important property if Compute functor used', function () {
                var importantProps = ['bar'];
                var functor = new Compute_1.default(function (a, b) { return a - b; }, ['foo']);
                var display = new Collection_1.default({
                    collection: list,
                    importantItemProperties: importantProps
                });
                display.setSort(functor);
                chai_1.assert.isTrue(importantProps.indexOf('foo') > -1);
                chai_1.assert.isTrue(importantProps.indexOf('bar') > -1);
            });
            it('should remove an important property if Compute functor no longer used', function () {
                var importantProps = ['bar'];
                var functor = new Compute_1.default(function (a, b) { return a - b; }, ['foo']);
                var display = new Collection_1.default({
                    collection: list,
                    sort: functor,
                    importantItemProperties: importantProps
                });
                display.setSort();
                chai_1.assert.isTrue(importantProps.indexOf('foo') === -1);
                chai_1.assert.isTrue(importantProps.indexOf('bar') > -1);
            });
        });
        describe('.getSort()', function () {
            it('should return a display sort', function () {
                var sort = function () {
                    return 0;
                };
                var display = new Collection_1.default({
                    collection: new ObservableList_1.default(),
                    sort: sort
                });
                chai_1.assert.deepEqual(display.getSort(), [sort]);
            });
        });
        describe('.addSort()', function () {
            var getItems = function () { return [1, 2, 3, 4]; };
            var getSortedItems = function () { return [4, 3, 2, 1]; };
            var sort = function (a, b) { return b.collectionItem - a.collectionItem; };
            it('should sort display', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var sortedItems = getSortedItems();
                var display = new Collection_1.default({
                    collection: list
                });
                display.addSort(sort);
                display.each(function (item, i) {
                    chai_1.assert.equal(item.getContents(), sortedItems[i]);
                });
            });
            it('should trigger onCollectionChange', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var expected = [{
                        action: IObservable_1.default.ACTION_MOVE,
                        newItems: [display.at(3)],
                        newItemsIndex: 0,
                        oldItems: [display.at(3)],
                        oldItemsIndex: 3
                    }, {
                        action: IObservable_1.default.ACTION_MOVE,
                        newItems: [display.at(2)],
                        newItemsIndex: 1,
                        oldItems: [display.at(2)],
                        oldItemsIndex: 3
                    }, {
                        action: IObservable_1.default.ACTION_MOVE,
                        newItems: [display.at(1)],
                        newItemsIndex: 2,
                        oldItems: [display.at(1)],
                        oldItemsIndex: 3
                    }];
                var given = [];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    given.push({
                        action: action,
                        newItems: newItems,
                        newItemsIndex: newItemsIndex,
                        oldItems: oldItems,
                        oldItemsIndex: oldItemsIndex
                    });
                };
                display.subscribe('onCollectionChange', handler);
                display.addSort(sort);
                display.unsubscribe('onCollectionChange', handler);
                for (var i = 0; i < Math.max(expected.length, given.length); i++) {
                    chai_1.assert.equal(given[i].action, expected[i].action);
                    chai_1.assert.deepEqual(given[i].newItems, expected[i].newItems);
                    chai_1.assert.deepEqual(given[i].oldItems, expected[i].oldItems);
                    chai_1.assert.strictEqual(given[i].newItemsIndex, expected[i].newItemsIndex);
                    chai_1.assert.strictEqual(given[i].oldItemsIndex, expected[i].oldItemsIndex);
                }
            });
        });
        describe('.removeSort()', function () {
            var getItems = function () { return [1, 2, 3, 4]; };
            var sort = function (a, b) { return b.collectionItem - a.collectionItem; };
            it('should sort display', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var unsortedItems = getItems();
                var display = new Collection_1.default({
                    collection: list,
                    sort: sort
                });
                display.removeSort(sort);
                display.each(function (item, i) {
                    chai_1.assert.equal(item.getContents(), unsortedItems[i]);
                });
            });
            it('should trigger onCollectionChange', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var display = new Collection_1.default({
                    collection: list,
                    sort: sort
                });
                var expected = [{
                        action: IObservable_1.default.ACTION_MOVE,
                        newItems: [display.at(3)],
                        newItemsIndex: 0,
                        oldItems: [display.at(3)],
                        oldItemsIndex: 3
                    }, {
                        action: IObservable_1.default.ACTION_MOVE,
                        newItems: [display.at(2)],
                        newItemsIndex: 1,
                        oldItems: [display.at(2)],
                        oldItemsIndex: 3
                    }, {
                        action: IObservable_1.default.ACTION_MOVE,
                        newItems: [display.at(1)],
                        newItemsIndex: 2,
                        oldItems: [display.at(1)],
                        oldItemsIndex: 3
                    }];
                var given = [];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    given.push({
                        action: action,
                        newItems: newItems,
                        newItemsIndex: newItemsIndex,
                        oldItems: oldItems,
                        oldItemsIndex: oldItemsIndex
                    });
                };
                display.subscribe('onCollectionChange', handler);
                display.removeSort(sort);
                display.unsubscribe('onCollectionChange', handler);
                for (var i = 0; i < Math.max(expected.length, given.length); i++) {
                    chai_1.assert.equal(given[i].action, expected[i].action);
                    chai_1.assert.deepEqual(given[i].newItems, expected[i].newItems);
                    chai_1.assert.deepEqual(given[i].oldItems, expected[i].oldItems);
                    chai_1.assert.strictEqual(given[i].newItemsIndex, expected[i].newItemsIndex);
                    chai_1.assert.strictEqual(given[i].oldItemsIndex, expected[i].oldItemsIndex);
                }
            });
        });
        describe('.setGroup()', function () {
            function getItems() {
                return [
                    { id: 1, group: 1 },
                    { id: 2, group: 2 },
                    { id: 3, group: 1 },
                    { id: 4, group: 2 }
                ];
            }
            it('should add an important property if Compute functor used', function () {
                var importantProps = ['bar'];
                var functor = new Compute_1.default(function () {
                    return 'banana';
                }, ['foo']);
                var display = new Collection_1.default({
                    collection: list,
                    importantItemProperties: importantProps
                });
                display.setGroup(functor);
                chai_1.assert.isTrue(importantProps.indexOf('foo') > -1);
                chai_1.assert.isTrue(importantProps.indexOf('bar') > -1);
            });
            it('should group the display', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var groupedItems = [
                    1,
                    list.at(0),
                    list.at(2),
                    2,
                    list.at(1),
                    list.at(3)
                ];
                var display = new Collection_1.default({
                    collection: list
                });
                display.setGroup(function (item) { return item.group; });
                display.each(function (item, i) {
                    chai_1.assert.equal(groupedItems[i], item.getContents());
                });
            });
            it('should group the display with filter', function () {
                var items = [
                    { id: 1, group: 1, enabled: true },
                    { id: 2, group: 2, enabled: false },
                    { id: 3, group: 3, enabled: true },
                    { id: 4, group: 4, enabled: false }
                ];
                var list = new ObservableList_1.default({
                    items: items
                });
                var display = new Collection_1.default({
                    collection: list,
                    filter: function (item, index, collectionItem, position, hasMembers) {
                        if (collectionItem instanceof GroupItem_1.default) {
                            return hasMembers;
                        }
                        return item.enabled;
                    }
                });
                var expectedItems = [1, items[0], 3, items[2]];
                var count = 0;
                display.setGroup(function (item) { return item.group; });
                display.each(function (item) {
                    chai_1.assert.strictEqual(item.getContents(), expectedItems[count]);
                    count++;
                });
                chai_1.assert.equal(count, expectedItems.length);
            });
            it('should skip repeatable groups with filter', function () {
                var items = [
                    { id: 1, group: 1, enabled: true },
                    { id: 2, group: 2, enabled: false },
                    { id: 3, group: 3, enabled: true },
                    { id: 4, group: 4, enabled: false },
                    { id: 5, group: 3, enabled: true },
                    { id: 6, group: 5, enabled: true }
                ];
                var list = new ObservableList_1.default({
                    items: items
                });
                var display = new Collection_1.default({
                    collection: list,
                    filter: function (item, index, collectionItem, position, hasMembers) {
                        if (collectionItem instanceof GroupItem_1.default) {
                            return hasMembers;
                        }
                        return item.enabled;
                    }
                });
                var expectedItems = [1, items[0], 3, items[2], items[4], 5, items[5]];
                var count = 0;
                display.setGroup(function (item) { return item.group; });
                display.each(function (item) {
                    chai_1.assert.strictEqual(item.getContents(), expectedItems[count]);
                    count++;
                });
                chai_1.assert.equal(count, expectedItems.length);
            });
            it('should enum items in original order', function () {
                var items = [
                    { id: 1, group: 1 },
                    { id: 2, group: 1 },
                    { id: 3, group: 1 },
                    { id: 4, group: 1 },
                    { id: 5, group: 2 },
                    { id: 6, group: 2 },
                    { id: 7, group: 2 },
                    { id: 8, group: 2 },
                    { id: 9, group: 3 },
                    { id: 10, group: 3 },
                    { id: 11, group: 3 },
                    { id: 12, group: 3 },
                    { id: 13, group: 4 },
                    { id: 14, group: 4 },
                    { id: 15, group: 4 },
                    { id: 16, group: 4 },
                    { id: 17, group: 5 },
                    { id: 18, group: 5 },
                    { id: 19, group: 5 },
                    { id: 20, group: 5 },
                    { id: 21, group: 6 },
                    { id: 22, group: 6 },
                    { id: 23, group: 6 },
                    { id: 24, group: 6 }
                ];
                var list = new ObservableList_1.default({
                    items: items
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var index = 0;
                display.setGroup(function (item) { return item.group; });
                display.each(function (item) {
                    if (item instanceof GroupItem_1.default) {
                        chai_1.assert.strictEqual(item.getContents(), items[index + 1].group);
                    }
                    else {
                        chai_1.assert.strictEqual(item.getContents(), items[index]);
                        index++;
                    }
                });
                chai_1.assert.strictEqual(index, items.length);
            });
            it('should enum item in groups in reverse order', function () {
                var items = [
                    { id: 1, group: 1 },
                    { id: 2, group: 1 },
                    { id: 3, group: 1 },
                    { id: 4, group: 1 },
                    { id: 5, group: 2 },
                    { id: 6, group: 2 },
                    { id: 7, group: 2 },
                    { id: 8, group: 2 },
                    { id: 9, group: 3 },
                    { id: 10, group: 3 },
                    { id: 11, group: 3 },
                    { id: 12, group: 3 },
                    { id: 13, group: 4 },
                    { id: 14, group: 4 },
                    { id: 15, group: 4 },
                    { id: 16, group: 4 }
                ];
                var list = new ObservableList_1.default({
                    items: items
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var expected = [
                    4, items[15], items[14], items[13], items[12],
                    3, items[11], items[10], items[9], items[8],
                    2, items[7], items[6], items[5], items[4],
                    1, items[3], items[2], items[1], items[0]
                ];
                var index = 0;
                display.setSort(function (a, b) { return b.index - a.index; });
                display.setGroup(function (item) { return item.group; });
                display.each(function (item, position) {
                    chai_1.assert.strictEqual(item.getContents(), expected[index], 'at ' + position);
                    index++;
                });
                chai_1.assert.strictEqual(index, expected.length);
            });
            it('should reset a group of the display', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var expected = [
                    list.at(0),
                    list.at(1),
                    list.at(2),
                    list.at(3)
                ];
                var display = new Collection_1.default({
                    collection: list
                });
                display.setGroup(function (item) { return item.group; });
                display.setGroup();
                display.each(function (item, i) {
                    chai_1.assert.equal(expected[i], item.getContents());
                });
            });
            it('should regroup the display after add an item', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var added = { id: 5, group: 1 };
                var expected = [
                    1,
                    list.at(0),
                    list.at(2),
                    added,
                    2,
                    list.at(1),
                    list.at(3)
                ];
                display.setGroup(function (item) { return item.group; });
                list.add(added);
                display.each(function (item, i) {
                    chai_1.assert.equal(expected[i], item.getContents());
                });
            });
            it('should regroup the display after remove an item', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var expected = [
                    1,
                    list.at(0),
                    2,
                    list.at(1),
                    list.at(3)
                ];
                display.setGroup(function (item) { return item.group; });
                list.removeAt(2);
                display.each(function (item, i) {
                    chai_1.assert.equal(expected[i], item.getContents());
                });
            });
            it('should regroup the display after replace an item', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var replace = { id: 5, group: 2 };
                var expected = [1, list.at(0), 2, list.at(1), replace, list.at(3)];
                display.setGroup(function (item) { return item.group; });
                list.replace(replace, 2);
                display.each(function (item, i) {
                    chai_1.assert.equal(expected[i], item.getContents());
                });
            });
            it('should regroup the display after change an item', function () {
                var changeModel = new Model_1.default({
                    rawData: { id: 4, group: 2 }
                });
                var list = new ObservableList_1.default({
                    items: [
                        new Model_1.default({
                            rawData: { id: 1, group: 1 }
                        }),
                        new Model_1.default({
                            rawData: { id: 2, group: 2 }
                        }),
                        new Model_1.default({
                            rawData: { id: 3, group: 1 }
                        }),
                        changeModel
                    ]
                });
                var display = new Collection_1.default({
                    collection: list,
                    importantItemProperties: ['group']
                });
                var expected = [
                    1,
                    list.at(0),
                    list.at(2),
                    list.at(3),
                    2,
                    list.at(1)
                ];
                display.setGroup(function (item) { return item.get('group'); });
                changeModel.set('group', 1);
                display.each(function (item, i) {
                    chai_1.assert.equal(expected[i], item.getContents());
                });
            });
            it('should lookup groups order after add an item in the new group', function () {
                var list = new ObservableList_1.default({
                    items: [
                        { id: 1, group: 2 },
                        { id: 2, group: 3 },
                        { id: 3, group: 2 }
                    ]
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var added = { id: 4, group: 1 };
                var expected = [
                    2,
                    list.at(0),
                    list.at(2),
                    1,
                    added,
                    3,
                    list.at(1)
                ];
                display.setGroup(function (item) { return item.group; });
                list.add(added, 1);
                display.each(function (item, i) {
                    chai_1.assert.equal(expected[i], item.getContents());
                });
            });
            it('should lookup groups order after add an items some of which in the new group', function () {
                var list = new ObservableList_1.default({
                    items: [
                        { id: 1, group: 2 },
                        { id: 2, group: 3 },
                        { id: 3, group: 2 }
                    ]
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var newItems = [
                    { id: 4, group: 2 },
                    { id: 5, group: 1 }
                ];
                var expected = [
                    2,
                    list.at(0),
                    list.at(2),
                    newItems[0],
                    3,
                    list.at(1),
                    1,
                    newItems[1]
                ];
                display.setGroup(function (item) { return item.group; });
                list.append(newItems);
                display.each(function (item, i) {
                    chai_1.assert.equal(expected[i], item.getContents());
                });
            });
            it('should restore groups after the list will be assigned new items', function () {
                var list = new ObservableList_1.default({
                    items: [
                        { id: 1, group: 2 },
                        { id: 2, group: 3 },
                        { id: 3, group: 2 }
                    ]
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var replace = [
                    { id: 1, group: 3 },
                    { id: 2, group: 3 },
                    { id: 3, group: 2 }
                ];
                var expected = [
                    3,
                    replace[0],
                    replace[1],
                    2,
                    replace[2]
                ];
                display.setGroup(function (item) { return item.group; });
                list.assign(replace);
                display.each(function (item, i) {
                    chai_1.assert.equal(expected[i], item.getContents());
                });
            });
        });
        describe('.getGroupItems()', function () {
            function getItems() {
                return [
                    { id: 1, group: 1 },
                    { id: 2, group: 2 },
                    { id: 3, group: 1 },
                    { id: 4, group: 2 }
                ];
            }
            var check = function (items, expected) {
                chai_1.assert.equal(items.length, expected.length);
                for (var index = 0; index < expected.length; index++) {
                    chai_1.assert.equal(expected[index], items[index].getContents().id);
                }
            };
            it('should return group items', function () {
                var list = new List_1.default({
                    items: getItems()
                });
                var display = new Collection_1.default({
                    collection: list
                });
                display.setGroup(function (item) { return item.group; });
                check(display.getGroupItems(0), []);
                check(display.getGroupItems(1), [1, 3]);
                check(display.getGroupItems(2), [2, 4]);
                check(display.getGroupItems(3), []);
            });
            it('should return group for new items', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var display = new Collection_1.default({
                    collection: list
                });
                display.setGroup(function (item) { return item.group; });
                list.add({ id: 5, group: 3 }, 2);
                check(display.getGroupItems(0), []);
                check(display.getGroupItems(1), [1, 3]);
                check(display.getGroupItems(2), [2, 4]);
                check(display.getGroupItems(3), [5]);
                check(display.getGroupItems(4), []);
            });
            it('should return empty group for old items', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var display = new Collection_1.default({
                    collection: list
                });
                display.setGroup(function (item) { return item.group; });
                list.removeAt(2);
                check(display.getGroupItems(0), []);
                check(display.getGroupItems(1), [1]);
                check(display.getGroupItems(2), [2, 4]);
                check(display.getGroupItems(3), []);
                list.removeAt(0);
                check(display.getGroupItems(0), []);
                check(display.getGroupItems(1), []);
                check(display.getGroupItems(2), [2, 4]);
                check(display.getGroupItems(3), []);
            });
        });
        describe('.getGroupByIndex()', function () {
            function getItems() {
                return [
                    { id: 1, group: 1 },
                    { id: 2, group: 2 },
                    { id: 3, group: 1 },
                    { id: 4, group: 2 }
                ];
            }
            it('should return group id', function () {
                var list = new List_1.default({
                    items: getItems()
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var expected = [1, 1, 1, 2, 2, 2];
                display.setGroup(function (item) { return item.group; });
                for (var index = 0; index < expected.length; index++) {
                    chai_1.assert.equal(display.getGroupByIndex(index), expected[index]);
                }
            });
            it('should return valid group id in filtered mode', function () {
                var list = new List_1.default({
                    items: getItems()
                });
                var display = new Collection_1.default({
                    collection: list,
                    group: function (item) { return item.group; },
                    filter: function (item) { return item && item.id !== 2; }
                });
                var expected = [1, 1, 1, 2, 2];
                for (var index = 0; index < expected.length; index++) {
                    chai_1.assert.equal(display.getGroupByIndex(index), expected[index]);
                }
            });
        });
        describe('.getKeyProperty()', function () {
            it('should return given value', function () {
                chai_1.assert.equal(display.getKeyProperty(), 'id');
            });
        });
        describe('.isUnique()', function () {
            it('should return false by default', function () {
                chai_1.assert.isFalse(display.isUnique());
            });
        });
        describe('.setUnique()', function () {
            it('should change the unique option', function () {
                display.setUnique(true);
                chai_1.assert.isTrue(display.isUnique());
                display.setUnique(false);
                chai_1.assert.isFalse(display.isUnique());
            });
        });
        context('shortcuts', function () {
            var list;
            var display;
            beforeEach(function () {
                list = new ObservableList_1.default({
                    items: [1, 2, 3, 4]
                });
                display = new Collection_1.default({
                    collection: list
                });
            });
            describe('.getSourceIndexByIndex()', function () {
                it('should return equal indexes', function () {
                    display.each(function (item, index) {
                        chai_1.assert.equal(display.getSourceIndexByIndex(index), index);
                    });
                });
                it('should return inverted indexes', function () {
                    var max = display.getCount() - 1;
                    display.setSort(function (a, b) { return b.collectionItem - a.collectionItem; });
                    display.each(function (item, index) {
                        chai_1.assert.equal(display.getSourceIndexByIndex(index), max - index);
                    });
                });
                it('should return -1', function () {
                    chai_1.assert.equal(display.getSourceIndexByIndex(-1), -1);
                    chai_1.assert.equal(display.getSourceIndexByIndex(99), -1);
                    chai_1.assert.equal(display.getSourceIndexByIndex(null), -1);
                    chai_1.assert.equal(display.getSourceIndexByIndex(undefined), -1);
                });
            });
            describe('.getSourceIndexByItem()', function () {
                it('should return equal indexes', function () {
                    display.each(function (item, index) {
                        chai_1.assert.equal(display.getSourceIndexByItem(item), index);
                    });
                });
                it('should return inverted indexes', function () {
                    var max = display.getCount() - 1;
                    display.setSort(function (a, b) { return b.collectionItem - a.collectionItem; });
                    display.each(function (item, index) {
                        chai_1.assert.equal(display.getSourceIndexByItem(item), max - index);
                    });
                });
                it('should return -1', function () {
                    chai_1.assert.equal(display.getSourceIndexByItem({}), -1);
                    chai_1.assert.equal(display.getSourceIndexByItem(null), -1);
                    chai_1.assert.equal(display.getSourceIndexByItem(undefined), -1);
                });
            });
            describe('.getIndexBySourceIndex()', function () {
                it('should return equal indexes', function () {
                    list.each(function (item, index) {
                        chai_1.assert.equal(display.getIndexBySourceIndex(index), index);
                    });
                });
                it('should return inverted indexes', function () {
                    var max = display.getCount() - 1;
                    display.setSort(function (a, b) { return b.collectionItem - a.collectionItem; });
                    list.each(function (item, index) {
                        chai_1.assert.equal(display.getIndexBySourceIndex(index), max - index);
                    });
                });
                it('should return -1', function () {
                    chai_1.assert.equal(display.getIndexBySourceIndex(-1), -1);
                    chai_1.assert.equal(display.getIndexBySourceIndex(99), -1);
                    chai_1.assert.equal(display.getIndexBySourceIndex(null), -1);
                    chai_1.assert.equal(display.getIndexBySourceIndex(undefined), -1);
                });
            });
            describe('.getIndexBySourceItem()', function () {
                it('should return equal indexes', function () {
                    list.each(function (item, index) {
                        chai_1.assert.equal(display.getIndexBySourceItem(item), index);
                    });
                });
                it('should return inverted indexes', function () {
                    var max = display.getCount() - 1;
                    display.setSort(function (a, b) { return b.collectionItem - a.collectionItem; });
                    list.each(function (item, index) {
                        chai_1.assert.equal(display.getIndexBySourceItem(item), max - index);
                    });
                });
                it('should return -1', function () {
                    chai_1.assert.equal(display.getIndexBySourceItem({}), -1);
                    chai_1.assert.equal(display.getIndexBySourceItem(null), -1);
                    chai_1.assert.equal(display.getIndexBySourceItem(undefined), -1);
                });
            });
            describe('.getItemBySourceIndex()', function () {
                it('should return equal indexes', function () {
                    list.each(function (item, index) {
                        chai_1.assert.strictEqual(display.getItemBySourceIndex(index), display.at(index));
                    });
                });
                it('should return inverted indexes', function () {
                    var max = display.getCount() - 1;
                    display.setSort(function (a, b) { return b.collectionItem - a.collectionItem; });
                    list.each(function (item, index) {
                        chai_1.assert.strictEqual(display.getItemBySourceIndex(index), display.at(max - index));
                    });
                });
                it('should return undefined', function () {
                    chai_1.assert.isUndefined(display.getItemBySourceIndex(-1));
                    chai_1.assert.isUndefined(display.getItemBySourceIndex(99));
                    chai_1.assert.isUndefined(display.getItemBySourceIndex(null));
                    chai_1.assert.isUndefined(display.getItemBySourceIndex(undefined));
                });
            });
            describe('.getItemBySourceItem()', function () {
                it('should return equal indexes', function () {
                    list.each(function (item, index) {
                        chai_1.assert.strictEqual(display.getItemBySourceItem(item), display.at(index));
                    });
                });
                it('should return inverted indexes', function () {
                    var max = display.getCount() - 1;
                    display.setSort(function (a, b) { return b.collectionItem - a.collectionItem; });
                    list.each(function (item, index) {
                        chai_1.assert.strictEqual(display.getItemBySourceItem(item), display.at(max - index));
                    });
                });
                it('should return undefined', function () {
                    chai_1.assert.isUndefined(display.getItemBySourceItem({}));
                    chai_1.assert.isUndefined(display.getItemBySourceItem(null));
                    chai_1.assert.isUndefined(display.getItemBySourceItem(undefined));
                });
            });
        });
        describe('.setEventRaising()', function () {
            it('should enable and disable onCurrentChange', function () {
                var fired = false;
                var handler = function () {
                    fired = true;
                };
                display.subscribe('onCurrentChange', handler);
                display.setEventRaising(true);
                display.moveToNext();
                chai_1.assert.isTrue(fired);
                fired = false;
                display.setEventRaising(false);
                display.moveToNext();
                chai_1.assert.isFalse(fired);
                display.unsubscribe('onCurrentChange', handler);
            });
            it('should enable and disable onCollectionChange', function () {
                var fired = false;
                var handler = function () {
                    fired = true;
                };
                display.subscribe('onCollectionChange', handler);
                display.setEventRaising(true);
                list.add({ id: 999 });
                chai_1.assert.isTrue(fired);
                fired = false;
                display.setEventRaising(false);
                list.add({ id: 1000 });
                chai_1.assert.isFalse(fired);
                display.unsubscribe('onCollectionChange', handler);
            });
            it('should enable and disable onBeforeCollectionChange when unfrozen without session', function () {
                var fired = false;
                var handler = function () {
                    fired = true;
                };
                display.subscribe('onBeforeCollectionChange', handler);
                display.setEventRaising(false);
                list.add({ id: 999 });
                display.setEventRaising(true, true);
                display.unsubscribe('onBeforeCollectionChange', handler);
                chai_1.assert.isFalse(fired);
            });
            it('should save original element if source item has been removed and added in one transaction', function () {
                list.setEventRaising(false, true);
                var item = list.at(0);
                var displaysItem = display.getItemBySourceItem(item);
                list.removeAt(0);
                list.add(item, 1);
                list.setEventRaising(true, true);
                chai_1.assert.equal(display.getItemBySourceItem(item), displaysItem);
            });
            it('should fire after wake up', function (done) {
                var actions = [IObservable_1.default.ACTION_REMOVE, IObservable_1.default.ACTION_ADD];
                var contents = [list.at(0), list.at(0)];
                var fireId = 0;
                var handler = function (event, action, newItems, newItemsIndex, oldItems) {
                    try {
                        chai_1.assert.strictEqual(action, actions[fireId]);
                        switch (action) {
                            case IObservable_1.default.ACTION_ADD:
                                chai_1.assert.strictEqual(newItems[0].getContents(), contents[fireId]);
                                break;
                            case IObservable_1.default.ACTION_REMOVE:
                            case IObservable_1.default.ACTION_MOVE:
                                chai_1.assert.strictEqual(oldItems[0].getContents(), contents[fireId]);
                                break;
                        }
                        if (fireId === actions.length - 1) {
                            done();
                        }
                    }
                    catch (err) {
                        done(err);
                    }
                    fireId++;
                };
                display.subscribe('onCollectionChange', handler);
                display.setEventRaising(false, true);
                var item = list.at(0);
                list.removeAt(0);
                list.add(item);
                display.setEventRaising(true, true);
                display.unsubscribe('onCollectionChange', handler);
            });
        });
        describe('.isEventRaising()', function () {
            it('should return true by default', function () {
                chai_1.assert.isTrue(display.isEventRaising());
            });
            it('should return true if enabled', function () {
                display.setEventRaising(true);
                chai_1.assert.isTrue(display.isEventRaising());
            });
            it('should return false if disabled', function () {
                display.setEventRaising(false);
                chai_1.assert.isFalse(display.isEventRaising());
            });
        });
        describe('.concat()', function () {
            it('should throw an error anyway', function () {
                chai_1.assert.throws(function () {
                    display.concat(new List_1.default());
                });
                chai_1.assert.throws(function () {
                    display.concat();
                });
            });
        });
        describe('.getCollection()', function () {
            it('should return source collection', function () {
                chai_1.assert.strictEqual(list, display.getCollection());
            });
        });
        describe('.getItems()', function () {
            it('should return array of items', function () {
                var items = display.getItems();
                chai_1.assert.isTrue(items.length > 0);
                for (var i = 0; i < items.length; i++) {
                    chai_1.assert.strictEqual(items[i], display.at(i));
                }
            });
        });
        describe('.getItemUid()', function () {
            it('should return model\'s primary key value as String', function () {
                var list = new ObservableList_1.default({
                    items: [
                        new Model_1.default({
                            rawData: { id: 1, foo: 'bar' },
                            idProperty: 'foo'
                        })
                    ]
                });
                var display = new Collection_1.default({
                    collection: list,
                    keyProperty: 'id'
                });
                chai_1.assert.strictEqual(display.getItemUid(display.at(0)), 'bar');
            });
            it('should return keyProperty value as String', function () {
                var list = new ObservableList_1.default({
                    items: [{ id: 1 }]
                });
                var display = new Collection_1.default({
                    collection: list,
                    keyProperty: 'id'
                });
                chai_1.assert.strictEqual(display.getItemUid(display.at(0)), '1');
            });
            it('should return same value for same item', function () {
                var list = new ObservableList_1.default({
                    items: [{ id: 'foo' }]
                });
                var display = new Collection_1.default({
                    collection: list,
                    keyProperty: 'id'
                });
                var item = display.at(0);
                chai_1.assert.strictEqual(display.getItemUid(item), 'foo');
                chai_1.assert.strictEqual(display.getItemUid(item), 'foo');
            });
            it('should return variuos values for items with the same keyProperty value', function () {
                var list = new ObservableList_1.default({
                    items: [
                        { id: 'foo' },
                        { id: 'bar' },
                        { id: 'foo' },
                        { id: 'foo' }
                    ]
                });
                var display = new Collection_1.default({
                    collection: list,
                    keyProperty: 'id'
                });
                chai_1.assert.strictEqual(display.getItemUid(display.at(0)), 'foo');
                chai_1.assert.strictEqual(display.getItemUid(display.at(1)), 'bar');
                chai_1.assert.strictEqual(display.getItemUid(display.at(2)), 'foo-1');
                chai_1.assert.strictEqual(display.getItemUid(display.at(3)), 'foo-2');
            });
            it('should throw an error if keyProperty is empty', function () {
                var list = new ObservableList_1.default({
                    items: [{ id: 1 }]
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var item = display.at(0);
                chai_1.assert.throws(function () {
                    display.getItemUid(item);
                });
            });
        });
        describe('.getFirst()', function () {
            it('should return first item', function () {
                chai_1.assert.strictEqual(display.getFirst(), display.at(0));
            });
            it('should skip groups', function () {
                var items = [1, 2];
                var list = new List_1.default({
                    items: items
                });
                var display = new Collection_1.default({
                    collection: list,
                    group: function (item) { return item % 2; }
                });
                chai_1.assert.strictEqual(display.getFirst(), display.at(1));
            });
        });
        describe('.getLast()', function () {
            it('should return last item', function () {
                chai_1.assert.strictEqual(display.getLast(), display.at(display.getCount() - 1));
            });
        });
        describe('.getNext()', function () {
            it('should return next item', function () {
                var item = display.at(0);
                chai_1.assert.strictEqual(display.getNext(item), display.at(1));
            });
            it('should skip groups', function () {
                var items = [1, 2, 3];
                var list = new List_1.default({
                    items: items
                });
                var display = new Collection_1.default({
                    collection: list,
                    group: function (item) { return item % 2; }
                });
                var item = display.at(1); // contents = 1
                chai_1.assert.strictEqual(display.getNext(item), display.at(2)); // contents = 3
                item = display.at(2); // contents = 3
                chai_1.assert.strictEqual(display.getNext(item), display.at(4)); // contents = 2
                item = display.at(4); // contents = 2
                chai_1.assert.isUndefined(display.getNext(item));
            });
        });
        describe('.getPrevious()', function () {
            it('should return previous item', function () {
                var item = display.at(1);
                chai_1.assert.strictEqual(display.getPrevious(item), display.at(0));
            });
            it('should skip groups', function () {
                var items = [1, 2, 3];
                var list = new List_1.default({
                    items: items
                });
                var display = new Collection_1.default({
                    collection: list,
                    group: function (item) { return item % 2; }
                });
                var item = display.at(1); // contents = 1
                chai_1.assert.isUndefined(display.getPrevious(item));
                item = display.at(2); // contents = 3
                chai_1.assert.strictEqual(display.getPrevious(item), display.at(1)); // contents = 1
                item = display.at(4); // contents = 2
                chai_1.assert.strictEqual(display.getPrevious(item), display.at(2)); // contents = 3
            });
        });
        describe('.getCurrent()', function () {
            it('should return undefined by default', function () {
                chai_1.assert.isUndefined(display.getCurrent());
            });
            it('should change by item enumeration', function () {
                var index = 0;
                while (display.moveToNext()) {
                    chai_1.assert.strictEqual(items[index], display.getCurrent().getContents());
                    index++;
                }
                chai_1.assert.strictEqual(items[items.length - 1], display.getCurrent().getContents());
            });
        });
        describe('.getCurrentPosition()', function () {
            it('should return -1 by default', function () {
                chai_1.assert.strictEqual(-1, display.getCurrentPosition());
            });
            it('should change through navigation', function () {
                var index = -1;
                while (display.moveToNext()) {
                    index++;
                    chai_1.assert.strictEqual(index, display.getCurrentPosition());
                }
                chai_1.assert.strictEqual(items.length - 1, display.getCurrentPosition());
                while (display.moveToPrevious()) {
                    index--;
                    chai_1.assert.strictEqual(index, display.getCurrentPosition());
                }
                chai_1.assert.strictEqual(0, display.getCurrentPosition());
            });
        });
        describe('.setCurrentPosition()', function () {
            it('should change the position', function () {
                display.setCurrentPosition(0);
                chai_1.assert.strictEqual(0, display.getCurrentPosition());
                display.setCurrentPosition(4);
                chai_1.assert.strictEqual(4, display.getCurrentPosition());
                display.setCurrentPosition(-1);
                chai_1.assert.strictEqual(-1, display.getCurrentPosition());
            });
            it('should change current item', function () {
                for (var i = 0; i < items.length; i++) {
                    display.setCurrentPosition(i);
                    chai_1.assert.strictEqual(items[i], display.getCurrent().getContents());
                }
            });
            it('should throw an error on invalid index', function () {
                chai_1.assert.throws(function () {
                    display.setCurrentPosition(-2);
                });
                chai_1.assert.throws(function () {
                    display.setCurrentPosition(items.length);
                });
            });
            it('should trigger "onCurrentChange" with valid arguments', function (done) {
                var andDone = false;
                var position;
                var handler = function (event, newCurrent, oldCurrent, newPosition, oldPosition) {
                    try {
                        chai_1.assert.strictEqual(newPosition, position, 'Invalid newPosition');
                        chai_1.assert.strictEqual(oldPosition, prevPosition, 'Invalid oldPosition');
                        chai_1.assert.strictEqual(oldCurrent, prevCurrent, 'Invalid oldCurrent');
                        if (andDone) {
                            done();
                        }
                    }
                    catch (err) {
                        done(err);
                    }
                };
                display.subscribe('onCurrentChange', handler);
                var prevPosition;
                var prevCurrent;
                for (var step = 1; step < 4; step++) {
                    prevPosition = display.getCurrentPosition();
                    prevCurrent = display.getCurrent();
                    for (position = 0; position < items.length; position += step) {
                        andDone = step === 3 && position + step >= items.length;
                        display.setCurrentPosition(position);
                        prevPosition = position;
                        prevCurrent = display.getCurrent();
                    }
                }
                display.unsubscribe('onCurrentChange', handler);
            });
            it('should trigger just one secondary "onCurrentChange" event if cause a queue', function () {
                var given = [];
                var position = 0;
                var max = display.getCount() - 1;
                var handler = function (event, newCurrent, oldCurrent, newPosition, oldPosition) {
                    given.push({
                        newCurrent: newCurrent,
                        oldCurrent: oldCurrent,
                        newPosition: newPosition,
                        oldPosition: oldPosition
                    });
                    while (position < max) {
                        display.setCurrentPosition(++position);
                    }
                };
                display.subscribe('onCurrentChange', handler);
                display.setCurrentPosition(position);
                display.unsubscribe('onCurrentChange', handler);
                chai_1.assert.equal(given.length, 2);
                chai_1.assert.equal(given[0].newPosition, 0);
                chai_1.assert.equal(given[1].newPosition, max);
            });
        });
        describe('.moveToNext()', function () {
            it('should change the current and the position', function () {
                var position = -1;
                while (display.moveToNext()) {
                    position++;
                    chai_1.assert.strictEqual(position, display.getCurrentPosition());
                    chai_1.assert.strictEqual(items[position], display.getCurrent().getContents());
                }
            });
            it('should trigger "onCurrentChange" with valid arguments', function (done) {
                var andDone = false;
                var handler = function (event, newCurrent, oldCurrent, newPosition, oldPosition) {
                    try {
                        chai_1.assert.strictEqual(newPosition, oldPosition + 1, 'Invalid newPosition');
                        if (oldCurrent) {
                            chai_1.assert.strictEqual(oldCurrent.getContents(), items[oldPosition], 'Invalid oldCurrent');
                        }
                        if (andDone) {
                            done();
                        }
                    }
                    catch (err) {
                        done(err);
                    }
                };
                display.subscribe('onCurrentChange', handler);
                var position = -1;
                while (display.moveToNext()) {
                    position++;
                    andDone = position === items.length - 2;
                }
                display.unsubscribe('onCurrentChange', handler);
            });
        });
        describe('.moveToPrevious()', function () {
            it('should change the current and the position', function () {
                var position = items.length - 1;
                display.setCurrentPosition(position);
                while (display.moveToPrevious()) {
                    position--;
                    chai_1.assert.strictEqual(position, display.getCurrentPosition());
                    chai_1.assert.strictEqual(items[position], display.getCurrent().getContents());
                }
            });
            it('should trigger "onCurrentChange" with valid arguments', function (done) {
                var andDone = false;
                var handler = function (event, newCurrent, oldCurrent, newPosition, oldPosition) {
                    try {
                        chai_1.assert.strictEqual(newPosition, oldPosition - 1, 'Invalid newPosition');
                        if (oldCurrent) {
                            chai_1.assert.strictEqual(oldCurrent.getContents(), items[oldPosition], 'Invalid oldCurrent');
                        }
                        if (andDone) {
                            done();
                        }
                    }
                    catch (err) {
                        done(err);
                    }
                };
                var position = items.length - 1;
                display.setCurrentPosition(position);
                display.subscribe('onCurrentChange', handler);
                while (display.moveToPrevious()) {
                    position--;
                    andDone = position === 1;
                }
                display.unsubscribe('onCurrentChange', handler);
            });
        });
        describe('.getSelectedItems()', function () {
            it('should return one selected item', function () {
                display.at(0).setSelected(true);
                var items = display.getSelectedItems();
                chai_1.assert.strictEqual(items[0], display.at(0));
                chai_1.assert.strictEqual(items.length, 1);
            });
            it('should return two selected items', function () {
                display.at(0).setSelected(true);
                display.at(1).setSelected(true);
                var items = display.getSelectedItems();
                for (var i = 0; i < items.length; i++) {
                    chai_1.assert.notEqual(display.getIndex(items[i]), -1);
                }
                chai_1.assert.strictEqual(items.length, 2);
            });
        });
        describe('.setSelectedItemsAll()', function () {
            it('should set true for all item', function () {
                display.setSelectedItemsAll(true);
                display.each(function (item) {
                    chai_1.assert.strictEqual(item.isSelected(), true);
                });
            });
            it('should set false for all item', function () {
                display.setSelectedItemsAll(false);
                display.each(function (item) {
                    chai_1.assert.strictEqual(item.isSelected(), false);
                });
            });
            it('should selected a filtered item', function () {
                display.setFilter(function () {
                    return false;
                });
                display.setSelectedItemsAll(true);
                display.setFilter(function () {
                    return true;
                });
                display.each(function (item) {
                    chai_1.assert.strictEqual(item.isSelected(), true);
                });
            });
            it('should fired the one event onchange', function () {
                var i = 0;
                display.subscribe('onCollectionChange', function () {
                    i++;
                });
                display.setSelectedItemsAll(true);
                chai_1.assert.strictEqual(i, 1);
            });
        });
        describe('.setSelectedItems()', function () {
            it('should selected was given items', function () {
                display.setSelectedItems([list.at(0), list.at(1)], true);
                var selected = [
                    display.getItemBySourceItem(list.at(0)),
                    display.getItemBySourceItem(list.at(1))
                ];
                display.each(function (item) {
                    if (selected.indexOf(item) !== -1) {
                        chai_1.assert.isTrue(item.isSelected());
                    }
                    else {
                        chai_1.assert.isFalse(item.isSelected());
                    }
                });
            });
            it('should deselect was given items', function () {
                display.setSelectedItemsAll(true);
                display.setSelectedItems([list.at(0), list.at(1)], false);
                var deselect = [
                    display.getItemBySourceItem(list.at(0)),
                    display.getItemBySourceItem(list.at(1))
                ];
                display.each(function (item) {
                    if (deselect.indexOf(item) !== -1) {
                        chai_1.assert.isFalse(item.isSelected());
                    }
                    else {
                        chai_1.assert.isTrue(item.isSelected());
                    }
                });
            });
        });
        describe('.invertSelectedItemsAll()', function () {
            it('should invert selection', function () {
                display.at(0).setSelected(true);
                display.at(1).setSelected(false);
                display.at(2).setSelected(true);
                display.invertSelectedItemsAll();
                chai_1.assert.strictEqual(display.at(0).isSelected(), false);
                chai_1.assert.strictEqual(display.at(1).isSelected(), true);
                chai_1.assert.strictEqual(display.at(2).isSelected(), false);
            });
            it('should invert selection for a filtered items', function () {
                display.setFilter(function () {
                    return false;
                });
                display.invertSelectedItemsAll();
                display.setFilter(function () {
                    return true;
                });
                display.each(function (item) {
                    chai_1.assert.strictEqual(item.isSelected(), true);
                });
            });
        });
        describe('.subscribe()', function () {
            var outsideItems = [1, 3];
            var getItems = function () { return [1, 2, 3, 4]; };
            var sort = function (a, b) { return b.collectionItem - a.collectionItem; };
            var filter = function (item) { return outsideItems.indexOf(item) === -1; };
            var getCollectionChangeHandler = function (given, itemsMapper) { return function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                given.push({
                    action: action,
                    newItems: itemsMapper ? newItems.map(itemsMapper) : newItems,
                    newItemsIndex: newItemsIndex,
                    oldItems: itemsMapper ? oldItems.map(itemsMapper) : oldItems,
                    oldItemsIndex: oldItemsIndex
                });
            }; };
            var handleGiven = function (given, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                given.push({
                    action: action,
                    newItems: newItems,
                    newItemsIndex: newItemsIndex,
                    oldItems: oldItems,
                    oldItemsIndex: oldItemsIndex
                });
            };
            var checkGivenAndExpected = function (given, expected) {
                chai_1.assert.equal(expected.length, given.length);
                for (var i = 0; i < given.length; i++) {
                    chai_1.assert.strictEqual(given[i].action, expected[i].action, 'at change #' + i);
                    chai_1.assert.strictEqual(given[i].newItems.length, expected[i].newItems.length, 'at change #' + i);
                    chai_1.assert.strictEqual(given[i].newItemsIndex, expected[i].newItemsIndex, 'at change #' + i);
                    for (var j = 0; j < given[i].newItems.length; j++) {
                        chai_1.assert.strictEqual(given[i].newItems[j].getContents(), expected[i].newItems[j], 'at change #' + i);
                    }
                    chai_1.assert.strictEqual(given[i].oldItems.length, expected[i].oldItems.length, 'at change #' + i);
                    chai_1.assert.strictEqual(given[i].oldItemsIndex, expected[i].oldItemsIndex, 'at change #' + i);
                    for (var j = 0; j < given[i].oldItems.length; j++) {
                        chai_1.assert.strictEqual(given[i].oldItems[j].getContents(), expected[i].oldItems[j], 'at change #' + i);
                    }
                }
            };
            context('when change a collection', function () {
                var itemsOld = getItems();
                var itemsNew = [9, 8, 7];
                var cases = [{
                        method: 'assign',
                        action: IObservable_1.default.ACTION_RESET,
                        newAt: 0,
                        newItems: itemsNew,
                        oldAt: 0,
                        oldItems: itemsOld
                    }, {
                        method: 'append',
                        action: IObservable_1.default.ACTION_ADD,
                        newAt: 4,
                        newItems: itemsNew,
                        oldAt: 0,
                        oldItems: []
                    }, {
                        method: 'prepend',
                        action: IObservable_1.default.ACTION_ADD,
                        newAt: 0,
                        newItems: itemsNew,
                        oldAt: 0,
                        oldItems: []
                    }, {
                        method: 'clear',
                        action: IObservable_1.default.ACTION_RESET,
                        newAt: 0,
                        newItems: [],
                        oldAt: 0,
                        oldItems: itemsOld
                    }];
                while (cases.length) {
                    (function (theCase) {
                        it("should fire \"onCollectionChange\" on " + theCase.method, function () {
                            var given = [];
                            var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                                given.push({
                                    action: action,
                                    newItems: newItems,
                                    newItemsIndex: newItemsIndex,
                                    oldItems: oldItems,
                                    oldItemsIndex: oldItemsIndex
                                });
                            };
                            var list = new ObservableList_1.default({
                                items: itemsOld.slice()
                            });
                            var display = new Collection_1.default({
                                collection: list
                            });
                            display.subscribe('onCollectionChange', handler);
                            display.getCollection()[theCase.method](itemsNew);
                            display.unsubscribe('onCollectionChange', handler);
                            chai_1.assert.strictEqual(given.length, 1, 'Invalid actions count');
                            var firstGiven = given[0];
                            chai_1.assert.strictEqual(firstGiven.action, theCase.action, 'Invalid action');
                            chai_1.assert.strictEqual(firstGiven.newItems.length, theCase.newItems.length, 'Invalid newItems length');
                            for (var i = 0; i < theCase.newItems.length; i++) {
                                chai_1.assert.strictEqual(firstGiven.newItems[i].getContents(), theCase.newItems[i], "Invalid newItems[" + i + "]");
                            }
                            chai_1.assert.strictEqual(firstGiven.newItemsIndex, theCase.newAt, 'Invalid newItemsIndex');
                            chai_1.assert.strictEqual(firstGiven.oldItems.length, theCase.oldItems.length, 'Invalid oldItems length');
                            for (var i = 0; i < theCase.oldItems.length; i++) {
                                chai_1.assert.strictEqual(firstGiven.oldItems[i].getContents(), theCase.oldItems[i], "Invalid oldItems[" + i + "]");
                            }
                            chai_1.assert.strictEqual(firstGiven.oldItemsIndex, theCase.oldAt, 'Invalid oldItemsIndex');
                        });
                        it('should fire "onBeforeCollectionChange" then "onCollectionChange" and then' +
                            ("\"onAfterCollectionChange\" on " + theCase.method), function () {
                            var expected = ['before', 'on', 'after'];
                            var given = [];
                            var handlerBefore = function () {
                                given.push('before');
                            };
                            var handlerOn = function () {
                                given.push('on');
                            };
                            var handlerAfter = function () {
                                given.push('after');
                            };
                            var list = new ObservableList_1.default({
                                items: itemsOld.slice()
                            });
                            var display = new Collection_1.default({
                                collection: list
                            });
                            display.subscribe('onBeforeCollectionChange', handlerBefore);
                            display.subscribe('onCollectionChange', handlerOn);
                            display.subscribe('onAfterCollectionChange', handlerAfter);
                            display.getCollection()[theCase.method](itemsNew);
                            display.unsubscribe('onBeforeCollectionChange', handlerBefore);
                            display.unsubscribe('onCollectionChange', handlerOn);
                            display.unsubscribe('onAfterCollectionChange', handlerAfter);
                            chai_1.assert.deepEqual(given, expected);
                        });
                    })(cases.shift());
                }
            });
            it('should fire "onCollectionChange" after add an item', function (done) {
                var items = getItems();
                var list = new ObservableList_1.default({
                    items: items
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    try {
                        chai_1.assert.strictEqual(action, IObservable_1.default.ACTION_ADD, 'Invalid action');
                        chai_1.assert.strictEqual(newItems[0].getContents(), 5, 'Invalid newItems');
                        chai_1.assert.strictEqual(newItemsIndex, items.length - 1, 'Invalid newItemsIndex');
                        chai_1.assert.strictEqual(oldItems.length, 0, 'Invalid oldItems');
                        chai_1.assert.strictEqual(oldItemsIndex, 0, 'Invalid oldItemsIndex');
                        done();
                    }
                    catch (err) {
                        done(err);
                    }
                };
                display.subscribe('onCollectionChange', handler);
                list.add(5);
                display.unsubscribe('onCollectionChange', handler);
            });
            it('should fire "onCollectionChange" after add an item if filter uses display index', function () {
                var items = getItems();
                var list = new ObservableList_1.default({
                    items: items
                });
                var display = new Collection_1.default({
                    collection: list,
                    filter: function (item, index, collectionItem, collectionIndex) { return collectionIndex < 3; }
                });
                var expected = [
                    [IObservable_1.default.ACTION_REMOVE, [], 0, [3], 2],
                    [IObservable_1.default.ACTION_ADD, [999], 1, [], 0]
                ];
                var given = [];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    given.push([
                        action,
                        newItems.map(function (item) { return item.getContents(); }),
                        newItemsIndex,
                        oldItems.map(function (item) { return item.getContents(); }),
                        oldItemsIndex
                    ]);
                };
                display.subscribe('onCollectionChange', handler);
                list.add(999, 1);
                display.unsubscribe('onCollectionChange', handler);
                chai_1.assert.deepEqual(given, expected);
            });
            it('should fire "onCollectionChange" after remove an item', function (done) {
                var items = getItems();
                var list = new ObservableList_1.default({
                    items: items
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    try {
                        chai_1.assert.strictEqual(action, IObservable_1.default.ACTION_REMOVE, 'Invalid action');
                        chai_1.assert.strictEqual(newItems.length, 0, 'Invalid newItems');
                        chai_1.assert.strictEqual(newItemsIndex, 0, 'Invalid newItemsIndex');
                        chai_1.assert.strictEqual(oldItems[0].getContents(), 2, 'Invalid oldItems');
                        chai_1.assert.strictEqual(oldItemsIndex, 1, 'Invalid oldItemsIndex');
                        done();
                    }
                    catch (err) {
                        done(err);
                    }
                };
                display.subscribe('onCollectionChange', handler);
                list.remove(2);
                display.unsubscribe('onCollectionChange', handler);
            });
            it('should fire "onCollectionChange" after remove an item if filter uses display index', function () {
                var items = getItems();
                var list = new ObservableList_1.default({
                    items: items
                });
                var display = new Collection_1.default({
                    collection: list,
                    filter: function (item, index, collectionItem, collectionIndex) { return collectionIndex < 3; }
                });
                var expected = [
                    [IObservable_1.default.ACTION_REMOVE, [], 0, [2], 1],
                    [IObservable_1.default.ACTION_ADD, [4], 2, [], 0]
                ];
                var given = [];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    given.push([
                        action,
                        newItems.map(function (item) { return item.getContents(); }),
                        newItemsIndex,
                        oldItems.map(function (item) { return item.getContents(); }),
                        oldItemsIndex
                    ]);
                };
                display.subscribe('onCollectionChange', handler);
                list.removeAt(1);
                display.unsubscribe('onCollectionChange', handler);
                chai_1.assert.deepEqual(given, expected);
            });
            it('should fire "onCollectionChange" after replace an item', function () {
                var items = getItems();
                var list = new ObservableList_1.default({
                    items: items
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var given = [];
                var expected = [{
                        action: IObservable_1.default.ACTION_REMOVE,
                        newItems: [],
                        newItemsIndex: 0,
                        oldItems: [3],
                        oldItemsIndex: 2
                    }, {
                        action: IObservable_1.default.ACTION_ADD,
                        newItems: [33],
                        newItemsIndex: 2,
                        oldItems: [],
                        oldItemsIndex: 0
                    }];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    handleGiven(given, action, newItems, newItemsIndex, oldItems, oldItemsIndex);
                };
                display.subscribe('onCollectionChange', handler);
                list.replace(33, 2);
                display.unsubscribe('onCollectionChange', handler);
                checkGivenAndExpected(given, expected);
            });
            it('should fire "onCollectionChange" after move an item forward', function () {
                var items = [1, 2, 3, 4];
                var list = new ObservableList_1.default({
                    items: items
                });
                var display = new Collection_1.default({
                    collection: list
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
                display.subscribe('onCollectionChange', handler);
                list.move(moveFrom, moveTo);
                display.unsubscribe('onCollectionChange', handler);
                chai_1.assert.deepEqual(given, expected);
            });
            it('should fire "onCollectionChange" after move an item backward', function () {
                var items = [1, 2, 3, 4];
                var list = new ObservableList_1.default({
                    items: items
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var moveFrom = 2;
                var moveTo = 1;
                var expected = [{
                        action: IObservable_1.default.ACTION_MOVE,
                        newItems: [items[moveFrom]],
                        newItemsIndex: moveTo,
                        oldItems: [items[moveFrom]],
                        oldItemsIndex: moveFrom
                    }];
                var given = [];
                var handler = getCollectionChangeHandler(given, function (item) { return item.getContents(); });
                display.subscribe('onCollectionChange', handler);
                list.move(moveFrom, moveTo);
                display.unsubscribe('onCollectionChange', handler);
                chai_1.assert.deepEqual(given, expected);
            });
            it('should fire "onCollectionChange" after change wreezed item with grouping', function () {
                var items = [
                    { id: 1 },
                    { id: 2 }
                ];
                var list = new RecordSet_1.default({
                    rawData: items
                });
                var display = new Collection_1.default({
                    collection: list,
                    group: function () {
                        return 'group';
                    }
                });
                var changedItem = list.at(0);
                var given = [];
                var expected = [{
                        action: IObservable_1.default.ACTION_CHANGE,
                        newItems: [changedItem],
                        newItemsIndex: 1,
                        oldItems: [changedItem],
                        oldItemsIndex: 1
                    }];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    handleGiven(given, action, newItems, newItemsIndex, oldItems, oldItemsIndex);
                };
                list.setEventRaising(false, true);
                changedItem.set('id', 'foo');
                display.subscribe('onCollectionChange', handler);
                list.setEventRaising(true, true);
                display.unsubscribe('onCollectionChange', handler);
                checkGivenAndExpected(given, expected);
            });
            it('should fire "onCollectionChange" after sort the display', function () {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var given = [];
                var expected = [{
                        action: IObservable_1.default.ACTION_MOVE,
                        newItems: [4],
                        newItemsIndex: 0,
                        oldItems: [4],
                        oldItemsIndex: 3
                    }, {
                        action: IObservable_1.default.ACTION_MOVE,
                        newItems: [3],
                        newItemsIndex: 1,
                        oldItems: [3],
                        oldItemsIndex: 3
                    }, {
                        action: IObservable_1.default.ACTION_MOVE,
                        newItems: [2],
                        newItemsIndex: 2,
                        oldItems: [2],
                        oldItemsIndex: 3
                    }];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    handleGiven(given, action, newItems, newItemsIndex, oldItems, oldItemsIndex);
                };
                display.subscribe('onCollectionChange', handler);
                display.setSort(sort); // 1, 2, 3, 4 -> 4, 3, 2, 1
                display.unsubscribe('onCollectionChange', handler);
                checkGivenAndExpected(given, expected);
            });
            it('should fire "onCollectionChange" after sort the display if items moved forward', function () {
                var list = new ObservableList_1.default({
                    items: [1, 2, 4, 5, 6, 3, 7, 8, 9, 10]
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var given = [];
                var expected = [{
                        action: IObservable_1.default.ACTION_MOVE,
                        newItems: [3],
                        newItemsIndex: 2,
                        oldItems: [3],
                        oldItemsIndex: 5
                    }];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    handleGiven(given, action, newItems, newItemsIndex, oldItems, oldItemsIndex);
                };
                display.subscribe('onCollectionChange', handler);
                // 1, 2, 4, 5, 6, 3, 7, 8, 9, 10 -> 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
                display.setSort(function (a, b) { return a.collectionItem - b.collectionItem; });
                display.unsubscribe('onCollectionChange', handler);
                checkGivenAndExpected(given, expected);
            });
            it('should fire "onCollectionChange" after filter the display', function (done) {
                var list = new ObservableList_1.default({
                    items: getItems()
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var firesToBeDone = 1;
                var fireId = 0;
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    try {
                        chai_1.assert.strictEqual(action, IObservable_1.default.ACTION_REMOVE, 'Invalid action');
                        chai_1.assert.strictEqual(newItems.length, 0, 'Invalid newItems');
                        chai_1.assert.strictEqual(newItemsIndex, 0, 'Invalid newItemsIndex');
                        chai_1.assert.notEqual(outsideItems.indexOf(oldItems[0].getContents()), -1, 'Invalid oldItems');
                        chai_1.assert.strictEqual(oldItemsIndex, fireId, 'Invalid oldItemsIndex');
                        if (fireId === firesToBeDone) {
                            done();
                        }
                    }
                    catch (err) {
                        done(err);
                    }
                    fireId++;
                };
                display.subscribe('onCollectionChange', handler);
                display.setFilter(filter);
                display.unsubscribe('onCollectionChange', handler);
            });
            it('should fire "onCollectionChange" with move after group the display', function () {
                var list = new ObservableList_1.default({
                    items: [
                        { id: 1, group: 1 },
                        { id: 2, group: 2 },
                        { id: 3, group: 1 },
                        { id: 4, group: 2 }
                    ]
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var given = [];
                var expected = [{
                        action: IObservable_1.default.ACTION_ADD,
                        newItems: [1],
                        newItemsIndex: 0,
                        oldItems: [],
                        oldItemsIndex: 0
                    }, {
                        action: IObservable_1.default.ACTION_ADD,
                        newItems: [2],
                        newItemsIndex: 3,
                        oldItems: [],
                        oldItemsIndex: 0
                    }, {
                        action: IObservable_1.default.ACTION_MOVE,
                        newItems: [list.at(2)],
                        newItemsIndex: 2,
                        oldItems: [list.at(2)],
                        oldItemsIndex: 4
                    }, {
                        action: IObservable_1.default.ACTION_MOVE,
                        newItems: [2],
                        newItemsIndex: 3,
                        oldItems: [2],
                        oldItemsIndex: 4
                    }];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    handleGiven(given, action, newItems, newItemsIndex, oldItems, oldItemsIndex);
                };
                display.subscribe('onCollectionChange', handler);
                display.setGroup(function (item) { return item.group; });
                display.unsubscribe('onCollectionChange', handler);
                // 1, 2, 3, 4 ->
                // (1), 1, 2, 3, 4 ->
                // (1), 1, 2, (2), 3, 4 ->
                // (1), 1, 3, 2, (2), 4 ->
                // (1), 1, 3, (2), 2, 4
                checkGivenAndExpected(given, expected);
            });
            it('should fire "onCollectionChange" split by groups after add an items', function () {
                var list = new ObservableList_1.default({
                    items: [
                        { id: 1, group: 1 },
                        { id: 2, group: 1 },
                        { id: 3, group: 1 },
                        { id: 4, group: 1 }
                    ]
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var newItems = [
                    { id: 5, group: 2 },
                    { id: 6, group: 1 },
                    { id: 7, group: 2 },
                    { id: 8, group: 3 }
                ];
                var given = [];
                var expected = [{
                        action: IObservable_1.default.ACTION_ADD,
                        newItems: [newItems[1]],
                        newItemsIndex: 5,
                        oldItems: [],
                        oldItemsIndex: 0
                    }, {
                        action: IObservable_1.default.ACTION_ADD,
                        newItems: [2, newItems[0], newItems[2]],
                        newItemsIndex: 6,
                        oldItems: [],
                        oldItemsIndex: 0
                    }, {
                        action: IObservable_1.default.ACTION_ADD,
                        newItems: [3, newItems[3]],
                        newItemsIndex: 9,
                        oldItems: [],
                        oldItemsIndex: 0
                    }];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    handleGiven(given, action, newItems, newItemsIndex, oldItems, oldItemsIndex);
                };
                display.setGroup(function (item) { return item.group; });
                display.subscribe('onCollectionChange', handler);
                list.append(newItems);
                // (1), 1, 2, 3, 4 ->
                // (1), 1, 2, 3, 4, 6 ->
                // (1), 1, 2, 3, 4, 6, (2), 5, 7 ->
                // (1), 1, 2, 3, 4, 6, (2), 5, 7, (3), 8
                display.unsubscribe('onCollectionChange', handler);
                checkGivenAndExpected(given, expected);
            });
            it('should fire "onCollectionChange" split by groups after remove an items', function () {
                var list = new ObservableList_1.default({
                    items: [
                        { id: 1, group: 1 },
                        { id: 2, group: 1 },
                        { id: 3, group: 2 },
                        { id: 4, group: 2 }
                    ]
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var given = [];
                var expected = [{
                        action: IObservable_1.default.ACTION_REMOVE,
                        newItems: [],
                        newItemsIndex: 0,
                        oldItems: [1, list.at(0), list.at(1)],
                        oldItemsIndex: 0
                    }, {
                        action: IObservable_1.default.ACTION_REMOVE,
                        newItems: [],
                        newItemsIndex: 0,
                        oldItems: [list.at(3)],
                        oldItemsIndex: 2
                    }];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    handleGiven(given, action, newItems, newItemsIndex, oldItems, oldItemsIndex);
                };
                display.setGroup(function (item) {
                    return item.group;
                });
                display.subscribe('onCollectionChange', handler);
                list.setEventRaising(false, true);
                list.removeAt(3);
                list.removeAt(1);
                list.removeAt(0);
                list.setEventRaising(true, true);
                display.unsubscribe('onCollectionChange', handler);
                checkGivenAndExpected(given, expected);
            });
            it('should fire "onCollectionChange" with valid group after filter an items', function () {
                var list = new ObservableList_1.default({
                    items: [
                        { id: 1, group: 1 },
                        { id: 2, group: 1 },
                        { id: 3, group: 2 },
                        { id: 4, group: 2 }
                    ]
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var given = [];
                var expected = [{
                        action: IObservable_1.default.ACTION_REMOVE,
                        newItems: [],
                        newItemsIndex: 0,
                        oldItems: [list.at(1)],
                        oldItemsIndex: 2
                    }];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    handleGiven(given, action, newItems, newItemsIndex, oldItems, oldItemsIndex);
                };
                display.setGroup(function (item) { return item.group; });
                display.subscribe('onCollectionChange', handler);
                list.setEventRaising(false, true);
                display.setFilter(function (item) { return item.id !== 2; });
                list.setEventRaising(true, true);
                display.unsubscribe('onCollectionChange', handler);
                checkGivenAndExpected(given, expected);
            });
            it('should fire "onCollectionChange" with valid item contents when work in events queue', function () {
                var getModel = function (data) { return new Model_1.default({
                    rawData: data
                }); };
                var list = new ObservableList_1.default({
                    items: [
                        getModel({ id: 1 }),
                        getModel({ id: 2 }),
                        getModel({ id: 3 })
                    ]
                });
                var updatedItem;
                var displayUpdatedItem;
                list.subscribe('onCollectionChange', function () {
                    updatedItem = list.at(1);
                    updatedItem.set('id', 'test');
                });
                var display = new Collection_1.default({
                    collection: list
                });
                display.subscribe('onCollectionChange', function (e, action, newItems) {
                    if (newItems.length) {
                        displayUpdatedItem = newItems[0].getContents();
                    }
                });
                list.removeAt(0);
                chai_1.assert.strictEqual(updatedItem, displayUpdatedItem);
            });
            it('should keep sequence "onBeforeCollectionChange, onCollectionChange, onAfterCollectionChange" unbreakable', function () {
                var expected = ['onList', 'before', 'on', 'after', 'before', 'on', 'after'];
                var list = new ObservableList_1.default();
                var display;
                var given = [];
                var filterAdded = false;
                var handlerOnList = function () {
                    given.push('onList');
                };
                var handlerBefore = function () {
                    given.push('before');
                    if (!filterAdded) {
                        filterAdded = true;
                        display.setFilter(function () { return false; });
                    }
                };
                var handlerOn = function () {
                    given.push('on');
                };
                var handlerAfter = function () {
                    given.push('after');
                };
                list.subscribe('onCollectionChange', handlerOnList);
                display = new Collection_1.default({
                    collection: list
                });
                display.subscribe('onBeforeCollectionChange', handlerBefore);
                display.subscribe('onCollectionChange', handlerOn);
                display.subscribe('onAfterCollectionChange', handlerAfter);
                list.add('foo');
                list.unsubscribe('onCollectionChange', handlerOnList);
                display.unsubscribe('onBeforeCollectionChange', handlerBefore);
                display.unsubscribe('onCollectionChange', handlerOn);
                display.unsubscribe('onAfterCollectionChange', handlerAfter);
                chai_1.assert.deepEqual(given, expected);
            });
            it('should fire "onCollectionChange" after setEventRaising if "analize" is true', function () {
                var fired = false;
                var args = {};
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    fired = true;
                    args.action = action;
                    args.newItems = newItems;
                    args.newItemsIndex = newItemsIndex;
                    args.oldItems = oldItems;
                    args.oldItemsIndex = oldItemsIndex;
                };
                display.subscribe('onCollectionChange', handler);
                display.setEventRaising(false, true);
                list.add({ id: 999 });
                chai_1.assert.isFalse(fired);
                display.setEventRaising(true, true);
                display.unsubscribe('onCollectionChange', handler);
                chai_1.assert.isTrue(fired);
                chai_1.assert.strictEqual(args.action, IObservable_1.default.ACTION_ADD);
                chai_1.assert.strictEqual(args.newItems[0].getContents().id, 999);
                chai_1.assert.strictEqual(args.newItemsIndex, list.getCount() - 1);
                chai_1.assert.strictEqual(args.oldItems.length, 0);
                chai_1.assert.strictEqual(args.oldItemsIndex, 0);
            });
            it('should fire "onCollectionChange" after setEventRaising if items was moved', function () {
                var expected = [{
                        action: IObservable_1.default.ACTION_REMOVE,
                        newItems: [],
                        oldItems: [list.at(0)]
                    }, {
                        action: IObservable_1.default.ACTION_ADD,
                        newItems: [list.at(0)],
                        oldItems: []
                    }];
                var given = [];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    given.push({
                        action: action,
                        newItems: newItems.map(function (item) { return item.getContents(); }),
                        newItemsIndex: newItemsIndex,
                        oldItems: oldItems.map(function (item) { return item.getContents(); }),
                        oldItemsIndex: oldItemsIndex
                    });
                };
                display.subscribe('onCollectionChange', handler);
                display.setEventRaising(false, true);
                var item = list.at(0);
                list.removeAt(0);
                list.add(item);
                display.setEventRaising(true, true);
                display.unsubscribe('onCollectionChange', handler);
                chai_1.assert.strictEqual(given.length, expected.length);
                for (var i = 0; i < given.length; i++) {
                    chai_1.assert.strictEqual(given[i].action, expected[i].action);
                    chai_1.assert.deepEqual(given[i].newItems, expected[i].newItems);
                    chai_1.assert.deepEqual(given[i].oldItems, expected[i].oldItems);
                }
            });
            it('should fire "onCollectionChange" with valid item contents when the display and the collection are not ' +
                'synchronized', function () {
                var getModel = function (data) { return new Model_1.default({ rawData: data }); };
                var items = [
                    getModel({ id: 'one' }),
                    getModel({ id: 'two' }),
                    getModel({ id: 'three' })
                ];
                var list = new ObservableList_1.default({
                    items: items
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var expectItem;
                var givenItem;
                var expectIndex;
                var givenIndex;
                display.subscribe('onCollectionChange', function (e, action, newItems, newItemsIndex) {
                    if (action === IObservable_1.default.ACTION_CHANGE) {
                        givenItem = newItems[0].getContents();
                        givenIndex = newItemsIndex;
                    }
                });
                var handler = function (event, action) {
                    if (action === IObservable_1.default.ACTION_REMOVE) {
                        expectIndex = 1;
                        expectItem = list.at(expectIndex);
                        expectItem.set('id', 'foo');
                    }
                };
                list.setEventRaising(false, true);
                list.subscribe('onCollectionChange', handler);
                list.removeAt(0);
                list.add(getModel({ id: 'bar' }), 1);
                list.setEventRaising(true, true);
                list.unsubscribe('onCollectionChange', handler);
                chai_1.assert.isDefined(expectItem);
                chai_1.assert.strictEqual(givenItem, expectItem);
                chai_1.assert.strictEqual(givenIndex, expectIndex);
            });
            it('should fire "onBeforeCollectionChange" and "onAfterCollectionChange" around each change when the display ' +
                'and the collection are not synchronized', function () {
                var list = new RecordSet_1.default({
                    rawData: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var expected = [
                    'before', IObservable_1.default.ACTION_REMOVE, 'after',
                    'before', IObservable_1.default.ACTION_CHANGE, 'after',
                    'before', IObservable_1.default.ACTION_CHANGE, 'after'
                ];
                var given = [];
                var handlerBefore = function () {
                    given.push('before');
                };
                var handlerAfter = function () {
                    given.push('after');
                };
                var handlerOn = function (event, action) {
                    given.push(action);
                };
                var handlerOnList = function (event, action) {
                    if (action === IObservable_1.default.ACTION_REMOVE) {
                        list.at(0).set('id', 'foo');
                        list.at(1).set('id', 'bar');
                    }
                };
                display.subscribe('onBeforeCollectionChange', handlerBefore);
                display.subscribe('onCollectionChange', handlerOn);
                display.subscribe('onAfterCollectionChange', handlerAfter);
                list.subscribe('onCollectionChange', handlerOnList);
                list.setEventRaising(false, true);
                list.removeAt(3);
                list.setEventRaising(true, true);
                display.unsubscribe('onBeforeCollectionChange', handlerBefore);
                display.unsubscribe('onCollectionChange', handlerOn);
                display.unsubscribe('onAfterCollectionChange', handlerAfter);
                list.unsubscribe('onCollectionChange', handlerOnList);
                chai_1.assert.deepEqual(given, expected);
            });
            it('should trigger "onCollectionChange" with ACTION_CHANGE if source collection item changed while frozen', function () {
                var list = new RecordSet_1.default({
                    rawData: items
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var expected = [{
                        action: IObservable_1.default.ACTION_CHANGE,
                        newItems: [list.at(2)],
                        newItemsIndex: 2,
                        oldItems: [list.at(2)],
                        oldItemsIndex: 2
                    }];
                var given = [];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    given.push({
                        action: action,
                        newItems: newItems,
                        newItemsIndex: newItemsIndex,
                        oldItems: oldItems,
                        oldItemsIndex: oldItemsIndex
                    });
                };
                list.setEventRaising(false, true);
                list.at(2).set('name', 'foo');
                display.subscribe('onCollectionChange', handler);
                list.setEventRaising(true, true);
                display.unsubscribe('onCollectionChange', handler);
                chai_1.assert.equal(given.length, expected.length);
                for (var i = 0; i < given.length; i++) {
                    chai_1.assert.strictEqual(given[i].action, expected[i].action, "at change #" + i);
                    chai_1.assert.strictEqual(given[i].newItems.length, expected[i].newItems.length, "at change #" + i);
                    chai_1.assert.strictEqual(given[i].newItemsIndex, expected[i].newItemsIndex, "at change #" + i);
                    for (var j = 0; j < given[i].newItems.length; j++) {
                        chai_1.assert.strictEqual(given[i].newItems[j].getContents(), expected[i].newItems[j], "at change #" + i);
                    }
                    chai_1.assert.strictEqual(given[i].oldItems.length, expected[i].oldItems.length, "at change #" + i);
                    chai_1.assert.strictEqual(given[i].oldItemsIndex, expected[i].oldItemsIndex, "at change #" + i);
                    for (var j = 0; j < given[i].oldItems.length; j++) {
                        chai_1.assert.strictEqual(given[i].oldItems[j].getContents(), expected[i].oldItems[j], "at change #" + i);
                    }
                }
            });
            it('should trigger "onCollectionChange" with ACTION_CHANGE if source collection items changed while frozen ' +
                'and display inverts the collection', function () {
                var list = new RecordSet_1.default({
                    rawData: items
                });
                var max = list.getCount() - 1;
                var display = new Collection_1.default({
                    collection: list,
                    sort: function (a, b) { return b.index - a.index; }
                });
                var expected = [{
                        action: IObservable_1.default.ACTION_CHANGE,
                        newItems: [list.at(1)],
                        newItemsIndex: max - 1,
                        oldItems: [list.at(1)],
                        oldItemsIndex: max - 1
                    }, {
                        action: IObservable_1.default.ACTION_CHANGE,
                        newItems: [list.at(4), list.at(3)],
                        newItemsIndex: max - 4,
                        oldItems: [list.at(4), list.at(3)],
                        oldItemsIndex: max - 4
                    }, {
                        action: IObservable_1.default.ACTION_CHANGE,
                        newItems: [list.at(6)],
                        newItemsIndex: max - 6,
                        oldItems: [list.at(6)],
                        oldItemsIndex: max - 6
                    }];
                var given = [];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    given.push({
                        action: action,
                        newItems: newItems,
                        newItemsIndex: newItemsIndex,
                        oldItems: oldItems,
                        oldItemsIndex: oldItemsIndex
                    });
                };
                list.setEventRaising(false, true);
                list.at(1).set('name', 'fooA');
                list.at(3).set('name', 'fooB');
                list.at(4).set('name', 'fooC');
                list.at(6).set('name', 'fooD');
                display.subscribe('onCollectionChange', handler);
                list.setEventRaising(true, true);
                display.unsubscribe('onCollectionChange', handler);
                chai_1.assert.equal(given.length, expected.length);
                for (var i = 0; i < given.length; i++) {
                    chai_1.assert.strictEqual(given[i].action, expected[i].action, "at change #" + i);
                    chai_1.assert.strictEqual(given[i].newItems.length, expected[i].newItems.length, "at change #" + i);
                    chai_1.assert.strictEqual(given[i].newItemsIndex, expected[i].newItemsIndex, "at change #" + i);
                    for (var j = 0; j < given[i].newItems.length; j++) {
                        chai_1.assert.strictEqual(given[i].newItems[j].getContents(), expected[i].newItems[j], "at change #" + i);
                    }
                    chai_1.assert.strictEqual(given[i].oldItems.length, expected[i].oldItems.length, "at change #" + i);
                    chai_1.assert.strictEqual(given[i].oldItemsIndex, expected[i].oldItemsIndex, "at change #" + i);
                    for (var j = 0; j < given[i].oldItems.length; j++) {
                        chai_1.assert.strictEqual(given[i].oldItems[j].getContents(), expected[i].oldItems[j], "at change #" + i);
                    }
                }
            });
            it('should fire "onCollectionChange" after change an item', function () {
                var items = [{ id: 1 }, { id: 2 }, { id: 3 }];
                var list = new RecordSet_1.default({
                    rawData: items
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var given = [];
                var expected = [{
                        items: [display.at(1)],
                        index: 1
                    }];
                var handler = function (event, action, newItems, newItemsIndex) {
                    given.push({
                        items: newItems,
                        index: newItemsIndex
                    });
                };
                display.subscribe('onCollectionChange', handler);
                list.at(1).set('id', 'bar');
                display.unsubscribe('onCollectionChange', handler);
                chai_1.assert.strictEqual(given.length, expected.length);
                for (var i = 0; i < given.length; i++) {
                    chai_1.assert.deepEqual(given[i].items, expected[i].items);
                    chai_1.assert.strictEqual(given[i].index, expected[i].index);
                }
            });
            it('should fire "onCollectionChange" after change an item in group', function () {
                var items = [{ id: 1, g: 1 }, { id: 2, g: 1 }, { id: 3, g: 2 }];
                var list = new RecordSet_1.default({
                    rawData: items
                });
                var display = new Collection_1.default({
                    collection: list,
                    group: function (item) { return item.get('g'); }
                });
                var given = [];
                var expected = [{
                        items: [display.at(2)],
                        index: 2
                    }];
                var handler = function (event, action, newItems, newItemsIndex) {
                    given.push({
                        items: newItems,
                        index: newItemsIndex
                    });
                };
                display.subscribe('onCollectionChange', handler);
                list.at(1).set('id', 'bar');
                display.unsubscribe('onCollectionChange', handler);
                chai_1.assert.strictEqual(given.length, expected.length);
                for (var i = 0; i < given.length; i++) {
                    chai_1.assert.deepEqual(given[i].items, expected[i].items);
                    chai_1.assert.strictEqual(given[i].index, expected[i].index);
                }
            });
            it('should fire "onCollectionChange" after changed item is not moved as item only changed', function () {
                var items = [{ id: 1 }, { id: 3 }, { id: 5 }];
                var list = new RecordSet_1.default({
                    rawData: items
                });
                var display = new Collection_1.default({
                    collection: list,
                    keyProperty: 'id',
                    sort: function (a, b) { return a.collectionItem.get('id') - b.collectionItem.get('id'); }
                });
                var given = [];
                var expected = [{
                        action: IObservable_1.default.ACTION_CHANGE,
                        newItems: [display.at(1)],
                        newItemsIndex: 1,
                        oldItems: [display.at(1)],
                        oldItemsIndex: 1
                    }];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    given.push({
                        action: action,
                        newItems: newItems,
                        newItemsIndex: newItemsIndex,
                        oldItems: oldItems,
                        oldItemsIndex: oldItemsIndex
                    });
                };
                display.subscribe('onCollectionChange', handler);
                list.at(1).set('id', 2);
                display.unsubscribe('onCollectionChange', handler);
                chai_1.assert.strictEqual(given.length, expected.length);
                for (var i = 0; i < given.length; i++) {
                    chai_1.assert.deepEqual(given[i].action, expected[i].action);
                    chai_1.assert.deepEqual(given[i].newItems, expected[i].newItems);
                    chai_1.assert.strictEqual(given[i].newItemsIndex, expected[i].newItemsIndex);
                    chai_1.assert.deepEqual(given[i].oldItems, expected[i].oldItems);
                    chai_1.assert.strictEqual(given[i].oldItemsIndex, expected[i].oldItemsIndex);
                }
            });
            it('should fire "onCollectionChange" after changed item is moved down as it\'s sibling moved up and item ' +
                'changed', function () {
                var items = [{ id: 1 }, { id: 3 }, { id: 5 }];
                list = new RecordSet_1.default({
                    rawData: items
                });
                var display = new Collection_1.default({
                    collection: list,
                    keyProperty: 'id',
                    sort: function (a, b) { return a.collectionItem.get('id') - b.collectionItem.get('id'); }
                });
                var given = [];
                var expected = [{
                        action: IObservable_1.default.ACTION_MOVE,
                        newItems: [display.at(1)],
                        newItemsIndex: 0,
                        oldItems: [display.at(1)],
                        oldItemsIndex: 1
                    }, {
                        action: IObservable_1.default.ACTION_CHANGE,
                        newItems: [display.at(0)],
                        newItemsIndex: 1,
                        oldItems: [display.at(0)],
                        oldItemsIndex: 1
                    }];
                var handler = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                    given.push({
                        action: action,
                        newItems: newItems,
                        newItemsIndex: newItemsIndex,
                        oldItems: oldItems,
                        oldItemsIndex: oldItemsIndex
                    });
                };
                display.subscribe('onCollectionChange', handler);
                list.at(0).set('id', 4);
                display.unsubscribe('onCollectionChange', handler);
                chai_1.assert.strictEqual(given.length, expected.length);
                for (var i = 0; i < given.length; i++) {
                    chai_1.assert.deepEqual(given[i].action, expected[i].action);
                    chai_1.assert.deepEqual(given[i].newItems, expected[i].newItems);
                    chai_1.assert.strictEqual(given[i].newItemsIndex, expected[i].newItemsIndex);
                    chai_1.assert.deepEqual(given[i].oldItems, expected[i].oldItems);
                    chai_1.assert.strictEqual(given[i].oldItemsIndex, expected[i].oldItemsIndex);
                }
            });
            it('should fire "onCollectionChange" after changed item is moved up as it\'s really moved up', function () {
                var items = [{ id: 1 }, { id: 3 }, { id: 5 }];
                var list = new RecordSet_1.default({
                    rawData: items
                });
                var display = new Collection_1.default({
                    collection: list,
                    keyProperty: 'id',
                    sort: function (a, b) { return a.collectionItem.get('id') - b.collectionItem.get('id'); }
                });
                var expected = [{
                        action: IObservable_1.default.ACTION_MOVE,
                        newItems: [display.at(1)],
                        newItemsIndex: 0,
                        oldItems: [display.at(1)],
                        oldItemsIndex: 1
                    }];
                var given = [];
                var handler = getCollectionChangeHandler(given);
                display.subscribe('onCollectionChange', handler);
                list.at(1).set('id', 0);
                display.unsubscribe('onCollectionChange', handler);
                chai_1.assert.deepEqual(given, expected);
            });
            it('should fire "onBeforeCollectionChange" then "onCollectionChange" and then "onAfterCollectionChange" ' +
                'after change an item', function () {
                var items = [{ id: 1 }, { id: 2 }, { id: 3 }];
                var list = new RecordSet_1.default({
                    rawData: items
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var expected = ['before', 'on', 'after'];
                var given = [];
                var handlerBefore = function () {
                    given.push('before');
                };
                var handlerOn = function () {
                    given.push('on');
                };
                var handlerAfter = function () {
                    given.push('after');
                };
                display.subscribe('onBeforeCollectionChange', handlerBefore);
                display.subscribe('onCollectionChange', handlerOn);
                display.subscribe('onAfterCollectionChange', handlerAfter);
                list.at(1).set('id', 'bar');
                display.unsubscribe('onBeforeCollectionChange', handlerBefore);
                display.unsubscribe('onCollectionChange', handlerOn);
                display.unsubscribe('onAfterCollectionChange', handlerAfter);
                chai_1.assert.deepEqual(given, expected);
            });
            it('should fire "onBeforeCollectionChange" then "onCollectionChange" and then "onAfterCollectionChange" ' +
                'after change an item while frozen', function () {
                var items = [{ id: 1 }, { id: 2 }, { id: 3 }];
                var list = new RecordSet_1.default({
                    rawData: items
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var expected = ['before', 'on', 'after'];
                var given = [];
                var handlerBefore = function () {
                    given.push('before');
                };
                var handlerOn = function () {
                    given.push('on');
                };
                var handlerAfter = function () {
                    given.push('after');
                };
                display.subscribe('onBeforeCollectionChange', handlerBefore);
                display.subscribe('onCollectionChange', handlerOn);
                display.subscribe('onAfterCollectionChange', handlerAfter);
                list.setEventRaising(false, true);
                list.at(1).set('id', 'bar');
                list.setEventRaising(true, true);
                display.unsubscribe('onBeforeCollectionChange', handlerBefore);
                display.unsubscribe('onCollectionChange', handlerOn);
                display.unsubscribe('onAfterCollectionChange', handlerAfter);
                chai_1.assert.deepEqual(given, expected);
            });
            it('should observe "onEventRaisingChange" with analize=false on the source collection and become actual ' +
                'on enable', function () {
                var list = new ObservableList_1.default({
                    items: items.slice()
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var at = 1;
                var listItem = list.at(at);
                var nextListItem = list.at(at + 1);
                var displayItem = display.at(at);
                var nextDisplayItem = display.at(at + 1);
                list.setEventRaising(false);
                list.removeAt(at);
                chai_1.assert.strictEqual(display.at(at), displayItem);
                chai_1.assert.strictEqual(display.at(at).getContents(), listItem);
                chai_1.assert.strictEqual(display.at(at + 1), nextDisplayItem);
                chai_1.assert.strictEqual(display.at(at + 1).getContents(), nextListItem);
                list.setEventRaising(true);
                chai_1.assert.strictEqual(display.at(at).getContents(), nextListItem);
                chai_1.assert.notEqual(display.at(at + 1).getContents(), nextListItem);
            });
            it('should observe "onEventRaisingChange" with analize=true on the source collection and become actual ' +
                'on enable', function () {
                var list = new ObservableList_1.default({
                    items: items.slice()
                });
                var display = new Collection_1.default({
                    collection: list
                });
                var at = 1;
                var listItem = list.at(at);
                var nextListItem = list.at(at + 1);
                var displayItem = display.at(at);
                var nextDisplayItem = display.at(at + 1);
                list.setEventRaising(false, true);
                list.removeAt(at);
                chai_1.assert.strictEqual(display.at(at), displayItem);
                chai_1.assert.strictEqual(display.at(at).getContents(), listItem);
                chai_1.assert.strictEqual(display.at(at + 1), nextDisplayItem);
                chai_1.assert.strictEqual(display.at(at + 1).getContents(), nextListItem);
                list.setEventRaising(true, true);
                chai_1.assert.strictEqual(display.at(at), nextDisplayItem);
                chai_1.assert.strictEqual(display.at(at).getContents(), nextListItem);
                chai_1.assert.notEqual(display.at(at + 1), nextDisplayItem);
                chai_1.assert.notEqual(display.at(at + 1).getContents(), nextListItem);
            });
            it('should notify onCollectionChange after call setEventRaising if "analize" is true', function () {
                var item = { id: 999 };
                var expected = [{
                        action: IObservable_1.default.ACTION_ADD,
                        newItems: [item],
                        newItemsIndex: 7,
                        oldItems: [],
                        oldItemsIndex: 0
                    }];
                var given = [];
                var handler = getCollectionChangeHandler(given, function (item) { return item.getContents(); });
                display.subscribe('onCollectionChange', handler);
                display.setEventRaising(false, true);
                list.add(item);
                chai_1.assert.isTrue(given.length === 0);
                display.setEventRaising(true, true);
                display.unsubscribe('onCollectionChange', handler);
                chai_1.assert.deepEqual(given, expected);
            });
        });
        describe('::getDefaultDisplay()', function () {
            it('should return certain class instance for ObservableList', function () {
                var items = [
                    { id: 0 }
                ];
                var list = new ObservableList_1.default({
                    items: items
                });
                var display = Abstract_1.default.getDefaultDisplay(list);
                chai_1.assert.instanceOf(display, Collection_1.default);
            });
        });
        describe('.toJSON()', function () {
            it('should serialize the collection', function () {
                display.setFilter(function () { return true; });
                display.setGroup(function () { return 0; });
                var json = display.toJSON();
                chai_1.assert.strictEqual(json.module, 'Types/display:Collection');
                chai_1.assert.isNumber(json.id);
                chai_1.assert.isTrue(json.id > 0);
                chai_1.assert.deepEqual(json.state.$options, display._getOptions());
                chai_1.assert.strictEqual(json.state.$options.filter, display._$filter);
                chai_1.assert.strictEqual(json.state.$options.group, display._$group);
                chai_1.assert.strictEqual(json.state.$options.sort, display._$sort);
                chai_1.assert.deepEqual(json.state._composer._result.items, display.getItems());
            });
            it('should clone the collection', function () {
                var serializer = new Serializer();
                var json = JSON.stringify(display, serializer.serialize);
                var clone = JSON.parse(json, serializer.deserialize);
                var items = display.getItems();
                var cloneItems = clone.getItems();
                for (var i = 0; i < items.length; i++) {
                    chai_1.assert.strictEqual(clone.at(i), cloneItems[i]);
                    chai_1.assert.strictEqual(cloneItems[i].getInstanceId(), items[i].getInstanceId());
                    chai_1.assert.deepEqual(cloneItems[i].getContents(), items[i].getContents());
                    chai_1.assert.strictEqual(cloneItems[i].getOwner(), clone);
                }
            });
            it('should keep relation between a collection item contents and the source collection', function () {
                var serializer = new Serializer();
                var json = JSON.stringify(display, serializer.serialize);
                var clone = JSON.parse(json, serializer.deserialize);
                clone.each(function (item) {
                    chai_1.assert.notEqual(clone.getCollection().getIndex(item.getContents()), -1);
                });
            });
        });
        describe('::fromJSON()', function () {
            it('should keep items order if source collection has been affected', function () {
                var items = getItems();
                var list = new ObservableList_1.default({
                    items: items
                });
                var strategy = new Collection_1.default({
                    collection: list,
                    keyProperty: 'id'
                });
                var serializer = new Serializer();
                var json = JSON.stringify(strategy, serializer.serialize);
                var clone = JSON.parse(json, serializer.deserialize);
                var cloneItems = [];
                clone.getCollection().removeAt(0);
                clone.each(function (item) {
                    cloneItems.push(item.getContents());
                });
                chai_1.assert.deepEqual(cloneItems, items.slice(1));
            });
            it('should restore items contents in all decorators', function () {
                var items = getItems();
                var list = new ObservableList_1.default({
                    items: items
                });
                var strategy = new Collection_1.default({
                    collection: list,
                    keyProperty: 'id'
                });
                var serializer = new Serializer();
                var json = JSON.stringify(strategy, serializer.serialize);
                var clone = JSON.parse(json, serializer.deserialize);
                var cloneDecorator = clone._composer.getResult();
                while (cloneDecorator) {
                    cloneDecorator.items.forEach(function (item) {
                        chai_1.assert.isUndefined(item._contentsIndex);
                    });
                    cloneDecorator = cloneDecorator.source;
                }
            });
        });
    });
});
