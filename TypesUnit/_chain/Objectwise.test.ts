import {assert} from 'chai';
import Objectwise from 'Types/_chain/Objectwise';

describe('Types/_chain/Objectwise', () => {
    let items;
    let chain;

    beforeEach(() => {
        items = {one: 1, two: 2, three: 3};
        chain = new Objectwise(items);
    });

    afterEach(() => {
        chain.destroy();
        chain = undefined;
        items = undefined;
    });

    describe('.constructor()', () => {
        it('should throw an error on invalid argument', () => {
            let chain;

            assert.throws(() => {
                chain = new Objectwise(undefined);
            }, TypeError);
            assert.throws(() => {
                chain = new Objectwise('' as any);
            }, TypeError);
            assert.throws(() => {
                chain = new Objectwise(0 as any);
            }, TypeError);
            assert.throws(() => {
                chain = new Objectwise(null);
            }, TypeError);

            assert.isUndefined(chain);
        });
    });

    describe('.getEnumerator()', () => {
        it('should return enumerator with all items', () => {
            const enumerator = chain.getEnumerator();
            const result = {};
            while (enumerator.moveNext()) {
                result[enumerator.getCurrentIndex()] = enumerator.getCurrent();
            }
            assert.deepEqual(result, items);
        });
    });

    describe('.each()', () => {
        it('should return all items', () => {
            const keys = Object.keys(items);
            let count = 0;
            chain.each((item, key) => {
                assert.strictEqual(item, items[key]);
                assert.strictEqual(key, keys[count]);
                count++;
            });
            assert.strictEqual(count, keys.length);
        });
    });

    describe('.value()', () => {
        it('should return equal object', () => {
            assert.deepEqual(chain.value(), items);
        });

        it('should return type from given factory', () => {
            const Type = function(items: any): void {
                this.items = items;
            };
            const factory = (items) => {
                return new Type(items);
            };

            const result = chain.value(factory);
            assert.instanceOf(result, Type);
            assert.instanceOf(result.items, Objectwise);
        });
    });

    describe('.toArray()', () => {
        it('should return all object values', () => {
            const arr = [];
            for (const key in items) {
                if (items.hasOwnProperty(key)) {
                    arr.push(items[key]);
                }
            }
            assert.deepEqual(chain.toArray(), arr);
        });
    });

    describe('.toObject()', () => {
        it('should return equal object', () => {
            assert.deepEqual(chain.toObject(), items);
        });
    });

    describe('.reduce()', () => {
        it('should return sum of values', () => {
            const result = chain.reduce((prev, curr) => prev + curr, 0);
            assert.strictEqual(result, 1 + 2 + 3);
        });

        it('should return concatenation of keys', () => {
            const result = chain.reduce((prev, curr, index) => prev + index, '');
            assert.strictEqual(result, 'one' + 'two' + 'three');
        });
    });

    describe('.map()', () => {
        it('should map chain as keys', () => {
            const keys = Object.keys(items);
            let index = 0;
            chain.map((value, key) => key).each((item, key) => {
                assert.strictEqual(item, keys[index]);
                assert.strictEqual(key, keys[index]);
                index++;
            });
            assert.strictEqual(index, keys.length);
        });

        it('should map chain as values', () => {
            const keys = Object.keys(items);
            let index = 0;
            chain.map((item) => item).each((item) => {
                assert.strictEqual(item, items[keys[index]]);
                index++;
            });
            assert.strictEqual(index, keys.length);
        });
    });

    describe('.filter()', () => {
        it('should filter chain by item', () => {
            let index = 0;
            chain.filter((item) => item === 3).each((item) => {
                assert.strictEqual(item, 3);
                index++;
            });
            assert.strictEqual(index, 1);
        });

        it('should filter chain by index', () => {
            let index = 0;
            chain.filter((item, index) => index === 'two').each((item) => {
                assert.strictEqual(item, 2);
                index++;
            });
            assert.strictEqual(index, 1);
        });
    });
});
