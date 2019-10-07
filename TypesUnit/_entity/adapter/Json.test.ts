import {assert} from 'chai';
import JsonAdapter from 'Types/_entity/adapter/Json';
import JsonTable from 'Types/_entity/adapter/JsonTable';
import JsonRecord from 'Types/_entity/adapter/JsonRecord';

interface IData {
    id: number;
    lastname: string;
}

describe('Types/_entity/adapter/Json', () => {
    let data: IData[];
    let adapter: JsonAdapter;

    beforeEach(() => {
        data = [{
            id: 1,
            lastname: 'Smith'
        }, {
            id: 2,
            lastname: 'Green'
        }, {
            id: 3,
            lastname: 'Geller'
        }, {
            id: 4,
            lastname: 'Bing'
        }, {
            id: 5,
            lastname: 'Tribbiani'
        }, {
            id: 6,
            lastname: 'Buffay'
        }, {
            id: 7,
            lastname: 'Tyler'
        }];

        adapter = new JsonAdapter();
    });

    afterEach(() => {
        data = undefined;
        adapter = undefined;
    });

    describe('.forTable()', () => {
        it('should return table adapter', () => {
            assert.instanceOf(
                adapter.forTable(),
                JsonTable
            );
        });

        it('should pass data to the table adapter', () => {
            const data = [{a: 1}, {b: 2}];
            assert.strictEqual(
                adapter.forTable(data).getData(),
                data
            );
        });
    });

    describe('.forRecord()', () => {
        it('should return record adapter', () => {
            assert.instanceOf(
                adapter.forRecord(),
                JsonRecord
            );
        });

        it('should pass data to the record adapter', () => {
            const data = {a: 1};
            assert.strictEqual(
                adapter.forRecord(data).getData(),
                data
            );
        });
    });

    describe('.getKeyField()', () => {
        it('should return undefined', () => {
            assert.isUndefined(adapter.getKeyField(data));
        });
    });

    describe('.getProperty()', () => {
        it('should return the property value', () => {
            assert.strictEqual(
                123,
                adapter.getProperty({
                    items: data,
                    total: 123
                }, 'total')
            );

            assert.strictEqual(
                456,
                adapter.getProperty({
                    employees: {
                        items: data,
                        total: 456
                    }
                }, 'employees.total')
            );

            assert.isUndefined(
                adapter.getProperty({
                    items: data
                }, 'total')
            );

            assert.isUndefined(
                adapter.getProperty({
                    items: data
                }, undefined)
            );
        });

        it('should return undefined on invalid data', () => {
            assert.isUndefined(
                adapter.getProperty({}, undefined)
            );

            assert.isUndefined(
                adapter.getProperty('', undefined)
            );

            assert.isUndefined(
                adapter.getProperty(0, undefined)
            );

            assert.isUndefined(
                adapter.getProperty(undefined, undefined)
            );
        });
    });

    describe('.setProperty()', () => {
        it('should set the property value', () => {
            const dataA = {
                items: data,
                total: 123
            };
            adapter.setProperty(dataA, 'total', 456);

            assert.strictEqual(
                456,
                dataA.total
            );
            assert.strictEqual(
                1,
                dataA.items[0].id
            );
            assert.strictEqual(
                5,
                dataA.items[4].id
            );
            assert.strictEqual(
                'Buffay',
                dataA.items[5].lastname
            );

            const dataB = {
                employees: {
                    items: data,
                    total: 789
                }
            };
            adapter.setProperty(dataB, 'employees.total', 987);
            assert.strictEqual(
                987,
                dataB.employees.total
            );
            assert.strictEqual(
                1,
                dataB.employees.items[0].id
            );
            assert.strictEqual(
                5,
                dataB.employees.items[4].id
            );
            assert.strictEqual(
                'Buffay',
                dataB.employees.items[5].lastname
            );

            const dataC = {
                a: 1,
                b: 2
            };
            adapter.setProperty(dataC, 'c.d.e.f', 'g');
            assert.strictEqual(
                'g',
                (dataC as any).c.d.e.f
            );
            assert.strictEqual(
                1,
                dataC.a
            );
            assert.strictEqual(
                2,
                dataC.b
            );
        });
    });
});
