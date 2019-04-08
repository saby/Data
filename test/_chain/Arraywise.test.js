/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_chain/Arraywise'
], function(
   ArrayChainEs
) {
   'use strict';

   var ArrayChain = ArrayChainEs.default;

   describe('Types/_chain/Arraywise', function() {
      var items,
         chain;

      beforeEach(function() {
         items = ['one', 'two', 'three'];
         chain = new ArrayChain(items);
      });

      afterEach(function() {
         chain.destroy();
         chain = undefined;
         items = undefined;
      });

      describe('.constructor()', function() {
         it('should throw an error on invalid argument', function() {
            assert.throws(function() {
               new ArrayChain();
            }, TypeError);
            assert.throws(function() {
               new ArrayChain({});
            }, TypeError);
            assert.throws(function() {
               new ArrayChain('');
            }, TypeError);
            assert.throws(function() {
               new ArrayChain(0);
            }, TypeError);
            assert.throws(function() {
               new ArrayChain(null);
            }, TypeError);
         });
      });

      describe('.start', function() {
         it('should return itself for first element', function() {
            assert.strictEqual(chain.start, chain);
         });

         it('should return first element for second element', function() {
            assert.strictEqual(chain.reverse().start, chain);
         });
      });

      describe('.getEnumerator()', function() {
         it('should return enumerator with all items', function() {
            var enumerator = chain.getEnumerator(),
               index = 0;
            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), items[index]);
               index++;
            }
            assert.strictEqual(index, items.length);
         });
      });

      describe('.each()', function() {
         it('should return all items', function() {
            var index = 0;
            chain.each(function(item, itemIndex) {
               assert.strictEqual(item, items[index]);
               assert.strictEqual(itemIndex, index);
               index++;
            });
            assert.strictEqual(index, items.length);
         });
      });

      describe('.value()', function() {
         it('should return all items as array', function() {
            assert.deepEqual(chain.value(), items);
         });

         it('should return type from given factory', function() {
            var Type = function(items) {
                  this.items = items;
               },
               factory = function(items) {
                  return new Type(items);
               },
               result;

            result = chain.value(factory);
            assert.instanceOf(result, Type);
            assert.instanceOf(result.items, ArrayChain);
         });

         it('should pass arguments to the factory', function() {
            var factory = function() {
                  return arguments;
               },
               arg1 = 'foo',
               arg2 = 'bar',
               result;

            result = chain.value(factory, arg1, arg2);
            assert.instanceOf(result[0], ArrayChain);
            assert.equal(result[1], arg1);
            assert.equal(result[2], arg2);
         });
      });

      describe('.toArray()', function() {
         it('should return all items', function() {
            assert.deepEqual(chain.toArray(), items);
         });
      });

      describe('.toObject()', function() {
         it('should return array-like items', function() {
            var obj = chain.toObject();
            for (var i = 0; i < items.length; i++) {
               assert.strictEqual(obj[i], items[i]);
            }
         });
      });

      describe('.reduce()', function() {
         it('should return summary', function() {
            var items = [1, 2, 3],
               chain = new ArrayChain(items),
               result;

            result = chain.reduce(function(prev, curr) {
               return prev + curr;
            });
            assert.strictEqual(result, 1 + 2 + 3);
         });

         it('should return summary with offset', function() {
            var items = [1, 2, 3],
               chain = new ArrayChain(items),
               result;

            result = chain.reduce(function(prev, curr) {
               return prev + curr;
            }, 10);
            assert.strictEqual(result, 10 + 1 + 2 + 3);
         });
      });

      describe('.reduceRight()', function() {
         it('should return division', function() {
            var items = [2, 5, 2, 100],
               chain = new ArrayChain(items),
               result;

            result = chain.reduceRight(function(prev, curr) {
               return prev / curr;
            });
            assert.strictEqual(result, 100 / 2 / 5 / 2);
         });

         it('should return division with offset', function() {
            var items = [5, 2, 100],
               chain = new ArrayChain(items),
               result;

            result = chain.reduceRight(function(prev, curr) {
               return prev / curr;
            }, 15000);
            assert.strictEqual(result, 15000 / 100 / 2 / 5);
         });
      });

      describe('.map()', function() {
         it('should convert chain to the indices', function() {
            var index = 0;
            chain.map(function(item, itemIndex) {
               return itemIndex;
            }).each(function(item) {
               assert.strictEqual(item, index);
               index++;
            });
            assert.strictEqual(index, items.length);
         });

         it('should convert chain to the pairs', function() {
            var index = 0;
            chain.map(function(item, itemIndex) {
               return [item, itemIndex];
            }).each(function(item) {
               assert.strictEqual(item[0], items[index]);
               assert.strictEqual(item[1], index);
               index++;
            });
            assert.strictEqual(index, items.length);
         });
      });

      describe('.zip()', function() {
         it('should zip the collections', function() {
            var index = 0,
               expect = [['one', 1, true], ['two', 2, true], ['three', 3, false]];

            chain.zip([1, 2, 3], [true, true, false]).each(function(item) {
               assert.deepEqual(item, expect[index]);
               index++;
            });
            assert.strictEqual(index, expect.length);
         });
      });

      describe('.zipObject()', function() {
         it('should zip the collections', function() {
            assert.deepEqual(
               chain.zipObject([1, 2, 3]),
               {one: 1, two: 2, three: 3}
            );
         });
      });

      describe('.pluck()', function() {
         it('should convert chain to the array of sting', function() {
            var items = [{name: 'one'}, {name: 'two'}, {name: 'three'}],
               chain = new ArrayChain(items),
               index = 0;

            chain.pluck('name').each(function(item) {
               assert.strictEqual(item, items[index].name);
               index++;
            });
            assert.strictEqual(index, items.length);
         });
      });

      describe('.invoke()', function() {
         it('should convert chain to the array of sting', function() {
            var items = ['What', 'you', 'see', 'is', 'what', 'you', 'get'],
               chain = new ArrayChain(items),
               index = 0;

            chain.invoke('substr', 0, 1).each(function(item) {
               assert.strictEqual(item, items[index][0]);
               index++;
            });
            assert.strictEqual(index, items.length);
         });
      });

      describe('.concat()', function() {
         it('should concat the chain with the array', function() {
            var items = [1, 2, 3],
               concat1 = [4, 5],
               concat2 = [6],
               expect = [1, 2, 3, 4, 5, 6],
               chain = new ArrayChain(items),
               index = 0;

            chain.concat(concat1, concat2).each(function(item) {
               assert.strictEqual(item, expect[index]);
               index++;
            });
            assert.strictEqual(index, expect.length);
         });
      });

      describe('.flatten()', function() {
         it('should convert nested chain to the array', function() {
            var items = [1, [2], [3, [[4, [5]]]]],
               expect = [1, 2, 3, 4, 5],
               chain = new ArrayChain(items),
               index = 0;

            chain.flatten().each(function(item) {
               assert.strictEqual(item, expect[index]);
               index++;
            });
            assert.strictEqual(index, expect.length);
         });
      });

      describe('.uniq()', function() {
         it('should return unique items', function() {
            var items = [1, 2, 3, 2, 1, 0],
               expect = [1, 2, 3, 0],
               chain = new ArrayChain(items),
               index = 0;

            chain.uniq().each(function(item) {
               assert.strictEqual(item, expect[index]);
               index++;
            });
            assert.strictEqual(index, expect.length);
         });

         it('should return items with unique property values', function() {
            var items = [
                  {id: 1, title: 'a'},
                  {id: 2, title: 'b'},
                  {id: 3, title: 'a'},
                  {id: 4, title: 'c'}
               ],
               expect = [1, 2, 4],
               chain = new ArrayChain(items),
               index = 0;

            chain.uniq(function(item) {
               return item.title;
            }).each(function(item) {
               assert.strictEqual(item.id, expect[index]);
               index++;
            });
            assert.strictEqual(index, expect.length);
         });
      });

      describe('.union()', function() {
         it('should union with the array', function() {
            var items = [1, 2, 3],
               union = [0, 1, 2, 3, 4, 5],
               expect = [1, 2, 3, 0, 4, 5],
               chain = new ArrayChain(items),
               index = 0;

            chain.union(union).each(function(item) {
               assert.strictEqual(item, expect[index]);
               index++;
            });
            assert.strictEqual(index, expect.length);
         });
      });

      describe('.filter()', function() {
         it('should filter chain by item', function() {
            var expect = ['three'],
               index = 0;

            chain.filter(function(item) {
               return item === 'three';
            }).each(function(item) {
               assert.strictEqual(item, expect[index]);
               index++;
            });

            assert.strictEqual(index, expect.length);
         });

         it('should filter chain by index', function() {
            var expect = ['two'],
               index = 0;

            chain.filter(function(item, index) {
               return index === 1;
            }).each(function(item) {
               assert.strictEqual(item, expect[index]);
               index++;
            });

            assert.strictEqual(index, expect.length);
         });
      });

      describe('.reject()', function() {
         it('should filter chain in negative logic', function() {
            var expect = ['one', 'two'],
               index = 0;

            chain.reject(function(item) {
               return item === 'three';
            }).each(function(item) {
               assert.strictEqual(item, expect[index]);
               index++;
            });

            assert.strictEqual(index, expect.length);
         });
      });

      describe('.where()', function() {
         it('should filter chain in "and" logic', function() {
            var items = [
                  {id: 1, title: 'foo', genre: 'bar'},
                  {id: 2, title: 'fooz', genre: 'baz'},
                  {id: 3, title: 'foo', genre: 'bar'},
                  {id: 2, title: 'foox', genre: 'baz'}
               ],
               expect = [items[0], items[2]],
               chain = new ArrayChain(items),
               result;

            result = chain.where({
               title: 'foo',
               genre: 'bar'
            }).value();

            assert.deepEqual(result, expect);
         });
      });

      describe('.reverse()', function() {
         it('should reverse chain', function() {
            var result = chain.reverse().value(),
               expect = items.slice();

            expect.reverse();
            assert.deepEqual(result, expect);
         });
      });

      describe('.first()', function() {
         it('should return first item', function() {
            assert.equal(chain.first(), items[0]);
         });

         it('should return first "n" items', function() {
            assert.deepEqual(chain.first(2).value(), items.slice(0, 2));
         });
      });

      describe('.last()', function() {
         it('should return last item', function() {
            assert.equal(chain.last(), items[items.length - 1]);
         });

         it('should return last "n" items', function() {
            assert.deepEqual(chain.last(2).value(), items.slice(-2));
         });
      });

      describe('.sort()', function() {
         it('should sort chain', function() {
            var result = chain.sort().value(),
               expect = items.slice();

            expect.sort();
            assert.deepEqual(result, expect);
         });
      });
   });
});
