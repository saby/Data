import Rpc from './Rpc';
import {IOptions as IRemoteOptions, IOptionsOption as IRpcOptionsOption, IPassing as IRemotePassing} from './Remote';
import {IEndpoint as IProviderEndpoint} from './IProvider';
import {IBinding as IDefaultBinding} from './BindingMixin';
import OptionsMixin from './OptionsMixin';
import DataMixin from './DataMixin';
import Query, {ExpandMode} from './Query';
import DataSet from './DataSet';
import {IAbstract} from './provider';
import {RecordSet} from '../collection';
import {adapter, Record} from '../entity';
import {register, resolve} from '../di';
import {logger, object} from '../util';
import {ExtendPromise} from '../_declarations';
// @ts-ignore
import ParallelDeferred = require('Core/ParallelDeferred');

/**
 * Extended navigation types
 */
const NAVIGATION_TYPE: any = {...Rpc.NAVIGATION_TYPE, ...{
   POSITION: 'Position' // Add POSITION navigation type
}};

enum PoitionNavigationOrder {
   before = 'before',
   after = 'after',
   both = 'both'
}

/**
 * Separator for Identity type
 */
const COMPLEX_ID_SEPARATOR = ',';

/**
 * Regexp for Identity type detection
 */
const COMPLEX_ID_MATCH = /^[0-9]+,[А-яA-z0-9]+$/;

export interface IEndpoint extends IProviderEndpoint {
   moveContract?: string;
}
/**
 * Extended IBinding
 */
export interface IBinding extends IDefaultBinding {
   updateBatch?: string;
   moveBefore?: string;
   moveAfter?: string;
   format?: string;
}

/**
 * Extended _$options
 */
export interface IOptionsOption extends IRpcOptionsOption {
   hasMoreProperty?: string;
}

/**
 * Move metadata interface
 */
export interface IMoveMeta {
   parentProperty?: string;
   objectName?: string;
   position?: string;
}

/**
 * Old move metadata interface
 */
interface IOldMoveMeta {
   before: string;
   hierField: string;
}

/**
 * Returns key of the BL Object from its complex id
 */
function getKeyByComplexId(id: string | number): string {
   id = String(id || '');
   if (id.match(COMPLEX_ID_MATCH)) {
      return id.split(COMPLEX_ID_SEPARATOR)[0];
   }
   return id;
}

/**
 * Returns name of the BL Object from its complex id
 */
function getNameByComplexId(id: string | number, defaults: string): string {
   id = String(id || '');
   if (id.match(COMPLEX_ID_MATCH)) {
      return id.split(COMPLEX_ID_SEPARATOR)[1];
   }
   return defaults;
}

/**
 * Creates complex id
 */
function createComplexId(id: string, defaults: string): string[] {
   id = String(id || '');
   if (id.match(COMPLEX_ID_MATCH)) {
      return id.split(COMPLEX_ID_SEPARATOR, 2);
   }
   return [id, defaults];
}

/**
 * Joins BL objects into groups be its names
 */
function getGroupsByComplexIds(ids: Array<string | number>, defaults: string): object {
   const groups = {};
   let name;
   for (let i = 0, len = ids.length; i < len; i++) {
      name = getNameByComplexId(ids[i], defaults);
      groups[name] = groups[name] || [];
      groups[name].push(getKeyByComplexId(ids[i]));
   }

   return groups;
}

/**
 * Calls destroy method for some BL-Object
 * @param instance Instance
 * @param ids BL objects ids to delete
 * @param name BL object name
 * @param meta Meta data
 */
function callDestroyWithComplexId(
   instance: SbisService | any,
   ids: string[],
   name: string,
   meta: object
): ExtendPromise<any> {
   return instance._callProvider(
      instance._$endpoint.contract === name ? instance._$binding.destroy :  name + '.' + instance._$binding.destroy,
      instance._$passing.destroy.call(instance, ids, meta)
   );
}

/**
 * Builds Record from plain object
 * @param data Record data as JSON
 * @param adapter
 */
function buildRecord(data: any, adapter: adapter.IAdapter): Record | null {
   const Record = resolve<any>('Types/entity:Record');
   return Record.fromObject(data, adapter);
}

/**
 * Builds RecordSet from array of plain objects
 * @param data RecordSet data as JSON
 * @param adapter
 * @param idProperty
 */
function buildRecordSet(data: any, adapter: adapter.IAdapter, idProperty: string): RecordSet | null {
   if (data === null) {
      return data;
   }
   if (data && DataMixin.isListInstance(data)) {
      return data;
   }

   const RecordSet = resolve<any>('Types/collection:RecordSet');
   const records = new RecordSet({
      adapter,
      idProperty
   });
   const count = data.length || 0;

   for (let i = 0; i < count; i++) {
      records.add(buildRecord(data[i], adapter));
   }

   return records;
}

