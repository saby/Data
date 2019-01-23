/* global define, describe, it, assert */
define([
   'Types/util'
], function(
   util
) {
   'use strict';

   describe('Types/_util', function() {
      describe('.getItemPropertyValue()', function() {
         it('should return undefined for not an Object', function() {
            var foo = 'bar';
            assert.isUndefined(util.object.getPropertyValue(foo, 'foo'));
         });

         it('should return native property value', function() {
            var obj = {
               foo: 'bar'
            };

            assert.equal(util.object.getPropertyValue(obj, 'foo'), 'bar');
         });

         it('should return property from IObject getter', function() {
            var obj = {
               '[Types/_entity/IObject]': true,
               has: function(name) {
                  return name === 'foo';
               },
               get: function(name) {
                  return name === 'foo' ? 'bar' : undefined;
               }
            };

            assert.equal(util.object.getPropertyValue(obj, 'foo'), 'bar');
         });

         it('should return property from name-like getter', function() {
            var obj = {
               getFoo: function() {
                  return 'bar';
               }
            };

            assert.equal(util.object.getPropertyValue(obj, 'foo'), 'bar');
         });
      });

      describe('.setItemPropertyValue()', function() {
         it('should throw a TypeError for not an Object', function() {
            var foo = 'bar';

            assert.throws(function() {
               util.object.setPropertyValue(foo, 'foo');
            }, TypeError);
         });

         it('should set native property value', function() {
            var obj = {
               foo: 'bar'
            };

            util.object.setPropertyValue(obj, 'foo', 'baz');
            assert.equal(obj.foo, 'baz');
         });

         it('should set property via IObject setter', function() {
            var obj = {
               '[Types/_entity/IObject]': true,
               has: function(name) {
                  return name === 'foo';
               },
               set: function(name, value) {
                  this['_' + name] = value;
               }
            };

            util.object.setPropertyValue(obj, 'foo', 'bar');
            assert.equal(obj._foo, 'bar');
         });

         it('should set property via name-like getter', function() {
            var obj = {
               setFoo: function(value) {
                  this._foo = value;
               }
            };

            util.object.setPropertyValue(obj, 'foo', 'bar');
            assert.equal(obj._foo, 'bar');
         });
      });

      describe('.clone()', function() {
         it('should return passed value for not an Object', function() {
            assert.equal(util.object.clone('foo'), 'foo');
         });

         it('should clone plain Object', function() {
            var obj = {
               foo: 'bar',
               baz: 'vax'
            };

            assert.notEqual(util.object.clone(obj), obj);
            assert.deepEqual(util.object.clone(obj), obj);
         });

         it('should clone using ICloneable method', function() {
            var obj = {
               '[Types/_entity/ICloneable]': true,
               clone: function() {
                  return [this];
               }
            };

            assert.strictEqual(util.object.clone(obj)[0], obj);
         });
      });

      describe('.clonePlain()', function() {
         it('should return passed value for not an Object', function() {
            assert.equal(util.object.clonePlain('foo'), 'foo');
         });

         it('should clone plain Object', function() {
            var obj = {
               foo: 'bar',
               baz: 'vax'
            };

            assert.notEqual(util.object.clonePlain(obj), obj);
            assert.deepEqual(util.object.clonePlain(obj), obj);
         });

         it('should call method clone() if object implements ICloneable', function() {
            var called = false;
            var Foo = function() {
               this['[Types/_entity/ICloneable]'] = true;
               this.clone = function() {
                  called = true;
               };
            };
            var obj = {
               foo: new Foo()
            };

            util.object.clonePlain(obj, true);
            assert.isTrue(called);
         });

         it('should don\'t clone complicated Object', function() {
            var Foo = function() {};
            Foo.prototype = Object.create(Object.prototype);
            Foo.prototype.constructor = Foo;

            var foo = new Foo();
            var obj = {
               foo: foo
            };

            assert.strictEqual(util.object.clonePlain(obj).foo, foo);
         });

         it('should worl well with circular objects', function() {
            var objA = {foo: 'bar'};
            var objB = {a: objA};
            objA.b = objB;

            var clone = util.object.clonePlain(objA);
            assert.equal(clone.foo, 'bar');
            assert.deepEqual(clone.b, objB);
         });
      });

      describe('.logger', function() {
         it('should return logger with log() method', function() {
            assert.isFunction(util.logger.log);
         });

         it('should return logger with error() method', function() {
            assert.isFunction(util.logger.error);
         });

         it('should return logger with info() method', function() {
            assert.isFunction(util.logger.info);
         });

         it('should return logger with stack() method', function() {
            assert.isFunction(util.logger.stack);
         });
      });
   });
});
