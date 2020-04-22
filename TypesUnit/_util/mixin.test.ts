import {assert} from 'chai';
import {applyMixins} from 'Types/_util/mixin';

describe('Types/_util/mixin', () => {
    describe('applyMixins()', () => {
        it('should inherit static members', () => {
            interface IBarMixinContructor {
                propA: string;
                methodA(): string;
            }

            class Foo {}

            class BarMixin {
                static propA: string = 'a';
                static methodA(): string {
                    return 'b';
                }
            }

            applyMixins(Foo, BarMixin);

            assert.isTrue(Foo.hasOwnProperty('propA'));
            assert.strictEqual((Foo as unknown as IBarMixinContructor).propA, BarMixin.propA);

            assert.isTrue(Foo.hasOwnProperty('methodA'));
            assert.strictEqual((Foo as unknown as IBarMixinContructor).methodA, BarMixin.methodA);
        });

        it('shouldn\'t inherit static method toJSON', () => {
            class Foo {}
            class BarMixin {
                static toJSON(): unknown {
                    return {};
                }
            }

            applyMixins(Foo, BarMixin);
            assert.isFalse(Foo.hasOwnProperty('toJSON'));
        });

        it('should inherit dynamic members', () => {
            class BarMixin {
                propA: string = 'a';
                methodA(): string {
                    return 'b';
                }
            }

            class Foo {
                constructor() {
                    BarMixin.call(this);
                }
            }

            applyMixins(Foo, BarMixin);

            const foo = new Foo() as BarMixin;

            assert.strictEqual(foo.propA, 'a');

            assert.isTrue(Foo.prototype.hasOwnProperty('methodA'));
            assert.strictEqual(foo.methodA, BarMixin.prototype.methodA);
        });
    });
});
