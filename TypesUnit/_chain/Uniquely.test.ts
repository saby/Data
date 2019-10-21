import {assert} from 'chai';
import Uniquely from 'Types/_chain/Uniquely';
import Abstract from 'Types/_chain/Abstract';
import ArrayMock from './ArrayMock';

describe('Types/_chain/Uniquely', () => {
    let items: Array<string | number>;
    let prev: Abstract<string | number>;

    beforeEach(() => {
        items = ['one', 'two', 'three', 'two', 1, 2, 'One'];
        prev = new ArrayMock(items);
    });

    afterEach(() => {
        items = undefined;
        prev = undefined;
    });

    describe('.getEnumerator()', () => {
        it('should return a valid enumerator', () => {
            const chain = new Uniquely(prev);
            const enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
        });

        it('should return an enumerator with unique scalars', () => {
            const expect = ['one', 'two', 'three', 1, 2, 'One'];
            const chain = new Uniquely(prev);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), expect[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), items.indexOf(enumerator.getCurrent()));
                index++;
            }
            assert.strictEqual(index, expect.length);
        });

        it('should return an enumerator with unique objects', () => {
            const sameItem = {id: 2};
            const items = [
                {id: 1},
                sameItem,
                {id: 3},
                sameItem,
                {id: 5},
            ];
            const prev = new ArrayMock(items);
            const expect = [1, 2, 3, 5];
            const chain = new Uniquely(prev);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent().id, expect[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), items.indexOf(enumerator.getCurrent()));
                index++;
            }
            assert.strictEqual(index, expect.length);
        });

        it('should return an enumerator with items with unique property value', () => {
            const items = [
                {id: 1, foo: 'bar'},
                {id: 2, foo: 'bar'},
                {id: 3, foo: 'baz'},
                {id: 4, foo: 'bar'},
            ];
            const prev = new ArrayMock(items);
            const expect = [1, 3];
            const chain = new Uniquely(prev, (item) => item.foo);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent().id, expect[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), items.indexOf(enumerator.getCurrent()));
                index++;
            }
            assert.strictEqual(index, expect.length);
        });
    });
});
