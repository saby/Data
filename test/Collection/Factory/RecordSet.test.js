/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_collection/factory/recordSet',
   'Types/collection',
   'Types/entity'
], function(
   recordSetFactoryEs,
   collection,
   type
) {
   'use strict';

   var recordSetFactory = recordSetFactoryEs.default;

   describe('Types/Collection/Factory/RecordSet', function() {
      var List = collection.List;
      var Record = type.Record;
      var items;
      var itemsList;

      beforeEach(function() {
         items = [
            new Record({rawData: {id: 1}}),
            new Record({rawData: {id: 2}}),
            new Record({rawData: {id: 3}})
         ];
         itemsList = new List({items: items});
      });

      afterEach(function() {
         items = undefined;
         itemsList = undefined;
      });

      describe('constructor()', function() {
         it('should throw an error on invalid type of argument "items"', function() {
            assert.throws(function() {
               recordSetFactory();
            });
            assert.throws(function() {
               recordSetFactory({});
            });
            assert.throws(function() {
               recordSetFactory(null);
            });
         });

         it('should return RecordSet', function() {
            assert.instanceOf(recordSetFactory(itemsList), collection.RecordSet);
         });

         it('should return RecordSet with given collection', function() {
            var rs = recordSetFactory(itemsList);

            rs.each(function(record, index) {
               assert.isTrue(record.isEqual(items[index]));
            });
            assert.equal(rs.getCount(), items.length);
         });

         it('should return RecordSet with given options', function() {
            var options = {idProperty: 'foo'},
               rs = recordSetFactory(itemsList, options);

            assert.equal(rs.getIdProperty(), options.idProperty);
         });
      });
   });
});
