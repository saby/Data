import {assert} from 'chai';
import Field from 'Types/_entity/format/Field';
import {register} from 'Types/di';

class TestField extends Field {
    protected _moduleName: string = 'TypesUnit/_entity/format/Field.test:TestField';
}
register('TypesUnit/_entity/format/Field.test:TestField', TestField, {instantiate: false});

describe('Types/_entity/format/Field', () => {
    let field: TestField;

    beforeEach(() => {
        field = new TestField();
    });

    afterEach(() => {
        field = undefined;
    });

    describe('.getType()', () => {
        it('should return empty string by default', () => {
            assert.strictEqual(field.getType(), '');
        });

        it('should return the value passed to the constructor', () => {
            const type = 'foo';
            const field = new TestField({type});
            assert.strictEqual(field.getType(), type);
        });
    });

    describe('.getDefaultValue()', () => {
        it('should return null by default', () => {
            assert.isNull(field.getDefaultValue());
        });

        it('should return the value passed to the constructor', () => {
            const defaultValue = 'a';
            const field = new TestField({defaultValue});
            assert.strictEqual(field.getDefaultValue(), defaultValue);
        });
    });

    describe('.setDefaultValue()', () => {
        it('should set the default value', () => {
            const value = 'a';
            field.setDefaultValue(value);
            assert.strictEqual(field.getDefaultValue(), value);
        });
    });

    describe('.getName()', () => {
        it('should return empty string by default', () => {
            assert.strictEqual(field.getName(), '');
        });

        it('should return the value passed to the constructor', () => {
            const name = 'a';
            const field = new TestField({name});
            assert.strictEqual(field.getName(), name);
        });
    });

    describe('.setName()', () => {
        it('should set the name', () => {
            const name = 'a';
            field.setName(name);
            assert.strictEqual(field.getName(), name);
        });
    });

    describe('.isNullable()', () => {
        it('should return true by default', () => {
            assert.isTrue(field.isNullable());
        });

        it('should return the value passed to the constructor', () => {
            const nullable = true;
            const field = new TestField({nullable});
            assert.strictEqual(field.isNullable(), nullable);
        });
    });

    describe('.setNullable()', () => {
        it('should set the nullable option', () => {
            const nullable = true;
            field.setNullable(nullable);
            assert.strictEqual(field.isNullable(), nullable);
        });
    });

    describe('.clone()', () => {
        it('should return the clone', () => {
            const clone: Field = field.clone();
            assert.instanceOf(clone, Field);
            assert.notEqual(field, clone);
            assert.strictEqual(field.getType(), clone.getType());
            assert.strictEqual(field.getName(), clone.getName());
            assert.strictEqual(field.getDefaultValue(), clone.getDefaultValue());
            assert.strictEqual(field.isNullable(), clone.isNullable());
            assert.isTrue(field.isEqual(clone));
        });
    });

    describe('.copyFrom()', () => {
        it('should return the same configured object', () => {
            const name = 'a';
            const defaultValue = 'b';
            const nullable = true;
            const donor = new TestField({
                name,
                defaultValue,
                nullable
            });
            const acceptor = new TestField();
            acceptor.copyFrom(donor);

            assert.strictEqual(donor.getName(), acceptor.getName());
            assert.strictEqual(donor.getDefaultValue(), acceptor.getDefaultValue());
            assert.strictEqual(donor.isNullable(), acceptor.isNullable());
        });
    });

    describe('.isEqual()', () => {
        it('should return true', () => {
            const other = new TestField();
            assert.isTrue(field.isEqual(other));
        });

        it('should return false for different module', () => {
            class Ext extends Field {
                // Nothing
            }

            const other = new Ext();
            assert.isFalse(field.isEqual(other));
        });

        it('should return false for different name', () => {
            const other = new TestField({
                name: 'a'
            });
            assert.isFalse(field.isEqual(other));
        });

        it('should return false for different defaultValue', () => {
            const other = new TestField({
                defaultValue: 'a'
            });
            assert.isFalse(field.isEqual(other));
        });

        it('should return false for different nullable', () => {
            const other = new TestField({
                nullable: false
            });
            assert.isFalse(field.isEqual(other));
        });
    });
});