/**
 * Returns sorting parameters
 */
function getSortingParams(query: Query): string[] | null {
   if (!query) {
      return null;
   }
   const orders = query.getOrderBy();
   if (orders.length === 0) {
      return null;
   }

   const sort = [];
   let order;
   for (let i = 0; i < orders.length; i++) {
      order = orders[i];
      sort.push({
         n: order.getSelector(),
         o: order.getOrder(),
         l: !order.getOrder()
      });
   }
   return sort;
}

/**
 * Returns navigation parameters
 */
function getNavigationParams(query: Query, options: IOptionsOption, adapter: adapter.IAdapter): object | null {
   if (!query) {
      return null;
   }

   const offset = query.getOffset();
   const limit = query.getLimit();
   const meta = query.getMeta();
   const moreProp = options.hasMoreProperty;
   const hasMoreProp = meta.hasOwnProperty(moreProp);
   const more = hasMoreProp ? meta[moreProp] : offset >= 0;
   const withoutOffset = offset === 0;
   const withoutLimit = limit === undefined || limit === null;

   if (hasMoreProp) {
      delete meta[moreProp];
      query.meta(meta);
   }

   let params = null;
   switch (options.navigationType) {
      case NAVIGATION_TYPE.PAGE:
         if (!withoutOffset || !withoutLimit) {
            params = {
               Страница: limit > 0 ? Math.floor(offset / limit) : 0,
               РазмерСтраницы: limit,
               ЕстьЕще: more
            };
         }
         break;

      case NAVIGATION_TYPE.POSITION:
         if (!withoutLimit) {
            const where = query.getWhere();
            const pattern = /(.+)([<>]=?|~)$/;
            let position = null;
            let order;

            Object.keys(where).forEach((expr) => {
               const parts = expr.match(pattern);

               // Check next if there's no operand
               if (!parts) {
                  return;
               }

               const value = where[expr];

               // Skip undefined values
               if (value !== undefined) {
                  const field = parts[1];
                  const operand = parts[2];

                  // Add field value to position if it's not null because nulls used only for defining an order.
                  if (value !== null) {
                     if (!position) {
                        position = {};
                     }
                     position[field] = value;
                  }

                  // We can use only one kind of order so take it from the first operand
                  if (!order) {
                     switch (operand) {
                        case '~':
                           order = PoitionNavigationOrder.both;
                           break;

                        case '<':
                        case '<=':
                           order = PoitionNavigationOrder.before;
                           break;
                     }
                  }
               }

               // Also delete property with operand in query (by link)
               delete where[expr];
            });

            params = {
               HaveMore: more,
               Limit: limit,
               Order: order || PoitionNavigationOrder.after,
               Position: buildRecord(position, adapter)
            };
         }
         break;

      default:
         if (!withoutOffset || !withoutLimit) {
            params = {
               Offset: offset || 0,
               Limit: limit,
               HaveMore: more
            };
         }
   }

   return params;
}

/**
 * Returns filtering parameters
 */
function getFilterParams(query: Query): object | null {
   let params = null;
   if (query) {
      params = query.getWhere();

      const meta = query.getMeta();
      if (meta) {
         switch (meta.expand) {
            case ExpandMode.None:
               params.Разворот = 'Без разворота';
               break;
            case ExpandMode.Nodes:
               params.Разворот = 'С разворотом';
               params.ВидДерева = 'Только узлы';
               break;
            case ExpandMode.Leaves:
               params.Разворот = 'С разворотом';
               params.ВидДерева = 'Только листья';
               break;
            case ExpandMode.All:
               params.Разворот = 'С разворотом';
               params.ВидДерева = 'Узлы и листья';
               break;
         }
      }
   }

   return params;
}

/**
 * Returns additional paramters
 */
function getAdditionalParams(query: Query): any[] {
   let meta: any = [];
   if (query) {
      meta = query.getMeta();
      if (meta && DataMixin.isModelInstance(meta)) {
         const obj = {};
         meta.each((key, value) => {
            obj[key] = value;
         });
         meta = obj;
      }
      if (meta instanceof Object) {
         const arr = [];
         for (const key in meta) {
            if (meta.hasOwnProperty(key)) {
               arr.push(meta[key]);
            }
         }
         meta = arr;
      }
      if (!(meta instanceof Array)) {
         throw new TypeError('Types/_source/SbisService::getAdditionalParams(): unsupported metadata type. ' +
           'Only Array, Types/_entity/Record or Object are allowed.');
      }
   }

   return meta;
}

