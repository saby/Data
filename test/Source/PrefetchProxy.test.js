/* global beforeEach, afterEach, describe, context, assert, it */
define([
   'Types/_source/PrefetchProxy'
], function(
   PrefetchProxy
) {
   'use strict';

   PrefetchProxy = PrefetchProxy.default;

   describe('Types/_source/PrefetchProxy', function() {
      var getTarget = function(data) {
            return {
               data: data,
               create: function() {
                  this.lastMethod = 'create';
                  this.lastArgs = Array.prototype.slice.call(arguments);
                  return '!create';
               },
               read: function() {
                  this.lastMethod = 'read';
                  this.lastArgs = Array.prototype.slice.call(arguments);
                  return '!read';
               },
               update: function() {
                  this.lastMethod = 'update';
                  this.lastArgs = Array.prototype.slice.call(arguments);
                  return '!update';
               },
               destroy: function() {
                  this.lastMethod = 'destroy';
                  this.lastArgs = Array.prototype.slice.call(arguments);
                  return '!destroy';
               },
               query: function() {
                  this.lastMethod = 'query';
                  this.lastArgs = Array.prototype.slice.call(arguments);
                  return '!query';
               },
               merge: function() {
                  this.lastMethod = 'merge';
                  this.lastArgs = Array.prototype.slice.call(arguments);
                  return '!merge';
               },
               copy: function() {
                  this.lastMethod = 'copy';
                  this.lastArgs = Array.prototype.slice.call(arguments);
                  return '!copy';
               },
               move: function() {
                  this.lastMethod = 'move';
                  this.lastArgs = Array.prototype.slice.call(arguments);
                  return '!move';
               },
               getOrderProperty: function() {
                  this.lastMethod = 'getOrderProperty';
                  this.lastArgs = Array.prototype.slice.call(arguments);
                  return '!getOrderProperty';
               },
               getOptions: function() {
                  this.lastMethod = 'getOptions';
                  this.lastArgs = Array.prototype.slice.call(arguments);
                  return '!getOptions';
               },
               setOptions: function() {
                  this.lastMethod = 'setOptions';
                  this.lastArgs = Array.prototype.slice.call(arguments);
                  return '!setOptions';
               }
            };
         },
         targetData,
         target;

      beforeEach(function() {
         targetData = [
            {id: 1},
            {id: 2},
            {id: 3}
         ];

         target = getTarget(targetData);
      });

      afterEach(function() {
         targetData = undefined;
         target = undefined;
      });

      describe('.constructor()', function() {
         it('should throw ReferenceError if target is not specified', function() {
            assert.throws(function() {
               new PrefetchProxy();
            }, ReferenceError);
         });
      });

      describe('.create()', function() {
         it('should call the same method on target', function() {
            var source = new PrefetchProxy({
                  target: target
               }),
               args = ['foo'];

            assert.equal(source.create.apply(source, args), '!create');
            assert.equal(target.lastMethod, 'create');
            assert.deepEqual(target.lastArgs, args);
         });
      });

      describe('.read()', function() {
         it('should call the same method on target', function() {
            var source = new PrefetchProxy({
                  target: target
               }),
               args = ['foo', 'bar'];

            assert.equal(source.read.apply(source, args), '!read');
            assert.equal(target.lastMethod, 'read');
            assert.deepEqual(target.lastArgs, args);
         });

         it('should return result from data.read first', function() {
            var expected = {foo: 'bar'},
               source = new PrefetchProxy({
                  target: target,
                  data: {
                     read: expected
                  }
               }),
               givenFirst;

            source.read().addCallback(function(data) {
               givenFirst = data;
            });
            assert.equal(givenFirst, expected);

            assert.equal(source.read(), '!read');
         });
      });

      describe('.update()', function() {
         it('should call the same method on target', function() {
            var source = new PrefetchProxy({
                  target: target
               }),
               args = ['foo', 'bar'];

            assert.equal(source.update.apply(source, args), '!update');
            assert.equal(target.lastMethod, 'update');
            assert.deepEqual(target.lastArgs, args);
         });
      });

      describe('.destroy()', function() {
         it('should call the same method on target', function() {
            var source = new PrefetchProxy({
                  target: target
               }),
               args = ['foo', 'bar'];

            assert.equal(source.destroy.apply(source, args), '!destroy');
            assert.equal(target.lastMethod, 'destroy');
            assert.deepEqual(target.lastArgs, args);
         });
      });

      describe('.query()', function() {
         it('should call the same method on target', function() {
            var source = new PrefetchProxy({
                  target: target
               }),
               args = ['foo'];

            assert.equal(source.query.apply(source, args), '!query');
            assert.equal(target.lastMethod, 'query');
            assert.deepEqual(target.lastArgs, args);
         });

         it('should return result from data.query first', function() {
            var expected = {foo: 'bar'},
               source = new PrefetchProxy({
                  target: target,
                  data: {
                     query: expected
                  }
               }),
               givenFirst;

            source.query().addCallback(function(data) {
               givenFirst = data;
            });
            assert.equal(givenFirst, expected);

            assert.equal(source.query(), '!query');
         });
      });

      describe('.merge()', function() {
         it('should call the same method on target', function() {
            var source = new PrefetchProxy({
                  target: target
               }),
               args = ['foo', 'bar'];

            assert.equal(source.merge.apply(source, args), '!merge');
            assert.equal(target.lastMethod, 'merge');
            assert.deepEqual(target.lastArgs, args);
         });
      });

      describe('.copy()', function() {
         it('should call the same method on target', function() {
            var source = new PrefetchProxy({
                  target: target
               }),
               args = ['foo', 'bar'];

            assert.equal(source.copy.apply(source, args), '!copy');
            assert.equal(target.lastMethod, 'copy');
            assert.deepEqual(target.lastArgs, args);
         });

         it('should return result from data.copy first', function() {
            var expected = {foo: 'bar'},
               source = new PrefetchProxy({
                  target: target,
                  data: {
                     copy: expected
                  }
               }),
               givenFirst;

            source.copy().addCallback(function(data) {
               givenFirst = data;
            });
            assert.equal(givenFirst, expected);

            assert.equal(source.copy(), '!copy');
         });
      });

      describe('.move()', function() {
         it('should call the same method on target', function() {
            var source = new PrefetchProxy({
                  target: target
               }),
               args = ['foo', 'bar', 'baz'];

            assert.equal(source.move.apply(source, args), '!move');
            assert.equal(target.lastMethod, 'move');
            assert.deepEqual(target.lastArgs, args);
         });
      });

      describe('.getOptions()', function() {
         it('should call the same method on target', function() {
            var source = new PrefetchProxy({
                  target: target
               }),
               args = [];

            assert.equal(source.getOptions.apply(source, args), '!getOptions');
            assert.equal(target.lastMethod, 'getOptions');
            assert.deepEqual(target.lastArgs, args);
         });
      });

      describe('.setOptions()', function() {
         it('should call the same method on target', function() {
            var source = new PrefetchProxy({
                  target: target
               }),
               args = ['foor'];

            assert.equal(source.setOptions.apply(source, args), '!setOptions');
            assert.equal(target.lastMethod, 'setOptions');
            assert.deepEqual(target.lastArgs, args);
         });
      });

      describe('.fromJSON()', function() {
         it('should call the same method on clone\'s target if original already called', function() {
            var source = new PrefetchProxy({
                  target: target,
                  data: {
                     read: {foo: 'bar'}
                  }
               }),
               clone,
               json,
               args;

            args = ['foo', 1];
            source.read.apply(source, args);

            json = source.toJSON();
            clone = PrefetchProxy.prototype.fromJSON.call(PrefetchProxy, json);

            args = ['bar', 2];
            clone.read.apply(clone, args);
            assert.equal(target.lastMethod, 'read');
            assert.deepEqual(target.lastArgs, args);
         });
      });
   });
});
