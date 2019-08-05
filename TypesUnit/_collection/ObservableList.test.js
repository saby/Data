/* global define, beforeEach, afterEach, describe, context, it, assert */
define([
   'Types/_collection/ObservableList',
   'Types/_collection/List',
   'Types/_collection/IObservable',
   'Types/_entity/Record',
   'Types/_entity/adapter/Json'
], function(
   ObservableList,
   List,
   IBindCollection,
   Record
) {
   'use strict';

   ObservableList = ObservableList.default;
   List = List.default;
   IBindCollection = IBindCollection.default;
   Record = Record.default;

   describe('Types/_collection/ObservableList', function() {
      var items,
         checkEvent = function(
            action, newItems, newItemsIndex, oldItems, oldItemsIndex,
            actionOriginal, newItemsOriginal, newItemsIndexOriginal, oldItemsOriginal, oldItemsIndexOriginal
         ) {
            var i;

            if (action !== actionOriginal) {
               throw new Error('Invalid action');
            }

            for (i = 0; i < newItems.length; i++) {
               if (newItems[i] !== newItemsOriginal[i]) {
                  throw new Error('Invalid newItems');
               }
            }
            if (newItemsIndex !== newItemsIndexOriginal) {
               throw new Error('Invalid newItemsIndex');
            }

            for (i = 0; i < oldItems.length; i++) {
               if (oldItems[i] !== oldItemsOriginal[i]) {
                  throw new Error('Invalid oldItems');
               }
            }
            if (oldItemsIndex !== oldItemsIndexOriginal) {
               throw new Error('Invalid oldItemsIndex');
            }
         };

      beforeEach(function() {
         items = [{
            'Ид': 1,
            'Фамилия': 'Иванов'
         }, {
            'Ид': 2,
            'Фамилия': 'Петров'
         }, {
            'Ид': 3,
            'Фамилия': 'Сидоров'
         }, {
            'Ид': 4,
            'Фамилия': 'Пухов'
         }, {
            'Ид': 5,
            'Фамилия': 'Молодцов'
         }, {
            'Ид': 6,
            'Фамилия': 'Годолцов'
         }, {
            'Ид': 7,
            'Фамилия': 'Арбузнов'
         }];
      });

      afterEach(function() {
         items = undefined;
      });

      describe('.append()', function() {
         it('should trigger an event with valid arguments', function(done) {
            var list = new ObservableList({
                  items: items.slice()
               }),
               concatItems = [1, 2, 3],
               handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                  try {
                     checkEvent(
                        action, newItems, newItemsIndex, oldItems, oldItemsIndex,
                        IBindCollection.ACTION_ADD, concatItems, items.length, [], 0
                     );
                     done();
                  } catch (err) {
                     done(err);
                  }
               };
            list.subscribe('onCollectionChange', handler);

            list.append(new List({
               items: concatItems
            }));

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
         });
      });

      describe('.prepend', function() {
         it('should trigger an event with valid arguments', function(done) {
            var list = new ObservableList({
                  items: items.slice()
               }),
               concatItems = [4, 5, 6],
               handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                  try {
                     checkEvent(
                        action, newItems, newItemsIndex, oldItems, oldItemsIndex,
                        IBindCollection.ACTION_ADD, concatItems, 0, [], 0
                     );
                     done();
                  } catch (err) {
                     done(err);
                  }
               };

            list.subscribe('onCollectionChange', handler);

            list.prepend(new List({
               items: concatItems
            }));

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
         });
      });

      describe('.assign()', function() {
         it('should trigger an event with valid arguments', function(done) {
            var list = new ObservableList({
                  items: items.slice()
               }),
               fillItems = ['a', 'b'],
               handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                  try {
                     checkEvent(
                        action, newItems, newItemsIndex, oldItems, oldItemsIndex,
                        IBindCollection.ACTION_RESET, fillItems, 0, items, 0
                     );
                     done();
                  } catch (err) {
                     done(err);
                  }
               };

            list.subscribe('onCollectionChange', handler);

            list.assign(new List({
               items: fillItems
            }));

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
         });

         it('should trigger onCollectionItemChange with changed item after several assigns', function(done) {
            var list = new ObservableList(),
               items = [new Record(), new Record(), new Record()],
               firesToBeDone = 3,
               handler = function() {
                  firesToBeDone--;
                  if (firesToBeDone === 0) {
                     done();
                  }
               };
            list.subscribe('onCollectionItemChange', handler);
            list.assign(items);
            list.at(1).set('a', 1);
            list.assign(items);
            list.at(1).set('a', 2);
            list.assign(items);
            list.at(1).set('a', 3);
            list.unsubscribe('onCollectionItemChange', handler);
            list.destroy();
         });

         it('should dont trigger an event if empty replaced with empty', function() {
            var list = new ObservableList(),
               triggered = false,
               handler = function() {
                  triggered = true;
               };

            list.subscribe('onCollectionChange', handler);
            list.assign(new List());
            list.unsubscribe('onCollectionChange', handler);

            assert.isFalse(triggered);
         });
      });

      describe('.clear()', function() {
         it('should trigger an event with valid arguments', function(done) {
            var list = new ObservableList({
                  items: items.slice()
               }),
               handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                  try {
                     checkEvent(
                        action, newItems, newItemsIndex, oldItems, oldItemsIndex,
                        IBindCollection.ACTION_RESET, [], 0, items, 0
                     );
                     done();
                  } catch (err) {
                     done(err);
                  }
               };

            list.subscribe('onCollectionChange', handler);

            list.clear();

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
         });
      });

      describe('.add()', function() {
         context('when append', function() {
            it('should trigger an event with valid arguments', function(done) {
               var list = new ObservableList({
                     items: items.slice()
                  }),
                  andDone = false,
                  addIndex = items.length,
                  addItem,
                  handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                     try {
                        checkEvent(
                           action, newItems, newItemsIndex, oldItems, oldItemsIndex,
                           IBindCollection.ACTION_ADD, [addItem], addIndex, [], 0
                        );
                        if (andDone) {
                           done();
                        }
                     } catch (err) {
                        done(err);
                     }
                  };

               list.subscribe('onCollectionChange', handler);

               addItem = {'a': 1};
               list.add(addItem);

               addItem = {'a': 2};
               addIndex++;
               list.add(addItem);

               andDone = true;
               addItem = {'a': 3};
               addIndex++;
               list.add(addItem);

               list.unsubscribe('onCollectionChange', handler);
               list.destroy();
            });
         });

         context('when prepend', function() {
            it('should trigger an event with valid arguments', function(done) {
               var list = new ObservableList({
                     items: items.slice()
                  }),
                  andDone = false,
                  addItem,
                  handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                     try {
                        checkEvent(
                           action, newItems, newItemsIndex, oldItems, oldItemsIndex,
                           IBindCollection.ACTION_ADD, [addItem], 0, [], 0
                        );
                        if (andDone) {
                           done();
                        }
                     } catch (err) {
                        done(err);
                     }
                  };

               list.subscribe('onCollectionChange', handler);

               addItem = {'b': 1};
               list.add(addItem, 0);

               addItem = {'b': 2};
               list.add(addItem, 0);

               andDone = true;
               addItem = {'b': 3};
               list.add(addItem, 0);

               list.unsubscribe('onCollectionChange', handler);
               list.destroy();
            });
         });

         context('when insert', function() {
            it('should trigger an event with valid arguments', function(done) {
               var list = new ObservableList({
                     items: items.slice()
                  }),
                  andDone = false,
                  addItem,
                  at,
                  handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                     try {
                        checkEvent(
                           action, newItems, newItemsIndex, oldItems, oldItemsIndex,
                           IBindCollection.ACTION_ADD, [addItem], at, [], 0
                        );
                        if (andDone) {
                           done();
                        }
                     } catch (err) {
                        done(err);
                     }
                  };

               list.subscribe('onCollectionChange', handler);

               addItem = {'c': 1};
               at = 5;
               list.add(addItem, at);
               list.add(addItem, at);

               addItem = {'c': 2};
               at = 4;
               list.add(addItem, at);

               andDone = true;
               addItem = {'c': 3};
               at = 1;
               list.add(addItem, at);


               list.unsubscribe('onCollectionChange', handler);
               list.destroy();
            });
         });
      });

      describe('.removeAt()', function() {
         it('should trigger an event with valid arguments', function(done) {
            var list = new ObservableList({
                  items: items
               }),
               andDone = false,
               oldItem,
               at,
               handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                  try {
                     checkEvent(
                        action, newItems, newItemsIndex, oldItems, oldItemsIndex,
                        IBindCollection.ACTION_REMOVE, [], 0, [oldItem], at
                     );
                     if (andDone) {
                        done();
                     }
                  } catch (err) {
                     done(err);
                  }
               };

            list.subscribe('onCollectionChange', handler);

            at = 1;
            oldItem = list.at(at);
            list.removeAt(at);

            at = 1;
            oldItem = list.at(at);
            list.removeAt(at);

            andDone = true;
            at = 3;
            oldItem = list.at(at);
            list.removeAt(at);

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
         });

         it("shouldn't trigger an event with change item", function(done) {
            var list = new ObservableList({
                  items: []
               }),
               addItem = new Record({
                  rawData: {foo: 'fail'}
               }),
               handler = function() {
                  done();
               };

            list.add(addItem);
            list.removeAt(0);
            list.subscribe('onCollectionChange', handler);
            addItem.set('foo', 'ok');
            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
            done();
         });

         it('should trigger an event with change item and list had changed yet', function(done) {
            var list = new ObservableList({
                  items: items
               }),
               at,
               handler = function(event, action, newItems, newItemsIndex, oldItems) {
                  if (list.getIndex(oldItems[0]) === -1) {
                     done();
                  }
               };

            list.subscribe('onCollectionChange', handler);

            at = 1;
            list.removeAt(at);
         });

      });

      describe('.replace()', function() {
         it('should trigger an event with valid arguments', function(done) {
            var list = new ObservableList({
                  items: items.slice()
               }),
               andDone = false,
               oldItem,
               newItem,
               at,
               handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                  try {
                     checkEvent(
                        action, newItems, newItemsIndex, oldItems, oldItemsIndex,
                        IBindCollection.ACTION_REPLACE, [newItem], at, [oldItem], at
                     );
                     if (andDone) {
                        done();
                     }
                  } catch (err) {
                     done(err);
                  }
               };

            list.subscribe('onCollectionChange', handler);

            at = 1;
            oldItem = list.at(at);
            newItem = {'d': 1};
            list.replace(newItem, at);

            at = 5;
            oldItem = list.at(at);
            newItem = {'d': 2};
            list.replace(newItem, at);

            andDone = true;
            at = 3;
            oldItem = list.at(at);
            newItem = {'d': 3};
            list.replace(newItem, at);

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
         });

         it('should don\'t trigger an event if replace with itself', function() {
            var list = new ObservableList({
                  items: items.slice()
               }),
               fireCount = 0,
               handler = function() {
                  fireCount++;
               };

            list.subscribe('onCollectionChange', handler);
            list.each(function(item, at) {
               list.replace(item, at);
            });
            list.unsubscribe('onCollectionChange', handler);
            list.destroy();

            assert.strictEqual(fireCount, 0);
         });
      });

      describe('.move()', function() {
         it('should trigger an event with valid arguments', function(done) {
            var list = new ObservableList({
                  items: items.slice()
               }),
               andDone = false,
               oldItem,
               newItem,
               from,
               to,
               handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                  try {
                     checkEvent(
                        action, newItems, newItemsIndex, oldItems, oldItemsIndex,
                        IBindCollection.ACTION_MOVE, [newItem], to, [oldItem], from
                     );
                     if (andDone) {
                        done();
                     }
                  } catch (err) {
                     done(err);
                  }
               };

            list.subscribe('onCollectionChange', handler);

            from = 0;
            to = 1;
            newItem = oldItem = list.at(from);
            list.move(from, to);

            andDone = true;
            from = 2;
            to = 0;
            newItem = oldItem = list.at(from);
            list.move(from, to);

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
         });

         it('should don\'t trigger an event for equal positions', function() {
            var list = new ObservableList({
                  items: items.slice()
               }),
               fireCount = 0,
               handler = function() {
                  fireCount++;
               };

            list.subscribe('onCollectionChange', handler);
            list.move(0, 0);
            list.unsubscribe('onCollectionChange', handler);
            list.destroy();

            assert.strictEqual(fireCount, 0);
         });
      });

      describe('.getIndexByValue', function() {
         it('should update index after change item property', function() {
            var item = new Record({
                  rawData: {checked: false}
               }),
               list = new ObservableList({
                  items: [item]
               });

            assert.strictEqual(
               list.getIndexByValue('checked', false),
               0
            );
            assert.strictEqual(
               list.getIndexByValue('checked', true),
               -1
            );

            item.set('checked', true);
            assert.strictEqual(
               list.getIndexByValue('checked', false),
               -1
            );
            assert.strictEqual(
               list.getIndexByValue('checked', true),
               0
            );

            item.set('checked', false);
            assert.strictEqual(
               list.getIndexByValue('checked', false),
               0
            );
            assert.strictEqual(
               list.getIndexByValue('checked', true),
               -1
            );
         });
      });

      describe('.setEventRaising()', function() {
         it('should enable and disable onCollectionItemChange', function() {
            var fired,
               list = new ObservableList({
                  items: items.slice()
               }),
               handler = function() {
                  fired = true;
               };

            list.subscribe('onCollectionItemChange', handler);

            fired = false;
            list.setEventRaising(true);
            list.at(0).id = 999;
            list._notifyItemChange(list.at(0), {id: 999});
            assert.isTrue(fired);

            fired = false;
            list.setEventRaising(false);
            list.at(0).id = 777;
            list._notifyItemChange(list.at(0), {id: 777});
            assert.isFalse(fired);

            list.unsubscribe('onCollectionItemChange', handler);
         });

         it('should enable and disable onCollectionChange', function() {
            var fired,
               list = new ObservableList({
                  items: items.slice()
               }),
               handler = function() {
                  fired = true;
               };

            list.subscribe('onCollectionChange', handler);

            fired = false;
            list.setEventRaising(true);
            list.add({id: 'testA'});
            assert.isTrue(fired);

            fired = false;
            list.setEventRaising(false);
            list.add({id: 'testB'});
            assert.isFalse(fired);

            list.unsubscribe('onCollectionChange', handler);
         });

         it('should trigger onCollectionChange with ACTION_ADD after restore if "analize" is true and one item added', function() {
            var list = new ObservableList({
                  items: items.slice()
               }),
               args = {},
               fired = false,
               handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                  fired = true;
                  args.action = action;
                  args.newItems = newItems;
                  args.newItemsIndex = newItemsIndex;
                  args.oldItems = oldItems;
                  args.oldItemsIndex = oldItemsIndex;
               };

            list.subscribe('onCollectionChange', handler);
            list.setEventRaising(false, true);
            list.add({id: 'testA'});

            assert.isFalse(fired);

            list.setEventRaising(true, true);
            list.unsubscribe('onCollectionChange', handler);

            assert.isTrue(fired);
            assert.strictEqual(args.action, IBindCollection.ACTION_ADD);
            assert.strictEqual(args.newItems[0].id, 'testA');
            assert.strictEqual(args.newItemsIndex, list.getCount() - 1);
            assert.strictEqual(args.oldItems.length, 0);
            assert.strictEqual(args.oldItemsIndex, 0);
         });

         it('should trigger onCollectionChange with ACTION_CHANGE if "analize" is true and some item changed', function() {
            var items = [new Record(), new Record(), new Record()],
               list = new ObservableList({
                  items: items
               }),
               args = {},
               fired = false,
               item,
               handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                  fired = true;
                  args.action = action;
                  args.newItems = newItems;
                  args.newItemsIndex = newItemsIndex;
                  args.oldItems = oldItems;
                  args.oldItemsIndex = oldItemsIndex;
               };

            list.subscribe('onCollectionChange', handler);
            list.setEventRaising(false, true);
            item = list.at(1);
            item.set('testP', 'testV');

            assert.isFalse(fired);

            list.setEventRaising(true, true);
            list.unsubscribe('onCollectionChange', handler);

            assert.isTrue(fired);
            assert.strictEqual(args.action, IBindCollection.ACTION_CHANGE);
            assert.strictEqual(args.newItems[0], item);
            assert.strictEqual(args.newItemsIndex, 1);
            assert.strictEqual(args.oldItems[0], item);
            assert.strictEqual(args.oldItemsIndex, 1);
         });

         it('should trigger onCollectionChange with ACTION_CHANGE if "analize" is true and a few items changed', function() {
            var items = [new Record(), new Record(), new Record(), new Record(), new Record()],
               list = new ObservableList({
                  items: items
               }),
               packs = [[0], [2, 3]],
               pack,
               args = [],
               arg,
               handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                  args.push({
                     action: action,
                     newItems: newItems,
                     newItemsIndex: newItemsIndex,
                     oldItems: oldItems,
                     oldItemsIndex: oldItemsIndex
                  });
               },
               i,
               j;

            list.subscribe('onCollectionChange', handler);
            list.setEventRaising(false, true);
            for (i = 0; i < packs.length; i++) {
               pack = packs[i];
               for (j = 0; j < pack.length; j++) {
                  list
                     .at(pack[j])
                     .set('testP', 'testV');
               }
            }

            assert.isTrue(args.length === 0);

            list.setEventRaising(true, true);
            list.unsubscribe('onCollectionChange', handler);

            assert.isTrue(args.length === 2);
            for (i = 0; i < packs.length; i++) {
               pack = packs[i].map(function(index) {
                  return items[index];
               });
               arg = args[i];

               assert.strictEqual(arg.action, IBindCollection.ACTION_CHANGE);
               assert.deepEqual(arg.newItems, pack);
               assert.strictEqual(arg.newItemsIndex, packs[i][0]);
               assert.deepEqual(arg.oldItems, pack);
               assert.strictEqual(arg.oldItemsIndex, packs[i][0]);
            }
         });

         it('should trigger CollectionChange with ACTION_RESET if "analize" is true and a lot of items changed', function() {
            var items = [new Record(), new Record(), new Record()],
               list = new ObservableList({
                  items: items
               }),
               args = {},
               fired = false,
               handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                  fired = true;
                  args.action = action;
                  args.newItems = newItems;
                  args.newItemsIndex = newItemsIndex;
                  args.oldItems = oldItems;
                  args.oldItemsIndex = oldItemsIndex;
               };

            list.subscribe('onCollectionChange', handler);
            list.setEventRaising(false, true);

            list.each(function(item, i) {
               item.set('foo', i);
            });

            assert.isFalse(fired);

            list.setEventRaising(true, true);
            list.unsubscribe('onCollectionChange', handler);

            var listItems = [];
            list.each(function(item) {
               listItems.push(item);
            });

            assert.isTrue(fired);
            assert.strictEqual(args.action, IBindCollection.ACTION_RESET);
            assert.deepEqual(args.newItems, listItems);
            assert.strictEqual(args.newItemsIndex, 0);
            assert.deepEqual(args.oldItems, []);
            assert.strictEqual(args.oldItemsIndex, 0);
         });

         it('should fire after wake up', function() {
            var list = new ObservableList({
                  items: items.slice()
               }),
               addItem = {id: 'Test'},
               given = [],
               expect = [{
                  action: IBindCollection.ACTION_MOVE,
                  newItems: [list.at(1)],
                  newItemsIndex: 0,
                  oldItems: [list.at(1)],
                  oldItemsIndex: 1
               }, {
                  action: IBindCollection.ACTION_REMOVE,
                  newItems: [],
                  newItemsIndex: 0,
                  oldItems: [list.at(2)],
                  oldItemsIndex: 2
               }, {
                  action: IBindCollection.ACTION_ADD,
                  newItems: [addItem],
                  newItemsIndex: 1,
                  oldItems: [],
                  oldItemsIndex: 0
               }],
               handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                  given.push({
                     action: action,
                     newItems: newItems,
                     newItemsIndex: newItemsIndex,
                     oldItems: oldItems,
                     oldItemsIndex: oldItemsIndex
                  });
               },
               i,
               j;

            list.subscribe('onCollectionChange', handler);

            list.setEventRaising(false, true);
            var item = list.removeAt(0);
            list.add(item, 1);
            list.setEventRaising(true, true);

            list.setEventRaising(false, true);
            list.removeAt(2);
            list.setEventRaising(true, true);

            list.setEventRaising(false, true);
            list.add(addItem, 1);
            list.setEventRaising(true, true);

            list.unsubscribe('onCollectionChange', handler);

            assert.strictEqual(expect.length, given.length);
            for (i = 0; i < given.length; i++) {
               assert.strictEqual(given[i].action, expect[i].action, 'at change #' + i);

               assert.strictEqual(given[i].newItems.length, expect[i].newItems.length, 'at change #' + i);
               assert.strictEqual(given[i].newItemsIndex, expect[i].newItemsIndex, 'at change #' + i);
               for (j = 0; j < given[i].newItems.length; j++) {
                  assert.strictEqual(given[i].newItems[j], expect[i].newItems[j], 'at change #' + i);
               }

               assert.strictEqual(given[i].oldItems.length, expect[i].oldItems.length, 'at change #' + i);
               assert.strictEqual(given[i].oldItemsIndex, expect[i].oldItemsIndex, 'at change #' + i);
               for (j = 0; j < given[i].oldItems.length; j++) {
                  assert.strictEqual(given[i].oldItems[j], expect[i].oldItems[j], 'at change #' + i);
               }
            }
         });

         it('should throw an error if enabled not changed and anailze=true', function() {
            var list = new ObservableList();

            list.setEventRaising(false, true);
            assert.throws(function() {
               list.setEventRaising(false, true);
            });

            list.setEventRaising(true, true);
            assert.throws(function() {
               list.setEventRaising(true, true);
            });
         });

         it('should generate move action if item has been removed and added in one transaction', function() {
            var list = new ObservableList({
                  items: [{a: 1}, {b: 2}, {c: 3}, {d: 4}]
               }),
               item = list.at(0),
               given = [],
               expect = [{
                  action: IBindCollection.ACTION_MOVE,
                  newItems: [list.at(1), list.at(2)],
                  newItemsIndex: 0,
                  oldItems: [list.at(1), list.at(2)],
                  oldItemsIndex: 1,
                  groupId: 1
               }],
               handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                  given.push({
                     action: action,
                     newItems: newItems,
                     newItemsIndex: newItemsIndex,
                     oldItems: oldItems,
                     oldItemsIndex: oldItemsIndex
                  });
               },
               i,
               j;

            list.setEventRaising(false, true);
            list.remove(item);
            list.add(item, 2);
            list.subscribe('onCollectionChange', handler);
            list.setEventRaising(true, true);
            list.unsubscribe('onCollectionChange', handler);

            assert.strictEqual(expect.length, given.length);
            for (i = 0; i < given.length; i++) {
               assert.strictEqual(given[i].action, expect[i].action, 'at change #' + i);

               assert.strictEqual(given[i].newItems.length, expect[i].newItems.length, 'at change #' + i);
               assert.strictEqual(given[i].newItemsIndex, expect[i].newItemsIndex, 'at change #' + i);
               for (j = 0; j < given[i].newItems.length; j++) {
                  assert.strictEqual(given[i].newItems[j], expect[i].newItems[j], 'newItems[' + j + '] at change #' + i);
               }

               assert.strictEqual(given[i].oldItems.length, expect[i].oldItems.length, 'at change #' + i);
               assert.strictEqual(given[i].oldItemsIndex, expect[i].oldItemsIndex, 'at change #' + i);
               for (j = 0; j < given[i].oldItems.length; j++) {
                  assert.strictEqual(given[i].oldItems[j], expect[i].oldItems[j], 'oldItems[' + j + '] at change #' + i);
               }
            }
         });
      });

      describe('.isEventRaising()', function() {
         it('should return true by default', function() {
            var list = new ObservableList();
            assert.isTrue(list.isEventRaising());
         });
         it('should return true if enabled', function() {
            var list = new ObservableList();
            list.setEventRaising(true);
            assert.isTrue(list.isEventRaising());
         });
         it('should return false if disabled', function() {
            var list = new ObservableList();
            list.setEventRaising(false);
            assert.isFalse(list.isEventRaising());
         });
      });

      describe('.subscribe()', function() {
         it('should trigger "onCollectionItemChange" if property changed', function() {
            var item = new Record({
                  rawData: {foo: 'fail'}
               }),
               list = new ObservableList({
                  items: [item]
               }),
               given = {},
               handler = function(event, item, index, props) {
                  given.item = item;
                  given.index = index;
                  given.props = props;
               };

            list.subscribe('onCollectionItemChange', handler);
            item.set('foo', 'ok');
            list.unsubscribe('onCollectionItemChange', handler);

            assert.strictEqual(given.item, item);
            assert.strictEqual(given.index, 0);
            assert.deepEqual(given.props, {foo: 'ok'});
         });

         it('should trigger "onCollectionItemChange" if Flags property changed', function() {
            var item = new Record({
                  rawData: {foo: [false]},
                  format: {
                     foo: {type: 'flags', dictionary: ['one']}
                  }
               }),
               list = new ObservableList({
                  items: [item]
               }),
               given = {},
               handler = function(event, item, index, props) {
                  given.item = item;
                  given.index = index;
                  given.props = props;
               },
               foo = item.get('foo');

            list.subscribe('onCollectionItemChange', handler);
            foo.set('one', true);
            list.unsubscribe('onCollectionItemChange', handler);

            assert.strictEqual(given.item, item);
            assert.strictEqual(given.index, 0);
            assert.deepEqual(given.props, {foo: foo});
         });

         it('should trigger "onCollectionItemChange" if Enum property changed', function() {
            var item = new Record({
                  rawData: {foo: 0},
                  format: {
                     foo: {type: 'enum', dictionary: ['one', 'two']}
                  }
               }),
               list = new ObservableList({
                  items: [item]
               }),
               given = {},
               handler = function(event, item, index, props) {
                  given.item = item;
                  given.index = index;
                  given.props = props;
               },
               foo = item.get('foo');

            list.subscribe('onCollectionItemChange', handler);
            foo.set(1);
            list.unsubscribe('onCollectionItemChange', handler);

            assert.strictEqual(given.item, item);
            assert.strictEqual(given.index, 0);
            assert.deepEqual(given.props, {foo: foo});
         });

         it('should trigger "onCollectionItemChange" if relation changed', function() {
            var item = new Record({
                  rawData: {foo: 'fail'}
               }),
               list = new ObservableList({
                  items: [item]
               }),
               given = {},
               handler = function(event, item, index, props) {
                  given.item = item;
                  given.index = index;
                  given.props = props;
               };

            list.subscribe('onCollectionItemChange', handler);
            list.relationChanged({target: item}, []);
            list.unsubscribe('onCollectionItemChange', handler);

            assert.strictEqual(given.item, item);
            assert.strictEqual(given.index, 0);
            assert.instanceOf(given.props, Object);
         });

         it('should trigger "onEventRaisingChange"', function() {
            var list = new ObservableList(),
               data,
               handler = function(event, enabled, analyze) {
                  data = {
                     enabled: enabled,
                     analyze: analyze
                  };
               };

            list.subscribe('onEventRaisingChange', handler);

            list.setEventRaising(false);
            assert.strictEqual(data.enabled, false);
            assert.strictEqual(data.analyze, false);

            list.setEventRaising(true);
            assert.strictEqual(data.enabled, true);
            assert.strictEqual(data.analyze, false);

            list.setEventRaising(false, true);
            assert.strictEqual(data.enabled, false);
            assert.strictEqual(data.analyze, true);

            list.setEventRaising(true, true);
            assert.strictEqual(data.enabled, true);
            assert.strictEqual(data.analyze, true);

            list.unsubscribe('onEventRaisingChange', handler);
         });
      });
   });
});
