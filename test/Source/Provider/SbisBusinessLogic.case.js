/* global define, beforeEach, afterEach, describe, it, assert */
define([], function() {
   'use strict';
   return function(SbisBusinessLogic) {
      var TransportMock = function() {
         this.callMethod = function(method, args) {
            TransportMock.lastMethod = method;
            TransportMock.lastArgs = args;
         };
      };

      describe('.getEndpoint()', function() {
         it('should return endpoint', function() {
            var provider = new SbisBusinessLogic({
               endpoint: {
                  address: '/foo',
                  contract: 'bar'
               }
            });
            assert.deepEqual(provider.getEndpoint(), {
               address: '/foo',
               contract: 'bar'
            });
         });
      });

      describe('.call()', function() {
         var provider;
         beforeEach(function() {
            provider = new SbisBusinessLogic({
               endpoint: {
                  contract: 'foo'
               },
               transport: TransportMock
            });
         });

         afterEach(function() {
            provider = null;
         });

         it('should call a method from given object', function() {
            provider.call('bar');
            assert.equal(TransportMock.lastMethod, 'foo.bar');
         });

         it('should transfer a valid arguments', function() {
            provider.call('name', {bar: 'baz'});
            assert.deepEqual(TransportMock.lastArgs, {bar: 'baz'});
         });

         it('should transfer no arguments as empty object', function() {
            provider.call('name');
            assert.deepEqual(TransportMock.lastArgs, {});
         });

         it('should override default object name', function() {
            provider.call('boo.bar');
            assert.equal(TransportMock.lastMethod, 'boo.bar');
         });
      });
   };
});
