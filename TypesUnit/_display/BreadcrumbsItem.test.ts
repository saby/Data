import {assert} from 'chai';
import BreadcrumbsItem from 'Types/_display/BreadcrumbsItem';
import TreeItem from 'Types/_display/TreeItem';

describe('Types/_display/BreadcrumbsItem', () => {
    describe('.getContents()', () => {
        it('should return tree branch', () => {
            const items = [];
            items[0] = new TreeItem({
                contents: 'a'
            });
            items[1] = new TreeItem({
                parent: items[0],
                contents: 'b'
            });
            items[2] = new TreeItem({
                parent: items[1],
                contents: 'c'
            });
            const expected = [['a'], ['a', 'b'], ['a', 'b', 'c']];

            items.forEach((item, index) => {
                const bcItem = new BreadcrumbsItem({
                    last: item
                });
                assert.deepEqual(bcItem.getContents(), expected[index]);
            });
        });

        it('should return tree branch with root', () => {
            const root = new TreeItem({
                contents: 'root'
            });
            const owner = {
                getRoot: () => {
                    return null;
                }
            };
            const item = new TreeItem({
                parent: root,
                contents: 'a'
            });
            const bcItem = new BreadcrumbsItem<string[] | string>({
                owner: owner as any,
                last: item
            });
            assert.deepEqual(bcItem.getContents(), ['root', 'a']);
        });

        it('should return tree branch without root', () => {
            const root = new TreeItem({
                contents: 'root'
            });
            const owner = {
                getRoot: () => {
                    return root;
                }
            };
            const item = new TreeItem({
                parent: root,
                contents: 'a'
            });
            const bcItem = new BreadcrumbsItem<string[] | string>({
                owner: owner as any,
                last: item
            });
            assert.deepEqual(bcItem.getContents(), ['a']);
        });
    });

    describe('.getLevel()', () => {
        it('should return 0 by default', () => {
            const item = new BreadcrumbsItem();
            assert.strictEqual(item.getLevel(), 0);
        });

        it('should return 1 if owner contains enumerable root', () => {
            const root = new TreeItem({
                contents: 'root'
            });
            const owner = {
                getRoot: () => {
                    return root;
                },
                isRootEnumerable: () => {
                    return true;
                }
            };
            const last = new TreeItem({
                owner: owner as any,
                contents: 'last'
            });
            const item = new BreadcrumbsItem({
                owner: owner as any,
                last
            });
            assert.strictEqual(item.getLevel(), 1);
        });
    });
});
