/* global define, describe, beforeEach, afterEach, it, assert */
define([
   'Types/_shim/Map'
], function(
   Map
) {
   'use strict';

   Map = Map.default;

   describe('Types/_shim/Map', function() {
      var global = (0, eval)('this'), // eslint-disable-line no-eval
         isNative = Map === global.Map,
         map;

      beforeEach(function() {
         if (isNative) {
            this.skip();
         } else {
            map = new Map();
         }
      });

      afterEach(function() {
         map = undefined;
      });

      describe('.size', function() {
         it('should return 0 by default', function() {
            assert.strictEqual(map.size, 0);
         });

         it('should return new size after set new entry', function() {
            map.set('foo', 'bar');
            assert.strictEqual(map.size, 1);
         });

         it('should return new size after set new Object', function() {
            var foo = {};
            map.set(foo, 'bar');
            assert.strictEqual(map.size, 1);
         });
      });

      describe('.clear()', function() {
         it('should reset the size', function() {
            map.set('foo', 'bar');
            map.clear();
            assert.strictEqual(map.size, 0);
         });

         it('should reset the size with Object', function() {
            var foo = {};
            map.set(foo, 'bar');
            map.clear();
            assert.strictEqual(map.size, 0);
         });
      });

      describe('.delete()', function() {
         it('should delete the entry', function() {
            map.set('foo', 'bar');
            map.delete('foo');
            assert.isFalse(map.has('foo'));
         });

         it('should do nothing for not exists entry', function() {
            map.delete('foo');
            assert.isFalse(map.has('foo'));
         });

         it('should delete the Object', function() {
            var foo = {};
            map.set(foo, 'bar');
            map.delete(foo);
            assert.isFalse(map.has(foo));
         });

         it('should do nothing for not exists Object', function() {
            var foo = {};
            map.delete(foo);
            assert.isFalse(map.has(foo));
         });

         it('should not found item in foreach', function() {
            var foo = {}, result = false;
            map.set(foo, 'bar');
            map.set('foo', 'bar');
            map.delete(foo);

            map.forEach(function(item, key) {
               result = (key === foo || result);
            });
            assert.isFalse(result);
         });
      });

      describe('.entries()', function() {
         it('should throw an Error', function() {
            assert.throws(function() {
               map.entries();
            });
         });
      });

      describe('.forEach()', function() {
         it('should invoke callback for each entry', function() {
            var index = 0,
               baz = {},
               expect = [['foo', 'a'], ['bar', 'b'], [baz, 'c']];

            map.set('foo', 'a');
            map.set('bar', 'b');
            map.set(baz, 'c');
            map.forEach(function(item, key) {
               assert.strictEqual(key, expect[index][0]);
               assert.strictEqual(item, expect[index][1]);
               index++;
            });
            assert.equal(index, expect.length);
         });

         it('should invoke callback with given context', function() {
            var context = {};

            map.set('foo', 'bar');
            map.forEach(function() {
               assert.strictEqual(this, context);
            }, context);
         });
      });

      describe('.get()', function() {
         it('should return an entry value', function() {
            map.set('foo', 'bar');
            assert.strictEqual(map.get('foo'), 'bar');
         });

         it('should return an Object value', function() {
            var foo = {};
            map.set(foo, 'foo');
            assert.strictEqual(map.get(foo), 'foo');

            var bar = {};
            map.set(bar, 'bar');
            assert.strictEqual(map.get(bar), 'bar');
         });

         it('should return undefined if entry is not exists', function() {
            assert.isUndefined(map.get('foo'));
         });

         it('should return undefined if Object is not exists', function() {
            assert.isUndefined(map.get({}));
         });
      });

      describe('.has()', function() {
         it('should return true for exists entry', function() {
            map.set('foo', 'bar');
            assert.isTrue(map.has('foo'));
         });

         it('should return true for exists Object', function() {
            var foo = {};
            map.set(foo, 'foo');
            assert.isTrue(map.has(foo));

            var bar = {};
            map.set(bar, 'foo');
            assert.isTrue(map.has(bar));
         });

         it('should return false for not exists entry', function() {
            assert.isFalse(map.has('foo'));
         });

         it('should return false for not exists Object', function() {
            var foo = {};
            assert.isFalse(map.has(foo));
         });

         it('should correct work with null-key', function() {
            assert.isFalse(map.has(null));
            map.set(null, 'foo');
            assert.isTrue(map.has(null));
            assert.isFalse(map.has('null'));
         });
      });

      describe('.keys()', function() {
         it('should throw an Error', function() {
            assert.throws(function() {
               map.keys();
            });
         });
      });

      describe('.set()', function() {
         it('should set a new entry', function() {
            map.set('foo', 'bar');
            assert.strictEqual(map.get('foo'), 'bar');
         });

         it('should set a new Object', function() {
            var foo = {};
            map.set(foo, 'bar');
            assert.strictEqual(map.get(foo), 'bar');
         });

         it('should overwrite an exists entry', function() {
            map.set('foo', 'bar');
            map.set('foo', 'baz');
            assert.strictEqual(map.get('foo'), 'baz');
         });

         it('should overwrite an exists Object', function() {
            var foo = {};
            map.set(foo, 'bar');
            map.set(foo, 'baz');
            assert.strictEqual(map.get(foo), 'baz');
         });
      });

      describe('.values()', function() {
         it('should throw an Error', function() {
            assert.throws(function() {
               map.keys();
            });
         });
      });
   });
});
