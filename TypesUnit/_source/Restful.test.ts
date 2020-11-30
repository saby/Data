import {assert} from 'chai';
import {stub} from 'sinon';
import Restful from 'Types/_source/Restful';

describe('Types/_source/Restful', () => {
    function getSuccessResponce(res) {
        return {
            ok: true,
            json: new Promise((resolve) => {
                resolve(res);
            })
        }
    }

    function stubFetch(url: string, options: object): Promise<object> {
        return new Promise((resolve, reject) => {
            switch (url) {
                case 'api/foo/create': {
                    resolve(getSuccessResponce({
                        firstName: ''
                    }));

                    break;
                }

                default: {

                }
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

    it('should create ', () => {
        return restful.create().then((model) => {
            console.log();
        })
    })
});
