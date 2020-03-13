import Local, {IOptions as ILocalOptions} from './Local';
import DataSet from './DataSet';
import Query, {IMeta, Join, WhereExpression} from './Query';
import {adapter} from '../entity';
import {register} from '../di';
import {protect, object} from '../util';
import {Map} from '../shim';
import {IHashMap} from '../_declarations';

/**
 * Protected 'cachedAdapter' property symbol
 */
const $cachedAdapter = protect('cachedAdapter');

/**
 * All injected data by contracts
 */
const contracts = {};

interface IEndpoint {
    contract?: string;
}

export interface IOptions extends ILocalOptions {
    data?: any;
    endpoint?: IEndpoint;
}

/**
 * Источник данных в памяти ОС.
 * Позволяет получать данные из объектов в оперативной памяти.
 * @remark
 * Создадим источник со списком объектов солнечной системы:
 * <pre>
 *     import {Memory} from 'Types/source';
 *
 *     const solarSystem = new Memory({
 *         data: [
 *             {id: 1, name: 'Sun', kind: 'Star'},
 *             {id: 2, name: 'Mercury', kind: 'Planet'},
 *             {id: 3, name: 'Venus', kind: 'Planet'},
 *             {id: 4, name: 'Earth', kind: 'Planet'},
 *             {id: 5, name: 'Mars', kind: 'Planet'},
 *             {id: 6, name: 'Jupiter', kind: 'Planet'},
 *             {id: 7, name: 'Saturn', kind: 'Planet'},
 *             {id: 8, name: 'Uranus', kind: 'Planet'},
 *             {id: 9, name: 'Neptune', kind: 'Planet'},
 *             {id: 10, name: 'Pluto', kind: 'Dwarf planet'}
 *         ],
 *         keyProperty: 'id'
 *     });
 *
 *     //Создадим новый объект:
 *     solarSystem.create(
 *         {id: 11, name: 'Moon', 'kind': 'Satellite'}
 *     ).then((satellite) => {
 *         console.log('Object created:', satellite.get('name')); // 'Object created: Moon'
 *     });
 *
 *     //Прочитаем данные о Солнце:
 *     solarSystem.read(1).then((star) => {
 *         console.log('Object readed:', star.get('name')); // 'Object readed: Sun'
 *     });
 *
 *     //Вернем Плутону статус планеты:
 *     solarSystem.read(10).then((pluto) => {
 *         pluto.set('kind', 'Planet');
 *         solarSystem.update(pluto).then(() => {
 *             console.log('Pluto is the planet again!');
 *         });
 *     });
 *
 *     //Удалим Марс:
 *     solarSystem.destroy(5).then(() => {
 *         console.log('Bye Mars!');
 *     });
 *
 *     //Получим список планет:
 *     const query = new Query();
 *     query.where({
 *         kind: 'Planet'
 *     });
 *     solarSystem.query(query).then((dataSet) => {
 *         const planets = dataSet.getAll();
 *         planets.getCount();//8
 *         planets.each((planet) => {
 *             console.log(planet.get('name'));
 *         });
 *         //Mercury, Venus, Earth, Jupiter, Saturn, Uranus, Neptune, Pluto
 *     });
 * </pre>
 * @class Types/_source/Memory
 * @extends Types/_source/Local
 * @public
 * @author Мальцев А.А.
 */
