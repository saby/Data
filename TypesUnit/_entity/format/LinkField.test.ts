import {assert} from 'chai';
import LinkField from 'Types/_entity/format/LinkField';

describe('Types/_entity/format/LinkField', () => {
    let field: LinkField;

    beforeEach(() => {
        field = new LinkField();
    });

    afterEach(() => {
        field = undefined;
    });

    describe('.getDefaultValue()', () => {
        it('should return 0 by default', () => {
            assert.strictEqual(field.getDefaultValue(), 0);
        });
    });

    describe('.clone()', () => {
        it('should return the clone', () => {
            const clone = field.clone();
            assert.instanceOf(clone, LinkField);
            assert.isTrue(field.isEqual(clone));
        });
    });
});
