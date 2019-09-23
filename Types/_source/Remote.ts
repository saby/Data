import Base, {IOptions as IBaseOptions} from './Base';
import ICrud from './ICrud';
import ICrudPlus from './ICrudPlus';
import IProvider from './IProvider';
import DataMixin from './DataMixin';
import DataCrudMixin from './DataCrudMixin';
import BindingMixin, {IOptions as IBindingOptions} from './BindingMixin';
import EndpointMixin, {IOptions as IEndpointOptions} from './EndpointMixin';
import OptionsMixin, {IOptionsOption as IOptionsMixinOption} from './OptionsMixin';
import Query, {NavigationType} from './Query';
import DataSet from './DataSet';
import {IAbstract} from './provider';
import {Record, ObservableMixin, IObservableMixinOptions, getMergeableProperty} from '../entity';
import {RecordSet} from '../collection';
import {create} from '../di';
import {mixin, logger} from '../util';
import {ExtendPromise} from '../_declarations';

// tslint:disable-next-line:ban-comma-operator
const global = (0, eval)('this');
const DeferredCanceledError = global.DeferredCanceledError;

export enum NavigationTypes {
    PAGE = NavigationType.Page,
    OFFSET = NavigationType.Offset,
    POSITION = NavigationType.Position
}

export interface IPassing {
    create?: (meta?: object) => object;
    read?: (key: string | number, meta?: object) => object;
    update?: (data: Record | RecordSet, meta?: object) => object;
    destroy?: (keys: string | string[], meta?: object) => object;
    query?: (query: Query) => object;
    copy?: (key: string | number, meta?: object) => object;
    merge?: (from: string | number, to: string | number) => object;
    move?: (from: string | number, to: string | number, meta?: object) => object;
}

export interface IOptionsOption extends IOptionsMixinOption {
    updateOnlyChanged?: boolean;
    navigationType?: NavigationTypes;
}

export interface IOptions extends IBaseOptions, IObservableMixinOptions, IBindingOptions, IEndpointOptions {
    options?: IOptionsOption;
    passing?: IPassing;
    provider?: IAbstract | string;
}

function isNull(value: any): boolean {
    return value === null || value === undefined;
}

function isEmpty(value: any): boolean {
    return value === '' || isNull(value);
}

/**
 * Формирует данные, передваемые в провайдер при вызове create().
 * @param [meta] Дополнительные мета данные, которые могут понадобиться для создания записи
 */
function passCreate(meta?: object): object[] {
    return [meta];
}

/**
 * Формирует данные, передваемые в провайдер при вызове read().
 * @param key Первичный ключ записи
 * @param [meta] Дополнительные мета данные
 */
function passRead(key: string, meta?: object): any[] {
    return [key, meta];
}

/**
 * Формирует данные, передваемые в провайдер при вызове update().
 * @param data Обновляемая запись или рекордсет
 * @param [meta] Дополнительные мета данные
 */
function passUpdate(data: Record | RecordSet, meta?: object): any[] {
    if (this._$options.updateOnlyChanged) {
        const keyProperty = this._getValidKeyProperty(data);
        if (!isEmpty(keyProperty)) {
            if (DataMixin.isModelInstance(data) && !isNull((data as Record).get(keyProperty))) {
                // Filter record fields
                const Record = require('Types/entity').Record;
                const changed = (data as Record).getChanged();
                changed.unshift(keyProperty);
                data = Record.filterFields(data, changed);
            } else if (DataMixin.isRecordSetInstance(data)) {
                // Filter recordset fields
                data = ((source) => {
                    const RecordSet = require('Types/collection').RecordSet;
                    const result = new RecordSet({
                        adapter: source.getAdapter(),
                        keyProperty: (source as RecordSet).getKeyProperty()
                    });

                    source.each((record) => {
                        if (isNull(record.get(keyProperty)) || record.isChanged()) {
                            result.add(record);
                        }
                    });

                    return result;
                })(data);
            }
        }
    }
    return [data, meta];
}

/**
 * Формирует данные, передваемые в провайдер при вызове destroy().
 * @param keys Первичный ключ, или массив первичных ключей записи
 * @param [meta] Дополнительные мета данные
 */
function passDestroy(keys: string | string[], meta?: object|Record): any[] {
    return [keys, meta];
}

/**
 * Формирует данные, передваемые в провайдер при вызове query().
 * @param [query] Запрос
 */
function passQuery(query: Query): any[] {
    return query instanceof Query ? [
         query.getSelect(),
         query.getFrom(),
         query.getWhere(),
         query.getOrderBy(),
         query.getOffset(),
         query.getLimit()
    ] : query;
}

/**
 * Формирует данные, передваемые в провайдер при вызове copy().
 * @param key Первичный ключ записи
 * @param [meta] Дополнительные мета данные
 */
function passCopy(key: string, meta?: object): any[] {
    return [key, meta];
}

/**
 * Формирует данные, передваемые в провайдер при вызове merge().
 * @param from Первичный ключ записи-источника (при успешном объедининии запись будет удалена)
 * @param to Первичный ключ записи-приёмника
 */
