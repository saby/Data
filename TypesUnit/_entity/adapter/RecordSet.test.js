/* global define, beforeEach, afterEach, describe, context, it, assert */
define([
   'Types/_entity/adapter/RecordSet',
   'Types/_entity/adapter/RecordSetTable',
   'Types/_entity/adapter/RecordSetRecord',
   'Types/_collection/RecordSet',
   'Types/_entity/Record',
   'Types/_entity/Model',
   'Core/core-extend'
], function(
   RecordSetAdapter,
   RecordSetTableAdapter,
   RecordSetRecordAdaprter,
   RecordSet,
   Record,
   Model,
   extend
) {
   'use strict';

   RecordSetAdapter = RecordSetAdapter.default;
   RecordSetTableAdapter = RecordSetTableAdapter.default;
   RecordSetRecordAdaprter = RecordSetRecordAdaprter.default;
   RecordSet = RecordSet.default;
   Record = Record.default;
   Model = Model.default;

   describe('Types/_entity/adapter/RecordSet', function() {
      var data,
         adapter;

      beforeEach(function() {
         data = new RecordSet({
            rawData: [{
               id: 1,
               name: 'Иванов'
            }, {
               id: 2,
               name: 'Петров'
            }, {
               id: 3,
               name: 'Сидоров'
            }]
         });

         adapter = new RecordSetAdapter();
      });

      afterEach(function() {
         data = undefined;
         adapter = undefined;
      });

      describe('.forTable()', function() {
         it('should return table adapter', function() {
            assert.instanceOf(
               adapter.forTable(),
               RecordSetTableAdapter
            );
         });
         it('should pass data to the table adapter', function() {
            assert.strictEqual(
               adapter.forTable(data).getData(),
               data
            );
         });
      });

      describe('.forRecord()', function() {
         it('should return record adapter', function() {
            assert.instanceOf(
               adapter.forRecord(),
               RecordSetRecordAdaprter
            );
         });
         it('should pass data to the record adapter', function() {
            var data = new Record();
            assert.strictEqual(
               adapter.forRecord(data).getData(),
               data
            );
         });

         context('when enclosed model used', function() {
            var ModelA,
               ModelB,
               model;

            beforeEach(function() {
               ModelA = extend.extend(Model, {
                  _$properties: {
                     propA: {
                        get: function() {
                           return 'A';
                        }
                     }
                  }
               });

               ModelB = extend.extend(Model, {
                  _$properties: {
                     propB: {
                        get: function() {
                           return 'B';
                        }
                     }
                  }
               });

               model = new ModelA({
                  rawData: new ModelB({
                     rawData: {
                        propC: 'C'
                     }
                  }),
                  adapter: new RecordSetAdapter()
               });
            });

            afterEach(function() {
               ModelA = undefined;
               ModelB = undefined;
               model = undefined;
            });

            it('should return the property value', function() {
               assert.strictEqual(model.get('propA'), 'A');
               assert.strictEqual(model.get('propB'), 'B');
               assert.strictEqual(model.get('propC'), 'C');
            });
            it('should return the property value format is defined', function() {
               model = new ModelA({
                  format: [],
                  rawData: new ModelB({
                     format: [{
                        name: 'propC', type: 'string'
                     }],
                     rawData: {
                        propC: 'C'
                     }
                  }),
                  adapter: new RecordSetAdapter()
               });

               assert.strictEqual(model.get('propA'), 'A');
               assert.strictEqual(model.get('propB'), 'B');
               assert.strictEqual(model.get('propC'), 'C');
            });
            it('should cast it to date', function() {
               model = new ModelA({
                  format: [{name: 'date', type: 'date'}],
                  rawData: new ModelB({
                     format: [{
                        name: 'date', type: 'date'
                     }],
                     rawData: {
                        date: '2016-01-01'
                     }
                  }),
                  adapter: new RecordSetAdapter()
               });

               assert.deepEqual(model.get('date'), new Date(2016, 0, 1));
            });
         });
      });

      describe('.getKeyField()', function() {
         it('should return option keyProperty for recordset', function() {
            assert.strictEqual(adapter.getKeyField(data), data.getKeyProperty());
         });
         it('should return option keyProperty for model', function() {
            var data = new Model({
               keyProperty: 'test'
            });
            assert.strictEqual(adapter.getKeyField(data), 'test');
         });
      });

      describe('.getProperty()', function() {
         it('should return the property value', function() {
            assert.strictEqual(
               3,
               adapter.getProperty(data, 'count')
            );
            assert.isUndefined(
               adapter.getProperty(data, 'total')
            );
            assert.isUndefined(
               adapter.getProperty(data)
            );
         });

         it('should return undefined on invalid data', function() {
            assert.isUndefined(
               adapter.getProperty({})
            );
            assert.isUndefined(
               adapter.getProperty('')
            );
            assert.isUndefined(
               adapter.getProperty(0)
            );
            assert.isUndefined(
               adapter.getProperty()
            );
         });
      });

      describe('.setProperty()', function() {
         it('should set the property value', function() {
            adapter.setProperty(data, 'keyProperty', 'name');
            assert.strictEqual(
               'name',
               data.getKeyProperty()
            );
         });
         it('should throw an error if property does not exist', function() {
            assert.throws(function() {
               adapter.setProperty(data, 'some', 'value');
            });
         });
      });
   });
});
