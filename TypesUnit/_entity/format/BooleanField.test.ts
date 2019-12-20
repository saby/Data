import {assert} from 'chai';
import BooleanField from 'Types/_entity/format/BooleanField';

describe('Types/_entity/format/BooleanField', () => {
    let field: BooleanField;

    beforeEach(() => {
        field = new BooleanField();
    });

    afterEach(() => {
        field = undefined;
    });

    describe('.getDefaultValue()', () => {
        it('should return null by default', () => {
            assert.isNull(field.getDefaultValue());
        });
    });

    describe('.clone()', () => {
        it('should return the clone', () => {
            const clone = field.clone();
            assert.instanceOf(clone, BooleanField);
            assert.isTrue(field.isEqual(clone));
        });
    });
});
