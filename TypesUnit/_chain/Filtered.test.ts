import {assert} from 'chai';
import FilteredChain from 'Types/_chain/Filtered';
import Abstract from 'Types/_chain/Abstract';
import Mock from './ArrayMock';

describe('Types/_chain/Filtered', () => {
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
            const filter = () => undefined;
            const filterContext = {};
            const chain = new FilteredChain(prev, filter, filterContext);
            const enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
        });

        it('should return an enumerator with next value', () => {
            const filter = (item) => item === 'one' || item === 'three';
            const expect = ['one', 'three'];
            const filterContext = {};
            const chain = new FilteredChain(prev, filter, filterContext);
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

        it('should return an enumerator and reset it', () => {
            const filter = (item) => item === 'one' || item === 'three';
            const expect = ['one', 'three'];
            const filterContext = {};
            const chain = new FilteredChain(prev, filter, filterContext);
            const enumerator = chain.getEnumerator();

            enumerator.moveNext();
            enumerator.reset();

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
    });
});
