import {assert} from 'chai';
import {SetPolyfill} from 'Types/_shim/Set';

describe('Types/_shim/Set:SetPolyfill', () => {
    let set: SetPolyfill<string>;

    beforeEach(() => {
        set = new SetPolyfill();
    });

    afterEach(() => {
        set = undefined;
    });

    describe('.size', () => {
        it('should return 0 by default', () => {
            assert.strictEqual(set.size, 0);
        });

        it('should return new size after set new entry', () => {
            set.add('foo');
            assert.strictEqual(set.size, 1);
        });

        it('should return new size after delete entry', () => {
            set.add('foo');
            set.delete('foo');
            assert.strictEqual(set.size, 0);
        });
    });

    describe('.add()', () => {
        it('should set a new entry', () => {
            set.add('foo');
            assert.isTrue(set.has('foo'));
        });

        it('should set a new Object', () => {
            const set = new SetPolyfill();
            const foo = {};
            set.add(foo);
            assert.isTrue(set.has(foo));

            const bar = {};
            set.add(bar);
            assert.isTrue(set.has(bar));
        });
    });

    describe('.clear()', () => {
        it('should reset the size', () => {
            set.add('foo');
            set.clear();
            assert.strictEqual(set.size, 0);
        });
    });

    describe('.delete()', () => {
        it('should delete the entry', () => {
            set.add('foo');
            const result = set.delete('foo');
            assert.isFalse(set.has('foo'));
            assert.isTrue(result);
        });

        it('should do nothing for not exists entry', () => {
            const result = set.delete('foo');
            assert.isFalse(set.has('foo'));
            assert.isFalse(result);
        });

        it('should delete the Object', () => {
            const set = new SetPolyfill();
            const foo = {};
            set.add(foo);
            set.delete(foo);
            assert.isFalse(set.has(foo));
        });

        it('should do nothing for not exists Object', () => {
            const set = new SetPolyfill();
            const foo = {};
            set.delete(foo);
            assert.isFalse(set.has(foo));
        });

        it('should not found item in foreach', () => {
            const set = new SetPolyfill();
            const foo = {};
            set.add(foo);
            set.add('bar');
            set.delete(foo);

            let count = 0;
            set.forEach(() => {
                count++;
            });
            assert.equal(count, 1);
        });
    });

    describe('.entries()', () => {
        it('should throw an Error', () => {
            assert.throws(() => {
                set.entries();
            });
        });
    });

    describe('.forEach()', () => {
        it('should invoke callback for each entry', () => {
            const set = new SetPolyfill();
            const baz = {};
            const expect = ['foo', 'bar', baz];

            set.add('foo');
            set.add('bar');
            set.add(baz);

            let index = 0;
            set.forEach((item, key) => {
                assert.strictEqual(item, expect[index]);
                assert.strictEqual(key, expect[index]);
                index++;
            });
            assert.equal(index, expect.length);
        });

        it('should invoke callback with given context', () => {
            const context = {};

            set.add('foo');
            set.forEach(function(): void {
                assert.strictEqual(this, context);
            }, context);
        });
    });

    describe('.has()', () => {
        it('should return true for exists entry', () => {
            set.add('foo');
            assert.isTrue(set.has('foo'));
        });

        it('should return true for exists Object', () => {
            const set = new SetPolyfill();
            const foo = {};
            set.add(foo);
            assert.isTrue(set.has(foo));
        });

        it('should return false for not exists entry', () => {
            assert.isFalse(set.has('foo'));
        });

        it('should correct work with null', () => {
            assert.isFalse(set.has(null));
            set.add(null);
            assert.isTrue(set.has(null));
            assert.isFalse(set.has('null'));
        });
    });

    describe('.keys()', () => {
        it('should throw an Error', () => {
            assert.throws(() => {
                set.keys();
            });
        });
    });

    describe('.values()', () => {
        it('should throw an Error', () => {
            assert.throws(() => {
                set.keys();
            });
        });
    });
});
