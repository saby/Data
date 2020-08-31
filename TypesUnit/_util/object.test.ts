import {assert} from 'chai';
import {
    clone,
    clonePlain,
    getPropertyValue,
    setPropertyValue,
    extractValue,
    implantValue
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

    describe('extractValue()', () => {
        it('should return initial object for empty path', () => {
            const obj = {};
            assert.strictEqual(extractValue(obj, []), obj);
        });

        it('should return undefined for undefined', () => {
            assert.isUndefined(extractValue('', ['foo']));
        });

        it('should return property value if propery exists in Record-like object', () => {
            const obj = {
                '[Types/_entity/IObject]': true,
                get(name: string): string {
                    return `[${name}]`;
                },
                has(): boolean {
                    return true;
                }
            };

            assert.equal(extractValue(obj, ['foo']), '[foo]');
        });

        it('should return undefined if propery doesn\'t exist in Record-like object', () => {
            const obj = {
                '[Types/_entity/IObject]': true,
                get(name: string): string {
                    return `[${name}]`;
                },
                has(): boolean {
                    return false;
                }
            };

            assert.isUndefined(extractValue(obj, ['foo']));
        });

        it('should return undefined for not exactly Record-like object', () => {
            const obj = {
                get(name: string): string {
                    return `[${name}]`;
                }
            };

            assert.isUndefined(extractValue(obj, ['foo']));
        });

        it('should return property value from object', () => {
            const obj = {foo: 'bar'};
            assert.equal(extractValue(obj, ['foo']), 'bar');
        });

        it('should return property value deep from object', () => {
            const obj = {foo: {bar: 'baz'}};
            assert.equal(extractValue(obj, ['foo', 'bar']), 'baz');
        });

        it('should deal with empty property values while going through', () => {
            assert.isUndefined(extractValue({foo: undefined}, ['foo', 'bar']));
            assert.isUndefined(extractValue({foo: null}, ['foo', 'bar']));
        });

        it('should return value of "_someElseImpossibleValueInsteadOfOptions" property if it is truthly', () => {
            const options = {};
            const obj = {_someElseImpossibleValueInsteadOfOptions: options};
            assert.strictEqual(extractValue(obj, ['_someElseImpossibleValueInsteadOfOptions']), options);
        });

        it('should return owner of "_someElseImpossibleValueInsteadOfOptions" property if it is not truthly', () => {
            const options = null;
            const obj = {_someElseImpossibleValueInsteadOfOptions: options};
            assert.strictEqual(extractValue(obj, ['_someElseImpossibleValueInsteadOfOptions']), obj);
        });

        it('should return undefiend for undefined object property', () => {
            const obj = {};
            assert.isUndefined(extractValue(obj, ['foo']));
        });

        it('should call onElementResolve for each found element in within path', () => {
            const story = [];
            const onElementHandler = (name: string, scope: object) => story.push({name, scope});

            const obj = {foo: {bar: 'baz'}};
            extractValue(obj, ['foo', 'bar'], onElementHandler);

            assert.deepEqual(story, [{
                name: 'foo', scope: obj
            }, {
                name: 'bar', scope: obj.foo
            }]);
        });
    });

    describe('implantValue()', () => {
        it('should return false for not an object', () => {
            assert.isFalse(implantValue(null, [], 'foo'));
        });

        it('should set "undefined property" for empty path', () => {
            const obj = {};
            assert.isTrue(implantValue(obj, [], 'foo'));
            assert.deepEqual(obj, {undefined: 'foo'});
        });

        it('should keep initial object for not exists path', () => {
            const obj = {};
            assert.isFalse(implantValue(obj, ['foo', 'bar'], 'baz'));
            assert.deepEqual(obj, {});
        });

        it('should add not exists property for exists path', () => {
            const obj = {};
            assert.isTrue(implantValue(obj, ['foo'], 'bar'));
            assert.deepEqual(obj, {foo: 'bar'});
        });

        it('should change exists property for exists path', () => {
            const obj = {foo: 1};
            assert.isTrue(implantValue(obj, ['foo'], 2));
            assert.deepEqual(obj, {foo: 2});
        });

        it('should change exists property in deep', () => {
            const obj = {foo: {bar: {baz: null}}};
            assert.isTrue(implantValue(obj, ['foo', 'bar', 'baz'], 'wow!'));
            assert.deepEqual(obj, {foo: {bar: {baz: 'wow!'}}});
        });

        it('should change exists property in Record-like object', () => {
            let lastSet;
            const obj = {
                '[Types/_entity/IObject]': true,
                set(name: string, value: string): void {
                    lastSet = {name, value};
                }
            };
            assert.isTrue(implantValue(obj, ['foo'], 'bar'));

            assert.deepEqual(lastSet, {name: 'foo', value: 'bar'});
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

        it('should save the object key with undefined value by default', () => {
            const obj = {foo: undefined};
            const objClone = clonePlain(obj);

            assert.isUndefined(objClone.foo);
            assert.isTrue(objClone.hasOwnProperty('foo'));
        });

        it('shouldn\'t save the object key with undefined value if keepUndefined is false', () => {
            const obj = {foo: undefined};
            const objClone = clonePlain(obj, {keepUndefined: false});

            assert.isFalse(objClone.hasOwnProperty('foo'));
        });

        it('should save the array entry with undefined value by default', () => {
            const obj = [0, undefined, 1];
            const objClone = clonePlain(obj);

            assert.deepEqual(objClone, [0, undefined, 1]);
        });

        it('should save the array entry with undefined value if keepUndefined is false', () => {
            const obj = [0, undefined, 1];
            const objClone = clonePlain(obj, {keepUndefined: false});

            assert.deepEqual(objClone, [0, undefined, 1]);
        });

        it('should call method clone() if object implements ICloneable by default', () => {
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

            clonePlain(obj);
            assert.isTrue(called);
        });

        it('shouldn\'t call method clone() if object implements ICloneable if processCloneable is false', () => {
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

            clonePlain(obj, {processCloneable: false});
            assert.isFalse(called);
        });

        it('shouldn\'t clone complicated Object', () => {
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
