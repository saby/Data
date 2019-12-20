import {assert} from 'chai';
import RealField from 'Types/_entity/format/RealField';

describe('Types/_entity/format/RealField', () => {
    let field: RealField;

    beforeEach(() => {
        field = new RealField();
    });

    afterEach(() => {
        field = undefined;
    });

    describe('.getDefaultValue()', () => {
        it('should return 0 by default', () => {
            assert.strictEqual(field.getDefaultValue(), 0);
        });
    });

    describe('.getPrecision()', () => {
        it('should return 16 by default', () => {
            assert.strictEqual(field.getPrecision(), 16);
        });
        it('should return the value passed to the constructor', () => {
            const prec = 3;
            const field = new RealField({
                precision: prec
            });
            assert.strictEqual(field.getPrecision(), prec);
        });
    });

    describe('.setPrecision()', () => {
        it('should set the default value', () => {
            const prec = 2;
            field.setPrecision(prec);
            assert.strictEqual(field.getPrecision(), prec);
        });
    });

    describe('.clone()', () => {
        it('should return the clone', () => {
            const clone = field.clone<RealField>();
            assert.instanceOf(clone, RealField);
            assert.isTrue(field.isEqual(clone));
            assert.strictEqual(field.getPrecision(), clone.getPrecision());
        });
    });
});
