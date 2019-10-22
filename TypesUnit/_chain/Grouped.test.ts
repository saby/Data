import {assert} from 'chai';
import GroupedChain from 'Types/_chain/Grouped';
import ArrayMock from './ArrayMock';
import ObjectMock from './ObjectMock';

describe('Types/_chain/Grouped', () => {
    describe('.getEnumerator()', () => {
        it('should return a valid enumerator', () => {
            const prev = new ArrayMock([]);
            const chain = new GroupedChain(prev);
            const enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.isUndefined(enumerator.getCurrentIndex());
        });

        it('should group array of string', () => {
            const items = ['one', 'two', 'three', 'two'];
            const prev = new ArrayMock(items);
            const chain = new GroupedChain(prev);
            const enumerator = chain.getEnumerator();
            const expectedKeys = [
                'one',
                'two',
                'three'
            ];
            const expectedValues = [
                ['one'],
                ['two', 'two'],
                ['three']
            ];

            let index = 0;
            while (enumerator.moveNext()) {
                assert.deepEqual(enumerator.getCurrent(), expectedValues[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), expectedKeys[index]);
                index++;
            }
            assert.strictEqual(index, expectedKeys.length);
        });

        it('should group object of string', () => {
            const items = {one: 1, two: 2, three: 3, four: 2};
            const prev = new ObjectMock(items);
            const chain = new GroupedChain(prev);
            const enumerator = chain.getEnumerator();
            const expectedKeys = [
                1,
                2,
                3
            ];
            const expectedValues = [
                [1],
                [2, 2],
                [3]
            ];

            let index = 0;
            while (enumerator.moveNext()) {
                assert.deepEqual(enumerator.getCurrent(), expectedValues[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), expectedKeys[index]);
                index++;
            }
            assert.strictEqual(index, expectedKeys.length);
        });

        it('should group by given property', () => {
            const items = [
                {id: 1},
                {id: 2},
                {id: 1},
                {id: 3}
            ];
            const prev = new ArrayMock(items);
            const chain = new GroupedChain(prev, 'id');
            const enumerator = chain.getEnumerator();
            const expectedKeys = [
                1,
                2,
                3
            ];
            const expectedValues = [
                [items[0], items[2]],
                [items[1]],
                [items[3]]
            ];

            let index = 0;
            while (enumerator.moveNext()) {
                assert.deepEqual(enumerator.getCurrent(), expectedValues[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), expectedKeys[index]);
                index++;
            }
            assert.strictEqual(index, expectedKeys.length);
        });

        it('should group and map by given property', () => {
            const items = [
                {id: 1, value: 'one'},
                {id: 2, value: 'two'},
                {id: 1, value: 'three'},
                {id: 3, value: 'four'}
            ];
            const prev = new ArrayMock(items);
            const chain = new GroupedChain(prev, 'id', 'value');
            const enumerator = chain.getEnumerator();
            const expectedKeys = [
                1,
                2,
                3
            ];
            const expectedValues = [
                ['one', 'three'],
                ['two'],
                ['four']
            ];

            let index = 0;
            while (enumerator.moveNext()) {
                assert.deepEqual(enumerator.getCurrent(), expectedValues[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), expectedKeys[index]);
                index++;
            }
            assert.strictEqual(index, expectedKeys.length);
        });

        it('should group by given key handler', () => {
            const items = [1, 2, 3, 4, 5];
            const prev = new ArrayMock(items);
            const chain = new GroupedChain(prev, (item) => item % 2 === 0 ? 'even' : 'odd');
            const enumerator = chain.getEnumerator();
            const expectedKeys = [
                'odd',
                'even'
            ];
            const expectedValues = [
                [1, 3, 5],
                [2, 4]
            ];

            let index = 0;
            while (enumerator.moveNext()) {
                assert.deepEqual(enumerator.getCurrent(), expectedValues[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), expectedKeys[index]);
                index++;
            }
            assert.strictEqual(index, expectedKeys.length);
        });

        it('should group by given map handler', () => {
            const items = [1, 2, 3, 4, 5];
            const prev = new ArrayMock(items);
            const chain = new GroupedChain(
                prev,
                (item) => item % 2 === 0 ? 'even' : 'odd',
                (item) => item * item
            );
            const enumerator = chain.getEnumerator();
            const expectedKeys = [
                'odd',
                'even'
            ];
            const expectedValues = [
                [1, 9, 25],
                [4, 16]
            ];

            let index = 0;
            while (enumerator.moveNext()) {
                assert.deepEqual(enumerator.getCurrent(), expectedValues[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), expectedKeys[index]);
                index++;
            }
            assert.strictEqual(index, expectedKeys.length);
        });
    });
});
