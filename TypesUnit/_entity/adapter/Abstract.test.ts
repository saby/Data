import {assert} from 'chai';
import AbstractAdapter from 'Types/_entity/adapter/Abstract';
import Record from 'Types/_entity/Record';
import DateTime from 'Types/_entity/DateTime';
import TheDate from 'Types/_entity/Date';
import Time from 'Types/_entity/Time';
import RecordSet from 'Types/_collection/RecordSet';
import DataSet from 'Types/_source/DataSet';
import {ExtendDate, IExtendDateConstructor} from 'Types/_declarations';
import 'Core/Date';

class TestAdapter extends AbstractAdapter {
    constructor() {
        super();
    }
}

class ScalarWrapper<T> {
    private value: T;
    constructor(value: T) {
        this.value = value;
    }
    valueOf(): T {
        return this.value;
    }
}

describe('Types/_entity/adapter/Abstract', () => {
    let adapter: TestAdapter;

    beforeEach(() => {
        adapter = new TestAdapter();
    });

    afterEach(() => {
        adapter = undefined;
    });

    describe('.serialize()', () => {
        it('should clone of the data', () => {
            const data = {
                a: 1,
                b: '2',
                c: false,
                d: true,
                e: null,
                f: [1, false, true, null, [2], {foo: 'bar'}],
                g: {g1: 2, g2: 'q'}
            };
            assert.deepEqual(adapter.serialize(data), data);
        });

        it('should return the clone of Record\'s raw data', () => {
            const rawData = {foo: 'bar'};
            const data = {
                rec: new Record({rawData})
            };

            assert.deepEqual(adapter.serialize(data).rec, rawData);
        });

        it('should return the clone of RecordSet\'s raw data', () => {
            const rawData = [{foo: 'bar'}];
            const data = {
                rs: new RecordSet({rawData})
            };

            assert.deepEqual(adapter.serialize(data).rs, rawData);
        });

        it('should return the clone of DataSet\'s raw data', () => {
            const rawData = [[{foo: 'bar'}]];
            const data = {
                ds: new DataSet({rawData})
            };

            assert.deepEqual(adapter.serialize(data).ds, rawData);
        });

        it('should return wrapped scalar value', () => {
            const foo = new ScalarWrapper('bar');
            assert.deepEqual(adapter.serialize(foo), 'bar');
        });

        it('should throw TypeError for unsupported complex object', () => {
            class Foo<T> {
                value: T;
                constructor(value: T) {
                    this.value = value;
                }
            }

            const foo = new Foo('bar');

            assert.throws(() => {
                adapter.serialize(foo);
            }, TypeError);
        });

        it('should serialize special DateTime type', () => {
            const dateTime = new DateTime(2019, 6, 12);

            assert.equal(
                adapter.serialize(dateTime).substr(0, 22),
                '2019-07-12 00:00:00+03'
            );
        });

        it('should serialize special Date type', () => {
            const date = new TheDate(2019, 6, 12);

            assert.equal(
                adapter.serialize(date),
                '2019-07-12'
            );
        });

        it('should serialize special Time type', () => {
            const time = new Time(2019, 6, 12, 16, 7, 14);

            assert.equal(
                adapter.serialize(time).substr(0, 8),
                '16:07:14'
            );
        });

        it('should return Date as string use default serialization mode', () => {
            const year = 2016;
            const month = 11;
            const day = 12;
            const date = new Date(year, month, day);

            assert.equal(
                adapter.serialize(date),
                '2016-12-12'
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
                    adapter.serialize(date).startsWith('2016-12-12 00:00:00')
                );
            }
        });
    });
});
