import {assert} from 'chai';
import CowTableAdapter from 'Types/_entity/adapter/CowTable';
import IAdapter from 'Types/_entity/adapter/IAdapter';
import ITable from 'Types/_entity/adapter/ITable';
import IRecord from 'Types/_entity/adapter/IRecord';

class MockTable<T> implements ITable {
    readonly '[Types/_entity/adapter/ITable]': boolean = true;
    isClone: boolean;
    protected data: T[];

    constructor(data: T[], cloneable?: boolean) {
        this.data = data;
        if (cloneable) {
            this['[Types/_entity/ICloneable]'] = true;
        }
    }

    getFields(): string[] {
        return [];
    }

    getCount(): number {
        return 0;
    }

    getData(): T[] {
        return this.data;
    }

    add(record: T, at: number): void {
        this.data[at] = record;
    }

    at(index: number): T {
        return this.data[index];
    }

    remove(at: number): void {
        this.data.splice(at, 1);
    }

    replace(record: T, at: number): void {
        this.data[at] = record;
    }

    move(): void {
        // Just do nothing
    }

    merge(): void {
        // Just do nothing
    }

    copy(): void {
        // Just do nothing
    }

    clear(): void {
        this.data.length = 0;
    }

    clone(): ITable {
        const clone = new MockTable(this.data);
        clone.isClone = true;
        return clone;
    }

    getFormat(): object {
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
    readonly '[Types/_entity/adapter/IAdapter]': boolean = true;
    isCloneable: boolean;
    lastTableAdapter: MockTable<T>;

    constructor(cloneable?: boolean) {
        this.isCloneable = cloneable;
    }

    forTable(data: T[]): ITable {
        this.lastTableAdapter = new MockTable(data, this.isCloneable);
        return this.lastTableAdapter;
    }

    forRecord(data?: any, tableData?: any): IRecord {
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

describe('Types/_entity/adapter/CowTable', () => {
    let data: object[];
    let original: IAdapter;
    let adapter: CowTableAdapter;

    beforeEach(() => {
        data = [];
        original = new Mock();
        adapter = new CowTableAdapter(data, original);
    });

    afterEach(() => {
        data = undefined;
        original = undefined;
        adapter = undefined;
    });

    describe('.getFields()', () => {
        it('should return an empty array', () => {
            assert.strictEqual(
                adapter.getFields().length,
                0,
            );
        });

        it('should leave data shared', () => {
            adapter.getFields();
            assert.strictEqual(adapter.getData(), data);
        });
    });

    describe('.getCount()', () => {
        it('should return 0', () => {
            assert.strictEqual(
                adapter.getCount(),
                0,
            );
        });

        it('should leave data shared', () => {
            adapter.getCount();
            assert.strictEqual(adapter.getData(), data);
        });
    });

    describe('.add()', () => {
        it('should append a record into the copy', () => {
            adapter.add({foo: 'bar'}, 0);

            assert.notEqual(adapter.getData(), data);
            assert.strictEqual(data.length, 0);
            assert.strictEqual(adapter.getData().length, 1);
            assert.strictEqual(adapter.getData()[0].foo, 'bar');
        });

        it('should copy the data once', () => {
            adapter.add({foo: 'bar'}, 0);
            const data = adapter.getData();
            adapter.add({foo: 'baz'}, 1);

            assert.strictEqual(adapter.getData(), data);
            assert.strictEqual(adapter.getData().length, 2);
        });

        it('should use ICloneable interface if supported', () => {
            const original = new Mock(true);
            const adapter = new CowTableAdapter(data, original);

            assert.isUndefined((adapter.getOriginal() as MockTable<object>).isClone);
            adapter.add({foo: 'bar'}, 0);
            assert.isTrue((adapter.getOriginal() as MockTable<object>).isClone);
        });
    });

    describe('.at()', () => {
        it('should return valid record', () => {
            const data = [{foo: 'bar'}];
            const original = new Mock<IData>();
            const adapter = new CowTableAdapter(data, original);

            assert.strictEqual(adapter.at(0).foo, 'bar');
        });

        it('should leave data shared', () => {
            const data = [{foo: 'bar'}];
            const original = new Mock();
            const adapter = new CowTableAdapter(data, original);

            adapter.at(0);
            assert.strictEqual(adapter.getData(), data);
        });
    });

    describe('.remove()', () => {
        it('should remove the record in the copy', () => {
            const data = [{foo: 'bar'}];
            const original = new Mock();
            const adapter = new CowTableAdapter(data, original);

            adapter.remove(0);

            assert.notEqual(adapter.getData(), data);
            assert.equal(data.length, 1);
            assert.strictEqual(adapter.getData().length, 0);
        });
    });

    describe('.replace()', () => {
        it('should replace the record in the copy', () => {
            const data = [{foo: 'bar'}];
            const original = new Mock();
            const adapter = new CowTableAdapter(data, original);

            adapter.replace({foo: 'baz'}, 0);

            assert.notEqual(adapter.getData(), data);
            assert.equal(data[0].foo, 'bar');
            assert.strictEqual(adapter.getData()[0].foo, 'baz');
        });
    });

    describe('.move()', () => {
        it('should copy the data', () => {
            const data = [{foo: 'bar'}, {foo: 'baz'}];
            const original = new Mock();
            const adapter = new CowTableAdapter(data, original);

            adapter.move(1, 0);

            assert.notEqual(adapter.getData(), data);
        });
    });

    describe('.merge()', () => {
        it('should copy the data', () => {
            const data = [{foo: 'bar'}, {foo: 'baz'}];
            const original = new Mock();
            const adapter = new CowTableAdapter(data, original);

            adapter.merge(0, 1, 'foo');

            assert.notEqual(adapter.getData(), data);
        });
    });

    describe('.copy()', () => {
        it('should copy the data', () => {
            const data = [{foo: 'bar'}];
            const original = new Mock();
            const adapter = new CowTableAdapter(data, original);

            adapter.copy(0);

            assert.notEqual(adapter.getData(), data);
        });
    });

    describe('.clear()', () => {
        it('should clear copy of the data', () => {
            const data = [{foo: 'bar'}];
            const original = new Mock();
            const adapter = new CowTableAdapter(data, original);

            adapter.clear();
            assert.notEqual(adapter.getData(), data);
            assert.equal(data.length, 1);
            assert.strictEqual(adapter.getData().length, 0);
        });
    });

    describe('.getData()', () => {
        it('should return the raw data', () => {
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
            assert.strictEqual(adapter.getOriginal(), (original as Mock<object>).lastTableAdapter);
        });
    });
});
