define(["require", "exports", "chai", "Types/_display/CollectionItem"], function (require, exports, chai_1, CollectionItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_display/CollectionItem', function () {
        describe('.getOwner()', function () {
            it('should return null by default', function () {
                var item = new CollectionItem_1.default();
                chai_1.assert.isNull(item.getOwner());
            });
            it('should return value passed to the constructor', function () {
                var owner = {};
                var item = new CollectionItem_1.default({ owner: owner });
                chai_1.assert.strictEqual(item.getOwner(), owner);
            });
        });
        describe('.setOwner()', function () {
            it('should set the new value', function () {
                var owner = {};
                var item = new CollectionItem_1.default();
                item.setOwner(owner);
                chai_1.assert.strictEqual(item.getOwner(), owner);
            });
        });
        describe('.getContents()', function () {
            it('should return null by default', function () {
                var item = new CollectionItem_1.default();
                chai_1.assert.isNull(item.getContents());
            });
            it('should return value passed to the constructor', function () {
                var contents = {};
                var item = new CollectionItem_1.default({ contents: contents });
                chai_1.assert.strictEqual(item.getContents(), contents);
            });
        });
        describe('.setContents()', function () {
            it('should set the new value', function () {
                var contents = {};
                var item = new CollectionItem_1.default();
                item.setContents(contents);
                chai_1.assert.strictEqual(item.getContents(), contents);
            });
            it('should notify the owner', function () {
                var newContents = 'new';
                var given = {};
                var owner = {
                    notifyItemChange: function (item, property) {
                        given.item = item;
                        given.property = property;
                    }
                };
                var item = new CollectionItem_1.default({ owner: owner });
                item.setContents(newContents);
                chai_1.assert.strictEqual(given.item, item);
                chai_1.assert.strictEqual(given.property, 'contents');
            });
            it('should not notify the owner', function () {
                var newContents = 'new';
                var given = {};
                var owner = {
                    notifyItemChange: function (item, property) {
                        given.item = item;
                        given.property = property;
                    }
                };
                var item = new CollectionItem_1.default({ owner: owner });
                item.setContents(newContents, true);
                chai_1.assert.isUndefined(given.item);
                chai_1.assert.isUndefined(given.property);
            });
        });
        describe('.getUid()', function () {
            it('should return calling result of getItemUid() on owner', function () {
                var owner = {
                    getItemUid: function (item) { return "[" + item.getContents() + "]"; }
                };
                var item = new CollectionItem_1.default({
                    owner: owner,
                    contents: 'foo'
                });
                chai_1.assert.equal(item.getUid(), '[foo]');
            });
            it('should return undefined if there is no owner', function () {
                var item = new CollectionItem_1.default();
                chai_1.assert.isUndefined(item.getUid());
            });
        });
        describe('.isSelected()', function () {
            it('should return false by default', function () {
                var item = new CollectionItem_1.default();
                chai_1.assert.isFalse(item.isSelected());
            });
            it('should return value passed to the constructor', function () {
                var selected = true;
                var item = new CollectionItem_1.default({ selected: selected });
                chai_1.assert.strictEqual(item.isSelected(), selected);
            });
        });
        describe('.setSelected()', function () {
            it('should set the new value', function () {
                var selected = true;
                var item = new CollectionItem_1.default();
                item.setSelected(selected);
                chai_1.assert.strictEqual(item.isSelected(), selected);
            });
            it('should notify the owner', function () {
                var given = {};
                var owner = {
                    notifyItemChange: function (item, property) {
                        given.item = item;
                        given.property = property;
                    }
                };
                var item = new CollectionItem_1.default({ owner: owner });
                item.setSelected(true);
                chai_1.assert.strictEqual(given.item, item);
                chai_1.assert.strictEqual(given.property, 'selected');
            });
            it('should not notify the owner', function () {
                var given = {};
                var owner = {
                    notifyItemChange: function (item, property) {
                        given.item = item;
                        given.property = property;
                    }
                };
                var item = new CollectionItem_1.default({ owner: owner });
                item.setSelected(true, true);
                chai_1.assert.isUndefined(given.item);
                chai_1.assert.isUndefined(given.property);
            });
        });
        describe('.toJSON()', function () {
            it('should serialize the collection item', function () {
                var item = new CollectionItem_1.default();
                var json = item.toJSON();
                var options = item._getOptions();
                delete options.owner;
                chai_1.assert.strictEqual(json.module, 'Types/display:CollectionItem');
                chai_1.assert.isNumber(json.id);
                chai_1.assert.isTrue(json.id > 0);
                chai_1.assert.deepEqual(json.state.$options, options);
                chai_1.assert.strictEqual(json.state.iid, item.getInstanceId());
            });
            it('should serialize contents of the item if owner is not defined', function () {
                var items = [1];
                items.getIndex = Array.prototype.indexOf;
                var owner = {
                    getCollection: function () {
                        return items;
                    }
                };
                var item = new CollectionItem_1.default({
                    owner: owner,
                    contents: 'foo'
                });
                var json = item.toJSON();
                chai_1.assert.isUndefined(json.state.ci);
                chai_1.assert.equal(json.state.$options.contents, 'foo');
            });
            it('should serialize contents of the item if owner doesn\'t supports IList', function () {
                var items = [1];
                var owner = {
                    getCollection: function () {
                        return items;
                    }
                };
                var item = new CollectionItem_1.default({
                    owner: owner,
                    contents: 'foo'
                });
                var json = item.toJSON();
                chai_1.assert.isUndefined(json.state.ci);
                chai_1.assert.equal(json.state.$options.contents, 'foo');
            });
            it('should don\'t serialize contents of the item if owner supports IList', function () {
                var items = [1];
                var owner = {
                    getCollection: function () {
                        return items;
                    }
                };
                items['[Types/_collection/IList]'] = true;
                items.getIndex = Array.prototype.indexOf;
                var item = new CollectionItem_1.default({
                    owner: owner,
                    contents: items[0]
                });
                var json = item.toJSON();
                chai_1.assert.strictEqual(json.state.ci, 0);
                chai_1.assert.isUndefined(json.state.$options.contents);
            });
        });
    });
});
