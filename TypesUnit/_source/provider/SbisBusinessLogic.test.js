define(["require", "exports", "chai", "Types/_source/provider/SbisBusinessLogic"], function (require, exports, chai_1, SbisBusinessLogic_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TransportMock = /** @class */ (function () {
        function TransportMock() {
        }
        TransportMock.prototype.callMethod = function (method, args) {
            TransportMock.lastMethod = method;
            TransportMock.lastArgs = args;
        };
        return TransportMock;
    }());
    describe('Types/_source/provider/SbisBusinessLogic', function () {
        describe('.getEndpoint()', function () {
            it('should return endpoint', function () {
                var provider = new SbisBusinessLogic_1.default({
                    endpoint: {
                        address: '/foo',
                        contract: 'bar'
                    }
                });
                chai_1.assert.deepEqual(provider.getEndpoint(), {
                    address: '/foo',
                    contract: 'bar'
                });
            });
        });
        describe('.call()', function () {
            var provider;
            beforeEach(function () {
                provider = new SbisBusinessLogic_1.default({
                    endpoint: {
                        contract: 'foo'
                    },
                    transport: TransportMock
                });
            });
            afterEach(function () {
                provider = null;
            });
            it('should call a method from given object', function () {
                provider.call('bar');
                chai_1.assert.equal(TransportMock.lastMethod, 'foo.bar');
            });
            it('should transfer a valid arguments', function () {
                provider.call('name', { bar: 'baz' });
                chai_1.assert.deepEqual(TransportMock.lastArgs, { bar: 'baz' });
            });
            it('should transfer no arguments as empty object', function () {
                provider.call('name');
                chai_1.assert.deepEqual(TransportMock.lastArgs, {});
            });
            it('should override default object name', function () {
                provider.call('boo.bar');
                chai_1.assert.equal(TransportMock.lastMethod, 'boo.bar');
            });
        });
    });
});
