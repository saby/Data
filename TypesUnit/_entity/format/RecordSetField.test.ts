import {assert} from 'chai';
import RecordSetField from 'Types/_entity/format/RecordSetField';

describe('Types/_entity/format/RecordSetField', () => {
    let field: RecordSetField;

    beforeEach(() => {
        field = new RecordSetField();
    });

    afterEach(() => {
        field = undefined;
    });

    describe('.getType()', () => {
        it('should return "RecordSet" by default', () => {
            assert.strictEqual(field.getType(), 'RecordSet');
        });
    });
});