/**
 * Returns data to send in create()
 */
function passCreate(meta?: any): object {
   if (!DataMixin.isModelInstance(meta)) {
      meta = {...meta || {}};
      if (!('ВызовИзБраузера' in meta)) {
         meta.ВызовИзБраузера = true;
      }
   }

   //TODO: вместо 'ИмяМетода' может передаваться 'Расширение'
   return {
      Фильтр: buildRecord(meta, this._$adapter),
      ИмяМетода: this._$binding.format || null
   };
}

/**
 * Returns data to send in read()
 */
function passRead(key: string | number, meta?: object): object {
   const args: any = {
      ИдО: key,
      ИмяМетода: this._$binding.format || null
   };
   if (meta && Object.keys(meta).length) {
      args.ДопПоля = meta;
   }
   return args;
}

/**
 * Returns data to send in update()
 */
function passUpdate(data: Record | RecordSet, meta?: object): object {
   // @ts-ignore
   const superArgs = Rpc.prototype._$passing.update.call(this, data, meta);
   const args: any = {};
   const recordArg = DataMixin.isListInstance(superArgs[0]) ? 'Записи' : 'Запись';

   args[recordArg] = superArgs[0];

   if (superArgs[1] && Object.keys(superArgs[1]).length) {
      args.ДопПоля = superArgs[1];
   }

   return args;
}

/**
 * Returns data to send in update() if updateBatch uses
 */
function passUpdateBatch(items: Record | RecordSet, meta?: object): object {
   const RecordSet = resolve<any>('Types/collection:RecordSet');
   const patch = RecordSet.patch(items);
   return {
      changed: patch.get('changed'),
      added: patch.get('added'),
      removed: patch.get('removed')
   };
}

/**
 * Returns data to send in destroy()
 */
function passDestroy(keys: string | string[], meta?: object): object {
   const args: any = {
      ИдО: keys
   };
   if (meta && Object.keys(meta).length) {
      args.ДопПоля = meta;
   }
   return args;
}

/**
 * Returns data to send in query()
 */
function passQuery(query: Query): object {
   const nav = getNavigationParams(query, this._$options, this._$adapter);
   const filter = getFilterParams(query);
   const sort = getSortingParams(query);
   const add = getAdditionalParams(query);

   return {
      Фильтр: buildRecord(filter, this._$adapter),
      Сортировка: buildRecordSet(sort, this._$adapter, this.getIdProperty()),
      Навигация: buildRecord(nav, this._$adapter),
      ДопПоля: add
   };
}

/**
 * Returns data to send in copy()
 */
function passCopy(key: string | number, meta?: object): object {
   const args: any = {
      ИдО: key,
      ИмяМетода: this._$binding.format
   };
   if (meta && Object.keys(meta).length) {
      args.ДопПоля = meta;
   }
   return args;
}

/**
 * Returns data to send in merge()
 */
function passMerge(from: string | number, to: string | number): object {
   return {
      ИдО: from,
      ИдОУд: to
   };
}

/**
 * Returns data to send in move()
 */
function passMove(from: string | number, to: string | number, meta?: IMoveMeta): object {
   return {
      IndexNumber: this._$orderProperty,
      HierarchyName: meta.parentProperty || null,
      ObjectName: meta.objectName,
      ObjectId: from,
      DestinationId: to,
      Order: meta.position,
      ReadMethod: meta.objectName + '.' + this._$binding.read,
      UpdateMethod: meta.objectName + '.' + this._$binding.update
   };
}

/**
 * Calls move method in old style
 * @param instance
 * @param from Record to move
 * @param to Record to move to
 * @param meta Meta data
 */
function oldMove(
   instance: SbisService | any,
   from: string | Array<string | number>,
   to: string, meta: IOldMoveMeta
): ExtendPromise<any> {
   logger.info(
      instance._moduleName,
      'Move elements through moveAfter and moveBefore methods have been deprecated, please use just move instead.'
   );

   const moveMethod = meta.before ? instance._$binding.moveBefore : instance._$binding.moveAfter;
   const params = {
      ПорядковыйНомер: instance._$orderProperty,
      Иерархия: meta.hierField || null,
      Объект: instance._$endpoint.moveContract,
      ИдО: createComplexId(from as string, instance._$endpoint.contract)
   };

   params[meta.before ? 'ИдОДо' : 'ИдОПосле'] = createComplexId(to, instance._$endpoint.contract);

   return instance._callProvider(
      instance._$endpoint.moveContract + '.' + moveMethod,
      params
   );
}

