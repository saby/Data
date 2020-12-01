import {assert} from 'chai';
import Https from 'Types/_source/provider/Https';

describe('Types/_source/Restful', () => {
    interface fetchOptions {
        body: string
    }

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
                case 'api/bar/destroy?id=1234':
                    resolve(getSuccessResponse(true));
                    return;

                case encodeURI('api/bar/destroy?firstName="Ivan"&lastName="Ivanov"'):
                    resolve(getSuccessResponse(true));
                    return;

                case 'api/bar/update':
                    if (options.body === '{"firstName":"Ivan","lastName":"Ivanov"}') {
                        resolve(getSuccessResponse(true));
                        return;
                    }

                case 'api/bar/customRequest':
                    if (options.body === '{"firstName":"Ivan","lastName":"Ivanov"}') {
                        resolve(getSuccessResponse(true));
                        return;
                    }

                default:
                    reject(`Url "${url}" is undefined`);
            }
        });
    }

    let https;

    beforeEach(() => {
        https = new Https({
            endpoint: {
                address: 'api/bar'
            },
            httpMethodBinding: {
                destroy: 'GET'
            },
            transport: stubFetch as typeof fetch
        });
    });

    describe('.call()', () => {
        it('should send GET request', () => {
            return https.call('destroy', { id: 1234 }).then((result) => {
               assert.isTrue(result);
            });
        });

        it('should send GET request with two parameters', () => {
            return https.call('destroy', {
                firstName: 'Ivan',
                lastName: 'Ivanov'
            }).then((result) => {
                assert.isTrue(result);
            });
        });

        it('should send POST request with two parameters', () => {
            return https.call('update', {
                firstName: 'Ivan',
                lastName: 'Ivanov'
            }).then((result) => {
                assert.isTrue(result);
            });
        });

        it('should send custom request', () => {
            return https.call('customRequest', {
                firstName: 'Ivan',
                lastName: 'Ivanov'
            }, undefined, 'POST').then((result) => {
                assert.isTrue(result);
            });
        })
    });
});