function passMerge(from: string, to: string): string[] {
    return [from, to];
}

/**
 * Формирует данные, передваемые в провайдер при вызове move().
 * @param items Перемещаемая запись.
 * @param target Идентификатор целевой записи, относительно которой позиционируются перемещаемые.
 * @param [meta] Дополнительные мета данные.
 */
function passMove(from: string | number, to: string, meta?: object): any[] {
    return [from, to, meta];
}

/**
 * Источник данных, работающий удаленно.
 * @remark
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @class Types/_source/Remote
 * @extends Types/_source/Base
 * @implements Types/_source/ICrud
 * @implements Types/_source/ICrudPlus
 * @implements Types/_source/IProvider
 * @mixes Types/_entity/ObservableMixin
 * @mixes Types/_source/DataCrudMixin
 * @mixes Types/_source/BindingMixin
 * @mixes Types/_source/EndpointMixin
 * @ignoreOptions passing passing.create passing.read passing.update passing.destroy passing.query passing.copy
 * passing.merge passing.move
 * @public
 * @author Мальцев А.А.
 */
export default abstract class Remote extends mixin<
    Base,
    ObservableMixin,
    DataCrudMixin,
    BindingMixin,
    EndpointMixin
>(
    Base,
    ObservableMixin,
    DataCrudMixin,
    BindingMixin,
    EndpointMixin
) implements ICrud, ICrudPlus, IProvider {

    /**
     * @typedef {String} NavigationType
     * @variant Page По номеру страницы: передается номер страницы выборки и количество записей на странице.
     * @variant Offset По смещению: передается смещение от начала выборки и количество записей на странице.
     */

    /**
     * @cfg {Types/_source/Provider/IAbstract} Объект, реализующий сетевой протокол для обмена в режиме клиент-сервер
     * @name Types/_source/Remote#provider
     * @see getProvider
     * @see Types/di
     * @example
     * <pre>
     *     var dataSource = new Remote({
     *         endpoint: '/users/'
     *         provider: new AjaxProvider()
     *     });
     * </pre>
     */
    protected _$provider: IAbstract | string;

    /**
     * @cfg {Object} Методы подготовки аргументов по CRUD контракту.
     * @name Types/_source/Remote#passing
     * @example
     * Подключаем пользователей через HTTP API, для метода create() передадим данные как объект с полем 'data':
     * <pre>
     *     var dataSource = new HttpSource({
     *         endpoint: '//some.server/users/',
     *         passing: {
     *             create: function(meta) {
     *                 return {
     *                     data: meta
     *                 }
     *             }
     *         }
     *     });
     * </pre>
     */
    protected _$passing: IPassing;

    protected _$options: IOptionsOption;

    /**
     * Объект, реализующий сетевой протокол для обмена в режиме клиент-сервер
     */
    protected _provider: IAbstract;

    protected constructor(options?: IOptions) {
        super(EndpointMixin._validateOptions(options));
        ObservableMixin.call(this, options);

        this._publish('onBeforeProviderCall');
    }

    // region ICrud

    readonly '[Types/_source/ICrud]': boolean = true;

    create(meta?: object): ExtendPromise<Record> {
        return this._callProvider(
            this._$binding.create,
            this._$passing.create.call(this, meta)
        ).addCallback(
            (data) => this._loadAdditionalDependencies().addCallback(
                () => this._prepareCreateResult(data)
            )
        );
    }

    read(key: any, meta?: object): ExtendPromise<Record> {
        return this._callProvider(
            this._$binding.read,
            this._$passing.read.call(this, key, meta)
        ).addCallback(
            (data) => this._loadAdditionalDependencies().addCallback(
                () => this._prepareReadResult(data)
            )
        );
    }

    update(data: Record | RecordSet, meta?: object): ExtendPromise<null> {
        return this._callProvider(
            this._$binding.update,
            this._$passing.update.call(this, data, meta)
        ).addCallback(
            (key) => this._prepareUpdateResult(data, key)
        );
    }

    // @ts-ignore
    destroy(keys: any | any[], meta?: object): ExtendPromise<null> {
        return this._callProvider(
            this._$binding.destroy,
            this._$passing.destroy.call(this, keys, meta)
        );
    }

    query(query?: Query): ExtendPromise<DataSet> {
        return this._callProvider(
            this._$binding.query,
            this._$passing.query.call(this, query)
        ).addCallback(
            (data) => this._loadAdditionalDependencies().addCallback(
                () => this._prepareQueryResult(data)
            )
        );
    }

    // endregion

    // region ICrudPlus

    readonly '[Types/_source/ICrudPlus]': boolean = true;

    merge(from: string | number, to: string | number): ExtendPromise<any> {
        return this._callProvider(
            this._$binding.merge,
            this._$passing.merge.call(this, from, to)
        );
    }

    copy(key: string | number, meta?: object): ExtendPromise<Record> {
        return this._callProvider(
            this._$binding.copy,
            this._$passing.copy.call(this, key, meta)
        ).addCallback(
            (data) => this._prepareReadResult(data)
        );
    }

    move(items: string | number | Array<string | number>, target: string | number, meta?: object): ExtendPromise<any> {
        return this._callProvider(
            this._$binding.move,
            this._$passing.move.call(this, items, target, meta)
        );
    }

    // endregion

    // region IProvider

    readonly '[Types/_source/IProvider]': boolean = true;

    getProvider(): IAbstract {
        if (!this._provider) {
            this._provider = this._createProvider(this._$provider, {
                endpoint: this._$endpoint,
                options: this._$options
            });
        }

        return this._provider;
    }

    // endregion

    // region Protected methods

    /**
     * Инстанциирует провайдер удаленного доступа
     * @param provider Алиас или инстанс
     * @param options Аргументы конструктора
     * @protected
     */
    protected _createProvider(provider: IAbstract | string, options: object): IAbstract {
        if (!provider) {
            throw new Error('Remote access provider is not defined');
        }
        if (typeof provider === 'string') {
            provider = create<IAbstract>(provider, options);
        }

        return provider;
    }

    /**
     * Вызывает удаленный сервис через провайдер
     * @param name Имя сервиса
     * @param [args] Аргументы вызова
     * @return Асинхронный результат операции
     * @protected
     */
    protected _callProvider(name: string, args: object): ExtendPromise<any> {
        const provider = this.getProvider();

        const eventResult = this._notify('onBeforeProviderCall', name, args);
        if (eventResult !== undefined) {
            args = eventResult;
        }

        const result = provider.call(
            name,
            this._prepareProviderArguments(args)
        );

        if (this._$options.debug) {
            result.addErrback((error) => {
                if (error instanceof DeferredCanceledError) {
                    logger.info(this._moduleName, `calling of remote service "${name}" has been cancelled.`);
                } else {
                    logger.error(this._moduleName, `remote service "${name}" throws an error "${error.message}".`);
                }
                return error;
            });
        }

        return result;
    }

    /**
     * Подготавливает аргументы к передаче в удаленный сервис
     * @param [args] Аргументы вызова
     * @protected
     */
    protected _prepareProviderArguments(args: object): object {
        return this.getAdapter().serialize(args);
    }

    protected _getValidKeyProperty(data: any): string {
        const keyProperty = this.getKeyProperty();
        if (!isEmpty(keyProperty)) {
            return keyProperty;
        }
        if (typeof data.getKeyProperty === 'function') {
            return data.getKeyProperty();
        }
        // Support deprecated method 'getIdProperty()'
        if (typeof data.getIdProperty === 'function') {
            return data.getIdProperty();
        }

        // FIXME: тут стоит выбросить исключение, поскольку в итоге возвращаем пустой keyProperty
        return keyProperty;
    }

    // endregion

    // region Statics

    static get NAVIGATION_TYPE(): typeof NavigationTypes {
        return NavigationTypes;
    }

    // endregion
}

