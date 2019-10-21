import {assert} from 'chai';
import SbisAdapter from 'Types/_entity/adapter/Sbis';
import SbisTable from 'Types/_entity/adapter/SbisTable';
import SbisRecord from 'Types/_entity/adapter/SbisRecord';
import {ITableFormat} from 'Types/_entity/adapter/SbisFormatMixin';
import SbisFormatFinder from 'Types/_entity/adapter/SbisFormatFinder';
import 'Core/Date';

describe('Types/_entity/adapter/Sbis', () => {
    let data: ITableFormat;
    let adapter: SbisAdapter;

    beforeEach(() => {
        data = {
            d: [
                [1, 'Smith'],
                [2, 'Green'],
                [3, 'Geller'],
                [4, 'Bing'],
                [5, 'Tribbiani'],
                [6, 'Buffay'],
                [7, 'Tyler'],
            ],
            s: [
                {n: 'id', t: 'Число целое'},
                {n: 'lastname', t: 'Строка'},
            ],
        };

        adapter = new SbisAdapter();
    });

    afterEach(() => {
        data = undefined;
        adapter = undefined;
    });

    describe('.forTable()', () => {
        it('should return table adapter', () => {
            assert.instanceOf(
                adapter.forTable(),
                SbisTable,
            );
        });

        it('should pass data to the table adapter', () => {
            const data = {d: [], s: []};
            assert.strictEqual(
                adapter.forTable(data).getData(),
                data,
            );
        });
    });

    describe('.forRecord()', () => {
        it('should return record adapter', () => {
            assert.instanceOf(
                adapter.forRecord(),
                SbisRecord,
            );
        });

        it('should pass data to the record adapter', () => {
            const data = {d: [], s: []};
            assert.strictEqual(
                adapter.forRecord(data).getData(),
                data,
            );
        });
    });

    describe('.getKeyField()', () => {
        it('should return first field prefixed with "@"', () => {
            const data = {
                d: [
                ],
                s: [
                    {n: 'id', t: 'Число целое'},
                    {n: '@lastname', t: 'Строка'},
                ],
            };
            assert.equal(adapter.getKeyField(data), '@lastname');
        });

        it('should return first field prefixed with "@" from format controller', () => {
            const data = {
                d: [
                ],
                f: 0,
            };

            adapter.setFormatController(new SbisFormatFinder({
                d: [
                ],
                f: 0,
                s: [
                    {n: 'id', t: 'Число целое'},
                    {n: '@lastname', t: 'Строка'},
                ],
            }));

            assert.equal(adapter.getKeyField(data), '@lastname');
        });

        it('should return first field', () => {
            assert.equal(adapter.getKeyField(data), 'id');
        });
    });

    describe('.getProperty()', () => {
        it('should return the property value', () => {
            assert.strictEqual(
                123,
                adapter.getProperty({
                    items: data,
                    total: 123,
                }, 'total'),
            );

            assert.strictEqual(
                456,
                adapter.getProperty({
                    d: data.d,
                    s: data.s,
                    n: 456,
                }, 'n'),
            );

            assert.strictEqual(
                789,
                adapter.getProperty({
                    employees: {
                        d: data.d,
                        s: data.s,
                        n: 789,
                    },
                }, 'employees.n'),
            );

            assert.isUndefined(
                adapter.getProperty(data, 'total'),
            );

            assert.isUndefined(
                adapter.getProperty(data, undefined),
            );
        });

        it('should return undefined on invalid data', () => {
            assert.isUndefined(
                adapter.getProperty({}, undefined),
            );
            assert.isUndefined(
                adapter.getProperty('', undefined),
            );
            assert.isUndefined(
                adapter.getProperty(0, undefined),
            );
            assert.isUndefined(
                adapter.getProperty(undefined, undefined),
            );
        });
    });

    describe('.setProperty()', () => {
        it('should set the property value', () => {
            adapter.setProperty(data, 'n', 456);

            assert.strictEqual(
                456,
                data.n,
            );
            assert.strictEqual(
                1,
                data.d[0][0],
            );
            assert.strictEqual(
                5,
                data.d[4][0],
            );
            assert.strictEqual(
                'Buffay',
                data.d[5][1],
            );

            const moreData = {
                employees: {
                    items: data,
                    total: 789,
                },
            };
            adapter.setProperty(moreData, 'employees.total', 987);
            assert.strictEqual(
                987,
                moreData.employees.total,
            );
            assert.strictEqual(
                1,
                moreData.employees.items.d[0][0],
            );
            assert.strictEqual(
                5,
                moreData.employees.items.d[4][0],
            );
            assert.strictEqual(
                'Buffay',
                moreData.employees.items.d[5][1],
            );

            adapter.setProperty(data, 'c.d.e.f', 'g');
            assert.strictEqual(
                'g',
               (data as any).c.d.e.f,
            );

            assert.strictEqual(
                1,
                moreData.employees.items.d[0][0],
            );
            assert.strictEqual(
                5,
                moreData.employees.items.d[4][0],
            );
            assert.strictEqual(
                'Buffay',
                moreData.employees.items.d[5][1],
            );
        });
    });
});
