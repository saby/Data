/* global beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/DateTime'
], function(
   DateTime
) {
   'use strict';

   DateTime = DateTime.default;

   describe('Types/_entity/DateTime', function() {
      describe('.constructor()', function() {
         it('should create instance of Date', function() {
            var instance = new DateTime();
            assert.instanceOf(instance, Date);
         });
      });

      describe('.toJSON()', function() {
         it('should save milliseconds into _value', function() {
            var instance = new DateTime();
            var ms = instance.getTime();
            var serialized = instance.toJSON();

            assert.equal(serialized._value, ms);
         });
      });
   });
});
