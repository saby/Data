import {assert} from 'chai';
import GroupItem from 'Types/_display/GroupItem';

describe('Types/_display/GroupItem', () => {
    const getOwnerMock = () => {
        return {
            lastChangedItem: undefined,
            lastChangedProperty: undefined,
            notifyItemChange(item: GroupItem<string>, property: string): void {
                this.lastChangedItem = item;
                this.lastChangedProperty = property;
            }
        };
    };

    describe('.isExpanded()', () => {
        it('should return true by default', () => {
            const item = new GroupItem();
            assert.isTrue(item.isExpanded());
        });

        it('should return value passed to the constructor', () => {
            const item = new GroupItem({expanded: false});
            assert.isFalse(item.isExpanded());
        });
    });

    describe('.setExpanded()', () => {
        it('should set the new value', () => {
            const item = new GroupItem();

            item.setExpanded(false);
            assert.isFalse(item.isExpanded());

            item.setExpanded(true);
            assert.isTrue(item.isExpanded());
        });

        it('should notify owner if changed', () => {
            const owner = getOwnerMock();
            const item = new GroupItem({
                owner: owner as any
            });

            item.setExpanded(false);

            assert.strictEqual(owner.lastChangedItem, item);
            assert.strictEqual(owner.lastChangedProperty, 'expanded');
        });

        it('should not notify owner if changed in silent mode', () => {
            const owner = getOwnerMock();
            const item = new GroupItem({
                owner: owner as any
            });

            item.setExpanded(false, true);

            assert.isUndefined(owner.lastChangedItem);
            assert.isUndefined(owner.lastChangedProperty);
        });
    });

    describe('.toggleExpanded()', () => {
        it('should toggle the value', () => {
            const item = new GroupItem();

            item.toggleExpanded();
            assert.isFalse(item.isExpanded());

            item.toggleExpanded();
            assert.isTrue(item.isExpanded());
        });
    });
});
