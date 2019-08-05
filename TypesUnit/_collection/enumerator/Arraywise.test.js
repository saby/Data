/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_collection/enumerator/Arraywise'
], function(
   ArrayEnumeratorEs
) {
   'use strict';

   var ArrayEnumerator = ArrayEnumeratorEs.default;

   describe('Types/_collection/enumerator/Arraywise', function() {
      var items;

      beforeEach(function() {
         items = [{
            'Ид': 1,
            'Фамилия': 'Иванов',
            'Пол': 'м'
         }, {
            'Ид': 2,
            'Фамилия': 'Петров',
            'Пол': 'м'
         }, {
            'Ид': 4,
            'Фамилия': 'Иванова',
            'Пол': 'ж'
         }, {
            'Ид': 3,
            'Фамилия': 'Сидоров',
            'Пол': 'м'
         }];
      });

      afterEach(function() {
         items = undefined;
      });

      describe('constructor()', function() {
         it('should throw an error on invalid argument', function() {
            assert.throws(function() {
               new ArrayEnumerator({});
            });
            assert.throws(function() {
               new ArrayEnumerator('');
            });
            assert.throws(function() {
               new ArrayEnumerator(0);
            });
            assert.throws(function() {
               new ArrayEnumerator(null);
            });
         });
      });

      describe('.getCurrent()', function() {
         it('should return undefined by default', function() {
            var enumerator = new ArrayEnumerator();
            assert.isUndefined(enumerator.getCurrent());
         });
         it('should return item by item', function() {
            var enumerator = new ArrayEnumerator(items),
               index = -1;
            while (enumerator.moveNext()) {
               index++;
               assert.strictEqual(items[index], enumerator.getCurrent());
            }
            assert.strictEqual(items[items.length - 1], enumerator.getCurrent());
         });
      });

      describe('.getCurrentIndex()', function() {
         it('should return -1 by default', function() {
            var enumerator = new ArrayEnumerator();
            assert.equal(enumerator.getCurrentIndex(), -1);
         });
         it('should return item by item', function() {
            var enumerator = new ArrayEnumerator(items),
               index = -1;
            while (enumerator.moveNext()) {
               index++;
               assert.strictEqual(index, enumerator.getCurrentIndex());
            }
         });
      });

      describe('.moveNext()', function() {
         it('should return false for empty list', function() {
            var enumerator = new ArrayEnumerator();
            assert.isFalse(enumerator.moveNext());
         });
         it('should return item by item', function() {
            var enumerator = new ArrayEnumerator(items),
               index = 0;
            while (enumerator.moveNext()) {
               assert.strictEqual(items[index], enumerator.getCurrent());
               index++;
            }
         });
      });

      describe('.reset()', function() {
         it('should set current to undefined', function() {
            var enumerator = new ArrayEnumerator(items);
            enumerator.moveNext();
            assert.isDefined(enumerator.getCurrent());
            enumerator.reset();
            assert.isUndefined(enumerator.getCurrent());
         });

         it('should start enumeration from beginning', function() {
            var enumerator = new ArrayEnumerator(items),
               index;

            enumerator.moveNext();
            var firstOne = enumerator.getCurrent();
            enumerator.reset();
            enumerator.moveNext();
            assert.strictEqual(firstOne, enumerator.getCurrent());

            enumerator.reset();
            index = 0;
            while (enumerator.moveNext()) {
               assert.strictEqual(items[index], enumerator.getCurrent());
               index++;
            }
         });
      });

      describe('.setResolver()', function() {
         it('should return result from given function', function() {
            var enumerator = new ArrayEnumerator(items),
               count = 0;
            enumerator.setResolver(function(index) {
               return items[index]['Ид'];
            });
            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), items[count]['Ид']);
               count++;
            }
            assert.strictEqual(count, items.length);
         });
      });

      describe('.setFilter()', function() {
         it('should force return only filtered items', function() {
            var enumerator = new ArrayEnumerator(items),
               count = 0;
            enumerator.setFilter(function(item) {
               return item['Ид'] < 3;
            });
            while (enumerator.moveNext()) {
               assert.isBelow(enumerator.getCurrent()['Ид'], 3);
               count++;
            }
            assert.strictEqual(count, 2);
         });
      });

      describe('.getIndexByValue()', function() {
         it('should return item index with given property', function() {
            var enumerator = new ArrayEnumerator(items);
            for (var i = 0; i < items.length; i++) {
               assert.strictEqual(
                  i,
                  enumerator.getIndexByValue('Ид', items[i]['Ид'])
               );
               assert.strictEqual(
                  i,
                  enumerator.getIndexByValue('Фамилия', items[i]['Фамилия'])
               );
            }
         });
         it('should return -1 with not exists property', function() {
            var enumerator = new ArrayEnumerator(items);
            assert.strictEqual(
               -1,
               enumerator.getIndexByValue('Ид', 0)
            );
         });
         it('should return -1 for not a property name', function() {
            var enumerator = new ArrayEnumerator(items);
            assert.strictEqual(-1, enumerator.getIndexByValue());
            assert.strictEqual(-1, enumerator.getIndexByValue(null));
            assert.strictEqual(-1, enumerator.getIndexByValue(false));
            assert.strictEqual(-1, enumerator.getIndexByValue(0));
            assert.strictEqual(-1, enumerator.getIndexByValue(''));
         });
         it('should work fine with names from Object.prototype', function() {
            var items = [{
                  'constructor': 'a'
               }, {
                  'hasOwnProperty': 1
               }, {
                  'toString': false
               }, {
                  'isPrototypeOf': null
               }],
               enumerator = new ArrayEnumerator(items);
            for (var i = 0; i < items.length; i++) {
               for (var k in items[i]) {
                  if (Object.prototype.hasOwnProperty.call(items[i], k)) {
                     assert.strictEqual(
                        i,
                        enumerator.getIndexByValue(k, items[i][k])
                     );
                  }
               }
            }
         });
         it('should work fine with values from Object.prototype', function() {
            var items = [{
                  id: 'constructor'
               }, {
                  id: 'hasOwnProperty'
               }, {
                  id: 'toString'
               }, {
                  id: 'isPrototypeOf'
               }],
               enumerator = new ArrayEnumerator(items);
            for (var i = 0; i < items.length; i++) {
               assert.strictEqual(
                  i,
                  enumerator.getIndexByValue('id', items[i].id)
               );
            }
         });
      });

      describe('.getIndicesByValue()', function() {
         it('should return items indexes with given property', function() {
            var enumerator = new ArrayEnumerator(items);
            assert.deepEqual(
               [0],
               enumerator.getIndicesByValue('Ид', 1)
            );
            assert.deepEqual(
               [0, 1, 3],
               enumerator.getIndicesByValue('Пол', 'м')
            );
            assert.deepEqual(
               [2],
               enumerator.getIndicesByValue('Пол', 'ж')
            );
         });
         it('should return no indexes with not exists property', function() {
            var enumerator = new ArrayEnumerator(items);
            assert.strictEqual(
               0,
               enumerator.getIndicesByValue('Ид', 0).length
            );
         });
      });
   });
});