/**
 * Класс источника данных на сервисах бизнес-логики СБИС.
 * <br/>
 * <b>Пример 1</b>. Создадим источник данных для объекта БЛ:
 * <pre>
 *    import {SbisService} from 'Types/source';
 *    const dataSource = new SbisService({
 *       endpoint: 'Employee'
 *    });
 * </pre>
 * <b>Пример 2</b>. Создадим источник данных для объекта БЛ, используя отдельную точку входа:
 * <pre>
 *    import {SbisService} from 'Types/source';
 *    const dataSource = new SbisService({
 *       endpoint: {
 *          address: '/my-service/entry/point/',
 *          contract: 'Employee'
 *       }
 *    });
 * </pre>
 * <b>Пример 3</b>. Создадим источник данных для объекта БЛ с указанием своих методов для чтения записи и списка
 * записей, а также свой формат записи:
 * <pre>
 *    import {SbisService} from 'Types/source';
 *    const dataSource = new SbisService({
 *       endpoint: 'Employee',
 *       binding: {
 *          read: 'GetById',
 *          query: 'GetList',
 *          format: 'getListFormat'
 *       },
 *       idProperty: '@Employee'
 *    });
 * </pre>
 * <b>Пример 4</b>. Создадим новую статью:
 * <pre>
 *    import {SbisService} from 'Types/source';
 *    const dataSource = new SbisService({
 *       endpoint: 'Article',
 *       idProperty: 'Id'
 *    });
 *
 *    dataSource.create().addCallbacks((article) => {
 *       const id = article.getId();
 *    }, (error) => {
 *       console.error(error);
 *    });
 * </pre>
 * <b>Пример 5</b>. Прочитаем статью:
 * <pre>
 *    import {SbisService} from 'Types/source';
 *    const dataSource = new SbisService({
 *       endpoint: 'Article',
 *       idProperty: 'Id'
 *    });
 *
 *    dataSource.read('article-1').addCallbacks((article) => {
 *       const title = article.get('title');
 *    }, function(error) => {
 *       console.error(error);
 *    });
 * </pre>
 * <b>Пример 6</b>. Сохраним статью:
 * <pre>
 *    import {SbisService} from 'Types/source';
 *    import {Model, adapter} from 'Types/entity';
 *    const dataSource = new SbisService({
 *       endpoint: 'Article',
 *       idProperty: 'Id'
 *    });
 *    const article = new Model({
 *       adapter: new adapter.Sbis(),
 *       format: [
 *          {name: 'id', type: 'integer'},
 *          {name: 'title', type: 'string'}
 *       ],
 *       idProperty: 'id'
 *    });
 *
 *    article.set({
 *       id: 'article-1',
 *       title: 'Article 1'
 *    });
 *
 *    dataSource.update(article).addCallbacks(() => {
 *       console.log('Article updated!');
 *    }, (error) => {
 *       console.error(error);
 *    });
 * </pre>
 * <b>Пример 7</b>. Удалим статью:
 * <pre>
 *    import {SbisService} from 'Types/source';
 *    const dataSource = new SbisService({
 *       endpoint: 'Article',
 *       idProperty: 'Id'
 *    });
 *
 *    dataSource.destroy('article-1').addCallbacks(() => {
 *       console.log('Article deleted!');
 *    }, (error) => {
 *       console.error(error);
 *    });
 * </pre>
 * <b>Пример 8</b>. Прочитаем первые сто статей:
 * <pre>
 *    import {SbisService, Query} from 'Types/source';
 *    const dataSource = new SbisService({
 *       endpoint: 'Article'
 *    });
 *
 *    const query = new Query();
 *    query.limit(100);
 *
 *    dataSource.query(query).addCallbacks((response) => {
 *       const articles = response.getAll();
 *       console.log(`Articles count: ${articles.getCount()}`);
 *    }, (error) => {
 *       console.error(error);
 *    });
 * </pre>
 * @class Types/_source/SbisService
 * @extends Types/_source/Rpc
 * @public
 * @author Мальцев А.А.
 */
export default class SbisService extends Rpc /** @lends Types/_source/SbisService.prototype */{
   /**
    * @typedef {Object} Endpoint
    * @property {String} contract Контракт - определяет доступные операции
    * @property {String} [address] Адрес - указывает место расположения сервиса, к которому будет осуществлено
    * подключение
    * @property {String} [moveContract=ПорядковыйНомер] Название объекта бл в которому принадлежат методы перемещения
    */

   /** @typedef {Object} MoveMetaConfig
    * @property {Boolean} [before=false] Если true, то перемещаемая модель добавляется перед целевой моделью.
    */

