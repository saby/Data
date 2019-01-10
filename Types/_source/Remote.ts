/// <amd-module name="Types/_source/Remote" />
/**
 * Источник данных, работающий удаленно.
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @class Types/Source/Remote
 * @extends Types/Source/Base
 * @implements Types/Source/ICrud
 * @implements Types/Source/ICrudPlus
 * @implements Types/Source/IProvider
 * @mixes Types/Entity/ObservableMixin
 * @mixes Types/Source/DataCrudMixin
 * @mixes Types/Source/BindingMixin
 * @mixes Types/Source/EndpointMixin
 * @ignoreOptions passing passing.create passing.read passing.update passing.destroy passing.query passing.copy passing.merge passing.move
 * @public
 * @author Мальцев А.А.
 */

import Base, {IOptions as IBaseOptions} from './Base';
import ICrud from './ICrud';
import ICrudPlus from './ICrudPlus';
import IProvider from './IProvider';
import DataMixin from './DataMixin';
import DataCrudMixin from './DataCrudMixin';
import BindingMixin from './BindingMixin';
import EndpointMixin from './EndpointMixin';
import OptionsMixin from './OptionsMixin';
import Query from './Query';
import {IAbstract} from './provider';
import {Record, ObservableMixin} from '../entity';
import {RecordSet} from '../collection';
import di from '../_di';
import {mixin, logger} from '../util';
// @ts-ignore
import req = require('require');
// @ts-ignore
import Deferred = require('Core/Deferred');

export interface IPassing {
   create: (meta?: Object) => Object,
   read: (key: string | number, meta?: Object) => Object,
   update: (data: Record | RecordSet<Record>, meta?: Object) => Object,
   destroy: (keys: string | string[], meta?: Object) => Object,
   query: (query: Query) => Object,
   copy: (key: string | number, meta?: Object) => Object,
   merge: (from: string | number, to: string | number) => Object,
   move: (from: string | number, to: string | number, meta?: Object) => Object
}

export interface IOptions extends IBaseOptions {
   updateOnlyChanged?: boolean
   navigationType?: string
}

const global = (0, eval)('this');
const DeferredCanceledError = global.DeferredCanceledError;

/**
 * Типы навигации для query()
 */
const NAVIGATION_TYPE = {
   PAGE: 'Page',
   OFFSET: 'Offset'
};

function isNull(value): boolean {
   return value === null || value === undefined;
}

function isEmpty(value): boolean {
   return value === '' || isNull(value);
}

/**
 * Формирует данные, передваемые в провайдер при вызове create().
 * @param {Object} [meta] Дополнительные мета данные, которые могут понадобиться для создания записи
 * @return {Object}.
 */
function passCreate(meta?: Object) {
   return [meta];
}

/**
 * Формирует данные, передваемые в провайдер при вызове read().
 * @param {String} key Первичный ключ записи
 * @param {Object|Types/Entity/Record} [meta] Дополнительные мета данные
 * @return {Object}
 */
function passRead(key, meta?: Object) {
   return [key, meta];
}

/**
 * Формирует данные, передваемые в провайдер при вызове update().
 * @param {Types/Entity/Record|Types/Collection/RecordSet} data Обновляемая запись или рекордсет
 * @param {Object} [meta] Дополнительные мета данные
 * @return {Object}
 */
