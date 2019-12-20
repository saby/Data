import {assert} from 'chai';
import RecordField from 'Types/_entity/format/RecordField';

describe('Types/_entity/format/RecordField', () => {
    let field: RecordField;

    beforeEach(() => {
        field = new RecordField();
    });

    afterEach(() => {
        field = undefined;
    });

    describe('.getType()', () => {
        it('should return "Record" by default', () => {
            assert.strictEqual(field.getType(), 'Record');
        });
    });
});
