import {assert} from 'chai';
import jsonReplacer, {getReplacerWithStorage, ISignature, ISpecialSignature} from 'Types/_formatter/jsonReplacer';

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
}

class ComplexObject {
}

describe('Types/_formatter/jsonReplacer', () => {
    describe('jsonReplacer()', () => {
        it('should serialize Infinity', () => {
            const result = jsonReplacer('i', Infinity) as ISignature;
            assert.strictEqual(result.$serialized$, '+inf');
         });

        it('should serialize -Infinity', () => {
            const result = jsonReplacer('i', -Infinity) as ISignature;
            assert.strictEqual(result.$serialized$, '-inf');
        });

        it('should serialize undefined', () => {
            const result = jsonReplacer('u', undefined) as ISignature;
            assert.strictEqual(result.$serialized$, 'undef');
        });

        it('should serialize NaN', () => {
            const result = jsonReplacer('n', NaN) as ISignature;
            assert.strictEqual(result.$serialized$, 'NaN');
        });

        it('should serialize undefined if it\'s an array element', () => {
            const result = jsonReplacer('n', undefined) as ISpecialSignature;
            assert.strictEqual(result.$serialized$, 'undef');
        });

        it('should serialize complex object as undefined', () => {
            const obj = new ComplexObject();
            const result = jsonReplacer('n', obj) as ISpecialSignature;
            assert.isUndefined(result);
        });

        it('should return unchanged', () => {
            assert.strictEqual(jsonReplacer('a', null), null);
            assert.strictEqual(jsonReplacer('a', 1), 1);
            assert.strictEqual(jsonReplacer('a', 'b'), 'b');

            const arr = [];
            assert.strictEqual(jsonReplacer('a', arr), arr);

            const obj = {};
            assert.strictEqual(jsonReplacer('a', obj), obj);
        });

        context('when used with JSON.stringify() as jsonReplacer', () => {
            it('should work properly with deep structures', () => {
                const obj = {
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
                const result = JSON.parse(JSON.stringify(obj, jsonReplacer));

                assert.deepEqual(result, {
                    a: {$serialized$: 'undef'},
                    b: null,
                    c: false,
                    d: 0,
                    e: 1,
                    f:  [],
                    g: [
                        {$serialized$: 'undef'},
                        1,
                        2
                    ],
                    h: {
                        ha: {$serialized$: 'undef'},
                        hb: {$serialized$: '+inf'},
                        hc: {$serialized$: '-inf'}
                    },
                    j: {$serialized$: 'NaN'}
                });
            });

            it('should create link to the origin', () => {
                const foo = new Serializeable();
                const obj = {
                    foo,
                    deep: {
                        foo
                    }
                };
                const result = JSON.parse(JSON.stringify(obj, jsonReplacer));

                assert.deepEqual(result, {
                    foo: {$serialized$: 'inst', id: 0, module: 'Serializeable'},
                    deep: {
                        foo: {$serialized$: 'link', id: 0}
                    }
                });
            });
        });
    });

    describe('getReplacerWithStorage()', () => {
        it('should serialize function if storage is passed', () => {
            const foo = () => null;
            const replacer = getReplacerWithStorage(new Map());
            const result = replacer('', foo) as ISpecialSignature;
            assert.strictEqual(result.$serialized$, 'function');
            assert.strictEqual(result.id, 0);
        });

        it('should fill in functions storage', () => {
            const foo = () => null;
            const storage: Map<number, Function> = new Map();
            const replacer = getReplacerWithStorage(storage);
            replacer('', foo);
            assert.strictEqual(storage.get(0), foo);
        });
    });
 });
