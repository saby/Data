define(["require", "exports", "chai", "Types/_display/TreeItem"], function (require, exports, chai_1, TreeItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_display/TreeItem', function () {
        var Owner = function () {
            var _this = this;
            this.lastChangedItem = undefined;
            this.lastChangedProperty = undefined;
            this.notifyItemChange = function (item, property) {
                _this.lastChangedItem = item;
                _this.lastChangedProperty = property;
            };
        };
        var getOwnerMock = function () {
            return new Owner();
        };
        describe('.getParent()', function () {
            it('should return undefined by default', function () {
                var item = new TreeItem_1.default();
                chai_1.assert.isUndefined(item.getParent());
            });
            it('should return value passed to the constructor', function () {
                var parent = new TreeItem_1.default();
                var item = new TreeItem_1.default({ parent: parent });
                chai_1.assert.strictEqual(item.getParent(), parent);
            });
        });
        describe('.getRoot()', function () {
            it('should return itself by default', function () {
                var item = new TreeItem_1.default();
                chai_1.assert.strictEqual(item.getRoot(), item);
            });
            it('should return root of the parent', function () {
                var parent = new TreeItem_1.default();
                var item = new TreeItem_1.default({ parent: parent });
                chai_1.assert.strictEqual(item.getRoot(), parent.getRoot());
            });
        });
        describe('.isRoot()', function () {
            it('should return true by default', function () {
                var item = new TreeItem_1.default();
                chai_1.assert.isTrue(item.isRoot());
            });
            it('should return false if has parent', function () {
                var parent = new TreeItem_1.default();
                var item = new TreeItem_1.default({ parent: parent });
                chai_1.assert.isFalse(item.isRoot());
            });
        });
        describe('.getLevel()', function () {
            it('should return 0 by default', function () {
                var item = new TreeItem_1.default();
                chai_1.assert.strictEqual(item.getLevel(), 0);
            });
            it('should return value differs by +1 from the parent', function () {
                var root = new TreeItem_1.default();
                var level1 = new TreeItem_1.default({ parent: root });
                var level2 = new TreeItem_1.default({ parent: level1 });
                chai_1.assert.strictEqual(root.getLevel(), 0);
                chai_1.assert.strictEqual(level1.getLevel(), root.getLevel() + 1);
                chai_1.assert.strictEqual(level2.getLevel(), level1.getLevel() + 1);
            });
            it('should return 1 for root if it\'s enumerable', function () {
                var Owner = function () {
                    this.isRootEnumerable = function () {
                        return true;
                    };
                };
                var owner = new Owner();
                var root = new TreeItem_1.default({ owner: owner });
                var level1 = new TreeItem_1.default({
                    parent: root,
                    owner: owner
                });
                var level2 = new TreeItem_1.default({
                    parent: level1,
                    owner: owner
                });
                chai_1.assert.strictEqual(root.getLevel(), 1);
                chai_1.assert.strictEqual(level1.getLevel(), root.getLevel() + 1);
                chai_1.assert.strictEqual(level2.getLevel(), level1.getLevel() + 1);
            });
        });
        describe('.isNode()', function () {
            it('should return false by default', function () {
                var item = new TreeItem_1.default();
                chai_1.assert.isFalse(item.isNode());
            });
            it('should return value passed to the constructor', function () {
                var item = new TreeItem_1.default({ node: true });
                chai_1.assert.isTrue(item.isNode());
            });
        });
        describe('.isExpanded()', function () {
            it('should return false by default', function () {
                var item = new TreeItem_1.default();
                chai_1.assert.isFalse(item.isExpanded());
            });
            it('should return value passed to the constructor', function () {
                var item = new TreeItem_1.default({ expanded: true });
                chai_1.assert.isTrue(item.isExpanded());
            });
        });
        describe('.setExpanded()', function () {
            it('should set the new value', function () {
                var item = new TreeItem_1.default();
                item.setExpanded(true);
                chai_1.assert.isTrue(item.isExpanded());
                item.setExpanded(false);
                chai_1.assert.isFalse(item.isExpanded());
            });
            it('should notify owner if changed', function () {
                var owner = getOwnerMock();
                var item = new TreeItem_1.default({
                    owner: owner
                });
                item.setExpanded(true);
                chai_1.assert.strictEqual(owner.lastChangedItem, item);
                chai_1.assert.strictEqual(owner.lastChangedProperty, 'expanded');
            });
            it('should not notify owner if changed in silent mode', function () {
                var owner = getOwnerMock();
                var item = new TreeItem_1.default({
                    owner: owner
                });
                item.setExpanded(true, true);
                chai_1.assert.isUndefined(owner.lastChangedItem);
                chai_1.assert.isUndefined(owner.lastChangedProperty);
            });
        });
        describe('.toggleExpanded()', function () {
            it('should toggle the value', function () {
                var item = new TreeItem_1.default();
                item.toggleExpanded();
                chai_1.assert.isTrue(item.isExpanded());
                item.toggleExpanded();
                chai_1.assert.isFalse(item.isExpanded());
            });
        });
        describe('.isHasChildren()', function () {
            it('should return true by default', function () {
                var item = new TreeItem_1.default();
                chai_1.assert.isTrue(item.isHasChildren());
            });
            it('should return value passed to the constructor', function () {
                var item = new TreeItem_1.default({ hasChildren: false });
                chai_1.assert.isFalse(item.isHasChildren());
            });
        });
        describe('.setHasChildren()', function () {
            it('should set the new value', function () {
                var item = new TreeItem_1.default();
                item.setHasChildren(false);
                chai_1.assert.isFalse(item.isHasChildren());
                item.setHasChildren(true);
                chai_1.assert.isTrue(item.isHasChildren());
            });
        });
        describe('.isLoaded()', function () {
            it('should return false by default', function () {
                var item = new TreeItem_1.default();
                chai_1.assert.isFalse(item.isLoaded());
            });
            it('should return value passed to the constructor', function () {
                var item = new TreeItem_1.default({ loaded: true });
                chai_1.assert.isTrue(item.isLoaded());
            });
        });
        describe('.setLoaded()', function () {
            it('should set the new value', function () {
                var item = new TreeItem_1.default();
                item.setLoaded(true);
                chai_1.assert.isTrue(item.isLoaded());
                item.setLoaded(false);
                chai_1.assert.isFalse(item.isLoaded());
            });
        });
        describe('.getChildrenProperty()', function () {
            it('should return na empty string by default', function () {
                var item = new TreeItem_1.default();
                chai_1.assert.strictEqual(item.getChildrenProperty(), '');
            });
            it('should return value passed to the constructor', function () {
                var name = 'test';
                var item = new TreeItem_1.default({ childrenProperty: name });
                chai_1.assert.strictEqual(item.getChildrenProperty(), name);
            });
        });
        describe('.toJSON()', function () {
            it('should serialize the tree item', function () {
                var item = new TreeItem_1.default();
                var json = item.toJSON();
                var options = item._getOptions();
                delete options.owner;
                chai_1.assert.strictEqual(json.module, 'Types/display:TreeItem');
                chai_1.assert.deepEqual(json.state.$options, options);
            });
        });
    });
});
