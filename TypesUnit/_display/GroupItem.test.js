define(["require", "exports", "chai", "Types/_display/GroupItem"], function (require, exports, chai_1, GroupItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_display/GroupItem', function () {
        var getOwnerMock = function () {
            return {
                lastChangedItem: undefined,
                lastChangedProperty: undefined,
                notifyItemChange: function (item, property) {
                    this.lastChangedItem = item;
                    this.lastChangedProperty = property;
                }
            };
        };
        describe('.isExpanded()', function () {
            it('should return true by default', function () {
                var item = new GroupItem_1.default();
                chai_1.assert.isTrue(item.isExpanded());
            });
            it('should return value passed to the constructor', function () {
                var item = new GroupItem_1.default({ expanded: false });
                chai_1.assert.isFalse(item.isExpanded());
            });
        });
        describe('.setExpanded()', function () {
            it('should set the new value', function () {
                var item = new GroupItem_1.default();
                item.setExpanded(false);
                chai_1.assert.isFalse(item.isExpanded());
                item.setExpanded(true);
                chai_1.assert.isTrue(item.isExpanded());
            });
            it('should notify owner if changed', function () {
                var owner = getOwnerMock();
                var item = new GroupItem_1.default({
                    owner: owner
                });
                item.setExpanded(false);
                chai_1.assert.strictEqual(owner.lastChangedItem, item);
                chai_1.assert.strictEqual(owner.lastChangedProperty, 'expanded');
            });
            it('should not notify owner if changed in silent mode', function () {
                var owner = getOwnerMock();
                var item = new GroupItem_1.default({
                    owner: owner
                });
                item.setExpanded(false, true);
                chai_1.assert.isUndefined(owner.lastChangedItem);
                chai_1.assert.isUndefined(owner.lastChangedProperty);
            });
        });
        describe('.toggleExpanded()', function () {
            it('should toggle the value', function () {
                var item = new GroupItem_1.default();
                item.toggleExpanded();
                chai_1.assert.isFalse(item.isExpanded());
                item.toggleExpanded();
                chai_1.assert.isTrue(item.isExpanded());
            });
        });
    });
});
