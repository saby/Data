import {assert} from 'chai';
import Record from 'Types/_entity/Record';
import ObservableList from 'Types/_collection/ObservableList';
import RecordSet from 'Types/_collection/RecordSet';
import Format from 'Types/_collection/format/Format';
import SbisAdapter from 'Types/_entity/adapter/Sbis';
import RecordSetAdapter from 'Types/_entity/adapter/RecordSet';
import {IRecordFormat} from 'Types/_entity/adapter/SbisFormatMixin';
import IntegerField from 'Types/_entity/format/IntegerField';
import ArrayField from 'Types/_entity/format/ArrayField';
import fieldsFactory, {FormatDeclaration} from 'Types/_entity/format/fieldsFactory';
import ManyToMany from 'Types/_entity/relation/ManyToMany';
import DateTime from 'Types/_entity/DateTime';
import TheDate from 'Types/_entity/Date';
import Time from 'Types/_entity/Time';
import {ExtendDate, IExtendDateConstructor} from 'Types/_declarations';
import * as extend from 'Core/core-extend';

import 'Types/_collection/Enum';
import 'Types/_collection/Flags';
import 'Core/Date';

interface IData {
    max: number;
    title: string;
    id: number;
}

function getRecordData(): IData {
    return {
        max: 10,
        title: 'A',
        id: 1
    };
}

function getRecordSbisData(): IRecordFormat {
    return {
        _type: 'record',
        d: [
            1,
            'A',
            10,
            {d: [], s: []}
        ],
        s: [{
            n: 'id',
            t: 'Число целое'
        }, {
            n: 'title',
            t: 'Строка'
        }, {
            n: 'max',
            t: 'Число целое'
        }, {
            n: 'rec',
            t: 'Запись'
        }]
    };
}

function getRecordFormat(): FormatDeclaration {
    return [
        {name: 'id', type: 'integer'},
        {name: 'title', type: 'string'},
        {name: 'max', type: 'integer'},
        {name: 'rec', type: 'record'}
    ];
}

function getRecord(data?: IData): Record {
    return new Record({
        rawData: data || getRecordData()
    });
}

