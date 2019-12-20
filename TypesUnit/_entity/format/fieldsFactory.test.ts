import {assert} from 'chai';
import {
    fieldsFactory,
    ArrayField,
    BinaryField,
    BooleanField,
    DateField,
    DateTimeField,
    EnumField,
    FlagsField,
    IdentityField,
    IntegerField,
    LinkField,
    ObjectField,
    RealField,
    RecordField,
    RecordSetField,
    RpcFileField,
    MoneyField,
    StringField,
    UuidField,
    TimeField,
    TimeIntervalField,
    XmlField
} from 'Types/_entity/format';
import RecordSet from 'Types/_collection/RecordSet';
import Record from 'Types/_entity/Record';
import Enum from 'Types/_collection/Enum';
import Flags from 'Types/_collection/Flags';

describe('Types/_entity/format/FieldsFactory', () => {
    it('should throw an error if not simple object passed', () => {
        assert.throws(() => {
            fieldsFactory(undefined);
        });
        assert.throws(() => {
            fieldsFactory(null);
        });
        assert.throws(() => {
            fieldsFactory(false as any);
        });
        assert.throws(() => {
            fieldsFactory(true as any);
        });
        assert.throws(() => {
            fieldsFactory(0 as any);
        });
        assert.throws(() => {
            fieldsFactory(1 as any);
        });
        assert.throws(() => {
            fieldsFactory('' as any);
        });
        assert.throws(() => {
            fieldsFactory([] as any);
        });
    });

    it('should throw an error for unknown type', () => {
        assert.throws(() => {
            fieldsFactory({
                name: 'foo',
                type: 'a'
            });
        });
    });

    it('should create boolean', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'boolean'
        });
        assert.instanceOf(field, BooleanField);
    });

    it('should create integer', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'integer'
        });
        assert.instanceOf(field, IntegerField);
    });

    it('should create real from string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'real'
        });
        assert.instanceOf(field, RealField);
    });

    it('should create real from constructor', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: Number
        });
        assert.instanceOf(field, RealField);
    });

    it('should create money', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'money'
        });
        assert.instanceOf(field, MoneyField);
    });

    it('should create string from string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'string'
        });
        assert.instanceOf(field, StringField);
    });

    it('should create string from constructor', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: String
        });
        assert.instanceOf(field, StringField);
    });

    it('should create deprecated text as string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'text'
        });
        assert.instanceOf(field, StringField);
    });

    it('should create xml', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'xml'
        });
        assert.instanceOf(field, XmlField);
    });

    it('should create datetime', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'datetime'
        });
        assert.instanceOf(field, DateTimeField);
    });

    it('should create date from string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'date'
        });
        assert.instanceOf(field, DateField);
    });

    it('should create date from constructor', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: Date
        });
        assert.instanceOf(field, DateField);
    });

    it('should create time', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'time'
        });
        assert.instanceOf(field, TimeField);
    });

    it('should create timeinterval', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'timeinterval'
        });
        assert.instanceOf(field, TimeIntervalField);
    });

    it('should create link', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'link'
        });
        assert.instanceOf(field, LinkField);
    });

    it('should create identity', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'identity'
        });
        assert.instanceOf(field, IdentityField);
    });

    it('should create enum from string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'enum'
        });
        assert.instanceOf(field, EnumField);
    });

    it('should create enum from constructor', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: Enum
        });
        assert.instanceOf(field, EnumField);
    });

    it('should create enum from alias', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'Types/collection:Enum'
        });
        assert.instanceOf(field, EnumField);
    });

    it('should create flags from string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'flags'
        });
        assert.instanceOf(field, FlagsField);
    });

    it('should create flags from constructor', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: Flags
        });
        assert.instanceOf(field, FlagsField);
    });

    it('should create record from string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'record'
        });
        assert.instanceOf(field, RecordField);
    });

    it('should create record from constructor', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: Record
        });
        assert.instanceOf(field, RecordField);
    });

    it('should create recordset from string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'recordset'
        });
        assert.instanceOf(field, RecordSetField);
    });

    it('should create recordset from constructor', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: RecordSet
        });
        assert.instanceOf(field, RecordSetField);
    });

    it('should create binary', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'binary'
        });
        assert.instanceOf(field, BinaryField);
    });

    it('should create uuid', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'uuid'
        });
        assert.instanceOf(field, UuidField);
    });

    it('should create rpcfile', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'rpcfile'
        });
        assert.instanceOf(field, RpcFileField);
    });

    it('should create deprecated hierarchy as identity', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'hierarchy'
        });
        assert.instanceOf(field, IdentityField);
    });

    it('should create object from string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'object'
        });
        assert.instanceOf(field, ObjectField);
    });

    it('should create object from constructor', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: Object
        });
        assert.instanceOf(field, ObjectField);
    });

    it('should create array from string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'array'
        });
        assert.instanceOf(field, ArrayField);
    });

    it('should create array from constructor', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: Array
        });
        assert.instanceOf(field, ArrayField);
    });
});
