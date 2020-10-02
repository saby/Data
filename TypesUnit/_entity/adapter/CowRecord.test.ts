import { assert } from 'chai';
import CowRecordAdapter from 'Types/_entity/adapter/CowRecord';
import IAdapter from 'Types/_entity/adapter/IAdapter';
import ITable from 'Types/_entity/adapter/ITable';
import IRecord from 'Types/_entity/adapter/IRecord';
import { EntityMarker } from 'Types/_declarations';

class MockRecord<T> implements IRecord {
    readonly '[Types/_entity/adapter/IRecord]': EntityMarker = true;
    isClone: boolean;
    protected data: T;

    constructor(data: T, cloneable?: boolean) {
        this.data = data;
        if (cloneable) {
            this['[Types/_entity/ICloneable]'] = true;
        }
    }

    has(name: string): boolean {
        return true;
    }

    get(name: string): any {
        return this.data[name];
    }

    set(name: string, value: any): void {
        this.data[name] = value;
    }

    clear(): void {
        this.data = {} as T;
    }

    clone(): MockRecord<T> {
        const clone = new MockRecord(this.data);
        clone.isClone = true;
        return clone;
    }

    getData(): T {
        return this.data;
    }

    getFields(): string[] {
        return [];
    }

    getFormat(): any {
        return {};
    }

    getSharedFormat(): any {
        return {};
    }

    addField(): void {
        // Just do nothing
    }

    removeField(): void {
        // Just do nothing
    }

    removeFieldAt(): void {
        // Just do nothing
    }
}

class Mock<T> implements IAdapter {
    readonly '[Types/_entity/adapter/IAdapter]': EntityMarker = true;
    readonly isCloneable: boolean;
    lastRecordAdapter: MockRecord<T>;

    constructor(cloneable?: boolean) {
        this.isCloneable = cloneable;
    }

    forRecord(data: T): IRecord {
        this.lastRecordAdapter = new MockRecord(data, this.isCloneable);
        return this.lastRecordAdapter;
    }

    forTable(data?: any): ITable {
        return undefined;
    }

    getKeyField(data: any): string {
        return '';
    }

    getProperty(data: any, property: string): any {
        return;
    }

    serialize(data: any): any {
        return;
    }

    setProperty(data: any, property: string, value: any): void {
        // Just do nothing
    }
}

interface IData {
    foo: string;
}

describe('Types/_entity/adapter/CowRecord', () => {
    let data: IData;
    let original: IAdapter;
    let adapter: CowRecordAdapter;

    beforeEach(() => {
        data = {foo: 'bar'};
        original = new Mock();
        adapter = new CowRecordAdapter(data, original);
    });

    afterEach(() => {
        data = undefined;
        original = undefined;
        adapter = undefined;
    });

    describe('.get()', () => {
        it('should return the property value from shared data', () => {
            assert.equal(
                adapter.get('foo'),
                'bar'
            );
            assert.strictEqual(adapter.getData(), data);
        });
    });

    describe('.set()', () => {
        it('should set the property value into the copy', () => {
            adapter.set('foo', 'baz');

            assert.notEqual(adapter.getData(), data);
            assert.equal(data.foo, 'bar');
            assert.equal(adapter.getData().foo, 'baz');
        });

        it('should copy the data once', () => {
            adapter.set('foo', 'baz');
            const data = adapter.getData();
            adapter.set('foo', 'bax');

            assert.strictEqual(adapter.getData(), data);
        });

        it('should use ICloneable interface if supported', () => {
            const original = new Mock(true);
            const adapter = new CowRecordAdapter(data, original);

            assert.isUndefined((adapter.getOriginal() as MockRecord<IData>).isClone);
            adapter.set('foo', 'baz');
            assert.isTrue((adapter.getOriginal()as MockRecord<IData>).isClone);
        });
    });

    describe('.clear()', () => {
        it('should clear copy of the data', () => {
            adapter.clear();
            assert.notEqual(adapter.getData(), data);
            assert.notEqual(Object.keys(data).length, 0);
            assert.equal(Object.keys(adapter.getData()).length, 0);
        });
    });

    describe('.getData()', () => {
        it('should return raw data', () => {
            assert.strictEqual(adapter.getData(), data);
        });
    });

    describe('.getFields()', () => {
        it('should return an empty array', () => {
            assert.strictEqual(
                adapter.getFields().length,
                0
            );
        });

        it('should leave data shared', () => {
            adapter.getFields();
            assert.strictEqual(adapter.getData(), data);
        });
    });

    describe('.getFormat()', () => {
        it('should return an empty Object', () => {
            assert.equal(Object.keys(adapter.getFormat('foo')).length, 0);
        });

        it('should leave data shared', () => {
            adapter.getFormat('foo');
            assert.strictEqual(adapter.getData(), data);
        });
    });

    describe('.addField()', () => {
        it('should copy the data', () => {
            adapter.addField({} as any, 0);
            assert.notEqual(adapter.getData(), data);
        });
    });

    describe('.removeField()', () => {
        it('should copy the data', () => {
            adapter.removeField('foo');
            assert.notEqual(adapter.getData(), data);
        });
    });

    describe('.removeFieldAt()', () => {
        it('should copy the data', () => {
            adapter.removeFieldAt(0);
            assert.notEqual(adapter.getData(), data);
        });
    });

    describe('.getOriginal()', () => {
        it('should return the original adapter', () => {
            assert.strictEqual(adapter.getOriginal(), (original as Mock<IData>).lastRecordAdapter);
        });
    });
});
