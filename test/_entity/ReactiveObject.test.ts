import {assert} from 'chai';
import ReactiveObject from 'Types/_entity/ReactiveObject';

describe('Types/_entity/ReactiveObject', () => {
    describe('.constructor()', () => {
        it('should create instance of ReactiveObject', () => {
            const instance = ReactiveObject.create({});
            assert.instanceOf(instance, ReactiveObject);
        });
    });

    describe('[key: string]', () => {
        it('should return property value', () => {
            const instance = ReactiveObject.create({
                foo: 'bar'
            });
            assert.equal(instance.foo, 'bar');
        });

        it('should update property value', () => {
            const instance = ReactiveObject.create({
                foo: 'bar'
            });
            instance.foo = 'baz';
            assert.equal(instance.foo, 'baz');
        });

        it('should return read-only property value', () => {
            const instance = ReactiveObject.create({
                get foo(): string {
                    return 'bar';
                }
            });
            assert.equal(instance.foo, 'bar');
        });

        it('should throw an Error on write into read-only property value', () => {
            const instance = ReactiveObject.create({
                get foo(): string {
                    return 'bar';
                }
            });
            assert.throws(() => {
                // @ts-ignore TS knows that it's read only
                instance.foo = 'baz';
            });
        });

        it('should update calculated property value', () => {
            const instance = ReactiveObject.create({
                email: 'foo@bar.com',
                get domain(): string {
                    return this.email.split('@')[1];
                },
                set domain(value: string) {
                    const parts = this.email.split('@');
                    parts[1] = value;
                    this.email = parts.join('@');
                }
            });
            assert.equal(instance.domain, 'bar.com');
            instance.domain = 'bar.org';
            assert.equal(instance.domain, 'bar.org');
            assert.equal(instance.email, 'foo@bar.org');
        });

        it('should update not-reactive property value', () => {
            const instance = ReactiveObject.create<any>({});
            instance.foo = 'bar';
            assert.equal(instance.foo, 'bar');
        });
    });

    describe('.getVersion()', () => {
        it('should update version after update property', () => {
            const instance = ReactiveObject.create({
                foo: 'bar'
            });
            const initialVersion = instance.getVersion();

            instance.foo = 'baz';
            assert.notEqual(instance.getVersion(), initialVersion);
        });

        it('should update version after update calculated property value', () => {
            const instance = ReactiveObject.create({
                get foo(): string {
                    return 'bar';
                },
                set foo(value: string) {
                    // do nothing
                }
            });
            const initialVersion = instance.getVersion();
            instance.foo = 'baz';
            assert.notEqual(instance.getVersion(), initialVersion);
        });

        it('shouldn\'t update version after update not-reactive property', () => {
            const instance = ReactiveObject.create<any>({});
            const initialVersion = instance.getVersion();

            instance.foo = 'bar';
            assert.equal(instance.getVersion(), initialVersion);
        });
    });
});
