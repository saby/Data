import {assert} from 'chai';
import Enumerable from 'Types/_chain/Enumerable';
import Record from 'Types/_entity/Record';
import List from 'Types/_collection/List';

describe('Types/_chain/Enumerable', () => {
    let data: {[name: string]: number};
    let items;
    let chain;

    beforeEach(() => {
        data = {one: 1, two: 2, three: 3};
        items = new Record({rawData: data});
        chain = new Enumerable(items);
    });

    afterEach(() => {
        chain.destroy();
        chain = undefined;
        items.destroy();
        items = undefined;
        data = undefined;
    });

    describe('.constructor()', () => {
        it('should throw an error on invalid argument', () => {
            let chain;

            assert.throws(() => {
                chain = new Enumerable(undefined);
            }, TypeError);
            assert.throws(() => {
                chain = new Enumerable([]);
            }, TypeError);
            assert.throws(() => {
                chain = new Enumerable({});
            }, TypeError);
            assert.throws(() => {
                chain = new Enumerable('');
            }, TypeError);
            assert.throws(() => {
                chain = new Enumerable(0);
            }, TypeError);
            assert.throws(() => {
                chain = new Enumerable(null);
            }, TypeError);

            assert.isUndefined(chain);
        });
    });

    describe('.getEnumerator()', () => {
        it('should return enumerator with all properties', () => {
            const enumerator = chain.getEnumerator();
            const keys = Object.keys(data);
            let index = 0;
            while (enumerator.moveNext()) {
                assert.equal(enumerator.getCurrent(), keys[index]);
                index++;
            }
            assert.deepEqual(index, keys.length);
        });
    });

    describe('.each()', () => {
        it('should return all properties and values', () => {
            const keys = Object.keys(data);
            let index = 0;
            chain.each((key, value) => {
                assert.equal(key, keys[index]);
                assert.equal(value, data[key]);
                index++;
            });
            assert.strictEqual(index, keys.length);
        });
    });

    describe('.toArray()', () => {
        it('should return all properties for Record', () => {
            assert.deepEqual(chain.toArray(), Object.keys(data));
        });

        it('should return all items for List', () => {
            const data = ['one', 'two', 'three'];
            const items = new List({items: data});
            const chain = new Enumerable(items);

            assert.deepEqual(chain.toArray(), data);
        });
    });

    describe('.toObject()', () => {
        it('should return equal object for Record', () => {
            assert.deepEqual(chain.toObject(), data);
        });

        it('should return all items for List', () => {
            const data = ['one', 'two', 'three'];
            const items = new List({items: data});
            const chain = new Enumerable(items);
            const obj = chain.toObject();

            for (let i = 0; i < data.length; i++) {
                assert.strictEqual(obj[i], data[i]);
            }
        });
    });
});
