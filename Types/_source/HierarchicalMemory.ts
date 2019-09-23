import ICrud from './ICrud';
import ICrudPlus from './ICrudPlus';
import IDecorator from './IDecorator';
import Memory, {IOptions as IMemoryOptions} from './Memory';
import Query from './Query';
import DataSet from './DataSet';
import {
    OptionsToPropertyMixin,
    SerializableMixin,
    ISerializableState as IDefaultSerializableState,
    Record,
    relation
} from '../entity';
import {RecordSet} from '../collection';
import {mixin} from '../util';
import {ExtendPromise} from '../_declarations';
import Deferred = require('Core/Deferred');

interface IOptions extends IMemoryOptions {
    parentProperty?: string;
}

interface ISerializableState extends IDefaultSerializableState {
    _source: Memory;
}

/**
 * Source which returns "breadcrumbs" to the root of hierarchy in the result of query() method.
 * @remark
 * "Breadcrumbs" stores as Array in property "path" of RecordSet's meta data.
 *
 * Let's create hierarchical source and select data with breadcrumbs:
 * <pre>
 *     require(['Types/source'], function (source) {
 *         var goods = new source.HierarchicalMemory({
 *             data: [
 *                 {id: 1, parent: null, name: 'Laptops'},
 *                 {id: 10, parent: 1, name: 'Apple MacBook Pro'},
 *                 {id: 11, parent: 1, name: 'Xiaomi Mi Notebook Air'},
 *                 {id: 2, parent: null, name: 'Smartphones'},
 *                 {id: 20, parent: 2, name: 'Apple iPhone'},
 *                 {id: 21, parent: 2, name: 'Samsung Galaxy'}
 *             ],
 *             keyProperty: 'id',
 *             parentProperty: 'parent'
 *         });
 *
 *         var laptopsQuery = new source.Query();
 *         laptopsQuery.where({parent: 1});
 *
 *         goods.query(laptopsQuery).addCallbacks(function(response) {
 *             var items = response.getAll();
 *             items.forEach(function(item) {
 *                  console.log(item.get('name'));//'Apple MacBook Pro', 'Xiaomi Mi Notebook Air'
 *             });
 *             items.getMetaData().path.map(function(item) {
 *                 console.log(item.get('name'));//'Laptops'
 *             });
 *         }, function(error) {
 *             console.error(error);
 *         });
 *     });
 * </pre>
 * @class Types/_source/HierarchicalMemory
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_source/IDecorator
 * @implements Types/_source/ICrud
 * @implements Types/_source/ICrudPlus
 * @mixes Types/_entity/SerializableMixin
 * @author Мальцев А.А.
 */
export default class HierarchicalMemory extends mixin<
    OptionsToPropertyMixin,
    SerializableMixin