   /**
    * @typedef {String} NavigationType
    * @variant Page По номеру страницы: передается номер страницы выборки и количество записей на странице.
    * @variant Offset По смещению: передается смещение от начала выборки и количество записей на странице.
    * @variant Position По курсору: передается позиция курсора, количество записей на странице и направление обхода
    * относительно курсора.
    */

   /**
    * @cfg {Endpoint|String} Конечная точка, обеспечивающая доступ клиента к функциональным возможностям источника
    * данных.
    * @name Types/_source/SbisService#endpoint
    * @remark
    * Можно успользовать сокращенную запись, передав значение в виде строки - в этом случае оно будет
    * интерпретироваться как контракт (endpoint.contract).
    * @see getEndPoint
    * @example
    * Подключаем объект БЛ 'Сотрудник', используя сокращенную запись:
    * <pre>
    *    import {SbisService} from 'Types/source';
    *    const dataSource = new SbisService({
    *       endpoint: 'Employee'
    *    });
    * </pre>
    * Подключаем объект БЛ 'Сотрудник', используя отдельную точку входа:
    * <pre>
    *    import {SbisService} from 'Types/source';
    *    const dataSource = new SbisService({
    *       endpoint: {
    *          address: '/my-service/entry/point/',
    *          contract: 'Employee'
    *       }
    *    });
    * </pre>
    */
   protected _$endpoint: IEndpoint;

   /**
    * @cfg {Object} Соответствие методов CRUD методам БЛ. Определяет, какой метод объекта БЛ соответствует каждому
    * методу CRUD.
    * @name Types/_source/SbisService#binding
    * @remark
    * По умолчанию используются стандартные методы.
    * Можно переопределить имя объекта БЛ, указанное в endpont.contract, прописав его имя через точку.
    * @see getBinding
    * @see create
    * @see read
    * @see destroy
    * @see query
    * @see copy
    * @see merge
    * @example
    * Зададим свои реализации для методов create, read и update:
    * <pre>
    *    import {SbisService} from 'Types/source';
    *    const dataSource = new SbisService({
    *       endpoint: 'Employee'
    *       binding: {
    *          create: 'new',
    *          read: 'get',
    *          update: 'save'
    *       }
    *    });
    * </pre>
    * Зададим реализацию для метода create на другом объекте БЛ:
    * <pre>
    *    import {SbisService} from 'Types/source';
    *    const dataSource = new SbisService({
    *       endpoint: 'Employee'
    *       binding: {
    *          create: 'Personnel.Create'
    *       }
    *    });
    * </pre>
    */
   protected _$binding: IBinding;

   protected _$passing: IRemotePassing;

   /**
    * @cfg {String|Function|Types/_entity/adapter/IAdapter} Адаптер для работы с данными. Для работы с БЛ всегда
    * используется адаптер {@link Types/_entity/adapter/Sbis}.
    * @name Types/_source/SbisService#adapter
    * @see getAdapter
    * @see Types/_entity/adapter/Sbis
    * @see Types/di
    */
   protected _$adapter: string;

   /**
    * @cfg {String|Function|Types/_source/provider/IAbstract} Объект, реализующий сетевой протокол для обмена в режиме
    * клиент-сервер, по умолчанию {@link Types/_source/provider/SbisBusinessLogic}.
    * @name Types/_source/SbisService#provider
    * @see Types/_source/Rpc#provider
    * @see getProvider
    * @see Types/di
    * @example
    * Используем провайдер нотификатора:
    * <pre>
    *    import {SbisService} from 'Types/source';
    *    import SbisPluginProvider from 'Plugin/DataSource/Provider/SbisPlugin';
    *    const dataSource = new SbisService({
    *       endpoint: 'Employee'
    *       provider: new SbisPluginProvider()
    *    });
    * </pre>
    */
   protected _$provider: string;

   /**
    * @cfg {String} Имя поля, по которому по умолчанию сортируются записи выборки. По умолчанию 'ПорНомер'.
    * @name Types/_source/SbisService#orderProperty
    * @see move
    */
   protected _$orderProperty: string;

   protected _$options: IOptionsOption;

   constructor(options?: IRemoteOptions) {
      super(options);

      if (!this._$endpoint.moveContract) {
         this._$endpoint.moveContract = 'IndexNumber';
      }
   }

   // region Public methods

   getOrderProperty(): string {
      return this._$orderProperty;
   }

   setOrderProperty(name: string): void {
      this._$orderProperty = name;
   }

   // endregion

   // region ICrud

