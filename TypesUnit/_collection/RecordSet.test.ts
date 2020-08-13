import {assert} from 'chai';
import RecordSet from 'Types/_collection/RecordSet';
import IBindCollection from 'Types/_collection/IObservable';
import Record from 'Types/_entity/Record';
import Model, {IProperty} from 'Types/_entity/Model';
import {Track} from 'Types/_entity/functor';
import {AdapterDescriptor} from 'Types/_entity/FormattableMixin';
import fieldsFactory, {IDeclaration} from 'Types/_entity/format/fieldsFactory';
import JsonAdapter from 'Types/_entity/adapter/Json';
import SbisAdapter from 'Types/_entity/adapter/Sbis';
import CowAdapter from 'Types/_entity/adapter/Cow';
import {ITableFormat} from 'Types/_entity/adapter/SbisFormatMixin';
import {IHashMap} from 'Types/declarations';
import * as Serializer from 'Core/Serializer';

const RecordState = Record.RecordState;

interface IItem {
    id: number;
    name: string;
}

describe('Types/_collection/RecordSet', () => {
    function getItems(): IItem[] {
        return [{
            id: 1,
            name: 'Ivanoff'
        }, {
            id: 2,
            name: 'Petroff'
        }, {
            id: 3,
            name: 'Sidoroff'
        }, {
            id: 4,
            name: 'Puhoff'
        }, {
            id: 5,
            name: 'Molotsoff'
        }, {
            id: 6,
            name: 'Hangryoff'
        }, {
            id: 7,
            name: 'Arbuzznoff'
        }, {
            id: 8,
            name: 'Arbuzznoff'
        }];
    }

    function getSomeItem(): IItem {
        return {
            id: 999,
            name: 'Test'
        };
    }

    function getSbisItems(): ITableFormat {
        return {
            d: [
                [1, 'Ivanoff'],
                [2, 'Petroff'],
                [3, 'Sidoroff'],
                [4, 'Puhoff'],
                [5, 'Molotsoff'],
                [6, 'Hangryoff'],
                [7, 'Arbuzznoff'],
                [8, 'Arbuzznoff']
            ],
            s: [{
                n: 'id',
                t: 'Число целое'
            }, {
                n: 'name',
                t: 'Строка'
            }]
        };
    }

    function getItemsFormat(): IDeclaration[] {
        return [
            {name: 'id', type: 'integer'},
            {name: 'name', type: 'string'}
        ];
    }

    let rs: RecordSet;
    let items: IItem[];

    beforeEach(() => {
        items = getItems();
        rs = new RecordSet({
            rawData: getItems(),
            keyProperty: 'id'
        });
    });

    afterEach(() => {
        rs.destroy();
        rs = undefined;

        items = undefined;
    });

    describe('.constructor()', () => {
        it('should pass keyProperty to the record', () => {
            assert.equal(rs.at(1).get('id'), 2);
        });
    });

    describe('.getEnumerator()', () => {
        it('should return records', () => {
            const enumerator = rs.getEnumerator();
            while (enumerator.moveNext()) {
                assert.instanceOf(enumerator.getCurrent(), Record);
            }
        });

        it('should return all records', () => {
            const enumerator = rs.getEnumerator();
            let foundCount = 0;
            while (enumerator.moveNext()) {
                foundCount++;
            }
            assert.equal(rs.getCount(), foundCount);
        });

        it('should return records owned by itself', () => {
            const enumerator = rs.getEnumerator();
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent().getOwner(), rs);
            }
        });

        it('should return records with state "Unchanged"', () => {
            const enumerator = rs.getEnumerator();
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent().getState(), RecordState.UNCHANGED);
            }
        });

        it('should return only records with state "Unchanged"', () => {
            const enumerator = rs.getEnumerator(RecordState.UNCHANGED);
            let foundCount = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent().getState(), RecordState.UNCHANGED);
                foundCount++;
            }
            assert.equal(rs.getCount(), foundCount);
        });

        it('should return no records with state "Changed"', () => {
            const enumerator = rs.getEnumerator(RecordState.CHANGED);
            let found = false;
            while (enumerator.moveNext()) {
                found = true;
            }
            assert.isFalse(found);
        });

        it('should return only records with state "Changed"', () => {
            rs.at(1).set('id', 'test');
            const enumerator = rs.getEnumerator(RecordState.CHANGED);
            let foundCount = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent().getState(), RecordState.CHANGED);
                foundCount++;
            }
            assert.equal(foundCount, 1);
        });

        it('should return no records with state "Added"', () => {
            const enumerator = rs.getEnumerator(RecordState.ADDED);
            let found = false;
            while (enumerator.moveNext()) {
                found = true;
            }
            assert.isFalse(found);
        });

        it('should return only records with state "Added"', () => {
            rs.add(new Model());
            const enumerator = rs.getEnumerator(RecordState.ADDED);
            let foundCount = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent().getState(), RecordState.ADDED);
                foundCount++;
            }
            assert.equal(foundCount, 1);
        });

        it('should return no records with state "Deleted"', () => {
            const enumerator = rs.getEnumerator(RecordState.DELETED);
            let found = false;
            while (enumerator.moveNext()) {
                found = true;
            }
            assert.isFalse(found);
        });

        it('should return only records with state "Deleted"', () => {
            rs.at(2).setState(RecordState.DELETED);
            const enumerator = rs.getEnumerator(RecordState.DELETED);
            let foundCount = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent().getState(), RecordState.DELETED);
                foundCount++;
            }
            assert.equal(foundCount, 1);
        });

        it('should return no records with state "Detached"', () => {
            const enumerator = rs.getEnumerator(RecordState.DETACHED);
            let found = false;
            while (enumerator.moveNext()) {
                found = true;
            }
            assert.isFalse(found);
        });
    });

    describe('.each()', () => {
        it('should return records', () => {
            rs.each((record) => {
                assert.instanceOf(record, Record);
            });
        });

        it('should return all records', () => {
            let foundCount = 0;
            rs.each(() => foundCount++);
            assert.equal(rs.getCount(), foundCount);
        });

        it('should return record indexes', () => {
            let expected = 0;
            rs.each((record, index) => {
                assert.equal(index, expected);
                expected++;
            });
        });

        it('should make call in self context', () => {
            rs.each(function(): void {
                assert.strictEqual(this, rs as any);
            });
        });

        it('should make call in given context if state is skipped', () => {
            const context = {};
            rs.each(function(): void {
                assert.strictEqual(this, context);
            }, context);
        });

        it('should make call in given context if state is used', () => {
            const context = {};
            rs.each(function(): void {
                assert.strictEqual(this, context);
            }, RecordState.UNCHANGED, context);
        });

        it('should return records owned by itself', () => {
            rs.each((record) => {
                assert.strictEqual(record.getOwner(), rs);
            });
        });

        it('should return read only records from read only recordset', () => {
            const rs = new RecordSet({
                rawData: getItems(),
                writable: false
            });
            rs.each((record) => {
                assert.isFalse(record.writable);
            });
        });

        it('should return records with state "Unchanged"', () => {
            rs.each((record) => {
                assert.strictEqual(record.getState(), RecordState.UNCHANGED);
            });
        });

        it('should return only records with state "Unchanged"', () => {
            let foundCount = 0;
            rs.each((record) => {
                assert.strictEqual(record.getState(), RecordState.UNCHANGED);
                foundCount++;
            }, RecordState.UNCHANGED);
            assert.equal(rs.getCount(), foundCount);
        });

        it('should return no records with state "Changed"', () => {
            let found = false;
            rs.each(() => {
                found = true;
            }, RecordState.CHANGED);
            assert.isFalse(found);
        });

        it('should return only records with state "Changed"', () => {
            rs.at(1).set('id', 'test');
            let foundCount = 0;
            rs.each((record) => {
                assert.strictEqual(record.getState(), RecordState.CHANGED);
                foundCount++;
            }, RecordState.CHANGED);
            assert.equal(foundCount, 1);
        });

        it('should return no records with state "Added"', () => {
            let found = false;
            rs.each(() => {
                found = true;
            }, RecordState.ADDED);
            assert.isFalse(found);
        });

        it('should return only records with state "Added"', () => {
            rs.add(new Model());
            let foundCount = 0;
            rs.each((record) => {
                assert.strictEqual(record.getState(), RecordState.ADDED);
                foundCount++;
            }, RecordState.ADDED);
            assert.equal(foundCount, 1);
        });

        it('should return no records with state "Deleted"', () => {
            let found = false;
            rs.each(() => {
                found = true;
            }, RecordState.DELETED);
            assert.isFalse(found);
        });

        it('should return only records with state "Deleted"', () => {
            rs.at(2).setState(RecordState.DELETED);
            let foundCount = 0;
            rs.each((record) => {
                assert.strictEqual(record.getState(), RecordState.DELETED);
                foundCount++;
            }, RecordState.DELETED);
            assert.equal(foundCount, 1);
        });

        it('should return no records with state "Detached"', () => {
            let found = false;
            rs.each(() => {
                found = true;
            }, RecordState.DETACHED);
            assert.isFalse(found);
        });
    });

    describe('.isEqual()', () => {
        it('should accept an invalid argument', () => {
            const rs = new RecordSet();
            assert.isFalse(rs.isEqual(undefined));
            assert.isFalse(rs.isEqual(null));
            assert.isFalse(rs.isEqual(false));
            assert.isFalse(rs.isEqual(true));
            assert.isFalse(rs.isEqual(0));
            assert.isFalse(rs.isEqual(1));
            assert.isFalse(rs.isEqual({}));
            assert.isFalse(rs.isEqual([]));
        });

        it('should return true for the same RecordSet', () => {
            const same = new RecordSet({
                rawData: getItems()
            });
            assert.isTrue(rs.isEqual(same));
        });

        it('should return true for itself', () => {
            assert.isTrue(rs.isEqual(rs));
        });

        it('should return true for the clone', () => {
            assert.isTrue(rs.isEqual(rs.clone()));
        });

        it('should return true for empties', () => {
            const rs = new RecordSet();
            assert.isTrue(rs.isEqual(new RecordSet()));
        });

        it('should return false if record added', () => {
            const same = new RecordSet({
                rawData: getItems()
            });
            same.add(rs.at(0).clone());
            assert.isFalse(rs.isEqual(same));
        });

        it('should return true if same record replaced', () => {
            const same = new RecordSet({
                rawData: getItems()
            });
            same.replace(rs.at(0).clone(), 0);
            assert.isTrue(rs.isEqual(same));
        });

        it('should return false if not same record replaced', () => {
            const same = new RecordSet({
                rawData: getItems()
            });
            same.replace(rs.at(1).clone(), 0);
            assert.isFalse(rs.isEqual(same));
        });

        it('should return false if record removed', () => {
            const same = new RecordSet({
                rawData: getItems()
            });
            same.removeAt(0);
            assert.isFalse(rs.isEqual(same));
        });

        it('should return false if record updated', () => {
            const same = new RecordSet({
                rawData: getItems()
            });
            same.at(0).set('name', 'Aaa');
            assert.isFalse(rs.isEqual(same));
        });
    });

    describe('.getRawData()', () => {
        it('should return the value that was passed to the constructor', () => {
            const data = [{}];
            const rs = new RecordSet({
                rawData: data
            });
            assert.deepEqual(rs.getRawData(), data);
        });

        it('should return the changed value after add a new record', () => {
            const rs = new RecordSet();
            const data = {a: 1};
            rs.add(new Model({
                rawData: data
            }));
            assert.deepEqual(rs.getRawData()[0], data);
        });
    });

    describe('.setRawData()', () => {
        it('should return elem by index', () => {
            const rs = new RecordSet({
                rawData: getItems(),
                keyProperty: 'id'
            });
            rs.setRawData([{
                id: 1000,
                name: 'Foo'
            }, {
                id: 1001,
                name: 'Bar'
            }]);
            assert.equal(rs.getIndex(rs.at(1)), 1);
        });

        it('should replace a record', () => {
            const oldRec = rs.at(0);

            rs.setRawData([{
                id: 1,
                name: 'Foo'
            }]);
            const newRec = rs.at(0);

            assert.notEqual(oldRec, newRec);
        });

        it('should change state of replaced record to "Detached"', () => {
            const oldRec = rs.at(0);

            rs.setRawData([{
                id: 1,
                name: 'Foo'
            }]);

            assert.equal(oldRec.getState(), RecordState.DETACHED);
        });

        it('should trigger an event with valid arguments', () => {
            const given: any = {};
            let firesCount = 0;
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.action = action;
                given.newItems = newItems;
                given.newItemsIndex = newItemsIndex;
                given.oldItems = oldItems;
                given.oldItemsIndex = oldItemsIndex;
                firesCount++;
            };
            const oldCount = rs.getCount();

            rs.subscribe('onCollectionChange', handler);
            rs.setRawData([{
                id: 1,
                name: 'Ivanoff'
            }, {
                id: 2,
                name: 'Petroff'
            }, {
                id: 13,
                name: 'Sidoroff'
            }]);
            rs.unsubscribe('onCollectionChange', handler);

            assert.strictEqual(firesCount, 1);
            assert.strictEqual(given.action, IBindCollection.ACTION_RESET);
            assert.strictEqual(given.newItems.length, rs.getCount());
            assert.strictEqual(given.newItemsIndex, 0);
            assert.strictEqual(given.oldItems.length, oldCount);
            assert.strictEqual(given.oldItemsIndex, 0);
        });
    });

    describe('.getFormat()', () => {
        it('should build the format from json raw data', () => {
            const format = rs.getFormat();
            assert.strictEqual(format.getCount(), 2);
            assert.strictEqual(format.at(0).getName(), 'id');
            assert.strictEqual(format.at(1).getName(), 'name');
        });

        it('should return empty format for empty raw data', () => {
            const rs = new RecordSet();
            assert.strictEqual(rs.getFormat().getCount(), 0);
        });

        it('should build the format from sbis raw data', () => {
            const data = getSbisItems();
            const rs = new RecordSet({
                rawData: data,
                adapter: 'Types/entity:adapter.Sbis'
            });
            const format = rs.getFormat();

            assert.strictEqual(format.getCount(), data.s.length);
            format.each((item, index) => {
                assert.strictEqual(item.getName(), data.s[index].n);
            });
        });

        it('should build the record format from declarative option', () => {
            const declaration = [{
                name: 'id',
                type: 'integer'
            }, {
                name: 'title',
                type: 'string'
            }, {
                name: 'max',
                type: 'integer'
            }, {
                name: 'main',
                type: 'boolean'
            }];
            const rs = new RecordSet({
                format: declaration,
                rawData: items
            });
            const format = rs.getFormat();

            assert.strictEqual(format.getCount(), declaration.length);
            format.each((item, index) => {
                assert.strictEqual(item.getName(), declaration[index].name);
                assert.strictEqual(String(item.getType()).toLowerCase(), declaration[index].type);
            });
        });

        it('should build the format by Model\'s format if don\'t have it\'s own', () => {
            class Foo extends Model {
                // Nothing
            }
            Object.assign(Foo.prototype, {_$format: {
                bar: Number
            }});

            const rs = new RecordSet({
                model: Foo
            });
            const format = rs.getFormat();

            assert.strictEqual(format.at(0).getName(), 'bar');
            assert.strictEqual(format.at(0).getType(), Number);
        });

        it('should return data for linked format', () => {
            const rs = new RecordSet({
                rawData:  {
                    s: [{
                        n: 'foo', t: 'Запись'
                    }],
                    d: [[{
                        f: 1,
                        s: [{n: 'First name', t: 'Строка'}],
                        d: ['John'],
                        t: 'Запись'
                    }], [{
                        f: 1,
                        d: ['Mike'],
                        t: 'Запись'
                    }]],
                    t: 'recordset'
                },
                adapter: 'Types/entity:adapter.Sbis'
            });

            assert.strictEqual(rs.at(1).get('foo').get('First name'), 'Mike');
        });

    });

    describe('.addField()', () => {
        it('should add the field from the declaration for JSON adapter', () => {
            const keyProperty = 'id';
            const fieldName = 'login';
            const fieldDefault = 'user';
            const index = 0;

            rs = new RecordSet({
                rawData: getItems(),
                keyProperty
            });

            // Force create indices
            rs.each((record) => {
                record.get(keyProperty);
            });

            rs.addField({
                name: fieldName,
                type: 'string',
                defaultValue: fieldDefault
            }, index);

            const format = rs.getFormat();
            assert.strictEqual(format.at(index).getName(), fieldName);
            assert.strictEqual(format.at(index).getDefaultValue(), fieldDefault);

            rs.each((record) => {
                const format = record.getFormat();
                assert.strictEqual(format.at(index).getName(), fieldName);
                assert.strictEqual(format.at(index).getDefaultValue(), fieldDefault);

                assert.strictEqual(record.get(fieldName), fieldDefault);
            });
        });

        it('should add the field from the declaration for SBIS adapter', () => {
            const keyProperty = 'id';
            const index = 0;
            const fieldName = 'login';
            const fieldDefault = 'user';

            const rs = new RecordSet({
                rawData: getSbisItems(),
                adapter: 'Types/entity:adapter.Sbis',
                keyProperty
            });

            // Force create indices
            rs.each((record) => {
                record.get(keyProperty);
            });

            rs.addField({
                name: fieldName,
                type: 'string',
                defaultValue: fieldDefault
            }, index);

            const format = rs.getFormat();
            assert.strictEqual(format.at(index).getName(), fieldName);
            assert.strictEqual(format.at(index).getDefaultValue(), fieldDefault);

            rs.each((record) => {
                const format = record.getFormat();
                assert.strictEqual(format.at(index).getName(), fieldName);
                assert.strictEqual(format.at(index).getDefaultValue(), fieldDefault);

                assert.strictEqual(record.get(fieldName), fieldDefault);
            });
        });

        it('should set the field value for record with different format the use SBIS adapter', () => {
            const rs = new RecordSet<unknown, Record>({
                rawData: getSbisItems(),
                adapter: 'Types/entity:adapter.Sbis'
            });
            const recordS = rs.getRawData().s;
            const fieldName = 'name';

            recordS.pop();
            const record = new Record({
                rawData: {
                    d: [111],
                    s: recordS
                },
                adapter: 'Types/entity:adapter.Sbis'
            });

            // Force create indices
            record.get(fieldName);

            const addedRecord = rs.add(record);

            addedRecord.set(fieldName, 'bar');
            assert.strictEqual(addedRecord.get(fieldName), 'bar');
        });

        it('should add the field and set it value for the added record use SBIS adapter', () => {
            const keyProperty = 'id';
            const rs = new RecordSet<unknown, Record>({
                rawData: getSbisItems(),
                adapter: 'Types/entity:adapter.Sbis',
                keyProperty
            });
            const record = new Record({
                rawData: {
                    d: [111, 'foo'],
                    s: rs.getRawData().s
                },
                adapter: 'Types/entity:adapter.Sbis'
            });
            const index = 0;
            const fieldName = 'login';
            const fieldDefault = 'user';

            // Force create indices
            record.get(keyProperty);

            rs.addField({
                name: fieldName,
                type: 'string',
                defaultValue: fieldDefault
            }, index);

            const addedRecord = rs.add(record);
            addedRecord.set(fieldName, 'bar');

            assert.strictEqual(addedRecord.get(fieldName), 'bar');
        });

        it('should add the field from the instance', () => {
            const fieldName = 'login';
            const fieldDefault = 'username';

            rs.addField(fieldsFactory({
                name: fieldName,
                type: 'string',
                defaultValue: fieldDefault
            }));
            const index = rs.getFormat().getCount() - 1;

            assert.strictEqual(rs.getFormat().at(index).getName(), fieldName);
            assert.strictEqual(rs.getFormat().at(index).getDefaultValue(), fieldDefault);
            rs.each((record) => {
                assert.strictEqual(record.get(fieldName), fieldDefault);
                assert.strictEqual(record.getRawData()[fieldName], fieldDefault);
            });
        });

        it('should define format evidently', () => {
            const index = 0;
            const fieldName = 'login';
            const fieldDefault = 'user';
            rs.addField({
                name: fieldName,
                type: 'string',
                defaultValue: fieldDefault
            }, index);
            rs.assign([]);
            assert.strictEqual(rs.getFormat().at(index).getName(), fieldName);
            assert.strictEqual(rs.getFormat().at(index).getDefaultValue(), fieldDefault);
        });

        it('should add the field with the value', () => {
            const fieldName = 'login';
            const fieldValue = 'root';
            rs.addField({name: fieldName, type: 'string', defaultValue: 'user'}, 0, fieldValue);

            rs.each((record) => {
                assert.strictEqual(record.get(fieldName), fieldValue);
                assert.strictEqual(record.getRawData()[fieldName], fieldValue);
            });
        });

        it('should throw an error if the field is already defined', () => {
            const format = getItemsFormat();
            const rs = new RecordSet({format});

            assert.throws(() => {
                rs.addField({name: 'name', type: 'string'});
            });
        });

        it('should throw an error if add the field twice', () => {
            rs.addField({name: 'new', type: 'string'});
            assert.throws(() => {
                rs.addField({name: 'new', type: 'string'});
            });
        });

        it('should add field if it has sbis adapter and its has copied data', () => {
            const rs = new RecordSet({
                rawData: getSbisItems(),
                adapter: new CowAdapter(new SbisAdapter())
            });
            rs.at(0).set('name', 'Foo');
            rs.addField({name: 'new', type: 'string'});
            assert.doesNotThrow(() => {
                rs.at(0).set('new', '12');
            });
        });
    });

    describe('.removeField()', () => {
        it('should remove the exists field', () => {
            const format = getItemsFormat();
            const fieldName = 'name';
            const rs = new RecordSet({
                adapter: 'Types/entity:adapter.Sbis',
                format,
                rawData: getSbisItems()
            });

            rs.removeField(fieldName);

            assert.strictEqual(rs.getFormat().getFieldIndex(fieldName), -1);
            assert.strictEqual(rs.getRawData().s.length, 1);
            rs.each((record) => {
                assert.isFalse(record.has(fieldName));
                assert.isUndefined(record.get(fieldName));
                assert.strictEqual(record.getRawData().s.length, 1);
            });
        });

        it('should throw an error if adapter doesn\'t support fields detection', () => {
            const rs = new RecordSet();
            const fieldName = 'name';
            assert.throws(() => {
                rs.removeField(fieldName);
            });
        });

        it('should throw an error for not defined field', () => {
            const rs = new RecordSet({
                adapter: 'Types/entity:adapter.Sbis',
                rawData: getSbisItems()
            });
            assert.throws(() => {
                rs.removeField('some');
            });
        });

        it('should throw an error if remove the field twice', () => {
            const format = getItemsFormat();
            const rs = new RecordSet({
                adapter: 'Types/entity:adapter.Sbis',
                format,
                rawData: getSbisItems()
            });

            rs.removeField('name');
            assert.throws(() => {
                rs.removeField('name');
            });
        });

        it('should remove field from original data', () => {
            const data = getSbisItems();
            const rs = new RecordSet({
                rawData: data,
                adapter: new SbisAdapter()
            });

            assert.equal(data.s.length, 2);
            rs.removeField('name');
            assert.equal(data.s.length, 1);
        });
    });

    describe('.removeFieldAt()', () => {
        it('should throw an error if adapter doesn\'t support fields indexes', () => {
            const format = getItemsFormat();
            const rs = new RecordSet({
                format,
                rawData: getItems()
            });

            assert.throws(() => {
                rs.removeFieldAt(0);
            });
        });

        it('should remove the exists field', () => {
            const format = getItemsFormat();
            const fieldIndex = 1;
            const fieldName = format[fieldIndex].name;
            const rs = new RecordSet({
                adapter: 'Types/entity:adapter.Sbis',
                format,
                rawData: getSbisItems()
            });

            rs.removeFieldAt(fieldIndex);

            assert.isUndefined(rs.getFormat().at(fieldIndex));
            assert.strictEqual(rs.getRawData().s.length, 1);
            rs.each((record) => {
                assert.isFalse(record.has(fieldName));
                assert.isUndefined(record.get(fieldName));
                assert.strictEqual(record.getRawData().s.length, 1);
            });
        });

        it('should throw an error for not exists index', () => {
            assert.throws(() => {
                const rs = new Record({
                    adapter: 'Types/entity:adapter.Sbis'
                });
                rs.removeFieldAt(0);
            });
        });
    });

    describe('.append()', () => {
        it('should return added items', () => {
            const rd = [{
                id: 50,
                name: '50'
            }, {
                id: 51,
                name: '51'
            }];

            const added = rs.append([new Model({
                rawData: rd[0]
            }), new Model({
                rawData: rd[1]
            })]);

            assert.equal(added.length, rd.length);
            assert.deepEqual(added[0].getRawData(), rd[0]);
            assert.deepEqual(added[1].getRawData(), rd[1]);
        });

        it('should change raw data', () => {
            const rd = [{
                id: 50,
                name: '50'
            }, {
                id: 51,
                name: '51'
            }];
            rs.append(new RecordSet({
                rawData: rd
            }));
            Array.prototype.push.apply(items, rd);
            assert.deepEqual(rs.getRawData(), items);
            assert.deepEqual(rs.getCount(), items.length);
            items.forEach((item, i) => {
                assert.deepEqual(rs.at(i).getRawData(), item);
            });
        });

        it('should take format from first record to clear recordSet', () => {
            const rs = new RecordSet<unknown, Record>({
                rawData: [{id: 1, name: 'John'}]
            });
            const recs = [new Record({
                rawData: {id: 1, count: 3, name: 'John'}
            })];

            assert.equal(rs.getFormat().getCount(), 2);
            rs.clear();
            rs.append(recs);
            assert.equal(rs.getFormat().getCount(), 3);
        });

        it('should keep foreign records owner', () => {
            const records = [new Model(), new Model(), new Model()];
            rs.append(records);
            for (let i = 0; i < records.length; i++) {
                assert.isNull(records[i].getOwner());
            }
        });

        it('should set the new records owner to itself', () => {
            const records = [new Model(), new Model(), new Model()];
            const start = rs.getCount();
            const finish = start + records.length;

            rs.append(records);
            for (let i = start; i < finish; i++) {
                assert.strictEqual(rs.at(i).getOwner(), rs);
            }
        });

        it('should keep foreign records state', () => {
            const records = [new Model(), new Model(), new Model()];
            rs.append(records);
            for (let i = 0; i < records.length; i++) {
                assert.strictEqual(records[i].getState(), RecordState.DETACHED);
            }
        });

        it('should set the new records state to "Added"', () => {
            const records = [new Model(), new Model(), new Model()];
            const start = rs.getCount();
            const finish = start + records.length;

            rs.append(records);
            for (let i = start; i < finish; i++) {
                assert.strictEqual(rs.at(i).getState(), RecordState.ADDED);
            }
        });

        it('should don\'t change source record raw data if result record changed', () => {
            const source = new Model({
                rawData: {foo: 'bar'}
            });
            const at = rs.getCount();

            rs.append([source]);

            const result = rs.at(at);
            result.set('foo', 'baz');

            assert.equal(source.getRawData().foo, 'bar');
            assert.equal(result.getRawData().foo, 'baz');
        });

        it('should update raw data if record changed', () => {
            const source = new Model({
                rawData: {foo: 'bar'}
            });
            const at = rs.getCount();

            rs.append([source]);

            const result = rs.at(at);
            result.set('foo', 'baz');

            assert.equal(rs.getRawData()[at].foo, 'baz');
        });

        it('should throw an error for not a Record', () => {
            const data4 = {id: 4};
            const data5 = {id: 5};
            assert.throws(() => {
                rs.append([new Model({
                    rawData: data4
                }), data5 as any]);
            });
        });

        it('should throw an TypeError for incompatible adapter', () => {
            const record = new Model({
                adapter: 'Types/entity:adapter.Sbis'
            });
            assert.throws(() => {
                rs.append([record]);
            }, TypeError);
        });

        it('should trigger "onCollectionChange" with valid arguments', () => {
            const newRs = new RecordSet({
                rawData: [{
                    id: 13,
                    name: 'Foo'
                }]
            });
            const oldCount = rs.getCount();
            const expected: any[] = [{
                action: IBindCollection.ACTION_ADD,
                oldItems: [],
                oldItemsIndex: 0
            }];
            const given: any[] = [];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({action, newItems, newItemsIndex, oldItems, oldItemsIndex});
            };

            rs.subscribe('onCollectionChange', handler);
            rs.append(newRs);
            rs.unsubscribe('onCollectionChange', handler);

            expected[0].newItems = [rs.at(oldCount)];
            expected[0].newItemsIndex = oldCount;

            assert.deepEqual(given, expected);
        });
    });

    describe('.prepend', () => {
        it('should return added items', () => {
            const rd = [{
                id: 50,
                name: '50'
            }, {
                id: 51,
                name: '51'
            }];

            const added = rs.prepend([new Model({
                rawData: rd[0]
            }), new Model({
                rawData: rd[1]
            })]);

            assert.equal(added.length, rd.length);
            assert.deepEqual(added[0].getRawData(), rd[0]);
            assert.deepEqual(added[1].getRawData(), rd[1]);
        });

        it('should change raw data', () => {
            const rd: any[] = [{
                id: 50,
                name: '50'
            }, {
                id: 51,
                name: '51'
            }];
            rs.prepend(new RecordSet({
                rawData: rd
            }));
            Array.prototype.splice.apply(items, ([0, 0].concat(rd)));

            assert.deepEqual(rs.getRawData(), items);
            assert.deepEqual(rs.getCount(), items.length);
            items.forEach((item, i) => {
                assert.deepEqual(rs.at(i).getRawData(), item);
            });
        });

        it('should keep foreign records owner', () => {
            const records = [new Model(), new Model(), new Model()];
            rs.prepend(records);
            for (let i = 0; i < records.length; i++) {
                assert.isNull(records[i].getOwner());
            }
        });

        it('should set the new records owner to itself', () => {
            const records = [new Model(), new Model(), new Model()];
            const start = 0;
            const finish = records.length;

            rs.prepend(records);
            for (let i = start; i < finish; i++) {
                assert.strictEqual(rs.at(i).getOwner(), rs);
            }
        });

        it('should keep foreign records state', () => {
            const records = [new Model(), new Model(), new Model()];
            rs.prepend(records);
            for (let i = 0; i < records.length; i++) {
                assert.strictEqual(records[i].getState(), RecordState.DETACHED);
            }
        });

        it('should set the new records state to "Added"', () => {
            const records = [new Model(), new Model(), new Model()];
            const start = 0;
            const finish = records.length;

            rs.prepend(records);
            for (let i = start; i < finish; i++) {
                assert.strictEqual(rs.at(i).getState(), RecordState.ADDED);
            }
        });

        it('should throw an error', () => {
            const data4 = {id: 4};
            const data5 = {id: 5};
            assert.throws(() => {
                rs.prepend([new Model({
                    rawData: data4
                }), data5 as any]);
            });
        });

        it('should throw an TypeError for incompatible adapter', () => {
            const record = new Model({
                adapter: 'Types/entity:adapter.Sbis'
            });
            assert.throws(() => {
                rs.prepend([record]);
            }, TypeError);
        });

        it('should trigger "onCollectionChange" with valid arguments', () => {
            const newRs = new RecordSet({
                rawData: [{
                    id: 13,
                    name: 'Foo'
                }]
            });
            const expected: any[] = [{
                action: IBindCollection.ACTION_ADD,
                oldItems: [],
                oldItemsIndex: 0
            }];
            const given: any[] = [];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({action, newItems, newItemsIndex, oldItems, oldItemsIndex});
            };

            rs.subscribe('onCollectionChange', handler);
            rs.prepend(newRs);
            rs.unsubscribe('onCollectionChange', handler);

            expected[0].newItems = [rs.at(0)];
            expected[0].newItemsIndex = 0;

            assert.deepEqual(given, expected);
        });
    });

    describe('.assign()', () => {
        it('should have no effect with itself', () => {
            const oldCount = rs.getCount();
            const oldRawData = rs.getRawData(true);

            rs.assign(rs);

            assert.strictEqual(rs.getCount(), oldCount);
            assert.strictEqual(rs.getRawData(true), oldRawData);
        });

        it('should return added items', () => {
            const rs = new RecordSet({
                rawData: [{id: 1}, {id: 2}, {id: 3}]
            });
            const data4 = {id: 4};
            const data5 = {id: 5};

            const added = rs.assign([new Model({
                rawData: data4
            }), new Model({
                rawData: data5
            })]);

            assert.equal(added.length, 2);
            assert.deepEqual(added[0].getRawData(), data4);
            assert.deepEqual(added[1].getRawData(), data5);
        });

        it('should return empty added items if RecordSet given', () => {
            const source = new RecordSet({
                rawData: [{foo: 'bar'}]
            });

            const added = rs.assign(source);

            assert.equal(added.length, source.getCount());
            assert.isUndefined(added[0]);
        });

        it('should change raw data and count', () => {
            const rs = new RecordSet({
                rawData: [{id: 1}, {id: 2}, {id: 3}]
            });
            const data4 = {id: 4};
            const data5 = {id: 5};

            rs.assign([new Model({
                rawData: data4
            }), new Model({
                rawData: data5
            })]);

            assert.deepEqual(rs.getRawData()[0], data4);
            assert.deepEqual(rs.getRawData()[1], data5);
            assert.deepEqual(rs.at(0).getRawData(), data4);
            assert.deepEqual(rs.at(1).getRawData(), data5);
            assert.strictEqual(rs.getCount(), 2);
        });

        it('should keep raw data format for SBIS adapter after become empty', () => {
            const adapter = new SbisAdapter();
            const format = [{n: 'foo', t: 'Строка'}];
            const rawData = {
                _type: 'recordset',
                d: [['bar']],
                s: format
            };
            const rs = new RecordSet({adapter, rawData});

            rs.assign([]);

            const resultData = rs.getRawData();
            assert.deepEqual(resultData, {
                _type: 'recordset',
                d: [],
                s: format
            });
        });

        it('should keep foreign records owner', () => {
            const records = [new Model(), new Model(), new Model()];

            rs.assign(records);
            for (let i = 0; i < records.length; i++) {
                assert.isNull(records[i].getOwner());
            }
        });

        it('should set the new records owner to itself', () => {
            const records = [new Model(), new Model(), new Model()];
            const start = 0;
            const finish = records.length;

            rs.assign(records);
            for (let i = start; i < finish; i++) {
                assert.strictEqual(rs.at(i).getOwner(), rs);
            }
        });

        it('should keep foreign records state', () => {
            const records = [new Model(), new Model(), new Model()];

            rs.assign(records);
            for (let i = 0; i < records.length; i++) {
                assert.strictEqual(records[i].getState(), RecordState.DETACHED);
            }
        });

        it('should set the new records state to "Added"', () => {
            const records = [new Model(), new Model(), new Model()];
            const start = 0;
            const finish = records.length;

            rs.assign(records);
            for (let i = start; i < finish; i++) {
                assert.strictEqual(rs.at(i).getState(), RecordState.ADDED);
            }
        });

        it('should reset the old records owner', () => {
            const records = [];
            rs.each((record) => {
                records.push(record);
            });

            rs.assign([]);
            for (let i = 0; i < records.length; i++) {
                assert.isNull(records[i].getOwner());
            }
        });

        it('should set the old records state to "Detached"', () => {
            const records = [];
            rs.each((record) => {
                records.push(record);
            });

            rs.assign([]);
            for (let i = 0; i < records.length; i++) {
                assert.strictEqual(records[i].getState(), RecordState.DETACHED);
            }
        });

        it('should take adapter from assigning RecordSet', () => {
            const rs1 = new RecordSet({
                adapter: new JsonAdapter()
            });
            const rs2 = new RecordSet({
                adapter: new SbisAdapter()
            });

            assert.notEqual(rs1.getAdapter(), rs2.getAdapter());
            rs1.assign(rs2);
            assert.strictEqual(rs1.getAdapter(), rs2.getAdapter());
        });

        it('should take adapter from the first record of assigning Array', () => {
            const rs = new RecordSet<unknown, Record>({
                adapter: new JsonAdapter()
            });
            const arr = [new Record({adapter: 'Types/entity:adapter.Sbis'})];

            assert.notEqual(rs.getAdapter(), arr[0].getAdapter());
            rs.assign(arr);
            assert.strictEqual(rs.getAdapter(), arr[0].getAdapter());
        });

        it('should take raw data format from assigning RecordSet', () => {
            const s1 = [
                {n: 'Id', t: 'Число целое'},
                {n: 'Name', t: 'Строка'}
            ];
            const s2 = [
                {n: 'Id', t: 'Число целое'},
                {n: 'Count', t: 'Число целое'},
                {n: 'Name', t: 'Строка'}
            ];
            const rs1 = new RecordSet({
                rawData: {
                    d: [[7, 'John']],
                    s: s1
                },
                adapter: 'Types/entity:adapter.Sbis'
            });
            const rs2 = new RecordSet({
                rawData: {
                    d: [[7, 4, 'Bill']],
                    s: s2
                },
                adapter: 'Types/entity:adapter.Sbis'
            });

            assert.deepEqual(rs1.getRawData().s, s1);
            rs1.assign(rs2);
            assert.deepEqual(rs1.getRawData().s, s2);
        });

        it('should take format from assigning RecordSet', () => {
            const data1 = [{id: 1, name: 'John'}];
            const data2 = [{id: 1, count: 3, name: 'John'}];
            const rs1 = new RecordSet({
                rawData: data1
            });
            const rs2 = new RecordSet({
                rawData: data2
            });

            assert.equal(rs1.getFormat().getCount(), 2);
            rs1.assign(rs2);
            assert.equal(rs1.getFormat().getCount(), 3);
        });

        it('should apply its own format to the external item', () => {
            const data1 = [{id: 1, count: 3, name: 'John'}];
            const data2 = [{id: 2, name: 'Jim'}];
            const rs1 = new RecordSet({
                rawData: data1,
                format: {
                    id: Number,
                    count: Number,
                    name: String
                }
            });
            const rs2 = new RecordSet({
                rawData: data2
            });

            rs1.assign(rs2);
            assert.equal(rs1.getCount(), 1);
            assert.equal(rs1.at(0).get('id'), 2);
            assert.isUndefined(rs1.at(0).get('count'));
            assert.equal(rs1.at(0).get('name'), 'Jim');
        });

        it('should don\'t change source record raw data if result record changed', () => {
            const source = new RecordSet({
                rawData: [{foo: 'bar'}]
            });

            rs.assign(source);

            const result = rs.at(0);
            result.set('foo', 'baz');

            assert.equal(source.getRawData()[0].foo, 'bar');
            assert.equal(result.getRawData().foo, 'baz');
        });

        it('should update raw data if record changed', () => {
            const source = new RecordSet({
                rawData: [{foo: 'bar'}]
            });

            rs.assign(source);

            const result = rs.at(0);
            result.set('foo', 'baz');

            assert.equal(rs.getRawData()[0].foo, 'baz');
        });

        it('should throw an error if pass not a record', () => {
            const data4 = {id: 4};
            const data5 = {id: 5};
            assert.throws(() => {
                rs.assign([new Model({
                    rawData: data4
                }), data5 as any]);
            });
        });

        it('should throw an TypeError for incompatible adapter', () => {
            const validRecord = new Model({
                adapter: 'Types/entity:adapter.Sbis'
            });
            const invalidRecord = new Model({
                adapter: 'Types/entity:adapter.Json'
            });
            assert.throws(() => {
                rs.assign([validRecord, invalidRecord]);
            }, TypeError);
        });

        it('should don\'t throw an TypeError for incompatible adapter', () => {
            const validRecord = new Model({
                adapter: 'Types/entity:adapter.Sbis'
            });
            rs.assign([validRecord, validRecord]);
        });

        it('should change format with new one', () => {
            const rs = new RecordSet({
                rawData: {
                    d: [[7]],
                    s: [{n: 'id', t: 'Число целое'}]
                },
                adapter: 'Types/entity:adapter.Sbis'
            });
            const rs2 = new RecordSet({
                rawData: {
                    d: [['Arbuzznoff']],
                    s: [{n: 'name', t: 'Строка'}]
                },
                adapter: 'Types/entity:adapter.Sbis'
            });
            rs.assign(rs2);
            assert.deepEqual(rs.getRawData().s, [{n: 'name', t: 'Строка'}]);
        });

        it('should don\'t throw an error if format is defined directly', () => {
            const rs = new RecordSet({
                rawData: {
                    d: [[7]],
                    s: [{n: 'id', t: 'Число целое'}]
                },
                adapter: 'Types/entity:adapter.Sbis',
                format: [{name: 'id', type: 'Integer'}]
            });
            const rs2 = new RecordSet({
                rawData: {
                    d: [['Arbuzznoff']],
                    s: [{n: 'name', t: 'Строка'}]
                },
                adapter: 'Types/entity:adapter.Sbis'
            });
            rs.addField({name: 'login', type: 'string'});
            rs.assign(rs2);
        });

        it('should chnage raw data after relation change', () => {
            const rs = new RecordSet();

            rs.assign([new Model({
                rawData: {id: 1}
            })]);

            assert.equal(rs.getRawData()[0].id, 1);
            rs.at(0).set('id', 2);
            assert.equal(rs.getRawData()[0].id, 2);
        });

        it('should assign empty recordset if it has a format', () => {
            const rs = new RecordSet({
                rawData: [[1]],
                format: [{name: 'id', type: 'Integer'}]
            });
            const rs2 = new RecordSet({
                rawData: [],
                format: [{name: 'id', type: 'Integer'}]
            });
            rs.assign(rs2);
            assert.deepEqual(rs.getCount(), 0);
        });

        it('should trigger "onCollectionChange" with valid arguments', () => {
            const items = [{id: 1}, {id: 2}];
            const rs = new RecordSet({
                rawData: items
            });
            const newItems = [{id: 3}];
            const newRs = new RecordSet({
                rawData: newItems
            });
            const expected: any[] = [{
                action: IBindCollection.ACTION_RESET,
                oldItems: [rs.at(0), rs.at(1)],
                oldItemsIndex: 0
            }];
            const given: any[] = [];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({action, newItems, newItemsIndex, oldItems, oldItemsIndex});
            };

            rs.subscribe('onCollectionChange', handler);
            rs.assign(newRs);
            rs.unsubscribe('onCollectionChange', handler);

            expected[0].newItems = [rs.at(0)];
            expected[0].newItemsIndex = 0;

            assert.deepEqual(given, expected);
        });
    });

    describe('.clear()', () => {
        it('should reset the records owner', () => {
            const rs = new RecordSet({
                rawData: getItems(),
                keyProperty: 'id'
            });
            const records = [];

            rs.each((record) => {
                records.push(record);
            });

            rs.clear();
            for (let i = 0; i < records.length; i++) {
                assert.isNull(records[i].getOwner());
            }
        });

        it('should set the records state to "Detached"', () => {
            const records = [];
            rs.each((record) => {
                records.push(record);
            });
            rs.clear();
            for (let i = 0; i < records.length; i++) {
                assert.equal(records[i].getState(), RecordState.DETACHED);
            }
        });

        it('should clear the raw data', () => {
            rs.clear();
            assert.deepEqual(rs.getRawData(), []);
        });

        it('should clear the format', () => {
            rs.clear();
            assert.deepEqual(rs.getFormat().getCount(), 0);
        });

        it('should clear the format even it was extrected before', () => {
            assert.deepEqual(rs.getFormat().getCount(), 2);
            rs.clear();
            assert.deepEqual(rs.getFormat().getCount(), 0);
        });
    });

    describe('.clone()', () => {
        it('should not be same as original', () => {
            assert.instanceOf(rs.clone(), RecordSet);
            assert.instanceOf(rs.clone(true), RecordSet);
            assert.notEqual(rs.clone(), rs);
            assert.notEqual(rs.clone(true), rs);
        });

        it('should not be same as previous clone', () => {
            assert.notEqual(rs.clone(), rs.clone());
            assert.notEqual(rs.clone(true), rs.clone(true));
        });

        it('should clone rawData', () => {
            const clone = rs.clone();
            assert.notEqual(rs.getRawData(), clone.getRawData());
            assert.deepEqual(rs.getRawData(), clone.getRawData());
        });

        it('should make raw data unlinked from original', () => {
            const cloneA = rs.clone();
            assert.deepEqual(cloneA.getRawData(), rs.getRawData());
            cloneA.removeAt(0);
            assert.notEqual(cloneA.getRawData(), rs.getRawData());

            const cloneB = rs.clone();
            assert.deepEqual(cloneB.getRawData(), rs.getRawData());
            cloneB.at(0).set('name', 'test');
            assert.notEqual(cloneB.getRawData(), rs.getRawData());
        });

        it('should make object-like options linked to original if shallow', () => {
            const clone: any = rs.clone(true);
            assert.strictEqual(clone._$format, (rs as any)._$format);
        });

        it('should make array-like options unlinked from original if shallow', () => {
            const clone: any = rs.clone(true);
            assert.notEqual(clone._$rawData, (rs as any)._$rawData);
            assert.deepEqual(clone._$rawData, (rs as any)._$rawData);
        });

        it('should return records owned by itself', () => {
            const clone = rs.clone();
            clone.each((record) => {
                assert.strictEqual(clone, record.getOwner());
            });
        });

        it('should make items unlinked from original', () => {
            const clone = rs.clone();
            clone.each((item, index) => {
                assert.notEqual(item, rs.at(index));
            });
        });

        it('should make items linked to original if shallow', () => {
            // Force create record instances
            rs.each(() => {
                // Nothing
            });

            const clone = rs.clone(true);
            clone.each((item, index) => {
                assert.strictEqual(item, rs.at(index));
            });
        });
    });

    describe('.add()', () => {
        it('should keep foreign record owner', () => {
            const record = new Model({
                rawData: getSomeItem()
            });
            rs.add(record);
            assert.isNull(record.getOwner());
        });

        it('should set the new record owner to itself', () => {
            const record = new Model({
                rawData: getSomeItem()
            });
            rs.add(record);
            assert.strictEqual(rs.at(rs.getCount() - 1).getOwner(), rs);
        });

        it('should keep foreign record state', () => {
            const record = new Model({
                rawData: getSomeItem()
            });
            rs.add(record);
            assert.strictEqual(record.getState(), RecordState.DETACHED);
        });

        it('should keep foreign record instance state', () => {
            class Foo extends Model {
                _foo: string;
            }

            const record = new Foo({
                properties: {
                    foo: {
                        get: Track.create(function(): string {
                            return this._foo = 'bar';
                        }, '_foo')
                    }
                } as IHashMap<IProperty<Foo>>
            });

            assert.equal(record.get('foo'), 'bar');

            const result: any = rs.add(record, 0);
            assert.equal(result._foo, 'bar');
        });

        it('should set the new record state to "Added"', () => {
            const record = new Model({
                rawData: getSomeItem()
            });
            rs.add(record);
            assert.strictEqual(rs.at(rs.getCount() - 1).getState(), RecordState.ADDED);
        });

        it('should create result with format equals to recordset', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, title: 'foo', count: 0},
                    {id: 2, title: 'bar', count: 2}
                ]
            });
            const record = new Model({
                rawData: {id: 3, name: 'Baz', title: 'bar'}
            });

            const result = rs.add(record);
            const data = result.getRawData(true);
            assert.sameMembers(Object.keys(data), ['id', 'title', 'count']);
        });

        it('should change raw data', () => {
            const rd = getSomeItem();
            const record = new Model({
                rawData: rd
            });

            rs.add(record);
            items.push(rd);
            assert.deepEqual(rs.getRawData(), items);
        });

        it('should don\'t change source record raw data if result record changed', () => {
            const source = new Model({
                rawData: {foo: 'bar'}
            });
            const result = rs.add(source, 0);

            result.set('foo', 'baz');

            assert.equal(source.getRawData().foo, 'bar');
            assert.equal(result.getRawData().foo, 'baz');
        });

        it('should update raw data if record changed', () => {
            const data = {foo: 'bar'};
            const source = new Model({
                rawData: data
            });

            const result = rs.add(source, 0);
            result.set('foo', 'baz');

            assert.equal(rs.getRawData()[0].foo, 'baz');
        });

        it('should add records with different formats', () => {
            rs.add(new Model({
                format: [{name: 'id', type: 'integer'}]
            }));
        });

        it('should allow to set raw data after add to empty RecordSet', () => {
            const rs = new RecordSet();
            rs.add(new Model({
                rawData: {id: 1}
            }));
            rs.setRawData([{id: 2}]);
        });

        it('should throw an Error for not a record', () => {
            const rd: any = getSomeItem();
            assert.throws(() => {
                rs.add(rd);
            });
        });

        it('should throw an TypeError for incompatible adapter', () => {
            const record = new Model({
                adapter: 'Types/entity:adapter.Sbis'
            });
            assert.throws(() => {
                rs.add(record);
            }, TypeError);
        });

        it('should add record with recovered data', () => {
            const acceptor = new RecordSet({
                adapter: new SbisAdapter(),
                rawData: {
                    f: 0,
                    d: [[3, {
                        f: 1,
                        d: ['Sivov'],
                        s: [{
                            n: 'name',
                            t: 'Строка'
                        }]
                    }]],
                    s: [{
                        n: 'id',
                        t: 'Число целое'
                    }, {
                        n: 'human',
                        t: 'Запись'
                    }]
                }
            });

            const donor = new RecordSet({
                adapter: new SbisAdapter(),
                rawData: {
                    f: 0,
                    d: [[{
                        f: 1,
                        d: ['Ivanov'],
                        s: [{
                            n: 'name',
                            t: 'Строка'
                        }]
                    }, 1], [{
                        f: 1,
                        d: ['Petroff']
                    }, 2]],
                    s: [{
                        n: 'human',
                        t: 'Запись'
                    }, {
                        n: 'id',
                        t: 'Число целое'
                    }]
                }
            });

            acceptor.add(donor.at(1));

            assert.deepEqual(acceptor.at(1).getRawData().d, [2, {
                d: ['Petroff'],
                s: [{
                    n: 'name',
                    t: 'Строка'
                }]
            }]);
        });
    });

    describe('.remove()', () => {
        it('should remove the record', () => {
            const record = rs.at(0);
            rs.remove(record);
            assert.strictEqual(rs.getIndex(record), -1);
        });

        it('should change raw data', () => {
            const record = rs.at(0);
            rs.remove(record);
            assert.deepEqual(rs.getRawData(), items.slice(1));
        });

        it('should reset the record owner', () => {
            const record = rs.at(0);
            assert.strictEqual(record.getOwner(), rs);
            rs.remove(record);
            assert.isNull(record.getOwner());
        });

        it('should set the record state to "Detached"', () => {
            const record = rs.at(0);
            rs.remove(record);
            assert.strictEqual(record.getState(), RecordState.DETACHED);
        });

        it('should throw an TypeError for incompatible adapter', () => {
            const record = new Model({
                adapter: 'Types/entity:adapter.Sbis'
            });
            assert.throws(() => {
                rs.remove(record);
            }, TypeError);
        });
    });

    describe('.removeAt()', () => {
        it('should change raw data', () => {
            rs.removeAt(0);
            assert.deepEqual(rs.getRawData(), items.slice(1));
        });

        it('should reset the record owner', () => {
            const record = rs.at(0);
            assert.strictEqual(record.getOwner(), rs);
            rs.removeAt(0);
            assert.isNull(record.getOwner());
        });

        it('should set the record state to "Detached"', () => {
            const record = rs.at(0);
            rs.removeAt(0);
            assert.strictEqual(record.getState(), RecordState.DETACHED);
        });
    });

    describe('.replace()', () => {
        it('should return added record', () => {
            const rd = {
                id: 50,
                name: 'qwe'
            };
            const newItem = new Model({rawData: rd});

            const addedItem = rs.replace(newItem, 0);
            assert.notEqual(newItem, addedItem);
            assert.deepEqual(addedItem.getRawData(), rd);
        });

        it('should change raw data', () => {
            const rd = {
                id: 50,
                name: '50'
            };
            const newItem = new Model({rawData: rd});

            rs.replace(newItem, 0);
            assert.deepEqual(rs.getRawData()[0], rd);
        });

        it('should keep foreign record owner', () => {
            const record = new Model();
            rs.replace(record, 0);
            assert.isNull(record.getOwner());
        });

        it('should set the new record owner to itself', () => {
            const record = new Model();
            rs.replace(record, 0);
            assert.strictEqual(rs.at(0).getOwner(), rs);
        });

        it('should keep foreign record state', () => {
            const record = new Model();
            rs.replace(record, 0);
            assert.strictEqual(record.getState(), RecordState.DETACHED);
        });

        it('should set the new record state to "Changed"', () => {
            const record = new Model();
            rs.replace(record, 0);
            assert.strictEqual(rs.at(0).getState(), RecordState.CHANGED);
        });

        it('should reset the old record owner', () => {
            const record = rs.at(0);
            rs.replace(new Model(), 0);
            assert.isNull(record.getOwner());
        });

        it('should set the old record state to "Detached"', () => {
            const record = rs.at(0);
            rs.replace(new Model(), 0);
            assert.strictEqual(record.getState(), RecordState.DETACHED);
        });

        it('should throw an error for not a record', () => {
            assert.throws(() => {
                rs.replace({} as any, 0);
            });
        });

        it('should throw an TypeError for incompatible adapter', () => {
            const record = new Model({
                adapter: 'Types/entity:adapter.Sbis'
            });
            assert.throws(() => {
                rs.replace(record, 0);
            }, TypeError);
        });
    });

    describe('.move()', () => {
        it('should change raw data', () => {
            rs.move(0, 1);
            const data = rs.getRawData();
            assert.deepEqual(data[0], items[1]);
            assert.deepEqual(data[1], items[0]);
            assert.deepEqual(data[2], items[2]);
        });

        it('should get record by id after move', () => {
            rs.getRecordById(1);
            rs.move(0, 1);
            assert.equal(rs.getRecordById(1).getKey(), 1);
            assert.equal(rs.getRecordById(2).getKey(), 2);
        });
    });

    describe('.getIndex()', () => {
        it('should return an index of given item', () => {
            for (let i = 0; i < items.length; i++) {
                assert.equal(i, rs.getIndex(rs.at(i)));
            }
        });
    });

    describe('.relationChanged()', () => {
        it('should return affected "which"', () => {
            const items = [{id: 1}];
            const rs = new RecordSet({
                rawData: items
            });
            const target = rs.at(0);
            const which = {
                data: {foo: 'bar'},
                target
            };
            const route = [undefined];

            const result = rs.relationChanged(which, route);
            assert.strictEqual(result.target, target);
            assert.deepEqual(result.data, {0: target});
        });
    });

    describe('.acceptChanges()', () => {
        it('should make the records unchanged', () => {
            rs.each((record, index) => {
                record.set('id', 'new-' + index);
            });
            rs.acceptChanges();
            rs.each((record) => {
                assert.strictEqual(record.getChanged().length, 0);
            });
        });

        it('should set the records state to "Unchanged"', () => {
            rs.each((record, index) => {
                record.set('id', 'new-' + index);
            });
            rs.acceptChanges();
            rs.each((record) => {
                assert.strictEqual(record.getState(), RecordState.UNCHANGED);
            });
        });

        it('should set the added record state to "Unchanged"', () => {
            const record = new Model({
                rawData: {
                    id: 100,
                    name: 'Test'
                }
            });
            rs.add(record);
            assert.strictEqual(rs.at(rs.getCount() - 1).getState(), RecordState.ADDED);
            rs.acceptChanges();
            assert.strictEqual(rs.at(rs.getCount() - 1).getState(), RecordState.UNCHANGED);
        });

        it('should force getChanged() of parent record return an array with record field', () => {
            const format = {
                id: 'integer',
                items: 'recordset'
            };
            const record = new Record({
                format,
                rawData: {
                    id: 1,
                    items: [{
                        id: 'foo'
                    }, {
                        id: 'bar'
                    }]
                }
            });
            const items = record.get('items');

            items.removeAt(0);
            assert.isAbove(record.getChanged().indexOf('items'), -1);

            items.acceptChanges();
            assert.isAbove(record.getChanged().indexOf('items'), -1);
        });

        it('should force getChanged() of parent record return an array without record field', () => {
            const format = {
                id: 'integer',
                items: 'recordset'
            };
            const record = new Record({
                format,
                rawData: {
                    id: 1,
                    items: [{
                        id: 'foo'
                    }, {
                        id: 'bar'
                    }]
                }
            });
            const items = record.get('items');

            items.removeAt(0);
            assert.isAbove(record.getChanged().indexOf('items'), -1);

            items.acceptChanges(true);
            assert.equal(record.getChanged().indexOf('items'), -1);
        });
    });

    describe('.merge()', () => {
        it('should merge two recordsets with default params', () => {
            const rs1 = new RecordSet({
                rawData: getItems(),
                keyProperty: 'id'
            });
            const rs2 = new RecordSet({
                rawData: [{
                    id: 1000,
                    name: 'Bar'
                }, {
                    id: 2,
                    name: 'Foo'
                }],
                keyProperty: 'id'
            });
            const record = rs1.getRecordById(2);

            rs1.merge(rs2);

            assert.equal(rs1.getCount(), 2);
            assert.notEqual(rs1.getRecordById(2), record);
            assert.equal(rs1.getRecordById(2).get('name'), 'Foo');
            assert.equal(rs1.getRecordById(1000).get('name'), 'Bar');
        });

        it('should merge two recordsets without remove', () => {
            const rs1 = new RecordSet({
                rawData: getItems(),
                keyProperty: 'id'
            });
            const rs2 =  new RecordSet({
                rawData: [{
                    id: 2,
                    name: 'Foo'
                }],
                keyProperty: 'id'
            });

            rs1.merge(rs2, {remove: false});
            assert.equal(getItems().length, rs1.getCount());
            assert.equal(rs1.getRecordById(2).get('name'), 'Foo');
        });

        it('should merge two recordsets without merge', () => {
            const rs1 = new RecordSet({
                rawData: getItems(),
                keyProperty: 'id'
            });
            const rs2 =  new RecordSet({
                rawData: [{
                    id: 2,
                    name: 'Foo'
                }],
                keyProperty: 'id'
            });

            rs1.merge(rs2, {replace: false});
            assert.notEqual(rs1.getRecordById(2).get('name'), 'Foo');
        });

        it('should merge two recordsets without add', () => {
            const rs1 = new RecordSet({
                rawData: getItems(),
                keyProperty: 'id'
            });
            const rs2 =  new RecordSet({
                rawData: [{
                    id: 1000,
                    name: 'Foo'
                }],
                keyProperty: 'id'
            });

            rs1.merge(rs2, {add: false});
            assert.isUndefined(rs1.getRecordById(1000));
        });

        it('should merge two recordsets with inject', () => {
            const rs1 = new RecordSet({
                rawData: getItems(),
                keyProperty: 'id'
            });
            const rs2 =  new RecordSet({
                rawData: [{
                    id: 2,
                    name: 'Foo'
                }],
                keyProperty: 'id'
            });
            const record = rs1.getRecordById(2);

            rs1.merge(rs2, {inject: true});
            assert.strictEqual(rs1.getRecordById(2), record);
            assert.equal(rs1.getRecordById(2).get('name'), 'Foo');
        });

        it('should normalize raw data on inject', () => {
            const rs1 = new RecordSet({
                rawData: [{
                    id: 1,
                    title: 'foo'
                }, {
                    id: 2,
                    title: 'bar'
                }],
                keyProperty: 'id'
            });
            const rs2 =  new RecordSet({
                rawData: [{
                    id: 1,
                    name: 'Foo1',
                    title: 'foo1'
                }],
                keyProperty: 'id'
            });

            rs1.merge(rs2, {inject: true});
            assert.deepEqual(rs1.at(0).getRawData(), {
                id: 1,
                title: 'foo1'
            });
        });
    });

    describe('.toJSON()', () => {
        it('should serialize a RecordSet', () => {
            const json = rs.toJSON();
            const options = (rs as any)._getOptions();
            delete options.items;
            assert.strictEqual(json.module, 'Types/collection:RecordSet');
            assert.isNumber(json.id);
            assert.isTrue(json.id > 0);
            assert.deepEqual(json.state.$options, options);
        });

        it('should serialize an instance id', () => {
            const json: any = rs.toJSON();
            assert.strictEqual(json.state._instanceId, rs.getInstanceId());
        });

        it('should serialize metaData injected by setter', () => {
            const metaData = {foo: 'bar'};
            rs.setMetaData(metaData);

            const json = rs.toJSON();
            assert.strictEqual(json.state.$options.metaData, metaData);
        });
    });

    describe('.fromJSON()', () => {
        it('should restore an instance id', () => {
            const json = rs.toJSON();
            const clone = RecordSet.fromJSON(json);

            assert.strictEqual((json.state as any)._instanceId, clone.getInstanceId());
        });

        it('should restore model constructor', () => {
            const serializer = new Serializer();
            const rs = new RecordSet({
                adapter: new SbisAdapter(),
                model: Record,
                rawData: {
                    _type: 'recordset',
                    s: [1],
                    d: [2]
                }
            });
            const json = JSON.stringify(rs, serializer.serialize);
            const clone = JSON.parse(json, serializer.deserialize);

            assert.strictEqual(clone.getModel(), Record);
        });
    });

    describe('.getModel()', () => {
        it('should return a given model', () => {
            const rs = new RecordSet({
                model: Model
            });
            assert.strictEqual(rs.getModel(), Model);
        });

        it('should return "entity.model"', () => {
            assert.strictEqual(rs.getModel(), 'Types/entity:Model');
        });
    });

    describe('.getKeyProperty()', () => {
        it('should return id property', () => {
            assert.equal('id', rs.getKeyProperty());
        });

        it('should return false', () => {
            const  rs2 =  new RecordSet({
                rawData: [{
                    id: 1000,
                    name: 'Foo'
                }]
            });
            assert.isTrue(!rs2.getKeyProperty());
        });

        it('should detect keyProperty automatically', () => {
            const rs = new RecordSet({
                rawData: {
                    d: [],
                    s: [{
                        n: 'id',
                        t: 'Число целое'
                    }, {
                        n: '@name',
                        t: 'Идентификатор'
                    }]
                },
                adapter: 'Types/entity:adapter.Sbis'
            });
            assert.strictEqual(rs.getKeyProperty(), '@name');
        });

    });

    describe('.setKeyProperty()', () => {
        it('should set id property', () => {
            rs.setKeyProperty('name');
            assert.equal('name', rs.getKeyProperty());
        });

        it('shouldnt set id property', () => {
            rs.setKeyProperty('Лицо');
            assert.equal('Лицо', rs.getKeyProperty());
        });

        it('should set id property for all models if not defined yet', () => {
            const rs = new RecordSet({
                rawData: getItems()
            });
            rs.setKeyProperty('id');
            rs.each((record) => {
                assert.equal('id', record.getKeyProperty());
            });
        });

        it('should trigger "onPropertyChange" if name changed', () => {
            let given;
            const handler = (e, data) => {
                given = data;
            };

            rs.subscribe('onPropertyChange', handler);
            rs.setKeyProperty('name');
            rs.unsubscribe('onPropertyChange', handler);

            assert.strictEqual(given.keyProperty, 'name');
        });

        it('should don\'t trigger "onPropertyChange" if name don\'t changed', () => {
            let called = false;
            const handler = () => {
                called = true;
            };

            rs.setKeyProperty('name');
            rs.subscribe('onPropertyChange', handler);
            rs.setKeyProperty('name');
            rs.unsubscribe('onPropertyChange', handler);

            assert.isFalse(called);
        });
    });

    describe('.getRecordById()', () => {
        it('should return record by id', () => {
            assert.equal(rs.getRecordById(2).get('name'), 'Petroff');
            assert.equal(rs.getRecordById(3).get('name'), 'Sidoroff');
        });
    });

    describe('.getIndexByValue()', () => {
        it('should work with default models', () => {
            const data = getItems();
            const rs = new RecordSet({
                rawData: data
            });

            for (let i = 0; i < data.length; i++) {
                assert.equal(
                    rs.getIndexByValue('id', data[i].id),
                    i
                );
            }
        });

        it('should work with custom models', () => {
            class Foo extends Model {
                // Nothing
            }
            const data = getItems();
            const rs = new RecordSet({
                rawData: data,
                model: Foo
            });

            for (let i = 0; i < data.length; i++) {
                assert.equal(
                    rs.getIndexByValue('id', data[i].id),
                    i
                );
            }
        });

        it('should return records index from recordset by value', () => {
            const data = getSbisItems();
            const rs = new RecordSet({
                rawData: data,
                adapter: 'Types/entity:adapter.Sbis'
            });

            for (let i = data.d.length; i <= 0; i--) {
                assert.equal(rs.getIndexByValue('name', data.d[i][1]), i);
            }
        });
    });

    describe('.getAdapter()', () => {
        it('should return adapter', () => {
            assert.instanceOf(rs.getAdapter(), JsonAdapter);
        });
    });

    describe('.getMetaData()', () => {
        it('should return meta data injected through the constructor', () => {
            const metaData = {foo: 'bar'};
            const rs = new RecordSet({metaData});

            assert.deepEqual(rs.getMetaData(), metaData);
        });

        it('should return meta data from recordset injected through the constructor', () => {
            const meta = new RecordSet();
            const rs = new RecordSet({
                metaData: meta
            });
            assert.strictEqual(rs.getMetaData(), meta);
        });

        it('should return meta data injected through the constructor with compatible option name', () => {
            const meta = {foo: 'bar'};
            const rs = new RecordSet({meta});
            assert.deepEqual(rs.getMetaData(), meta);
        });

        it('should return meta data with given value type', () => {
            const rs = new RecordSet({
                metaData: {foo: '2001-09-11'},
                metaFormat: {
                    foo: Date
                }
            });
            assert.instanceOf(rs.getMetaData().foo, Date);
        });

        context('if adapter supports IMetaData interface', () => {
            it('should return meta data with total from Number', () => {
                const rawData = {
                    n: 1
                };
                const rs = new RecordSet({
                    adapter: 'Types/entity:adapter.Sbis',
                    rawData
                });
                const meta = rs.getMetaData();
                assert.strictEqual(meta.total, 1);
                assert.strictEqual(meta.more, 1);
            });

            it('should return meta data with total from Boolean', () => {
                const rawData = {
                    n: true
                };
                const rs = new RecordSet({
                    adapter: 'Types/entity:adapter.Sbis',
                    rawData
                });
                const meta = rs.getMetaData();
                assert.strictEqual(meta.total, true);
                assert.strictEqual(meta.more, true);
            });

            it('should return meta data with total from Object', () => {
                const rawData = {
                    n: {
                        after: false,
                        before: true
                    }
                };
                const rs = new RecordSet({
                    adapter: 'Types/entity:adapter.Sbis',
                    rawData
                });
                const meta = rs.getMetaData();
                assert.isFalse(meta.more.after);
                assert.isTrue(meta.more.before);
            });

            it('should return meta data with results', () => {
                const rawData = {
                    r: {
                        d: [1],
                        s: [{n: 'id', t: 'Число целое'}]
                    }
                };
                const rs = new RecordSet({
                    adapter: 'Types/entity:adapter.Sbis',
                    rawData
                });
                const meta = rs.getMetaData();

                assert.strictEqual(meta.results.get('id'), 1);
            });

            it('should return meta data with results of given type', () => {
                class Foo extends Model {
                    // Nothing
                }

                const rawData = {
                    r: {
                        d: [],
                        s: []
                    }
                };
                const rs = new RecordSet({
                    adapter: 'Types/entity:adapter.Sbis',
                    rawData,
                    metaFormat: {
                        results: Foo
                    }
                });

                const meta = rs.getMetaData();
                assert.instanceOf(meta.results, Foo);
            });

            it('should return meta data with path', () => {
                const rawData = {
                    p: {
                        d: [[1], [2], [5]],
                        s: [{n: 'id', t: 'Число целое'}]
                    }
                };
                const rs = new RecordSet({
                    adapter: 'Types/entity:adapter.Sbis',
                    rawData
                });
                const meta = rs.getMetaData();

                assert.strictEqual(meta.path.getCount(), 3);
                assert.strictEqual(meta.path.at(0).get('id'), 1);
                assert.strictEqual(meta.path.at(1).get('id'), 2);
                assert.strictEqual(meta.path.at(2).get('id'), 5);
            });

            it('should inherit keyProperty in path', () => {
                const rawData = {
                    p: {
                        d: [],
                        s: [
                            {n: 'id', t: 'Число целое'},
                            {n: 'title', t: 'Строка'}
                        ]
                    }
                };
                const rs = new RecordSet({
                    adapter: 'Types/entity:adapter.Sbis',
                    keyProperty: 'title',
                    rawData
                });
                const meta = rs.getMetaData();

                assert.strictEqual(meta.path.getKeyProperty(), 'title');
            });

            it('should return pure meta data', () => {
                const rawData = {
                    m: {
                        d: [1, 'baz'],
                        s: [
                            {n: 'foo', t: 'Число целое'},
                            {n: 'bar', t: 'Строка'}
                        ]
                    }
                };
                const rs = new RecordSet({
                    adapter: 'Types/entity:adapter.Sbis',
                    rawData
                });
                const meta = rs.getMetaData();

                assert.strictEqual(meta.foo, 1);
                assert.strictEqual(meta.bar, 'baz');
            });
        });
    });

    describe('.setMetaData()', () => {
        it('should set new meta', () => {
            const meta = {foo: 'bar'};
            rs.setMetaData(meta);
            assert.strictEqual(rs.getMetaData(), meta);
        });

        it('should trigger "onPropertyChange"', () => {
            let given;
            const handler = (e, data) => {
                given = data;
            };

            rs.subscribe('onPropertyChange', handler);
            const meta = {foo: 'bar'};
            rs.setMetaData(meta);
            rs.unsubscribe('onPropertyChange', handler);

            assert.strictEqual(given.metaData, meta);
        });
    });

    describe('.produceInstance()', () => {
        it('should return an instance with the given raw data', () => {
            const rawData = [];
            const instance = RecordSet.produceInstance(rawData);

            assert.instanceOf(instance, RecordSet);
            assert.strictEqual(instance.getRawData(true), rawData);
        });

        it('should return an instance with the given adapter', () => {
            const adapter = new SbisAdapter();
            const instance = RecordSet.produceInstance(null, {adapter});

            assert.instanceOf(instance, RecordSet);
            assert.strictEqual(instance.getAdapter(), adapter);
        });

        it('should return an instance with inherited adapter', () => {
            const adapter = new SbisAdapter();

            class Foo extends RecordSet {
                _$adapter: AdapterDescriptor = adapter;
            }

            const instance = Foo.produceInstance(null);
            assert.instanceOf(instance, Foo);
            assert.strictEqual(instance.getAdapter(), adapter);
        });

        it('should return an instance with the given model', () => {
            const instance = RecordSet.produceInstance([], {model: 'fooModel'});

            assert.instanceOf(instance, RecordSet);
            assert.equal(instance.getModel(), 'fooModel');
        });

        it('should return an instance with inherited model', () => {
            class Foo extends RecordSet {
                _$model: string = 'fooModel';
            }
            const instance = Foo.produceInstance([]);

            assert.instanceOf(instance, Foo);
            assert.equal(instance.getModel(), 'fooModel');
        });

        it('should return an instance with the given keyProperty', () => {
            const instance = RecordSet.produceInstance(null, {keyProperty: 'foo'});
            assert.strictEqual(instance.getKeyProperty(), 'foo');
        });
    });

    describe('.getVersion()', () => {
        it('should change version when raw data has been changed', () => {
            const version = rs.getVersion();
            rs.setRawData({
                id: 1,
                name: null
            });
            assert.notEqual(rs.getVersion(), version);
        });

        it('should change version when inner model has been changed', () => {
            const version = rs.getVersion();
            rs.at(0).set('name', 'foo');
            assert.notEqual(rs.getVersion(), version);
        });

        it('should change version if field has been added in the format', () => {
            const version = rs.getVersion();
            rs.addField({name: 'foo', type: 'string'});
            assert.notEqual(rs.getVersion(), version);
        });

        it('should change version if field has been removed from the format', () => {
            const format = getItemsFormat();
            const rs = new RecordSet({
                format,
                rawData: items
            });

            const version = rs.getVersion();
            rs.removeField('name');
            assert.notEqual(rs.getVersion(), version);
        });
    });

    describe('.patch()', () => {
        function addRecord(rs: RecordSet<unknown, Record>, data: object): void {
            const record = new Record({
                format: rs.getFormat(),
                adapter: rs.getAdapter()
            });
            record.set(data);
            rs.add(record);
        }

        const format = [
            {name: 'id', type: 'integer'},
            {name: 'name', type: 'string'}
        ];

        it('should return changed records', () => {
            const rs = new RecordSet({format});

            addRecord(rs, {id: 1, name: 'foo'});
            addRecord(rs, {id: 2, name: 'bar'});
            rs.acceptChanges();

            rs.at(0).set('name', 'baz');
            const changed = RecordSet.patch(rs).get('changed');

            assert.equal(changed.getCount(), 1);
            assert.equal(changed.at(0).get('name'), 'baz');
        });

        it('should return added records', () => {
            const rs = new RecordSet({format});

            addRecord(rs, {id: 1, name: 'foo'});
            rs.acceptChanges();
            addRecord(rs, {id: 2, name: 'bar'});

            const added = RecordSet.patch(rs).get('added');
            assert.equal(added.getCount(), 1);
            assert.equal(added.at(0).get('name'), 'bar');
        });

        it('should return removed records id', () => {
            const rs = new RecordSet({format, keyProperty: 'id'});

            addRecord(rs, {id: 1, name: 'foo'});
            addRecord(rs, {id: 2, name: 'bar'});
            rs.acceptChanges();
            rs.at(0).setState(RecordState.DELETED);

            const removed = RecordSet.patch(rs).get('removed');
            assert.equal(removed.length, 1);
            assert.equal(removed[0], 1);
        });

        it('should return result if no changes', () => {
            const rs = new RecordSet();
            const patch = RecordSet.patch(rs);

            assert.equal(patch.get('changed').getCount(), 0);
            assert.equal(patch.get('added').getCount(), 0);
            assert.equal(patch.get('removed').length, 0);
        });
    });
});
