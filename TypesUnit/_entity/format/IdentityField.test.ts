import {assert} from 'chai';
import IdentityField from 'Types/_entity/format/IdentityField';

describe('Types/_entity/format/IdentityField', () => {
    let field: IdentityField;

    beforeEach(() => {
        field = new IdentityField();
    });

    afterEach(() => {
        field = undefined;
    });

    describe('.getDefaultValue()', () => {
        it('should return 0 by default', () => {
            assert.deepEqual(field.getDefaultValue(), [null]);
        });
    });

    describe('.clone()', () => {
        it('should return the clone', () => {
            const clone = field.clone();
            assert.instanceOf(clone, IdentityField);
            assert.isTrue(field.isEqual(clone));
        });
    });
});
