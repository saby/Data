/* global define, beforeEach, afterEach, describe, context, it, assert */
define([
   'Types/_collection/enumerableComparator',
   'Types/_collection/List',
   'Types/_collection/IObservable'
], function(
   comparatorEs,
   ListEs,
   IBindCollectionEs
) {
   'use strict';

   var comparator = comparatorEs.default;
   var List = ListEs.default;
   var IBindCollection = IBindCollectionEs.default;

   describe('Types/_collection/Comparer', function() {
      var items,
         list;

      beforeEach(function() {
         items = ['a', 'b', 'c', 'd', 'e', 'f'];
         list = new List({items: items});
      });

      afterEach(function() {
         items = undefined;
         list = undefined;
      });

      describe('.startSession()', function() {
         it('should return before items', function() {
            var session = comparator.startSession(list);
            list.each(function(item, index) {
               assert.strictEqual(item, session.before[index]);
            });
         });
      });

      describe('.finishSession()', function() {
         it('should return after items', function() {
            var session = comparator.startSession(list);

            comparator.finishSession(session, list);
            list.each(function(item, index) {
               assert.strictEqual(item, session.after[index]);
            });
         });
      });

      describe('.analizeSession()', function() {
         var session,
            checkPack = function(action, changes, expect, fireIndex) {
               var i;

               assert.strictEqual(action, expect.action, 'Invalid action at change #' + fireIndex);

               if (expect.newItems) {
                  assert.strictEqual(changes.newItems.length, expect.newItems.length, 'Invalid newItems length at change #' + fireIndex);
                  for (i = 0; i < expect.newItems.length; i++) {
                     assert.strictEqual(changes.newItems[i], expect.newItems[i], 'Invalid newItems[' + i + '] at change #' + fireIndex);
                  }
               }
               if (expect.hasOwnProperty('newItemsIndex')) {
                  assert.strictEqual(changes.newItemsIndex, expect.newItemsIndex, 'Invalid newItemsIndex at change #' + fireIndex);
               }

               if (expect.oldItems) {
                  assert.strictEqual(changes.oldItems.length, expect.oldItems.length, 'Invalid oldItems length at change #' + fireIndex);
                  for (i = 0; i < expect.oldItems.length; i++) {
                     assert.strictEqual(changes.oldItems[i], expect.oldItems[i], 'Invalid oldItems[' + i + '] at change #' + fireIndex);
                  }
               }
               if (expect.hasOwnProperty('oldItemsIndex')) {
                  assert.strictEqual(changes.oldItemsIndex, expect.oldItemsIndex, 'Invalid oldItemsIndex at change #' + fireIndex);
               }
            },
            check = function(expect) {
               var fireIndex = 0;

               comparator.finishSession(session, list);
               comparator.analizeSession(session, list, function(action, changes) {
                  assert.isDefined(expect[fireIndex], 'Unexpected event at change #' + fireIndex);
                  checkPack(action, changes, expect[fireIndex], fireIndex);
                  fireIndex++;
               });

               assert.strictEqual(fireIndex, expect.length, 'Invalid events count at change #' + fireIndex);
            };

         beforeEach(function() {
            session = comparator.startSession(list);
         });

         afterEach(function() {
            session = undefined;
         });

         it('should notify about added item', function() {
            list.add('new', 1);

            check([{
               action: IBindCollection.ACTION_ADD,
               newItems: ['new'],
               newItemsIndex: 1
            }]);
         });

         it('should notify about added items', function() {
            list.add('new1', 0);
            list.add('new2', 5);

            check([{
               action: IBindCollection.ACTION_ADD,
               newItems: ['new1'],
               newItemsIndex: 0
            }, {
               action: IBindCollection.ACTION_ADD,
               newItems: ['new2'],
               newItemsIndex: 5
            }]);
         });

         it('should notify about added sequence', function() {
            list.add('new1', 0);
            list.add('new2', 1);
            list.add('new3', 4);
            list.add('new4', 5);

            check([{
               action: IBindCollection.ACTION_ADD,
               newItems: ['new1', 'new2'],
               newItemsIndex: 0
            }, {
               action: IBindCollection.ACTION_ADD,
               newItems: ['new3', 'new4'],
               newItemsIndex: 4
            }]);
         });

         it('should notify about added in reordered sequence', function() {
            //a, b, c, d, e, f
            list.add(list.removeAt(0), 2);
            list.add(list.removeAt(0), 3);

            //c, a, d, b, e, f

            list.add('new1', 1);
            list.add('new2', 2);
            list.add('new3', 4);
            list.add('new4', 5);

            //c, new1, new2, a, new3, new4, d, b, e, f

            check([{
               action: IBindCollection.ACTION_ADD, //a, new1, new2, b, c, d, e, f
               newItems: ['new1', 'new2'],
               newItemsIndex: 1
            }, {
               action: IBindCollection.ACTION_ADD, //a, new1, new2, b, new3, new4, c, d, e, f
               newItems: ['new3', 'new4'],
               newItemsIndex: 4
            }, {
               action: IBindCollection.ACTION_MOVE, //c, a, new1, new2, b, new3, new4, d, e, f
               newItems: ['c'],
               newItemsIndex: 0,
               oldItemsIndex: 6
            }, {
               action: IBindCollection.ACTION_MOVE, //c, new1, new2, a, b, new3, new4, d, e, f
               newItems: ['new1', 'new2'],
               newItemsIndex: 1,
               oldItemsIndex: 2
            }, {
               action: IBindCollection.ACTION_MOVE, //c, new1, new2, a, new3, new4, d, b, e, f
               newItems: ['new3', 'new4', 'd'],
               newItemsIndex: 4,
               oldItemsIndex: 5
            }]);
         });

         it('should notify about removed item', function() {
            list.removeAt(1);//b

            check([{
               action: IBindCollection.ACTION_REMOVE,
               oldItems: ['b'],
               oldItemsIndex: 1
            }]);
         });

         it('should notify about removed items', function() {
            list.removeAt(0);//a
            list.removeAt(1);//c

            check([{
               action: IBindCollection.ACTION_REMOVE,
               oldItems: ['a'],
               oldItemsIndex: 0
            }, {
               action: IBindCollection.ACTION_REMOVE,
               oldItems: ['c'],
               oldItemsIndex: 1
            }]);
         });

         it('should notify about removed sequence', function() {
            list.removeAt(0);//a
            list.removeAt(0);//b
            list.removeAt(1);//d
            list.removeAt(1);//e

            check([{
               action: IBindCollection.ACTION_REMOVE,
               oldItems: ['a', 'b'],
               oldItemsIndex: 0
            }, {
               action: IBindCollection.ACTION_REMOVE,
               oldItems: ['d', 'e'],
               oldItemsIndex: 1
            }]);
         });

         it('should notify about moved forward item', function() {
            list.add(
               list.removeAt(0),
               2
            );//[a]: 0->2 is equal to [b, c]: 1->0

            check([{
               action: IBindCollection.ACTION_MOVE,
               oldItems: ['b', 'c'],
               oldItemsIndex: 1,
               newItems: ['b', 'c'],
               newItemsIndex: 0
            }]);
         });

         it('should notify about moved backward item', function() {
            list.add(
               list.removeAt(2),
               0
            );//[c]: 2->0

            check([{
               action: IBindCollection.ACTION_MOVE,
               oldItems: ['c'],
               oldItemsIndex: 2,
               newItems: ['c'],
               newItemsIndex: 0
            }]);
         });

         it('should notify about moved items', function() {
            list.add(
               list.removeAt(0),
               2
            );//a: 0->2 is equal to [b, c]: 1->0
            list.add(
               list.removeAt(5),
               4
            );//f: 5->4

            check([{
               action: IBindCollection.ACTION_MOVE,
               oldItems: ['b', 'c'],
               oldItemsIndex: 1,
               newItems: ['b', 'c'],
               newItemsIndex: 0
            }, {
               action: IBindCollection.ACTION_MOVE,
               oldItems: ['f'],
               oldItemsIndex: 5,
               newItems: ['f'],
               newItemsIndex: 4
            }]);
         });

         it('should notify about moved sequence', function() {
            list.add(
               list.removeAt(0),
               2
            );
            list.add(
               list.removeAt(0),
               2
            );

            //[a]: 0->2, [b]: 0->2 is equal to [c]: 2->0

            check([{
               action: IBindCollection.ACTION_MOVE,
               oldItems: ['c'],
               oldItemsIndex: 2,
               newItems: ['c'],
               newItemsIndex: 0
            }]);
         });

         it('should work with a lot of elements', function() {
            var arr = [],
               i = 0,
               list,
               session;

            while (i < 1100) {
               arr.push(i++);
            }
            list = new List({items: arr});
            session = comparator.startSession(list);
            arr.sort();
            comparator.finishSession(session, list);
            comparator.analizeSession(session, list);
         });

         context('if has duplicates before', function() {
            beforeEach(function() {
               list.add('b');
               list.add('a');
               list.add('a');

               //a, b, c, d, e, f, b, a, a
               session = comparator.startSession(list);
            });

            it('should notify about added duplicates', function() {
               list.add('a', 0);
               list.add('b', 8);
               list.add('b', 8);
               check([{
                  action: IBindCollection.ACTION_ADD,
                  newItems: ['b', 'b'],
                  newItemsIndex: 8
               }, {
                  action: IBindCollection.ACTION_ADD,
                  newItems: ['a'],
                  newItemsIndex: 11
               }, {
                  action: IBindCollection.ACTION_MOVE,
                  oldItems: ['a'],
                  oldItemsIndex: 7,
                  newItems: ['a'],
                  newItemsIndex: 1
               }]);
            });

            it('should notify about removed first duplicate', function() {
               //a, b, c, d, e, f, b, a, a
               list.removeAt(0);//a
               //b, c, d, e, f, b, a, a

               check([{
                  action: IBindCollection.ACTION_REMOVE,
                  oldItems: ['a'],
                  oldItemsIndex: 8
               }, {
                  action: IBindCollection.ACTION_MOVE,
                  oldItems: ['b', 'c', 'd', 'e', 'f', 'b', 'a'],
                  oldItemsIndex: 1,
                  newItemsIndex: 0
               }]);
            });

            it('should notify about removed last duplicate', function() {
               list.removeAt(8);//a

               check([{
                  action: IBindCollection.ACTION_REMOVE,
                  oldItems: ['a'],
                  oldItemsIndex: 8
               }]);
            });

            it('should notify about removed several duplicates', function() {
               //a, b, c, d, e, f, b, a, a
               list.removeAt(0);//a
               list.removeAt(7);//a
               //b, c, d, e, f, b, a

               check([{
                  action: IBindCollection.ACTION_REMOVE,
                  oldItems: ['a', 'a'],
                  oldItemsIndex: 7
               }, {
                  action: IBindCollection.ACTION_MOVE,
                  oldItems: ['b', 'c', 'd', 'e', 'f', 'b'],
                  oldItemsIndex: 1,
                  newItemsIndex: 0
               }]);
            });
         });

         context('if has duplicates after', function() {
            it('should notify about added duplicates', function() {
               //a, b, c, d, e, f
               list.add('a', 0);
               list.add('b', 5);
               list.add('b', 6);

               //a, a, b, c, d, b, b, e, f

               check([{
                  action: IBindCollection.ACTION_ADD,
                  newItems: ['a'],
                  newItemsIndex: 1
               }, {
                  action: IBindCollection.ACTION_ADD,
                  newItems: ['b', 'b'],
                  newItemsIndex: 5
               }]);
            });

            it('should notify about removed first duplicate', function() {
               //a, b, c, d, e, f
               list.add('a');
               list.add('b');
               list.removeAt(0);//a
               //b, c, d, e, f, a, b

               check([{
                  action: IBindCollection.ACTION_ADD,
                  newItems: ['b'],
                  newItemsIndex: 6
               }, {
                  action: IBindCollection.ACTION_MOVE,
                  oldItems: ['b', 'c', 'd', 'e', 'f'],
                  oldItemsIndex: 1,
                  newItemsIndex: 0
               }]);
            });

            it('should notify about removed last duplicate', function() {
               //a, b, c, d, e, f
               list.add('a', 0);
               list.add('b', 0);
               list.removeAt(2);//a
               //b, a, b, c, d, e, f

               check([{
                  action: IBindCollection.ACTION_ADD,
                  newItems: ['b'],
                  newItemsIndex: 2
               }, {
                  action: IBindCollection.ACTION_MOVE,
                  oldItems: ['b'],
                  oldItemsIndex: 1,
                  newItemsIndex: 0
               }]);
            });

            it('should notify about removed several duplicates', function() {
               //a, b, c, d, e, f
               list.add('a', 0);
               list.add('b', 0);
               list.removeAt(0);//b
               list.removeAt(2);//b
               //a, a, c, d, e, f

               check([{
                  action: IBindCollection.ACTION_REMOVE,
                  oldItems: ['b'],
                  oldItemsIndex: 1
               }, {
                  action: IBindCollection.ACTION_ADD,
                  newItems: ['a'],
                  newItemsIndex: 1
               }]);
            });

            it('should notify about moved duplicates', function() {
               //a, b, c, d, e, f
               list.removeAt(1);//b
               list.add('b', 2);
               list.add('b', 2);
               list.add('b', 5);

               //a, c, b, b, d, b, e, f

               check([{
                  action: IBindCollection.ACTION_ADD, //a, b, c, b, d, e, f
                  newItems: ['b'],
                  newItemsIndex: 3
               }, {
                  action: IBindCollection.ACTION_ADD, //a, b, c, b, d, b, e, f
                  newItems: ['b'],
                  newItemsIndex: 5
               }, {
                  action: IBindCollection.ACTION_MOVE, //a, c, b, b, d, b, e, f
                  oldItems: ['c', 'b'],
                  oldItemsIndex: 2,
                  newItemsIndex: 1
               }]);
            });
         });
      });
   });
});
