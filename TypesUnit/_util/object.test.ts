import {assert} from 'chai';
import {
    clone,
    clonePlain,
    getPropertyValue,
    setPropertyValue
} from 'Types/_util/object';

describe('Types/_util/object', () => {
    describe('getPropertyValue()', () => {
        it('should return undefined for not an Object', () => {
            const foo = 'bar';
            assert.isUndefined(getPropertyValue(foo, 'foo'));
        });

        it('should return native property value', () => {
            const obj = {
               foo: 'bar'
            };

            assert.equal(getPropertyValue(obj, 'foo'), 'bar');
        });

        it('should return property from IObject getter', () => {
            const obj = {
                '[Types/_entity/IObject]': true,
                has(name: string): boolean {
                    return name === 'foo';
                },
                get(name: string): string {
                    return name === 'foo' ? 'bar' : undefined;
                }
            };

            assert.equal(getPropertyValue(obj, 'foo'), 'bar');
        });

        it('should return property from name-like getter', () => {
            const obj = {
               getFoo(): string {
                  return 'bar';
               }
            };

            assert.equal(getPropertyValue(obj, 'foo'), 'bar');
        });
    });

    describe('setPropertyValue()', () => {
        it('should throw a TypeError for not an Object', () => {
            const foo = 'bar';

            assert.throws(() => {
                setPropertyValue(foo, 'foo', undefined);
            }, TypeError);
        });

        it('should set native property value', () => {
            const obj = {
                foo: 'bar'
            };

            setPropertyValue(obj, 'foo', 'baz');
            assert.equal(obj.foo, 'baz');
        });

        it('should set property via IObject setter', () => {
            const obj = {
                '[Types/_entity/IObject]': true,
                _foo: undefined,
                has(name: string): boolean {
                    return name === 'foo';
                },
                set(name: string, value: unknown): void {
                    this['_' + name] = value;
                }
            };

            setPropertyValue(obj, 'foo', 'bar');
            assert.equal(obj._foo, 'bar');
        });

        it('should set property via name-like getter', () => {
            const obj = {
                _foo: undefined,
                setFoo(value: unknown): void {
                   this._foo = value;
                }
            };

            setPropertyValue(obj, 'foo', 'bar');
            assert.equal(obj._foo, 'bar');
        });
    });

    describe('clone()', () => {
        it('should return passed value for not an Object', () => {
            assert.equal(clone('foo'), 'foo');
        });

        it('should clone plain Object', () => {
            const obj = {
                foo: 'bar',
                baz: 'vax'
            };

            assert.notEqual(clone(obj), obj);
            assert.deepEqual(clone(obj), obj);
        });

        it('should clone using ICloneable method', () => {
            const obj = {
                '[Types/_entity/ICloneable]': true,
                clone(): unknown {
                    return [this];
                }
            };

            assert.strictEqual(clone(obj)[0], obj);
        });
    });

    describe('clonePlain()', () => {
        it('should return passed value for not an Object', () => {
            assert.equal(clonePlain('foo'), 'foo');
        });

        it('should clone plain Object', () => {
            const obj = {
                foo: 'bar',
                baz: 'vax'
            };

            assert.notEqual(clonePlain(obj), obj);
            assert.deepEqual(clonePlain(obj), obj);
        });

        it('should call method clone() if object implements ICloneable', () => {
            let called = false;

            class Foo {
                ['[Types/_entity/ICloneable]']: boolean = true;
                clone(): void {
                    called = true;
                }
            }

            const obj = {
               foo: new Foo()
            };

            clonePlain(obj, true);
            assert.isTrue(called);
        });

        it('should don\'t clone complicated Object', () => {
            const Foo = () => {
                // I'm dummy
            };
            Foo.prototype = Object.create(Object.prototype);
            Foo.prototype.constructor = Foo;

            const foo = new Foo();
            const obj = {foo};

            assert.strictEqual(clonePlain(obj).foo, foo);
        });

        it('should worl well with circular objects', () => {
           const objA = {foo: 'bar', b: undefined};
           const objB = {a: objA};
           objA.b = objB;

           const cloneA = clonePlain(objA);
           assert.equal(cloneA.foo, 'bar');
           assert.deepEqual(cloneA.b, objB);
        });
    });
});
