/* global define, describe, it, assert */
define([
   'Types/_chain/factory',
   'Types/_chain/Abstract',
   'Types/_chain/Arraywise',
   'Types/_chain/Objectwise',
   'Types/_chain/Enumerable',
   'Types/_collection/List'
], function(
   chainEs,
   AbstractChainEs,
   ArrayChainEs,
   ObjectChainEs,
   EnumerableChainEs,
   ListEs
) {
   'use strict';

   var chain = chainEs.default;
   var AbstractChain = AbstractChainEs.default;
   var ArrayChain = ArrayChainEs.default;
   var ObjectChain = ObjectChainEs.default;
   var EnumerableChain = EnumerableChainEs.default;
   var List = ListEs.default;

   describe('Types/Chain', function() {
      describe('.constructor()', function() {
         it('should return chain back', function() {
            var abstractChain = new AbstractChain({});
            assert.strictEqual(chain(abstractChain), abstractChain);
         });

         it('should return ArrayChain', function() {
            assert.instanceOf(chain([]), ArrayChain);
         });

         it('should return ObjectChain', function() {
            assert.instanceOf(chain({}), ObjectChain);
         });

         it('should return EnumerableChain', function() {
            assert.instanceOf(chain(new List()), EnumerableChain);
         });
      });

      describe('.group()', function() {
         it('should group elements', function() {
            var result = chain([
               {title: 'Apple', kind: 'fruit'},
               {title: 'Cherry', kind: 'fruit'},
               {title: 'Cucumber', kind: 'vegetable'},
               {title: 'Pear', kind: 'fruit'},
               {title: 'Potato', kind: 'vegetable'}
            ]).group('kind', 'title').toObject();

            assert.deepEqual(result, {
               fruit: ['Apple', 'Cherry', 'Pear'],
               vegetable: ['Cucumber', 'Potato']
            });
         });
      });

      describe('.count()', function() {
         it('should count all elements', function() {
            var result = chain([1, 2, 3]).count();
            assert.equal(result, 3);
         });

         it('should count aggregated elements', function() {
            var result = chain([1, 2, 3]).count(function(item) {
               return item % 2 === 0;
            }).value();
            assert.deepEqual(result, [2, 1]);
         });
      });

      describe('.max()', function() {
         it('should return maximum value', function() {
            var result = chain([1, 2, 3]).max();
            assert.equal(result, 3);
         });

         it('should return first value', function() {
            var result = chain([2]).max();
            assert.equal(result, 2);
         });

         it('should return undefined for empty collection', function() {
            var result = chain([]).max();
            assert.isUndefined(result);
         });
      });

      describe('.min()', function() {
         it('should return minimum value', function() {
            var result = chain([1, 2, 3]).min();
            assert.equal(result, 1);
         });

         it('should return first value', function() {
            var result = chain([2]).min();
            assert.equal(result, 2);
         });

         it('should return undefined for empty collection', function() {
            var result = chain([]).min();
            assert.isUndefined(result);
         });
      });
   });
});
