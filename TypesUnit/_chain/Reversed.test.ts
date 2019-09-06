import {assert} from 'chai';
import Reversed from 'Types/_chain/Reversed';
import Abstract from 'Types/_chain/Abstract';
import ObjectMock, {IItems} from './ObjectMock';
import ArrayMock from './ArrayMock';

describe('Types/_chain/Reversed', () => {
    let itemsObject: IItems<number>;
    let itemsArray: number[];
    let prevObject: Abstract<number>;
    let prevArray: Abstract<number>;

    beforeEach(() => {
        itemsObject = {a: 1, b: 2};
        itemsArray = [1, 2];
        prevObject = new ObjectMock(itemsObject);
        prevArray = new ArrayMock(itemsArray);
    });

    afterEach(() => {
        prevObject = undefined;
        prevArray = undefined;
        itemsObject = undefined;
        itemsArray = undefined;
    });

    describe('.getEnumerator()', () => {
        it('should return a valid enumerator for Object', () => {
            const chain = new Reversed(prevObject);
            const enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
        });

        it('should return a valid enumerator for Array', () => {
            const chain = new Reversed(prevArray);
            const enumerator = chain.getEnumerator();

            assert.isUndefined(enumerator.getCurrent());
            assert.equal(enumerator.getCurrentIndex(), -1);
        });

        it('should return an enumerator with next value for Object', () => {
            const chain = new Reversed(prevObject);
            const enumerator = chain.getEnumerator();
            const keys = Object.keys(itemsObject).reverse();

            let key;
            let index = 0;
            while (enumerator.moveNext()) {
                key = keys[index];
                assert.strictEqual(enumerator.getCurrent(), itemsObject[key]);
                assert.strictEqual(enumerator.getCurrentIndex(), key);
                index++;
            }
        });

        it('should return an enumerator with next value for Array', () => {
            const chain = new Reversed(prevArray);
            const enumerator = chain.getEnumerator();
            const max = itemsArray.length - 1;

            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), itemsArray[max - index]);
                assert.strictEqual(enumerator.getCurrentIndex(), index);
                index++;
            }
            assert.strictEqual(index, itemsArray.length);

            assert.strictEqual(enumerator.getCurrent(), itemsArray[0]);
            assert.strictEqual(enumerator.getCurrentIndex(), max);
        });

        it('should return an enumerator and reset it', () => {
            const chain = new Reversed(prevArray);
            const enumerator = chain.getEnumerator();
            const max = itemsArray.length - 1;

            let index = 0;
            enumerator.moveNext();
            enumerator.reset();
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), itemsArray[max - index]);
                assert.strictEqual(enumerator.getCurrentIndex(), index);
                index++;
            }
            assert.strictEqual(index, itemsArray.length);

            assert.strictEqual(enumerator.getCurrent(), itemsArray[0]);
            assert.strictEqual(enumerator.getCurrentIndex(), max);
        });
    });
});
