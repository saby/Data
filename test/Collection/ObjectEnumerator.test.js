/* global define, beforeEach, afterEach, describe, context, it, assert */
define([
   'Types/_collection/enumerator/Objectwise'
], function(
   ObjectEnumeratorEs
) {
   'use strict';

   var ObjectEnumerator = ObjectEnumeratorEs.default;

   describe('Types/_collection/ObjectEnumerator', function() {
      var items;

      beforeEach(function() {
         items = {
            one: 1,
            two: 2,
            three: 3
         };
      });

      afterEach(function() {
         items = undefined;
      });

      describe('constructor()', function() {
         it('should throw an error on invalid argument', function() {
            assert.throws(function() {
               new ObjectEnumerator('');
            });
            assert.throws(function() {
               new ObjectEnumerator(0);
            });
            assert.throws(function() {
               new ObjectEnumerator(null);
            });
         });
      });

      describe('.getCurrent()', function() {
         it('should return undefined by default', function() {
            var enumerator = new ObjectEnumerator();
            assert.isUndefined(enumerator.getCurrent());
         });

         it('should return item by item', function() {
            var enumerator = new ObjectEnumerator(items),
               keys = Object.keys(items),
               index = 0;
            while (enumerator.moveNext()) {
               assert.strictEqual(items[keys[index]], enumerator.getCurrent());
               index++;
            }
            assert.strictEqual(items.three, enumerator.getCurrent());
         });
      });

      describe('.getCurrentIndex()', function() {
         it('should return undefined by default', function() {
            var enumerator = new ObjectEnumerator();
            assert.isUndefined(enumerator.getCurrentIndex());
         });

         it('should return item by item', function() {
            var enumerator = new ObjectEnumerator(items),
               keys = Object.keys(items),
               index = 0;
            while (enumerator.moveNext()) {
               assert.strictEqual(keys[index], enumerator.getCurrentIndex());
               index++;
            }
         });
      });

      describe('.moveNext()', function() {
         it('should return undefined for empty list', function() {
            var enumerator = new ObjectEnumerator();
            assert.isFalse(enumerator.moveNext());
         });

         it('should return item by item', function() {
            var enumerator = new ObjectEnumerator(items),
               keys = Object.keys(items),
               index = 0;
            while (enumerator.moveNext()) {
               assert.strictEqual(items[keys[index]], enumerator.getCurrent());
               index++;
            }
         });
      });

      describe('.reset()', function() {
         it('should set current to undefined', function() {
            var enumerator = new ObjectEnumerator(items);
            enumerator.moveNext();
            assert.isDefined(enumerator.getCurrent());
            enumerator.reset();
            assert.isUndefined(enumerator.getCurrent());
         });

         it('should start enumeration from beginning', function() {
            var enumerator = new ObjectEnumerator(items),
               keys = Object.keys(items),
               index;

            enumerator.moveNext();
            var firstOne = enumerator.getCurrent();
            enumerator.reset();
            enumerator.moveNext();
            assert.strictEqual(firstOne, enumerator.getCurrent());

            enumerator.reset();
            index = 0;
            while (enumerator.moveNext()) {
               assert.strictEqual(items[keys[index]], enumerator.getCurrent());
               index++;
            }

            enumerator.reset();
            index = 0;
            while (enumerator.moveNext()) {
               assert.strictEqual(items[keys[index]], enumerator.getCurrent());
               index++;
            }
         });
      });

      describe('.setFilter()', function() {
         it('should force return only filtered items', function() {
            var enumerator = new ObjectEnumerator(items),
               count = 0,
               expect = [1, 3];
            enumerator.setFilter(function(item) {
               return expect.indexOf(item) > -1;
            });
            while (enumerator.moveNext()) {
               assert.equal(enumerator.getCurrent(), expect[count]);
               count++;
            }
            assert.strictEqual(count, expect.length);
         });
      });
   });
});
