import {assert} from 'chai';
import {stub, SinonStub} from 'sinon';
import {cast, serialize} from 'Types/_entity/factory';
import {
    ArrayField,
    DateTimeField,
    DictionaryField,
    EnumField,
    Field,
    FlagsField,
    MoneyField,
    RealField,
    UniversalField
} from 'Types/_entity/format';
import JsonAdapter from 'Types/_entity/adapter/Json';
import Model from 'Types/_entity/Model';
import TheDate from 'Types/_entity/applied/Date';
import Time from 'Types/_entity/applied/Time';
import DateTime from 'Types/_entity/applied/DateTime';
import TimeInterval from 'Types/_entity/applied/TimeInterval';
import Enum from 'Types/_collection/Enum';
import Flags from 'Types/_collection/Flags';
import List from 'Types/_collection/List';
import RecordSet from 'Types/_collection/RecordSet';
import dateToSql, {MODE} from 'Types/_formatter/dateToSql';

interface IStubbedDate extends Date {
    tzoStub?: SinonStub;
}

function getFormatMock(type: string): Field {
    const format = {
        getType(): string {
         return type;
        }
    };
    return format as Field;
}

function getUniversalFormatMock(type: string): UniversalField {
    return {type} as UniversalField;
}

function patchTzo(date: IStubbedDate, offset: number): void {
    date.tzoStub = stub(date, 'getTimezoneOffset');
    date.tzoStub.returns(offset);
}

function revertTzo(date: IStubbedDate): void {
    date.tzoStub.restore();
    delete date.tzoStub;
}

