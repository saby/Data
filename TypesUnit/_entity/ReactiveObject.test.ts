import {assert} from 'chai';
import ReactiveObject from 'Types/_entity/ReactiveObject';

describe('Types/_entity/ReactiveObject', () => {
    describe('.constructor()', () => {
        it('should create instance of ReactiveObject', () => {
            const instance = new ReactiveObject({});
            assert.instanceOf(instance, ReactiveObject);
        });
    });

    describe('[key: string]', () => {
        it('should return property value', () => {
            const instance = new ReactiveObject({
                foo: 'bar'
            });
            assert.equal(instance.foo, 'bar');
        });

        it('should update property value', () => {
            const instance = new ReactiveObject({
                foo: 'bar'
            });
            instance.foo = 'baz';
            assert.equal(instance.foo, 'baz');
        });

        it('should invoke callback if property value being updated', () => {
            let given;
            const instance = new ReactiveObject({
                foo: 'bar'
            }, (version: number) => {
                given = version;
            });
            instance.foo = 'baz';
            assert.equal(given, 1);
        });

        it('should return read-only property value', () => {
            const instance = new ReactiveObject({
                get foo(): string {
                    return 'bar';
                }
            });
            assert.equal(instance.foo, 'bar');
        });

        it('should throw an Error on write into read-only property value', () => {
            const instance: any = new ReactiveObject({
                get foo(): string {
                    return 'bar';
                }
            });
            assert.throws(() => {
                instance.foo = 'baz';
            });
        });

        it('should update calculated property value', () => {
            const instance = new ReactiveObject({
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
            const instance = new ReactiveObject<{
                foo?: string;
            }>({});
            instance.foo = 'bar';
            assert.equal(instance.foo, 'bar');
        });
    });

    describe('.getVersion()', () => {
        it('should update version after update property', () => {
            const instance = new ReactiveObject({
                foo: 'bar'
            });
            const initialVersion = instance.getVersion();

            instance.foo = 'baz';
            assert.notEqual(instance.getVersion(), initialVersion);
        });

        it('shouldn\'t update version after set the same property value', () => {
            const instance = new ReactiveObject({
                foo: 'bar'
            });
            const initialVersion = instance.getVersion();

            instance.foo = 'bar';
            assert.equal(instance.getVersion(), initialVersion);
        });

        it('should update version after update calculated property value', () => {
            const instance = new ReactiveObject({
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

        it('shouldn\'t update version after set the same calculated property value', () => {
            const instance = new ReactiveObject({
                get foo(): string {
                    return 'bar';
                },
                set foo(value: string) {
                    // do nothing
                }
            });
            const initialVersion = instance.getVersion();

            instance.foo = 'bar';
            assert.equal(instance.getVersion(), initialVersion);
        });

        it('shouldn\'t update version after update not-reactive property', () => {
            const instance = new ReactiveObject<{
                foo?: string;
            }>({});
            const initialVersion = instance.getVersion();

            instance.foo = 'bar';
            assert.equal(instance.getVersion(), initialVersion);
        });

        it('should update version on nested object update', () => {
            const instance = new ReactiveObject({
                foo: new ReactiveObject({
                    bar: 'baz'
                })
            });
            const initialVersion = instance.getVersion();
            assert.equal(initialVersion, instance.getVersion());

            instance.foo.bar = 'newbie';
            const version = instance.getVersion();
            assert.notEqual(version, initialVersion);
            assert.equal(version, instance.getVersion());

            instance.foo.bar = 'dewbie';
            assert.notEqual(version, instance.getVersion());
        });
    });
});