   /**
    * Создает пустую модель через источник данных
    * @param {Object|Types/_entity/Record} [meta] Дополнительные мета данные, которые могут понадобиться для создания
    * модели.
    * @return {Core/Deferred} Асинхронный результат выполнения: в случае успеха вернет {@link Types/_entity/Model}, в
    * случае ошибки - Error.
    * @see Types/_source/ICrud#create
    * @example
    * Создадим нового сотрудника:
    * <pre>
    *    import {SbisService} from 'Types/source';
    *    const dataSource = new SbisService({
    *       endpoint: 'Employee',
    *       idProperty: '@Employee'
    *    });
    *    dataSource.create().addCallbacks((employee) => {
    *       console.log(employee.get('FirstName'));
    *    }, (error) => {
    *       console.error(error);
    *    });
    * </pre>
    * Создадим нового сотрудника по формату:
    * <pre>
    *    import {SbisService} from 'Types/source';
    *    const dataSource = new SbisService({
    *       endpoint: 'Employee',
    *       idProperty: '@Employee',
    *       binding: {
    *          format: 'getListFormat'
    *       }
    *    });
    *    dataSource.create().addCallbacks(function(employee) {
    *       console.log(employee.get('FirstName'));
    *    }, function(error) {
    *       console.error(error);
    *    });
    * </pre>
    */
   create(meta?: object): ExtendPromise<Record> {
      meta = object.clonePlain(meta, true);
      return this._loadAdditionalDependencies((ready) => {
         this._connectAdditionalDependencies(
            super.create(meta),
            ready
         );
      });
   }

   update(data: Record | RecordSet, meta?: object): ExtendPromise<null> {
      if (this._$binding.updateBatch && DataMixin.isListInstance(data)) {
         return this._loadAdditionalDependencies((ready) => {
            this._connectAdditionalDependencies(
               this._callProvider(
                  this._$binding.updateBatch,
                  passUpdateBatch(data, meta)
               ).addCallback(
                  (key) => this._prepareUpdateResult(data, key)
               ),
               ready
            );
         });
      }

      return super.update(data, meta);
   }

   destroy(keys: any | any[], meta?: object): ExtendPromise<null> {
      if (!(keys instanceof Array)) {
         return callDestroyWithComplexId(
            this,
            [getKeyByComplexId(keys)],
            getNameByComplexId(keys, this._$endpoint.contract),
            meta
         );
      }

      // В ключе может содержаться ссылка на объект БЛ - сгруппируем ключи по соответствующим им объектам
      const groups = getGroupsByComplexIds(keys, this._$endpoint.contract);
      const pd = new ParallelDeferred();
      for (const name in groups) {
         if (groups.hasOwnProperty(name)) {
            pd.push(callDestroyWithComplexId(
               this,
               groups[name],
               name,
               meta
            ));
         }
      }
      return pd.done().getResult();
   }

   query(query: Query): ExtendPromise<DataSet> {
      query = object.clonePlain(query, true);
      return this._loadAdditionalDependencies((ready) => {
         this._connectAdditionalDependencies(
            super.query(query),
            ready
         );
      });
   }

   // endregion

   // region ICrudPlus

   move(items: Array<string | number>, target: string | number, meta?: IMoveMeta): ExtendPromise<any> {
      meta = meta || {};
      if (this._$binding.moveBefore) {
         // TODO: поддерживаем старый способ с двумя методами
         return oldMove(this, items, target as string, meta as IOldMoveMeta);
      }

      // На БЛ не могут принять массив сложных идентификаторов,
      // поэтому надо сгуппировать идентификаторы по объекту и для каждой группы позвать метод
      const groups = getGroupsByComplexIds(items, this._$endpoint.contract);
      const groupsCount = Object.keys(groups).length;
      const pd = new ParallelDeferred();
      if (target !== null) {
         target = getKeyByComplexId(target);
      }

      for (const name in groups) {
         if (groups.hasOwnProperty(name)) {
            meta.objectName = name;
            const def = this._callProvider(
               this._$binding.move.indexOf('.') > -1 ?
                  this._$binding.move :
                  this._$endpoint.moveContract + '.' + this._$binding.move,
               this._$passing.move.call(this, groups[name], target, meta)
            );
            if (groupsCount === 1) {
               // TODO: нужно доработать ParallelDeferred что бы он возвращал оригинал ошибки:
               // https://online.sbis.ru/opendoc.html?guid=ecb592a4-bc06-463f-a3a0-90527f397ac2
               return def;
            }
            pd.push(def);
         }
      }

      return pd.done().getResult();
   }

   // endregion

   // region Remote

   getProvider(): IAbstract {
      if (!this._provider) {
         this._provider = this._createProvider(this._$provider, {
            endpoint: this._$endpoint,
            options: this._$options,

            // TODO: remove pass 'service' and 'resource'
            service: this._$endpoint.address,
            resource: this._$endpoint.contract
         });
      }

      return this._provider;
   }

