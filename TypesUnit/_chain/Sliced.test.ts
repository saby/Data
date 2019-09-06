import {assert} from 'chai';
import Sliced from 'Types/_chain/Sliced';
import Abstract from 'Types/_chain/Abstract';
import ArrayMock from './ArrayMock';

describe('Types/_chain/Sliced', () => {
    let items: string[];
    let prev: Abstract<string>;

    beforeEach(() => {
        items = ['one', 'two', 'three'];
        prev = new ArrayMock(items);
    });

    afterEach(() => {
        items = undefined;
        prev = undefined;
    });

    describe('.getEnumerator()', () => {
        it('should return a valid enumerator', () => {
            const chain = new Sliced(prev, 0, 0);
            const enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
        });

        it('should return an enumerator with first item', () => {
            const begin = 0;
            const end = 1;
            const expect = ['one'];
            const chain = new Sliced(prev, begin, end);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), expect[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), index);
                index++;
            }
            assert.strictEqual(index, expect.length);

            assert.strictEqual(enumerator.getCurrent(), expect[index - 1]);
            assert.strictEqual(enumerator.getCurrentIndex(), index - 1);
        });

        it('should return an enumerator with second item', () => {
            const begin = 1;
            const end = 2;
            const expect = ['two'];
            const chain = new Sliced(prev, begin, end);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), expect[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), items.indexOf(enumerator.getCurrent()));
                index++;
            }
            assert.strictEqual(index, expect.length);

            assert.strictEqual(enumerator.getCurrent(), expect[index - 1]);
            assert.strictEqual(enumerator.getCurrentIndex(), items.indexOf(enumerator.getCurrent()));
        });

        it('should return an enumerator with first and second items', () => {
            const begin = 0;
            const end = 2;
            const expect = ['one', 'two'];
            const chain = new Sliced(prev, begin, end);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), expect[index]);
                assert.strictEqual(enumerator.getCurrentIndex(), items.indexOf(enumerator.getCurrent()));
                index++;
            }
            assert.strictEqual(index, expect.length);

            assert.strictEqual(enumerator.getCurrent(), expect[index - 1]);
            assert.strictEqual(enumerator.getCurrentIndex(), items.indexOf(enumerator.getCurrent()));
        });

        it('should return an enumerator with no items', () => {
            const chainA = new Sliced(prev, 3, 4);
            assert.isFalse(chainA.getEnumerator().moveNext());

            const chainB = new Sliced(prev, 0, 0);
            assert.isFalse(chainB.getEnumerator().moveNext());

            const chainC = new Sliced(prev, 1, 1);
            assert.isFalse(chainC.getEnumerator().moveNext());

            const chainD = new Sliced(prev, 1, 0);
            assert.isFalse(chainD.getEnumerator().moveNext());
        });
    });
});
