/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/relation/Hierarchy',
   'Types/_collection/RecordSet'
], function(
   Hierarchy,
   RecordSet
) {
   'use strict';

   Hierarchy = Hierarchy.default;
   RecordSet = RecordSet.default;

   describe('Types/_entity/relation/Hierarchy', function() {
      var data,
         rs,
         hierarchy;

      beforeEach(function() {
         data = [
            {id: 1, parent: null, title: 'node1', node: true, hasChildren: true},
            {id: 2, parent: null, title: 'node2', node: true, hasChildren: true},
            {id: 3, parent: 1, title: 'node11', node: true, hasChildren: false},
            {id: 4, parent: 1, title: 'leaf12', node: false, hasChildren: false},
            {id: 5, parent: 2, title: 'node21', node: true, hasChildren: false},
            {id: 6, parent: 2, title: 'leaf22', node: false, hasChildren: false}
         ];

         rs = new RecordSet({
            rawData: data,
            keyProperty: 'id'
         });

         hierarchy = new Hierarchy({
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'node',
            declaredChildrenProperty: 'hasChildren'
         });
      });

      afterEach(function() {
         hierarchy.destroy();
         hierarchy = undefined;

         rs.destroy();
         rs = undefined;

         data = undefined;
      });

      describe('.getKeyProperty()', function() {
         it('should return an empty string by default', function() {
            var hierarchy = new Hierarchy();
            assert.strictEqual(hierarchy.getKeyProperty(), '');
         });

         it('should return the value passed to the constructor', function() {
            var hierarchy = new Hierarchy({
               keyProperty: 'test'
            });
            assert.strictEqual(hierarchy.getKeyProperty(), 'test');
         });
      });

      describe('.setKeyProperty()', function() {
         it('should set the new value', function() {
            var hierarchy = new Hierarchy();
            hierarchy.setKeyProperty('test');
            assert.strictEqual(hierarchy.getKeyProperty(), 'test');
         });
      });

      describe('.getParentProperty()', function() {
         it('should return an empty string by default', function() {
            var hierarchy = new Hierarchy();
            assert.strictEqual(hierarchy.getParentProperty(), '');
         });

         it('should return the value passed to the constructor', function() {
            var hierarchy = new Hierarchy({
               parentProperty: 'test'
            });
            assert.strictEqual(hierarchy.getParentProperty(), 'test');
         });
      });

      describe('.setParentProperty()', function() {
         it('should set the new value', function() {
            var hierarchy = new Hierarchy();
            hierarchy.setParentProperty('test');
            assert.strictEqual(hierarchy.getParentProperty(), 'test');
         });
      });

      describe('.getNodeProperty()', function() {
         it('should return an empty string by default', function() {
            var hierarchy = new Hierarchy();
            assert.strictEqual(hierarchy.getNodeProperty(), '');
         });

         it('should return the value passed to the constructor', function() {
            var hierarchy = new Hierarchy({
               nodeProperty: 'test'
            });
            assert.strictEqual(hierarchy.getNodeProperty(), 'test');
         });
      });

      describe('.setNodeProperty()', function() {
         it('should set the new value', function() {
            var hierarchy = new Hierarchy();
            hierarchy.setNodeProperty('test');
            assert.strictEqual(hierarchy.getNodeProperty(), 'test');
         });
      });

      describe('.getDeclaredChildrenProperty()', function() {
         it('should return an empty string by default', function() {
            var hierarchy = new Hierarchy();
            assert.strictEqual(hierarchy.getDeclaredChildrenProperty(), '');
         });

         it('should return the value passed to the constructor', function() {
            var hierarchy = new Hierarchy({
               declaredChildrenProperty: 'test'
            });
            assert.strictEqual(hierarchy.getDeclaredChildrenProperty(), 'test');
         });
      });

      describe('.setDeclaredChildrenProperty()', function() {
         it('should set the new value', function() {
            var hierarchy = new Hierarchy();
            hierarchy.setDeclaredChildrenProperty('test');
            assert.strictEqual(hierarchy.getDeclaredChildrenProperty(), 'test');
         });
      });

      describe('.isNode()', function() {
         it('should return the field value', function() {
            rs.each(function(record, i) {
               assert.strictEqual(hierarchy.isNode(record), data[i].node);
            });
         });
      });

      describe('.getChildren()', function() {
         var getExpectChildren = function() {
            return {
               1: [3, 4],
               2: [5, 6],
               3: [],
               4: [],
               5: [],
               6: []
            };
         };

         it('should work with the record', function() {
            var expect = getExpectChildren();

            rs.each(function(record) {
               var children = hierarchy.getChildren(record, rs),
                  expectChildren = expect[record.getKey()],
                  j;

               assert.strictEqual(children.length, expectChildren.length);

               for (j = 0; j < children.length; j++) {
                  assert.strictEqual(children[j].getKey(), expectChildren[j]);
               }
            });
         });

         it('should work with the value', function() {
            var expect = getExpectChildren();

            rs.each(function(record) {
               var children = hierarchy.getChildren(record.getKey(), rs),
                  expectChildren = expect[record.getKey()],
                  j;

               assert.strictEqual(children.length, expectChildren.length);

               for (j = 0; j < children.length; j++) {
                  assert.strictEqual(children[j].getKey(), expectChildren[j]);
               }
            });
         });

         it('should work with not existent value', function() {
            var children = hierarchy.getChildren('some', rs);
            assert.strictEqual(children.length, 0);
         });

         it('should return all records in root if parent property is not defined', function() {
            var hierarchy = new Hierarchy({
                  keyProperty: 'id'
               }),
               check = function(children) {
                  assert.strictEqual(children.length, rs.getCount());
                  for (var i = 0; i < children.length; i++) {
                     assert.strictEqual(children[i], rs.at(i));
                  }
               };

            check(hierarchy.getChildren(null, rs));
            check(hierarchy.getChildren(undefined, rs));
         });

         it('should return records with undefined value of parentProperty if root is null', function() {
            var data = [
                  {id: 1},
                  {id: 2, parent: 1},
                  {id: 3},
                  {id: 4, parent: 1}
               ],
               rs = new RecordSet({
                  rawData: data,
                  keyProperty: 'id'
               }),
               hierarchy = new Hierarchy({
                  keyProperty: 'id',
                  parentProperty: 'parent'
               }),
               expect = [1, 3],
               check = function(children) {
                  assert.strictEqual(children.length, expect.length);
                  for (var i = 0; i < children.length; i++) {
                     assert.strictEqual(children[i].getKey(), expect[i]);
                  }
               };

            check(hierarchy.getChildren(null, rs));
         });
      });

      describe('.hasDeclaredChildren()', function() {
         it('should return the field value', function() {
            rs.each(function(record, i) {
               assert.strictEqual(hierarchy.hasDeclaredChildren(record), data[i].hasChildren);
            });
         });
      });

      describe('.hasParent()', function() {
         it('should work with the record', function() {
            rs.each(function(record, i) {
               var parent = hierarchy.hasParent(record, rs);
               assert.strictEqual(parent, !!data[i].parent);
            });
         });

         it('should work with the value', function() {
            rs.each(function(record, i) {
               var parent = hierarchy.hasParent(record.getKey(), rs);
               assert.strictEqual(parent, !!data[i].parent);
            });
         });
      });

      describe('.getParent()', function() {
         it('should work with the record', function() {
            rs.each(function(record, i) {
               var parent = hierarchy.getParent(record, rs);
               if (parent === null) {
                  assert.strictEqual(parent, data[i].parent);
               } else {
                  assert.strictEqual(parent.getKey(), data[i].parent);
               }
            });
         });

         it('should work with the value', function() {
            rs.each(function(record, i) {
               var parent = hierarchy.getParent(record.getKey(), rs);
               if (parent === null) {
                  assert.strictEqual(parent, data[i].parent);
               } else {
                  assert.strictEqual(parent.getKey(), data[i].parent);
               }
            });
         });

         it('should work with link to 0', function() {
            var data = [
                  {id: 0, parent: null, title: 'foo'},
                  {id: 1, parent: 0, title: 'bar'}
               ],
               rs = new RecordSet({
                  rawData: data,
                  keyProperty: 'id'
               });

            assert.strictEqual(hierarchy.getParent(1, rs), rs.at(0));
         });

         it('should work with link to null', function() {
            var data = [
                  {id: 0, parent: null, title: 'foo'}
               ],
               rs = new RecordSet({
                  rawData: data,
                  keyProperty: 'id'
               });

            assert.isNull(hierarchy.getParent(0, rs));
         });

         it('should work with link to undefined', function() {
            var data = [
                  {id: 0, title: 'foo'}
               ],
               rs = new RecordSet({
                  rawData: data,
                  keyProperty: 'id'
               });

            assert.isNull(hierarchy.getParent(0, rs));
         });

         it('should throw an Error with not existent value', function() {
            assert.throws(function() {
               hierarchy.getParent('some', rs);
            });
         });
      });
   });
});