>(
    OptionsToPropertyMixin,
    SerializableMixin
) implements IDecorator, ICrud, ICrudPlus {
    /**
     * @cfg {Object} See {@link Types/_source/Memory#data}.
     * @name Types/_source/HierarchicalMemory#data
     */

    /**
     * @cfg {String|Types/_entity/adapter/IAdapter} See {@link Types/_source/Memory#adapter}.
     * @name Types/_source/HierarchicalMemory#adapter
     */

    /**
     * @cfg {String|Function} See {@link Types/_source/Memory#model}.
     * @name Types/_source/HierarchicalMemory#model
     */

    /**
     * @cfg {String|Function} See {@link Types/_source/Memory#listModule}.
     * @name Types/_source/HierarchicalMemory#listModule
     */

    /**
     * @cfg {Function(Types/_entity/adapter/IRecord, Object):Boolean} See {@link Types/_source/Memory#filter}.
     * @name Types/_source/HierarchicalMemory#filter
     */

    /**
     * @cfg {String} See {@link Types/_source/Memory#keyProperty}.
     * @name Types/_source/HierarchicalMemory#keyProperty
     */

    /**
     * @cfg {String} Record's property name that contains identity of the node another node or leaf belongs to.
     * @name Types/_source/HierarchicalMemory#parentProperty
     */
    protected _$parentProperty: string;

    protected _source: Memory;

    protected get _keyProperty(): string {
        return this._source.getKeyProperty();
    }

    constructor(options?: IOptions) {
        super();
        OptionsToPropertyMixin.call(this, options);
        SerializableMixin.call(this);
        this._source = new Memory(options);
    }

    // region IDecorator

    readonly '[Types/_source/IDecorator]': boolean = true;

    getOriginal<T = Memory>(): T {
        return this._source as any;
    }

    // endregion

    // region ICrud

    readonly '[Types/_source/ICrud]': boolean = true;

    create(meta?: object): ExtendPromise<Record> {
        return this._source.create(meta);
    }

    read(key: any, meta?: object): ExtendPromise<Record> {
        return this._source.read(key, meta);
    }

    update(data: Record | RecordSet, meta?: Object): ExtendPromise<null> {
        return this._source.update(data, meta);
    }

    destroy(keys: any | any[], meta?: Object): ExtendPromise<null> {
        return this._source.destroy(keys, meta);
    }

    query(query: Query): ExtendPromise<DataSet> {
        const result = new Deferred();

        require(['Types/collection'], (collection) => {
            this._source.query(query).addCallbacks((response) => {
                if (this._$parentProperty) {
                    const hierarchy = new relation.Hierarchy({
                        keyProperty: this._keyProperty,
                        parentProperty: this._$parentProperty
                    });

                    const sourceRecords = new collection.RecordSet({
                        rawData: this._source.data,
                        adapter: this._source.getAdapter(),
                        keyProperty: this._keyProperty
                    });

                    const breadcrumbs = new collection.RecordSet({
                        adapter: this._source.getAdapter(),
                        keyProperty: this._keyProperty
                    });

                    // Extract breadcrumbs as path from filtered node to the root
                    const startFromId = query.getWhere()[this._$parentProperty];
                    let startFromNode = sourceRecords.getRecordById(startFromId);
                    if (startFromNode) {
                        breadcrumbs.add(startFromNode, 0);
                        let node;
                        while (startFromNode && (node = hierarchy.getParent(startFromNode, sourceRecords))) {
                            breadcrumbs.add(node, 0);
                            startFromNode = node.get(this._keyProperty);
                        }
                    }

                    // Store breadcrumbs as 'path' in meta data
                    const data =  response.getRawData(true);
                    if (data) {
                        const metaData =  data.meta || {};
                        metaData.path = breadcrumbs;
                        data.meta = metaData;
                        response.setRawData(data);
                    }
                }

                result.callback(response);
            }, (err) => {
                result.errback(err);
            });
        }, (err) => {
            result.errback(err);
        });

        return result as ExtendPromise<DataSet>;
    }

    // endregion

    // region ICrudPlus

    readonly '[Types/_source/ICrudPlus]': boolean = true;

    merge(from: string | number, to: string | number): ExtendPromise<any> {
        return this._source.merge(from, to);
    }

    copy(key: string | number, meta?: Object): ExtendPromise<Record> {
        return this._source.copy(key, meta);
    }

    move(items: Array<string | number>, target: string | number, meta?: object): ExtendPromise<any> {
        return this._source.move(items, target, meta);
    }

    // endregion

    // region SerializableMixin

    _getSerializableState(state: IDefaultSerializableState): ISerializableState {
        const resultState: ISerializableState = SerializableMixin.prototype._getSerializableState.call(this, state);
        resultState._source = this._source;

        return resultState;
    }

    _setSerializableState(state: ISerializableState): Function {
        const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
        return function(): void {
            fromSerializableMixin.call(this);
            this._source = state._source;
        };
    }

    // endregion
}

Object.assign(HierarchicalMemory.prototype, {
    '[Types/_source/HierarchicalMemory]': true,
    _moduleName: 'Types/source:HierarchicalMemory',
    _$parentProperty: null
});
