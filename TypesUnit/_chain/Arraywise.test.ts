import {assert} from 'chai';
import Arraywise from 'Types/_chain/Arraywise';

describe('Types/_chain/Arraywise', () => {
    let items: string[];
    let chain: Arraywise<string>;

    beforeEach(() => {
        items = ['one', 'two', 'three'];
        chain = new Arraywise(items);
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
                chain = new Arraywise(undefined);
            }, TypeError);
            assert.throws(() => {
                chain = new Arraywise({} as any);
            }, TypeError);
            assert.throws(() => {
                chain = new Arraywise('' as any);
            }, TypeError);
            assert.throws(() => {
                chain = new Arraywise(0 as any);
            }, TypeError);
            assert.throws(() => {
                chain = new Arraywise(null);
            }, TypeError);

            assert.isUndefined(chain);
        });
    });

    describe('.start', () => {
        it('should return itself for first element', () => {
            assert.strictEqual(chain.start, chain);
        });

        it('should return first element for second element', () => {
            assert.strictEqual(chain.reverse().start, chain);
        });
    });

    describe('.getEnumerator()', () => {
        it('should return enumerator with all items', () => {
            const enumerator = chain.getEnumerator();
            let index = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), items[index]);
                index++;
            }
            assert.strictEqual(index, items.length);
        });
    });

    describe('.each()', () => {
        it('should return all items', () => {
            let index = 0;
            chain.each((item, itemIndex) => {
                assert.strictEqual(item, items[index]);
                assert.strictEqual(itemIndex, index);
                index++;
            });
            assert.strictEqual(index, items.length);
        });
    });

    describe('.value()', () => {
        it('should return all items as array', () => {
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
            assert.instanceOf(result.items, Arraywise);
        });

        it('should pass arguments to the factory', () => {
            const factory = (...args) => {
                return args;
            };
            const arg1 = 'foo';
            const arg2 = 'bar';
            const result = chain.value(factory, arg1, arg2);

            assert.instanceOf(result[0], Arraywise);
            assert.equal(result[1], arg1);
            assert.equal(result[2], arg2);
        });
    });

    describe('.toArray()', () => {
        it('should return all items', () => {
            assert.deepEqual(chain.toArray(), items);
        });
    });

    describe('.toObject()', () => {
        it('should return array-like items', () => {
            const obj = chain.toObject();
            for (let i = 0; i < items.length; i++) {
                assert.strictEqual(obj[i], items[i]);
            }
        });
    });

    describe('.reduce()', () => {
        it('should return summary', () => {
            const items = [1, 2, 3];
            const chain = new Arraywise(items);
            const result = chain.reduce((prev, curr) => prev + curr);
            assert.strictEqual(result, 1 + 2 + 3);
        });

        it('should return summary with offset', () => {
            const items = [1, 2, 3];
            const chain = new Arraywise(items);
            const result = chain.reduce((prev, curr) => prev + curr, 10);
            assert.strictEqual(result, 10 + 1 + 2 + 3);
        });
    });

    describe('.reduceRight()', () => {
        it('should return division', () => {
            const items = [2, 5, 2, 100];
            const chain = new Arraywise(items);
            const result = chain.reduceRight((prev, curr) => prev / curr);
            assert.strictEqual(result, 100 / 2 / 5 / 2);
        });

        it('should return division with offset', () => {
            const items = [5, 2, 100];
            const chain = new Arraywise(items);
            const result = chain.reduceRight((prev, curr) => prev / curr, 15000);
            assert.strictEqual(result, 15000 / 100 / 2 / 5);
        });
    });

    describe('.map()', () => {
        it('should convert chain to the indices', () => {
            let index = 0;
            chain.map((item, itemIndex) => itemIndex).each((item) => {
                assert.strictEqual(item, index);
                index++;
            });
            assert.strictEqual(index, items.length);
        });

        it('should convert chain to the pairs', () => {
            let index = 0;
            chain.map((item, itemIndex) => [item, itemIndex]).each((item) => {
                assert.strictEqual(item[0], items[index]);
                assert.strictEqual(item[1], index);
                index++;
            });
            assert.strictEqual(index, items.length);
        });
    });

    describe('.zip()', () => {
        it('should zip the collections', () => {
            const expect = [
                ['one', 1, true],
                ['two', 2, true],
                ['three', 3, false],
            ];

            let index = 0;
            chain.zip([1, 2, 3], [true, true, false]).each((item) => {
                assert.deepEqual(item, expect[index]);
                index++;
            });
            assert.strictEqual(index, expect.length);
        });
    });

    describe('.zipObject()', () => {
        it('should zip the collections', () => {
            assert.deepEqual(
                chain.zipObject([1, 2, 3]),
                {one: 1, two: 2, three: 3},
            );
        });
    });

    describe('.pluck()', () => {
        it('should convert chain to the array of sting', () => {
            const items = [{name: 'one'}, {name: 'two'}, {name: 'three'}];
            const chain = new Arraywise(items);

            let index = 0;
            chain.pluck('name').each((item) => {
                assert.strictEqual(item, items[index].name);
                index++;
            });
            assert.strictEqual(index, items.length);
        });
    });

    describe('.invoke()', () => {
        it('should convert chain to the array of sting', () => {
            const items = ['What', 'you', 'see', 'is', 'what', 'you', 'get'];
            const chain = new Arraywise(items);

            let index = 0;
            chain.invoke('substr', 0, 1).each((item) => {
                assert.strictEqual(item, items[index][0]);
                index++;
            });
            assert.strictEqual(index, items.length);
        });
    });

    describe('.concat()', () => {
        it('should concat the chain with the array', () => {
            const items = [1, 2, 3];
            const concat1 = [4, 5];
            const concat2 = [6];
            const expect = [1, 2, 3, 4, 5, 6];
            const chain = new Arraywise(items);

            let index = 0;
            chain.concat(concat1, concat2).each((item) => {
                assert.strictEqual(item, expect[index]);
                index++;
            });
            assert.strictEqual(index, expect.length);
        });
    });

    describe('.flatten()', () => {
        it('should convert nested chain to the array', () => {
            const items = [1, [2], [3, [[4, [5]]]]];
            const expect = [1, 2, 3, 4, 5];
            const chain = new Arraywise(items);

            let index = 0;
            chain.flatten().each((item) => {
                assert.strictEqual(item, expect[index]);
                index++;
            });
            assert.strictEqual(index, expect.length);
        });
    });

    describe('.uniq()', () => {
        it('should return unique items', () => {
            const items = [1, 2, 3, 2, 1, 0];
            const expect = [1, 2, 3, 0];
            const chain = new Arraywise(items);

            let index = 0;
            chain.uniq().each((item) => {
                assert.strictEqual(item, expect[index]);
                index++;
            });
            assert.strictEqual(index, expect.length);
        });

        it('should return items with unique property values', () => {
            const items = [
                {id: 1, title: 'a'},
                {id: 2, title: 'b'},
                {id: 3, title: 'a'},
                {id: 4, title: 'c'},
            ];
            const expect = [1, 2, 4];
            const chain = new Arraywise(items);

            let index = 0;
            chain.uniq((item) => item.title).each((item) => {
                assert.strictEqual(item.id, expect[index]);
                index++;
            });
            assert.strictEqual(index, expect.length);
        });
    });

    describe('.union()', () => {
        it('should union with the array', () => {
            const items = [1, 2, 3];
            const union = [0, 1, 2, 3, 4, 5];
            const expect = [1, 2, 3, 0, 4, 5];
            const chain = new Arraywise(items);

            let index = 0;
            chain.union(union).each((item) => {
                assert.strictEqual(item, expect[index]);
                index++;
            });
            assert.strictEqual(index, expect.length);
        });
    });

    describe('.filter()', () => {
        it('should filter chain by item', () => {
            const expect = ['three'];

            let index = 0;
            chain.filter((item) => item === 'three').each((item) => {
                assert.strictEqual(item, expect[index]);
                index++;
            });
            assert.strictEqual(index, expect.length);
        });

        it('should filter chain by index', () => {
            const expect = ['two'];

            let index = 0;
            chain.filter((item, index) => index === 1).each((item) => {
                assert.strictEqual(item, expect[index]);
                index++;
            });
            assert.strictEqual(index, expect.length);
        });
    });

    describe('.reject()', () => {
        it('should filter chain in negative logic', () => {
            const expect = ['one', 'two'];

            let index = 0;
            chain.reject((item) => item === 'three').each((item) => {
                assert.strictEqual(item, expect[index]);
                index++;
            });
            assert.strictEqual(index, expect.length);
        });
    });

    describe('.where()', () => {
        it('should filter chain in "and" logic', () => {
            const items = [
                {id: 1, title: 'foo', genre: 'bar'},
                {id: 2, title: 'fooz', genre: 'baz'},
                {id: 3, title: 'foo', genre: 'bar'},
                {id: 2, title: 'foox', genre: 'baz'},
            ];
            const expect = [items[0], items[2]];
            const chain = new Arraywise(items);

            const result = chain.where({
                title: 'foo',
                genre: 'bar',
            }).value();
            assert.deepEqual(result, expect);
        });
    });

    describe('.reverse()', () => {
        it('should reverse chain', () => {
            const result = chain.reverse().value();
            const expect = items.slice();

            expect.reverse();
            assert.deepEqual(result, expect);
        });
    });

    describe('.first()', () => {
        it('should return first item', () => {
            assert.equal(chain.first(), items[0]);
        });

        it('should return first "n" items', () => {
            assert.deepEqual(
                chain.first(2).value(),
                items.slice(0, 2),
            );
        });
    });

    describe('.last()', () => {
        it('should return last item', () => {
            assert.equal(chain.last(), items[items.length - 1]);
        });

        it('should return last "n" items', () => {
            assert.deepEqual(chain.last(2).value(), items.slice(-2));
        });
    });

    describe('.sort()', () => {
        it('should sort chain', () => {
            const result = chain.sort().value();
            const expect = items.slice();

            expect.sort();
            assert.deepEqual(result, expect);
        });
    });
});
