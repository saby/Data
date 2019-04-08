/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_collection/List',
   'Types/_entity/Record'
], function(
   List,
   Record
) {
   'use strict';

   List = List.default;
   Record = Record.default;

   describe('Types/_collection/List', function() {
      var getItems = function() {
            return [{
               id: 1,
               name: 'Иванов'
            }, {
               id: 2,
               name: 'Петров'
            }, {
               id: 3,
               name: 'Сидоров'
            }, {
               id: 4,
               name: 'Пухов'
            }, {
               id: 5,
               name: 'Молодцов'
            }, {
               id: 6,
               name: 'Годолцов'
            }, {
               id: 7,
               name: 'Арбузнов'
            }];
         },
         items;

      beforeEach(function() {
         items = getItems();
      });

      afterEach(function() {
         items = undefined;
      });

      describe('constructor()', function() {
         it('should create list with items', function() {
            var list = new List({
               items: items
            });
            assert.strictEqual(
               items[0],
               list.at(0)
            );
            assert.strictEqual(
               items[6],
               list.at(6)
            );
         });

         it('should throw an error on invalid argument', function() {
            assert.throws(function() {
               new List({
                  items: {}
               });
            });
            assert.throws(function() {
               new List({
                  items: ''
               });
            });
            assert.throws(function() {
               new List({
                  items: 0
               });
            });
            assert.throws(function() {
               new List({
                  items: undefined
               });
            });
         });
      });

      describe('.destroy()', function() {
         it('should destroy owned items', function() {
            var items = [new Record(), new Record(), new Record()],
               list = new List({
                  items: items
               });

            list.destroy();
            for (var i = 0; i < items.length; i++) {
               assert.isTrue(items[i].destroyed);
            }
         });
      });

      describe('.getEnumerator()', function() {
         it('should return an list enumerator', function() {
            var list = new List();
            assert.isTrue(list.getEnumerator()['[Types/_collection/enumerator/Arraywise]']);
         });
      });

      describe('.each()', function() {
         it('should return every item in original order', function() {
            var list = new List({
                  items: items
               }),
               index = 0;

            list.each(function(item, innerIndex, innerList) {
               assert.strictEqual(item, items[index]);
               assert.strictEqual(innerIndex, index);
               assert.strictEqual(innerList, list);
               index++;
            });
            assert.strictEqual(index, items.length);
         });

         it('should use the given context', function() {
            var list = new List({
                  items: items
               }),
               context = {
                  'blah': 'blah'
               };

            list.each(function() {
               assert.strictEqual(this, context);
            }, context);
         });
      });

      describe('.forEach()', function() {
         it('should work like each', function() {
            var list = new List({
                  items: items
               }),
               index = 0;

            list.forEach(function(item, innerIndex, innerList) {
               assert.strictEqual(item, items[index]);
               assert.strictEqual(innerIndex, index);
               assert.strictEqual(innerList, list);
               index++;
            });
            assert.strictEqual(index, items.length);
         });
      });

      describe('.append()', function() {
         it('should append items', function() {
            var list = new List({
                  items: items.slice()
               }),
               moreItems = [{
                  id: 8
               }, {
                  id: 9
               }],
               ok = true;

            list.append(new List({
               items: moreItems
            }));

            for (var i = 0, count = items.length + moreItems.length; i < count; i++) {
               var item = i < items.length ? items[i] : moreItems[i - items.length];
               if (list.at(i) !== item) {
                  ok = false;
                  break;
               }
            }
            assert.isTrue(ok);
         });

         it('should append items when items is array', function() {
            var list = new List({
                  items: items.slice()
               }),
               moreItems = [{
                  id: 8
               }, {
                  id: 9
               }],
               ok = true;

            list.append(moreItems);

            for (var i = 0, count = items.length + moreItems.length; i < count; i++) {
               var item = i < items.length ? items[i] : moreItems[i - items.length];
               if (list.at(i) !== item) {
                  ok = false;
                  break;
               }
            }
            assert.isTrue(ok);
         });

         it('should throw an error on invalid argument', function() {
            assert.throws(function() {
               var list = new List();
               list.append({});
            });
            assert.throws(function() {
               var list = new List();
               list.append('');
            });
            assert.throws(function() {
               var list = new List();
               list.append(0);
            });
            assert.throws(function() {
               var list = new List();
               list.append();
            });
         });

         it('should rebuild index for instantiable item', function() {
            var list = new List({
                  items: [new Record({
                     rawData: {
                        id: 1
                     }
                  })]
               }),
               moreItems = [new Record({
                  rawData: {
                     id: 2
                  }
               }), new Record({
                  rawData: {
                     id: 3
                  }
               })];
            list.getIndex(list.at(0));
            list.append(moreItems);

            assert.equal(list.getIndex(list.at(2)), 2);
         });

         it('should change associated field in the owner', function() {
            var item = new Record(),
               list = new List();

            item.set('foo', list);
            item.acceptChanges();
            assert.isFalse(item.isChanged('foo'));

            list.append(['bar']);
            assert.isTrue(item.isChanged('foo'));
         });
      });

      describe('.prepend()', function() {
         it('should prepend items', function() {
            var list = new List({
                  items: items.slice()
               }),
               moreItems = [{
                  id: 8
               }, {
                  id: 9
               }],
               ok = true;

            list.prepend(new List({
               items: moreItems
            }));

            for (var i = 0, count = items.length + moreItems.length; i < count; i++) {
               var item = i < moreItems.length ? moreItems[i] : items[i - moreItems.length];
               if (list.at(i) !== item) {
                  ok = false;
                  break;
               }
            }
            assert.isTrue(ok);
         });

         it('should prepend items when items is array', function() {
            var list = new List({
                  items: items.slice()
               }),
               moreItems = [{
                  id: 8
               }, {
                  id: 9
               }],
               ok = true;

            list.prepend(moreItems);

            for (var i = 0, count = items.length + moreItems.length; i < count; i++) {
               var item = i < moreItems.length ? moreItems[i] : items[i - moreItems.length];
               if (list.at(i) !== item) {
                  ok = false;
                  break;
               }
            }
            assert.isTrue(ok);
         });

         it('should throw an error on invalid argument', function() {
            assert.throws(function() {
               var list = new List();
               list.prepend({});
            });
            assert.throws(function() {
               var list = new List();
               list.prepend('');
            });
            assert.throws(function() {
               var list = new List();
               list.prepend(0);
            });
            assert.throws(function() {
               var list = new List();
               list.prepend();
            });
         });

         it('should rebuild index for instantiable item', function() {
            var list = new List({
                  items: [new Record({
                     rawData: {
                        id: 1
                     }
                  })]
               }),
               moreItems = [new Record({
                  rawData: {
                     id: 2
                  }
               }), new Record({
                  rawData: {
                     id: 3
                  }
               })];
            list.getIndex(list.at(0));
            list.prepend(moreItems);

            assert.equal(list.getIndex(list.at(2)), 2);
         });

         it('should change associated field in the owner', function() {
            var item = new Record(),
               list = new List();

            item.set('foo', list);
            item.acceptChanges();
            assert.isFalse(item.isChanged('foo'));

            list.prepend(['bar']);
            assert.isTrue(item.isChanged('foo'));
         });
      });

      describe('.assign()', function() {
         it('should replace items', function() {
            var list = new List({
                  items: items
               }),
               moreItems = [{
                  id: 8
               }, {
                  id: 9
               }],
               ok = true;

            list.assign(new List({
               items: moreItems
            }));

            for (var i = 0; i < moreItems.length; i++) {
               if (list.at(i) !== moreItems[i]) {
                  ok = false;
                  break;
               }
            }
            assert.isTrue(ok);
         });

         it('should replace items when items is array', function() {
            var list = new List({
                  items: items
               }),
               moreItems = [{
                  id: 8
               }, {
                  id: 9
               }],
               ok = true;

            list.assign(moreItems);

            for (var i = 0; i < moreItems.length; i++) {
               if (list.at(i) !== moreItems[i]) {
                  ok = false;
                  break;
               }
            }
            assert.isTrue(ok);
         });

         it('should clear items', function() {
            var list = new List({
                  items: items
               }),
               ok = true;

            list.assign();

            list.each(function() {
               ok = false;
            });

            assert.isTrue(ok);
         });

         it('should throw an error on invalid argument', function() {
            assert.throws(function() {
               var list = new List();
               list.assign({});
            });
            assert.throws(function() {
               var list = new List();
               list.assign('a');
            });
            assert.throws(function() {
               var list = new List();
               list.assign(1);
            });
         });

         it('should rebuild index for instantiable item', function() {
            var list = new List({
                  items: [new Record({
                     rawData: {
                        id: 1
                     }
                  })]
               }),
               moreItems = [new Record({
                  rawData: {
                     id: 2
                  }
               }), new Record({
                  rawData: {
                     id: 3
                  }
               })];
            list.getIndex(list.at(0));
            list.assign(moreItems);

            assert.equal(list.getIndex(list.at(1)), 1);
         });

         it('should change associated field in the owner', function() {
            var item = new Record(),
               list = new List();

            item.set('foo', list);
            item.acceptChanges();
            assert.isFalse(item.isChanged('foo'));

            list.assign(['bar']);
            assert.isTrue(item.isChanged('foo'));
         });
      });

      describe('.clear()', function() {
         it('should reset items count', function() {
            var list = new List({
               items: items
            });
            list.clear();
            assert.strictEqual(list.getCount(), 0);
         });

         it('should return an empty enumerator', function() {
            var list = new List({
               items: items
            });
            list.clear();
            assert.isFalse(list.getEnumerator().moveNext());
         });

         it('should not call callback in each', function() {
            var list = new List({
               items: items
            });
            list.clear();
            list.each(function() {
               throw new Error('Callback was called');
            });
         });

         it('should rebuild index for instantiable item', function() {
            var item = new Record({
                  rawData: {
                     id: 1
                  }
               }),
               list = new List({
                  items: [item]
               });
            assert.strictEqual(list.getIndex(item), 0);
            list.clear();
            assert.strictEqual(list.getIndex(item), -1);
         });
      });

      describe('.clone()', function() {
         it('should not be same as original', function() {
            var list = new List({
               items: items
            });
            assert.instanceOf(list.clone(), List);
            assert.instanceOf(list.clone(true), List);
            assert.notEqual(list.clone(), list);
            assert.notEqual(list.clone(true), list);
         });

         it('should clone list from library', function() {
            var list = new List({
               items: items
            });
            assert.instanceOf(list.clone(), List);
            assert.instanceOf(list.clone(true), List);
         });

         it('should not be same as previous clone', function() {
            var list = new List({
               items: items
            });
            assert.notEqual(list.clone(), list.clone());
            assert.notEqual(list.clone(true), list.clone(true));
         });

         it('should make items unlinked from original', function() {
            var list = new List({
                  items: items
               }),
               clone = list.clone();
            clone.each(function(item, index) {
               assert.notEqual(item, list.at(index));
            });
         });

         it('should make items linked to original if shallow', function() {
            var list = new List({
                  items: items
               }),
               clone = list.clone(true);
            clone.each(function(item, index) {
               assert.strictEqual(item, list.at(index));
            });
         });
      });

      describe('.add()', function() {
         it('should append an item', function() {
            var list = new List({
                  items: items.slice()
               }),
               item = {
                  id: 8
               };

            list.add(item);
            assert.strictEqual(list.at(items.length), item);
         });

         it('should prepend an item', function() {
            var list = new List({
                  items: items
               }),
               item = {
                  id: 9
               };

            list.add(item, 0);
            assert.strictEqual(list.at(0), item);
         });

         it('should insert an item at given position', function() {
            var list = new List({
                  items: items
               }),
               item = {
                  id: 10
               };

            list.add(item, 3);
            assert.strictEqual(list.at(3), item);
         });

         it('should throw an error on invalid index', function() {
            assert.throws(function() {
               var list = new List();
               list.add({}, -1);
            });
            assert.throws(function() {
               var list = new List();
               list.add({}, items.length);
            });
         });

         it('should rebuild index for instantiable item', function() {
            var list = new List({
                  items: [new Record({
                     rawData: {
                        id: 1
                     }
                  })]
               }),
               moreItem = new Record({
                  rawData: {
                     id: 2
                  }
               });
            list.getIndex(list.at(0));
            list.add(moreItem);
            assert.equal(list.getIndex(list.at(1)), 1);
         });

         it('should change associated field in the owner', function() {
            var item = new Record(),
               list = new List();

            item.set('foo', list);
            item.acceptChanges();
            assert.isFalse(item.isChanged('foo'));

            list.add('bar');
            assert.isTrue(item.isChanged('foo'));
         });
      });

      describe('.at()', function() {
         it('should return an item at given position', function() {
            var list = new List({
               items: items
            });

            for (var i = 0; i < items.length; i++) {
               assert.strictEqual(list.at(i), items[i]);
            }
         });

         it('should return undefined on invalid index', function() {
            var list = new List();
            assert.isUndefined(list.at(-1));
            assert.isUndefined(list.at(items.length));
         });
      });

      describe('.remove()', function() {
         it('should remove given item', function() {
            var list = new List({
               items: items
            });

            for (var i = items.length; i > 0; i--) {
               list.remove(items[i - 1]);
               assert.isUndefined(list.at(i - 1));
            }
         });

         it('should return false if item is undefined', function() {
            var list = new List();
            assert.isFalse(list.remove({}));
            assert.isFalse(list.remove(10));
         });

         it('should rebuild index for instantiable item', function() {
            var item = new Record({
                  rawData: {
                     id: 2
                  }
               }),
               list = new List({
                  items: [new Record({
                     rawData: {
                        id: 1
                     }
                  }), item]
               });
            assert.notEqual(list.getIndex(item), -1);
            list.remove(item);
            assert.strictEqual(list.getIndex(item), -1);
         });

         it('should change associated field in the owner', function() {
            var item = new Record(),
               list = new List({items: ['bar']});

            item.set('foo', list);
            item.acceptChanges();
            assert.isFalse(item.isChanged('foo'));

            list.remove('bar');
            assert.isTrue(item.isChanged('foo'));
         });
      });

      describe('.removeAt()', function() {
         it('should remove item at given position', function() {
            var list = new List({
                  items: items
               }),
               toRemove,
               removed,
               i;

            for (i = items.length; i > 0; i--) {
               toRemove = list.at(i - 1);
               removed = list.removeAt(i - 1);
               assert.strictEqual(toRemove, removed);
               assert.isUndefined(list.at(i - 1));
            }
         });

         it('should throw an error on on invalid index', function() {
            assert.throws(function() {
               var list = new List();
               list.removeAt(-1);
            });
            assert.throws(function() {
               var list = new List();
               list.removeAt(0);
            });
            assert.throws(function() {
               var list = new List({
                  items: items
               });
               list.removeAt(items.length);
            });
         });

         it('should rebuild index for instantiable item', function() {
            var item = new Record({
                  rawData: {
                     id: 2
                  }
               }),
               list = new List({
                  items: [new Record({
                     rawData: {
                        id: 1
                     }
                  }), item]
               });
            assert.notEqual(list.getIndex(item), -1);
            list.removeAt(1);
            assert.strictEqual(list.getIndex(item), -1);
         });

         it('should change associated field in the owner', function() {
            var item = new Record(),
               list = new List({items: ['bar']});

            item.set('foo', list);
            item.acceptChanges();
            assert.isFalse(item.isChanged('foo'));

            list.removeAt(0);
            assert.isTrue(item.isChanged('foo'));
         });
      });

      describe('.replace()', function() {
         it('should replace item at given position', function() {
            var list = new List({
               items: items
            });

            for (var i = 0; i < items.length; i++) {
               var item = {i: i};
               list.replace(item, i);
               assert.strictEqual(item, list.at(i));
            }
         });

         it('should replace item with itself', function() {
            var list = new List({
               items: items
            });

            for (var i = 0; i < items.length; i++) {
               var item = items[i];
               list.replace(item, i);
               assert.strictEqual(item, list.at(i));
            }
         });

         it('should throw an error on invalid index', function() {
            assert.throws(function() {
               var list = new List();
               list.replace({}, -1);
            });
            assert.throws(function() {
               var list = new List();
               list.replace({}, 0);
            });
            assert.throws(function() {
               var list = new List({
                  items: items
               });
               list.replace({}, items.length);
            });
         });

         it('should rebuild index for instantiable item', function() {
            var item1 = new Record({
                  rawData: {
                     id: 2
                  }
               }),
               item2 = new Record({
                  rawData: {
                     id: 3
                  }
               }),
               list = new List({
                  items: [new Record({
                     rawData: {
                        id: 1
                     }
                  }), item1]
               });

            assert.notEqual(list.getIndex(item1), -1);
            assert.strictEqual(list.getIndex(item2), -1);

            list.replace(item2, 1);
            assert.strictEqual(list.getIndex(item1), -1);
            assert.notEqual(list.getIndex(item2), -1);
         });

         it('should change associated field in the owner', function() {
            var item = new Record(),
               list = new List({items: ['bar']});

            item.set('foo', list);
            item.acceptChanges();
            assert.isFalse(item.isChanged('foo'));

            list.replace('baz', 0);
            assert.isTrue(item.isChanged('foo'));
         });
      });

      describe('.move()', function() {
         it('should move item to the given position', function() {
            var list = new List({
                  items: items
               }),
               from = 0,
               to = 2,
               item = list.at(from),
               next = list.at(from + 1);

            list.move(from, to);
            assert.strictEqual(list.at(from), next);
            assert.strictEqual(list.at(to), item);
         });

         it('should give no effect for equal positions', function() {
            var list = new List({
                  items: items
               }),
               from = 1,
               item = list.at(from);

            list.move(from, from);
            assert.strictEqual(list.at(from), item);
         });

         it('should throw an error om invalid argument "from"', function() {
            var list = new List({
               items: items
            });

            assert.throws(function() {
               list.move(-1, 0);
            });

            assert.throws(function() {
               list.move(100, 0);
            });
         });

         it('should throw an error om invalid argument "to"', function() {
            var list = new List({
               items: items
            });

            assert.throws(function() {
               list.move(0, -1);
            });

            assert.throws(function() {
               list.move(0, 100);
            });
         });

         it('should rebuild index for affected items', function() {
            var list = new List({
                  items: items
               }),
               from = 0,
               to = 2;

            assert.strictEqual(list.getIndexByValue('id', 1), from);
            assert.strictEqual(list.getIndexByValue('id', 3), to);

            list.move(from, to);

            assert.strictEqual(list.getIndexByValue('id', 1), to);
            assert.strictEqual(list.getIndexByValue('id', 3), to - 1);
         });

         it('should change associated field in the owner', function() {
            var item = new Record(),
               list = new List({items: ['bar', 'baz']});

            item.set('foo', list);
            item.acceptChanges();
            assert.isFalse(item.isChanged('foo'));

            list.move(0, 1);
            assert.isTrue(item.isChanged('foo'));
         });
      });

      describe('.getIndex()', function() {
         it('should return an index of given item', function() {
            var list = new List({
               items: items.slice()
            });
            for (var i = 0; i < items.length; i++) {
               assert.strictEqual(i, list.getIndex(items[i]));
            }

            var item = {a: 'b'};
            list.add(item, 5);
            assert.strictEqual(5, list.getIndex(item));
         });

         it('should return -1 for undefined item', function() {
            var list = new List();
            assert.strictEqual(-1, list.getIndex({c: 'd'}));
            assert.strictEqual(-1, list.getIndex(''));
            assert.strictEqual(-1, list.getIndex(0));
            assert.strictEqual(-1, list.getIndex(false));
            assert.strictEqual(-1, list.getIndex(null));
            assert.strictEqual(-1, list.getIndex());
         });

         it('should return  an index of given instantiable item', function() {
            var newItems = [];
            items.forEach(function(item) {
               newItems.push(new Record({
                  rawData: item
               }));
            });

            var list = new List({
               items: newItems
            });

            for (var i = 0; i < newItems.length; i++) {
               assert.strictEqual(i, list.getIndex(newItems[i]));
            }

            list.removeAt(0);
            for (i = 0; i < newItems.length; i++) {
               assert.strictEqual(i, list.getIndex(newItems[i]), 'after reindex');
            }
         });

         it('should return  an -1 for undefined instantiable item', function() {
            var newItems = [];
            items.forEach(function(item) {
               newItems.push(new Record({
                  rawData: item
               }));
            });
            var list = new List({
               items: newItems
            });
            assert.strictEqual(-1, list.getIndex(new Record({
               rawData: {id: 100500}
            })));
            assert.strictEqual(-1, list.getIndex(new Record({
               rawData: items[1]
            })));
         });
      });

      describe('.getIndexByValue', function() {
         var getItems = function() {
            return [
               {id: 1},
               {id: 2},
               {id: 3},
               {id: 4}
            ];
         };

         it('should return initial indexes', function() {
            var list = new List({
               items: getItems()
            });
            assert.equal(list.getIndexByValue('id', 1), 0);
            assert.equal(list.getIndexByValue('id', 2), 1);
            assert.equal(list.getIndexByValue('id', 3), 2);
            assert.equal(list.getIndexByValue('id', 4), 3);
         });

         it('should shift indexes after add', function() {
            var list = new List({
               items: getItems()
            });
            assert.equal(list.getIndexByValue('id', 1), 0);
            list.add({id: 5}, 1);
            assert.equal(list.getIndexByValue('id', 1), 0);
            assert.equal(list.getIndexByValue('id', 5), 1);
            assert.equal(list.getIndexByValue('id', 2), 2);
            assert.equal(list.getIndexByValue('id', 3), 3);
         });

         it('should return first index if dublicate added before', function() {
            var list = new List({
               items: [{id: 1}, {id: 2}, {id: 3}]
            });
            assert.equal(list.getIndexByValue('id', 1), 0);
            list.add({id: 1}, 0);
            assert.equal(list.getIndexByValue('id', 1), 0);
         });

         it('should shift indexes after append', function() {
            var list = new List({
               items: getItems()
            });
            assert.equal(list.getIndexByValue('id', 1), 0);
            list.append([{id: 5}, {id: 6}]);
            assert.equal(list.getIndexByValue('id', 1), 0);
            assert.equal(list.getIndexByValue('id', 3), 2);
            assert.equal(list.getIndexByValue('id', 4), 3);
            assert.equal(list.getIndexByValue('id', 5), 4);
            assert.equal(list.getIndexByValue('id', 6), 5);
         });

         it('should shift indexes after prepend', function() {
            var list = new List({
               items: getItems()
            });
            assert.equal(list.getIndexByValue('id', 1), 0);
            list.prepend([{id: 5}, {id: 6}]);
            assert.equal(list.getIndexByValue('id', 5), 0);
            assert.equal(list.getIndexByValue('id', 6), 1);
            assert.equal(list.getIndexByValue('id', 1), 2);
            assert.equal(list.getIndexByValue('id', 2), 3);
         });

         it('should shift indexes after removeAt', function() {
            var list = new List({
               items: getItems()
            });
            assert.equal(list.getIndexByValue('id', 1), 0);
            list.removeAt(1);
            assert.equal(list.getIndexByValue('id', 1), 0);
            assert.equal(list.getIndexByValue('id', 2), -1);
            assert.equal(list.getIndexByValue('id', 3), 1);
            assert.equal(list.getIndexByValue('id', 4), 2);
         });

         it('should shift indexes after replace', function() {
            var list = new List({
               items: getItems()
            });
            assert.equal(list.getIndexByValue('id', 1), 0);
            list.replace({id: 5}, 1);
            assert.equal(list.getIndexByValue('id', 1), 0);
            assert.equal(list.getIndexByValue('id', 2), -1);
            assert.equal(list.getIndexByValue('id', 3), 2);
            assert.equal(list.getIndexByValue('id', 4), 3);
            assert.equal(list.getIndexByValue('id', 5), 1);
         });

         it('should return -1 indexes after clear', function() {
            var list = new List({
               items: getItems()
            });
            assert.equal(list.getIndexByValue('id', 1), 0);
            list.clear();
            assert.equal(list.getIndexByValue('id', 1), -1);
            assert.equal(list.getIndexByValue('id', 2), -1);
            assert.equal(list.getIndexByValue('id', 3), -1);
            assert.equal(list.getIndexByValue('id', 4), -1);
         });
      });

      describe('.getIndicesByValue', function() {
         it('should return indices by value', function() {

            var newItems = [{
                  id: 70,
                  name: '12a'
               }, {
                  id: 71,
                  name: '12a'
               }],
               len = items.length,
               list = new List({
                  items: items.concat(newItems)
               });
            var indices = [len, len + 1];
            assert.deepEqual(list.getIndicesByValue('name', '12a'), indices);
         });
      });

      describe('.getCount()', function() {
         it('should return same count like initial collection', function() {
            var list = new List({
               items: items.slice()
            });
            assert.strictEqual(items.length, list.getCount());
         });

         it('should change after modifications', function() {
            var list = new List();
            assert.strictEqual(0, list.getCount());
            list.add({});
            assert.strictEqual(1, list.getCount());
            list.add({}, 0);
            assert.strictEqual(2, list.getCount());
            list.add({}, 1);
            assert.strictEqual(3, list.getCount());

            list.assign();
            assert.strictEqual(0, list.getCount());

            list.assign(new List({
               items: [1, 2]
            }));
            assert.strictEqual(2, list.getCount());

            list.append(new List({
               items: [3, 4, 5]
            }));
            assert.strictEqual(5, list.getCount());

            list.remove(2);
            assert.strictEqual(4, list.getCount());

            list.removeAt(1);
            assert.strictEqual(3, list.getCount());

            list.replace(10, 2);
            assert.strictEqual(3, list.getCount());
         });
      });

      describe('.isEqual()', function() {
         it('should return true for list with same instances', function() {
            var listA = new List({
                  items: items.slice()
               }),
               listB = new List({
                  items: items.slice()
               });
            assert.isTrue(listA.isEqual(listB));
         });

         it('should return false for list with different instances', function() {
            var listA = new List({
                  items: getItems()
               }),
               listB = new List({
                  items: getItems()
               });
            assert.isFalse(listA.isEqual(listB));
         });

         it('should return false for list with different count', function() {
            var listA = new List({
                  items: items.slice()
               }),
               listB = new List({
                  items: items.slice()
               });
            listB.removeAt(5);
            assert.isFalse(listA.isEqual(listB));
         });

         it('should return false for not a list', function() {
            var list = new List();
            assert.isFalse(list.isEqual());
            assert.isFalse(list.isEqual(null));
            assert.isFalse(list.isEqual(false));
            assert.isFalse(list.isEqual(true));
            assert.isFalse(list.isEqual(0));
            assert.isFalse(list.isEqual(1));
            assert.isFalse(list.isEqual(''));
            assert.isFalse(list.isEqual('a'));
            assert.isFalse(list.isEqual({}));
            assert.isFalse(list.isEqual([]));
         });
      });

      describe('.toJSON()', function() {
         it('should serialize a list', function() {
            var list = new List({
                  items: items
               }),
               json = list.toJSON();
            assert.strictEqual(json.module, 'Types/collection:List');
            assert.isNumber(json.id);
            assert.isTrue(json.id > 0);
            assert.deepEqual(json.state.$options, list._getOptions());
            assert.deepEqual(json.state._items, list._items);
         });
      });

      describe('.getVersion()', function() {
         it('should change version when item has been added to the list', function() {
            var list = new List({
                  items: items
               }),
               version = list.getVersion();
            list.add({
               id: 110,
               name: 'Иванов'
            });
            assert.notEqual(version, list.getVersion());
         });

         it('should change version when item has been removed from the list', function() {
            var list = new List({
                  items: items
               }),
               version = list.getVersion();
            list.removeAt(0);
            assert.notEqual(version, list.getVersion());
         });

         it('should change version when another list has been appended from the list', function() {
            var list = new List({
                  items: items
               }),
               version = list.getVersion();
            list.append(items);
            assert.notEqual(version, list.getVersion());
         });

         it('should change version when inner item has been changed', function() {
            var list = new List({
                  items: [new Record({rawData: {'id': 32}})]
               }),
               version = list.getVersion();
            list.at(0).set('id', 1);
            assert.notEqual(version, list.getVersion());
         });

         it('should change version of each list which changed item belongs to', function() {
            var item = new Record(),
               listA = new List(),
               listB = new List(),
               versionA,
               versionB;

            listA.add(item);
            versionA = listA.getVersion();
            listB.add(item);
            versionB = listB.getVersion();

            item.set('foo', 'bar');
            assert.notEqual(versionA, listA.getVersion());
            assert.notEqual(versionB, listB.getVersion());
         });
      });
   });
});
