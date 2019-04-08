/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/relation/OneToMany',
   'Types/_entity/Model'
], function(
   OneToMany,
   Model
) {
   'use strict';

   OneToMany = OneToMany.default;
   Model = Model.default;

   describe('Types/_entity/relation/OneToMany', function() {
      var addChildren = function(mediator, parent, children) {
            for (var i = 0; i < children.length; i++) {
               mediator.addTo(parent, children[i], 'rel' + i);
            }
         },
         removeChildren = function(mediator, parent, children) {
            for (var i = 0; i < children.length; i++) {
               mediator.removeFrom(parent, children[i]);
            }
         },
         getParentAsSimple = function() {
            return 'parent';
         },
         getChildrenAsSimple = function() {
            return ['child0', 'child1', 'child2'];
         },
         getParentAsObject = function() {
            return {name: 'parent'};
         },
         getChildrenAsObjects = function() {
            return [{name: 'child0'}, {name: 'child1'}, {name: 'child2'}];
         },
         checkParent = function(mediator, parent, children) {
            for (var i = 0; i < children.length; i++) {
               assert.strictEqual(mediator.getParent(children[i]), parent);
            }
         },
         checkChildren = function(mediator, parent, children, unrelated) {
            var i = 0;
            mediator.each(parent, function(child, name) {
               assert.strictEqual(child, children[i]);
               assert.equal(name, unrelated ? undefined : 'rel' + i);
               i++;
            });
            assert.strictEqual(i, children.length);
         },
         mediator;

      beforeEach(function() {
         mediator = new OneToMany();
      });

      afterEach(function() {
         mediator.destroy();
         mediator = undefined;
      });

      describe('.addTo()', function() {
         it('should add a relation for primitives', function() {
            var parent = getParentAsSimple(),
               children = getChildrenAsSimple();

            addChildren(mediator, parent, children);
            checkParent(mediator, parent, children);
            checkChildren(mediator, parent, children);
         });

         it('should add a relation for objects', function() {
            var parent = getParentAsObject(),
               children = getChildrenAsObjects();

            addChildren(mediator, parent, children);
            checkParent(mediator, parent, children);
            checkChildren(mediator, parent, children);
         });

         it('should add same children for several parents', function() {
            var parent1 = 'parent1',
               parent2 = 'parent2',
               children = getChildrenAsSimple();

            addChildren(mediator, parent1, children);
            addChildren(mediator, parent2, children);
            checkParent(mediator, parent2, children);
            checkChildren(mediator, parent1, children, true);
            checkChildren(mediator, parent2, children);
         });
      });

      describe('.removeFrom()', function() {
         it('should remove a relation for primitives', function() {
            var parent = getParentAsSimple(),
               children = getChildrenAsSimple();

            addChildren(mediator, parent, children);
            removeChildren(mediator, parent, children);
            checkParent(mediator, undefined, children);
            checkChildren(mediator, parent, []);
         });

         it('should remove a relation for objects', function() {
            var parent = getParentAsObject(),
               children = getChildrenAsObjects();

            addChildren(mediator, parent, children);
            removeChildren(mediator, parent, children);
            checkParent(mediator, undefined, children);
            checkChildren(mediator, parent, []);
         });

         it('should remove same children for several parents', function() {
            var parent1 = 'parent1',
               parent2 = 'parent2',
               children = getChildrenAsSimple();

            addChildren(mediator, parent1, children);
            addChildren(mediator, parent2, children);

            removeChildren(mediator, parent1, children);
            checkParent(mediator, parent2, children);
            checkChildren(mediator, parent1, []);
            checkChildren(mediator, parent2, children);

            removeChildren(mediator, parent2, children);
            checkParent(mediator, undefined, children);
            checkChildren(mediator, parent1, []);
            checkChildren(mediator, parent2, []);
         });
      });

      describe('.clear()', function() {
         it('should work for primitives', function() {
            var parent = getParentAsSimple(),
               children = getChildrenAsSimple();

            addChildren(mediator, parent, children);
            mediator.clear(parent);
            checkParent(mediator, undefined, children);
            checkChildren(mediator, parent, []);
         });

         it('should work for objects', function() {
            var parent = getParentAsObject(),
               children = getChildrenAsObjects();

            addChildren(mediator, parent, children);
            mediator.clear(parent);
            checkParent(mediator, undefined, children);
            checkChildren(mediator, parent, []);
         });
      });

      describe('.each()', function() {
         it('should not call handler by default', function() {
            var called = false;
            mediator.each('a', function() {
               called = true;
            });
            assert.isFalse(called);

            mediator.each({}, function() {
               called = true;
            });
            assert.isFalse(called);
         });

         it('should return children for primitives', function() {
            var parent = getParentAsSimple(),
               children = getChildrenAsSimple();

            addChildren(mediator, parent, children);
            checkChildren(mediator, parent, children);
         });

         it('should return children for objects', function() {
            var parent = getParentAsObject(),
               children = getChildrenAsObjects();

            addChildren(mediator, parent, children);
            checkChildren(mediator, parent, children);
         });
      });

      describe('.getParent()', function() {
         it('should return undefined by default', function() {
            assert.isUndefined(mediator.getParent('a'));
            assert.isUndefined(mediator.getParent({}));
            assert.isUndefined(mediator.getParent(new Model()));
         });

         it('should return parent for primitives', function() {
            var parent = getParentAsSimple(),
               children = getChildrenAsSimple();

            addChildren(mediator, parent, children);
            checkParent(mediator, parent, children);
         });

         it('should return parent for objects', function() {
            var parent = getParentAsObject(),
               children = getChildrenAsObjects();

            addChildren(mediator, parent, children);
            checkParent(mediator, parent, children);
         });
      });
   });
});
