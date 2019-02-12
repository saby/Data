/* global define, beforeEach, afterEach, describe, it, assert */
define([
   '../util',
   'Types/_source/Rpc',
   'Types/_source/IRpc',
   'Types/_source/DataSet',
   'Core/Deferred'
], function(
   util,
   RpcSource,
   IRpc,
   DataSet,
   Deferred
) {
   'use strict';

   RpcSource = RpcSource.default;
   IRpc = IRpc.default;
   DataSet = DataSet.default;

   describe('Types/_source/Rpc', function() {
      var dataSource,
         checkDone = function(callback, done) {
            try {
               callback();
               done();
            } catch (err) {
               done(err);
            }
         },
         ProviderMock = util.extend([IRpc], {
            result: null,
            call: function(name, args) {
               this.lastName = name;
               this.lastArgs = args;
               return Deferred.success(this.result);
            }
         }),
         provider = new ProviderMock();

      beforeEach(function() {
         dataSource = new RpcSource({
            endpoint: '/users/',
            provider: provider,
            binding: {
               query: 'getUsers',
               create: 'createUser',
               read: 'readUser',
               update: 'updateUser',
               destroy: 'deleteUser',
               copy: 'copyUser',
               merge: 'mergeUsers'
            }
         });
      });

      afterEach(function() {
         dataSource = undefined;
      });

      describe('.call()', function() {
         it('should send method name and arguments', function(done) {
            var dataSource = new RpcSource({
                  provider: provider
               }),
               method = 'foo',
               args = ['bar', 'baz'];

            dataSource.call(method, args).addCallbacks(function() {
               checkDone(function() {
                  assert.equal(provider.lastName, method);
                  assert.deepEqual(provider.lastArgs, args);
               }, done);
            }, done);
         });

         it('should return writable DataSet', function(done) {
            var dataSource = new RpcSource({
               provider: provider
            });

            provider.result = {foo: 'bar'};
            dataSource.call().addCallbacks(function(ds) {
               checkDone(function() {
                  assert.instanceOf(ds, DataSet);
                  assert.isTrue(ds.writable);
                  assert.equal(ds.getScalar('foo'), 'bar');
               }, done);
            }, done);
         });
      });

      describe('.getProvider()', function() {
         it('should return Provider', function() {
            assert.instanceOf(dataSource.getProvider(), ProviderMock);
         });
      });
   });
});
