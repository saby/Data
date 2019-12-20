import {assert} from 'chai';
import MoneyField from 'Types/_entity/format/MoneyField';

describe('Types/_entity/format/MoneyField', () => {
    let field: MoneyField;

    beforeEach(() => {
        field = new MoneyField();
    });

    afterEach(() => {
        field = undefined;
    });

    describe('.getPrecision()', () => {
        it('should return 2 by default', () => {
            assert.strictEqual(field.getPrecision(), 2);
        });
    });

    describe('.isLarge()', () => {
        it('should return false by default', () => {
            assert.isFalse(field.isLarge());
        });

        it('should return the value passed to the constructor', () => {
            const field = new MoneyField({
                large: true
            });
            assert.isTrue(field.isLarge());
        });
    });

    describe('.clone()', () => {
        it('should return the clone', () => {
            const clone = field.clone();
            assert.instanceOf(clone, MoneyField);
            assert.isTrue(field.isEqual(clone));
        });
    });
});