export default class Memory extends Local {
    /**
     * @cfg {Object} Данные, с которыми работает источник.
     * @name Types/_source/Memory#data
     * @remark
     * Данные должны быть в формате, поддерживаемом адаптером {@link adapter}.
     * @example
     * Создадим источник с данными объектов солнечной системы, данные представлены в виде массива:
     * <pre>
     *     import {Memory} from 'Types/source';
     *
     *     const solarSystem = new Memory({
     *         data: [
     *             {id: 1, name: 'Sun', kind: 'Star'},
     *             {id: 2, name: 'Mercury', kind: 'Planet'},
     *             {id: 3, name: 'Venus', kind: 'Planet'},
     *             {id: 4, name: 'Earth', kind: 'Planet'},
     *             {id: 5, name: 'Mars', kind: 'Planet'},
     *             {id: 6, name: 'Jupiter', kind: 'Planet'},
     *             {id: 7, name: 'Saturn', kind: 'Planet'},
     *             {id: 8, name: 'Uranus', kind: 'Planet'},
     *             {id: 9, name: 'Neptune', kind: 'Planet'},
     *             {id: 10, name: 'Pluto', kind: 'Dwarf planet'}
     *         ],
     *         keyProperty: 'id'
     *     });
     * </pre>
     * Создадим источник с данными объектов солнечной системы, данные представлены в виде
     * {@link Types/_collection/RecordSet рекордсета}:
     * <pre>
     *     import {Memory} from 'Types/source';
     *     import {RecordSet} from 'Types/collection';
     *     import {adapter} from 'Types/entity';
     *
     *     const solarData = new RecordSet({
     *         rawData: [
     *             {id: 1, name: 'Sun', kind: 'Star'},
     *             {id: 2, name: 'Mercury', kind: 'Planet'},
     *             {id: 3, name: 'Venus', kind: 'Planet'},
     *             {id: 4, name: 'Earth', kind: 'Planet'},
     *             {id: 5, name: 'Mars', kind: 'Planet'},
     *             {id: 6, name: 'Jupiter', kind: 'Planet'},
     *             {id: 7, name: 'Saturn', kind: 'Planet'},
     *             {id: 8, name: 'Uranus', kind: 'Planet'},
     *             {id: 9, name: 'Neptune', kind: 'Planet'},
     *             {id: 10, name: 'Pluto', kind: 'Dwarf planet'}
     *         ]
     *     });
     *     const solarSystem = new Memory({
     *         data: solarData,
     *         adapter: new adapter.RecordSet(),
     *         keyProperty: 'id'
     *     });
     * </pre>
     */
    protected _$data: any;

    protected _dataSetItemsProperty: string;

    protected _dataSetMetaProperty: string;

    /**
     * Пустые данные по таблицам
     */
    protected _emptyData: Map<string, any>;

    constructor(options?: IOptions) {
        super(options);

        // FIXME: YAGNI
        if (options &&
            options.endpoint &&
            options.endpoint.contract &&
            !contracts.hasOwnProperty(options.endpoint.contract)
        ) {
            contracts[options.endpoint.contract] = this._$data;
        }
    }

    // region Base

    protected _prepareQueryResult(data: any, query: Query): DataSet {
        // Selection has no items - return an empty table
        if (data && data.items === undefined) {
            data.items = this._getEmptyData(query);
        }
        return super._prepareQueryResult(data);
    }

    // endregion

    // region Local

    protected _getTableAdapter(): adapter.ITable {
        return this[$cachedAdapter as string] ||
            (this[$cachedAdapter as string] = this.getAdapter().forTable(this._$data));
    }

    protected _applyFrom(from?: string): any {
        return from ? contracts[from] : this.data;
    }

    protected _applyJoin(data: any, join: Join[]): any {
        if (join.length) {
            throw new Error('Joins are not supported');
        }
        return data;
    }

    protected _applyWhere(data: any, where?: WhereExpression<unknown>, meta?: IMeta): any {
        // FIXME: get rid of this SBIS specific stuff
        if (where && typeof where === 'object') {
            where = {...where} as IHashMap<string>;
            delete where.Разворот;
            delete where.ВидДерева;
            delete where.usePages;
        }

        return super._applyWhere(data, where, meta);
    }

    // endregion

    // region Protected members

    /**
     * Возвращает данные пустой выборки с учетом того, что в ней может содержаться описание полей (зависит от
     * используемого адаптера)
     * @param [query] Запрос
     * @protected
     */
    protected _getEmptyData(query?: Query): any {
        this._emptyData = this._emptyData || new Map();

        const table = query ? query.getFrom() : undefined;
        if (!this._emptyData.has(table)) {
            const items = object.clonePlain(this._applyFrom(table), true);
            const adapter = this.getAdapter().forTable(items);

            adapter.clear();
            this._emptyData.set(table, adapter.getData());
        }

        return this._emptyData.get(table);
    }

    // endregion
}

Object.assign(Memory.prototype, {
    '[Types/_source/Memory]': true,
    _moduleName: 'Types/source:Memory',
    _$data: null,
    _dataSetItemsProperty: 'items',
    _dataSetMetaProperty: 'meta',
    _emptyData: null
});

register('Types/source:Memory', Memory, {instantiate: false});
