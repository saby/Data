import {assert} from 'chai';
import RecordSetAdapter from 'Types/_entity/adapter/RecordSet';
import RecordSetTableAdapter from 'Types/_entity/adapter/RecordSetTable';
import RecordSetRecordAdaprter from 'Types/_entity/adapter/RecordSetRecord';
import RecordSet from 'Types/_collection/RecordSet';
import Record from 'Types/_entity/Record';
import Model from 'Types/_entity/Model';

describe('Types/_entity/adapter/RecordSet', () => {
    let data: RecordSet;
    let adapter: RecordSetAdapter;

    beforeEach(() => {
        data = new RecordSet({
            rawData: [{
                id: 1,
                name: 'Smith'
            }, {
                id: 2,
                name: 'Green'
            }, {
                id: 3,
                name: 'Geller'
            }]
        });

        adapter = new RecordSetAdapter();
    });

    afterEach(() => {
        data = undefined;
        adapter = undefined;
    });

    describe('.forTable()', () => {
        it('should return table adapter', () => {
            assert.instanceOf(
                adapter.forTable(),
                RecordSetTableAdapter
            );
        });

        it('should pass data to the table adapter', () => {
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
                RecordSetRecordAdaprter
            );
        });

        it('should pass data to the record adapter', () => {
            const data = new Record();
            assert.strictEqual(
                adapter.forRecord(data).getData(),
                data
            );
        });

        context('when enclosed model used', () => {
            class ModelA extends Model {
                protected _$properties: {} = {
                    propA: {
                        get: () => 'A'
                    }
                };
            }

            class ModelB extends Model {
                protected _$properties: {} = {
                    propB: {
                        get: () => 'B'
                    }
                };
            }

            let model: ModelA;

            beforeEach(() => {
                model = new ModelA({
                    rawData: new ModelB({
                        rawData: {
                            propC: 'C'
                        }
                    }),
                    adapter: new RecordSetAdapter()
                });
            });

            afterEach(() => {
                model = undefined;
            });

            it('should return the property value', () => {
                assert.strictEqual(model.get('propA'), 'A');
                assert.strictEqual(model.get('propB'), 'B');
                assert.strictEqual(model.get('propC'), 'C');
            });

            it('should return the property value format is defined', () => {
                const model = new ModelA({
                    format: [],
                    rawData: new ModelB({
                        format: [{
                            name: 'propC', type: 'string'
                        }],
                        rawData: {
                            propC: 'C'
                        }
                    }),
                    adapter: new RecordSetAdapter()
                });

                assert.strictEqual(model.get('propA'), 'A');
                assert.strictEqual(model.get('propB'), 'B');
                assert.strictEqual(model.get('propC'), 'C');
            });

            it('should cast it to date', () => {
                const model = new ModelA({
                    format: [{name: 'date', type: 'date'}],
                    rawData: new ModelB({
                        format: [{
                            name: 'date', type: 'date'
                        }],
                        rawData: {
                            date: '2016-01-01'
                        }
                    }),
                    adapter: new RecordSetAdapter()
                });

                assert.deepEqual(model.get('date'), new Date(2016, 0, 1));
            });
        });
    });

    describe('.getKeyField()', () => {
        it('should return option keyProperty for recordset', () => {
            assert.strictEqual(adapter.getKeyField(data), data.getKeyProperty());
        });

        it('should return option keyProperty for model', () => {
            const data = new Model({
                keyProperty: 'test'
            });
            assert.strictEqual(adapter.getKeyField(data), 'test');
        });
    });

    describe('.getProperty()', () => {
        it('should return the property value', () => {
            assert.strictEqual(
                3,
                adapter.getProperty(data, 'count')
            );

            assert.isUndefined(
                adapter.getProperty(data, 'total')
            );

            assert.isUndefined(
                adapter.getProperty(data, undefined)
            );
        });

        it('should return undefined on invalid data', () => {
            assert.isUndefined(
                adapter.getProperty({}, undefined)
            );

            assert.isUndefined(
                adapter.getProperty('' as any, undefined)
            );

            assert.isUndefined(
                adapter.getProperty(0 as any, undefined)
            );

            assert.isUndefined(
                adapter.getProperty(undefined, undefined)
            );
        });
    });

    describe('.setProperty()', () => {
        it('should set the property value', () => {
            adapter.setProperty(data, 'keyProperty', 'name');
            assert.strictEqual(
                'name',
                data.getKeyProperty()
            );
        });

        it('should throw an error if property does not exist', () => {
            assert.throws(() => {
                adapter.setProperty(data, 'some', 'value');
            });
        });
    });
});
