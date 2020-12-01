import {assert} from 'chai';
import {stub} from 'sinon';
import Restful from 'Types/_source/Restful';
import Model from 'Types/_entity/Model';
import Record from 'Types/_entity/Record';
import Query from 'Types/_source/Query';

interface fetchOptions {
    body: string
}

describe('Types/_source/Restful', () => {
    function getSuccessResponse(res) {
        return {
            ok: true,
            json: () => new Promise((resolve) => {
                resolve(res);
            })
        }
    }

    function stubFetch(url: string, options: fetchOptions): Promise<object> {
        return new Promise((resolve, reject) => {
            switch (url) {
                case 'api/foo/create':
                    resolve(getSuccessResponse({
                        firstName: ''
                    }));
                    return;

                case 'api/foo/read?key=1':
                    resolve(getSuccessResponse({
                        firstName: 'Ivan'
                    }));
                    return;

                case 'api/foo/update':
                    resolve(getSuccessResponse(options.body === '{"data":{"firstName":"Sergey"}}'));
                    return;

                case 'api/foo/destroy':
                    resolve(getSuccessResponse(options.body === '{"keys":1234}'));
                    return;

                case 'api/foo/query':
                    if (options.body === '{"select":{},"from":"","where":{},"orderBy":[],"offset":0}') {
                        resolve(getSuccessResponse([{
                            firstName: 'Ivan'
                        }]));
                    } else {
                        resolve(getSuccessResponse({}));
                    }
                    return;

                case 'api/foo/merge':
                    resolve(getSuccessResponse(options.body === '{"from":"foo","to":"bar"}'));
                    return;

                case 'api/foo/copy':
                    if (options.body === '{"key":1234}') {
                        resolve(getSuccessResponse({
                            firstName: 'Sergey'
                        }));
                    } else {
                        resolve(getSuccessResponse({}));
                    }
                    return;

                case 'api/foo/move':
                    resolve(getSuccessResponse(options.body === '{"from":"foo","to":"bar"}'));
                    return;

                case 'api/foo/checkUser':
                    resolve(getSuccessResponse(options.body === '{"firstName":"Ivan","lastName":"Ivanov"}'));
                    return;

                case 'api/foo/register?id=1234':
                    resolve(getSuccessResponse(true));
                    return;

                default:
                    reject(`Url "${url}" is undefined`);
            }
        });
    }

    let stubCallProvider;
    let restful;

    before(() => {
        stubCallProvider = stub(Restful.prototype, 'providerOptions');
        stubCallProvider.get(() => {
            return {
                httpMethodBinding: this._$httpMethodBinding,
                transport: stubFetch
            }
        });
    });

    after(() => {
        stubCallProvider.restore();
    });

    beforeEach(() => {
        restful = new Restful({
            endpoint: {
                address: 'api/foo'
            },
            binding: {
                create: 'create',
                update: 'update',
                read: 'read',
                destroy: 'destroy',
                query: 'query',
                copy: 'copy',
                merge: 'merge',
                move: 'move'
            }
        });
    });

    describe('.create()', () => {
        it('should return an empty model', () => {
            return restful.create().then((model) => {
                assert.isTrue(model instanceof Model);
                assert.strictEqual(model.get('firstName'), '');
            });
        });
    });

    describe('.read()', () => {
        it('should return valid model', () => {
            return restful.read(1).then((model) => {
                assert.isTrue(model instanceof Model);
                assert.strictEqual(model.get('firstName'), 'Ivan');
            });
        });
    });

    describe('.update()', () => {
        it('should send all record fields', () => {
            const record = new Record({
                rawData: {
                    firstName: 'Sergey'
                }
            });

            return restful.update(record).then((result) => {
                assert.isTrue(result);
            });
        });
    })

    describe('.destroy()', () => {
        it('should send primary key value', () => {
            return restful.destroy(1234).then((result) => {
                assert.isTrue(result);
            });
        });
    });

    describe('.query()', () => {
        it('should send query', () => {
            const query = new Query();

            return restful.query(query).then((dataset) => {
                const orders = dataset.getAll();
                assert.strictEqual(orders.getCount(), 1);
                assert.strictEqual(orders.at(0).get('firstName'), 'Ivan');
            });
        });
    });

    describe('.merge()', () => {
        it('should send two keys', () => {
            const from = 'foo';
            const to = 'bar';

            return restful.merge(from, to).then((result) => {
                assert.isTrue(result);
            });
        });
    });

    describe('.copy()', () => {
        it('should copy model', () => {
            return restful.copy(1234).then((copy) => {
                assert.instanceOf(copy, Model);
                assert.equal(copy.get('firstName'), 'Sergey');
            });
        });
    });

    describe('.move()', () => {
        it('should send two keys', () => {
            const from = 'foo';
            const to = 'bar';

            return restful.move(from, to).then((result) => {
                assert.isTrue(result);
            });
        });
    });

    describe('.invoke()', () => {
        it('should send user info', () => {
            const user = {
                firstName: 'Ivan',
                lastName: 'Ivanov'
            }

            return restful.invoke('checkUser', 'POST', user).then((result) => {
                assert.isTrue(result);
            });
        });

        it('should register user', () => {
            const user = {
                id: 1234
            }

            return restful.invoke('register', 'GET', user).then((result) => {
                assert.isTrue(result);
            });
        });
    });
});