function passUpdate(data, meta?: Object) {
   if (this._$options.updateOnlyChanged) {
      let idProperty = this._getValidIdProperty(data);
      if (!isEmpty(idProperty)) {
         if (DataMixin.isModelInstance(data) && !isNull(data.get(idProperty))) {
            //Filter record fields
            let Record = req('Types/entity').Record;
            let changed = data.getChanged();
            changed.unshift(idProperty);
            data = Record.filterFields(data, changed);
         } else if (DataMixin.isListInstance(data)) {
            //Filter recordset fields
            data = ((source) => {
               let RecordSet = req('Types/collection').RecordSet;
               let result = new RecordSet({
                  adapter: source._$adapter,
                  idProperty: source._$idProperty
               });

               source.each((record) => {
                  if (isNull(record.get(idProperty)) || record.isChanged()) {
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
 * @param {String|Array.<String>} keys Первичный ключ, или массив первичных ключей записи
 * @param {Object|Types/Entity/Record} [meta] Дополнительные мета данные
 * @return {Object}
 */
function passDestroy(keys, meta?: Object) {
   return [keys, meta];
}

/**
 * Формирует данные, передваемые в провайдер при вызове query().
 * @param {Types/Query/Query} [query] Запрос
 * @return {Object}
 */
function passQuery(query) {
   return [query];
}

/**
 * Формирует данные, передваемые в провайдер при вызове copy().
 * @param {String} key Первичный ключ записи
 * @param {Object} [meta] Дополнительные мета данные
 * @return {Object}
 */
function passCopy(key, meta?: Object) {
   return [key, meta];
}

/**
 * Формирует данные, передваемые в провайдер при вызове merge().
 * @param {String} from Первичный ключ записи-источника (при успешном объедининии запись будет удалена)
 * @param {String} to Первичный ключ записи-приёмника
 * @return {Object}
 */
function passMerge(from, to) {
   return [from, to];
}

/**
 * Формирует данные, передваемые в провайдер при вызове move().
 * @param {Array} items Перемещаемая запись.
 * @param {String} target Идентификатор целевой записи, относительно которой позиционируются перемещаемые.
 * @param {Object} [meta] Дополнительные мета данные.
 * @return {Object}
 */
function passMove(from, to, meta?: Object) {
   return [from, to, meta];
}

export default abstract class Remote extends mixin(
   Base, ObservableMixin, DataCrudMixin, BindingMixin, EndpointMixin
) implements ICrud, ICrudPlus, IProvider /** @lends Types/Source/Remote.prototype */{
   /**
    * @typedef {String} NavigationType
    * @variant Page По номеру страницы: передается номер страницы выборки и количество записей на странице.
    * @variant Offset По смещению: передается смещение от начала выборки и количество записей на странице.
    */

   /**
    * @cfg {Types/Source/Provider/IAbstract} Объект, реализующий сетевой протокол для обмена в режиме клиент-сервер
    * @name Types/Source/Remote#provider
    * @see getProvider
    * @see Types/Di
    * @example
    * <pre>
    *    var dataSource = new RemoteSource({
    *       endpoint: '/users/'
    *       provider: new AjaxProvider()
    *    });
    * </pre>
    */
   protected _$provider: IAbstract | string;

   /**
    * @cfg {Object} Методы подготовки аргументов по CRUD контракту.
    * @name Types/Source/Remote#passing
    * @example
    * Подключаем пользователей через HTTP API, для метода create() передадим данные как объект с полем 'data':
    * <pre>
    *    var dataSource = new HttpSource({
    *       endpoint: '//some.server/users/',
    *       prepare: {
    *          create: function(meta) {
    *             return {
    *                data: meta
    *             }
    *          }
    *       }
    *    });
    * </pre>
    */
   protected _$passing: IPassing;

   protected _$options: IOptions;

   /**
    * Объект, реализующий сетевой протокол для обмена в режиме клиент-сервер
    */
   protected _provider: IAbstract;

   // @ts-ignore
   protected constructor(options?: Object) {
      // @ts-ignore
      BindingMixin.constructor.call(this, options);
      // @ts-ignore
      EndpointMixin.constructor.call(this, options);
      super(options);
      ObservableMixin.call(this, options);

      this._publish('onBeforeProviderCall');
   }

   //region ICrud

   readonly '[Types/_source/ICrud]': boolean = true;

   create(meta) {
      return this._callProvider(
         this._$binding.create,
         this._$passing.create.call(this, meta)
      ).addCallback(
         (data) => this._loadAdditionalDependencies().addCallback(
            () => this._prepareCreateResult(data)
         )
      );
   }

   read(key, meta) {
      return this._callProvider(
         this._$binding.read,
         this._$passing.read.call(this, key, meta)
      ).addCallback(
         (data) => this._loadAdditionalDependencies().addCallback(
            () => this._prepareReadResult(data)
         )
      );
   }

   update(data, meta) {
      return this._callProvider(
         this._$binding.update,
         this._$passing.update.call(this, data, meta)
      ).addCallback(
         (key) => this._prepareUpdateResult(data, key)
      )
   }

   destroy(keys, meta) {
      return this._callProvider(
         this._$binding.destroy,
         this._$passing.destroy.call(this, keys, meta)
      );
   }

   query(query) {
      return this._callProvider(
         this._$binding.query,
         this._$passing.query.call(this, query)
      ).addCallback(
         (data) => this._loadAdditionalDependencies().addCallback(
            () => this._prepareQueryResult(data)
         )
      );
   }

   //endregion

   //region ICrudPlus

   readonly '[Types/_source/ICrudPlus]': boolean = true;

   merge(from, to) {
      return this._callProvider(
         this._$binding.merge,
         this._$passing.merge.call(this, from, to)
      );
   }

   copy(key, meta) {
      return this._callProvider(
         this._$binding.copy,
         this._$passing.copy.call(this, key, meta)
      ).addCallback(
         (data) => this._prepareReadResult(data)
      );
   }

   move(from, to, meta) {
      return this._callProvider(
         this._$binding.move,
         this._$passing.move.call(this, from, to, meta)
      );
   }

   //endregion

   //region IProvider

   readonly '[Types/_source/IProvider]': boolean = true;

   getEndpoint(): any {
      return EndpointMixin.getEndpoint.call(this);
   }

   getProvider(): IAbstract {
      if (!this._provider) {
         this._provider = this._createProvider(this._$provider, {
            endpoint: this._$endpoint,
            options: this._$options
         });
      }

      return this._provider;
   }

   //endregion

   //region Protected methods

   /**
    * Инстанциирует провайдер удаленного доступа
    * @param {String|Types/Source/Provider/IAbstract} provider Алиас или инстанс
    * @param {Object} options Аргументы конструктора
    * @return {Types/Source/Provider}
    * @protected
    */
   protected _createProvider(provider: IAbstract | string, options): IAbstract {
      if (!provider) {
         throw new Error('Remote access provider is not defined');
      }
      if (typeof provider === 'string') {
         provider = <IAbstract>di.create(provider, options);
      }

      return provider;
   }

   /**
    * Вызывает удаленный сервис через провайдер
    * @param {String} name Имя сервиса
    * @param {Object|Array} [args] Аргументы вызова
    * @return {Core/Deferred} Асинхронный результат операции
    * @protected
    */
   protected _callProvider(name, args): ExtendPromise<any> {
      let provider = this.getProvider();

      let eventResult = this._notify('onBeforeProviderCall', name, args);
      if (eventResult !== undefined) {
         args = eventResult;
      }

      let result = provider.call(
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
    * @param {Object} [args] Аргументы вызова
    * @return {Object|undefined}
    * @protected
    */
   protected _prepareProviderArguments(args) {
      return this.getAdapter().serialize(args);
   }

   protected _getValidIdProperty(data) {
      let idProperty = this.getIdProperty();
      if (!isEmpty(idProperty)) {
         return idProperty;
      }
      if (typeof data.getIdProperty === 'function') {
         return data.getIdProperty();
      }

      // FIXME: тут стоит выбросить исключение, поскольку в итоге возвращаем пустой idProperty
      return idProperty;
   }

   //endregion

   //region Statics

   static get NAVIGATION_TYPE() {
      return NAVIGATION_TYPE;
   }

   //endregion
}

Remote.prototype['[Types/_source/Remote]'] = true;
// @ts-ignore
Remote.prototype._$provider = null;
// @ts-ignore
Remote.prototype._$passing = /** @lends Types/Source/Remote.prototype */{

   /**
    * @cfg {Function} Метод подготовки аргументов при вызове {@link create}.
    * @name Types/Source/BindingMixin#passing.create
    */
   create: passCreate,

   /**
    * @cfg {Function} Метод подготовки аргументов при вызове {@link read}.
    * @name Types/Source/BindingMixin#passing.read
    */
   read: passRead,

   /**
    * @cfg {Function} Метод подготовки аргументов при вызове {@link update}.
    * @name Types/Source/BindingMixin#passing.update
    */
   update: passUpdate,

   /**
    * @cfg {Function} Метод подготовки аргументов при вызове {@link destroy}.
    * @name Types/Source/BindingMixin#passing.destroy
    */
   destroy: passDestroy,

   /**
    * @cfg {Function} Метод подготовки аргументов при вызове {@link query}.
    * @name Types/Source/BindingMixin#passing.query
    */
   query: passQuery,

   /**
    * @cfg {Function} Метод подготовки аргументов при вызове {@link copy}.
    * @name Types/Source/BindingMixin#passing.copy
    */
   copy: passCopy,

   /**
    * @cfg {Function} Метод подготовки аргументов при вызове {@link merge}.
    * @name Types/Source/BindingMixin#passing.merge
    */
   merge: passMerge,

   /**
    * @cfg {Function} Метод подготовки аргументов при вызове {@link move}.
    * @name Types/Source/BindingMixin#passing.move
    */
   move: passMove
};

// @ts-ignore
Remote.prototype._$options = OptionsMixin.addOptions(Base, /** @lends Types/Source/Remote.prototype */{
   /**
    * @cfg {Boolean} При сохранении отправлять только измененные записи (если обновляется набор записей) или только измененые поля записи (если обновляется одна запись).
    * @name Types/Source/Remote#options.updateOnlyChanged
    * @remark
    * Задавать опцию имеет смысл только если указано значение опции {@link idProperty}, позволяющая отличить новые записи от уже существующих.
    */
   updateOnlyChanged: false,

   /**
    * @cfg {NavigationType} Тип навигации, используемой в методе {@link query}.
    * @name Types/Source/Remote#options.navigationType
    * @example
    * Получим заказы магазина за сегодня с двадцать первого по тридцатый c использованием навигации через смещение:
    * <pre>
    *    var dataSource = new RemoteSource({
    *          endpoint: 'Orders'
    *          options: {
    *             navigationType: RemoteSource.prototype.NAVIGATION_TYPE.OFFSET
    *          }
    *       }),
    *       query = new Query();
    *
    *    query.select([
    *          'id',
    *          'date',
    *          'amount'
    *       ])
    *       .where({
    *          'date': new Date()
    *       })
    *       .orderBy('id')
    *       .offset(20)
    *       .limit(10);
    *
    *    dataSource.query(query).addCallbacks(function(dataSet) {
    *       var orders = dataSet.getAll();
    *    }, function(error) {
    *       console.error(error);
    *    });
    * </pre>
    */
   navigationType: NAVIGATION_TYPE.PAGE
});

Remote.prototype._moduleName = 'Types/source:Remote';
// @ts-ignore
Remote.prototype._provider = null;

// FIXME: backward compatibility for SbisFile/Source/BL
// @ts-ignore
Remote.prototype._prepareArgumentsForCall = Remote.prototype._prepareProviderArguments;
