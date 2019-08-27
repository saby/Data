define(["require", "exports", "chai", "Types/_display/BreadcrumbsItem", "Types/_display/TreeItem"], function (require, exports, chai_1, BreadcrumbsItem_1, TreeItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_display/BreadcrumbsItem', function () {
        describe('.getContents()', function () {
            it('should return tree branch', function () {
                var items = [];
                items[0] = new TreeItem_1.default({
                    contents: 'a'
                });
                items[1] = new TreeItem_1.default({
                    parent: items[0],
                    contents: 'b'
                });
                items[2] = new TreeItem_1.default({
                    parent: items[1],
                    contents: 'c'
                });
                var expected = [['a'], ['a', 'b'], ['a', 'b', 'c']];
                items.forEach(function (item, index) {
                    var bcItem = new BreadcrumbsItem_1.default({
                        last: item
                    });
                    chai_1.assert.deepEqual(bcItem.getContents(), expected[index]);
                });
            });
            it('should return tree branch with root', function () {
                var root = new TreeItem_1.default({
                    contents: 'root'
                });
                var owner = {
                    getRoot: function () {
                        return null;
                    }
                };
                var item = new TreeItem_1.default({
                    parent: root,
                    contents: 'a'
                });
                var bcItem = new BreadcrumbsItem_1.default({
                    owner: owner,
                    last: item
                });
                chai_1.assert.deepEqual(bcItem.getContents(), ['root', 'a']);
            });
            it('should return tree branch without root', function () {
                var root = new TreeItem_1.default({
                    contents: 'root'
                });
                var owner = {
                    getRoot: function () {
                        return root;
                    }
                };
                var item = new TreeItem_1.default({
                    parent: root,
                    contents: 'a'
                });
                var bcItem = new BreadcrumbsItem_1.default({
                    owner: owner,
                    last: item
                });
                chai_1.assert.deepEqual(bcItem.getContents(), ['a']);
            });
        });
        describe('.getLevel()', function () {
            it('should return 0 by default', function () {
                var item = new BreadcrumbsItem_1.default();
                chai_1.assert.strictEqual(item.getLevel(), 0);
            });
            it('should return 1 if owner contains enumerable root', function () {
                var root = new TreeItem_1.default({
                    contents: 'root'
                });
                var owner = {
                    getRoot: function () {
                        return root;
                    },
                    isRootEnumerable: function () {
                        return true;
                    }
                };
                var last = new TreeItem_1.default({
                    owner: owner,
                    contents: 'last'
                });
                var item = new BreadcrumbsItem_1.default({
                    owner: owner,
                    last: last
                });
                chai_1.assert.strictEqual(item.getLevel(), 1);
            });
        });
    });
});
