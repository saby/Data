import {assert} from 'chai';
import DictionaryField from 'Types/_entity/format/DictionaryField';

describe('Types/_entity/format/DictionaryField', () => {
    let field: DictionaryField;

    beforeEach(() => {
        field = new DictionaryField();
    });

    afterEach(() => {
        field = undefined;
    });

    describe('.getDictionary()', () => {
        it('should return null by default', () => {
            assert.isNull(field.getDictionary());
        });

        it('should return the value passed to the constructor', () => {
            const dict = [];
            const field = new DictionaryField({
                dictionary: dict
            });
            assert.strictEqual(field.getDictionary(), dict);
        });
    });

    describe('.getLocaleDictionary()', () => {
        it('should return null by default', () => {
            assert.isNull(field.getLocaleDictionary());
        });

        it('should return the value passed to the constructor', () => {
            const dict = [];
            const field = new DictionaryField({
                localeDictionary: dict
            });
            assert.strictEqual(field.getLocaleDictionary(), dict);
        });
    });

    describe('.clone()', () => {
        it('should return the clone', () => {
            const clone: DictionaryField = field.clone();
            assert.instanceOf(clone, DictionaryField);
            assert.isTrue(field.isEqual(clone));
            assert.deepEqual(field.getDictionary(), clone.getDictionary());
        });
    });
});
