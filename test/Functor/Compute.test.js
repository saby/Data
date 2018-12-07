/* global define, describe, it, assert */
define([
   'Types/_entity/functor/Compute'
], function(
   Compute
) {
   'use strict';

   Compute = Compute.default;

   describe('Types/Functor/Compute', function() {
      describe('.constructor()', function() {
         it('should throw TypeError on invalid arguments', function() {
            assert.throws(function() {
               new Compute();
            }, TypeError);

            assert.throws(function() {
               new Compute([]);
            }, TypeError);


            assert.throws(function() {
               new Compute({});
            }, TypeError);

            assert.throws(function() {
               new Compute(function() {}, {});
            }, TypeError);
         });

         it('should return a functor', function() {
            var functor = new Compute(function() {});
            assert.instanceOf(functor, Function);
            assert.strictEqual(functor.functor, Compute);
         });

         it('should return a functor with given properties', function() {
            var functor = new Compute(function() {}, ['foo', 'bar']);
            assert.deepEqual(functor.properties, ['foo', 'bar']);
         });

         it('should call a functor', function() {
            var given = {},
               expect = {
                  a: 'foo',
                  b: 'bar'
               },
               result,
               functor = new Compute(function(a, b) {
                  given.a = a;
                  given.b = b;
                  return a + b;
               });

            result = functor('foo', 'bar');
            assert.equal(result, 'foo' + 'bar');
            assert.equal(given.a, expect.a);
            assert.equal(given.b, expect.b);
         });
      });

      describe('::isFunctor()', function() {
         it('should return true for Functor', function() {
            var functor = new Compute(function() {});
            assert.isTrue(Compute.isFunctor(functor));
         });

         it('should return true for not a Functor', function() {
            assert.isFalse(Compute.isFunctor(function() {}));
         });
      });
   });
});
