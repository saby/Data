import { assert } from 'chai';
import jsonReviver, { getReviverWithStorage } from 'Types/_formatter/jsonReviver';
import { register, unregister } from 'Types/di';

class Serializeable {
    instanceId: number;
    constructor() {
        this.instanceId = Serializeable.instancesCount++;
    }
    toJSON(): object {
        return {
            $serialized$: 'inst',
            id: this.instanceId,
            module: 'Serializeable'
        };
    }
    static instancesCount: number = 0;
    static lastValue: unknown;
    static fromJSON<T>(value: T): Serializeable {
        Serializeable.lastValue = value;
        return new Serializeable();
    }
}

describe('Types/_formatter/jsonReviver', () => {
    describe('jsonReviver()', () => {
        it('should deserialize a date by default', () => {
            const date = new Date('1995-12-17T01:02:03');
            const dateStr = date.toJSON();
            const result = jsonReviver('', dateStr) as Date;
            assert.instanceOf(result, Date);
            assert.strictEqual(result.getTime(), date.getTime());
         });

        it('should deserialize Infinity', () => {
            const result = jsonReviver(
                'i',
                jsonReviver('i', Infinity)
            );
            assert.strictEqual(result, Infinity);
        });

        it('should deserialize -Infinity', () => {
            const result = jsonReviver(
                'i',
                jsonReviver('i', -Infinity)
            );
            assert.strictEqual(result, -Infinity);
        });

        it('should deserialize NaN', () => {
            const result = jsonReviver(
                'n',
                jsonReviver('n', NaN)
            );
            assert.isNaN(result);
        });

        it('should deserialize undefined if it\'s an array element', () => {
            const result = jsonReviver(
                'n',
                jsonReviver('n', undefined)
            );
            assert.strictEqual(result, undefined);
        });

        it('should deserialize foreign "func" signature', () => {
            const result = jsonReviver('', {
                $serialized$: 'func',
                module: 'Types/formatter',
                path: 'jsonReviver'
            });
            assert.strictEqual(result, jsonReviver);
        });

        it('should return unchanged', () => {
            assert.strictEqual(
                jsonReviver(
                    'a',
                    undefined
                ),
                undefined
            );

            assert.strictEqual(
                jsonReviver(
                    'a',
                    null
                ),
                null
            );

            assert.strictEqual(
                jsonReviver(
                    'a',
                    1
                ),
                1
            );

            assert.strictEqual(
                jsonReviver(
                    'a',
                    'b'
                ),
                'b'
            );

            const arr = [];
            assert.strictEqual(
                jsonReviver(
                    'a',
                    arr
                ),
                arr
            );

            const obj = {};
            assert.strictEqual(
                jsonReviver(
                    'a',
                    obj
                ),
                obj
            );
        });

        context('when used with JSON.parse() as jsonReviver', () => {
            it('should deserialize NaN using JSON.parse', () => {
                const serialized = '{"$serialized$": "NaN"}';
                const deserialized = JSON.parse(serialized, jsonReviver);
                assert.isNaN(deserialized);
            });

            it('should work properly with deep structures', () => {
                const given = JSON.parse(
                    `{
                        "a":{"$serialized$":"undef"},
                        "b":null,
                        "c":false,
                        "d":0,
                        "e":1,
                        "f":[],
                        "g":[
                            {"$serialized$":"undef"},
                            1,
                            2
                        ],
                        "h":{
                            "ha":{"$serialized$":"undef"},
                            "hb":{"$serialized$":"+inf"},
                            "hc":{"$serialized$":"-inf"}
                        },
                        "j":{"$serialized$":"NaN"}
                    }`,
                    jsonReviver
                );
                const expected = {
                    a: undefined,
                    b: null,
                    c: false,
                    d: 0,
                    e: 1,
                    f: [],
                    g: [undefined, 1, 2],
                    h: {
                        ha: undefined,
                        hb: Infinity,
                        hc: -Infinity
                    },
                    j: NaN
                };

                // 'undefined' is not serializable
                delete expected.a;
                delete expected.h.ha;

                // Chrome doesn't create 'undefined' items even though it has a reserved indices for them
                given.g[0] = undefined;

                assert.notEqual(expected, given);
                assert.deepEqual(expected, given);
            });

            it('should deserialize module registered with di', () => {
                register('Serializeable', Serializeable, {instantiate: false});

                const instance = new Serializeable();
                const serialized = JSON.stringify({foo: instance});
                const deserialized = JSON.parse(serialized, jsonReviver);

                unregister('Serializeable');

                assert.instanceOf(deserialized.foo, Serializeable);
            });

            it('should throw an error if module is not registered with di', () => {
                const instance = new Serializeable();
                const serialized = JSON.stringify({foo: instance});

                assert.throws(() => {
                    JSON.parse(serialized, jsonReviver);
                });
            });

            it('should resolve links', () => {
                register('Serializeable', Serializeable, {instantiate: false});
                const result = JSON.parse(
                    `{
                        "foo": {"$serialized$": "inst", "id": 1, "module": "Serializeable"},
                        "deep": {
                            "bar": {"$serialized$": "link", "id": 1}
                        }
                    }`,
                    jsonReviver
                );
                unregister('Serializeable');

                assert.instanceOf(result.foo, Serializeable);
                assert.strictEqual(result.foo, result.deep.bar);
            });

            it('should pass serialized value to fromJSON method', () => {
                register('Serializeable', Serializeable, {instantiate: false});
                JSON.parse(
                    '{"foo": {"$serialized$": "inst", "id": 0, "module": "Serializeable", "bar": "baz"}}',
                    jsonReviver
                );
                unregister('Serializeable');

                assert.deepEqual(Serializeable.lastValue, {
                    $serialized$: 'inst',
                    id: 0,
                    module: 'Serializeable',
                    bar: 'baz'
                });
            });
        });
    });

    describe('getReviverWithStorage()', () => {
        it('shouldn\'t deserialize a date if resolveDates === false', () => {
            const date = new Date('1995-12-17T01:02:03');
            const dateStr = date.toJSON();
            const result = getReviverWithStorage<String>({resolveDates: false})('', dateStr);
            assert.strictEqual(result, dateStr);
        });

        it('should restore function using storage', () => {
            const foo = () => null;

            const storage: Map<number, Function> = new Map();
            storage.set(1, foo);

            const reviver = getReviverWithStorage<Function>(undefined, storage);
            const result = reviver('', {
                $serialized$: 'function',
                id: 1
            });
            assert.strictEqual(result, foo);
        });
    });
});
