/* global define, beforeEach, afterEach, describe, context, it, assert */
define([
   'Types/_collection/enumerator/Mapwise',
   'Types/_shim/Map'
], function(
   MapEnumerator,
   Map
) {
   'use strict';

   MapEnumerator = MapEnumerator.default;
   Map = Map.default;

   describe('Types/_collection/enumerator/Mapwise', function() {
      var keys,
         values,
         items;

      beforeEach(function() {
         keys = ['one', 'two', 'three'];
         values = [1, 2, 3];
         items = new Map(keys.map(function(key, index) {
            return  [key, values[index]];
         }));
      });

      afterEach(function() {
         items = undefined;
      });

      describe('constructor()', function() {
         it('should throw an error on invalid argument', function() {
            assert.throws(function() {
               new MapEnumerator(0);
            });
            assert.throws(function() {
               new MapEnumerator(null);
            });
         });
      });

      describe('.getCurrent()', function() {
         it('should return undefined by default', function() {
            var enumerator = new MapEnumerator();
            assert.isUndefined(enumerator.getCurrent());
         });

         it('should return item by item', function() {
            var enumerator = new MapEnumerator(items),
               index = 0;
            while (enumerator.moveNext()) {
               assert.strictEqual(values[index], enumerator.getCurrent());
               index++;
            }
            assert.strictEqual(values[values.length - 1], enumerator.getCurrent());
         });
      });

      describe('.getCurrentIndex()', function() {
         it('should return undefined by default', function() {
            var enumerator = new MapEnumerator();
            assert.isUndefined(enumerator.getCurrentIndex());
         });

         it('should return item by item', function() {
            var enumerator = new MapEnumerator(items),
               index = 0;
            while (enumerator.moveNext()) {
               assert.strictEqual(keys[index], enumerator.getCurrentIndex());
               index++;
            }
            assert.strictEqual(keys[keys.length - 1], enumerator.getCurrentIndex());
         });
      });

      describe('.moveNext()', function() {
         it('should return false for empty', function() {
            var enumerator = new MapEnumerator();
            assert.isFalse(enumerator.moveNext());
         });

         it('should return item by item', function() {
            var enumerator = new MapEnumerator(items),
               index = 0;
            while (enumerator.moveNext()) {
               index++;
            }
            assert.strictEqual(index, items.size);
         });
      });

      describe('.reset()', function() {
         it('should set current to undefined', function() {
            var enumerator = new MapEnumerator(items);
            enumerator.moveNext();
            assert.isDefined(enumerator.getCurrent());
            enumerator.reset();
            assert.isUndefined(enumerator.getCurrent());
         });

         it('should start enumeration from beginning', function() {
            var enumerator = new MapEnumerator(items);

            enumerator.moveNext();
            assert.strictEqual(enumerator.getCurrent(), values[0]);

            enumerator.reset();
            enumerator.moveNext();
            assert.strictEqual(enumerator.getCurrent(), values[0]);
         });
      });
   });
});
