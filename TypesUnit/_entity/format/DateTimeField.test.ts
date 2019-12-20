import {assert} from 'chai';
import DateTimeField from 'Types/_entity/format/DateTimeField';

describe('Types/_entity/format/DateTimeField', () => {
    let field: DateTimeField;

    beforeEach(() => {
        field = new DateTimeField();
    });

    afterEach(() => {
        field = undefined;
    });

    describe('.getDefaultValue()', () => {
        it('should return null by default', () => {
            assert.isNull(field.getDefaultValue());
        });
    });

    describe('.isWithoutTimeZone()', () => {
        it('should return false by default', () => {
            assert.isFalse(field.isWithoutTimeZone());
        });

        it('should return value passed to the constructor', () => {
            const fieldA = new DateTimeField({
                withoutTimeZone: true
            });
            assert.isTrue(fieldA.isWithoutTimeZone());
        });
    });

    describe('.clone()', () => {
        it('should return the clone', () => {
            const clone = field.clone();
            assert.instanceOf(clone, DateTimeField);
            assert.isTrue(field.isEqual(clone));
        });
    });
});
