import {assert} from 'chai';
import TimeIntervalField from 'Types/_entity/format/TimeIntervalField';

describe('Types/_entity/format/TimeIntervalField', () => {
    let field: TimeIntervalField;

    beforeEach(() => {
        field = new TimeIntervalField();
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
            assert.instanceOf(clone, TimeIntervalField);
            assert.isTrue(field.isEqual(clone));
        });
    });
});
