/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_collection/format/Format',
   'Types/_entity/format/fieldsFactory'
], function(
   Format,
   fieldsFactory
) {
   'use strict';

   Format = Format.default;
   fieldsFactory = fieldsFactory.default;

   describe('Types/Format/Format', function() {
      var format;

      beforeEach(function() {
         format = new Format();
      });

      afterEach(function() {
         format = undefined;
      });

      describe('.constructor()', function() {
         it('should throw an error if items contains not a field format', function() {
            assert.throws(function() {
               new Format({
                  items: [null]
               });
            });
         });
         it('should throw an error if items contains fields with same names', function() {
            assert.throws(function() {
               new Format({
                  items: [
                     fieldsFactory({type: 'integer', 'name': 'f1'}),
                     fieldsFactory({type: 'integer', 'name': 'f2'}),
                     fieldsFactory({type: 'string', 'name': 'f1'})
                  ]
               });
            });
         });
      });

      describe('.add()', function() {
         it('should throw an error if not a field format passed', function() {
            assert.throws(function() {
               format.add(0);
            });
         });
         it('should throw an error if field with given name already exists', function() {
            format.add(fieldsFactory({type: 'integer', 'name': 'f1'}));
            assert.throws(function() {
               format.add(fieldsFactory({type: 'integer', 'name': 'f1'}));
            });
         });
      });

      describe('.remove()', function() {
         it('should throw an error if not a field format passed', function() {
            assert.throws(function() {
               format.remove(1);
            });
         });
      });

      describe('.replace()', function() {
         it('should throw an error if not a field format passed', function() {
            assert.throws(function() {
               format.replace(2, 0);
            });
         });
         it('should throw an error if field with given name already exists', function() {
            format.add(fieldsFactory({type: 'integer', 'name': 'f1'}));
            format.add(fieldsFactory({type: 'integer', 'name': 'f2'}));
            format.replace(fieldsFactory({type: 'integer', 'name': 'f2'}), 1);
            assert.throws(function() {
               format.replace(fieldsFactory({type: 'integer', 'name': 'f1'}), 1);
            });
         });
      });

      describe('.assign()', function() {
         it('should throw an error if not a field format passed', function() {
            assert.throws(function() {
               format.assign([3]);
            });
         });
         it('should throw an error if field with given name already exists', function() {
            format.add(fieldsFactory({type: 'integer', 'name': 'f1'}));
            format.add(fieldsFactory({type: 'integer', 'name': 'f2'}));
            assert.throws(function() {
               format.assign([
                  fieldsFactory({type: 'integer', 'name': 'f1'}),
                  fieldsFactory({type: 'integer', 'name': 'f2'}),
                  fieldsFactory({type: 'integer', 'name': 'f1'})
               ]);
            });
         });
      });

      describe('.append()', function() {
         it('should throw an error if not a field format passed', function() {
            assert.throws(function() {
               format.append([4]);
            });
         });
         it('should throw an error if field with given name already exists', function() {
            format.append([fieldsFactory({type: 'integer', 'name': 'f1'})]);
            assert.throws(function() {
               format.append([fieldsFactory({type: 'integer', 'name': 'f1'})]);
            });
         });
      });

      describe('.prepend()', function() {
         it('should throw an error if not a field format passed', function() {
            assert.throws(function() {
               format.prepend([5]);
            });
         });
         it('should throw an error if field with given name already exists', function() {
            format.prepend([fieldsFactory({type: 'integer', 'name': 'f1'})]);
            assert.throws(function() {
               format.prepend([fieldsFactory({type: 'integer', 'name': 'f1'})]);
            });
         });
      });

      describe('.removeField()', function() {
         it('should remove field with given name', function() {
            var format = new Format({
               items: [
                  fieldsFactory({type: 'integer', 'name': 'f1'}),
                  fieldsFactory({type: 'string', 'name': 'f2'})
               ]
            });
            format.removeField('f2');
            assert.strictEqual(format.getCount(), 1);
            format.removeField('f1');
            assert.strictEqual(format.getCount(), 0);
         });
         it('should throw an error if field with given name does not exist', function() {
            assert.throws(function() {
               format.removeField('f1');
            });
         });
      });

      describe('.getFieldIndex()', function() {
         it('should return exists field index', function() {
            var format = new Format({
               items: [
                  fieldsFactory({type: 'integer', 'name': 'f1'}),
                  fieldsFactory({type: 'string', 'name': 'f2'})
               ]
            });
            assert.strictEqual(format.getFieldIndex('f1'), 0);
            assert.strictEqual(format.getFieldIndex('f2'), 1);
         });
         it('should -1 if field does not exist', function() {
            assert.strictEqual(format.getFieldIndex('f1'), -1);
            assert.strictEqual(format.getFieldIndex('f2'), -1);
         });
      });

      describe('.getFieldName()', function() {
         it('should return field name by index', function() {
            var format = new Format({
               items: [
                  fieldsFactory({type: 'integer', 'name': 'f1'}),
                  fieldsFactory({type: 'string', 'name': 'f2'})
               ]
            });
            assert.strictEqual(format.getFieldName(0), 'f1');
            assert.strictEqual(format.getFieldName(1), 'f2');
         });
         it('should throw an error if index is out of bounds', function() {
            assert.throws(function() {
               format.getFieldName(0);
            });
         });
      });

      describe('.clone()', function() {
         it('should return the clone', function() {
            var format = new Format({
               items: [
                  fieldsFactory({type: 'integer', 'name': 'f1'}),
                  fieldsFactory({type: 'string', 'name': 'f2'})
               ]
            });
            var clone = format.clone();
            assert.instanceOf(clone, Format);
            assert.notEqual(format, clone);
            assert.strictEqual(format.getCount(), clone.getCount());
            for (var i = 0, count = format.getCount(); i < count; i++) {
               assert.notEqual(format.at(i), clone.at(i));
               assert.isTrue(
                  format.at(i).isEqual(
                     clone.at(i)
                  )
               );
            }
         });
      });
   });
});
