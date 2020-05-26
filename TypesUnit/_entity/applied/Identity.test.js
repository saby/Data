/* global beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/applied/Identity'
], function(
   Identity
) {
   'use strict';

   Identity = Identity.default;

   describe('Types/_entity/applied/Identity', function() {
      describe('.constructor()', function() {
         it('should create Identity', function() {
            var instance = new Identity([]);
            assert.instanceOf(instance, Identity);
         });
      });

      describe('.getValue()', function() {
         it('should return the value from scalar', function() {
            var value = 1,
               instance = new Identity(value);

            assert.strictEqual(instance.getValue(), value);
         });

         it('should return the value from String', function() {
            var value = '1,foo',
               instance = new Identity(value);

            assert.strictEqual(instance.getValue(), '1');
         });

         it('should return the value from Array', function() {
            var value = [1],
               instance = new Identity(value);

            assert.strictEqual(instance.getValue(), value[0]);
         });
      });

      describe('.getName()', function() {
         it('should return undefined', function() {
            var value = 1,
               instance = new Identity(value);

            assert.isUndefined(instance.getName());
         });

         it('should return the value from String', function() {
            var value = '1,foo',
               instance = new Identity(value);

            assert.strictEqual(instance.getName(), 'foo');
         });

         it('should return the value from Array', function() {
            var value = [1, 'foo'],
               instance = new Identity(value);

            assert.strictEqual(instance.getName(), value[1]);
         });
      });

      describe('.valueOf()', function() {
         it('should return the original value', function() {
            var value = [],
               instance = new Identity(value);

            assert.strictEqual(instance.valueOf(), value);
         });
      });

      describe('.toString()', function() {
         it('should return null', function() {
            var value = [null],
               instance = new Identity(value);

            assert.isNull(instance.toString());
         });

         it('should return String with commas', function() {
            var value = [0, 'foo'],
               instance = new Identity(value);

            assert.equal(instance.toString(), value.join(','));
         });
      });
   });
});
