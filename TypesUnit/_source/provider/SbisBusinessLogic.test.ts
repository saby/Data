import {assert} from 'chai';
import SbisBusinessLogic from 'Types/_source/provider/SbisBusinessLogic';
import {ILogger} from 'Types/_util/logger';

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

class DelayedMock extends TransportMock {
    protected resolver: Promise<unknown> = new Promise<unknown>((resolve) => {
        setTimeout(resolve, 50);
    });
}

class LoggerMock implements ILogger {
    lastType: string;
    lastTag: string;
    lastMessage: string | Error;

    log(tag: string, message?: string): void {
        this.lastType = 'log';
        this.lastTag = tag;
        this.lastMessage = message;
    }

    error(tag: string, message?: string | Error): void {
        this.lastType = 'error';
        this.lastTag = tag;
        this.lastMessage = message;
    }

    info(tag: string, message?: string): void {
        this.lastType = 'info';
        this.lastTag = tag;
        this.lastMessage = message;
    }

    stack(message: string, offset?: number, level?: string): void {
        this.lastType = 'stack';
        this.lastTag = '';
        this.lastMessage = message;
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

       it('should log an error on expired timeout', () => {
           const logger = new LoggerMock();
           const bl = new SbisBusinessLogic({
               callTimeout: -1,
               logger,
               transport: DelayedMock
           });

           return bl.call('foo.bar').then(() => {
               assert.equal(logger.lastType, 'info');
               assert.equal(logger.lastTag, 'Types/_source/provider/SbisBusinessLogic');
               assert.equal(
                   logger.lastMessage,
                   'Timeout of -1 seconds had expired before the method \'foo.bar\' at \'undefined\' returned any results'
               );
           });
       });
    });
});
