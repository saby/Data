import {assert} from 'chai';
import {MapPolyfill} from 'Types/_shim/Map';

describe('Types/_shim/Map:MapPolyfill', () => {
    let map: MapPolyfill<string, string>;

    beforeEach(() => {
        map = new MapPolyfill();
    });

    afterEach(() => {
        map = undefined;
    });

    describe('.size', () => {
        it('should return 0 by default', () => {
            assert.strictEqual(map.size, 0);
        });

        it('should return new size after set new entry', () => {
            map.set('foo', 'bar');
            assert.strictEqual(map.size, 1);
        });

        it('should return new size after set new Object', () => {
            const map = new MapPolyfill();
            const foo = {};
            map.set(foo, 'bar');
            assert.strictEqual(map.size, 1);
        });

        it('should return new size after remove entry', () => {
            map.set('foo', 'bar');
            map.delete('foo');
            assert.strictEqual(map.size, 0);
        });
    });

    describe('.clear()', () => {
        it('should reset the size', () => {
            map.set('foo', 'bar');
            map.clear();
            assert.strictEqual(map.size, 0);
        });

        it('should reset the size with Object', () => {
            const map = new MapPolyfill();
            const foo = {};
            map.set(foo, 'bar');
            map.clear();
            assert.strictEqual(map.size, 0);
        });
    });

    describe('.delete()', () => {
        it('should delete the entry', () => {
            map.set('foo', 'bar');
            const result = map.delete('foo');
            assert.isFalse(map.has('foo'));
            assert.isTrue(result);
        });

        it('should do nothing for not exists entry', () => {
            const result = map.delete('foo');
            assert.isFalse(map.has('foo'));
            assert.isFalse(result);
        });

        it('should delete the Object', () => {
            const map = new MapPolyfill();
            const foo = {};
            map.set(foo, 'bar');
            map.delete(foo);
            assert.isFalse(map.has(foo));
        });

        it('should do nothing for not exists Object', () => {
            const map = new MapPolyfill();
            const foo = {};
            map.delete(foo);
            assert.isFalse(map.has(foo));
        });

        it('should not found item in foreach', () => {
            const map = new MapPolyfill();
            const foo = {};
            let result = false;
            map.set(foo, 'bar');
            map.set('foo', 'bar');
            map.delete(foo);

            map.forEach((item, key) => {
                result = (key === foo || result);
            });
            assert.isFalse(result);
        });
    });

    describe('.entries()', () => {
        it('should throw an Error', () => {
            assert.throws(() => {
                map.entries();
            });
        });
    });

    describe('.forEach()', () => {
        it('should invoke callback for each entry', () => {
            const map = new MapPolyfill();
            const baz = {};
            const expect = [['foo', 'a'], ['bar', 'b'], [baz, 'c'], ['@key', 'f']];

            map.set('foo', 'a');
            map.set('bar', 'b');
            map.set(baz, 'c');
            map.set('@key', 'f');

            let index = 0;
            map.forEach((item, key) => {
                assert.strictEqual(key, expect[index][0]);
                assert.strictEqual(item, expect[index][1]);
                index++;
            });
            assert.equal(index, expect.length);
        });

        it('should invoke callback with given context', () => {
            const context = {};

            map.set('foo', 'bar');
            map.forEach(function(): void {
                assert.strictEqual(this, context);
            }, context);
        });
    });

    describe('.get()', () => {
        it('should return an entry value', () => {
            map.set('foo', 'bar');
            assert.strictEqual(map.get('foo'), 'bar');
        });

        it('should return an Object value', () => {
            const map = new MapPolyfill();
            const foo = {};
            map.set(foo, 'foo');
            assert.strictEqual(map.get(foo), 'foo');

            const bar = {};
            map.set(bar, 'bar');
            assert.strictEqual(map.get(bar), 'bar');
        });

        it('should return undefined if entry is not exists', () => {
            assert.isUndefined(map.get('foo'));
        });

        it('should return undefined if Object is not exists', () => {
            assert.isUndefined(map.get({} as any));
        });
    });

    describe('.has()', () => {
        it('should return true for exists entry', () => {
            map.set('foo', 'bar');
            assert.isTrue(map.has('foo'));
        });

        it('should return true for exists Object', () => {
            const map = new MapPolyfill();
            const foo = {};
            map.set(foo, 'foo');
            assert.isTrue(map.has(foo));

            const bar = {};
            map.set(bar, 'foo');
            assert.isTrue(map.has(bar));
        });

        it('should return false for not exists entry', () => {
            assert.isFalse(map.has('foo'));
        });

        it('should return false for not exists Object', () => {
            const map = new MapPolyfill();
            const foo = {};
            assert.isFalse(map.has(foo));
        });

        it('should correct work with null-key', () => {
            assert.isFalse(map.has(null));
            map.set(null, 'foo');
            assert.isTrue(map.has(null));
            assert.isFalse(map.has('null'));
        });
    });

    describe('.keys()', () => {
        it('should throw an Error', () => {
            assert.throws(() => {
                map.keys();
            });
        });
    });

    describe('.set()', () => {
        it('should set a new entry', () => {
            map.set('foo', 'bar');
            assert.strictEqual(map.get('foo'), 'bar');
        });

        it('should set a new Object', () => {
            const map = new MapPolyfill();
            const foo = {};
            map.set(foo, 'bar');
            assert.strictEqual(map.get(foo), 'bar');
        });

        it('should overwrite an exists entry', () => {
            map.set('foo', 'bar');
            map.set('foo', 'baz');
            assert.strictEqual(map.get('foo'), 'baz');
        });

        it('should overwrite an exists Object', () => {
            const map = new MapPolyfill();
            const foo = {};
            map.set(foo, 'bar');
            map.set(foo, 'baz');
            assert.strictEqual(map.get(foo), 'baz');
        });
    });

    describe('.values()', () => {
        it('should throw an Error', () => {
            assert.throws(() => {
                map.keys();
            });
        });
    });
});
