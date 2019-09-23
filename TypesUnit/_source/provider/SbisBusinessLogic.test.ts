import {assert} from 'chai';
import SbisBusinessLogic from 'Types/_source/provider/SbisBusinessLogic';

class TransportMock {
   static lastMethod: string;
   static lastArgs: any;

   callMethod(method: string, args: any): void {
      TransportMock.lastMethod = method;
      TransportMock.lastArgs = args;
   }
}

describe('Types/_source/provider/SbisBusinessLogic', () => {
   describe('.getEndpoint()', () => {
      it('should return endpoint', () => {
         const provider = new SbisBusinessLogic({
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

   describe('.call()', () => {
      let provider: SbisBusinessLogic;

      beforeEach(() => {
         provider = new SbisBusinessLogic({
            endpoint: {
               contract: 'foo'
            },
            transport: TransportMock
         });
      });

      afterEach(() => {
         provider = null;
      });

      it('should call a method from given object', () => {
         provider.call('bar');
         assert.equal(TransportMock.lastMethod, 'foo.bar');
      });

      it('should transfer a valid arguments', () => {
         provider.call('name', {bar: 'baz'});
         assert.deepEqual(TransportMock.lastArgs, {bar: 'baz'});
      });

      it('should transfer no arguments as empty object', () => {
         provider.call('name');
         assert.deepEqual(TransportMock.lastArgs, {});
      });

      it('should override default object name', () => {
         provider.call('boo.bar');
         assert.equal(TransportMock.lastMethod, 'boo.bar');
      });
   });
});
