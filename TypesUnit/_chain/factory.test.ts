import {assert} from 'chai';
import chain from 'Types/_chain/factory';
import Abstract from 'Types/_chain/Abstract';
import Arraywise from 'Types/_chain/Arraywise';
import Objectwise from 'Types/_chain/Objectwise';
import Counted from 'Types/_chain/Counted';
import Enumerable from 'Types/_chain/Enumerable';
import List from 'Types/_collection/List';

class Foo<T> extends Abstract<T> {
    constructor(source: Abstract<T> | any) {
        super(source);
    }
}

describe('Types/_chain/factory', () => {
    describe('.constructor()', () => {
        it('should return chain back', () => {
            const abstractChain = new Foo({} as any);
            assert.strictEqual(chain(abstractChain), abstractChain);
        });

        it('should return Arraywise', () => {
            assert.instanceOf(chain([]), Arraywise);
        });

        it('should return Objectwise', () => {
            assert.instanceOf(chain({}), Objectwise);
        });

        it('should return Enumerable', () => {
            assert.instanceOf(chain(new List()), Enumerable);
        });
    });

    describe('.group()', () => {
        it('should group elements', () => {
            const result = chain([
                {title: 'Apple', kind: 'fruit'},
                {title: 'Cherry', kind: 'fruit'},
                {title: 'Cucumber', kind: 'vegetable'},
                {title: 'Pear', kind: 'fruit'},
                {title: 'Potato', kind: 'vegetable'},
            ]).group('kind', 'title').toObject();

            assert.deepEqual(result, {
                fruit: ['Apple', 'Cherry', 'Pear'],
                vegetable: ['Cucumber', 'Potato'],
            });
        });
    });

    describe('.count()', () => {
        it('should count all elements', () => {
            const result = chain([1, 2, 3]).count();
            assert.equal(result, 3);
        });

        it('should count aggregated elements', () => {
            const result = (chain([1, 2, 3]).count(
                (item) => item % 2 === 0,
            ) as Counted<number>).value();
            assert.deepEqual(result, [2, 1]);
        });
    });

    describe('.max()', () => {
        it('should return maximum value', () => {
            const result = chain([1, 2, 3]).max();
            assert.equal(result, 3);
        });

        it('should return first value', () => {
            const result = chain([2]).max();
            assert.equal(result, 2);
        });

        it('should return undefined for empty collection', () => {
            const result = chain([]).max();
            assert.isUndefined(result);
        });
    });

    describe('.min()', () => {
        it('should return minimum value', () => {
            const result = chain([1, 2, 3]).min();
            assert.equal(result, 1);
        });

        it('should return first value', () => {
            const result = chain([2]).min();
            assert.equal(result, 2);
        });

        it('should return undefined for empty collection', () => {
            const result = chain([]).min();
            assert.isUndefined(result);
        });
    });
});
