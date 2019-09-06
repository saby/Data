import {assert} from 'chai';
import RpcSource from 'Types/_source/Rpc';
import {IOptions} from 'Types/_source/Remote';
import DataSet from 'Types/_source/DataSet';
import * as coreExtend from 'Core/core-extend';
import Deferred = require('Core/Deferred');

class TestSource extends RpcSource {
    constructor(options?: IOptions) {
        super(options);
    }
}

describe('Types/_source/Rpc', () => {
    const ProviderMock = coreExtend({
        result: null,
        call(name: string, args: any): any {
            this.lastName = name;
            this.lastArgs = args;
            return Deferred.success(this.result);
        }
    });

    const provider = new ProviderMock();

    let dataSource: TestSource;

    beforeEach(() => {
        dataSource = new TestSource({
            endpoint: '/users/',
            provider,
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

    afterEach(() => {
        dataSource = undefined;
    });

    describe('.call()', () => {
        it('should send method name and arguments', () => {
            const dataSource = new TestSource({
                provider
            });
            const method = 'foo';
            const args = ['bar', 'baz'];

            return dataSource.call(method, args).then(() => {
                assert.equal(provider.lastName, method);
                assert.deepEqual(provider.lastArgs, args);
            });
        });

        it('should return writable DataSet', () => {
            const dataSource = new TestSource({
                provider
            });

            provider.result = {foo: 'bar'};
            return dataSource.call(undefined).then((ds) => {
                assert.instanceOf(ds, DataSet);
                assert.isTrue(ds.writable);
                assert.equal(ds.getScalar('foo'), 'bar');
            });
        });
    });

    describe('.getProvider()', () => {
        it('should return Provider', () => {
            assert.instanceOf(dataSource.getProvider(), ProviderMock);
        });
    });
});
