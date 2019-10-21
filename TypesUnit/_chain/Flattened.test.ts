import {assert} from 'chai';
import FlattenedChain from 'Types/_chain/Flattened';
import Abstract from 'Types/_chain/Abstract';
import List from 'Types/_collection/List';
import Mock from './ArrayMock';

describe('Types/_chain/Flattened', () => {
    let items: string[];
    let prev: Abstract<string>;

    beforeEach(() => {
        items = ['one', 'two', 'three'];
        prev = new Mock(items);
    });

    afterEach(() => {
        items = undefined;
        prev = undefined;
    });

    describe('.getEnumerator()', () => {
        it('should return a valid enumerator', () => {
            const chain = new FlattenedChain(prev);
            const enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
        });

        it('should return an enumerator with flat items', () => {
            const chain = new FlattenedChain(prev);
            const enumerator = chain.getEnumerator();
            let index = 0;

            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), items[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), index);
                index++;
            }
            assert.strictEqual(index, items.length);
        });

        it('should return an enumerator with flat items after reset', () => {
            const chain = new FlattenedChain(prev);
            const enumerator = chain.getEnumerator();

            enumerator.moveNext();
            enumerator.reset();

            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), items[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), index);
                index++;
            }
            assert.strictEqual(index, items.length);
        });

        it('should return an enumerator with nesting arrays', () => {
            const items = ['one', ['two', [['three']]]];
            const expect = ['one', 'two', 'three'];
            const prev = new Mock(items);
            const chain = new FlattenedChain(prev);
            const  enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), expect[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), index);
                index++;
            }
            assert.strictEqual(index, expect.length);
        });

        it('should return an enumerator which works well with empty arrays by the way', () => {
            const items = [[], 1, [2, 3]];
            const expect = [1, 2, 3];
            const prev = new Mock(items);
            const chain = new FlattenedChain(prev);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), expect[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), index);
                index++;
            }
            assert.strictEqual(index, expect.length);
        });

        it('should return an enumerator with nesting IEnumerable', () => {
            const items = [
                'one',
                new List({items: ['two', [['three']]]}),
            ];
            const expect = ['one', 'two', 'three'];
            const prev = new Mock(items);
            const chain = new FlattenedChain(prev);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), expect[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), index);
                index++;
            }
            assert.strictEqual(index, expect.length);
        });
    });
});
