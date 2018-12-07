/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/adapter/CowRecord'
], function(
   CowRecordAdapterEs
) {
   'use strict';

   var CowRecordAdapter = CowRecordAdapterEs.default;

   describe('Types/Adapter/CowRecord', function() {
      var Mock,
         MockRecord,
         data,
         original,
         originalRecord,
         adapter;

      Mock = function(cloneable) {
         this.isCloneable = cloneable;
      };

      Mock.prototype.forRecord = function(data) {
         originalRecord = new MockRecord(data, this.isCloneable);
         return originalRecord;
      };

      MockRecord = function(data, cloneable) {
         this.data = data;
         if (cloneable) {
            this['[Types/_entity/ICloneable]'] = true;
         }
      };

      MockRecord.prototype.has = function() {
         return true;
      };

      MockRecord.prototype.get = function(name) {
         return this.data[name];
      };

      MockRecord.prototype.set = function(name, value) {
         this.data[name] = value;
      };

      MockRecord.prototype.clear = function() {
         this.data = {};
      };

      MockRecord.prototype.clone = function() {
         var clone = new MockRecord(this.data);
         clone.isClone = true;
         return clone;
      };

      MockRecord.prototype.getData = function() {
         return this.data;
      };

      MockRecord.prototype.getFields = function() {
         return [];
      };

      MockRecord.prototype.getFormat = function() {
         return {};
      };

      MockRecord.prototype.getSharedFormat = function() {
         return {};
      };

      MockRecord.prototype.addField = function() {
      };

      MockRecord.prototype.removeField = function() {
      };

      MockRecord.prototype.removeFieldAt = function() {
      };

      beforeEach(function() {
         data = {foo: 'bar'};
         original = new Mock();
         adapter = new CowRecordAdapter(data, original);
      });

      afterEach(function() {
         data = undefined;
         original = undefined;
         originalRecord = undefined;
         adapter = undefined;
      });


      describe('.get()', function() {
         it('should return the property value from shared data', function() {
            assert.equal(
               adapter.get('foo'),
               'bar'
            );
            assert.strictEqual(adapter.getData(), data);
         });
      });

      describe('.set()', function() {
         it('should set the property value into the copy', function() {
            adapter.set('foo', 'baz');

            assert.notEqual(adapter.getData(), data);
            assert.equal(data.foo, 'bar');
            assert.equal(adapter.getData().foo, 'baz');
         });

         it('should copy the data once', function() {
            adapter.set('foo', 'baz');
            var data = adapter.getData();
            adapter.set('foo', 'bax');

            assert.strictEqual(adapter.getData(), data);
         });

         it('should use ICloneable interface if supported', function() {
            var original = new Mock(true),
               adapter = new CowRecordAdapter(data, original);

            assert.isUndefined(adapter.getOriginal().isClone);
            adapter.set('foo', 'baz');
            assert.isTrue(adapter.getOriginal().isClone);
         });
      });

      describe('.clear()', function() {
         it('should clear copy of the data', function() {
            adapter.clear();
            assert.notEqual(adapter.getData(), data);
            assert.notEqual(Object.keys(data).length, 0);
            assert.equal(Object.keys(adapter.getData()).length, 0);
         });
      });

      describe('.getData()', function() {
         it('should return raw data', function() {
            assert.strictEqual(adapter.getData(), data);
         });
      });

      describe('.getFields()', function() {
         it('should return an empty array', function() {
            assert.strictEqual(
               adapter.getFields().length,
               0
            );
         });

         it('should leave data shared', function() {
            adapter.getFields();
            assert.strictEqual(adapter.getData(), data);
         });
      });

      describe('.getFormat()', function() {
         it('should return an empty Object', function() {
            assert.equal(Object.keys(adapter.getFormat('foo')).length, 0);
         });

         it('should leave data shared', function() {
            adapter.getFormat('foo');
            assert.strictEqual(adapter.getData(), data);
         });
      });

      describe('.addField()', function() {
         it('should copy the data', function() {
            adapter.addField({}, 0);
            assert.notEqual(adapter.getData(), data);
         });
      });

      describe('.removeField()', function() {
         it('should copy the data', function() {
            adapter.removeField('foo');
            assert.notEqual(adapter.getData(), data);
         });
      });

      describe('.removeFieldAt()', function() {
         it('should copy the data', function() {
            adapter.removeFieldAt(0);
            assert.notEqual(adapter.getData(), data);
         });
      });

      describe('.getOriginal()', function() {
         it('should return the original adapter', function() {
            assert.strictEqual(adapter.getOriginal(), originalRecord);
         });
      });
   });
});