Object.assign(Remote.prototype, /** @lends Types/_source/Remote.prototype */{
    '[Types/_source/Remote]': true,
    _moduleName: 'Types/source:Remote',
    _provider: null,
    _$provider: null,

    _$passing: getMergeableProperty<IPassing>({
        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link create}.
         * @name Types/_source/Remote#passing.create
         */
        create: passCreate,

        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link read}.
         * @name Types/_source/Remote#passing.read
         */
        read: passRead,

        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link update}.
         * @name Types/_source/Remote#passing.update
         */
        update: passUpdate,

        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link destroy}.
         * @name Types/_source/Remote#passing.destroy
         */
        destroy: passDestroy,

        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link query}.
         * @name Types/_source/Remote#passing.query
         */
        query: passQuery,

        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link copy}.
         * @name Types/_source/Remote#passing.copy
         */
        copy: passCopy,

        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link merge}.
         * @name Types/_source/Remote#passing.merge
         */
        merge: passMerge,

        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link move}.
         * @name Types/_source/Remote#passing.move
         */
        move: passMove
    }),

    _$options: getMergeableProperty<IOptionsOption>(OptionsMixin.addOptions<IOptionsOption>(Base, {
        /**
         * @cfg {Boolean} При сохранении отправлять только измененные записи (если обновляется набор записей) или только измененые поля записи (если обновляется одна запись).
         * @name Types/_source/Remote#options.updateOnlyChanged
         * @remark
         * Задавать опцию имеет смысл только если указано значение опции {@link keyProperty}, позволяющая отличить новые записи от уже существующих.
         */
        updateOnlyChanged: false,

        /**
         * @cfg {NavigationType} Тип навигации, используемой в методе {@link query}.
         * @name Types/_source/Remote#options.navigationType
         * @deprecated Set the meta-data in {@link Types/_source/Query#meta query} instead
         */
        navigationType: NavigationTypes.PAGE
    }))
});

// FIXME: backward compatibility for SbisFile/Source/BL
// @ts-ignore
Remote.prototype._prepareArgumentsForCall = Remote.prototype._prepareProviderArguments;
