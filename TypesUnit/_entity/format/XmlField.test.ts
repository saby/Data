import {assert} from 'chai';
import XmlField from 'Types/_entity/format/XmlField';

describe('Types/_entity/format/XmlField', () => {
    let field: XmlField;

    beforeEach(() => {
        field = new XmlField();
    });

    afterEach(() => {
        field = undefined;
    });

    describe('.getDefaultValue()', () => {
        it('should return an empty string by default', () => {
            assert.strictEqual(field.getDefaultValue(), '');
        });
    });

    describe('.clone()', () => {
        it('should return the clone', () => {
            const clone = field.clone();
            assert.instanceOf(clone, XmlField);
            assert.isTrue(field.isEqual(clone));
        });
    });
});
