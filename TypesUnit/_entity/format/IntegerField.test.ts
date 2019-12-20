import {assert} from 'chai';
import IntegerField from 'Types/_entity/format/IntegerField';

describe('Types/_entity/format/IntegerField', () => {
    let field: IntegerField;

    beforeEach(() => {
        field = new IntegerField();
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
            assert.instanceOf(clone, IntegerField);
            assert.isTrue(field.isEqual(clone));
        });
    });
});
