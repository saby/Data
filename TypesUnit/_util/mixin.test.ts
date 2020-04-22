import {assert} from 'chai';
import {applyMixins} from 'Types/_util/mixin';

describe('Types/_util/mixin', () => {
    describe('applyMixins()', () => {
        it('should\'t inherit static method toJSON', () => {
            class Foo {}
            class BarMixin {
                static toJSON(): unknown {
                    return {};
                }
            }

            applyMixins(Foo, BarMixin);
            assert.isFalse(Foo.hasOwnProperty('toJSON'));
        });
    });
});
