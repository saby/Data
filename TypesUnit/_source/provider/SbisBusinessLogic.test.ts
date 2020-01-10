import {assert} from 'chai';
import SbisBusinessLogic from 'Types/_source/provider/SbisBusinessLogic';

class TransportMock {
    protected resolver: Promise<unknown> = Promise.resolve(null);

    callMethod<T>(method: string, args: any): Promise<T> {
        TransportMock.lastMethod = method;
        TransportMock.lastArgs = args;
        return this.resolver as unknown as Promise<T>;
    }

    abort(): void {
        // Do nothing
    }

    static lastMethod: string;
    static lastArgs: any;
}

class UnresolvedMock extends TransportMock {
    protected resolver: Promise<unknown> = new Promise<unknown>(() => {
        // Never resolve
    });
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

       it('should return error on expired timeout', () => {
           const bl = new SbisBusinessLogic({
               callTimeout: -1,
               transport: UnresolvedMock
           });
           return bl.call('foo.bar').then(() => {
               throw new Error('Shouldn\'t get here');
           }).catch((err) => {
              assert.isTrue(err.message.includes('has expired earlier than call'));
           });
       });
    });
});
