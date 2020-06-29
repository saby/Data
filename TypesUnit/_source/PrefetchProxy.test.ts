import {assert} from 'chai';
import {spy} from 'sinon';
import PrefetchProxy from 'Types/_source/PrefetchProxy';
import OptionsMixin from 'Types/_source/OptionsMixin';
import { Query } from 'Types/source';

describe('Types/_source/PrefetchProxy', () => {
    const getTarget = (data) => {
        const Target = (): void => undefined;
        Target.prototype = Object.create(OptionsMixin.prototype);

        Object.assign(Target.prototype, {
            data,
            create(): string {
                this.lastMethod = 'create';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!create';
            },
            read(): string {
                this.lastMethod = 'read';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!read';
            },
            update(): string {
                this.lastMethod = 'update';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!update';
            },
            destroy(): string {
                this.lastMethod = 'destroy';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!destroy';
            },
            query(): string {
                this.lastMethod = 'query';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!query';
            },
            merge(): string {
                this.lastMethod = 'merge';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!merge';
            },
            copy(): string {
                this.lastMethod = 'copy';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!copy';
            },
            move(): string {
                this.lastMethod = 'move';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!move';
            },
            getOrderProperty(): string {
                this.lastMethod = 'getOrderProperty';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!getOrderProperty';
            },
            getOptions(): string {
                this.lastMethod = 'getOptions';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!getOptions';
            },
            setOptions(): string {
                this.lastMethod = 'setOptions';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!setOptions';
            }
        });

        return new Target();
    };

    let targetData: Array<{
        id: number;
    }>;
    let target: any;

    beforeEach(() => {
        targetData = [
            {id: 1},
            {id: 2},
            {id: 3}
        ];

        target = getTarget(targetData);
    });

    afterEach(() => {
        targetData = undefined;
        target = undefined;
    });

    describe('.constructor()', () => {
        it('should throw ReferenceError if target is not specified', () => {
            let source;
            assert.throws(() => {
               source = new PrefetchProxy();
            }, ReferenceError);

            assert.isUndefined(source);
        });
    });

    describe('.getData()', () => {
        it('should return value from "data" option', () => {
            const data = {
                create: {foo: 1} as any,
                read: {bar: 2} as any
            }
            const source = new PrefetchProxy({data, target});

            assert.deepEqual(source.getData(), data);
        });
    });

    describe('.getOriginal()', () => {
        it('should return value from "target" option', () => {
            const source = new PrefetchProxy({
                target
            });

            assert.strictEqual(source.getOriginal(), target);
        });

        it('should unwrap the chain of IDecorator instances', () => {
            const source = new PrefetchProxy({
                target: new PrefetchProxy({target})
            });

            assert.strictEqual(source.getOriginal(), target);
        });
    });

    describe('.create()', () => {
        it('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target
            });
            const args = ['foo'];

            assert.equal(source.create.apply(source, args), '!create');
            assert.equal(target.lastMethod, 'create');
            assert.deepEqual(target.lastArgs, args);
        });
    });

    describe('.read()', () => {
        it('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target
            });
            const args = ['foo', 'bar'];

            assert.equal(source.read.apply(source, args), '!read');
            assert.equal(target.lastMethod, 'read');
            assert.deepEqual(target.lastArgs, args);
        });

        it('should return result from data.read first', () => {
            const expected: any = {foo: 'bar'};
            const source = new PrefetchProxy({
                target,
                data: {
                    read: expected
                }
            });

            return source.read(undefined).then((data) => {
                assert.equal(data, expected);
                assert.equal(source.read(undefined) as any, '!read');
            });
        });

        it('should pass valid arguments to validator', () => {
            const readData = {};
            const data: unknown = {read: readData};
            const validators = {read: (data: unknown, done: unknown, key: unknown, meta: unknown) => true};
            const readSpy = spy(validators, 'read');

            const source = new PrefetchProxy({target, data, validators});
            const entityId = 123;
            const entityMeta = {};

            return source.read(entityId, entityMeta).then((data) => {
                assert.strictEqual(readSpy.callCount, 1);

                const call = readSpy.lastCall;
                assert.strictEqual(call.args[0], readData);
                assert.deepEqual(call.args[1], {});
                assert.strictEqual(call.args[2], entityId);
                assert.strictEqual(call.args[3], entityMeta);
            });
        });

        it('should always return result from data.read', () => {
            const expected: any = {foo: 'bar'};
            const source = new PrefetchProxy({
                target,
                data: {
                    read: expected
                },
                validators: {
                    read: () => true
                }
            });

            return source.read(undefined).then((data) => {
                assert.equal(data, expected);

                return source.read(undefined).then((data) => {
                   assert.equal(data, expected);
                });
            });
        });

        it('should always return result from target', () => {
            const source = new PrefetchProxy({
                target,
                data: {
                    read: {} as any
                },
                validators: {
                    read: () => false
                }
            });

            assert.equal(source.read(undefined) as any, '!read');
            assert.equal(source.read(undefined) as any, '!read');
        });
    });

    describe('.update()', () => {
        it('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target
            });
            const args = ['foo', 'bar'];

            assert.equal(source.update.apply(source, args), '!update');
            assert.equal(target.lastMethod, 'update');
            assert.deepEqual(target.lastArgs, args);
        });
    });

    describe('.destroy()', () => {
        it('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target
            });
            const args = ['foo', 'bar'];

            assert.equal(source.destroy.apply(source, args), '!destroy');
            assert.equal(target.lastMethod, 'destroy');
            assert.deepEqual(target.lastArgs, args);
        });
    });

    describe('.query()', () => {
        it('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target
            });
            const args = ['foo'];

            assert.equal(source.query.apply(source, args), '!query');
            assert.equal(target.lastMethod, 'query');
            assert.deepEqual(target.lastArgs, args);
        });

        it('should return result from data.query first', () => {
            const expected: any = {foo: 'bar'};
            const source = new PrefetchProxy({
                target,
                data: {
                    query: expected
                }
            });

            return source.query(undefined).then((data) => {
                assert.equal(data, expected);

                assert.equal(source.query() as any, '!query');
            });
        });

        it('should pass valid arguments to validator', () => {
            const queryData = {};
            const data: unknown = {query: queryData};
            const validators = {query: (data: unknown, done: unknown, query: unknown) => true};
            const querySpy = spy(validators, 'query');

            const source = new PrefetchProxy({target, data, validators});
            const query = new Query();

            return source.query(query).then((data) => {
                assert.strictEqual(querySpy.callCount, 1);

                const call = querySpy.lastCall;
                assert.strictEqual(call.args[0], queryData);
                assert.deepEqual(call.args[1], {});
                assert.strictEqual(call.args[2], query);
            });
        });

        it('should always return result from data.query', () => {
            const expected: any = {foo: 'bar'};
            const source = new PrefetchProxy({
                target,
                data: {
                    query: expected
                },
                validators: {
                    query: () => true
                }
            });

            return source.query().then((data) => {
                assert.equal(data, expected);

                return source.query().then((data) => {
                   assert.equal(data, expected);
                });
            });
        });

        it('should always return result from target', () => {
            const source = new PrefetchProxy({
                target,
                data: {
                    query: {} as any
                },
                validators: {
                    query: () => false
                }
            });

            assert.equal(source.query() as any, '!query');
            assert.equal(source.query() as any, '!query');
        });
    });

    describe('.merge()', () => {
        it('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target
            });
            const args = ['foo', 'bar'];

            assert.equal(source.merge.apply(source, args), '!merge');
            assert.equal(target.lastMethod, 'merge');
            assert.deepEqual(target.lastArgs, args);
        });
    });

    describe('.copy()', () => {
        it('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target
            });
            const args = ['foo', 'bar'];

            assert.equal(source.copy.apply(source, args), '!copy');
            assert.equal(target.lastMethod, 'copy');
            assert.deepEqual(target.lastArgs, args);
        });

        it('should return result from data.copy first', () => {
            const expected: any = {foo: 'bar'};
            const source = new PrefetchProxy({
                target,
                data: {
                    copy: expected
                }
            });

            return source.copy(undefined).then((data) => {
                assert.equal(data, expected);

                assert.equal(source.copy(undefined) as any, '!copy');
            });
        });

        it('should pass valid arguments to validator', () => {
            const copyData = {};
            const data: unknown = {copy: copyData};
            const validators = {copy: (data: unknown, done: unknown, key: unknown, meta: unknown) => true};
            const copySpy = spy(validators, 'copy');

            const source = new PrefetchProxy({target, data, validators});
            const entityId = 123;
            const entityMeta = {};

            return source.copy(entityId, entityMeta).then((data) => {
                assert.strictEqual(copySpy.callCount, 1);

                const call = copySpy.lastCall;
                assert.strictEqual(call.args[0], copyData);
                assert.deepEqual(call.args[1], {});
                assert.strictEqual(call.args[2], entityId);
                assert.strictEqual(call.args[3], entityMeta);
            });
        });

        it('should always return result from data.copy', () => {
            const expected: any = {foo: 'bar'};
            const source = new PrefetchProxy({
                target,
                data: {
                    copy: expected
                },
                validators: {
                    copy: () => true
                }
            });

            return source.copy(undefined).then((data) => {
                assert.equal(data, expected);

                return source.copy(undefined).then((data) => {
                    assert.equal(data, expected);
                });
            });
        });

        it('should always return result from target', () => {
            const source = new PrefetchProxy({
                target,
                data: {
                    copy: {} as any
                },
                validators: {
                    copy: () => false
                }
            });

            assert.equal(source.copy(undefined) as any, '!copy');
            assert.equal(source.copy(undefined) as any, '!copy');
        });
    });

    describe('.move()', () => {
        it('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target
            });
            const args = ['foo', 'bar', 'baz'];

            assert.equal(source.move.apply(source, args), '!move');
            assert.equal(target.lastMethod, 'move');
            assert.deepEqual(target.lastArgs, args);
        });
    });

    describe('.getOptions()', () => {
        it('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target
            });
            const args = [];

            assert.equal(source.getOptions.apply(source, args), '!getOptions');
            assert.equal(target.lastMethod, 'getOptions');
            assert.deepEqual(target.lastArgs, args);
        });
    });

    describe('.setOptions()', () => {
        it('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target
            });
            const args = ['foor'];

            assert.equal(source.setOptions.apply(source, args), '!setOptions');
            assert.equal(target.lastMethod, 'setOptions');
            assert.deepEqual(target.lastArgs, args);
        });
    });

    describe('.fromJSON()', () => {
        it('should call the same method on clone\'s target if original already called', () => {
            const source = new PrefetchProxy({
                target,
                data: {
                    read: {foo: 'bar'} as any
                }
            });

            const argsA = ['foo', 1];
            source.read.apply(source, argsA);

            const json = source.toJSON();
            const clone = (PrefetchProxy as any).fromJSON(json);

            const argsB = ['bar', 2];
            clone.read.apply(clone, argsB);
            assert.equal(target.lastMethod, 'read');
            assert.deepEqual(target.lastArgs, argsB);
        });
    });
});
