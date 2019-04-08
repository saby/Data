/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_chain/Objectwise'
], function(
   ObjectChainEs
) {
   'use strict';

   var ObjectChain = ObjectChainEs.default;

   describe('Types/_chain/Objectwise', function() {
      var items,
         chain;

      beforeEach(function() {
         items = {one: 1, two: 2, three: 3};
         chain = new ObjectChain(items);
      });

      afterEach(function() {
         chain.destroy();
         chain = undefined;
         items = undefined;
      });

      describe('.constructor()', function() {
         it('should throw an error on invalid argument', function() {
            assert.throws(function() {
               new ObjectChain();
            }, TypeError);
            assert.throws(function() {
               new ObjectChain('');
            }, TypeError);
            assert.throws(function() {
               new ObjectChain(0);
            }, TypeError);
            assert.throws(function() {
               new ObjectChain(null);
            }, TypeError);
         });
      });

      describe('.getEnumerator()', function() {
         it('should return enumerator with all items', function() {
            var enumerator = chain.getEnumerator(),
               result = {};
            while (enumerator.moveNext()) {
               result[enumerator.getCurrentIndex()] = enumerator.getCurrent();
            }
            assert.deepEqual(result, items);
         });
      });

      describe('.each()', function() {
         it('should return all items', function() {
            var count = 0,
               keys = Object.keys(items);
            chain.each(function(item, key) {
               assert.strictEqual(item, items[key]);
               assert.strictEqual(key, keys[count]);
               count++;
            });
            assert.strictEqual(count, keys.length);
         });
      });

      describe('.value()', function() {
         it('should return equal object', function() {
            assert.deepEqual(chain.value(), items);
         });

         it('should return type from given factory', function() {
            var Type = function(items) {
                  this.items = items;
               },
               factory = function(items) {
                  return new Type(items);
               },
               result;

            result = chain.value(factory);
            assert.instanceOf(result, Type);
            assert.instanceOf(result.items, ObjectChain);
         });
      });

      describe('.toArray()', function() {
         it('should return all object values', function() {
            var arr = [],
               key;
            for (key in items) {
               if (items.hasOwnProperty(key)) {
                  arr.push(items[key]);
               }
            }
            assert.deepEqual(chain.toArray(), arr);
         });
      });

      describe('.toObject()', function() {
         it('should return equal object', function() {
            assert.deepEqual(chain.toObject(), items);
         });
      });

      describe('.reduce()', function() {
         it('should return sum of values', function() {
            var result = chain.reduce(function(prev, curr) {
               return prev + curr;
            }, 0);
            assert.strictEqual(result, 1 + 2 + 3);
         });

         it('should return concatenation of keys', function() {
            var result = chain.reduce(function(prev, curr, index) {
               return prev + index;
            }, '');
            assert.strictEqual(result, 'one' + 'two' + 'three');
         });
      });

      describe('.map()', function() {
         it('should map chain as keys', function() {
            var keys = Object.keys(items),
               index = 0;
            chain.map(function(value, key) {
               return key;
            }).each(function(item, key) {
               assert.strictEqual(item, keys[index]);
               assert.strictEqual(key, keys[index]);
               index++;
            });
            assert.strictEqual(index, keys.length);
         });

         it('should map chain as values', function() {
            var keys = Object.keys(items),
               index = 0;
            chain.map(function(item) {
               return item;
            }).each(function(item) {
               assert.strictEqual(item, items[keys[index]]);
               index++;
            });
            assert.strictEqual(index, keys.length);
         });
      });

      describe('.filter()', function() {
         it('should filter chain by item', function() {
            var index = 0;
            chain.filter(function(item) {
               return item === 3;
            }).each(function(item) {
               assert.strictEqual(item, 3);
               index++;
            });
            assert.strictEqual(index, 1);
         });

         it('should filter chain by index', function() {
            var index = 0;
            chain.filter(function(item, index) {
               return index === 'two';
            }).each(function(item) {
               assert.strictEqual(item, 2);
               index++;
            });
            assert.strictEqual(index, 1);
         });
      });
   });
});
