import {assert} from 'chai';
import Sorted from 'Types/_chain/Sorted';
import Abstract from 'Types/_chain/Abstract';
import ArrayMock from './ArrayMock';
import ObjectMock, {IItems} from './ObjectMock';

describe('Types/_chain/Sorted', () => {
    let itemsArray: number[];
    let itemsObject: IItems<number>;
    let prevArray: Abstract<number>;
    let prevObject: Abstract<number>;

    beforeEach(() => {
        itemsArray = [1, 3, 2];
        itemsObject = {a: 1, c: 3, b: 2};
        prevArray = new ArrayMock(itemsArray);
        prevObject = new ObjectMock(itemsObject);
    });

    afterEach(() => {
        itemsArray = undefined;
        itemsObject = undefined;
        prevArray = undefined;
        prevObject = undefined;
    });

    describe('.getEnumerator()', () => {
        it('should return a valid enumerator for Array', () => {
            const chain = new Sorted(prevArray);
            const enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
        });

        it('should return a valid enumerator for Object', () => {
            const chain = new Sorted(prevObject);
            const enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
        });

        it('should enum values in direct order for Array', () => {
            const chain = new Sorted(prevArray);
            const enumerator = chain.getEnumerator();
            const sortedItems = itemsArray.slice().sort();

            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), sortedItems[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), index);
                index++;
            }
            assert.strictEqual(index, itemsArray.length);
        });

        it('should enum pairs in direct order for Object', () => {
            const chain = new Sorted(prevObject);
            const enumerator = chain.getEnumerator();
            const keys = Object.keys(itemsObject);
            const pairs = keys.reduce((prev, current) => {
                prev[itemsObject[current]] = current;
                return prev;
            }, {});
            const sortedItems = keys.map((key) => itemsObject[key]).sort();

            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), sortedItems[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), pairs[enumerator.getCurrent()]);
                index++;
            }
            assert.strictEqual(index, keys.length);
        });

        it('should enum strings in direct order for Array', () => {
            const itemsArray = ['a', 'w', 'e', 's', 'o', 'me'];
            const sortedItems = itemsArray.slice();
            const prevArray = new ArrayMock(itemsArray);
            const chain = new Sorted(prevArray);
            const enumerator = chain.getEnumerator();

            sortedItems.sort();
            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), sortedItems[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), index);
                index++;
            }
            assert.strictEqual(index, itemsArray.length);
        });

        it('should enum objects in direct order for Array', () => {
            const itemsArray = [{name: 'x'}, {name: 'a'}, {name: 'f'}];
            const sortedItems = itemsArray.slice();
            const compare = (a, b) => a.name - b.name;
            const prevArray = new ArrayMock(itemsArray);
            const chain = new Sorted(prevArray, compare);
            const enumerator = chain.getEnumerator();

            sortedItems.sort(compare);
            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), sortedItems[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), index);
                index++;
            }
            assert.strictEqual(index, itemsArray.length);
        });

        it('should enum numbers in direct order use compareFunction for Array', () => {
            const sortedItems = itemsArray.slice();
            const compare = (a, b) => a - b;
            const chain = new Sorted(prevArray, compare);
            const enumerator = chain.getEnumerator();

            sortedItems.sort(compare);
            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), sortedItems[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), index);
                index++;
            }
            assert.strictEqual(index, itemsArray.length);
        });

        it('should enum numbers in reverse order', () => {
            const sortedItems = itemsArray.slice();
            const compare = (a, b) => b - a;
            const chain = new Sorted(prevArray, compare);
            const enumerator = chain.getEnumerator();

            sortedItems.sort(compare);
            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), sortedItems[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), index);
                index++;
            }
            assert.strictEqual(index, itemsArray.length);
        });

        it('should enum numbers in direct order after reset', () => {
            const sortedItems = itemsArray.slice();
            const chain = new Sorted(prevArray);
            const enumerator = chain.getEnumerator();

            sortedItems.sort();

            enumerator.moveNext();
            enumerator.reset();

            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), sortedItems[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), index);
                index++;
            }
            assert.strictEqual(index, itemsArray.length);
        });
    });
});
