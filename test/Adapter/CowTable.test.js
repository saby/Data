/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/_entity/adapter/CowTable'
], function(
   CowTableAdapterEs
) {
   'use strict';

   var CowTableAdapter = CowTableAdapterEs.default;

   describe('Types/_entity/adapter/CowTable', function() {
      var Mock,
         MockTable,
         data,
         original,
         originalTable,
         adapter;

      Mock = function(cloneable) {
         this.isCloneable = cloneable;
      };

      Mock.prototype.forTable = function(data) {
         originalTable = new MockTable(data, this.isCloneable);
         return originalTable;
      };

      MockTable = function(data, cloneable) {
         this.data = data;
         if (cloneable) {
            this['[Types/_entity/ICloneable]'] = true;
         }
      };

      MockTable.prototype.getFields = function() {
         return [];
      };

      MockTable.prototype.getCount = function() {
         return 0;
      };

      MockTable.prototype.getData = function() {
         return this.data;
      };

      MockTable.prototype.add = function(record, at) {
         this.data[at] = record;
      };

      MockTable.prototype.at = function(index) {
         return this.data[index];
      };

      MockTable.prototype.remove = function(at) {
         this.data.splice(at, 1);
      };

      MockTable.prototype.replace = function(record, at) {
         this.data[at] = record;
      };

      MockTable.prototype.move = function() {
      };

      MockTable.prototype.merge = function() {
      };

      MockTable.prototype.copy = function() {
      };

      MockTable.prototype.clear = function() {
         this.data.length = 0;
      };

      MockTable.prototype.clone = function() {
         var clone = new MockTable(this.data);
         clone.isClone = true;
         return clone;
      };

      MockTable.prototype.getFormat = function() {
         return {};
      };

      MockTable.prototype.getSharedFormat = function() {
         return {};
      };

      MockTable.prototype.addField = function() {
      };

      MockTable.prototype.removeField = function() {
      };

      MockTable.prototype.removeFieldAt = function() {
      };

      beforeEach(function() {
         data = [];
         original = new Mock();
         adapter = new CowTableAdapter(data, original);
      });

      afterEach(function() {
         data = undefined;
         original = undefined;
         originalTable = undefined;
         adapter = undefined;
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

      describe('.getCount()', function() {
         it('should return 0', function() {
            assert.strictEqual(
               adapter.getCount(),
               0
            );
         });

         it('should leave data shared', function() {
            adapter.getCount();
            assert.strictEqual(adapter.getData(), data);
         });
      });

      describe('.add()', function() {
         it('should append a record into the copy', function() {
            adapter.add({foo: 'bar'}, 0);

            assert.notEqual(adapter.getData(), data);
            assert.strictEqual(data.length, 0);
            assert.strictEqual(adapter.getData().length, 1);
            assert.strictEqual(adapter.getData()[0].foo, 'bar');
         });

         it('should copy the data once', function() {
            adapter.add({foo: 'bar'}, 0);
            var data = adapter.getData();
            adapter.add({foo: 'baz'}, 1);

            assert.strictEqual(adapter.getData(), data);
            assert.strictEqual(adapter.getData().length, 2);
         });

         it('should use ICloneable interface if supported', function() {
            var original = new Mock(true),
               adapter = new CowTableAdapter(data, original);

            assert.isUndefined(adapter.getOriginal().isClone);
            adapter.add({foo: 'bar'}, 0);
            assert.isTrue(adapter.getOriginal().isClone);
         });
      });

      describe('.at()', function() {
         it('should return valid record', function() {
            data = [{foo: 'bar'}];
            original = new Mock();
            adapter = new CowTableAdapter(data, original);

            assert.strictEqual(adapter.at(0).foo, 'bar');
         });

         it('should leave data shared', function() {
            data = [{foo: 'bar'}];
            original = new Mock();
            adapter = new CowTableAdapter(data, original);

            adapter.at(0);
            assert.strictEqual(adapter.getData(), data);
         });
      });

      describe('.remove()', function() {
         it('should remove the record in the copy', function() {
            data = [{foo: 'bar'}];
            original = new Mock();
            adapter = new CowTableAdapter(data, original);

            adapter.remove(0);

            assert.notEqual(adapter.getData(), data);
            assert.equal(data.length, 1);
            assert.strictEqual(adapter.getData().length, 0);
         });
      });

      describe('.replace()', function() {
         it('should replace the record in the copy', function() {
            data = [{foo: 'bar'}];
            original = new Mock();
            adapter = new CowTableAdapter(data, original);

            adapter.replace({foo: 'baz'}, 0);

            assert.notEqual(adapter.getData(), data);
            assert.equal(data[0].foo, 'bar');
            assert.strictEqual(adapter.getData()[0].foo, 'baz');
         });
      });

      describe('.move()', function() {
         it('should copy the data', function() {
            data = [{foo: 'bar'}, {foo: 'baz'}];
            original = new Mock();
            adapter = new CowTableAdapter(data, original);

            adapter.move(1, 0);

            assert.notEqual(adapter.getData(), data);
         });
      });

      describe('.merge()', function() {
         it('should copy the data', function() {
            data = [{foo: 'bar'}, {foo: 'baz'}];
            original = new Mock();
            adapter = new CowTableAdapter(data, original);

            adapter.merge(0, 1, 'foo');

            assert.notEqual(adapter.getData(), data);
         });
      });

      describe('.copy()', function() {
         it('should copy the data', function() {
            data = [{foo: 'bar'}];
            original = new Mock();
            adapter = new CowTableAdapter(data, original);

            adapter.copy(0);

            assert.notEqual(adapter.getData(), data);
         });
      });

      describe('.clear()', function() {
         it('should clear copy of the data', function() {
            data = [{foo: 'bar'}];
            original = new Mock();
            adapter = new CowTableAdapter(data, original);

            adapter.clear();
            assert.notEqual(adapter.getData(), data);
            assert.equal(data.length, 1);
            assert.strictEqual(adapter.getData().length, 0);
         });
      });

      describe('.getData()', function() {
         it('should return the raw data', function() {
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
            assert.strictEqual(adapter.getOriginal(), originalTable);
         });
      });
   });
});
