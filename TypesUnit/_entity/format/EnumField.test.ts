import {assert} from 'chai';
import EnumField from 'Types/_entity/format/EnumField';

describe('Types/_entity/format/EnumField', () => {
    let field: EnumField;

    beforeEach(() => {
        field = new EnumField();
    });

    afterEach(() => {
        field = undefined;
    });

    describe('.getType()', () => {
        it('should return "Enum" by default', () => {
            assert.strictEqual(field.getType(), 'Enum');
        });
    });
});
