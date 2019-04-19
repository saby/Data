/* global define, beforeEach, afterEach, describe, context, it, assert */
define([
   'Types/_source/Remote',
   'Types/_entity/Record',
   'Types/_entity/Model',
   'Types/_collection/RecordSet',
   'Types/di',
   'Core/core-extend',
   'Core/Deferred'
], function(
   RemoteSource,
   Record,
   Model,
   RecordSet,
   Di,
   coreExtend,
   Deferred
) {
   'use strict';

   RemoteSource = RemoteSource.default;
   Record = Record.default;
   Model = Model.default;
   RecordSet = RecordSet.default;

   var IAbstractProvider = {
      '[Types/_source/provider/IAbstract]': true
   };

   describe('Types/_source/Remote', function() {
      var checkDone = function(callback, done) {
         try {
            callback();
            done();
         } catch (err) {
            done(err);
         }
      };
      var ProviderMock = coreExtend({}, [IAbstractProvider], {
         result: null,
         call: function(name, args) {
            this.lastName = name;
            this.lastArgs = args;
            return Deferred.success(this.result);
         }
      });
      var dataSource;
      var provider;

      beforeEach(function() {
         provider = new ProviderMock();

         dataSource = new RemoteSource({
            endpoint: '/users/',
            provider: provider,
            binding: {
               create: 'createUser',
               read: 'readUser',
               update: 'updateUser',
               destroy: 'deleteUser',
               query: 'getUsers',
               copy: 'copyUser',
               merge: 'mergeUsers'
            }
         });
      });

      afterEach(function() {
         dataSource = undefined;
      });

      describe('.constructor()', function() {
         it('should merge property _$passing value from prototype with option', function() {
            var passing = {
               create: 'c',
               read: 'r'
            };
            var source = new RemoteSource({
               passing: passing
            });

            assert.strictEqual(source._$passing.create, passing.create);
            assert.strictEqual(source._$passing.read, passing.read);
            assert.strictEqual(source._$passing.update, RemoteSource.prototype._$passing.update);
            assert.strictEqual(source._$passing.destroy, RemoteSource.prototype._$passing.destroy);
         });
      });

      describe('.getEndpoint()', function() {
         it('should return normalized endpoint from String', function() {
            var source = new RemoteSource({
                  endpoint: 'Test'
               }),
               ep = source.getEndpoint();
            assert.equal(ep.contract, 'Test');
         });

         it('should return value passed to the constructor', function() {
            var source = new RemoteSource({
                  endpoint: {
                     contract: 'Test',
                     address: '//stdin'
                  }
               }),
               ep = source.getEndpoint();
            assert.equal(ep.contract, 'Test');
            assert.equal(ep.address, '//stdin');
         });

         it('should return merged value of the prototype and the constructor', function() {
            var source = new RemoteSource({
               endpoint: {foo: 'bar'}
            });

            assert.notEqual(source.getEndpoint(), RemoteSource.prototype._$endpoint);
            assert.equal(source.getEndpoint().foo, 'bar');
         });

         it('should return value of the subclass', function() {
            var SubRemoteSource = coreExtend.extend(RemoteSource, {
               _$endpoint: {'foo': 'bar'}
            });
            var source = new SubRemoteSource();

            assert.equal(source.getEndpoint().foo, 'bar');
         });
      });

      describe('.getBinding()', function() {
         it('should return value passed to the constructor', function() {
            var binding = {
                  create: 'c',
                  read: 'r',
                  update: 'u',
                  destroy: 'd'
               },
               source = new RemoteSource({
                  binding: binding
               });
            assert.strictEqual(source.getBinding().c, binding.c);
            assert.strictEqual(source.getBinding().r, binding.r);
            assert.strictEqual(source.getBinding().u, binding.u);
            assert.strictEqual(source.getBinding().d, binding.d);
         });

         it('should return merged value of the prototype and the constructor', function() {
            var source = new RemoteSource({
               binding: {read: 'foo'}
            });

            assert.equal(source.getBinding().create, 'create');
            assert.equal(source.getBinding().read, 'foo');
         });
      });

      describe('.setBinding()', function() {
         it('should set the new value', function() {
            var binding = {
                  create: 'c',
                  read: 'r',
                  update: 'u',
                  destroy: 'd'
               },
               source = new RemoteSource();

            source.setBinding(binding);
            assert.deepEqual(source.getBinding(), binding);
         });
      });

      describe('.getProvider()', function() {
         it('should throw an Error by default', function() {
            var source = new RemoteSource();
            assert.throws(function() {
               source.getProvider();
            });
         });

         it('should return Provider', function() {
            assert.instanceOf(dataSource.getProvider(), ProviderMock);
         });
      });

      describe('.create()', function() {
         it('should return writable Record', function(done) {
            var dataSource = new RemoteSource({
               provider: provider
            });

            provider.result = {foo: 'bar'};
            dataSource.create().addCallbacks(function(record) {
               checkDone(function() {
                  assert.instanceOf(record, Record);
                  assert.isTrue(record.writable);
                  assert.equal(record.get('foo'), 'bar');
               }, done);
            }, done);
         });
      });

      describe('.read()', function() {
         it('should send primary key value', function(done) {
            var dataSource = new RemoteSource({
                  provider: provider
               }),
               value = 'foo',
               sent;

            provider.result = {foo: 'bar'};
            dataSource.read(value).addCallbacks(function(record) {
               checkDone(function() {
                  sent = provider.lastArgs[0];
                  assert.equal(sent, 'foo');

                  assert.instanceOf(record, Record);
                  assert.isTrue(record.writable);
                  assert.equal(record.get('foo'), 'bar');
               }, done);
            }, done);
         });
      });

      describe('.update()', function() {
         it('should send all record fields', function(done) {
            var dataSource = new RemoteSource({
                  provider: provider
               }),
               record = new Record({
                  rawData: {a: 1, b: 2, c: 3}
               }),
               sent;

            dataSource.update(record).addCallbacks(function() {
               checkDone(function() {
                  sent = provider.lastArgs[0];
                  assert.equal(sent.a, 1);
                  assert.equal(sent.b, 2);
                  assert.equal(sent.c, 3);
               }, done);
            }, done);
         });

         it('should send only changed record fields and idProperty', function(done) {
            var dataSource = new RemoteSource({
                  provider: provider,
                  idProperty: 'a',
                  options: {
                     updateOnlyChanged: true
                  }
               }),
               record = new Record({
                  rawData: {a: 1, b: 2, c: 3}
               }),
               sent;

            record.set('b', 20);
            dataSource.update(record).addCallbacks(function() {
               checkDone(function() {
                  sent = provider.lastArgs[0];
                  assert.equal(sent.a, 1);
                  assert.equal(sent.b, 20);
                  assert.isUndefined(sent.c);
               }, done);
            }, done);
         });

         it('should send only changed model fields and idProperty (source priority)', function(done) {
            var dataSource = new RemoteSource({
                  provider: provider,
                  idProperty: 'a',
                  options: {
                     updateOnlyChanged: true
                  }
               }),
               model = new Model({
                  idProperty: 'c',
                  rawData: {a: 1, b: 2, c: 3}
               }),
               sent;

            model.set('b', 20);
            dataSource.update(model).addCallbacks(function() {
               checkDone(function() {
                  sent = provider.lastArgs[0];
                  assert.equal(sent.a, 1);
                  assert.equal(sent.b, 20);
                  assert.isUndefined(sent.c);
                  assert.isFalse(model.isChanged());
               }, done);
            }, done);
         });

         it('should send only Primary Key', function(done) {
            var dataSource = new RemoteSource({
                  provider: provider,
                  options: {
                     updateOnlyChanged: true
                  }
               }),
               model = new Model({
                  idProperty: 'a',
                  rawData: {a: 1, b: 2, c: 3}
               }),
               sent;

            dataSource.update(model).addCallbacks(function() {
               checkDone(function() {
                  sent = provider.lastArgs[0];

                  assert.isTrue(sent.hasOwnProperty('a'));
                  assert.isFalse(sent.hasOwnProperty('b'));
                  assert.isFalse(sent.hasOwnProperty('c'));
                  assert.isFalse(model.isChanged());
               }, done);
            }, done);
         });

         it('should send all records', function(done) {
            var dataSource = new RemoteSource({
                  provider: provider
               }),
               data = [
                  {id: 1},
                  {id: 2},
                  {id: 3},
                  {id: 4},
                  {id: 5}
               ],
               rs = new RecordSet({
                  rawData: data
               }),
               sent;

            dataSource.update(rs).addCallbacks(function() {
               checkDone(function() {
                  sent = provider.lastArgs[0];
                  assert.equal(sent.length, data.length);
               }, done);
            }, done);
         });

         it('should send only changed records', function(done) {
            var dataSource = new RemoteSource({
                  provider: provider,
                  idProperty: 'id',
                  options: {
                     updateOnlyChanged: true
                  }
               }),
               rs = new RecordSet({
                  rawData: [
                     {id: 1},
                     {id: 2},
                     {id: 3},
                     {id: 4},
                     {id: 5}
                  ]
               }),
               sent;

            rs.at(0).set('a', 1);
            rs.at(2).set('a', 2);
            dataSource.update(rs).addCallbacks(function() {
               checkDone(function() {
                  sent = provider.lastArgs[0];

                  assert.equal(sent.length, 2);

                  assert.equal(sent[0].id, 1);
                  assert.equal(sent[0].a, 1);

                  assert.equal(sent[1].id, 3);
                  assert.equal(sent[1].a, 2);
               }, done);
            }, done);
         });
      });

      describe('.destroy()', function() {
         it('should send primary key value', function(done) {
            var dataSource = new RemoteSource({
                  provider: provider
               }),
               value = 'foo',
               sent;

            dataSource.destroy(value).addCallbacks(function() {
               checkDone(function() {
                  sent = provider.lastArgs[0];
                  assert.equal(sent, 'foo');
               }, done);
            }, done);
         });
      });

      describe('.merge()', function() {
         it('should send two keys', function(done) {
            var dataSource = new RemoteSource({
                  provider: provider
               }),
               from = 'foo',
               to = 'bar';

            dataSource.merge(from, to).addCallbacks(function() {
               checkDone(function() {
                  assert.equal(provider.lastArgs[0], 'foo');
                  assert.equal(provider.lastArgs[1], 'bar');
               }, done);
            }, done);
         });
      });

      describe('.copy()', function() {
         it('should copy model', function(done) {
            var id = 'test',
               data = {a: 1};
            provider.result = data;
            dataSource.copy(id).addCallbacks(function(copy) {
               checkDone(function() {
                  assert.instanceOf(copy, Model);
                  assert.equal(provider.lastName, 'copyUser');
                  assert.equal(provider.lastArgs[0], 'test');
                  assert.deepEqual(copy.getRawData(), data);
               }, done);
            }, done);
         });
      });

      describe('.move()', function() {
         it('should send two keys', function(done) {
            var dataSource = new RemoteSource({
                  provider: provider
               }),
               from = 'foo',
               to = 'bar';

            dataSource.move(from, to).addCallbacks(function() {
               checkDone(function() {
                  assert.equal(provider.lastArgs[0], 'foo');
                  assert.equal(provider.lastArgs[1], 'bar');
               }, done);
            }, done);
         });
      });

      describe('.query()', function() {
         it('should send query', function(done) {
            var dataSource = new RemoteSource({
                  provider: provider
               }),
               query = {foo: 'bar'};

            dataSource.query(query).addCallbacks(function() {
               checkDone(function() {
                  assert.deepEqual(provider.lastArgs[0], query);
               }, done);
            }, done);
         });
      });

      describe('.subscribe()', function() {
         context('onBeforeProviderCall', function() {
            it('should receive service name', function(done) {
               var handler = function(e, name) {
                  try {
                     assert.strictEqual(name, dataSource.getBinding().query);
                     done();
                  } catch (err) {
                     done(err);
                  }
               };
               dataSource.subscribe('onBeforeProviderCall', handler);
               dataSource.query();
               dataSource.unsubscribe('onBeforeProviderCall', handler);
            });

            it('should receive service name and arguments', function(done) {
               var serviceArgs = [{}, [], 'a', 1, 0, false, true, null],
                  handler = function(e, name, args) {
                     try {
                        assert.strictEqual(name, dataSource.getBinding().query);
                        assert.deepEqual(args, [serviceArgs]);
                        done();
                     } catch (err) {
                        done(err);
                     }
                  };
               dataSource.subscribe('onBeforeProviderCall', handler);
               dataSource.query(serviceArgs);
               dataSource.unsubscribe('onBeforeProviderCall', handler);
            });

            it('should change service arguments as an object', function() {
               var handler = function(e, name, args) {
                     args[0].a = 9;
                     delete args[0].b;
                     args[0].c = 3;
                  },
                  serviceArgs = {a: 1, b: 2},
                  expectArgs = [{a: 9, c: 3}];
               dataSource.subscribe('onBeforeProviderCall', handler);
               dataSource.query(serviceArgs);
               dataSource.unsubscribe('onBeforeProviderCall', handler);
               assert.deepEqual(provider.lastArgs, expectArgs);
               assert.deepEqual([serviceArgs], expectArgs);
            });

            it('should change service arguments as an array', function() {
               var handler = function(e, name, args) {
                     args[0].push('new');
                  },
                  serviceArgs = [1, 2],
                  expectArgs = [[1, 2, 'new']];
               dataSource.subscribe('onBeforeProviderCall', handler);
               dataSource.query(serviceArgs);
               dataSource.unsubscribe('onBeforeProviderCall', handler);
               assert.deepEqual(provider.lastArgs, expectArgs);
               assert.deepEqual([serviceArgs], expectArgs);
            });

            it('should change service arguments and leave original untouched', function() {
               var handler = function(e, name, args) {
                     var result = Object.assign({}, args[0]);
                     result.a = 9;
                     delete result.b;
                     result.c = 3;
                     e.setResult(result);
                  },
                  serviceArgs = {a: 1, b: 2},
                  serviceArgsCopy = {a: 1, b: 2},
                  expectArgs = {a: 9, c: 3};
               dataSource.subscribe('onBeforeProviderCall', handler);
               dataSource.query(serviceArgs);
               dataSource.unsubscribe('onBeforeProviderCall', handler);
               assert.deepEqual(provider.lastArgs, expectArgs);
               assert.deepEqual(serviceArgs, serviceArgsCopy);
            });
         });
      });

      describe('.toJSON()', function() {
         it('should serialize provider option', function() {
            var Foo = function() {};
            Di.register('Foo', Foo);

            var source = new RemoteSource({
                  provider: 'Foo'
               }),
               provider = source.getProvider(),
               json = source.toJSON();

            Di.unregister('Foo');

            assert.instanceOf(provider, Foo);
            assert.equal(json.state.$options.provider, 'Foo');
         });
      });
   });
});
