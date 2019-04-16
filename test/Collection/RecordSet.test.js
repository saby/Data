/* global define, before, beforeEach, afterEach, describe, it, assert, context */
define([
   'Types/_collection/RecordSet',
   'Types/_collection/IObservable',
   'Types/_entity/Record',
   'Types/_entity/Model',
   'Types/_entity/format/fieldsFactory',
   'Types/_entity/adapter/Json',
   'Types/_entity/adapter/Sbis',
   'Types/_entity/adapter/Cow',
   'Core/core-extend',
   'Core/Serializer'
], function(
   RecordSet,
   IBindCollection,
   Record,
   Model,
   fieldsFactory,
   JsonAdapter,
   SbisAdapter,
   CowAdapter,
   coreExtend,
   Serializer
) {
   'use strict';

   Record = Record.default;
   Model = Model.default;
   RecordSet = RecordSet.default;
   IBindCollection = IBindCollection.default;
   fieldsFactory = fieldsFactory.default;
   JsonAdapter = JsonAdapter.default;
   SbisAdapter = SbisAdapter.default;
   CowAdapter = CowAdapter.default;

   describe('Types/_collection/RecordSet', function() {
      var rs;
      var items;
      var getItems;
      var getSomeItem;
      var getSbisItems;
      var getItemsFormat;

      beforeEach(function() {
         getItems = function() {
            return [{
               id: 1,
               name: 'Ivanoff'
            }, {
               id: 2,
               name: 'Petroff'
            }, {
               id: 3,
               name: 'Sidoroff'
            }, {
               id: 4,
               name: 'Puhoff'
            }, {
               id: 5,
               name: 'Molotsoff'
            }, {
               id: 6,
               name: 'Hangryoff'
            }, {
               id: 7,
               name: 'Arbuzznoff'
            }, {
               id: 8,
               name: 'Arbuzznoff'
            }];
         };

         getSomeItem = function() {
            return {
               id: 999,
               name: 'Test'
            };
         };

         getSbisItems = function() {
            return {
               d: [
                  [1, 'Ivanoff'],
                  [2, 'Petroff'],
                  [3, 'Sidoroff'],
                  [4, 'Puhoff'],
                  [5, 'Molotsoff'],
                  [6, 'Hangryoff'],
                  [7, 'Arbuzznoff'],
                  [8, 'Arbuzznoff']
               ],
               s: [{
                  n: 'id',
                  t: 'Число целое'
               }, {
                  n: 'name',
                  t: 'Строка'
               }]
            };
         };

         getItemsFormat = function() {
            return [
               {name: 'id', type: 'integer'},
               {name: 'name', type: 'string'}
            ];
         };

         items = getItems();
         rs = new RecordSet({
            rawData: getItems(),
            idProperty: 'id'
         });
      });

      afterEach(function() {
         rs.destroy();
         rs = undefined;

         items = undefined;
      });

      describe('.constructor()', function() {
         it('should pass idProperty to the record', function() {
            assert.equal(rs.at(1).get('id'), 2);
         });
      });

      describe('.getEnumerator()', function() {
         it('should return records', function() {
            var enumerator = rs.getEnumerator();
            while (enumerator.moveNext()) {
               assert.instanceOf(enumerator.getCurrent(), Record);
            }
         });

         it('should return all records', function() {
            var enumerator = rs.getEnumerator(),
               foundCount = 0;
            while (enumerator.moveNext()) {
               foundCount++;
            }
            assert.equal(rs.getCount(), foundCount);
         });

         it('should return records owned by itself', function() {
            var enumerator = rs.getEnumerator();
            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent().getOwner(), rs);
            }
         });

         it('should return records with state "Unchanged"', function() {
            var enumerator = rs.getEnumerator();
            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent().getState(), Record.RecordState.UNCHANGED);
            }
         });

         it('should return only records with state "Unchanged"', function() {
            var enumerator = rs.getEnumerator(Record.RecordState.UNCHANGED),
               foundCount = 0;
            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent().getState(), Record.RecordState.UNCHANGED);
               foundCount++;
            }
            assert.equal(rs.getCount(), foundCount);
         });

         it('should return no records with state "Changed"', function() {
            var enumerator = rs.getEnumerator(Record.RecordState.CHANGED),
               found = false;
            while (enumerator.moveNext()) {
               found = true;
            }
            assert.isFalse(found);
         });

         it('should return only records with state "Changed"', function() {
            rs.at(1).set('id', 'test');
            var enumerator = rs.getEnumerator(Record.RecordState.CHANGED),
               foundCount = 0;
            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent().getState(), Record.RecordState.CHANGED);
               foundCount++;
            }
            assert.equal(foundCount, 1);
         });

         it('should return no records with state "Added"', function() {
            var enumerator = rs.getEnumerator(Record.RecordState.ADDED),
               found = false;
            while (enumerator.moveNext()) {
               found = true;
            }
            assert.isFalse(found);
         });

         it('should return only records with state "Added"', function() {
            rs.add(new Model());
            var enumerator = rs.getEnumerator(Record.RecordState.ADDED),
               foundCount = 0;
            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent().getState(), Record.RecordState.ADDED);
               foundCount++;
            }
            assert.equal(foundCount, 1);
         });

         it('should return no records with state "Deleted"', function() {
            var enumerator = rs.getEnumerator(Record.RecordState.DELETED),
               found = false;
            while (enumerator.moveNext()) {
               found = true;
            }
            assert.isFalse(found);
         });

         it('should return only records with state "Deleted"', function() {
            rs.at(2).setState(Record.RecordState.DELETED);
            var enumerator = rs.getEnumerator(Record.RecordState.DELETED),
               foundCount = 0;
            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent().getState(), Record.RecordState.DELETED);
               foundCount++;
            }
            assert.equal(foundCount, 1);
         });

         it('should return no records with state "Detached"', function() {
            var enumerator = rs.getEnumerator(Record.RecordState.DETACHED),
               found = false;
            while (enumerator.moveNext()) {
               found = true;
            }
            assert.isFalse(found);
         });
      });

      describe('.each()', function() {
         it('should return records', function() {
            rs.each(function(record) {
               assert.instanceOf(record, Record);
            });
         });

         it('should return all records', function() {
            var foundCount = 0;
            rs.each(function() {
               foundCount++;
            });
            assert.equal(rs.getCount(), foundCount);
         });

         it('should return record indexes', function() {
            var expect = 0;
            rs.each(function(record, index) {
               assert.equal(index, expect);
               expect++;
            });
         });

         it('should make call in self context', function() {
            rs.each(function() {
               assert.strictEqual(this, rs);
            });
         });

         it('should make call in given context if state is skipped', function() {
            var context = {};
            rs.each(function() {
               assert.strictEqual(this, context);
            }, context);
         });

         it('should make call in given context if state is used', function() {
            var context = {};
            rs.each(function() {
               assert.strictEqual(this, context);
            }, Record.RecordState.UNCHANGED, context);
         });

         it('should return records owned by itself', function() {
            rs.each(function(record) {
               assert.strictEqual(record.getOwner(), rs);
            });
         });

         it('should return read only records from read only recordset', function() {
            var rs = new RecordSet({
               rawData: getItems(),
               writable: false
            });
            rs.each(function(record) {
               assert.isFalse(record.writable);
            });
         });

         it('should return records with state "Unchanged"', function() {
            rs.each(function(record) {
               assert.strictEqual(record.getState(), Record.RecordState.UNCHANGED);
            });
         });

         it('should return only records with state "Unchanged"', function() {
            var foundCount = 0;
            rs.each(function(record) {
               assert.strictEqual(record.getState(), Record.RecordState.UNCHANGED);
               foundCount++;
            }, Record.RecordState.UNCHANGED);
            assert.equal(rs.getCount(), foundCount);
         });

         it('should return no records with state "Changed"', function() {
            var found = false;
            rs.each(function() {
               found = true;
            }, Record.RecordState.CHANGED);
            assert.isFalse(found);
         });

         it('should return only records with state "Changed"', function() {
            rs.at(1).set('id', 'test');
            var foundCount = 0;
            rs.each(function(record) {
               assert.strictEqual(record.getState(), Record.RecordState.CHANGED);
               foundCount++;
            }, Record.RecordState.CHANGED);
            assert.equal(foundCount, 1);
         });

         it('should return no records with state "Added"', function() {
            var found = false;
            rs.each(function() {
               found = true;
            }, Record.RecordState.ADDED);
            assert.isFalse(found);
         });

         it('should return only records with state "Added"', function() {
            rs.add(new Model());
            var foundCount = 0;
            rs.each(function(record) {
               assert.strictEqual(record.getState(), Record.RecordState.ADDED);
               foundCount++;
            }, Record.RecordState.ADDED);
            assert.equal(foundCount, 1);
         });

         it('should return no records with state "Deleted"', function() {
            var found = false;
            rs.each(function() {
               found = true;
            }, Record.RecordState.DELETED);
            assert.isFalse(found);
         });

         it('should return only records with state "Deleted"', function() {
            rs.at(2).setState(Record.RecordState.DELETED);
            var foundCount = 0;
            rs.each(function(record) {
               assert.strictEqual(record.getState(), Record.RecordState.DELETED);
               foundCount++;
            }, Record.RecordState.DELETED);
            assert.equal(foundCount, 1);
         });

         it('should return no records with state "Detached"', function() {
            var found = false;
            rs.each(function() {
               found = true;
            }, Record.RecordState.DETACHED);
            assert.isFalse(found);
         });
      });

      describe('.isEqual()', function() {
         it('should accept an invalid argument', function() {
            var rs = new RecordSet();
            assert.isFalse(rs.isEqual());
            assert.isFalse(rs.isEqual(null));
            assert.isFalse(rs.isEqual(false));
            assert.isFalse(rs.isEqual(true));
            assert.isFalse(rs.isEqual(0));
            assert.isFalse(rs.isEqual(1));
            assert.isFalse(rs.isEqual({}));
            assert.isFalse(rs.isEqual([]));
         });

         it('should return true for the same RecordSet', function() {
            var same = new RecordSet({
               rawData: getItems()
            });
            assert.isTrue(rs.isEqual(same));
         });

         it('should return true for itself', function() {
            assert.isTrue(rs.isEqual(rs));
         });

         it('should return true for the clone', function() {
            assert.isTrue(rs.isEqual(rs.clone()));
         });

         it('should return true for empties', function() {
            var rs = new RecordSet();
            assert.isTrue(rs.isEqual(new RecordSet()));
         });

         it('should return false if record added', function() {
            var same = new RecordSet({
               rawData: getItems()
            });
            same.add(rs.at(0).clone());
            assert.isFalse(rs.isEqual(same));
         });

         it('should return true if same record replaced', function() {
            var same = new RecordSet({
               rawData: getItems()
            });
            same.replace(rs.at(0).clone(), 0);
            assert.isTrue(rs.isEqual(same));
         });

         it('should return false if not same record replaced', function() {
            var same = new RecordSet({
               rawData: getItems()
            });
            same.replace(rs.at(1).clone(), 0);
            assert.isFalse(rs.isEqual(same));
         });

         it('should return false if record removed', function() {
            var same = new RecordSet({
               rawData: getItems()
            });
            same.removeAt(0);
            assert.isFalse(rs.isEqual(same));
         });

         it('should return false if record updated', function() {
            var same = new RecordSet({
               rawData: getItems()
            });
            same.at(0).set('name', 'Aaa');
            assert.isFalse(rs.isEqual(same));
         });
      });

      describe('.getRawData()', function() {
         it('should return the value that was passed to the constructor', function() {
            var data = [{}],
               rs = new RecordSet({
                  rawData: data
               });
            assert.deepEqual(rs.getRawData(), data);
         });

         it('should return the changed value after add a new record', function() {
            var rs = new RecordSet(),
               data = {a: 1};
            rs.add(new Model({
               rawData: data
            }));
            assert.deepEqual(rs.getRawData()[0], data);
         });
      });

      describe('.setRawData()', function() {
         it('should return elem by index', function() {
            var rs = new RecordSet({
               rawData: getItems(),
               idProperty: 'id'
            });
            rs.setRawData([{
               id: 1000,
               name: 'Foo'
            }, {
               id: 1001,
               name: 'Bar'
            }]);
            assert.equal(rs.getIndex(rs.at(1)), 1);
         });

         it('should replace a record', function() {
            var oldRec = rs.at(0),
               newRec;

            rs.setRawData([{
               id: 1,
               name: 'Foo'
            }]);
            newRec = rs.at(0);

            assert.notEqual(oldRec, newRec);
         });

         it('should change state of replaced record to "Detached"', function() {
            var oldRec = rs.at(0);

            rs.setRawData([{
               id: 1,
               name: 'Foo'
            }]);

            assert.equal(oldRec.getState(), Record.RecordState.DETACHED);
         });

         it('should trigger an event with valid arguments', function() {
            var firesCount = 0,
               given = {},
               handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                  given.action = action;
                  given.newItems = newItems;
                  given.newItemsIndex = newItemsIndex;
                  given.oldItems = oldItems;
                  given.oldItemsIndex = oldItemsIndex;
                  firesCount++;
               },
               oldCount = rs.getCount();

            rs.subscribe('onCollectionChange', handler);
            rs.setRawData([{
               id: 1,
               name: 'Ivanoff'
            }, {
               id: 2,
               name: 'Petroff'
            }, {
               id: 13,
               name: 'Sidoroff'
            }]);
            rs.unsubscribe('onCollectionChange', handler);

            assert.strictEqual(firesCount, 1);
            assert.strictEqual(given.action, IBindCollection.ACTION_RESET);
            assert.strictEqual(given.newItems.length, rs.getCount());
            assert.strictEqual(given.newItemsIndex, 0);
            assert.strictEqual(given.oldItems.length, oldCount);
            assert.strictEqual(given.oldItemsIndex, 0);
         });
      });

      describe('.getFormat()', function() {
         it('should build the format from json raw data', function() {
            var format = rs.getFormat();
            assert.strictEqual(format.getCount(), 2);
            assert.strictEqual(format.at(0).getName(), 'id');
            assert.strictEqual(format.at(1).getName(), 'name');
         });

         it('should return empty format for empty raw data', function() {
            var rs = new RecordSet();
            assert.strictEqual(rs.getFormat().getCount(), 0);
         });

         it('should build the format from sbis raw data', function() {
            var data = getSbisItems(),
               rs = new RecordSet({
                  rawData: data,
                  adapter: 'Types/entity:adapter.Sbis'
               }),
               format = rs.getFormat();
            assert.strictEqual(format.getCount(), data.s.length);
            format.each(function(item, index) {
               assert.strictEqual(item.getName(), data.s[index].n);
            });
         });

         it('should build the record format from declarative option', function() {
            var declaration = [{
                  name: 'id',
                  type: 'integer'
               }, {
                  name: 'title',
                  type: 'string'
               }, {
                  name: 'max',
                  type: 'integer'
               }, {
                  name: 'main',
                  type: 'boolean'
               }],
               rs = new RecordSet({
                  format: declaration,
                  rawData: items
               }),
               format = rs.getFormat();
            assert.strictEqual(format.getCount(), declaration.length);
            format.each(function(item, index) {
               assert.strictEqual(item.getName(), declaration[index].name);
               assert.strictEqual(item.getType().toLowerCase(), declaration[index].type);
            });
         });

         it('should build the format by Model\'s format if don\'t have it\'s own', function() {
            var Foo = coreExtend.extend(Model, {
                  _$format: {
                     bar: Number
                  }
               }),
               rs = new RecordSet({
                  model: Foo
               }),
               format = rs.getFormat();

            assert.strictEqual(format.at(0).getName(), 'bar');
            assert.strictEqual(format.at(0).getType(), Number);
         });
      });

      describe('.addField()', function() {
         it('should add the field from the declaration for JSON adapter', function() {
            var idProperty = 'id',
               fieldName = 'login',
               fieldDefault = 'user',
               index = 0;

            rs = new RecordSet({
               rawData: getItems(),
               idProperty: idProperty
            });

            //Force create indices
            rs.each(function(record) {
               record.get(idProperty);
            });

            rs.addField({
               name: fieldName,
               type: 'string',
               defaultValue: fieldDefault
            }, index);

            var format = rs.getFormat();
            assert.strictEqual(format.at(index).getName(), fieldName);
            assert.strictEqual(format.at(index).getDefaultValue(), fieldDefault);

            rs.each(function(record) {
               var format = record.getFormat();
               assert.strictEqual(format.at(index).getName(), fieldName);
               assert.strictEqual(format.at(index).getDefaultValue(), fieldDefault);

               assert.strictEqual(record.get(fieldName), fieldDefault);
            });
         });

         it('should add the field from the declaration for SBIS adapter', function() {
            var idProperty = 'id',
               index = 0,
               fieldName = 'login',
               fieldDefault = 'user';

            var rs = new RecordSet({
               rawData: getSbisItems(),
               adapter: 'Types/entity:adapter.Sbis',
               idProperty: idProperty
            });

            //Force create indices
            rs.each(function(record) {
               record.get(idProperty);
            });

            rs.addField({
               name: fieldName,
               type: 'string',
               defaultValue: fieldDefault
            }, index);

            var format = rs.getFormat();
            assert.strictEqual(format.at(index).getName(), fieldName);
            assert.strictEqual(format.at(index).getDefaultValue(), fieldDefault);

            rs.each(function(record) {
               var format = record.getFormat();
               assert.strictEqual(format.at(index).getName(), fieldName);
               assert.strictEqual(format.at(index).getDefaultValue(), fieldDefault);

               assert.strictEqual(record.get(fieldName), fieldDefault);
            });
         });

         it('should set the field value for record with different format the use SBIS adapter', function() {
            var rs = new RecordSet({
                  rawData: getSbisItems(),
                  adapter: 'Types/entity:adapter.Sbis'
               }),
               recordS = rs.getRawData().s,
               record,
               addedRecord,
               fieldName = 'name';

            recordS.pop();
            record = new Record({
               rawData: {
                  d: [111],
                  s: recordS
               },
               adapter: 'Types/entity:adapter.Sbis'
            });

            //Force create indices
            record.get(fieldName);

            addedRecord = rs.add(record);

            addedRecord.set(fieldName, 'bar');
            assert.strictEqual(addedRecord.get(fieldName), 'bar');
         });

         it('should add the field and set it value for the added record use SBIS adapter', function() {
            var idProperty = 'id',
               rs = new RecordSet({
                  rawData: getSbisItems(),
                  adapter: 'Types/entity:adapter.Sbis',
                  idProperty: idProperty
               }),
               record = new Record({
                  rawData: {
                     d: [111, 'foo'],
                     s: rs.getRawData().s
                  },
                  adapter: 'Types/entity:adapter.Sbis',
                  idProperty: idProperty
               }),
               addedRecord,
               index = 0,
               fieldName = 'login',
               fieldDefault = 'user';

            //Force create indices
            record.get(idProperty);

            rs.addField({
               name: fieldName,
               type: 'string',
               defaultValue: fieldDefault
            }, index);

            addedRecord = rs.add(record);

            addedRecord.set(fieldName, 'bar');
            assert.strictEqual(addedRecord.get(fieldName), 'bar');
         });

         it('should add the field from the instance', function() {
            var fieldName = 'login',
               fieldDefault = 'username';
            rs.addField(fieldsFactory({
               name: fieldName,
               type: 'string',
               defaultValue: fieldDefault
            }));
            var index = rs.getFormat().getCount() - 1;

            assert.strictEqual(rs.getFormat().at(index).getName(), fieldName);
            assert.strictEqual(rs.getFormat().at(index).getDefaultValue(), fieldDefault);
            rs.each(function(record) {
               assert.strictEqual(record.get(fieldName), fieldDefault);
               assert.strictEqual(record.getRawData()[fieldName], fieldDefault);
            });
         });

         it('should define format evidently', function() {
            var index = 0,
               fieldName = 'login',
               fieldDefault = 'user';
            rs.addField({
               name: fieldName,
               type: 'string',
               defaultValue: fieldDefault
            }, index);
            rs.assign([]);
            assert.strictEqual(rs.getFormat().at(index).getName(), fieldName);
            assert.strictEqual(rs.getFormat().at(index).getDefaultValue(), fieldDefault);
         });

         it('should add the field with the value', function() {
            var fieldName = 'login',
               fieldValue = 'root';
            rs.addField({name: fieldName, type: 'string', defaultValue: 'user'}, 0, fieldValue);

            rs.each(function(record) {
               assert.strictEqual(record.get(fieldName), fieldValue);
               assert.strictEqual(record.getRawData()[fieldName], fieldValue);
            });
         });

         it('should throw an error if the field is already defined', function() {
            var format = getItemsFormat(),
               rs = new RecordSet({
                  format: format
               });

            assert.throws(function() {
               rs.addField({name: 'name', type: 'string'});
            });
         });

         it('should throw an error if add the field twice', function() {
            rs.addField({name: 'new', type: 'string'});
            assert.throws(function() {
               rs.addField({name: 'new', type: 'string'});
            });
         });

         it('should add field if it has sbis adapter and its has copied data', function() {
            var rs = new RecordSet({
               rawData: getSbisItems(),
               adapter: new CowAdapter(new SbisAdapter())
            });
            rs.at(0).set('name', 'Foo');
            rs.addField({name: 'new', type: 'string'});
            assert.doesNotThrow(function() {
               rs.at(0).set('new', '12');
            });
         });
      });

      describe('.removeField()', function() {
         it('should remove the exists field', function() {
            var format = getItemsFormat(),
               fieldName = 'name',
               rs = new RecordSet({
                  format: format,
                  adapter: 'Types/entity:adapter.Sbis',
                  rawData: getSbisItems()
               });

            rs.removeField(fieldName);

            assert.strictEqual(rs.getFormat().getFieldIndex(fieldName), -1);
            assert.strictEqual(rs.getRawData().s.length, 1);
            rs.each(function(record) {
               assert.isFalse(record.has(fieldName));
               assert.isUndefined(record.get(fieldName));
               assert.strictEqual(record.getRawData().s.length, 1);
            });
         });

         it('should throw an error if adapter doesn\'t support fields detection', function() {
            var rs = new RecordSet(),
               fieldName = 'name';
            assert.throws(function() {
               rs.removeField(fieldName);
            });
         });

         it('should throw an error for not defined field', function() {
            var rs = new RecordSet({
               adapter: 'Types/entity:adapter.Sbis',
               rawData: getSbisItems()
            });
            assert.throws(function() {
               rs.removeField('some');
            });
         });

         it('should throw an error if remove the field twice', function() {
            var format = getItemsFormat(),
               rs = new RecordSet({
                  format: format,
                  adapter: 'Types/entity:adapter.Sbis',
                  rawData: getSbisItems()
               });

            rs.removeField('name');
            assert.throws(function() {
               rs.removeField('name');
            });
         });

         it('should remove field from original data', function() {
            var data = getSbisItems(),
               rs = new RecordSet({
                  rawData: data,
                  adapter: new SbisAdapter()
               });

            assert.equal(data.s.length, 2);
            rs.removeField('name');
            assert.equal(data.s.length, 1);
         });
      });

      describe('.removeFieldAt()', function() {
         it('should throw an error if adapter doesn\'t support fields indexes', function() {
            var format = getItemsFormat(),
               rs = new RecordSet({
                  format: format,
                  rawData: getItems()
               });

            assert.throws(function() {
               rs.removeFieldAt(0);
            });
         });

         it('should remove the exists field', function() {
            var format = getItemsFormat(),
               fieldIndex = 1,
               fieldName = format[fieldIndex].name,
               rs = new RecordSet({
                  format: format,
                  adapter: 'Types/entity:adapter.Sbis',
                  rawData: getSbisItems()
               });

            rs.removeFieldAt(fieldIndex);

            assert.isUndefined(rs.getFormat().at(fieldIndex));
            assert.strictEqual(rs.getRawData().s.length, 1);
            rs.each(function(record) {
               assert.isFalse(record.has(fieldName));
               assert.isUndefined(record.get(fieldName));
               assert.strictEqual(record.getRawData().s.length, 1);
            });
         });

         it('should throw an error for not exists index', function() {
            assert.throws(function() {
               var rs = new Record({
                  adapter: 'Types/entity:adapter.Sbis'
               });
               rs.removeFieldAt(0);
            });
         });
      });

      describe('.append()', function() {
         it('should return added items', function() {
            var rd = [{
                  id: 50,
                  name: '50'
               }, {
                  id: 51,
                  name: '51'
               }],
               added;

            added = rs.append([new Model({
               rawData: rd[0]
            }), new Model({
               rawData: rd[1]
            })]);

            assert.equal(added.length, rd.length);
            assert.deepEqual(added[0].getRawData(), rd[0]);
            assert.deepEqual(added[1].getRawData(), rd[1]);
         });

         it('should change raw data', function() {
            var rd = [{
               id: 50,
               name: '50'
            }, {
               id: 51,
               name: '51'
            }];
            rs.append(new RecordSet({
               rawData: rd
            }));
            Array.prototype.push.apply(items, rd);
            assert.deepEqual(rs.getRawData(), items);
            assert.deepEqual(rs.getCount(), items.length);
            items.forEach(function(item, i) {
               assert.deepEqual(rs.at(i).getRawData(), item);
            });
         });

         it('should take format from first record to clear recordSet', function() {
            var rs = new RecordSet({
                  rawData: [{id: 1, name: 'John'}]
               }),
               recs = [new Record({
                  rawData: {id: 1, count: 3, name: 'John'}
               })];

            assert.equal(rs.getFormat().getCount(), 2);
            rs.clear();
            rs.append(recs);
            assert.equal(rs.getFormat().getCount(), 3);
         });

         it('should keep foreign records owner', function() {
            var records = [new Model(), new Model(), new Model()];
            rs.append(records);
            for (var i = 0; i < records.length; i++) {
               assert.isNull(records[i].getOwner());
            }
         });

         it('should set the new records owner to itself', function() {
            var records = [new Model(), new Model(), new Model()],
               start = rs.getCount(),
               finish = start + records.length;

            rs.append(records);
            for (var i = start; i < finish; i++) {
               assert.strictEqual(rs.at(i).getOwner(), rs);
            }
         });

         it('should keep foreign records state', function() {
            var records = [new Model(), new Model(), new Model()];
            rs.append(records);
            for (var i = 0; i < records.length; i++) {
               assert.strictEqual(records[i].getState(), Record.RecordState.DETACHED);
            }
         });

         it('should set the new records state to "Added"', function() {
            var records = [new Model(), new Model(), new Model()],
               start = rs.getCount(),
               finish = start + records.length;

            rs.append(records);
            for (var i = start; i < finish; i++) {
               assert.strictEqual(rs.at(i).getState(), Record.RecordState.ADDED);
            }
         });

         it('should don\'t change source record raw data if result record changed', function() {
            var source = new Model({
                  rawData: {foo: 'bar'}
               }),
               at = rs.getCount(),
               result;

            rs.append([source]);
            result = rs.at(at);
            result.set('foo', 'baz');

            assert.equal(source.getRawData().foo, 'bar');
            assert.equal(result.getRawData().foo, 'baz');
         });

         it('should update raw data if record changed', function() {
            var source = new Model({
                  rawData: {foo: 'bar'}
               }),
               at = rs.getCount(),
               result;

            rs.append([source]);
            result = rs.at(at);
            result.set('foo', 'baz');

            assert.equal(rs.getRawData()[at].foo, 'baz');
         });

         it('should throw an error for not a Record', function() {
            var data4 = {id: 4},
               data5 = {id: 5};
            assert.throws(function() {
               rs.append([new Model({
                  rawData: data4
               }), data5]);
            });
         });

         it('should throw an TypeError for incompatible adapter', function() {
            var record = new Model({
               adapter: 'Types/entity:adapter.Sbis'
            });
            assert.throws(function() {
               rs.append([record]);
            }, TypeError);
         });

         it('should trigger "onCollectionChange" with valid arguments', function() {
            var newRs = new RecordSet({
                  rawData: [{
                     id: 13,
                     name: 'Foo'
                  }]
               }),
               oldCount = rs.getCount(),
               expected = [{
                  action: IBindCollection.ACTION_ADD,
                  oldItems: [],
                  oldItemsIndex: 0
               }],
               given = [],
               handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                  given.push({
                     action: action,
                     newItems: newItems,
                     newItemsIndex: newItemsIndex,
                     oldItems: oldItems,
                     oldItemsIndex: oldItemsIndex
                  });
               };

            rs.subscribe('onCollectionChange', handler);
            rs.append(newRs);
            rs.unsubscribe('onCollectionChange', handler);

            expected[0].newItems = [rs.at(oldCount)];
            expected[0].newItemsIndex = oldCount;

            assert.deepEqual(given, expected);
         });
      });

      describe('.prepend', function() {
         it('should return added items', function() {
            var rd = [{
                  id: 50,
                  name: '50'
               }, {
                  id: 51,
                  name: '51'
               }],
               added;

            added = rs.prepend([new Model({
               rawData: rd[0]
            }), new Model({
               rawData: rd[1]
            })]);

            assert.equal(added.length, rd.length);
            assert.deepEqual(added[0].getRawData(), rd[0]);
            assert.deepEqual(added[1].getRawData(), rd[1]);
         });

         it('should change raw data', function() {
            var rd = [{
               id: 50,
               name: '50'
            }, {
               id: 51,
               name: '51'
            }];
            rs.prepend(new RecordSet({
               rawData: rd
            }));
            Array.prototype.splice.apply(items, ([0, 0].concat(rd)));
            assert.deepEqual(rs.getRawData(), items);
            assert.deepEqual(rs.getCount(), items.length);
            items.forEach(function(item, i) {
               assert.deepEqual(rs.at(i).getRawData(), item);
            });
         });

         it('should keep foreign records owner', function() {
            var records = [new Model(), new Model(), new Model()];
            rs.prepend(records);
            for (var i = 0; i < records.length; i++) {
               assert.isNull(records[i].getOwner());
            }
         });

         it('should set the new records owner to itself', function() {
            var records = [new Model(), new Model(), new Model()],
               start = 0,
               finish = records.length;

            rs.prepend(records);
            for (var i = start; i < finish; i++) {
               assert.strictEqual(rs.at(i).getOwner(), rs);
            }
         });

         it('should keep foreign records state', function() {
            var records = [new Model(), new Model(), new Model()];
            rs.prepend(records);
            for (var i = 0; i < records.length; i++) {
               assert.strictEqual(records[i].getState(), Record.RecordState.DETACHED);
            }
         });

         it('should set the new records state to "Added"', function() {
            var records = [new Model(), new Model(), new Model()],
               start = 0,
               finish = records.length;

            rs.prepend(records);
            for (var i = start; i < finish; i++) {
               assert.strictEqual(rs.at(i).getState(), Record.RecordState.ADDED);
            }
         });

         it('should throw an error', function() {
            var  data4 = {id: 4},
               data5 = {id: 5};
            assert.throws(function() {
               rs.prepend([new Model({
                  rawData: data4
               }), data5]);
            });
         });

         it('should throw an TypeError for incompatible adapter', function() {
            var record = new Model({
               adapter: 'Types/entity:adapter.Sbis'
            });
            assert.throws(function() {
               rs.prepend([record]);
            }, TypeError);
         });

         it('should trigger "onCollectionChange" with valid arguments', function() {
            var newRs = new RecordSet({
                  rawData: [{
                     id: 13,
                     name: 'Foo'
                  }]
               }),
               expected = [{
                  action: IBindCollection.ACTION_ADD,
                  oldItems: [],
                  oldItemsIndex: 0
               }],
               given = [],
               handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                  given.push({
                     action: action,
                     newItems: newItems,
                     newItemsIndex: newItemsIndex,
                     oldItems: oldItems,
                     oldItemsIndex: oldItemsIndex
                  });
               };

            rs.subscribe('onCollectionChange', handler);
            rs.prepend(newRs);
            rs.unsubscribe('onCollectionChange', handler);

            expected[0].newItems = [rs.at(0)];
            expected[0].newItemsIndex = 0;

            assert.deepEqual(given, expected);
         });
      });

      describe('.assign()', function() {
         it('should have no effect with itself', function() {
            var oldCount = rs.getCount(),
               oldRawData = rs.getRawData(true);

            rs.assign(rs);

            assert.strictEqual(rs.getCount(), oldCount);
            assert.strictEqual(rs.getRawData(true), oldRawData);
         });

         it('should return added items', function() {
            var rs = new RecordSet({
                  rawData: [{id: 1}, {id: 2}, {id: 3}]
               }),
               data4 = {id: 4},
               data5 = {id: 5},
               added;

            added = rs.assign([new Model({
               rawData: data4
            }), new Model({
               rawData: data5
            })]);

            assert.equal(added.length, 2);
            assert.deepEqual(added[0].getRawData(), data4);
            assert.deepEqual(added[1].getRawData(), data5);
         });

         it('should return empty added items if RecordSet given', function() {
            var source = new RecordSet({
                  rawData: [{foo: 'bar'}]
               }),
               added;

            added = rs.assign(source);
            assert.equal(added.length, source.getCount());
            assert.isUndefined(added[0]);
         });

         it('should change raw data and count', function() {
            var rs = new RecordSet({
                  rawData: [{id: 1}, {id: 2}, {id: 3}]
               }),
               data4 = {id: 4},
               data5 = {id: 5};

            rs.assign([new Model({
               rawData: data4
            }), new Model({
               rawData: data5
            })]);
            assert.deepEqual(rs.getRawData()[0], data4);
            assert.deepEqual(rs.getRawData()[1], data5);
            assert.deepEqual(rs.at(0).getRawData(), data4);
            assert.deepEqual(rs.at(1).getRawData(), data5);
            assert.strictEqual(rs.getCount(), 2);
         });

         it('should keep foreign records owner', function() {
            var records = [new Model(), new Model(), new Model()];
            rs.assign(records);
            for (var i = 0; i < records.length; i++) {
               assert.isNull(records[i].getOwner());
            }
         });

         it('should set the new records owner to itself', function() {
            var records = [new Model(), new Model(), new Model()],
               start = 0,
               finish = records.length;

            rs.assign(records);
            for (var i = start; i < finish; i++) {
               assert.strictEqual(rs.at(i).getOwner(), rs);
            }
         });

         it('should keep foreign records state', function() {
            var records = [new Model(), new Model(), new Model()];
            rs.assign(records);
            for (var i = 0; i < records.length; i++) {
               assert.strictEqual(records[i].getState(), Record.RecordState.DETACHED);
            }
         });

         it('should set the new records state to "Added"', function() {
            var records = [new Model(), new Model(), new Model()],
               start = 0,
               finish = records.length;

            rs.assign(records);
            for (var i = start; i < finish; i++) {
               assert.strictEqual(rs.at(i).getState(), Record.RecordState.ADDED);
            }
         });

         it('should reset the old records owner', function() {
            var records = [];
            rs.each(function(record) {
               records.push(record);
            });

            rs.assign([]);
            for (var i = 0; i < records.length; i++) {
               assert.isNull(records[i].getOwner());
            }
         });

         it('should set the old records state to "Detached"', function() {
            var records = [];
            rs.each(function(record) {
               records.push(record);
            });

            rs.assign([]);
            for (var i = 0; i < records.length; i++) {
               assert.strictEqual(records[i].getState(), Record.RecordState.DETACHED);
            }
         });

         it('should take adapter from assigning RecordSet', function() {
            var rs1 = new RecordSet({
                  adapter: new JsonAdapter()
               }),
               rs2 = new RecordSet({
                  adapter: new SbisAdapter()
               });

            assert.notEqual(rs1.getAdapter(), rs2.getAdapter());
            rs1.assign(rs2);
            assert.strictEqual(rs1.getAdapter(), rs2.getAdapter());
         });

         it('should take adapter from the first record of assigning Array', function() {
            var rs = new RecordSet({
                  adapter: new JsonAdapter()
               }),
               arr = [new Record({adapter: 'Types/entity:adapter.Sbis'})];

            assert.notEqual(rs.getAdapter(), arr[0].getAdapter());
            rs.assign(arr);
            assert.strictEqual(rs.getAdapter(), arr[0].getAdapter());
         });

         it('should take raw data format from assigning RecordSet', function() {
            var s1 = [
                  {n: 'Id', t: 'Число целое'},
                  {n: 'Name', t: 'Строка'}
               ],
               s2 = [
                  {n: 'Id', t: 'Число целое'},
                  {n: 'Count', t: 'Число целое'},
                  {n: 'Name', t: 'Строка'}
               ],
               rs1 = new RecordSet({
                  rawData: {
                     d: [[7, 'John']],
                     s: s1
                  },
                  adapter: 'Types/entity:adapter.Sbis'
               }),
               rs2 = new RecordSet({
                  rawData: {
                     d: [[7, 4, 'Bill']],
                     s: s2
                  },
                  adapter: 'Types/entity:adapter.Sbis'
               });

            assert.deepEqual(rs1.getRawData().s, s1);
            rs1.assign(rs2);
            assert.deepEqual(rs1.getRawData().s, s2);
         });

         it('should take format from assigning RecordSet', function() {
            var data1 = [{id: 1, name: 'John'}],
               data2 = [{id: 1, count: 3, name: 'John'}],
               rs1 = new RecordSet({
                  rawData: data1
               }),
               rs2 = new RecordSet({
                  rawData: data2
               });

            assert.equal(rs1.getFormat().getCount(), 2);
            rs1.assign(rs2);
            assert.equal(rs1.getFormat().getCount(), 3);
         });

         it('should don\'t change source record raw data if result record changed', function() {
            var source = new RecordSet({
                  rawData: [{foo: 'bar'}]
               }),
               result;

            rs.assign(source);
            result = rs.at(0);
            result.set('foo', 'baz');

            assert.equal(source.getRawData()[0].foo, 'bar');
            assert.equal(result.getRawData().foo, 'baz');
         });

         it('should update raw data if record changed', function() {
            var source = new RecordSet({
                  rawData: [{foo: 'bar'}]
               }),
               result;

            rs.assign(source);
            result = rs.at(0);
            result.set('foo', 'baz');

            assert.equal(rs.getRawData()[0].foo, 'baz');
         });

         it('should throw an error if pass not a record', function() {
            var data4 = {id: 4},
               data5 = {id: 5};
            assert.throws(function() {
               rs.assign([new Model({
                  rawData: data4
               }), data5]);
            });
         });

         it('should throw an TypeError for incompatible adapter', function() {
            var validRecord = new Model({
                  adapter: 'Types/entity:adapter.Sbis'
               }),
               invalidRecord = new Model({
                  adapter: 'Types/entity:adapter.Json'
               });
            assert.throws(function() {
               rs.assign([validRecord, invalidRecord]);
            }, TypeError);
         });

         it('should don\'t throw an TypeError for incompatible adapter', function() {
            var validRecord = new Model({
               adapter: 'Types/entity:adapter.Sbis'
            });
            rs.assign([validRecord, validRecord]);
         });

         it('should change format with new one', function() {
            var rs = new RecordSet({
                  rawData: {
                     d: [[7]],
                     s: [{n: 'id', t: 'Число целое'}]
                  },
                  adapter: 'Types/entity:adapter.Sbis'
               }),
               rs2 = new RecordSet({
                  rawData: {
                     d: [['Arbuzznoff']],
                     s: [{n: 'name', t: 'Строка'}]
                  },
                  adapter: 'Types/entity:adapter.Sbis'
               });
            rs.assign(rs2);
            assert.deepEqual(rs.getRawData().s, [{n: 'name', t: 'Строка'}]);
         });

         it('should don\'t throw an error if format is defined directly', function() {
            var rs = new RecordSet({
                  rawData: {
                     d: [[7]],
                     s: [{n: 'id', t: 'Число целое'}]
                  },
                  adapter: 'Types/entity:adapter.Sbis',
                  format: [{name: 'id', type: 'Integer'}]
               }),
               rs2 = new RecordSet({
                  rawData: {
                     d: [['Arbuzznoff']],
                     s: [{n: 'name', t: 'Строка'}]
                  },
                  adapter: 'Types/entity:adapter.Sbis'
               });
            rs.addField({name: 'login', type: 'string'});
            rs.assign(rs2);
         });

         it('should chnage raw data after relation change', function() {
            var rs = new RecordSet();

            rs.assign([new Model({
               rawData: {id: 1}
            })]);

            assert.equal(rs.getRawData()[0].id, 1);
            rs.at(0).set('id', 2);
            assert.equal(rs.getRawData()[0].id, 2);
         });

         it('should assign empty recordset if it has a format', function() {
            var rs = new RecordSet({
                  rawData: [[1]],
                  format: [{name: 'id', type: 'Integer'}]
               }),
               rs2 = new RecordSet({
                  rawData: [],
                  format: [{name: 'id', type: 'Integer'}]
               });
            rs.assign(rs2);
            assert.deepEqual(rs.getCount(), 0);
         });

         it('should trigger "onCollectionChange" with valid arguments', function() {
            var items = [{id: 1}, {id: 2}],
               rs = new RecordSet({
                  rawData: items
               }),
               newItems = [{id: 3}],
               newRs = new RecordSet({
                  rawData: newItems
               }),
               expected = [{
                  action: IBindCollection.ACTION_RESET,
                  oldItems: [rs.at(0), rs.at(1)],
                  oldItemsIndex: 0
               }],
               given = [],
               handler = function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
                  given.push({
                     action: action,
                     newItems: newItems,
                     newItemsIndex: newItemsIndex,
                     oldItems: oldItems,
                     oldItemsIndex: oldItemsIndex
                  });
               };

            rs.subscribe('onCollectionChange', handler);
            rs.assign(newRs);
            rs.unsubscribe('onCollectionChange', handler);

            expected[0].newItems = [rs.at(0)];
            expected[0].newItemsIndex = 0;

            assert.deepEqual(given, expected);
         });
      });

      describe('.clear()', function() {
         it('should reset the records owner', function() {
            var rs = new RecordSet({
                  rawData: getItems(),
                  idProperty: 'id'
               }),
               records = [];

            rs.each(function(record) {
               records.push(record);
            });

            rs.clear();
            for (var i = 0; i < records.length; i++) {
               assert.isNull(records[i].getOwner());
            }
         });
         it('should set the records state to "Detached"', function() {
            var records = [];
            rs.each(function(record) {
               records.push(record);
            });
            rs.clear();
            for (var i = 0; i < records.length; i++) {
               assert.equal(records[i].getState(), Record.RecordState.DETACHED);
            }
         });
         it('should clear the raw data', function() {
            rs.clear();
            assert.deepEqual(rs.getRawData(), []);
         });
      });

      describe('.clone()', function() {
         it('should not be same as original', function() {
            assert.instanceOf(rs.clone(), RecordSet);
            assert.instanceOf(rs.clone(true), RecordSet);
            assert.notEqual(rs.clone(), rs);
            assert.notEqual(rs.clone(true), rs);
         });

         it('should not be same as previous clone', function() {
            assert.notEqual(rs.clone(), rs.clone());
            assert.notEqual(rs.clone(true), rs.clone(true));
         });

         it('should clone rawData', function() {
            var clone = rs.clone();
            assert.notEqual(rs.getRawData(), clone.getRawData());
            assert.deepEqual(rs.getRawData(), clone.getRawData());
         });

         it('should make raw data unlinked from original', function() {
            var cloneA = rs.clone();
            assert.deepEqual(cloneA.getRawData(), rs.getRawData());
            cloneA.removeAt(0);
            assert.notEqual(cloneA.getRawData(), rs.getRawData());

            var cloneB = rs.clone();
            assert.deepEqual(cloneB.getRawData(), rs.getRawData());
            cloneB.at(0).set('name', 'test');
            assert.notEqual(cloneB.getRawData(), rs.getRawData());
         });

         it('should make object-like options linked to original if shallow', function() {
            var clone = rs.clone(true);
            assert.strictEqual(clone._$format, rs._$format);
         });

         it('should make array-like options unlinked from original if shallow', function() {
            var clone = rs.clone(true);
            assert.notEqual(clone._$rawData, rs._$rawData);
            assert.deepEqual(clone._$rawData, rs._$rawData);
         });

         it('should return records owned by itself', function() {
            var clone = rs.clone();
            clone.each(function(record) {
               assert.strictEqual(clone, record.getOwner());
            });
         });

         it('should make items unlinked from original', function() {
            var clone = rs.clone();
            clone.each(function(item, index) {
               assert.notEqual(item, rs.at(index));
            });
         });

         it('should make items linked to original if shallow', function() {
            rs.each(function() {});//force create record instances
            var clone = rs.clone(true);
            clone.each(function(item, index) {
               assert.strictEqual(item, rs.at(index));
            });
         });
      });

      describe('.add()', function() {
         it('should keep foreign record owner', function() {
            var record = new Model({
               rawData: getSomeItem()
            });
            rs.add(record);
            assert.isNull(record.getOwner());
         });

         it('should set the new record owner to itself', function() {
            var record = new Model({
               rawData: getSomeItem()
            });
            rs.add(record);
            assert.strictEqual(rs.at(rs.getCount() - 1).getOwner(), rs);
         });

         it('should keep foreign record state', function() {
            var record = new Model({
               rawData: getSomeItem()
            });
            rs.add(record);
            assert.strictEqual(record.getState(), Record.RecordState.DETACHED);
         });

         it('should set the new record state to "Added"', function() {
            var record = new Model({
               rawData: getSomeItem()
            });
            rs.add(record);
            assert.strictEqual(rs.at(rs.getCount() - 1).getState(), Record.RecordState.ADDED);
         });

         it('should create result with format equals to recordset', function() {
            var rs = new RecordSet({
                  rawData: [
                     {id: 1, title: 'foo', count: 0},
                     {id: 2, title: 'bar', count: 2}
                  ]
               }),
               record = new Model({
                  rawData: {id: 3, name: 'Baz', title: 'bar'}
               }),
               result,
               data;

            result = rs.add(record);
            data = result.getRawData(true);
            assert.sameMembers(Object.keys(data), ['id', 'title', 'count']);
         });

         it('should change raw data', function() {
            var rd = getSomeItem(),
               record = new Model({
                  rawData: rd
               });
            rs.add(record);
            items.push(rd);
            assert.deepEqual(rs.getRawData(), items);
         });

         it('should don\'t change source record raw data if result record changed', function() {
            var source = new Model({
                  rawData: {foo: 'bar'}
               }),
               result = rs.add(source, 0);

            result.set('foo', 'baz');

            assert.equal(source.getRawData().foo, 'bar');
            assert.equal(result.getRawData().foo, 'baz');
         });

         it('should update raw data if record changed', function() {
            var data = {foo: 'bar'},
               source = new Model({
                  rawData: data
               }),
               result;

            result = rs.add(source, 0);
            result.set('foo', 'baz');

            assert.equal(rs.getRawData()[0].foo, 'baz');
         });

         it('should add records with different formats', function() {
            rs.add(new Model({
               format: [{name: 'id', type: 'integer'}]
            }));
         });

         it('should allow to set raw data after add to empty RecordSet', function() {
            var rs = new RecordSet();
            rs.add(new Model({
               rawData: {id: 1}
            }));
            rs.setRawData([{id: 2}]);
         });

         it('should throw an Error for not a record', function() {
            var rd = getSomeItem();
            assert.throws(function() {
               rs.add(rd);
            });
         });

         it('should throw an TypeError for incompatible adapter', function() {
            var record = new Model({
               adapter: 'Types/entity:adapter.Sbis'
            });
            assert.throws(function() {
               rs.add(record);
            }, TypeError);
         });
      });

      describe('.remove()', function() {
         it('should remove the record', function() {
            var record = rs.at(0);
            rs.remove(record);
            assert.strictEqual(rs.getIndex(record), -1);
         });

         it('should change raw data', function() {
            var record = rs.at(0);
            rs.remove(record);
            assert.deepEqual(rs.getRawData(), items.slice(1));
         });

         it('should reset the record owner', function() {
            var record = rs.at(0);
            assert.strictEqual(record.getOwner(), rs);
            rs.remove(record);
            assert.isNull(record.getOwner());
         });

         it('should set the record state to "Detached"', function() {
            var record = rs.at(0);
            rs.remove(record);
            assert.strictEqual(record.getState(), Record.RecordState.DETACHED);
         });

         it('should throw an TypeError for incompatible adapter', function() {
            var record = new Model({
               adapter: 'Types/entity:adapter.Sbis'
            });
            assert.throws(function() {
               rs.remove(record);
            }, TypeError);
         });
      });

      describe('.removeAt()', function() {
         it('should change raw data', function() {
            rs.removeAt(0);
            assert.deepEqual(rs.getRawData(), items.slice(1));
         });
         it('should reset the record owner', function() {
            var record = rs.at(0);
            assert.strictEqual(record.getOwner(), rs);
            rs.removeAt(0);
            assert.isNull(record.getOwner());
         });
         it('should set the record state to "Detached"', function() {
            var record = rs.at(0);
            rs.removeAt(0);
            assert.strictEqual(record.getState(), Record.RecordState.DETACHED);
         });
      });

      describe('.replace()', function() {
         it('should return added record', function() {
            var rd = {
                  id: 50,
                  name: 'qwe'
               },
               newItem = new Model({rawData: rd}),
               addedItem;

            addedItem = rs.replace(newItem, 0);
            assert.notEqual(newItem, addedItem);
            assert.deepEqual(addedItem.getRawData(), rd);
         });

         it('should change raw data', function() {
            var rd = {
                  id: 50,
                  name: '50'
               },
               newItem = new Model({rawData: rd});

            rs.replace(newItem, 0);
            assert.deepEqual(rs.getRawData()[0], rd);
         });

         it('should keep foreign record owner', function() {
            var record = new Model();
            rs.replace(record, 0);
            assert.isNull(record.getOwner());
         });

         it('should set the new record owner to itself', function() {
            var record = new Model();
            rs.replace(record, 0);
            assert.strictEqual(rs.at(0).getOwner(), rs);
         });

         it('should keep foreign record state', function() {
            var record = new Model();
            rs.replace(record, 0);
            assert.strictEqual(record.getState(), Record.RecordState.DETACHED);
         });

         it('should set the new record state to "Changed"', function() {
            var record = new Model();
            rs.replace(record, 0);
            assert.strictEqual(rs.at(0).getState(), Record.RecordState.CHANGED);
         });

         it('should reset the old record owner', function() {
            var record = rs.at(0);
            rs.replace(new Model(), 0);
            assert.isNull(record.getOwner());
         });

         it('should set the old record state to "Detached"', function() {
            var record = rs.at(0);
            rs.replace(new Model(), 0);
            assert.strictEqual(record.getState(), Record.RecordState.DETACHED);
         });

         it('should throw an error for not a record', function() {
            assert.throws(function() {
               rs.replace({}, 0);
            });
         });

         it('should throw an TypeError for incompatible adapter', function() {
            var record = new Model({
               adapter: 'Types/entity:adapter.Sbis'
            });
            assert.throws(function() {
               rs.replace(record, 0);
            }, TypeError);
         });
      });

      describe('.move()', function() {
         it('should change raw data', function() {
            rs.move(0, 1);
            var data = rs.getRawData();
            assert.deepEqual(data[0], items[1]);
            assert.deepEqual(data[1], items[0]);
            assert.deepEqual(data[2], items[2]);
         });
         it('should get record by id after move', function() {
            rs.getRecordById(1);
            rs.move(0, 1);
            assert.equal(rs.getRecordById(1).getId(), 1);
            assert.equal(rs.getRecordById(2).getId(), 2);
         });
      });

      describe('.getIndex()', function() {
         it('should return an index of given item', function() {
            for (var i = 0; i < items.length; i++) {
               assert.equal(i, rs.getIndex(rs.at(i)));
            }
         });
      });

      describe('.relationChanged()', function() {
         it('should return affected "which"', function() {
            var items = [{id: 1}],
               rs = new RecordSet({
                  rawData: items
               }),
               target = rs.at(0),
               which = {
                  target: target,
                  data: {foo: 'bar'}
               },
               route = [undefined],
               result;

            result = rs.relationChanged(which, route);
            assert.strictEqual(result.target, target);
            assert.deepEqual(result.data, {0: target});
         });
      });

      describe('.acceptChanges()', function() {
         it('should make the records unchanged', function() {
            rs.each(function(record, index) {
               record.set('id', 'new-' + index);
            });
            rs.acceptChanges();
            rs.each(function(record) {
               assert.strictEqual(record.getChanged().length, 0);
            });
         });

         it('should set the records state to "Unchanged"', function() {
            rs.each(function(record, index) {
               record.set('id', 'new-' + index);
            });
            rs.acceptChanges();
            rs.each(function(record) {
               assert.strictEqual(record.getState(), Record.RecordState.UNCHANGED);
            });
         });

         it('should set the added record state to "Unchanged"', function() {
            var record = new Model({
               rawData: {
                  id: 100,
                  name: 'Test'
               }
            });
            rs.add(record);
            assert.strictEqual(rs.at(rs.getCount() - 1).getState(), Record.RecordState.ADDED);
            rs.acceptChanges();
            assert.strictEqual(rs.at(rs.getCount() - 1).getState(), Record.RecordState.UNCHANGED);
         });

         it('should force getChanged() of parent record return an array with record field', function() {
            var format = {
                  id: 'integer',
                  items: 'recordset'
               },
               record = new Record({
                  format: format,
                  rawData: {
                     id: 1,
                     items: [{
                        id: 'foo'
                     }, {
                        id: 'bar'
                     }]
                  }
               }),
               items = record.get('items');

            items.removeAt(0);
            assert.isAbove(record.getChanged().indexOf('items'), -1);

            items.acceptChanges();
            assert.isAbove(record.getChanged().indexOf('items'), -1);
         });

         it('should force getChanged() of parent record return an array without record field', function() {
            var format = {
                  id: 'integer',
                  items: 'recordset'
               },
               record = new Record({
                  format: format,
                  rawData: {
                     id: 1,
                     items: [{
                        id: 'foo'
                     }, {
                        id: 'bar'
                     }]
                  }
               }),
               items = record.get('items');

            items.removeAt(0);
            assert.isAbove(record.getChanged().indexOf('items'), -1);

            items.acceptChanges(true);
            assert.equal(record.getChanged().indexOf('items'), -1);
         });
      });

      describe('.merge()', function() {
         it('should merge two recordsets with default params', function() {
            var rs1 = new RecordSet({
                  rawData: getItems(),
                  idProperty: 'id'
               }),
               rs2 = new RecordSet({
                  rawData: [{
                     id: 1000,
                     name: 'Bar'
                  }, {
                     id: 2,
                     name: 'Foo'
                  }],
                  idProperty: 'id'
               }),
               record = rs1.getRecordById(2);

            rs1.merge(rs2);

            assert.equal(rs1.getCount(), 2);
            assert.notEqual(rs1.getRecordById(2), record);
            assert.equal(rs1.getRecordById(2).get('name'), 'Foo');
            assert.equal(rs1.getRecordById(1000).get('name'), 'Bar');
         });

         it('should merge two recordsets without remove', function() {
            var rs1 = new RecordSet({
                  rawData: getItems(),
                  idProperty: 'id'
               }),
               rs2 =  new RecordSet({
                  rawData: [{
                     id: 2,
                     name: 'Foo'
                  }],
                  idProperty: 'id'
               });

            rs1.merge(rs2, {remove: false});
            assert.equal(getItems().length, rs1.getCount());
            assert.equal(rs1.getRecordById(2).get('name'), 'Foo');
         });

         it('should merge two recordsets without merge', function() {
            var rs1 = new RecordSet({
                  rawData: getItems(),
                  idProperty: 'id'
               }),
               rs2 =  new RecordSet({
                  rawData: [{
                     id: 2,
                     name: 'Foo'
                  }],
                  idProperty: 'id'
               });

            rs1.merge(rs2, {replace: false});
            assert.notEqual(rs1.getRecordById(2).get('name'), 'Foo');
         });

         it('should merge two recordsets without add', function() {
            var rs1 = new RecordSet({
                  rawData: getItems(),
                  idProperty: 'id'
               }),
               rs2 =  new RecordSet({
                  rawData: [{
                     id: 1000,
                     name: 'Foo'
                  }],
                  idProperty: 'id'
               });

            rs1.merge(rs2, {add: false});
            assert.isUndefined(rs1.getRecordById(1000));
         });

         it('should merge two recordsets with inject', function() {
            var rs1 = new RecordSet({
                  rawData: getItems(),
                  idProperty: 'id'
               }),
               rs2 =  new RecordSet({
                  rawData: [{
                     id: 2,
                     name: 'Foo'
                  }],
                  idProperty: 'id'
               }),
               record = rs1.getRecordById(2);

            rs1.merge(rs2, {inject: true});
            assert.strictEqual(rs1.getRecordById(2), record);
            assert.equal(rs1.getRecordById(2).get('name'), 'Foo');
         });
      });

      describe('.toJSON()', function() {
         it('should serialize a RecordSet', function() {
            var json = rs.toJSON(),
               options = rs._getOptions();
            delete options.items;
            assert.strictEqual(json.module, 'Types/collection:RecordSet');
            assert.isNumber(json.id);
            assert.isTrue(json.id > 0);
            assert.deepEqual(json.state.$options, options);
         });

         it('should serialize an instance id', function() {
            var json = rs.toJSON();
            assert.strictEqual(json.state._instanceId, rs.getInstanceId());
         });

         it('should serialize metaData injected by setter', function() {
            var metaData = {foo: 'bar'},
               json;
            rs.setMetaData(metaData);
            json = rs.toJSON();
            assert.strictEqual(json.state.$options.metaData, metaData);
         });
      });

      describe('.fromJSON()', function() {
         it('should restore an instance id', function() {
            var json = rs.toJSON(),
               clone = RecordSet.fromJSON(json);

            assert.strictEqual(json.state._instanceId, clone.getInstanceId());
         });

         it('should restore model constructor', function() {
            var
               serializer = new Serializer(),
               rs = new RecordSet({
                  adapter: new SbisAdapter(),
                  model: Record,
                  rawData: {
                     _type: 'recordset',
                     s: [1],
                     d: [2]
                  }
               }),
               json = JSON.stringify(rs, serializer.serialize),
               clone = JSON.parse(json, serializer.deserialize);
            assert.strictEqual(clone.getModel(), Record);
         });
      });

      describe('.getModel()', function() {
         it('should return a given model', function() {
            var rs = new RecordSet({
               model: Model
            });
            assert.strictEqual(rs.getModel(), Model);
         });

         it('should return "entity.model"', function() {
            assert.strictEqual(rs.getModel(), 'Types/entity:Model');
         });
      });

      describe('.getIdProperty()', function() {
         it('should return id property', function() {
            assert.equal('id', rs.getIdProperty());
         });

         it('should return false', function() {
            var  rs2 =  new RecordSet({
               rawData: [{
                  id: 1000,
                  name: 'Foo'
               }]
            });
            assert.isTrue(!rs2.getIdProperty());
         });

         it('should detect idProperty automatically', function() {
            var rs = new RecordSet({
               rawData: {
                  d: [],
                  s: [{
                     n: 'id',
                     t: 'Число целое'
                  }, {
                     n: '@name',
                     t: 'Идентификатор'
                  }]
               },
               adapter: 'Types/entity:adapter.Sbis'
            });
            assert.strictEqual(rs.getIdProperty(), '@name');
         });

      });

      describe('.setIdProperty()', function() {
         it('should set id property', function() {
            rs.setIdProperty('name');
            assert.equal('name', rs.getIdProperty());
         });

         it('shouldnt set id property', function() {
            rs.setIdProperty('Лицо');
            assert.equal('Лицо', rs.getIdProperty());
         });

         it('should set id property for all models if not defined yet', function() {
            var rs = new RecordSet({
               rawData: getItems()
            });
            rs.setIdProperty('id');
            rs.each(function(record) {
               assert.equal('id', record.getIdProperty());
            });
         });

         it('should trigger "onPropertyChange" if name changed', function() {
            var given,
               handler = function(e, data) {
                  given = data;
               };

            rs.subscribe('onPropertyChange', handler);
            rs.setIdProperty('name');
            rs.unsubscribe('onPropertyChange', handler);

            assert.strictEqual(given.idProperty, 'name');
         });

         it('should don\'t trigger "onPropertyChange" if name don\'t changed', function() {
            var called = false,
               handler = function() {
                  called = true;
               };

            rs.setIdProperty('name');
            rs.subscribe('onPropertyChange', handler);
            rs.setIdProperty('name');
            rs.unsubscribe('onPropertyChange', handler);

            assert.isFalse(called);
         });
      });

      describe('.getRecordById()', function() {
         it('should return record by id', function() {
            assert.equal(rs.getRecordById(2).get('name'), 'Petroff');
            assert.equal(rs.getRecordById(3).get('name'), 'Sidoroff');
         });
      });

      describe('.getIndexByValue()', function() {
         it('should work with default models', function() {
            var data = getItems(),
               rs = new RecordSet({
                  rawData: data
               });

            for (var i = 0; i < data.length; i++) {
               assert.equal(
                  rs.getIndexByValue('id', data[i].id),
                  i
               );
            }
         });

         it('should work with custom models', function() {
            var data = getItems(),
               rs = new RecordSet({
                  rawData: data,
                  model: coreExtend.extend(Model, {})
               });

            for (var i = 0; i < data.length; i++) {
               assert.equal(
                  rs.getIndexByValue('id', data[i].id),
                  i
               );
            }
         });

         it('should return records index from recordset by value', function() {
            var data = getSbisItems(),
               rs = new RecordSet({
                  rawData: data,
                  adapter: 'Types/entity:adapter.Sbis'
               });

            for (var i = data.d.length; i <= 0; i--) {
               assert.equal(rs.getIndexByValue('name', data.d[i][1]), i);
            }
         });
      });

      describe('.getAdapter()', function() {
         it('should return adapter', function() {
            assert.instanceOf(rs.getAdapter(), JsonAdapter);
         });
      });

      describe('.getMetaData()', function() {
         it('should return meta data injected through the constructor', function() {
            var meta = {foo: 'bar'},
               rs = new RecordSet({
                  metaData: meta
               });
            assert.deepEqual(rs.getMetaData(), meta);
         });

         it('should return meta data from recordset injected through the constructor', function() {
            var meta = new RecordSet(),
               rs = new RecordSet({
                  metaData: meta
               });
            assert.strictEqual(rs.getMetaData(), meta);
         });

         it('should return meta data injected through the constructor with compatible option name', function() {
            var meta = {foo: 'bar'},
               rs = new RecordSet({
                  meta: meta
               });
            assert.deepEqual(rs.getMetaData(), meta);
         });

         it('should return meta data with given value type', function() {
            var rs = new RecordSet({
               metaData: {foo: '2001-09-11'},
               metaFormat: {
                  foo: Date
               }
            });
            assert.instanceOf(rs.getMetaData().foo, Date);
         });

         context('if adapter supports IMetaData interface', function() {
            it('should return meta data with total from Number', function() {
               var data = {
                     n: 1
                  },
                  rs = new RecordSet({
                     rawData: data,
                     adapter: 'Types/entity:adapter.Sbis'
                  }),
                  meta = rs.getMetaData();
               assert.strictEqual(meta.total, 1);
               assert.strictEqual(meta.more, 1);
            });

            it('should return meta data with total from Boolean', function() {
               var data = {
                     n: true
                  },
                  rs = new RecordSet({
                     rawData: data,
                     adapter: 'Types/entity:adapter.Sbis'
                  }),
                  meta = rs.getMetaData();
               assert.strictEqual(meta.total, true);
               assert.strictEqual(meta.more, true);
            });

            it('should return meta data with total from Object', function() {
               var data = {
                     n: {
                        after: false,
                        before: true
                     }
                  },
                  rs = new RecordSet({
                     rawData: data,
                     adapter: 'Types/entity:adapter.Sbis'
                  }),
                  meta = rs.getMetaData();
               assert.isFalse(meta.more.after);
               assert.isTrue(meta.more.before);
            });

            it('should return meta data with results', function() {
               var data = {
                     r: {
                        d: [1],
                        s: [{n: 'id', t: 'Число целое'}]
                     }
                  },
                  rs = new RecordSet({
                     rawData: data,
                     adapter: 'Types/entity:adapter.Sbis'
                  }),
                  meta = rs.getMetaData();

               assert.strictEqual(meta.results.get('id'), 1);
            });

            it('should return meta data with results of given type', function() {
               var Foo = coreExtend.extend(Model, {});
               var data = {
                  r: {
                     d: [],
                     s: []
                  }
               };
               var rs = new RecordSet({
                  rawData: data,
                  adapter: 'Types/entity:adapter.Sbis',
                  metaFormat: {
                     results: Foo
                  }
               });

               var meta = rs.getMetaData();
               assert.instanceOf(meta.results, Foo);
            });

            it('should return meta data with path', function() {
               var data = {
                     p: {
                        d: [[1], [2], [5]],
                        s: [{n: 'id', t: 'Число целое'}]
                     }
                  },
                  rs = new RecordSet({
                     rawData: data,
                     adapter: 'Types/entity:adapter.Sbis'
                  }),
                  meta = rs.getMetaData();

               assert.strictEqual(meta.path.getCount(), 3);
               assert.strictEqual(meta.path.at(0).get('id'), 1);
               assert.strictEqual(meta.path.at(1).get('id'), 2);
               assert.strictEqual(meta.path.at(2).get('id'), 5);
            });

            it('should inherit idProperty in path', function() {
               var data = {
                  p: {
                     d: [],
                     s: [
                        {n: 'id', t: 'Число целое'},
                        {n: 'title', t: 'Строка'}
                     ]
                  }
               };
               var rs = new RecordSet({
                  rawData: data,
                  adapter: 'Types/entity:adapter.Sbis',
                  idProperty: 'title'
               });
               var meta = rs.getMetaData();

               assert.strictEqual(meta.path.getIdProperty(), 'title');
            });

            it('should return pure meta data', function() {
               var data = {
                     m: {
                        d: [1, 'baz'],
                        s: [
                           {n: 'foo', t: 'Число целое'},
                           {n: 'bar', t: 'Строка'}
                        ]
                     }
                  },
                  rs = new RecordSet({
                     rawData: data,
                     adapter: 'Types/entity:adapter.Sbis'
                  }),
                  meta = rs.getMetaData();

               assert.strictEqual(meta.foo, 1);
               assert.strictEqual(meta.bar, 'baz');
            });
         });
      });

      describe('.setMetaData()', function() {
         it('should set new meta', function() {
            var meta = {foo: 'bar'};
            rs.setMetaData(meta);
            assert.strictEqual(rs.getMetaData(), meta);
         });

         it('should trigger "onPropertyChange"', function() {
            var meta = {foo: 'bar'},
               given,
               handler = function(e, data) {
                  given = data;
               };

            rs.subscribe('onPropertyChange', handler);
            rs.setMetaData(meta);
            rs.unsubscribe('onPropertyChange', handler);

            assert.strictEqual(given.metaData, meta);
         });
      });

      describe('.produceInstance()', function() {
         it('should return an instance with the given raw data', function() {
            var data = [],
               instance = RecordSet.produceInstance(data);

            assert.instanceOf(instance, RecordSet);
            assert.strictEqual(instance.getRawData(true), data);
         });

         it('should return an instance with the given adapter', function() {
            var adapter = new SbisAdapter(),
               instance = RecordSet.produceInstance(null, {adapter: adapter});

            assert.instanceOf(instance, RecordSet);
            assert.strictEqual(instance.getAdapter(), adapter);
         });

         it('should return an instance with inherited adapter', function() {
            var adapter = new SbisAdapter(),
               Foo = coreExtend.extend(RecordSet, {
                  _$adapter: adapter
               }),
               instance = Foo.produceInstance(null);

            assert.instanceOf(instance, Foo);
            assert.strictEqual(instance.getAdapter(), adapter);
         });

         it('should return an instance with the given model', function() {
            var instance = RecordSet.produceInstance([], {model: 'fooModel'});

            assert.instanceOf(instance, RecordSet);
            assert.equal(instance.getModel(), 'fooModel');
         });

         it('should return an instance with inherited model', function() {
            var Foo = coreExtend.extend(RecordSet, {
                  _$model: 'fooModel'
               }),
               instance = Foo.produceInstance([]);

            assert.instanceOf(instance, Foo);
            assert.equal(instance.getModel(), 'fooModel');
         });

         it('should return an instance with the given idProperty', function() {
            var instance = RecordSet.produceInstance(null, {idProperty: 'foo'});
            assert.strictEqual(instance.getIdProperty(), 'foo');
         });
      });

      describe('.getVersion()', function() {
         it('should change version when raw data has been changed', function() {
            var version = rs.getVersion();
            rs.setRawData({
               id: 1,
               'Раздел': null
            });
            assert.notEqual(rs.getVersion(), version);
         });

         it('should change version when inner model has been changed', function() {
            var version = rs.getVersion();
            rs.at(0).set('name');
            assert.notEqual(rs.getVersion(), version);
         });

         it('should change version if field has been added in the format', function() {
            var version = rs.getVersion();
            rs.addField({name: 'foo', type: 'string'});
            assert.notEqual(rs.getVersion(), version);
         });

         it('should change version if field has been removed from the format', function() {
            var format = getItemsFormat(),
               rs = new RecordSet({
                  format: format,
                  rawData: items
               });

            var version = rs.getVersion();
            rs.removeField('name');
            assert.notEqual(rs.getVersion(), version);
         });
      });

      describe('.patch()', function() {
         var addRecord = function(rs, data) {
               var record = new Record({
                  format: rs.getFormat(),
                  adapter: rs.getAdapter()
               });
               record.set(data);
               rs.add(record);
            },
            format = [
               {name: 'id', type: 'integer'},
               {name: 'name', type: 'string'}
            ],
            RecordState = Record.RecordState;

         it('should return changed records', function() {
            var rs = new RecordSet({format: format}),
               changed;

            addRecord(rs, {id: 1, name: 'foo'});
            addRecord(rs, {id: 2, name: 'bar'});
            rs.acceptChanges();
            rs.at(0).set('name', 'baz');

            changed = RecordSet.patch(rs).get('changed');
            assert.equal(changed.getCount(), 1);
            assert.equal(changed.at(0).get('name'), 'baz');
         });

         it('should return added records', function() {
            var rs = new RecordSet({format: format}),
               added;

            addRecord(rs, {id: 1, name: 'foo'});
            rs.acceptChanges();
            addRecord(rs, {id: 2, name: 'bar'});

            added = RecordSet.patch(rs).get('added');
            assert.equal(added.getCount(), 1);
            assert.equal(added.at(0).get('name'), 'bar');
         });

         it('should return removed records id', function() {
            var rs = new RecordSet({format: format, idProperty: 'id'}),
               removed;

            addRecord(rs, {id: 1, name: 'foo'});
            addRecord(rs, {id: 2, name: 'bar'});
            rs.acceptChanges();
            rs.at(0).setState(RecordState.DELETED);

            removed = RecordSet.patch(rs).get('removed');
            assert.equal(removed.length, 1);
            assert.equal(removed[0], 1);
         });

         it('should return result if no changes', function() {
            var rs = new RecordSet(),
               patch = RecordSet.patch(rs);

            assert.equal(patch.get('changed').getCount(), 0);
            assert.equal(patch.get('added').getCount(), 0);
            assert.equal(patch.get('removed').length, 0);
         });
      });
   });
});
