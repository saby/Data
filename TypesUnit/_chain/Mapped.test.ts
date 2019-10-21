import {assert} from 'chai';
import MappedChain from 'Types/_chain/Mapped';
import Abstract from 'Types/_chain/Abstract';
import ArrayMock from './ArrayMock';
import ObjectMock from './ObjectMock';

describe('Types/_chain/Mapped', () => {
    let items: string[];
    let prev: Abstract<string>;

    beforeEach(() => {
        items = ['one', 'two'];
        prev = new ArrayMock(items);
    });

    afterEach(() => {
        items = undefined;
        prev = undefined;
    });

    describe('.getEnumerator()', () => {
        it('should return a valid enumerator', () => {
            const map = () => undefined;
            const mapContext = {};
            const chain = new MappedChain(prev, map, mapContext);
            const enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
        });

        it('should return an enumerator with valid values for Array', () => {
            const map = (item, index) => [item, index];
            const mapContext = {};
            const chain = new MappedChain(prev, map, mapContext);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                assert.deepEqual(enumerator.getCurrent(), [items[index], index] as any);
                assert.strictEqual(enumerator.getCurrentIndex(), index);
                index++;
            }
            assert.strictEqual(index, items.length);

            assert.deepEqual(enumerator.getCurrent(), [items[index - 1], index - 1] as any);
            assert.strictEqual(enumerator.getCurrentIndex(), index - 1);
        });

        it('should return an enumerator with valid values for Object', () => {
            const items = {foo: 'one', bar: 'two'};
            const keys = Object.keys(items);
            const prev = new ObjectMock(items);
            const chain = new MappedChain(prev, (val, key) => [val, key]);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrentIndex(), keys[index]);
                assert.deepEqual(
                    enumerator.getCurrent(),
                    [items[enumerator.getCurrentIndex()], enumerator.getCurrentIndex()] as any,
                );
                index++;
            }
            assert.strictEqual(index, keys.length);
        });

        it('should return an enumerator and reset it', () => {
            const map = (item) => [item];
            const mapContext = {};
            const chain = new MappedChain(prev, map, mapContext);
            const enumerator = chain.getEnumerator();

            enumerator.moveNext();
            enumerator.reset();

            let index = 0;
            while (enumerator.moveNext()) {
                assert.deepEqual(enumerator.getCurrent(), [items[index]] as any);
                assert.strictEqual(enumerator.getCurrentIndex(), index);
                index++;
            }
            assert.strictEqual(index, items.length);

            assert.deepEqual(enumerator.getCurrent(), [items[index - 1]] as any);
            assert.strictEqual(enumerator.getCurrentIndex(), index - 1);
        });
    });
});
