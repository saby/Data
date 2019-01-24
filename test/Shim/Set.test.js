/* global define, describe, beforeEach, afterEach, it, assert */
define([
   'Types/_shim/Set'
], function(
   Set
) {
   'use strict';

   Set = Set.default;

   describe('Types/_shim/Set', function() {
      var global = (0, eval)('this'), // eslint-disable-line no-eval
         isNative = Set === global.Set,
         set;

      beforeEach(function() {
         if (isNative) {
            this.skip();
         } else {
            set = new Set();
         }
      });

      afterEach(function() {
         set = undefined;
      });

      describe('.size', function() {
         it('should return 0 by default', function() {
            assert.strictEqual(set.size, 0);
         });

         it('should return new size after set new entry', function() {
            set.add('foo');
            assert.strictEqual(set.size, 1);
         });
      });

      describe('.add()', function() {
         it('should set a new entry', function() {
            set.add('foo');
            assert.isTrue(set.has('foo'));
         });

         it('should set a new Object', function() {
            var foo = {};
            set.add(foo);
            assert.isTrue(set.has(foo));

            var bar = {};
            set.add(bar);
            assert.isTrue(set.has(bar));
         });
      });

      describe('.clear()', function() {
         it('should reset the size', function() {
            set.add('foo');
            set.clear();
            assert.strictEqual(set.size, 0);
         });
      });

      describe('.delete()', function() {
         it('should delete the entry', function() {
            set.add('foo');
            set.delete('foo');
            assert.isFalse(set.has('foo'));
         });

         it('should do nothing for not exists entry', function() {
            set.delete('foo');
            assert.isFalse(set.has('foo'));
         });

         it('should delete the Object', function() {
            var foo = {};
            set.add(foo);
            set.delete(foo);
            assert.isFalse(set.has(foo));
         });

         it('should do nothing for not exists Object', function() {
            var foo = {};
            set.delete(foo);
            assert.isFalse(set.has(foo));
         });

         it('should not found item in foreach', function() {
            var foo = {}, count = 0;
            set.add(foo);
            set.add('bar');
            set.delete(foo);

            set.forEach(function() {
               count++;
            });
            assert.equal(count, 1);
         });
      });

      describe('.entries()', function() {
         it('should throw an Error', function() {
            assert.throws(function() {
               set.entries();
            });
         });
      });

      describe('.forEach()', function() {
         it('should invoke callback for each entry', function() {
            var index = 0,
               baz = {},
               expect = ['foo', 'bar', baz];

            set.add('foo');
            set.add('bar');
            set.add(baz);
            set.forEach(function(item, key) {
               assert.strictEqual(item, expect[index]);
               assert.strictEqual(key, expect[index]);
               index++;
            });
            assert.equal(index, expect.length);
         });

         it('should invoke callback with given context', function() {
            var context = {};

            set.add('foo');
            set.forEach(function() {
               assert.strictEqual(this, context);
            }, context);
         });
      });

      describe('.has()', function() {
         it('should return true for exists entry', function() {
            set.add('foo');
            assert.isTrue(set.has('foo'));
         });

         it('should return true for exists Object', function() {
            var foo = {};
            set.add(foo);
            assert.isTrue(set.has(foo));
         });

         it('should return false for not exists entry', function() {
            assert.isFalse(set.has('foo'));
         });

         it('should correct work with null', function() {
            assert.isFalse(set.has(null));
            set.add(null);
            assert.isTrue(set.has(null));
            assert.isFalse(set.has('null'));
         });
      });

      describe('.keys()', function() {
         it('should throw an Error', function() {
            assert.throws(function() {
               set.keys();
            });
         });
      });

      describe('.values()', function() {
         it('should throw an Error', function() {
            assert.throws(function() {
               set.keys();
            });
         });
      });
   });
});
