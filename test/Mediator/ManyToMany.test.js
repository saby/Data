/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/relation/ManyToMany',
   'Types/_entity/Model'
], function(
   ManyToMany
) {
   'use strict';

   ManyToMany = ManyToMany.default;

   describe('Types/_entity/relation/ManyToMany', function() {
      var addRelationship = function(mediator, master, slaves) {
            for (var i = 0; i < slaves.length; i++) {
               mediator.addRelationship(master, slaves[i], 'rel' + i);
            }
         },
         removeRelationship = function(mediator, master, slaves) {
            for (var i = 0; i < slaves.length; i++) {
               mediator.removeRelationship(master, slaves[i]);
            }
         },
         getMasterAsSimple = function() {
            return 'master';
         },
         getSlavesAsSimple = function() {
            return ['slave0', 'slave1', 'slave2'];
         },
         getMasterAsObject = function() {
            return {name: 'master'};
         },
         getSlavesAsObjects = function() {
            return [{name: 'slave0'}, {name: 'slave1'}, {name: 'slave2'}];
         },
         checkMasters = function(mediator, masters, slaves) {
            var j;
            for (var i = 0; i < slaves.length; i++) {
               j = 0;
               mediator.belongsTo(slaves[i], function(thisMaster, name) {
                  assert.strictEqual(thisMaster, masters[j]);
                  assert.equal(name, 'rel' + i);
                  j++;
               });
            }
         },
         checkSlaves = function(mediator, master, slaves, relOffset) {
            var i = 0;
            relOffset = relOffset || 0;
            mediator.hasMany(master, function(slave, name) {
               assert.strictEqual(slave, slaves[i]);
               assert.equal(name, 'rel' + (i + relOffset));
               i++;
            });
            assert.strictEqual(i, slaves.length);
         },
         mediator;

      beforeEach(function() {
         mediator = new ManyToMany();
      });

      afterEach(function() {
         mediator.destroy();
         mediator = undefined;
      });

      describe('.addRelationship()', function() {
         it('should add a relation for primitives', function() {
            var master = getMasterAsSimple(),
               slaves = getSlavesAsSimple();

            addRelationship(mediator, master, slaves);
            checkMasters(mediator, [master], slaves);
            checkSlaves(mediator, master, slaves);
         });

         it('should add a relation for objects', function() {
            var master = getMasterAsObject(),
               slaves = getSlavesAsObjects();

            addRelationship(mediator, master, slaves);
            checkMasters(mediator, [master], slaves);
            checkSlaves(mediator, master, slaves);
         });

         it('should add same slaves for several masters', function() {
            var master1 = 'master1',
               master2 = 'master2',
               slaves = getSlavesAsSimple();

            addRelationship(mediator, master1, slaves);
            addRelationship(mediator, master2, slaves);

            checkMasters(mediator, [master1, master2], slaves);
            checkSlaves(mediator, master1, slaves);
            checkSlaves(mediator, master2, slaves);
         });
      });

      describe('.removeRelationship()', function() {
         it('should remove a relation for primitives', function() {
            var master = getMasterAsSimple(),
               slaves = getSlavesAsSimple();

            addRelationship(mediator, master, slaves);
            removeRelationship(mediator, master, slaves);
            checkMasters(mediator, [], slaves);
            checkSlaves(mediator, master, []);
         });

         it('should remove a relation for objects', function() {
            var master = getMasterAsObject(),
               slaves = getSlavesAsObjects();

            addRelationship(mediator, master, slaves);
            removeRelationship(mediator, master, slaves);
            checkMasters(mediator, [], slaves);
            checkSlaves(mediator, master, []);
         });

         it('should remove same slaves for several masters', function() {
            var master1 = 'master1',
               master2 = 'master2',
               slaves = getSlavesAsSimple();

            addRelationship(mediator, master1, slaves);
            addRelationship(mediator, master2, slaves);

            removeRelationship(mediator, master1, slaves);
            checkMasters(mediator, [master2], slaves);
            checkSlaves(mediator, master1, []);
            checkSlaves(mediator, master2, slaves);

            removeRelationship(mediator, master2, slaves);
            checkMasters(mediator, [], slaves);
            checkSlaves(mediator, master1, []);
            checkSlaves(mediator, master2, []);
         });
      });

      describe('.clear()', function() {
         it('should remove slaves', function() {
            var master = getMasterAsSimple(),
               slaves = getSlavesAsSimple();

            addRelationship(mediator, master, slaves);
            mediator.clear(master);
            checkMasters(mediator, [], slaves);
            checkSlaves(mediator, master, []);
         });

         it('should remove masters', function() {
            var master = getMasterAsObject(),
               slaves = getSlavesAsObjects();

            addRelationship(mediator, master, slaves);
            for (var i = 0; i < slaves.length; i++) {
               mediator.clear(slaves[i]);
               checkMasters(mediator, [], slaves.slice(0, i));
               checkSlaves(mediator, master, slaves.slice(i + 1), i + 1);
            }
         });
      });

      describe('.hasMany()', function() {
         it('should not call handler by default', function() {
            var called = false;
            mediator.hasMany('a', function() {
               called = true;
            });
            assert.isFalse(called);

            mediator.hasMany({}, function() {
               called = true;
            });
            assert.isFalse(called);
         });

         it('should return slaves for primitives', function() {
            var master = getMasterAsSimple(),
               slaves = getSlavesAsSimple(),
               i = 0;

            addRelationship(mediator, master, slaves);
            mediator.hasMany(master, function(slave, name) {
               assert.strictEqual(slave, slaves[i]);
               assert.strictEqual(name, 'rel' + i);
               i++;
            });
         });

         it('should return slaves for objects', function() {
            var master = getMasterAsObject(),
               slaves = getSlavesAsObjects(),
               i = 0;

            addRelationship(mediator, master, slaves);
            mediator.hasMany(master, function(slave, name) {
               assert.strictEqual(slave, slaves[i]);
               assert.strictEqual(name, 'rel' + i);
               i++;
            });
         });
      });

      describe('.belongsTo()', function() {
         it('should not call handler by default', function() {
            var called = false;
            mediator.belongsTo('a', function() {
               called = true;
            });
            assert.isFalse(called);

            mediator.belongsTo({}, function() {
               called = true;
            });
            assert.isFalse(called);
         });

         it('should return master for primitives', function() {
            var master = getMasterAsSimple(),
               slaves = getSlavesAsSimple();

            addRelationship(mediator, master, slaves);
            for (var i = 0; i < slaves.length; i++) {
               mediator.belongsTo(slaves[i], function(thisMaster, name) {
                  assert.strictEqual(thisMaster, master);
                  assert.strictEqual(name, 'rel' + i);
               });
            }
         });

         it('should return master for objects', function() {
            var master = getMasterAsObject(),
               slaves = getSlavesAsObjects();

            addRelationship(mediator, master, slaves);
            for (var i = 0; i < slaves.length; i++) {
               mediator.belongsTo(slaves[i], function(thisMaster, name) {
                  assert.strictEqual(thisMaster, master);
                  assert.strictEqual(name, 'rel' + i);
               });
            }
         });

         it('should return all masters', function() {
            var masters = [getMasterAsSimple(), getMasterAsObject()],
               slaves = getSlavesAsSimple(),
               j;

            addRelationship(mediator, masters[0], slaves);
            addRelationship(mediator, masters[1], slaves);

            for (var i = 0; i < slaves.length; i++) {
               j = 0;
               mediator.belongsTo(slaves[i], function(thisMaster, name) {
                  assert.strictEqual(thisMaster, masters[j]);
                  assert.strictEqual(name, 'rel' + i);
                  j++;
               });
            }
         });
      });
   });
});