describe('Types/_entity/factory', () => {
    describe('.cast()', () => {
        context('for integer', () => {
            it('should return a Number', () => {
                assert.strictEqual(cast(1, 'integer'), 1);
                assert.strictEqual(cast('1', 'integer'), 1);
                assert.strictEqual(cast('1a', 'integer'), 1);
                assert.strictEqual(cast('0890', 'integer'), 890);
            });

            it('should return null', () => {
                assert.strictEqual(cast('a', 'integer'), null);
                assert.strictEqual(cast('a1', 'integer'), null);
            });

            it('should return passed value', () => {
                assert.isNull(cast(null, 'integer'));
                assert.isUndefined(cast(undefined, 'integer'));
            });
        });

        context('for string', () => {
            it('should return passed value', () => {
                assert.strictEqual(cast('bar', 'string'), 'bar');
                assert.strictEqual(cast(1, 'string'), 1);
                assert.isNull(cast(null, 'string'));
                assert.isUndefined(cast(undefined, 'string'));
            });
        });

        context('for link', () => {
            it('should return a Number', () => {
                assert.strictEqual(cast(1, 'link'), 1);
                assert.strictEqual(cast('1', 'link'), 1);
                assert.strictEqual(cast('1a', 'link'), 1);
                assert.strictEqual(cast('0890', 'link'), 890);
            });

            it('should return null', () => {
                assert.strictEqual(cast('a', 'link'), null);
                assert.strictEqual(cast('a1', 'link'), null);
            });

            it('should return passed value', () => {
                assert.isNull(cast(null, 'integer'));
                assert.isUndefined(cast(undefined, 'link'));
            });
        });

        context('for real and double', () => {
            it('should return a Number', () => {
                assert.strictEqual(cast(1.2, 'real'), 1.2);
                assert.strictEqual(cast('1.2', 'real'), 1.2);
                assert.strictEqual(cast('1a', 'real'), 1);
                assert.strictEqual(cast('0890', 'real'), 890);
            });

            it('should return null', () => {
                assert.strictEqual(cast('a', 'real'), null);
                assert.strictEqual(cast('a1', 'real'), null);
            });

            it('should return passed value', () => {
                assert.isNull(cast(null, 'real'));
                assert.isUndefined(cast(undefined, 'real'));
            });
        });

        context('for money', () => {
            it('should return a Number', () => {
                assert.strictEqual(
                    cast(1.2, 'money'),
                    1.2
                );
            });

            it('should return passed value', () => {
                assert.strictEqual(cast('1.2', 'money'), '1.2');
                assert.strictEqual(cast('0890', 'money'), '0890');
                assert.strictEqual(cast('1a', 'money'), '1a');
                assert.strictEqual(cast('a', 'money'), 'a');
                assert.strictEqual(cast('a1', 'money'), 'a1');

                assert.isNull(cast(null, 'money'));
                assert.isUndefined(cast(undefined, 'money'));
            });

            it('should return passed value if precision less or equal 3 ', () => {
                const format = getFormatMock('money') as RealField;
                format.getPrecision = () => 3;

                assert.strictEqual(
                    cast(1.2, format.getType(), {format}),
                    1.2
                );
            });

            it('should return formatted value if precision more then 3 ', () => {
                const format = getFormatMock('money') as RealField;
                format.getPrecision = () => 4;

                assert.strictEqual(
                    cast(1.2, format.getType(), {format}),
                    '1.2000'
                );
            });

            it('should return passed value if "large" flag is enabled ', () => {
                const format = getFormatMock('money') as MoneyField;
                format.isLarge = () => true;

                assert.strictEqual(
                    cast('1.2', format.getType(), {format}),
                    '1.2'
                );
            });
        });

        context('for datetime, date and time', () => {
            it('should return special DateTime instance', () => {
                const datetime = '2015-09-24 15:54:28.981+03';
                const value: DateTime = cast(datetime, 'datetime');

                assert.instanceOf(value, DateTime);
                assert.strictEqual(value.getTime(), 1443099268981);
            });

            it('should return special Date instance', () => {
                const date = '2015-09-24';
                const value: TheDate = cast(date, 'date');

                assert.instanceOf(value, TheDate);
                assert.strictEqual(value.getTime(), 1443042000000);
            });

            it('should return special Time instance', () => {
                const time = '15:54:28.981+03';
                const value: Time = cast(time, 'time');

                assert.instanceOf(value, Time);
                assert.strictEqual(value.getHours(), 15);
                assert.strictEqual(value.getMinutes(), 54);
                assert.strictEqual(value.getSeconds(), 28);
                assert.strictEqual(value.getMilliseconds(), 981);
                assert.strictEqual(value.getTimezoneOffset(), -180);
            });

            it('should return Infinity', () => {
                const time = 'infinity';
                const value = cast(time, 'date');

                assert.strictEqual(value, Infinity);
            });

            it('should return -Infinity', () => {
                const time = '-infinity';
                const value = cast(time, 'date');

                assert.strictEqual(value, -Infinity);
            });

            it('should return passed value', () => {
                const value = new Date();

                assert.strictEqual(cast(value, 'datetime'), value);
                assert.isNull(cast(null, 'datetime'));
                assert.isUndefined(cast(undefined, 'datetime'));
            });
        });

        context('for timeinterval', () => {
            it('should return a String', () => {
                const interval = new TimeInterval('P10DT0H0M0S');
                assert.strictEqual(cast(interval, 'timeinterval'), 'P10DT0H0M0S');
            });

            it('should return passed value', () => {
                assert.strictEqual(cast('P10DT0H0M0S', 'timeinterval'), 'P10DT0H0M0S');
                assert.isNull(cast(null, 'timeinterval'));
                assert.isUndefined(cast(undefined, 'timeinterval'));
            });
        });

        context('for array', () => {
            it('should return an Array of String from Field', () => {
                const format = getFormatMock('array') as ArrayField;
                format.getKind = () => 'string';
                const array = ['foo', 'bar'];

                assert.deepEqual(
                    cast(array, format.getType(), {format}),
                    ['foo', 'bar']
                );
            });

            it('should return an Array of Number from UniversalField', () => {
                const format = getUniversalFormatMock('array');
                format.meta = {kind: 'integer'};
                const array = ['1', '2a', 3];

                assert.deepEqual(
                    cast(array, format.type, {format}),
                    [1, 2, 3]
                );
            });

            it('should cast elements type to string', () => {
                const format = getFormatMock('array') as ArrayField;
                format.getKind = () => 'string';
                const array = ['1', 2, '3', null];

                assert.deepEqual(
                    cast(array, format.getType(), {format}),
                    ['1', '2', '3', null]
                );
            });

            it('should return an Array from scalar', () => {
                const format = getFormatMock('array') as ArrayField;
                format.getKind = () => 'string';

                assert.deepEqual(
                    cast('foo', format.getType(), {format}),
                    ['foo']
                );
            });

            it('should return passed value', () => {
                const format = getFormatMock('array') as ArrayField;
                format.getKind = () => 'string';

                assert.isNull(cast(null, format.getType(), {format}));
                assert.isUndefined(cast(undefined, format.getType(), {format}));
            });
        });

        context('for identity', () => {
            it('should return same value for Identity', () => {
                const value = ['bar'];
                assert.strictEqual(cast(value, 'identity'), value);
                assert.isNull(cast(null, 'identity'));
            });

            it('should return null', () => {
                assert.isNull(cast(null, 'identity'));
            });
        });

        context('for hierarchy', () => {
            it('should return passed value', () => {
                assert.strictEqual(cast('bar', 'hierarchy'), 'bar');
                assert.strictEqual(cast(1, 'hierarchy'), 1);
                assert.isNull(cast(null, 'hierarchy'));
                assert.isUndefined(cast(undefined, 'hierarchy'));
            });
        });

        context('for enum', () => {
            it('should return an Enum from Field', () => {
                const format = getFormatMock('enum') as DictionaryField;
                format.getDictionary = () => ['one', 'two'];

                const value: Enum<string> = cast(1, Enum, {format});
                assert.instanceOf(value, Enum);
                assert.strictEqual(value.get(), 1);
            });

            it('should return an Enum for null if dictionary contains null', () => {
                const format = new EnumField({
                    dictionary: {null: 'null', 0: 'one', 1: 'two'}
                });

                const value: Enum<string> = cast(null, Enum, {format});
                assert.instanceOf(value, Enum);
                assert.strictEqual(value.get(), null);
                assert.strictEqual(value.getAsValue(), 'null');
            });

            it('should return null for null if dictionary don\'t contains null', () => {
                const format = getFormatMock('enum') as EnumField;
                format.getDictionary = () => ({0: 'one', 1: 'two'});

                const value = cast(null, Enum, {format});
                assert.isNull(value);
            });

            it('should return an Enum from UniversalField', () => {
                const format = getUniversalFormatMock('enum');
                format.meta = {
                    dictionary: ['one', 'two']
                };

                const value: Enum<string> = cast(1, Enum, {format});
                assert.instanceOf(value, Enum);
                assert.strictEqual(value.get(), 1);
            });

            it('should return an Enum from UniversalField', () => {
                const format = getUniversalFormatMock('enum');
                format.meta = {
                    dictionary: ['one', 'two']
                };

                const value: Enum<string> = cast(1, Enum, {format});
                assert.instanceOf(value, Enum);
                assert.strictEqual(value.get(), 1);
            });

            it('should return an Enum from shortcut', () => {
                const format = getFormatMock('enum') as EnumField;
                format.getDictionary = () => [];

                const value = cast(1, 'enum', {format});
                assert.instanceOf(value, Enum);
            });

            it('should return same instance for Enum', () => {
                const value = new Enum();

                assert.strictEqual(
                    cast(value, Enum),
                    value
                );
            });

            it('should return passed value', () => {
                const format = getFormatMock('enum');
                assert.isNull(cast(null, Enum, {format}));
                assert.isUndefined(cast(undefined, Enum, {format}));
            });
        });

        context('for flags', () => {
            it('should return a Flags from Field', () => {
                const format = getFormatMock('flags') as EnumField;
                format.getDictionary = () => ['one', 'two', 'three'];

                const value: Flags<string> = cast([true, null, false], Flags, {format});
                assert.instanceOf(value, Flags);
                assert.isTrue(value.get('one'));
                assert.isNull(value.get('two'));
                assert.isFalse(value.get('three'));
                assert.isUndefined(value.get('four'));
            });

            it('should return a Flags from UniversalField', () => {
                const format = getUniversalFormatMock('flags');
                format.meta = {
                    dictionary: ['one', 'two', 'three']
                };

                const value: Flags<string> = cast([true, null, false], Flags, {format});
                assert.instanceOf(value, Flags);
                assert.isTrue(value.get('one'));
                assert.isNull(value.get('two'));
                assert.isFalse(value.get('three'));
                assert.isUndefined(value.get('four'));
            });

            it('should return a Flags from shortcut', () => {
                const format = getFormatMock('flags') as FlagsField;
                format.getDictionary = () => [];

                const value = cast([true, null, false], 'flags', {format});
                assert.instanceOf(value, Flags);
            });

            it('should return same instance for Flags', () => {
                const value = new Flags();

                assert.strictEqual(
                    cast(value, Flags),
                    value
                );
            });

            it('should return passed value', () => {
                const format = getFormatMock('flags');
                assert.isNull(cast(null, Flags, {format}));
                assert.isUndefined(cast(undefined, Flags, {format}));
            });
        });

        context('for record', () => {
            it('should return a Model from UniversalField', () => {
                const value: Model = cast(
                    {foo: 'bar'},
                    Model,
                    {format: getUniversalFormatMock('record'), adapter: new JsonAdapter()}
                );

                assert.instanceOf(value, Model);
                assert.instanceOf(value.getAdapter(), JsonAdapter);
                assert.strictEqual(value.get('foo'), 'bar');
            });

            it('should return a Model from shortcut', () => {
                const value: Model = cast(
                    {foo: 'bar'},
                    'record',
                    {format: getUniversalFormatMock('record'), adapter: new JsonAdapter()}
                );

                assert.instanceOf(value, Model);
                assert.strictEqual(value.get('foo'), 'bar');
            });

            it('should return same instance for Record', () => {
                const value = new Model();
                assert.strictEqual(cast(value, 'record'), value);
            });

            it('should return passed value', () => {
                assert.isNull(cast(
                    null,
                    'record',
                    {format: getUniversalFormatMock('record'), adapter: new JsonAdapter()}
                ));

                assert.isUndefined(cast(
                undefined,
                'record',
                {format: getUniversalFormatMock('record'), adapter: new JsonAdapter()}
            ));
            });
        });

        context('for recordset', () => {
            it('should return a RecordSet from UniversalField', () => {
                const value: RecordSet = cast(
                    [{foo: 'bar'}],
                    RecordSet,
                    {format: getUniversalFormatMock('recordset'), adapter: new JsonAdapter()}
                );

                assert.instanceOf(value, RecordSet);
                assert.instanceOf(value.getAdapter(), JsonAdapter);
                assert.strictEqual(value.getCount(), 1);
                assert.strictEqual(value.at(0).get('foo'), 'bar');
            });

            it('should return a RecordSet from shortcut', () => {
                const value: RecordSet = cast(
                    [{foo: 'bar'}],
                    'recordset',
                    {format: getUniversalFormatMock('recordset'), adapter: new JsonAdapter()}
                );

                assert.instanceOf(value, RecordSet);
                assert.strictEqual(value.at(0).get('foo'), 'bar');
            });

            it('should return same instance for RecordSet', () => {
                const value = new RecordSet();
                assert.strictEqual(cast(value, RecordSet), value);
            });

            it('should return passed value', () => {
                assert.isNull(cast(
                    null,
                    'recordset',
                    {format: getUniversalFormatMock('recordset'), adapter: new JsonAdapter()}
                ));

                assert.isUndefined(cast(
                    undefined,
                    'recordset',
                    {format: getUniversalFormatMock('recordset'), adapter: new JsonAdapter()}
                ));
            });

            it('should return a RecordSet with the injected model', () => {
                const SomeModel = () => ({});
                const format = {
                    name: 'foo',
                    type: 'recordset'
                } as UniversalField;
                const value: RecordSet = cast([], RecordSet, {
                    format,
                    adapter: new JsonAdapter(),
                    model: SomeModel
                });

                assert.strictEqual(value.getModel(), SomeModel);
            });
        });

        context('for only type constructor', () => {
            it('should return a Number', () => {
                const value = cast(10, Number);
                assert.instanceOf(value, Number);
                assert.equal(value, 10);
            });

            it('should return a Date', () => {
                const value: Date = cast('2001-02-03', Date);

                assert.instanceOf(value, Date);
                assert.equal(value.getFullYear(), 2001);
                assert.equal(value.getMonth(), 1);
                assert.equal(value.getDate(), 3);
            });
        });
    });

    describe('.serialize()', () => {
        context('for integer', () => {
            it('should return a Number', () => {
                const format = getUniversalFormatMock('integer');
                assert.strictEqual(
                    serialize(1, {format}),
                    1
                );

                assert.strictEqual(
                    serialize('1', {format}),
                    1
                );

                assert.strictEqual(
                    serialize('0890', {format}),
                    890
                );
            });

            it('should return a Number from Object', () => {
                const obj = {};
                obj.valueOf = () => 33;

                assert.strictEqual(
                    serialize(obj, {format: getUniversalFormatMock('integer')}),
                    33
                );
            });

            it('should return a Number from Array', () => {
                const arr = [1];
                assert.strictEqual(
                    serialize(arr, {format: getUniversalFormatMock('integer')}),
                    1
                );
            });

            it('should return null', () => {
                const format = getUniversalFormatMock('integer');

                assert.strictEqual(
                    serialize('1a', {format}),
                    null
                );

                assert.strictEqual(
                    serialize('a', {format}),
                    null
                );

                assert.strictEqual(
                    serialize('a1', {format}),
                    null
                );
            });

            it('should return passed value', () => {
                const format = getUniversalFormatMock('integer');

                assert.isNull(serialize(null, {format}));
                assert.isUndefined(serialize(undefined, {format}));
            });
        });

        context('for string', () => {
            it('should return passed value', () => {
                assert.strictEqual(serialize('bar'), 'bar');
                assert.strictEqual(serialize(1), 1);
                assert.isNull(serialize(null));
                assert.isUndefined(serialize(undefined));
            });
        });

        context('for link', () => {
            it('should return a Number', () => {
                const format = getUniversalFormatMock('link');

                assert.strictEqual(
                    serialize(1, {format}),
                    1
                );

                assert.strictEqual(
                    serialize('1', {format}),
                    1
                );

                assert.strictEqual(
                    serialize('1a', {format}),
                    1
                );

                assert.strictEqual(
                    serialize('0890', {format}),
                    890
                );
            });

            it('should return NaN', () => {
                const format = getUniversalFormatMock('link');

                assert.isTrue(
                    isNaN(serialize('a', {format}))
                );
                assert.isTrue(
                    isNaN(serialize('a1', {format}))
                );
            });

            it('should return passed value', () => {
                assert.isNull(serialize(null));
                assert.isUndefined(serialize(
                    undefined,
                    {format: getUniversalFormatMock('link')}
                ));
            });
        });

        context('for real and double', () => {
            it('should return passed value', () => {
                const format = getUniversalFormatMock('real');

                assert.strictEqual(
                    serialize(1.2, {format}),
                    1.2
                );

                assert.strictEqual(
                    serialize('1.2', {format}),
                    '1.2'
                );

                assert.strictEqual(
                    serialize('1a', {format}),
                    '1a'
                );

                assert.strictEqual(
                    serialize('0890', {format}),
                    '0890'
                );

                assert.strictEqual(
                    serialize('a', {format}),
                    'a'
                );

                assert.strictEqual(
                    serialize('a1', {format}),
                    'a1'
                );

                assert.isNull(serialize(null, {format}));

                assert.isUndefined(serialize(undefined, {format}));
            });
        });

        context('for money', () => {
            it('should return passed value', () => {
                const format = getUniversalFormatMock('money');

                assert.strictEqual(
                    serialize('1.2', {format}),
                    '1.2'
                );

                assert.strictEqual(
                    serialize('0890', {format}),
                    '0890'
                );

                assert.strictEqual(
                    serialize('1a', {format}),
                    '1a'
                );

                assert.strictEqual(
                    serialize('a', {format}),
                    'a'
                );

                assert.strictEqual(
                    serialize('a1', {format}),
                    'a1'
                );

                assert.isNull(serialize(null, {format}));

                assert.isUndefined(serialize(undefined, {format}));
            });

            it('should return passed value if precision less or equal 3', () => {
                const format = getFormatMock('money') as MoneyField;
                format.getPrecision = () => 3;

                assert.strictEqual(
                    serialize(1.2, {format}),
                    1.2
                );
            });

            it('should return formatted value if precision more than 3', () => {
                const format = new MoneyField({
                    precision: 4
                });

                assert.strictEqual(
                    serialize(1.2, {format}),
                    '1.2000'
                );
            });

            it('should return passed value if "large" flag is enabled', () => {
                const format = getFormatMock('money') as MoneyField;
                format.isLarge = () => true;

                assert.strictEqual(
                    serialize('1.2', {format}),
                    '1.2'
                );
            });
        });

        context('for datetime, date and time', () => {
            it('should return a String with time zone for datetime', () => {
                const datetime = new Date(1443099268981);
                const format = getUniversalFormatMock('datetime');

                assert.strictEqual(
                    serialize(datetime, {format}),
                    '2015-09-24 15:54:28.981+03'
                );
            });

            it('should return a String without timezone for datetime and UniversalField', () => {
                const datetime = new Date(2001, 3, 15);
                const format = getUniversalFormatMock('datetime');
                format.meta = {
                    withoutTimeZone: true
                };

                assert.strictEqual(
                    serialize(datetime, {format}),
                    '2001-04-15 00:00:00'
                );
            });

            it('should return a String without timezone for datetime and DateTimeField', () => {
                const format = new DateTimeField({
                    withoutTimeZone: true
                });
                const datetime = new Date(2001, 3, 15);

                assert.strictEqual(
                    serialize(datetime, {format}),
                    '2001-04-15 00:00:00'
                );
            });

            it('should return a String without timezone if timezome offset contains not integer hours', () => {
                const format = new DateTimeField({
                    withoutTimeZone: true
                });
                const datetime = new Date(2001, 0, 1, 10, 20, 30);
                patchTzo(datetime, 30);

                assert.strictEqual(datetime.getTimezoneOffset(), 30);
                assert.strictEqual(
                    serialize(datetime, {format}),
                    '2001-01-01 10:20:30'
                );

                revertTzo(datetime);
            });

            it('should return a String for date', () => {
                const datetime = new Date(1443099268981);
                const format = getUniversalFormatMock('date');

                assert.strictEqual(
                    serialize(datetime, {format}),
                    '2015-09-24'
                );
            });

            it('should return a String for time', () => {
                const datetime = new Date(1443099268981);
                const format = getUniversalFormatMock('time');

                assert.strictEqual(
                    serialize(datetime, {format}),
                    '15:54:28.981+03'
                );
            });

            it('should return a String for Infinity', () => {
                assert.equal(
                    serialize(Infinity, {format: getUniversalFormatMock('date')}),
                    'infinity'
                );
            });

            it('should return a String for -Infinity', () => {
                assert.equal(
                    serialize(-Infinity, {format: getUniversalFormatMock('date')}),
                    '-infinity'
                );
            });

            it('should return a String with current date for empty string', () => {
                assert.strictEqual(
                    serialize('', {format: getUniversalFormatMock('date')}),
                    dateToSql(new Date(), MODE.DATE)
                );
            });

            it('should return passed value', () => {
                const format = getUniversalFormatMock('datetime');

                assert.strictEqual(
                    serialize('bar', {format}),
                    'bar'
                );
                assert.isNull(serialize(null, {format}));
                assert.isUndefined(serialize(undefined, {format}));
            });
        });

        context('for timeinterval', () => {
            it('should return a String', () => {
                const interval = new TimeInterval('P10DT0H0M0S');
                assert.strictEqual(
                    serialize(interval, {format: getUniversalFormatMock('timeinterval')}),
                    'P10DT0H0M0S'
                );
            });

            it('should return passed value', () => {
                const format = getUniversalFormatMock('timeinterval');

                assert.strictEqual(
                    serialize('P10DT0H0M0S', {format}),
                    'P10DT0H0M0S'
                );
                assert.isNull(serialize(null, {format}));
                assert.isUndefined(serialize(undefined, {format}));
            });
        });

        context('for array', () => {
            it('should return an Array of String from Field', () => {
                const format = getFormatMock('array') as ArrayField;
                format.getKind = () => 'string';

                const array = ['foo', 'bar'];

                assert.deepEqual(
                    serialize(array, {format}),
                    ['foo', 'bar']
                );
            });

            it('should return an Array of Number from UniversalField', () => {
                const format = getUniversalFormatMock('array');
                format.meta = {
                    kind: 'integer'
                };

                const array = ['1', '2a', 3];

                assert.deepEqual(
                    serialize(array, {format}),
                    [1, null, 3]
                );
            });

            it('should return an Array from scalar', () => {
                const format = new ArrayField({
                    kind: 'string'
                });

                assert.deepEqual(
                    serialize('foo', {format}),
                    ['foo']
                );
            });

            it('should return passed value', () => {
                const format = getFormatMock('array');

                assert.isNull(serialize(null, {format}));
                assert.isUndefined(serialize(undefined, {format}));
            });
        });

        context('for identity', () => {
            it('should return passed value', () => {
                const format = getUniversalFormatMock('identity');

                assert.deepEqual(
                    serialize('foo', {format}),
                    'foo'
                );

                assert.deepEqual(
                    serialize(['foo'], {format}),
                    ['foo']
                );
            });

            it('should return null', () => {
                assert.isNull(
                    serialize(null, {format: getUniversalFormatMock('identity')})
                );
            });
        });

        context('for hierarchy', () => {
            it('should return passed value', () => {
                const format = getUniversalFormatMock('hierarchy');

                assert.strictEqual(
                    serialize('bar', {format}),
                    'bar'
                );

                assert.strictEqual(
                    serialize(1, {format}),
                    1
                );

                assert.isNull(serialize(null, {format}));

                assert.isUndefined(serialize(undefined, {format}));
            });
        });

        context('for enum', () => {
            it('should return Number from Enum', () => {
                const value = new Enum({
                    dictionary: ['one', 'two'],
                    index: 1
                });

                assert.strictEqual(
                    serialize(value, {format: getUniversalFormatMock('enum')}),
                    1
                );
            });

            it('should return passed value', () => {
                const format = getUniversalFormatMock('enum');

                assert.strictEqual(
                    serialize('bar', {format}),
                    'bar'
                );

                assert.isNull(serialize(null, {format}));

                assert.isUndefined(serialize(undefined, {format}));
            });
        });

        context('for flags', () => {
            it('should return an Array from Flags', () => {
                const value = new Flags({
                    dictionary: ['one', 'two', 'three'],
                    values: [null, true, false]
                });

                assert.deepEqual(
                    serialize(value, {format: getUniversalFormatMock('flags')}),
                    [null, true, false]
                );
            });

            it('should return an Array from Array', () => {
                const value = [true, null, false];

                assert.strictEqual(
                    serialize(value, {format: getUniversalFormatMock('flags')}),
                    value
                );
            });

            it('should return passed value', () => {
                const format = getUniversalFormatMock('flags');

                assert.isNull(serialize(null, {format}));
                assert.isUndefined(serialize(undefined, {format}));
            });
        });

        context('for record', () => {
            it('should return Model\'s raw data', () => {
                const rawData = {foo: 'bar'};
                const value = new Model({rawData});

                assert.strictEqual(
                    serialize(value, {format: getUniversalFormatMock('record')}),
                    rawData
                );
            });

            it('should return passed value', () => {
                const format = getUniversalFormatMock('record');

                assert.isNull(serialize(null, {format}));
                assert.isUndefined(serialize(undefined, {format}));
            });
        });

        context('for recordset', () => {
            it('should return RecordSet\'s raw data', () => {
                const rawData = [{foo: 'bar'}];
                const value = new RecordSet({rawData});

                assert.strictEqual(
                    serialize(value, {format: getUniversalFormatMock('recordset')}),
                    rawData
                );
            });

            it('should return build RecordSet from List', () => {
                const data = {foo: 'bar'};
                const rec = new Model({rawData: data});
                const value = new List({items: [rec]});
                const format = getUniversalFormatMock('recordset');

                assert.deepEqual(
                    serialize(value, {format}),
                    [data]
                );
            });

            it('should return passed value', () => {
                const format = getUniversalFormatMock('recordset');

                assert.isNull(serialize(null, {format}));
                assert.isUndefined(serialize(undefined, {format}));
            });
        });
    });
 });
