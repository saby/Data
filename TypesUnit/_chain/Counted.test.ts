import {assert} from 'chai';
import Counted from 'Types/_chain/Counted';
import ArrayMock from './ArrayMock';

describe('Types/_chain/Counted', () => {
    describe('.getEnumerator()', () => {
        it('should return a valid enumerator', () => {
            const prev = new ArrayMock([]);
            const chain = new Counted(prev);
            const enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.isUndefined(enumerator.getCurrentIndex());
        });

        it('should count array of primitives', () => {
            const items = ['one', 'two', 'three', 'two'];
            const prev = new ArrayMock(items);
            const chain = new Counted(prev);
            const enumerator = chain.getEnumerator();
            const expectedKeys = [
                'one',
                'two',
                'three'
            ];
            const expectedValues = [
                1,
                2,
                1
            ];

            let index = 0;
            while (enumerator.moveNext()) {
                assert.deepEqual(enumerator.getCurrent(), expectedValues[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), expectedKeys[index]);
                index++;
            }
            assert.strictEqual(index, expectedKeys.length);
        });

        it('should count by given property', () => {
            const items = [
                {id: 1},
                {id: 1},
                {id: 3},
                {id: 2}
            ];
            const prev = new ArrayMock(items);
            const chain = new Counted(prev, 'id');
            const enumerator = chain.getEnumerator();
            const expectedKeys = [
                1,
                3,
                2
            ];
            const expectedValues = [
                2,
                1,
                1
            ];

            let index = 0;
            while (enumerator.moveNext()) {
                assert.deepEqual(enumerator.getCurrent(), expectedValues[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), expectedKeys[index]);
                index++;
            }
            assert.strictEqual(index, expectedKeys.length);
        });

        it('should count by given handler', () => {
            const items = [1, 2, 3, 4, 5];
            const prev = new ArrayMock(items);
            const chain = new Counted(prev, (item) => item % 2 === 0 ? 'even' : 'odd');
            const enumerator = chain.getEnumerator();
            const expectedKeys = [
                'odd',
                'even'
            ];
            const expectedValues = [
                3,
                2
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
