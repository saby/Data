/* global beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/descriptor',
   'Core/core-extend'
], function(
   descriptor,
   extend
) {
   'use strict';

   descriptor = descriptor.default;

   describe('Types/_entity/descriptor', function() {
      it('should return Function', function() {
         assert.instanceOf(descriptor(Number), Function);
      });

      it('should return valid Boolean value', function() {
         assert.equal(descriptor(Boolean)(false), false);
      });

      it('should return TypeError for not a Boolean value', function() {
         assert.instanceOf(descriptor(Boolean)(null), TypeError);
         assert.instanceOf(descriptor(Boolean)(0), TypeError);
         assert.instanceOf(descriptor(Boolean)(''), TypeError);
         assert.instanceOf(descriptor(Boolean)({}), TypeError);
      });

      it('should return valid Number value', function() {
         assert.equal(descriptor(Number)(1), 1);
      });

      it('should return TypeError for not a Number value', function() {
         assert.instanceOf(descriptor(Number)(null), TypeError);
         assert.instanceOf(descriptor(Number)(true), TypeError);
         assert.instanceOf(descriptor(Number)(''), TypeError);
         assert.instanceOf(descriptor(Number)({}), TypeError);
      });

      it('should return valid String value', function() {
         assert.equal(descriptor(String)('a'), 'a');
      });

      it('should return valid subclass of String value', function() {
         var SubString = function() {
            String.apply(this, arguments);
         };
         SubString.prototype = Object.create(String.prototype);
         SubString.prototype.constructor = SubString;

         var inst = new SubString('a');
         assert.strictEqual(descriptor(String)(inst), inst);
      });

      it('should return TypeError for not a String value', function() {
         assert.instanceOf(descriptor(String)(null), TypeError);
         assert.instanceOf(descriptor(String)(false), TypeError);
         assert.instanceOf(descriptor(String)(1), TypeError);
         assert.instanceOf(descriptor(String)({}), TypeError);
      });

      it('should return valid Object value', function() {
         var inst = {};
         assert.equal(descriptor(Object)(inst), inst);
      });

      it('should return TypeError for not an Object value', function() {
         assert.instanceOf(descriptor(Object)(null), TypeError);
         assert.instanceOf(descriptor(Object)(false), TypeError);
         assert.instanceOf(descriptor(Object)(1), TypeError);
         assert.instanceOf(descriptor(Object)(''), TypeError);
      });

      it('should return valid Array value', function() {
         var inst = [];
         assert.equal(descriptor(Array)(inst), inst);
      });

      it('should return TypeError for not an Array value', function() {
         assert.instanceOf(descriptor(Array)(null), TypeError);
         assert.instanceOf(descriptor(Array)(false), TypeError);
         assert.instanceOf(descriptor(Array)(1), TypeError);
         assert.instanceOf(descriptor(Array)(''), TypeError);
      });

      it('should return value that implements an interface', function() {
         var IFace = {},
            Module = extend.extend(Object, [IFace], {}),
            inst = new Module();

         assert.equal(descriptor(IFace)(inst), inst);
      });

      it('should return TypeError if value is not implements an interface', function() {
         var IFace = {},
            Module = extend.extend(Object, {}),
            inst = new Module();

         assert.instanceOf(descriptor(IFace)(inst), TypeError);
      });

      it('should return undefined for undefined value with any type', function() {
         assert.isUndefined(descriptor(Boolean)());
         assert.isUndefined(descriptor(Number)());
         assert.isUndefined(descriptor(String)());
         assert.isUndefined(descriptor(Object)());
         assert.isUndefined(descriptor({})());
      });

      describe('.required()', function() {
         it('should return valid value', function() {
            assert.equal(descriptor(Boolean).required()(false), false);
            assert.equal(descriptor(Number).required()(-1), -1);
            assert.equal(descriptor(String).required()('a'), 'a');
         });

         it('should return TypeError for undefined', function() {
            assert.instanceOf(descriptor(Boolean).required()(), TypeError);
            assert.instanceOf(descriptor(Number).required()(), TypeError);
            assert.instanceOf(descriptor(String).required()(), TypeError);
         });
      });

      describe('.oneOf()', function() {
         it('should return valid value', function() {
            assert.equal(descriptor(Boolean).oneOf([true])(true), true);
            assert.equal(descriptor(Number).oneOf([1, 2, 3])(2), 2);
            assert.equal(descriptor(String).oneOf(['a', 'b'])('a'), 'a');
         });

         it('should return undefined as valid value', function() {
            assert.isUndefined(descriptor(Number).oneOf([0, 1])());
         });

         it('should return TypeError for undefined but required', function() {
            assert.instanceOf(descriptor(Number).oneOf([0, 1]).required()(), TypeError);
         });

         it('should return TypeError for invalid value', function() {
            assert.instanceOf(descriptor(Boolean).oneOf([true])(false), TypeError);
            assert.instanceOf(descriptor(Number).oneOf([1, 2])(0), TypeError);
            assert.instanceOf(descriptor(String).oneOf(['a'])('b'), TypeError);
         });

         it('should throw TypeError in invalid values argument', function() {
            assert.throws(function() {
               descriptor(Boolean).oneOf();
            }, TypeError);

            assert.throws(function() {
               descriptor(Boolean).oneOf(null);
            }, TypeError);

            assert.throws(function() {
               descriptor(Boolean).oneOf({});
            }, TypeError);
         });
      });

      describe('.not()', function() {
         it('should return valid value', function() {
            assert.equal(descriptor(Boolean).not([true])(false), false);
            assert.equal(descriptor(Number).not([1, 2, 3])(0), 0);
            assert.equal(descriptor(String).not(['a', 'b'])('c'), 'c');
         });

         it('should return undefined as valid value', function() {
            assert.isUndefined(descriptor(Number).not([0, 1])());
         });

         it('should return TypeError for undefined but required', function() {
            assert.instanceOf(descriptor(Number).not([0, 1]).required()(), TypeError);
         });

         it('should return TypeError for invalid value', function() {
            assert.instanceOf(descriptor(Boolean).not([true])(true), TypeError);
            assert.instanceOf(descriptor(Number).not([1, 2])(1), TypeError);
            assert.instanceOf(descriptor(String).not(['a'])('a'), TypeError);
         });

         it('should throw TypeError in invalid values argument', function() {
            assert.throws(function() {
               descriptor(Boolean).not();
            }, TypeError);

            assert.throws(function() {
               descriptor(Boolean).not(null);
            }, TypeError);

            assert.throws(function() {
               descriptor(Boolean).not({});
            }, TypeError);
         });
      });

      describe('.arrayOf()', function() {
         it('should return valid value', function() {
            assert.deepEqual(descriptor(Array).arrayOf(Boolean)([true]), [true]);
            assert.deepEqual(descriptor(Array).arrayOf(Number)([0, 1]), [0, 1]);
            assert.deepEqual(descriptor(Array).arrayOf(String)(['a', 'b']), ['a', 'b']);
         });

         it('should return undefined as valid value', function() {
            assert.isUndefined(descriptor(Array).arrayOf(Number)());
         });

         it('should return TypeError for undefined but required', function() {
            assert.instanceOf(descriptor(Array).arrayOf(Number).required()(), TypeError);
         });

         it('should return TypeError for invalid value', function() {
            assert.instanceOf(descriptor(Array).arrayOf(Boolean)(true), TypeError);
            assert.instanceOf(descriptor(Array).arrayOf(Boolean)(0), TypeError);
            assert.instanceOf(descriptor(Array).arrayOf(Boolean)([0]), TypeError);
         });
      });
   });
});