   // endregion

   // region Statics

   static get NAVIGATION_TYPE(): any {
      return NAVIGATION_TYPE;
   }

   // endregion
}

// There are properties owned by the prototype
Object.assign(SbisService.prototype, /** @lends Types/_source/SbisService.prototype */ {
   '[Types/_source/SbisService]': true,
   _moduleName: 'Types/source:SbisService',

   _$binding: {
      /**
       * @cfg {String} Имя метода для создания записи через {@link create}.
       * @name Types/_source/SbisService#binding.create
       * @example
       * Зададим свою реализацию для метода create:
       * <pre>
       *    import {SbisService} from 'Types/source';
       *    const dataSource = new SbisService({
       *       endpoint: 'Employee',
       *       binding: {
       *          create: 'FastCreate'
       *       }
       *    });
       * </pre>
       * Зададим реализацию для метода create на другом объекте БЛ:
       * <pre>
       *    import {SbisService} from 'Types/source';
       *    const dataSource = new SbisService({
       *       endpoint: 'Employee',
       *       binding: {
       *          create: 'Personnel.Create'
       *       }
       *    });
       * </pre>
       */
      create: 'Создать',

      /**
       * @cfg {String} Имя метода для чтения записи через {@link read}.
       * @name Types/_source/SbisService#binding.read
       * @example
       * Зададим свою реализацию для метода read:
       * <pre>
       *    import {SbisService} from 'Types/source';
       *    const dataSource = new SbisService({
       *       endpoint: 'Employee',
       *       binding: {
       *          read: 'getById'
       *       }
       *    });
       * </pre>
       * Зададим реализацию для метода create на другом объекте БЛ:
       * <pre>
       *    import {SbisService} from 'Types/source';
       *    const dataSource = new SbisService({
       *       endpoint: 'Employee',
       *       binding: {
       *          read: 'Personnel.Read'
       *       }
       *    });
       * </pre>
       */
      read: 'Прочитать',

      /**
       * @cfg {String} Имя метода для обновления записи или рекордсета через {@link update}.
       * @name Types/_source/SbisService#binding.update
       * @example
       * Зададим свою реализацию для метода update:
       * <pre>
       *    import {SbisService} from 'Types/source';
       *    const dataSource = new SbisService({
       *       endpoint: 'Employee',
       *       binding: {
       *          update: 'FastSave'
       *       }
       *    });
       * </pre>
       * Зададим реализацию для метода update на другом объекте БЛ:
       * <pre>
       *    import {SbisService} from 'Types/source';
       *    const dataSource = new SbisService({
       *       endpoint: 'Employee',
       *       binding: {
       *          update: 'Personnel.Update'
       *       }
       *    });
       * </pre>
       */
      update: 'Записать',

      /**
       * @cfg {String} Имя метода для обновления рекордсета через метод {@link update} с передачей только измененных
       * записей.
       * @remark
       * Метод должен принимать следующий набор аргументов:
       * RecordSet changed,
       * RecordSet added,
       * Array<Sting|Number> removed
       * Где changed - измененные записи, added - добавленные записи, removed - ключи удаленных записей.
       * @name Types/_source/SbisService#binding.updateBatch
       */
      updateBatch: '',

      /**
       * @cfg {String} Имя метода для удаления записи через {@link destroy}.
       * @name Types/_source/SbisService#binding.destroy
       * @example
       * Зададим свою реализацию для метода destroy:
       * <pre>
       *    import {SbisService} from 'Types/source';
       *    const dataSource = new SbisService({
       *       endpoint: 'Employee',
       *       binding: {
       *          destroy: 'SafeDelete'
       *       }
       *    });
       * </pre>
       * Зададим реализацию для метода destroy на другом объекте БЛ:
       * <pre>
       *    import {SbisService} from 'Types/source';
       *    const dataSource = new SbisService({
       *       endpoint: 'Employee',
       *       binding: {
       *          destroy: 'Personnel.Delete'
       *       }
       *    });
       * </pre>
       */
      destroy: 'Удалить',

      /**
       * @cfg {String} Имя метода для получения списка записей через {@link query}.
       * @name Types/_source/SbisService#binding.query
       * @example
       * Зададим свою реализацию для метода query:
       * <pre>
       *    import {SbisService} from 'Types/source';
       *    const dataSource = new SbisService({
       *       endpoint: 'Employee',
       *       binding: {
       *          query: 'CustomizedList'
       *       }
       *    });
       * </pre>
       * Зададим реализацию для метода query на другом объекте БЛ:
       * <pre>
       *    import {SbisService} from 'Types/source';
       *    const dataSource = new SbisService({
       *       endpoint: 'Employee',
       *       binding: {
       *          query: 'Personnel.List'
       *       }
       *    });
       * </pre>
       */
      query: 'Список',

      /**
       * @cfg {String} Имя метода для копирования записей через {@link copy}.
       * @name Types/_source/SbisService#binding.copy
       */
      copy: 'Копировать',

      /**
       * @cfg {String} Имя метода для объединения записей через {@link merge}.
       * @name Types/_source/SbisService#binding.merge
       */
      merge: 'Объединить',

      /**
       * @cfg {String} Имя метода перемещения записи перед указанной через метод {@link move}.
       * @remark Метод перемещения, используемый по умолчанию - IndexNumber.Move, при изменении родителя вызовет методы
       * Прочитать(read) и Записать(Update)
       * они обязательно должны быть у объекта БЛ.
       * @name Types/_source/SbisService#binding.move
       */
      move: 'Move',

      /**
       * @cfg {String} Имя метода для получения формата записи через {@link create}, {@link read} и {@link copy}.
       * Метод должен быть декларативным.
       * @name Types/_source/SbisService#binding.format
       */
      format: ''
   },

   _$passing: {
      /**
       * @cfg {Function} Метод подготовки аргументов при вызове {@link create}.
       * @name Types/_source/BindingMixin#passing.create
       */
      create: passCreate,

      /**
       * @cfg {Function} Метод подготовки аргументов при вызове {@link read}.
       * @name Types/_source/BindingMixin#passing.read
       */
      read: passRead,

      /**
       * @cfg {Function} Метод подготовки аргументов при вызове {@link update}.
       * @name Types/_source/BindingMixin#passing.update
       */
      update: passUpdate,

      /**
       * @cfg {Function} Метод подготовки аргументов при вызове {@link destroy}.
       * @name Types/_source/BindingMixin#passing.destroy
       */
      destroy: passDestroy,

      /**
       * @cfg {Function} Метод подготовки аргументов при вызове {@link query}.
       * @name Types/_source/BindingMixin#passing.query
       */
      query: passQuery,

      /**
       * @cfg {Function} Метод подготовки аргументов при вызове {@link copy}.
       * @name Types/_source/BindingMixin#passing.copy
       */
      copy: passCopy,

      /**
       * @cfg {Function} Метод подготовки аргументов при вызове {@link merge}.
       * @name Types/_source/BindingMixin#passing.merge
       */
      merge: passMerge,

      /**
       * @cfg {Function} Метод подготовки аргументов при вызове {@link move}.
       * @name Types/_source/BindingMixin#passing.move
       */
      move: passMove
   },

   /**
    * @cfg {String|Function|Types/_entity/adapter/IAdapter} Адаптер для работы с данными. Для работы с БЛ всегда
    * используется адаптер {@link Types/_entity/adapter/Sbis}.
    * @name Types/_source/SbisService#adapter
    * @see getAdapter
    * @see Types/_entity/adapter/Sbis
    * @see Types/di
    */
   _$adapter: 'Types/entity:adapter.Sbis',

   /**
    * @cfg {String|Function|Types/_source/Provider/IAbstract} Объект, реализующий сетевой протокол для обмена в режиме
    * клиент-сервер, по умолчанию {@link Types/_source/Provider/SbisBusinessLogic}.
    * @name Types/_source/SbisService#provider
    * @see Types/_source/Rpc#provider
    * @see getProvider
    * @see Types/di
    * @example
    * Используем провайдер нотификатора:
    * <pre>
    *    import {SbisService} from 'Types/source';
    *    import SbisPluginProvider from 'Plugin/DataSource/Provider/SbisPlugin';
    *    const dataSource = new SbisService({
    *       endpoint: 'Employee',
    *       provider: new SbisPluginProvider()
    *    });
    * </pre>
    */
   _$provider: 'Types/source:provider.SbisBusinessLogic',

   /**
    * @cfg {String} Имя поля, по которому по умолчанию сортируются записи выборки. По умолчанию 'ПорНомер'.
    * @name Types/_source/SbisService#orderProperty
    * @see move
    */
   _$orderProperty: 'ПорНомер',

   _$options: OptionsMixin.addOptions<IOptionsOption>(Rpc, {
      /**
       * @cfg {String} Название свойства мета-данных {@link Types/_source/Query#meta запроса}, в котором хранится
       * значение поля HasMore аргумента Навигация, передаваемое в вызов {@link query}.
       * @name Types/_source/SbisService#options.hasMoreProperty
       */
      hasMoreProperty: 'hasMore'
   })
});

register('Types/source:SbisService', SbisService, {instantiate: false});
