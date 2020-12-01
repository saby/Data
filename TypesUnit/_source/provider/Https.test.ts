import {assert} from 'chai';
import Https from 'Types/_source/provider/Https';

describe('Types/_source/provider/Https', () => {
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
                case 'api/bar/get':
                    resolve(getSuccessResponse(Object.keys(options).length === 1 && options.hasOwnProperty('method')));
                    return;

                case 'api/bar/post':
                    resolve(getSuccessResponse(Object.keys(options).length === 2 &&
                        options.hasOwnProperty('method') &&
                        options.hasOwnProperty('body')));
                    return;

                case 'api/bar/destroy?id=1234':
                    resolve(getSuccessResponse(true));
                    return;

                case encodeURI('api/bar/destroy?firstName=Ivan&lastName=Ivanov'):
                    resolve(getSuccessResponse(true));
                    return;

                case 'api/bar/update':
                    resolve(getSuccessResponse(options.body === '{"firstName":"Ivan","lastName":"Ivanov"}'));
                    return;

                case 'api/bar/customRequest':
                    resolve(getSuccessResponse(options.body === '{"firstName":"Ivan","lastName":"Ivanov"}'));
                    return;

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

    it('transport options should have only method for GET request', () => {
        return https.call('get', null, null, 'GET').then((result) => {
            assert.isTrue(result);
        });
    });

    it('transport options should have method and body for POST request', () => {
        return https.call('post', {}, null, 'POST').then((result) => {
            assert.isTrue(result);
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
