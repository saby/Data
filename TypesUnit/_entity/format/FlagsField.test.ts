import {assert} from 'chai';
import FlagsField from 'Types/_entity/format/FlagsField';

describe('Types/_entity/format/FlagsField', () => {
    let field: FlagsField;

    beforeEach(() => {
        field = new FlagsField();
    });

    afterEach(() => {
        field = undefined;
    });

    describe('.getType()', () => {
        it('should return "Flags" by default', () => {
            assert.strictEqual(field.getType(), 'Flags');
        });
    });
});
