/* global beforeEach, afterEach, describe, assert, it */
define([
   'Types/_source/Base',
   'Types/_entity/adapter/Json'
], function(
   BaseSource,
   JsonAdapter
) {
   'use strict';

   BaseSource = BaseSource.default;
   JsonAdapter = JsonAdapter.default;

   describe('Types/_source/Base', function() {
      var source;

      beforeEach(function() {
         source = new BaseSource();
      });

      afterEach(function() {
         source = undefined;
      });

      describe('.getAdapter()', function() {
         it('should return the JSON adapter by default', function() {
            var adapter = source.getAdapter();
            assert.instanceOf(adapter, JsonAdapter);
         });

         it('should return value passed to the constructor', function() {
            var adapter = new JsonAdapter(),
               source = new BaseSource({
                  adapter: adapter
               });

            assert.strictEqual(source.getAdapter(), adapter);
         });
      });

      describe('.getModel()', function() {
         it('should return "Types/entity:Model" by default', function() {
            assert.equal(source.getModel(), 'Types/entity:Model');
         });

         it('should return value passed to the constructor', function() {
            var source = new BaseSource({
               model: 'my.model'
            });

            assert.equal(source.getModel(), 'my.model');
         });
      });

      describe('.setModel()', function() {
         it('should set the new value', function() {
            source.setModel('my.model');
            assert.equal(source.getModel(), 'my.model');
         });
      });

      describe('.getListModule()', function() {
         it('should return "Types/collection:RecordSet" by default', function() {
            assert.equal(source.getListModule(), 'Types/collection:RecordSet');
         });
         it('should return value passed to the constructor', function() {
            var source = new BaseSource({
               listModule: 'my.list'
            });

            assert.equal(source.getListModule(), 'my.list');
         });
      });

      describe('.setListModule()', function() {
         it('should set the new value', function() {
            source.setListModule('my.list');
            assert.equal(source.getListModule(), 'my.list');
         });
      });

      describe('.getIdProperty()', function() {
         it('should return an empty string by default', function() {
            assert.strictEqual(source.getIdProperty(), '');
         });
         it('should return value passed to the constructor', function() {
            var source = new BaseSource({
               idProperty: 'test'
            });

            assert.equal(source.getIdProperty(), 'test');
         });
      });

      describe('.setIdProperty()', function() {
         it('should set the new value', function() {
            source.setIdProperty('test');
            assert.equal(source.getIdProperty(), 'test');
         });
      });

      describe('.getOptions()', function() {
         it('should return an Object by default', function() {
            assert.strictEqual(source.getOptions().debug, false);
         });

         it('should return value passed to the constructor', function() {
            var source = new BaseSource({
               options: {debug: true}
            });

            assert.strictEqual(source.getOptions().debug, true);
         });

         it('should return merged value of the prototype and the constructor', function() {
            var source = new BaseSource({
               options: {foo: 'bar'}
            });

            assert.isFalse(source.getOptions().debug);
            assert.equal(source.getOptions().foo, 'bar');
         });
      });

      describe('.setOptions()', function() {
         it('should set new value', function() {
            var options = {
                  debug: true,
                  foo: 'bar'
               },
               source = new BaseSource({options: options});

            source.setOptions({debug: true});
            assert.strictEqual(options.debug, true);
            assert.strictEqual(options.foo, 'bar');
         });

         it('should leave the prototype options untouched', function() {
            var source = new BaseSource();

            assert.deepEqual(BaseSource.prototype._$options, source.getOptions());
            source.setOptions({debug: true});
            assert.notDeepEqual(BaseSource.prototype._$options, source.getOptions());
         });
      });

      describe('.toJSON()', function() {
         it('should return valid signature', function() {
            var options = {},
               source = new BaseSource(options),
               json = source.toJSON();

            assert.deepEqual(json.$serialized$, 'inst');
            assert.deepEqual(json.module, 'Types/source:Base');
            assert.deepEqual(json.state.$options, options);
         });
      });
   });
});
