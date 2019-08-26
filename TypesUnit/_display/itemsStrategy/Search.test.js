define(["require", "exports", "chai", "Types/_display/itemsStrategy/Search", "Types/_display/BreadcrumbsItem", "Types/_display/TreeItem"], function (require, exports, chai_1, Search_1, BreadcrumbsItem_1, TreeItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_display/itemsStrategy/Search', function () {
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
                    return items.splice.apply(items, [start, deleteCount].concat(added));
                },
                invalidate: function () {
                    // always up to date
                },
                reset: function () {
                    items.length = 0;
                }
            };
        }
        var items;
        var source;
        var strategy;
        beforeEach(function () {
            items = [];
            items[0] = new TreeItem_1.default({
                contents: 'A',
                node: true
            });
            items[1] = new TreeItem_1.default({
                parent: items[0],
                contents: 'AA',
                node: true
            });
            items[2] = new TreeItem_1.default({
                parent: items[1],
                contents: 'AAA',
                node: true
            });
            items[3] = new TreeItem_1.default({
                parent: items[2],
                contents: 'AAAa'
            });
            items[4] = new TreeItem_1.default({
                parent: items[2],
                contents: 'AAAb'
            });
            items[5] = new TreeItem_1.default({
                parent: items[1],
                contents: 'AAB',
                node: true
            });
            items[6] = new TreeItem_1.default({
                parent: items[1],
                contents: 'AAC',
                node: true
            });
            items[7] = new TreeItem_1.default({
                parent: items[6],
                contents: 'AACa'
            });
            items[8] = new TreeItem_1.default({
                parent: items[1],
                contents: 'AAD',
                node: true
            });
            items[9] = new TreeItem_1.default({
                contents: 'B',
                node: true
            });
            items[10] = new TreeItem_1.default({
                contents: 'C',
                node: true
            });
            items[11] = new TreeItem_1.default({
                contents: 'd'
            });
            items[12] = new TreeItem_1.default({
                contents: 'e'
            });
            source = getSource(items);
            strategy = new Search_1.default({
                source: source
            });
        });
        afterEach(function () {
            items = undefined;
            source = undefined;
            strategy = undefined;
        });
        describe('.options', function () {
            it('should return the source options', function () {
                chai_1.assert.strictEqual(strategy.options, source.options);
            });
        });
        describe('.items', function () {
            it('should group breadcrumbs nodes', function () {
                var strategy = new Search_1.default({
                    source: source
                });
                var expected = [
                    '#A,AA,AAA',
                    'AAAa',
                    'AAAb',
                    '#A,AA,AAB',
                    '#A,AA,AAC',
                    'AACa',
                    '#A,AA,AAD',
                    '#B',
                    '#C',
                    'd',
                    'e'
                ];
                strategy.items.forEach(function (item, index) {
                    var contents = item.getContents();
                    chai_1.assert.equal(contents instanceof Array ? '#' + contents.join(',') : contents, expected[index], 'at ' + index);
                });
                chai_1.assert.strictEqual(strategy.items.length, expected.length);
            });
            it('should group only breadcrumbs nodes', function () {
                var items = [];
                items[0] = new TreeItem_1.default({
                    contents: 'A',
                    node: true
                });
                items[1] = new TreeItem_1.default({
                    parent: items[0],
                    contents: 'AA',
                    node: true
                });
                items[2] = new TreeItem_1.default({
                    parent: items[1],
                    contents: 'AAA',
                    node: true
                });
                var source = getSource(items);
                var strategy = new Search_1.default({
                    source: source
                });
                var result = strategy.items.map(function (item) {
                    var contents = item.getContents();
                    return item instanceof BreadcrumbsItem_1.default ? '#' + contents.join(',') : contents;
                });
                chai_1.assert.deepEqual(result, ['#A,AA,AAA']);
            });
            it('should return valid items level for first item after breadcrumbs', function () {
                var items = [];
                items[0] = new TreeItem_1.default({
                    contents: 'A',
                    node: true
                });
                items[1] = new TreeItem_1.default({
                    parent: items[0],
                    contents: 'AA',
                    node: true
                });
                items[2] = new TreeItem_1.default({
                    parent: items[1],
                    contents: 'AAa',
                    node: false
                });
                items[3] = new TreeItem_1.default({
                    contents: 'b',
                    node: false
                });
                var source = getSource(items);
                var strategy = new Search_1.default({
                    source: source
                });
                var result = strategy.items.map(function (item) {
                    var contents = item.getContents();
                    return (item instanceof BreadcrumbsItem_1.default ? '#' + contents.join(',') : contents) + ':' + item.getLevel();
                });
                chai_1.assert.deepEqual(result, ['#A,AA:0', 'AAa:1', 'b:0']);
            });
            it('return breadcrumbs as 1st level parent for leaves', function () {
                var parents = [];
                parents[1] = BreadcrumbsItem_1.default;
                parents[2] = BreadcrumbsItem_1.default;
                parents[3] = BreadcrumbsItem_1.default;
                parents[4] = BreadcrumbsItem_1.default;
                parents[5] = BreadcrumbsItem_1.default;
                parents[6] = BreadcrumbsItem_1.default;
                parents[7] = BreadcrumbsItem_1.default;
                parents[8] = BreadcrumbsItem_1.default;
                parents[9] = undefined;
                parents[10] = undefined;
                parents[11] = undefined;
                parents[12] = undefined;
                var levels = [];
                levels[1] = 1;
                levels[2] = 1;
                levels[3] = 1;
                levels[4] = 1;
                levels[5] = 1;
                levels[6] = 1;
                levels[7] = 1;
                levels[8] = 1;
                levels[9] = 0;
                levels[10] = 0;
                levels[11] = 0;
                levels[12] = 0;
                strategy.items.forEach(function (item, index) {
                    if (item instanceof TreeItem_1.default) {
                        if (typeof parents[index] === 'function') {
                            chai_1.assert.instanceOf(item.getParent(), parents[index], 'at ' + index);
                        }
                        else {
                            chai_1.assert.strictEqual(item.getParent(), parents[index], 'at ' + index);
                        }
                        chai_1.assert.equal(item.getLevel(), levels[index], 'at ' + index);
                    }
                });
            });
            it('should return the same instances for second call', function () {
                var items = strategy.items.slice();
                strategy.items.forEach(function (item, index) {
                    chai_1.assert.strictEqual(items[index], item);
                });
                chai_1.assert.equal(items.length, strategy.items.length);
            });
        });
        describe('.count', function () {
            it('should return items count', function () {
                chai_1.assert.equal(strategy.count, 11);
            });
        });
        describe('.getDisplayIndex()', function () {
            it('should return index in projection', function () {
                var next = strategy.count;
                var expected = [next, next, next, 1, 2, next, next, 5, next, next, next, 9, 10];
                items.forEach(function (item, index) {
                    chai_1.assert.equal(strategy.getDisplayIndex(index), expected[index], 'at ' + index);
                });
            });
        });
        describe('.getCollectionIndex()', function () {
            it('should return index in collection', function () {
                var expected = [-1, 3, 4, -1, -1, 7, -1, -1, -1, 11, 12];
                strategy.items.forEach(function (item, index) {
                    chai_1.assert.equal(strategy.getCollectionIndex(index), expected[index], 'at ' + index);
                });
            });
        });
        describe('.splice()', function () {
            it('should add items', function () {
                var source = getSource(items);
                var strategy = new Search_1.default({
                    source: source
                });
                var newItems = [new TreeItem_1.default({
                        parent: items[2],
                        contents: 'AAAc'
                    })];
                var at = 3;
                var expected = [
                    '#A,AA,AAA',
                    'AAAc',
                    'AAAa',
                    'AAAb',
                    '#A,AA,AAB',
                    '#A,AA,AAC',
                    'AACa',
                    '#A,AA,AAD',
                    '#B',
                    '#C',
                    'd',
                    'e'
                ];
                strategy.splice(at, 0, newItems);
                strategy.items.forEach(function (item, index) {
                    var contents = item.getContents();
                    chai_1.assert.equal(contents instanceof Array ? '#' + contents.join(',') : contents, expected[index], 'at ' + index);
                });
                chai_1.assert.strictEqual(strategy.items.length, expected.length);
            });
            it('should remove items', function () {
                var strategy = new Search_1.default({
                    source: source
                });
                // AA
                var at = 1;
                // AA + AAA
                var removeCount = 2;
                var count = source.items.length;
                var expected = [
                    '#A',
                    'AAAa',
                    'AAAb',
                    '#A,AA,AAB',
                    '#A,AA,AAC',
                    'AACa',
                    '#A,AA,AAD',
                    '#B',
                    '#C',
                    'd',
                    'e'
                ];
                strategy.splice(at, removeCount, []);
                chai_1.assert.strictEqual(strategy.count, count - removeCount);
                chai_1.assert.strictEqual(strategy.count, expected.length);
                strategy.items.forEach(function (item, index) {
                    var contents = item.getContents();
                    chai_1.assert.equal(contents instanceof Array ? '#' + contents.join(',') : contents, expected[index], 'at ' + index);
                });
            });
        });
        describe('.reset()', function () {
            it('should reset items', function () {
                strategy.reset();
                chai_1.assert.strictEqual(strategy.items.length, 0);
            });
        });
    });
});
