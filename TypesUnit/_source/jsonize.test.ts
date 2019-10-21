import {assert} from 'chai';
import jsonize from 'Types/_source/jsonize';
import Record from 'Types/_entity/Record';
import RecordSet from 'Types/_collection/RecordSet';
import DataSet from 'Types/_source/DataSet';
import DateTime from 'Types/_entity/DateTime';
import TheDate from 'Types/_entity/Date';
import Time from 'Types/_entity/Time';
import {ExtendDate, IExtendDateConstructor} from 'Types/_declarations';
import 'Core/Date';

class ScalarWrapper<T> {
    private value: T;
    constructor(value: T) {
        this.value = value;
    }
    valueOf(): T {
        return this.value;
    }
}

class ComplexObject<T> {
    value: T;
    constructor(value: T) {
        this.value = value;
    }
}

describe('Types/_source/jsonize', () => {
    describe('.jsonize()', () => {
        it('should clone the data', () => {
            const data = {
                a: 1,
                b: '2',
                c: false,
                d: true,
                e: null,
                f: [1, false, true, null, [2], {foo: 'bar'}],
                g: {g1: 2, g2: 'q'},
            };
            assert.deepEqual(jsonize(data), data);
        });

        it('should return the clone of Record\'s raw data', () => {
            const rawData = {foo: 'bar'};
            const data = {
                rec: new Record({rawData}),
            };

            assert.deepEqual(jsonize<{rec: typeof rawData}>(data).rec, rawData);
        });

        it('should return the clone of RecordSet\'s raw data', () => {
            const rawData = [{foo: 'bar'}];
            const data = {
                rs: new RecordSet({rawData}),
            };

            assert.deepEqual(jsonize<{rs: typeof rawData}>(data).rs, rawData);
        });

        it('should return the clone of DataSet\'s raw data', () => {
            const rawData = [[{foo: 'bar'}]];
            const data = {
                ds: new DataSet({rawData}),
            };

            assert.deepEqual(jsonize<{ds: typeof rawData}>(data).ds, rawData);
        });

        it('should return wrapped scalar value', () => {
            const foo = new ScalarWrapper('bar');
            assert.deepEqual(jsonize<string>(foo), 'bar');
        });

        it('should throw TypeError for unsupported complex object', () => {
            const foo = new ComplexObject('bar');

            assert.throws(() => {
                jsonize(foo);
            }, TypeError);
        });

        it('should process special DateTime type', () => {
            const dateTime = new DateTime(2019, 6, 12);

            assert.equal(
                jsonize<string>(dateTime).substr(0, 22),
                '2019-07-12 00:00:00+03',
            );
        });

        it('should process special Date type', () => {
            const date = new TheDate(2019, 6, 12);

            assert.equal(
                jsonize<string>(date),
                '2019-07-12',
            );
        });

        it('should process special Time type', () => {
            const time = new Time(2019, 6, 12, 16, 7, 14);

            assert.equal(
                jsonize<string>(time).substr(0, 8),
                '16:07:14',
            );
        });

        it('should process special Date type inside Record\'s raw data', () => {
            const date = new TheDate(2019, 6, 12);
            const rawData = {foo: date};
            const record = new Record({rawData});

            assert.deepEqual(jsonize<{foo: string}>(record), {foo: '2019-07-12'});
        });

        it('should return shared Record\'s raw data if there is nothing to process', () => {
            const rawData = {foo: 'bar'};
            const record = new Record({rawData});

            assert.strictEqual(jsonize<{foo: string}>(record), rawData);
        });

        it('should return Date as string use default serialization mode', () => {
            const year = 2016;
            const month = 11;
            const day = 12;
            const date = new Date(year, month, day);

            assert.equal(
                jsonize<string>(date),
                '2016-12-12',
            );
        });

        it('should return Date as string use "datetime" serialization mode', () => {
            const year = 2016;
            const month = 11;
            const day = 12;
            const date = new Date(year, month, day) as ExtendDate;

            if (date.setSQLSerializationMode) {
                date.setSQLSerializationMode((Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_DATETIME);
                assert.isTrue(
                    jsonize<string>(date).startsWith('2016-12-12 00:00:00'),
                );
            }
        });
    });
});
