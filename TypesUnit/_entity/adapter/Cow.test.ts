import {assert} from 'chai';
import CowAdapter from 'Types/_entity/adapter/Cow';
import CowTable from 'Types/_entity/adapter/CowTable';
import CowRecord from 'Types/_entity/adapter/CowRecord';
import IAdapter from 'Types/_entity/adapter/IAdapter';

class Mock<T> implements IAdapter {
    readonly '[Types/_entity/adapter/IAdapter]': boolean = true;

    forTable(data: T): any {
        return {
            getData: () => data
        };
    }

    forRecord(data: T): any {
        return {
            getData: () => data
        };
    }

    getKeyField(): string {
        return 'id';
    }

    getProperty(data: T, property: string): any {
        return data[property];
    }

    setProperty(data: T, property: string, value: any): void {
        data[property] = value;
    }

    serialize(): string {
        return '{}';
    }
}

describe('Types/_entity/adapter/Cow', () => {
    let original: IAdapter;
    let adapter: CowAdapter;

    beforeEach(() => {
        original = new Mock();
        adapter = new CowAdapter(original);
    });

    afterEach(() => {
        original = undefined;
        adapter = undefined;
    });

    describe('.forTable()', () => {
        it('should return table adapter', () => {
            assert.instanceOf(
                adapter.forTable(),
                CowTable
            );
        });

        it('should pass data to the table adapter', () => {
            const data = [{foo: 'bar'}];
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
                CowRecord
            );
        });

        it('should pass data to the record adapter', () => {
            const data = {foo: 'bar'};
            assert.strictEqual(
                adapter.forRecord(data).getData(),
                data
            );
        });
    });

    describe('.getKeyField()', () => {
        it('should return "id"', () => {
            assert.equal(adapter.getKeyField({}), 'id');
        });
    });

    describe('.getProperty()', () => {
        it('should return the property value', () => {
            assert.equal(
                adapter.getProperty({foo: 'bar'}, 'foo'),
                'bar'
            );
        });
    });

    describe('.setProperty()', () => {
        it('should set the property value', () => {
            const data = {foo: 'bar'};
            adapter.setProperty(data, 'foo', 'baz');
            assert.equal(
                data.foo,
                'baz'
            );
        });
    });

    describe('.getOriginal()', () => {
        it('should return original adapter', () => {
            assert.strictEqual(adapter.getOriginal(), original);
        });
    });

    describe('.toJSON()', () => {
        it('should serialize the adapter', () => {
            const json = adapter.toJSON();

            assert.strictEqual(json.module, 'Types/entity:adapter.Cow');
        });
    });

    describe('.fromJSON()', () => {
        it('should restore the wrapped original', () => {
            const json = adapter.toJSON();
            const clone = (CowAdapter as any).fromJSON(json);

            assert.instanceOf(clone.getOriginal(), Mock);
        });
    });
});