describe('Types/_entity/Record', () => {
    let recordData: IData;
    let record: Record;

    beforeEach(() => {
        recordData = getRecordData();
        record = getRecord(recordData);
    });

    afterEach(() => {
        recordData = undefined;
        record = undefined;
    });

    describe('.constructor()', () => {
        const getFormatDeclaration = () => {
            return [{
                name: 'id',
                type: 'integer'
            }, {
                name: 'title',
                type: 'string'
            }, {
                name: 'descr',
                type: 'string',
                defaultValue: '-'
            }, {
                name: 'main',
                type: 'boolean',
                defaultValue: true
            }];
        };

        it('should add the default values from injected format to the raw data', () => {
            const record = new Record({
                format: getFormatDeclaration()
            });
            const data = record.getRawData();

            assert.strictEqual(data.id, 0);
            assert.strictEqual(data.title, null);
            assert.strictEqual(data.descr, '-');
            assert.strictEqual(data.main, true);
        });

        it('should add the default values from inherited format to the raw data', () => {
            class SubRecord extends Record {
                // Just subclass
            }

            const record = new SubRecord({
                format: getFormatDeclaration()
            });
            const data = record.getRawData();

            assert.strictEqual(data.id, 0);
            assert.strictEqual(data.title, null);
            assert.strictEqual(data.descr, '-');
            assert.strictEqual(data.main, true);
        });

        it('should ignore option "format" value if "owner" passed', () => {
            const record = new Record({
                format: getFormatDeclaration(),
                owner: new RecordSet()
            });
            assert.isNull(record.getRawData());
        });

        it('should throw TypeError if option "owner" value is not a RecordSet', () => {
            let result;
            assert.throws(() => {
                result = new Record({
                    owner: {} as any
                });
            }, TypeError);

            assert.isUndefined(result);
        });

        it('should create writable record by default', () => {
            const record = new Record();
            assert.isTrue(record.writable);
        });

        it('should create read only record with option value', () => {
            const record = new Record({
                writable: false
            });
            assert.isFalse(record.writable);
        });
    });

    describe('.destroy()', () => {
        it('should destroy only instances of Types/_entity/DestroyableMixin', () => {
            const root = new Record();
            const foo = {
                destroyed: false,
                destroy: () => {
                    this.destroyed = true;
                }
            };
            const bar = new Record();
            root.set('foo', foo);
            root.set('bar', bar);

            root.destroy();
            assert.isTrue(root.destroyed);
            assert.isFalse(foo.destroyed);
            assert.isTrue(bar.destroyed);
        });

        it('shouldn\'t destroy same child twice', () => {
            const root = new Record();
            const foo = new Record();
            const bar = new Record();
            root.set('foo', foo);
            foo.set('bar', bar);
            root.set('bar', bar);

            root.destroy();
            assert.isTrue(root.destroyed);
            assert.isTrue(foo.destroyed);
            assert.isTrue(bar.destroyed);
        });

        it('should throw ReferenceError on any method call after destroy', () => {
            const record = new Record();
            record.get('foo');
            record.destroy();
            assert.throws(() => {
                record.get('foo');
            }, ReferenceError);
        });
    });

    describe('.get()', () => {
        it('should return a value from the raw data', () => {
            assert.strictEqual(record.get('max'), recordData.max);
            assert.strictEqual(record.get('title'), recordData.title);
            assert.strictEqual(record.get('id'), recordData.id);
        });

        it('should return a value with given type', () => {
            class MyNumber extends Number {
                constructor(protected value: number) {
                    super();
                }
                valueOf(): number {
                    return this.value;
                }
            }

            const record = new Record({
                format: [
                    {name: 'foo', type: MyNumber}
                ],
                rawData: {
                    foo: 1000
                }
            });

            const value = record.get('foo');
            assert.instanceOf(value, MyNumber);
            assert.equal(value, 1000);
        });

        it('should return a single instance for Object', () => {
            const record = new Record({
                adapter: new SbisAdapter(),
                rawData: getRecordSbisData()
            });
            const value = record.get('rec');

            assert.instanceOf(value, Record);
            assert.strictEqual(record.get('rec'), value);
            assert.strictEqual(record.get('rec'), value);
        });

        it('should return cached field value', () => {
            const values = [1, 2, 3];
            const model = new Record({
                cacheMode: Record.CACHE_MODE_ALL,
                rawData: {
                    get foo(): number {
                        return values.pop();
                    }
                }
            });

            assert.strictEqual(model.get('foo'), 3);
            assert.strictEqual(values.length, 2);
            assert.strictEqual(model.get('foo'), 3);
            assert.strictEqual(values.length, 2);
        });

        it('should return value from the raw data if it\'s even not defined in the format', () => {
            const record = new Record({
                format: [
                    {name: 'a', type: 'integer'}
                ],
                rawData: {
                    a: 1,
                    b: 2
                }
            });

            assert.strictEqual(record.get('a'), 1);
            assert.strictEqual(record.get('b'), 2);
        });

        it('should inherit the field format from the recordset format', () => {
            const rs = new RecordSet<Record>({
                format: [{
                    name: 'created',
                    type: 'date',
                    defaultValue: new Date()
                }]
            });

            rs.add(new Record({
                rawData: {
                    created: '2015-01-02 10:11:12'
                }
            }));
            const record = rs.at(0);
            const format = record.getFormat();

            assert.strictEqual(format.at(0).getName(), 'created');
            assert.strictEqual(format.at(0).getType(), 'date');

            assert.instanceOf(record.get('created'), Date);
        });

        it('should create inner record with different mediator', () => {
            class MediatorRecord extends Record {
                get mediator(): ManyToMany {
                    return this._getMediator();
                }
            }

            const record = new MediatorRecord({
                format: [
                    {name: 'foo', type: MediatorRecord}
                ],
                rawData: {
                    foo: {
                        bar: 'baz'
                    }
                }
            });

            assert.instanceOf(record.mediator, ManyToMany);
            assert.notEqual(
                record.mediator,
                record.get('foo').mediator
            );
        });
    });

    describe('.set()', () => {
        it('should set value', () => {
            record.set('max', 13);
            assert.strictEqual(record.get('max'), 13);
        });

        it('should set values', () => {
            record.set({
                max: 13,
                title: 'test'
            });
            assert.strictEqual(record.get('max'), 13);
            assert.strictEqual(record.get('title'), 'test');
        });

        it('should revert changed value with old scalar', () => {
            const old = record.get('title');

            record.set('title', 'foo');
            assert.include(record.getChanged(), 'title');

            record.set('title', old);
            assert.notInclude(record.getChanged(), 'title');
        });

        it('should revert changed value with old Object-wrapper', () => {
            const old = new Date();
            const record = new Record({
                rawData: {foo: old}
            });

            record.set('foo', new Date(0, 0, 0));
            assert.include(record.getChanged(), 'foo');

            record.set('foo', old);
            assert.notInclude(record.getChanged(), 'foo');
        });

        it('should update raw data if child\'s record raw data replaced', () => {
            const root = new Record({
                format: [{name: 'rec', type: 'record'}],
                rawData: {rec: {foo: 'bar'}}
            });
            const rec = root.get('rec');

            rec.setRawData({foo: 'baz'});

            assert.equal(root.getRawData().rec.foo, 'baz');
        });

        it('should update raw data for Array', () => {
            const record = new Record({
                format: [{name: 'foo', type: 'array', kind: 'string'}],
                rawData: {
                    foo: ['bar']
                }
            });

            const foo = record.get('foo');
            foo.push('new');
            record.set('foo', foo);

            const data = record.getRawData();
            assert.strictEqual(data.foo[0], 'bar');
            assert.strictEqual(data.foo[1], 'new');
        });

        it('should set value to the raw data if it\'s even not defined in the format', () => {
            const record = new Record({
                format: [
                    {name: 'a', type: 'integer'}
                ]
            });

            record.set('a', 1);
            assert.strictEqual(record.getRawData().a, 1);

            record.set('b', 2);
            assert.strictEqual(record.getRawData().b, 2);
        });

        it('should set value if field is not defined in raw data but defined in format', () => {
            const data = {
                d: [1],
                s: [{n: 'a', t: 'Число целое'}]
            };
            const record = new Record({
                format: {b: 'integer'},
                adapter: new SbisAdapter(),
                rawData: data
            });

            record.set('a', 10);
            assert.strictEqual(record.getRawData().d[0], 10);

            record.set('b', 2);
            assert.strictEqual(record.getRawData().d[1], 2);
        });

        it('should throw an TypeError if adapters are incompatible', () => {
            const record = new Record();
            const sub = new Record({
                adapter: new SbisAdapter()
            });

            assert.throws(() => {
                record.set('sub', sub);
            }, TypeError);
        });

        it('should don\'t throw an TypeError if adapters incompatible but object already aggregated', () => {
            const sub = new Record({
                adapter: new SbisAdapter(),
                format: [{name: 'foo', type: 'string'}]
            });
            const record = new Record({
                rawData: {
                    sub
                }
            });

            sub.set('foo', 'bar');
            assert.strictEqual(record.get('sub').get('foo'), 'bar');
        });

        it('should mark cached field as changed', () => {
            const record = new Record({
                rawData: {date: '2016-10-10'},
                format: [{name: 'date', type: 'date'}]
            });
            const curr = new Date();

            record.set('date', curr);
            assert.strictEqual(record.get('date'), curr);
            assert.isTrue(record.isChanged('date'));
        });

        it('should don\'t change cached field', () => {
            const record = new Record({
                rawData: {date: '2016-10-10'},
                format: [{name: 'date', type: 'date'}]
            });
            const prev = record.get('date');

            record.set('date', prev);
            assert.strictEqual(record.get('date'), prev);
            assert.isFalse(record.isChanged('date'));
        });

        it('should return the same instance of Object', () => {
            const obj = {};
            record.set('obj', obj);
            assert.strictEqual(record.get('obj'), obj);
        });

        it('should change value if it is RecordSet', () => {
            const record = new Record();
            const oldRs = new RecordSet();
            const newRs = new RecordSet();

            record.addField(
                {name: 'rs', type: 'recordset', defaultValue: null},
                0,
                oldRs
            );

            record.set('rs', newRs);
            assert.strictEqual(record.get('rs'), newRs);
        });

        it('should set value after set raw data null if record has format', () => {
            const record = new Record({
                format: [
                    {name: 'name', type: 'string'}
                ],
                adapter: new SbisAdapter()
            });
            record.setRawData(null);

            assert.doesNotThrow(() => {
                record.set('name', 'name');
            });
        });
    });

    describe('.subscribe()', () => {
        it('should trigger event handler from "handlers" option', () => {
            let triggered = false;
            const onPropertyChange = () => {
                triggered = true;
            };
            const record = new Record({
                handlers: {onPropertyChange}
            });

            record.set('foo', 'bar');
            record.destroy();

            assert.isTrue(triggered);
        });

        it('should trigger onPropertyChange if value changed', () => {
            let name;
            let newV;
            record.subscribe('onPropertyChange', (e, properties) => {
                for (const key in properties) {
                    if (properties.hasOwnProperty(key)) {
                        name = key;
                        newV = properties[key];
                    }
                }
            });
            record.set('max', 13);
            assert.strictEqual(name, 'max');
            assert.strictEqual(newV, 13);
        });

        it('should not trigger onPropertyChange in read only mode', () => {
            const record = new Record({
                writable: false,
                rawData: recordData
            });

            let triggered = false;
            record.subscribe('onPropertyChange', () => {
                triggered = true;
            });

            record.set('max', 13);
            assert.isFalse(triggered);
        });

        it('should trigger onPropertyChange if values changed', () => {
            let name;
            let newV;
            record.subscribe('onPropertyChange', (e, properties) => {
                for (const key in properties) {
                    if (properties.hasOwnProperty(key)) {
                        name = key;
                        newV = properties[key];
                    }
                }
            });

            record.set({
                max: 13,
                title: 'new'
            });

            assert.strictEqual(name, 'title');
            assert.strictEqual(newV, 'new');
        });

        it('should trigger onPropertyChange one by one', () => {
            const expect = ['f1', 'f2', 'f3'];
            const order = [];
            record.subscribe('onPropertyChange', (e, properties) => {
                record.set('f2', 'v2');
                record.set('f3', 'v3');
                for (const k in properties) {
                    if (properties.hasOwnProperty(k)) {
                        order.push(k);
                    }
                }
            });
            record.set('f1', 'v1');

            assert.deepEqual(order, expect);
        });

        it('should not trigger onPropertyChange if value not changed', () => {
            let name;
            let newV;
            record.subscribe('onPropertyChange', (e, properties) => {
                for (const key in properties) {
                    if (properties.hasOwnProperty(key)) {
                        name = key;
                        newV = properties[key];
                    }
                }
            });

            record.set('max', record.get('max'));

            assert.isUndefined(name);
            assert.isUndefined(newV);
        });

        it('should not trigger onPropertyChange if value is the same instance', () => {
            let firedCount = 0;
            const instance = {};
            const handler = () => {
                firedCount++;
            };

            record.set('instance', instance);
            record.subscribe('onPropertyChange', handler);
            record.set('instance', instance);
            record.unsubscribe('onPropertyChange', handler);

            assert.equal(firedCount, 0);
        });

        it('should trigger onPropertyChange with deep changed item', () => {
            const sub = new Record();
            const list = new ObservableList();
            const top = new Record();

            top.set('list', list);
            list.add(sub);

            let given;
            const handler = (event, map) => {
                given = map;
            };

            top.subscribe('onPropertyChange', handler);
            sub.set('test', 'ok');
            top.unsubscribe('onPropertyChange', handler);

            assert.strictEqual(given.list, list);
        });
    });

    describe('.getChanged()', () => {
        it('should return a changed value', () => {
            record.set('max', 15);
            record.set('title', 'B');
            assert.include(record.getChanged(), 'max');
            assert.include(record.getChanged(), 'title');
        });

        it('should return result without saved field on save same Number as String', () => {
            const record = new Record({
                format: {
                    foo: 'integer'
                },
                rawData: {
                    foo: 1
                }
            });

            const foo = record.get('foo');
            assert.typeOf(foo, 'number');
            record.set('foo', String(foo));
            assert.notInclude(record.getChanged(), 'foo');
        });

        it('should return result without saved field on save same Enum value', () => {
            const record = new Record({
                rawData: {
                    d: [0],
                    s: [{
                        n: 'enum',
                        t: {n: 'Перечисляемое', s: {0: 'one', 1: 'two'}}
                    }]
                },
                adapter: new SbisAdapter()
            });
            record.set('enum', 0);
            assert.notInclude(record.getChanged(), 'enum');
        });
    });

    describe('.acceptChanges()', () => {
        it('should reset "Changed" state to "Unchanged"', () => {
            record.setState(Record.RecordState.CHANGED);
            record.acceptChanges();
            assert.strictEqual(record.getState(), Record.RecordState.UNCHANGED);
        });

        it('should reset "Added" state to "Unchanged"', () => {
            record.setState(Record.RecordState.ADDED);
            record.acceptChanges();
            assert.strictEqual(record.getState(), Record.RecordState.UNCHANGED);
        });

        it('should reset "Deleted" state to "Detached"', () => {
            record.setState(Record.RecordState.DELETED);
            record.acceptChanges();
            assert.strictEqual(record.getState(), Record.RecordState.DETACHED);
        });

        it('should keep "Detached" state', () => {
            record.setState(Record.RecordState.DETACHED);
            record.acceptChanges();
            assert.strictEqual(record.getState(), Record.RecordState.DETACHED);
        });

        it('should throw an error on invalid argument', () => {
            assert.throws(() => {
                record.acceptChanges(null);
            }, TypeError);

            assert.throws(() => {
                record.acceptChanges(0 as any);
            }, TypeError);

            assert.throws(() => {
                record.acceptChanges('foo' as any);
            }, TypeError);

            assert.throws(() => {
                record.acceptChanges({} as any);
            }, TypeError);
        });

        it('should force getChanged() return an empty array', () => {
            record.set('max', 15);
            record.set('title', 'B');
            assert.isAbove(record.getChanged().length, 0);
            record.acceptChanges();
            assert.strictEqual(record.getChanged().length, 0);
        });

        it('should force getChanged() on parent record return an array with sub record', () => {
            const record = new Record({
                format: {
                    id: 'integer',
                    subrec: 'record'
                },
                rawData: {
                    id: 'foo',
                    subrec: {
                        id: 'bar'
                    }
                }
            });
            const subRecord = record.get('subrec');

            subRecord.set('id', 'baz');
            assert.notEqual(record.getChanged().indexOf('subrec'), -1);
        });

        it('should force getChanged() on parent record return an array wo sub record after accepting changes', () => {
            const record = new Record({
                format: {
                    id: 'integer',
                    subrec: 'record'
                },
                rawData: {
                    id: 'foo',
                    subrec: {
                        id: 'bar'
                    }
                }
            });
            const subRecord = record.get('subrec');

            subRecord.set('id', 'baz');
            subRecord.acceptChanges();
            assert.equal(record.getChanged().indexOf('subrec'), -1);
        });

        it('should force getChanged() of parent record return an array without record field', () => {
            const record = new Record({
                format: {
                    id: 'integer',
                    subrec: 'record'
                },
                rawData: {
                    id: 'foo',
                    subrec: {
                        id: 'bar'
                    }
                }
            });
            const subRecord = record.get('subrec');

            subRecord.set('id', 'baz');
            assert.isAbove(record.getChanged().indexOf('subrec'), -1);

            subRecord.acceptChanges(true);
            assert.equal(record.getChanged().indexOf('subrec'), -1);
        });

        it('should spread changes through the RecordSet to the top Record', () => {
            const top = new Record();
            const rs = new RecordSet({
                rawData: [{foo: ''}]
            });
            const sub = rs.at(0);
            top.set('items', rs);

            sub.set('foo', 'bar');
            assert.isTrue(top.isChanged('items'));

            sub.acceptChanges(true);
            assert.isFalse(top.isChanged('items'));
        });

        it('should accept changes only for given fields and keep the state', () => {
            record.set('max', 15);
            record.set('title', 'B');
            record.setState(Record.RecordState.CHANGED);
            record.acceptChanges(['max']);

            assert.strictEqual(record.getChanged().indexOf('max'), -1);
            assert.strictEqual(record.getChanged().indexOf('title'), 0);
            assert.strictEqual(record.getState(), Record.RecordState.CHANGED);
        });

        it('should accept changes only for given fields and change the state to "Unchanged"', () => {
            record.set('max', 15);
            record.set('title', 'B');
            record.setState(Record.RecordState.CHANGED);
            record.acceptChanges(['max', 'title']);

            assert.strictEqual(record.getChanged().indexOf('max'), -1);
            assert.strictEqual(record.getChanged().indexOf('title'), -1);
            assert.strictEqual(record.getState(), Record.RecordState.UNCHANGED);
        });
    });

    describe('.rejectChanges()', () => {
        it('should reset "Changed" state to "Detached"', () => {
            record.setState(Record.RecordState.CHANGED);
            record.rejectChanges();
            assert.strictEqual(record.getState(), Record.RecordState.DETACHED);
        });

        it('should reset "Changed" state to "Unchanged"', () => {
            record.setState(Record.RecordState.UNCHANGED);
            record.acceptChanges();

            record.setState(Record.RecordState.CHANGED);
            record.rejectChanges();
            assert.strictEqual(record.getState(), Record.RecordState.UNCHANGED);
        });

        it('should throw an error on invalid argument', () => {
            assert.throws(() => {
                record.rejectChanges(null);
            }, TypeError);

            assert.throws(() => {
                record.rejectChanges(0 as any);
            }, TypeError);

            assert.throws(() => {
                record.rejectChanges('foo' as any);
            }, TypeError);

            assert.throws(() => {
                record.rejectChanges({} as any);
            }, TypeError);
        });

        it('should force get() return unchanged value', () => {
            const prev = {
                max: record.get('max'),
                title: record.get('title')
            };
            record.set('max', 15);
            record.set('title', 'B');
            record.rejectChanges();
            assert.strictEqual(record.get('max'), prev.max);
            assert.strictEqual(record.get('title'), prev.title);
        });

        it('should spread changes through the RecordSet to the top Record', () => {
            const top = new Record();
            const rs = new RecordSet({
                rawData: [{foo: ''}]
            });
            const sub = rs.at(0);
            top.set('items', rs);

            sub.set('foo', 'bar');
            assert.isTrue(top.isChanged('items'));

            sub.rejectChanges(true);
            assert.isFalse(top.isChanged('items'));
        });

        it('should don\'t revert value for Enum if option cloneChanged is disabled', () => {
            const record = new Record({
                format: {
                    foo: {
                        type: 'enum',
                        dictionary: ['one', 'two']
                    }
                },
                rawData: {
                    foo: 1
                }
            });

            record.get('foo').set(0);
            assert.strictEqual(record.isChanged('foo'), true);
            assert.strictEqual(record.get('foo').get(), 0);

            record.rejectChanges();
            assert.strictEqual(record.isChanged('foo'), false);
            assert.strictEqual(record.get('foo').get(), 0);
        });

        it('should revert value for Enum if option cloneChanged is enabled', () => {
            const record = new Record({
                cloneChanged: true,
                format: {
                    foo: {
                        type: 'enum',
                        dictionary: ['one', 'two']
                    }
                },
                rawData: {
                    foo: 1
                }
            });

            record.get('foo').set(0);
            assert.strictEqual(record.isChanged('foo'), true);
            assert.strictEqual(record.get('foo').get(), 0);

            record.rejectChanges();
            assert.strictEqual(record.isChanged('foo'), false);
            assert.strictEqual(record.get('foo').get(), 1);
        });

        it('should force getChanged() return an empty array', () => {
            record.set('max', 15);
            record.set('title', 'B');
            record.rejectChanges();
            assert.strictEqual(record.getChanged().length, 0);
        });

        it('should force getChanged() on parent record return an array with sub record', () => {
            const record = new Record({
                format: {
                    id: 'integer',
                    subrec: 'record'
                },
                rawData: {
                    id: 'foo',
                    subrec: {
                        id: 'bar'
                    }
                }
            });
            const subRecord = record.get('subrec');

            subRecord.set('id', 'baz');
            assert.notEqual(record.getChanged().indexOf('subrec'), -1);
        });

        it('should force getChanged() on parent record return an array wo sub record after accepting changes', () => {
            const record = new Record({
                format: {
                    id: 'integer',
                    subrec: 'record'
                },
                rawData: {
                    id: 'foo',
                    subrec: {
                        id: 'bar'
                    }
                }
            });
            const subRecord = record.get('subrec');

            subRecord.set('id', 'baz');
            subRecord.rejectChanges();
            assert.equal(record.getChanged().indexOf('subrec'), -1);
        });

        it('should force getChanged() of parent record return an array without record field', () => {
            const record = new Record({
                format: {
                    id: 'integer',
                    subrec: 'record'
                },
                rawData: {
                    id: 'foo',
                    subrec: {
                        id: 'bar'
                    }
                }
            });
            const subRecord = record.get('subrec');

            subRecord.set('id', 'baz');
            assert.isAbove(record.getChanged().indexOf('subrec'), -1);

            subRecord.rejectChanges(true);
            assert.equal(record.getChanged().indexOf('subrec'), -1);
        });

        it('should accept changes only for given fields and keep the state', () => {
            const prev = {
                max: record.get('max'),
                title: record.get('title')
            };

            record.set('max', 15);
            record.set('title', 'B');
            record.setState(Record.RecordState.CHANGED);
            record.rejectChanges(['max']);

            assert.strictEqual(record.get('max'), prev.max);
            assert.strictEqual(record.get('title'), 'B');
            assert.strictEqual(record.getChanged().indexOf('max'), -1);
            assert.strictEqual(record.getChanged().indexOf('title'), 0);
            assert.strictEqual(record.getState(), Record.RecordState.CHANGED);
        });

        it('should accept changes only for given fields and change the state to "Unchanged"', () => {
            const prev = {
                max: record.get('max'),
                title: record.get('title')
            };

            record.set('max', 15);
            record.set('title', 'B');
            record.setState(Record.RecordState.CHANGED);
            record.rejectChanges(['max', 'title']);

            assert.strictEqual(record.get('max'), prev.max);
            assert.strictEqual(record.get('title'), prev.title);
            assert.strictEqual(record.getChanged().indexOf('max'), -1);
            assert.strictEqual(record.getChanged().indexOf('title'), -1);
            assert.strictEqual(record.getState(), Record.RecordState.DETACHED);
        });

        it('should not throw error if given fields have never been changed', () => {
            const max = record.get('max');
            record.set('max', 15);
            record.setState(Record.RecordState.CHANGED);
            assert.doesNotThrow(() => {
                record.rejectChanges(['max', 'title']);
            });
            assert.strictEqual(record.get('max'), max);
        });
    });

    describe('.has()', () => {
        it('should return true for defined field', () => {
            for (const key in recordData) {
                if (recordData.hasOwnProperty(key)) {
                    assert.isTrue(record.has(key));
                }
            }
        });

        it('should return false for undefined field', () => {
            assert.isFalse(record.has('blah'));
            assert.isFalse(record.has('blah'));
        });
    });

    describe('.getEnumerator()', () => {
        it('should return fields in given order', () => {
            const enumerator = record.getEnumerator();
            const names = Object.keys(recordData);
            let i = 0;
            while (enumerator.moveNext()) {
                assert.strictEqual(enumerator.getCurrent(), names[i]);
                i++;
            }
        });

        it('should traverse all of fields', () => {
            const enumerator = record.getEnumerator();

            let count = Object.keys(recordData).length;
            assert.isTrue(count > 0);

            while (enumerator.moveNext()) {
                count--;
            }
            assert.strictEqual(count, 0);
        });
    });

    describe('.each()', () => {
        it('should return equivalent values', () => {
            record.each((name, value) => {
                assert.strictEqual(record.get(name), value);
            });
        });

        it('should traverse all of fields', () => {
            let count = Object.keys(recordData).length;
            assert.isTrue(count > 0);

            record.each(() => {
                count--;
            });
            assert.strictEqual(count, 0);
        });
    });

    describe('.getRawData()', () => {
        it('should return a record data', () => {
            assert.notEqual(recordData, record.getRawData());
            assert.deepEqual(recordData, record.getRawData());
        });

        it('should return a shared record data', () => {
            assert.strictEqual(recordData, record.getRawData(true));
        });

        it('should change raw data if Enum property changed', () => {
            const record = new Record({
                rawData: {
                    d: [0],
                    s: [{
                        n: 'enum',
                        t: {n: 'Перечисляемое', s: {0: 'one', 1: 'two'}}
                    }]
                },
                adapter: new SbisAdapter()
            });

            record.get('enum').set(1);

            assert.equal(record.getRawData().d[0], 1);
            assert.isTrue(record.isChanged('enum'));
        });

        it('should change raw data if Flags property changed', () => {
            const record = new Record({
                rawData: {
                    d: [[true, false]],
                    s: [{
                        n: 'flags',
                        t: {n: 'Флаги', s: {0: 'one', 1: 'two'}}
                    }]
                },
                adapter: new SbisAdapter()
            });

            record.get('flags').set('two', true);

            assert.equal(record.getRawData().d[0][1], true);
            assert.isTrue(record.isChanged('flags'));
        });
    });

    describe('.setRawData()', () => {
        it('should set data', () => {
            const newRecord = new Record({
                rawData: {}
            });
            newRecord.setRawData(recordData);
            assert.deepEqual(newRecord.getRawData(), recordData);
        });

        it('should trigger onPropertyChange with empty "properties" argument', () => {
            const given = {properties: undefined};
            const handler = (e, properties) => {
                given.properties = properties;
            };

            record.subscribe('onPropertyChange', handler);
            record.setRawData({a: 1, b: 2});
            record.unsubscribe('onPropertyChange', handler);

            assert.isObject(given.properties);
            assert.deepEqual(given.properties, {});
        });
    });

    describe('.getAdapter()', () => {
        it('should return an adapter injected via constrictor', () => {
            const adapter = new SbisAdapter();
            record = new Record({adapter});
            assert.strictEqual(record.getAdapter(), adapter);
        });
    });

    describe('.getFormat()', () => {
        it('should build the empty format by default', () => {
            const record = new Record();
            const format = record.getFormat();
            assert.strictEqual(format.getCount(), 0);
        });

        it('should build the format from raw data', () => {
            const format = record.getFormat();
            assert.strictEqual(format.getCount(), Object.keys(recordData).length);
            format.each((item) => {
                assert.isTrue(recordData.hasOwnProperty(item.getName()));
            });
        });

        it('should build the record format from Array', () => {
            const format = [{
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
            const record = new Record({
                format,
                rawData: recordData
            });
            const recordFormat = record.getFormat();

            assert.strictEqual(recordFormat.getCount(), format.length);
            recordFormat.each((item, index) => {
                assert.strictEqual(item.getName(), format[index].name);
                assert.strictEqual((item.getType() as string).toLowerCase(), format[index].type);
            });
        });

        it('should accept the record format from instance', () => {
            const format = new Format({
                items: [new IntegerField({name: 'id'})]
            });
            const record = new Record({
                format,
                rawData: recordData
            });

            assert.isTrue(format.isEqual(record.getFormat()));
        });

        it('should set the field format from Object with declaration', () => {
            const fields = Object.keys(recordData);
            const record = new Record({
                format: {
                    id: {type: 'integer'}
                },
                rawData: recordData
            });
            const recordFormat = record.getFormat();

            assert.equal(recordFormat.getCount(), fields.length);
            recordFormat.each((item, index) => {
                assert.strictEqual(item.getName(), fields[index]);
                if (item.getName() === 'id') {
                    assert.strictEqual(item.getType(), 'integer');
                }
            });
        });

        it('should add the field format from Object with declaration', () => {
            const fields = Object.keys(recordData);
            const record = new Record({
                format: {
                    foo: {type: 'integer'}
                },
                rawData: recordData
            });
            const recordFormat = record.getFormat();

            assert.equal(recordFormat.getCount(), fields.length + 1);
            recordFormat.each((item, index) => {
                assert.strictEqual(item.getName(), fields[index] || 'foo');
            });
        });

        it('should set the field format from Object with string declaration', () => {
            const fields = Object.keys(recordData);
            const record = new Record({
                format: {
                    id: 'integer'
                },
                rawData: recordData
            });
            const recordFormat = record.getFormat();

            assert.equal(recordFormat.getCount(), fields.length);
            recordFormat.each((item, index) => {
                assert.strictEqual(item.getName(), fields[index]);
                if (item.getName() === 'id') {
                    assert.strictEqual(item.getType(), 'integer');
                }
            });
        });

        it('should set the field format from Object with custom type declaration', () => {
            const fields = Object.keys(recordData);
            const record = new Record({
                format: {
                    id: Date
                },
                rawData: recordData
            });
            const recordFormat = record.getFormat();

            assert.equal(recordFormat.getCount(), fields.length);
            recordFormat.each((item, index) => {
                assert.strictEqual(item.getName(), fields[index]);
                if (item.getName() === 'id') {
                    assert.strictEqual(item.getType(), Date);
                }
            });
        });

        it('should set the field format from Object with field instance', () => {
            const fields = Object.keys(recordData);
            const record = new Record({
                format: {
                    id: new IntegerField() as any
                },
                rawData: recordData
            });
            const recordFormat = record.getFormat();

            assert.equal(recordFormat.getCount(), fields.length);
            recordFormat.each((item, index) => {
                assert.strictEqual(item.getName(), fields[index]);
                if (item.getName() === 'id') {
                    assert.strictEqual(item.getType(), 'Integer');
                }
            });
        });

        it('should inherit from the recordset format', () => {
            const rs = new RecordSet<Record>({
                format: [{
                    name: 'date',
                    type: 'date',
                    defaultValue: new Date()
                }]
            });

            const record = new Record({
                rawData: {
                    date: '2015-01-02 10:11:12'
                }
            });
            rs.add(record);

            const format = record.getFormat();
            assert.strictEqual(format.at(0).getName(), 'date');
        });
    });

    describe('.addField()', () => {
        it('should add the field from the declaration', () => {
            const index = 1;
            const fieldName = 'login';
            const fieldDefault = 'user';

            record.addField({
                name: fieldName,
                type: 'string',
                defaultValue: fieldDefault
            }, index);

            assert.strictEqual(record.getFormat().at(index).getName(), fieldName);
            assert.strictEqual(record.getFormat().at(index).getDefaultValue(), fieldDefault);
            assert.strictEqual(record.get(fieldName), fieldDefault);
            assert.strictEqual(record.getRawData()[fieldName], fieldDefault);
        });

        it('should add the field from the instance', () => {
            const fieldName = 'login';
            const fieldDefault = 'username';
            record.addField(fieldsFactory({
                name: fieldName,
                type: 'string',
                defaultValue: fieldDefault
            }));
            const index = record.getFormat().getCount() - 1;

            assert.strictEqual(record.getFormat().at(index).getName(), fieldName);
            assert.strictEqual(record.getFormat().at(index).getDefaultValue(), fieldDefault);
            assert.strictEqual(record.get(fieldName), fieldDefault);
            assert.strictEqual(record.getRawData()[fieldName], fieldDefault);
        });

        it('should add the field with the value', () => {
            const fieldName = 'login';
            const fieldValue = 'root';
            record.addField({name: fieldName, type: 'string', defaultValue: 'user'}, 0, fieldValue);

            assert.strictEqual(record.get(fieldName), fieldValue);
            assert.strictEqual(record.getRawData()[fieldName], fieldValue);
        });

        it('should throw an error if the field is already defined', () => {
            assert.throws(() => {
                record.addField({name: 'title', type: 'string'});
            });
        });

        it('should throw an error if add the field twice', () => {
            record.addField({name: 'new', type: 'string'});
            assert.throws(() => {
                record.addField({name: 'new', type: 'string'});
            });
        });

        it('should throw an error if the record has an owner', () => {
            const rs = new RecordSet<Record>();
            rs.add(new Record());

            const record = rs.at(0);
            assert.throws(() => {
                record.addField({name: 'new', type: 'string'});
            });
        });

        it('should add the empty record field', () => {
            const fieldName = 'rec';
            record.addField({name: fieldName, type: 'record'});

            assert.isNull(record.get(fieldName));
            assert.isNull(record.getRawData()[fieldName]);
        });

        it('should add the filled record field', () => {
            const fieldName = 'rec';
            record.addField(
                {name: fieldName, type: 'record'},
                0,
                new Record({rawData: {a: 1}})
            );

            assert.strictEqual(record.get(fieldName).get('a'), 1);
            assert.strictEqual(record.getRawData()[fieldName].a, 1);
        });

        it('should add the empty recordset field', () => {
            const fieldName = 'rs';
            record.addField({name: fieldName, type: 'recordset'});

            assert.isNull(record.get(fieldName));
            assert.isNull(record.getRawData()[fieldName]);
        });

        it('should add the filled recordset field', () => {
            const fieldName = 'rs';
            record.addField(
                {name: fieldName, type: 'recordset'},
                0,
                new RecordSet({rawData: [{a: 1}]})
            );

            assert.strictEqual(record.get(fieldName).at(0).get('a'), 1);
            assert.strictEqual(record.getRawData()[fieldName][0].a, 1);
        });

        it('should add a sbis hierarhy field', () => {
            const record1 = new Record({
                adapter: new SbisAdapter(),
                rawData: {
                    _type: 'record',
                    s: [
                        {n: 'parent', t: 'Идентификатор'},
                        {n: 'parent@', t: 'Логическое'},
                        {n: 'parent$', t: 'Логическое'}
                    ],
                    d: [[null], null, null]
                }
            });
            const record2 = new Record({
                adapter: new SbisAdapter()
            });

            record1.getFormat().each((field) => {
                record2.addField(field, undefined, record1.get(field.getName()));
            });

            assert.deepEqual(record1.getRawData(), record2.getRawData());
        });

        it('should trigger onPropertyChange event with default value', () => {
            let result;
            const handler = (event, map) => {
                result = map;
            };

            record.subscribe('onPropertyChange', handler);
            record.addField({name: 'foo', type: 'string', defaultValue: 'bar'}, 0);
            record.unsubscribe('onPropertyChange', handler);

            assert.equal(result.foo, 'bar');
        });

        it('should trigger onPropertyChange event with argument value', () => {
            let result;
            const handler = (event, map) => {
                result = map;
            };

            record.subscribe('onPropertyChange', handler);
            record.addField({name: 'foo', type: 'string', defaultValue: 'bar'}, 0, 'baz');
            record.unsubscribe('onPropertyChange', handler);

            assert.equal(result.foo, 'baz');
        });

        it('should change owner\'s raw data', () => {
            const parent = new Record();
            const child = new Record();

            parent.set('foo', child);
            assert.strictEqual(parent.getRawData().foo, null);

            child.addField({name: 'bar', type: 'string'});
            assert.deepEqual(parent.getRawData().foo, {bar: null});
        });

        it('should break link with "format" option source', () => {
            const format = new Format();
            const record = new Record({format});

            record.addField({name: 'bar', type: 'string'});
            assert.notEqual(record.getFormat(true), format);
        });
    });

    describe('.removeField()', () => {
        it('should remove the exists field', () => {
            const fieldName = 'title';
            const record = new Record({
                rawData: {title: 'test'},
                format: [{name: fieldName, type: 'string'}]
            });
            record.removeField(fieldName);

            assert.strictEqual(record.getFormat().getFieldIndex(fieldName), -1);
            assert.isFalse(record.has(fieldName));
            assert.isUndefined(record.get(fieldName));
            assert.isUndefined(record.getRawData()[fieldName]);
        });

        it('should throw an error for not defined field', () => {
            assert.throws(() => {
                record.removeField('some');
            });
        });

        it('should throw an error if remove the field twice', () => {
            const fieldName = 'title';
            const record = new Record({
                format: [{name: fieldName, type: 'string'}]
            });
            record.removeField(fieldName);
            assert.throws(() => {
                record.removeField(fieldName);
            });
        });

        it('should throw an error if the record has an owner', () => {
            const rs = new RecordSet<Record>();
            rs.add(new Record({
                rawData: {a: 1}
            }));

            const record = rs.at(0);
            assert.throws(() => {
                record.removeField('a');
            });
        });

        it('should remove cached field value', () => {
            const value = {bar: 'baz'};
            const record = new Record({
                rawData: {foo: value}
            });

            assert.strictEqual(record.get('foo'), value);
            record.removeField('foo');
            assert.isUndefined(record.get('foo'));
        });

        it('should remove field from changed', () => {
            record = new Record();
            record.set('foo', 'bar');

            assert.isTrue(record.isChanged('foo'));
            record.removeField('foo');
            assert.isFalse(record.isChanged('foo'));
        });

        it('should trigger onPropertyChange event', () => {
            const record = new Record({
                rawData: {foo: 'bar'}
            });

            let result;
            const handler = (event, map) => {
                result = map;
            };

            record.subscribe('onPropertyChange', handler);
            record.removeField('foo');
            record.unsubscribe('onPropertyChange', handler);

            assert.isTrue(result.hasOwnProperty('foo'));
            assert.isUndefined(result.foo);
        });

        it('should change owner\'s raw data', () => {
            const parent = new Record();
            const child = new Record({rawData: {bar: 'baz'}});

            parent.set('foo', child);
            assert.deepEqual(parent.getRawData().foo, {bar: 'baz'});

            child.removeField('bar');
            assert.deepEqual(parent.getRawData().foo, {});
        });
    });

    describe('.removeFieldAt()', () => {
        it('should throw an error if adapter doesn\'t support fields indexes', () => {
            assert.throws(() => {
                record.removeFieldAt(1);
            });
        });

        it('should remove the exists field', () => {
            const format = getRecordFormat();
            const fieldIndex = 1;
            const fieldName = format[fieldIndex].name;
            const record = new Record({
                format,
                adapter: new SbisAdapter(),
                rawData: getRecordSbisData()
            });
            record.clone();
            record.removeFieldAt(fieldIndex);

            assert.notEqual(record.getFormat().at(fieldIndex).getName(), fieldName);
            assert.isFalse(record.has(fieldName));
            assert.isUndefined(record.get(fieldName));
            assert.isUndefined(record.getRawData()[fieldName]);
        });

        it('should throw an error for not exists index', () => {
            assert.throws(() => {
                const record = new Record({
                    adapter: new SbisAdapter()
                });
                record.removeFieldAt(0);
            });
        });

        it('should throw an error if the record has an owner', () => {
            const originalRecord = new Record({
                adapter: new SbisAdapter()
            });
            const rs = new RecordSet<Record>({
                adapter: new SbisAdapter()
            });

            originalRecord.addField({name: 'a', type: 'string'});
            originalRecord.removeFieldAt(0);

            originalRecord.addField({name: 'a', type: 'string'});
            rs.add(originalRecord);

            const receivedRecord = rs.at(0);
            assert.throws(() => {
                receivedRecord.removeFieldAt(0);
            });
        });

        it('should remove cached field value', () => {
            const value = {bar: 'baz'};
            const record = new Record({
                format: {
                    foo: 'object'
                },
                adapter: new SbisAdapter()
            });

            record.set('foo', value);

            assert.strictEqual(record.get('foo'), value);
            record.removeFieldAt(0);
            assert.isUndefined(record.get('foo'));
        });

        it('should remove field from changed', () => {
            record = new Record({
                format: {foo: String},
                adapter: new SbisAdapter()
            });
            record.set('foo', 'bar');

            assert.isTrue(record.isChanged('foo'));
            record.removeFieldAt(0);
            assert.isFalse(record.isChanged('foo'));
        });

        it('should trigger onPropertyChange event', () => {
            const record = new Record({
                format: {
                    foo: 'string'
                },
                adapter: new SbisAdapter()
            });
            record.set('foo', 'bar');

            let result;
            const handler = (event, map) => {
                result = map;
            };

            record.subscribe('onPropertyChange', handler);
            record.removeFieldAt(0);
            record.unsubscribe('onPropertyChange', handler);

            assert.isTrue(result.hasOwnProperty('foo'));
            assert.isUndefined(result.foo);
        });

        it('should change owner\'s raw data', () => {
            const parent = new Record({
                adapter: new SbisAdapter(),
                format: {foo: 'record'}
            });
            const child = new Record({
                adapter: new SbisAdapter(),
                format: {bar: 'string'}
            });
            child.set('bar', 'baz');

            parent.set('foo', child);
            assert.deepEqual(parent.getRawData().d[0].d, ['baz']);

            child.removeFieldAt(0);
            assert.deepEqual(parent.getRawData().d[0].d, []);
        });
    });

    describe('.isChanged()', () => {
        it('should return false by default', () => {
            assert.isFalse(record.isChanged('id'));
            assert.isFalse(record.isChanged());
        });

        it('should return false for undefined property', () => {
            assert.isFalse(record.isChanged('not-exists-prop'));
        });

        it('should return true after field change', () => {
            record.set('id', 123);
            assert.isTrue(record.isChanged('id'));
            assert.isTrue(record.isChanged());
        });

        it('should return true after set a new field', () => {
            record.set('aaa', 321);
            assert.isTrue(record.isChanged('aaa'));
            assert.isTrue(record.isChanged());
        });

        it('should return true for deep changed item', () => {
            const sub = new Record();
            const list = new ObservableList();
            const top = new Record();

            sub.set('test', 'v1');
            list.add(sub);
            top.set('list', list);
            top.acceptChanges();

            assert.isFalse(top.isChanged('list'));
            sub.set('test', 'v2');
            assert.isTrue(top.isChanged('list'));
        });
    });

    describe('.isEqual()', () => {
        it('should work fine with invalid argument', () => {
            assert.isFalse(record.isEqual(undefined));
            assert.isFalse(record.isEqual(null));
            assert.isFalse(record.isEqual(false as any));
            assert.isFalse(record.isEqual(true as any));
            assert.isFalse(record.isEqual(0 as any));
            assert.isFalse(record.isEqual(1 as any));
            assert.isFalse(record.isEqual('' as any));
            assert.isFalse(record.isEqual('a' as any));
            assert.isFalse(record.isEqual([] as any));
            assert.isFalse(record.isEqual({} as any));
        });

        it('should return true for the same record', () => {
            const same = new Record({
                rawData: getRecordData()
            });
            assert.isTrue(record.isEqual(same));
        });

        it('should return true for itself', () => {
            assert.isTrue(record.isEqual(record));

            record.set('max', 1 + record.get('max'));
            assert.isTrue(record.isEqual(record));
        });

        it('should return true for the clone', () => {
            assert.isTrue(record.isEqual(record.clone()));
        });

        it('should return true for empties', () => {
            const record = new Record();
            assert.isTrue(record.isEqual(new Record()));
        });

        it('should return false if field changed', () => {
            const same = new Record({
                rawData: getRecordData()
            });
            same.set('title', 'B');
            assert.isFalse(record.isEqual(same));
        });

        it('should return true with shared raw data', () => {
            const anotherRecord = getRecord();
            assert.isTrue(record.isEqual(anotherRecord));
        });

        it('should return true with same raw data', () => {
            const anotherRecord = getRecord(getRecordData());
            assert.isTrue(record.isEqual(anotherRecord));
        });

        it('should return false with different raw data', () => {
            interface IExtData extends IData {
                someField?: string;
            }

            const dataA: IExtData = getRecordData();
            dataA.someField = 'someValue';
            const anotherRecordA = getRecord(dataA);
            assert.isFalse(record.isEqual(anotherRecordA));

            const dataB = getRecordData();
            for (const key in dataB) {
                if (dataB.hasOwnProperty(key)) {
                    delete dataB[key];
                    break;
                }
            }
            const anotherRecordB = getRecord(dataB);
            assert.isFalse(record.isEqual(anotherRecordB));
        });

        it('should return false for changed and true for reverted back record', () => {
            const anotherRecord = getRecord(getRecordData());
            anotherRecord.set('max', 1 + record.get('max'));
            assert.isFalse(record.isEqual(anotherRecord));

            anotherRecord.set('max', record.get('max'));
            assert.isTrue(record.isEqual(anotherRecord));
        });

        it('should return true for same module and submodule', () => {
            const MyRecord = extend.extend(Record, {});
            const recordA = new Record();
            const recordB = new Record();
            const recordC = new MyRecord();

            assert.isTrue(recordA.isEqual(recordB));
            assert.isTrue(recordA.isEqual(recordC));
        });

        it('should return true with nested records', () => {
            const nestedRecordA =  new Record({
                rawData: {foo: 'bar'}
            });
            const recordA =  new Record({
                rawData: nestedRecordA,
                adapter: new RecordSetAdapter()
            });

            const nestedRecordB =  new Record({
                rawData: {foo: 'bar'}
            });
            const recordB =  new Record({
                rawData: nestedRecordB,
                adapter: new RecordSetAdapter(),
                cow: true
            });

            assert.isTrue(recordA.isEqual(recordB));
        });
    });

    describe('.clone()', () => {
        it('should not be same as original', () => {
            assert.notEqual(record.clone(), record);
            assert.notEqual(record.clone(true), record);
        });

        it('should not be same as previous clone', () => {
            assert.notEqual(record.clone(), record.clone());
        });

        it('should clone rawData', () => {
            const clone = record.clone();
            assert.notEqual(record.getRawData(), clone.getRawData());
            assert.deepEqual(record.getRawData(), clone.getRawData());
        });

        it('should clone changed fields', () => {
            const cloneA = record.clone();
            assert.isFalse(cloneA.isChanged('id'));
            assert.strictEqual(record.isChanged('id'), cloneA.isChanged('id'));
            assert.strictEqual(record.isChanged(), cloneA.isChanged());
            assert.isFalse(cloneA.isChanged());

            record.set('a', 1);
            const cloneB = record.clone();
            assert.strictEqual(record.isChanged('a'), cloneB.isChanged('a'));
            assert.isTrue(cloneB.isChanged('a'));
            assert.strictEqual(record.isChanged('id'), cloneB.isChanged('id'));
            assert.isFalse(cloneB.isChanged('id'));
            assert.strictEqual(record.isChanged(), cloneB.isChanged());
            assert.isTrue(cloneB.isChanged());
        });

        it('should give equal fields', () => {
            const clone = record.clone();
            record.each((name, value) => {
                assert.strictEqual(value, clone.get(name));
            });
            clone.each((name, value) => {
                assert.strictEqual(value, record.get(name));
            });
        });

        it('should clone state markers', () => {
            const cloneA = record.clone();
            assert.strictEqual(record.getState(), cloneA.getState());

            record.setState(Record.RecordState.DELETED);
            const cloneB = record.clone();
            assert.strictEqual(record.getState(), cloneB.getState());
        });

        it('should keep recordset format', () => {
            const rs = new RecordSet({
                format: {
                    foo: Date
                },
                rawData: [
                    {foo: '2008-09-28'}
                ]
            });
            const item = rs.at(0);
            const clone = item.clone();

            assert.instanceOf(clone.get('foo'), Date);
        });

        it('should make raw data unlinked from original', () => {
            const cloneA = record.clone();
            assert.equal(cloneA.get('max'), record.get('max'));
            cloneA.set('max', 1);
            assert.notEqual(cloneA.get('max'), record.get('max'));

            const cloneB = record.clone();
            assert.equal(cloneB.get('max'), record.get('max'));
            record.set('max', 12);
            assert.notEqual(cloneB.get('max'), record.get('max'));
        });

        it('should make raw data linked to original if shallow', () => {
            const clone = record.clone(true);
            assert.strictEqual(record.getRawData(true), clone.getRawData(true));
        });

        it('should make data unlinked between several clones', () => {
            const cloneA = record.clone();
            const cloneB = record.clone();
            assert.equal(cloneA.get('max'), cloneB.get('max'));
            cloneA.set('max', 1);
            assert.notEqual(cloneA.get('max'), cloneB.get('max'));
        });

        it('should return equal rawData if data container signature presented', () => {
            const rawData = {
                _type: 'record',
                _mustRevive: true,
                s: [],
                d: []
            };
            const record = new Record({
                rawData,
                adapter: new SbisAdapter()
            });

            const clone = record.clone();
            assert.deepEqual(clone.getRawData(true), rawData);
        });
    });

    describe('.getOwner()', () => {
        it('should return null by default', () => {
            assert.isNull(record.getOwner());
        });

        it('should return value passed to the constructor', () => {
            const owner = new RecordSet();
            const record = new Record({owner});
            assert.strictEqual(record.getOwner(), owner);
        });
    });

    describe('.detach()', () => {
        it('should reset owner to the null', () => {
            const record = new Record({
                owner: new RecordSet()
            });
            record.detach();
            assert.isNull(record.getOwner());
        });

        it('should reset state to Detached', () => {
            const record = new Record({
                owner: new RecordSet(),
                state: Record.RecordState.UNCHANGED
            });
            record.detach();
            assert.strictEqual(record.getState(), Record.RecordState.DETACHED);
        });
    });

    describe('.getState()', () => {
        it('should return Detached by default', () => {
            assert.strictEqual(record.getState(), Record.RecordState.DETACHED);
        });

        it('should return state passed to the constructor', () => {
            const record = new Record({
                state: Record.RecordState.UNCHANGED
            });
            assert.strictEqual(record.getState(), Record.RecordState.UNCHANGED);
        });

        it('should return "Changed" from previous "Unchanged" after change any field value', () => {
            const record = new Record({
                state: Record.RecordState.UNCHANGED
            });
            record.set('id', -1);
            assert.strictEqual(record.getState(), Record.RecordState.CHANGED);
        });

        it('should keep "Detached" after change any field value', () => {
            const record = new Record({
                state: Record.RecordState.DETACHED
            });
            record.set('id', -1);
            assert.strictEqual(record.getState(), Record.RecordState.DETACHED);
        });

        it('should keep "Added" after change any field value', () => {
            const record = new Record({
                state: Record.RecordState.ADDED
            });
            record.set('id', -1);
            assert.strictEqual(record.getState(), Record.RecordState.ADDED);
        });

        it('should keep "Deleted" after change any field value', () => {
            const record = new Record({
                state: Record.RecordState.DELETED
            });
            record.set('id', -1);
            assert.strictEqual(record.getState(), Record.RecordState.DELETED);
        });
    });

    describe('.setState()', () => {
        it('should set the new state', () => {
            record.setState(Record.RecordState.DELETED);
            assert.strictEqual(record.getState(), Record.RecordState.DELETED);
        });
    });

    describe('.toJSON()', () => {
        it('should serialize a Record', () => {
            const json = record.toJSON();
            const options = (record as any)._getOptions();
            delete options.owner;

            assert.strictEqual(json.module, 'Types/entity:Record');
            assert.isNumber(json.id);
            assert.isTrue(json.id > 0);
            assert.deepEqual(json.state.$options, options);
            assert.deepEqual((json.state as any)._changedFields, (record as any)._changedFields);
        });

        it('should serialize a Record with format', () => {
            const record = new Record({
                format: [{name: 'id', type: 'integer'}]
            });
            const json = record.toJSON();

            assert.isTrue(
                record.getFormat().isEqual(
                    json.state.$options.format
                )
            );
        });

        it('should set subclass\'s module name from prototype', () => {
            class SubRecord extends Record {
                // Just subclass
            }
            Object.assign(SubRecord.prototype, {
                _moduleName: 'My.Sub'
            });

            const record = new SubRecord();
            const json = record.toJSON();
            assert.strictEqual(json.module, 'My.Sub');
        });

        it('should set subclass\'s module name from instance', () => {
            class SubRecord extends Record {
                protected _moduleName: string = 'My.Sub';
            }

            const record = new SubRecord();
            const json = record.toJSON();
            assert.strictEqual(json.module, 'My.Sub');
        });

        it('should throw an error if subclass\'s module name is not defined', () => {
            const Sub = extend.extend(Record, {});
            const record = new Sub();
            assert.throws(() => {
                record.toJSON();
            });
        });

        it('should keep original raw data if old-fashioned extend used', () => {
            const SubRecord = extend.extend(Record, {
                _moduleName: 'SubRecord',
                $protected: {
                    _options: {
                        foo: 'bar'
                    }
                }
            });
            const getFirstData = () => {
                return {first: true};
            };
            const getSecondData = () => {
                return {second: true};
            };
            const record = new SubRecord({
                rawData: getFirstData()
            });

            record.setRawData(getSecondData());
            assert.deepEqual(record.getRawData(), getSecondData());
            record.toJSON();
            assert.deepEqual(record.getRawData(), getSecondData());
        });

        it('should don\'t serialize writable property if old-fashioned extend used', () => {
            const SubRecord = extend.extend(Record, {
                _moduleName: 'SubRecord',
                $protected: {
                    _options: {
                        foo: 'bar'
                    }
                }
            });
            const record = new SubRecord({
                writable: false
            });
            const json = record.toJSON();

            assert.isUndefined(json.state.$options.writable);
        });
    });

    describe('::fromObject', () => {
        it('should make record from object with various adapter but with equal fields', () => {
            const data = {
                id: 1,
                title: 'title',
                selected: true,
                pid: null,
                lost: undefined
            };
            const recordA = Record.fromObject(data);
            const recordB = Record.fromObject(data, new SbisAdapter());

            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    assert.strictEqual(recordA.get(key), data[key]);
                    assert.strictEqual(recordB.get(key), data[key]);
                }
            }
        });

        it('should create DateTime field by default', () => {
            const record = Record.fromObject({date: new Date()});
            const field = record.getFormat().at(0);

            assert.equal(field.getType(), 'datetime');
        });

        it('should create DateTime from special DateTime type', () => {
            const record = Record.fromObject({date: new DateTime()});
            const field = record.getFormat().at(0);

            assert.equal(field.getType(), 'datetime');
        });

        it('should create DateTime from special Date type', () => {
            const record = Record.fromObject({date: new TheDate()});
            const field = record.getFormat().at(0);

            assert.equal(field.getType(), 'date');
        });

        it('should create DateTime from special Time type', () => {
            const record = Record.fromObject({date: new Time()});
            const field = record.getFormat().at(0);

            assert.equal(field.getType(), 'time');
        });

        it('should create Date field if SQL_SERIALIZE_MODE_DATETIME', () => {
            const date = new Date();

            (date as ExtendDate).setSQLSerializationMode((Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_DATETIME);
            const record = Record.fromObject({date});
            const field = record.getFormat().at(0);

            assert.equal(field.getType(), 'datetime');
        });

        it('should create Date field if SQL_SERIALIZE_MODE_DATE', () => {
            const date = new Date();

            (date as ExtendDate).setSQLSerializationMode((Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_DATE);
            const record = Record.fromObject({date});
            const field = record.getFormat().at(0);

            assert.equal(field.getType(), 'date');
        });

        it('should create Time field if SQL_SERIALIZE_MODE_TIME', () => {
            const date = new Date();

            (date as ExtendDate).setSQLSerializationMode((Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_TIME);
            const record = Record.fromObject({date});
            const field = record.getFormat().at(0);

            assert.equal(field.getType(), 'time');
        });

        it('should create DateTime field if SQL_SERIALIZE_MODE_AUTO', () => {
            const date = new Date();

            (date as ExtendDate).setSQLSerializationMode((Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_AUTO);
            const record = Record.fromObject({date});
            const field = record.getFormat().at(0);

            assert.equal(field.getType(), 'datetime');
        });

        it('should create Array field with kind of String', () => {
            const record = Record.fromObject({foo: [1, '2']});
            const field = record.getFormat().at(0) as ArrayField;

            assert.equal(field.getType(), 'array');
            assert.equal(field.getKind(), 'string');
        });

        it('should create Array field with kind of String when it consist from null only', () => {
            const record = Record.fromObject({foo: [null]});
            const field = record.getFormat().at(0) as ArrayField;

            assert.equal(field.getType(), 'array');
            assert.equal(field.getKind(), 'string');
        });

        it('should create Array field with kind of Integer', () => {
            const record = Record.fromObject({foo: [1, 2]});
            const field = record.getFormat().at(0) as ArrayField;

            assert.equal(field.getType(), 'array');
            assert.equal(field.getKind(), 'integer');
        });

        it('should create Array field with kind of Integer when one item is null', () => {
            const record = Record.fromObject({foo: [1, null]});
            const field = record.getFormat().at(0) as ArrayField;

            assert.equal(field.getType(), 'array');
            assert.equal(field.getKind(), 'integer');
        });

        it('should create Array field with kind of Real', () => {
            const record = Record.fromObject({foo: [1, 2.5]});
            const field = record.getFormat().at(0) as ArrayField;

            assert.equal(field.getType(), 'array');
            assert.equal(field.getKind(), 'real');
        });

        it('should create Array field with kind of Boolean', () => {
            const record = Record.fromObject({foo: [true, 'false']});
            const field = record.getFormat().at(0) as ArrayField;

            assert.equal(field.getType(), 'array');
            assert.equal(field.getKind(), 'boolean');
        });

        it('should create Array field with kind of DateTime', () => {
            const record = Record.fromObject({foo: [new Date()]});
            const field = record.getFormat().at(0) as ArrayField;

            assert.equal(field.getType(), 'array');
            assert.equal(field.getKind(), 'datetime');
        });

        it('should create Array field with kind of first not null element', () => {
            const record = Record.fromObject({foo: [null, 1]});
            const field = record.getFormat().at(0) as ArrayField;

            assert.equal(field.getType(), 'array');
            assert.equal(field.getKind(), 'integer');
        });

        it('should create Array field with kind of first not undefined element', () => {
            const record = Record.fromObject({foo: [null, false]});
            const field = record.getFormat().at(0) as ArrayField;

            assert.equal(field.getType(), 'array');
            assert.equal(field.getKind(), 'boolean');
        });
    });

    describe('::produceInstance()', () => {
        it('should return an instance with the given raw data', () => {
            const data = {};
            const instance = Record.produceInstance(data);

            assert.instanceOf(instance, Record);
            assert.strictEqual(instance.getRawData(true), data);
        });

        it('should return an instance with the given adapter', () => {
            const adapter = new SbisAdapter();
            const instance = Record.produceInstance(null, {adapter});

            assert.instanceOf(instance, Record);
            assert.strictEqual(instance.getAdapter(), adapter);
        });

        it('should return an instance with inherited adapter', () => {
            const adapter = new SbisAdapter();
            const Foo = extend.extend(Record, {
                _$adapter: adapter
            });
            const instance = Foo.produceInstance(null);

            assert.instanceOf(instance, Foo);
            assert.strictEqual(instance.getAdapter(), adapter);
        });
    });

    describe('.getVersion()', () => {
        it('should change version if has been changed a value', () => {
            const rec = new Record({
                adapter: new SbisAdapter(),
                rawData: {
                    _type: 'record',
                    d: [1],
                    s: [{
                        n: 'id',
                        t: 'Число целое'
                    }]
                }
            });
            const version = rec.getVersion();

            rec.set('id', 5);
            assert.notEqual(rec.getVersion(), version);
        });

        it('should change version if has been changed a inner Record', () => {
            const rec = new Record({
                adapter: new SbisAdapter(),
                rawData: {
                    _type: 'record',
                    d: [{
                        _type: 'record',
                        d: [1],
                        s: [{
                            n: 'id',
                            t: 'Число целое'
                        }]
                    }],
                    s: [{
                        n: 'record',
                        t: 'Запись'
                    }]
                }
            });
            const version = rec.getVersion();

            rec.get('record').set('id', 5);
            assert.notEqual(rec.getVersion(), version);
        });

        it('should change version if has been changed an inner RecordSet', () => {
            const rec = new Record({
                adapter: new SbisAdapter(),
                rawData: {
                    _type: 'record',
                    d: [{
                        _type: 'recordset',
                        d: [[1], [2], [3], [4]],
                        s: [{
                            n: 'id',
                            t: 'Число целое'
                        }]
                    }],
                    s: [{
                        n: 'rs',
                        t: 'Выборка'
                    }]
                }
            });
            const version = rec.getVersion();

            rec.get('rs').at(0).set('id', 5);
            assert.notEqual(rec.getVersion(), version);
        });

        it('should change version if has been changed an inner Flags', () => {
            const rec = new Record({
                adapter: new SbisAdapter(),
                rawData: {
                    _type: 'record',
                    d: [[]],
                    s: [{
                        n: 'foo',
                        t: {n: 'Флаги', s: {0: 'one', 1: 'two'}}
                    }]
                }
            });

            const version = rec.getVersion();
            rec.get('foo').set('one', true);
            assert.notEqual(rec.getVersion(), version);
        });

        it('should change version if a field has been added in the format', () => {
            const rec = new Record({
                adapter: new SbisAdapter(),
                rawData: {
                    _type: 'record',
                    d: [1],
                    s: [{
                        n: 'id',
                        t: 'Число целое'
                    }]
                }
            });
            const version = rec.getVersion();

            rec.addField({name: 'name', type: 'string'});
            assert.notEqual(rec.getVersion(), version);
        });

        it('should change version if a field has been removed from the format', () => {
            const format = getRecordFormat();
            const rec = new Record({
                format,
                adapter: new SbisAdapter(),
                rawData: getRecordSbisData()
            });
            const version = rec.getVersion();

            rec.removeField('max');
            assert.notEqual(rec.getVersion(), version);
        });
    });

    describe('::filter()', () => {
        it('should return only odd fields values', () => {
            const rawData = {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
                e: 5
            };
            const record = new Record({
                rawData
            });
            const expect = [1, 3, 5];
            const result = Record.filter(record, (name, value) => !!(value % 2));

            let index = 0;
            result.each((name, value) => {
                assert.strictEqual(value, expect[index]);
                index++;
            });
            assert.strictEqual(index, expect.length);
        });

        it('should return all fields values', () => {
            const rawData = {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
                e: 5
            };
            const record = new Record({
                rawData
            });
            const expect = [1, 2, 3, 4, 5];
            const result = Record.filter(record, undefined);

            let index = 0;
            result.each((name, value) => {
                assert.strictEqual(value, expect[index]);
                index++;
            });
            assert.strictEqual(index, expect.length);
        });
    });

    describe('::filterFields()', () => {
        it('should return only given fields', () => {
            const data = {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
                e: 5
            };
            const record = new Record({
                rawData: data
            });
            const fields = ['a', 'b', 'd'];
            const result = (Record as any).filterFields(record, fields);

            let index = 0;
            result.each((name, value) => {
                assert.include(fields, name);
                assert.strictEqual(name, fields[index]);
                assert.strictEqual(value, record.get(name));
                index++;
            });
            assert.strictEqual(index, fields.length);
        });

        it('should not return undefined fields', () => {
            const data = {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
                e: 5
            };
            const record = new Record({
                rawData: data
            });
            const fields = ['a', 'z', 'c'];
            const result = (Record as any).filterFields(record, fields);

            let index = 0;
            result.each((name, value) => {
                assert.include(fields, name);
                assert.strictEqual(value, record.get(name));
                index++;
            });
            assert.strictEqual(index, fields.length - 1);
        });
    });
});
