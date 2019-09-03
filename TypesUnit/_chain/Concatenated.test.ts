import {assert} from 'chai';
import Concatenated from 'Types/_chain/Concatenated';
import Abstract from 'Types/_chain/Abstract';
import List from 'Types/_collection/List';
import Mock from './ArrayMock';

describe('Types/_chain/Concatenated', () => {
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
            const chain = new Concatenated(prev, undefined);
            const enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
        });

        it('should return an enumerator with concatenated items', () => {
            const toConcat = [['4', '5'], ['6', '7']];
            const expect = ['one', 'two', 'three', '4', '5', '6', '7'];
            const chain = new Concatenated(prev, toConcat);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), expect[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), index);
                index++;
            }
            assert.strictEqual(index, expect.length);
        });

        it('should return an enumerator with concatenated items include IEnumerable', () => {
            const toConcat = [['4', '5'], new List({items: ['6', '7']})];
            const expect = ['one', 'two', 'three', '4', '5', '6', '7'];
            const chain = new Concatenated(prev, toConcat);
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
