/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_chain/Enumerable',
   'Types/_entity/Record',
   'Types/_collection/List'
], function(
   EnumerableChain,
   Record,
   List
) {
   'use strict';

   EnumerableChain = EnumerableChain.default;
   Record = Record.default;
   List = List.default;

   describe('Types/_chain/Enumerable', function() {
      var data,
         items,
         chain;

      beforeEach(function() {
         data = {one: 1, two: 2, three: 3};
         items = new Record({rawData: data});
         chain = new EnumerableChain(items);
      });

      afterEach(function() {
         chain.destroy();
         chain = undefined;
         items.destroy();
         items = undefined;
         data = undefined;
      });

      describe('.constructor()', function() {
         it('should throw an error on invalid argument', function() {
            assert.throws(function() {
               new EnumerableChain();
            }, TypeError);
            assert.throws(function() {
               new EnumerableChain([]);
            }, TypeError);
            assert.throws(function() {
               new EnumerableChain({});
            }, TypeError);
            assert.throws(function() {
               new EnumerableChain('');
            }, TypeError);
            assert.throws(function() {
               new EnumerableChain(0);
            }, TypeError);
            assert.throws(function() {
               new EnumerableChain(null);
            }, TypeError);
         });
      });

      describe('.getEnumerator()', function() {
         it('should return enumerator with all properties', function() {
            var enumerator = chain.getEnumerator(),
               keys = Object.keys(data),
               index = 0;
            while (enumerator.moveNext()) {
               assert.equal(enumerator.getCurrent(), keys[index]);
               index++;
            }
            assert.deepEqual(index, keys.length);
         });
      });

      describe('.each()', function() {
         it('should return all properties and values', function() {
            var keys = Object.keys(data),
               index = 0;
            chain.each(function(key, value) {
               assert.equal(key, keys[index]);
               assert.equal(value, data[key]);
               index++;
            });
            assert.strictEqual(index, keys.length);
         });
      });

      describe('.toArray()', function() {
         it('should return all properties for Record', function() {
            assert.deepEqual(chain.toArray(), Object.keys(data));
         });

         it('should return all items for List', function() {
            var data = ['one', 'two', 'three'],
               items = new List({items: data}),
               chain = new EnumerableChain(items);

            assert.deepEqual(chain.toArray(), data);
         });
      });

      describe('.toObject()', function() {
         it('should return equal object for Record', function() {
            assert.deepEqual(chain.toObject(), data);
         });

         it('should return all items for List', function() {
            var data = ['one', 'two', 'three'],
               items = new List({items: data}),
               chain = new EnumerableChain(items),
               obj = chain.toObject();

            for (var i = 0; i < data.length; i++) {
               assert.strictEqual(obj[i], data[i]);
            }
         });
      });
   });
});
