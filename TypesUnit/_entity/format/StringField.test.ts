import {assert} from 'chai';
import StringField from 'Types/_entity/format/StringField';

describe('Types/_entity/format/StringField', () => {
    let field: StringField;

    beforeEach(() => {
        field = new StringField();
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
            assert.instanceOf(clone, StringField);
            assert.isTrue(field.isEqual(clone));
        });
    });
});
