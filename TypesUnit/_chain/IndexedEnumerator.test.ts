import {assert} from 'chai';
import IndexedEnumerator from 'Types/_chain/IndexedEnumerator';
import Abstract from 'Types/_chain/Abstract';
import ArrayMock from './ArrayMock';

describe('Types/_chain/IndexedEnumerator', () => {
    let items: string[];
    let prev: Abstract<string>;

    beforeEach(() => {
        items = ['a', 'b', 'c'];
        prev = new ArrayMock(items);
    });

    afterEach(() => {
        items = undefined;
        prev = undefined;
    });

    describe('.getCurrent()', () => {
        it('should return undefined by default', () => {
            const enumerator = new IndexedEnumerator(prev);
            assert.isUndefined(enumerator.getCurrent());
        });
    });

    describe('.getCurrentIndex()', () => {
        it('should return -1 by default', () => {
            const enumerator = new IndexedEnumerator(prev);
            assert.equal(enumerator.getCurrentIndex(), -1);
        });
    });

    describe('.moveNext()', () => {
        it('should enum items with original indices', () => {
            const enumerator = new IndexedEnumerator(prev);

            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), items[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), items.indexOf(enumerator.getCurrent()));
                index++;
            }
            assert.strictEqual(index, items.length);
        });
    });
});
