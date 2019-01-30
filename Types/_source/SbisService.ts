/// <amd-module name="Types/_source/SbisService" />
/**
 * Класс источника данных на сервисах бизнес-логики СБИС.
 * <br/>
 * <b>Пример 1</b>. Создадим источник данных для объекта БЛ:
 * <pre>
 *    require(['Types/source'], function(source) {
 *       var dataSource = new source.SbisService({
 *          endpoint: 'СообщениеОтКлиента'
 *       });
 *    });
 * </pre>
 * <b>Пример 2</b>. Создадим источник данных для объекта БЛ, используя отдельную точку входа:
 * <pre>
 *    require(['Types/source'], function(source) {
 *       var dataSource = new source.SbisService({
 *          endpoint: {
 *             address: '/my-service/entry/point/',
 *             contract: 'СообщениеОтКлиента'
 *          }
 *       });
 *    });
 * </pre>
 * <b>Пример 3</b>. Создадим источник данных для объекта БЛ с указанием своих методов для чтения записи и списка записей, а также свой формат записи:
 * <pre>
 *    require(['Types/source'], function(source) {
 *       var dataSource = new source.SbisService({
 *          endpoint: 'СообщениеОтКлиента',
 *          binding: {
 *             read: 'Прочитать',
 *             query: 'СписокОбщий',
 *             format: 'Список'
 *          },
 *          idProperty: '@СообщениеОтКлиента'
 *       });
 *    });
 * </pre>
 * <b>Пример 4</b>. Создадим новую статью:
 * <pre>
 *    require(['Types/source'], function(source) {
 *       var dataSource = new source.SbisService({
 *          endpoint: 'Статья',
 *          idProperty: 'id'
 *       });
 *
 *       dataSource.create().addCallbacks(function(article) {
 *          var id = article.getId();
 *       }, function(error) {
 *          console.error(error);
 *       });
 *    });
 * </pre>
 * <b>Пример 5</b>. Прочитаем статью:
 * <pre>
 *    require(['Types/source'], function(source) {
 *       var dataSource = new source.SbisService({
 *          endpoint: 'Статья',
 *          idProperty: 'id'
 *       });
 *
 *       dataSource.read('article-1').addCallbacks(function(article) {
 *          var title = article.get('title');
 *       }, function(error) {
 *          console.error(error);
 *       });
 *    });
 * </pre>
 * <b>Пример 6</b>. Сохраним статью:
 * <pre>
 *    require(['Types/source', 'Types/entity'], function(source, entity) {
 *       var dataSource = new source.SbisService({
 *             endpoint: 'Статья',
 *             idProperty: 'id'
 *          }),
 *          article = new entity.Model({
 *             adapter: new entity.adapter.Sbis(),
 *             format: [
 *                {name: 'id', type: 'integer'},
 *                {name: 'title', type: 'string'}
 *             ],
 *             idProperty: 'id'
 *          });
 *
 *       article.set({
 *          id: 'article-1',
 *          title: 'Article 1'
 *       });
 *
 *       dataSource.update(article).addCallbacks(function() {
 *          console.log('Article updated!');
 *       }, function(error) {
 *          console.error(error);
 *       });
 *    });
 * </pre>
 * <b>Пример 7</b>. Удалим статью:
 * <pre>
 *    require(['Types/source'], function(source) {
 *       var dataSource = new source.SbisService({
 *          endpoint: 'Статья',
 *          idProperty: 'id'
 *       });
 *
 *       dataSource.destroy('article-1').addCallbacks(function() {
 *          console.log('Article deleted!');
 *       }, function(error) {
 *          console.error(error);
 *       });
 *    });
 * </pre>
 * <b>Пример 8</b>. Прочитаем первые сто статей:
 * <pre>
 *    require(['Types/source'], function(source) {
 *       var dataSource = new source.SbisService({
 *             endpoint: 'Статья'
 *          }),
 *          query = new source.Query();
 *
 *       query.limit(100);
 *       dataSource.query(query).addCallbacks(function(dataSet) {
 *          var articles = dataSet.getAll();
 *          console.log('Articles count: ' + articles.getCount());
 *       }, function(error) {
 *          console.error(error);
 *       });
 *    });
 * </pre>
 * @class Types/_source/SbisService
 * @extends Types/_source/Rpc
 * @public
 * @author Мальцев А.А.
 */

import Rpc, {IOptions as IRpcOptions, IPassing as IRpcPassing} from './Rpc';
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
// @ts-ignore
import ParallelDeferred = require('Core/ParallelDeferred');

/**
 * Типы навигации для query()
 */
const NAVIGATION_TYPE = Object.assign({
   POSITION: 'Position' //Add POSITION navigation type
}, Rpc.NAVIGATION_TYPE);

/**
 * Разделитель частей сложного идентификатора
 */
const COMPLEX_ID_SEPARATOR = ',';

/**
 * Детектор сложного идентификатора
 */
const COMPLEX_ID_MATCH = /^[0-9]+,[А-яA-z0-9]+$/;

export interface IBinding extends IDefaultBinding {
   updateBatch?: string
   moveBefore?: string
   moveAfter?: string
   format?: string
}

export interface IPassing extends IRpcPassing {
}

export interface IOptions extends IRpcOptions {
   hasMoreProperty?: string
}

export interface IMoveMeta {
   parentProperty?: string
   objectName?: string
   position?: string
}

/**
 * Returns key of the BL Object from its complex id
 */
function getKeyByComplexId(id: string): string {
   id = String(id || '');
   if (id.match(COMPLEX_ID_MATCH)) {
      return id.split(COMPLEX_ID_SEPARATOR)[0];
   }
   return id;
}

/**
 * Returns name of the BL Object from its complex id
 */
function getNameByComplexId(id: string, defaults: string): string {
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
function getGroupsByComplexIds(ids: string[], defaults: string): Object {
   let groups = {};
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
function callDestroyWithComplexId(instance: SbisService | any, ids: string[], name: string, meta: Object): ExtendPromise<any> {
   return instance._callProvider(
      instance._$endpoint.contract === name ? instance._$binding.destroy :  name + '.' + instance._$binding.destroy,
      instance._$passing.destroy.call(instance, ids, meta)
   );
}

/**
 * Builds Record from plain object
 * @param data Данные полей записи
 * @param adapter
 */
export function buildRecord(data: any, adapter: adapter.IAdapter): Record | null {
   const Record = resolve('Types/entity:Record');
   return Record.fromObject(data, adapter);
}

/**
 * Builds RecordSet from array of plain objects
 * @param data Данные рекордсета
 * @param adapter Адаптер
 * @param idProperty
 */
export function buildRecordSet(data: any, adapter: adapter.IAdapter, idProperty: string): RecordSet<Record> | null {
   if (data === null) {
      return data;
   }
   if (data && DataMixin.isListInstance(data)) {
      return data;
   }

   const RecordSet = resolve('Types/collection:RecordSet');
   let records = new RecordSet({
      adapter: adapter,
      idProperty: idProperty
   });
   let count = data.length || 0;

   for (let i = 0; i < count; i++) {
      records.add(buildRecord(data[i], adapter));
   }

   return records;
}

/**
 * Returns sorting params
 */
export function getSortingParams(query: Query): Array<string> | null {
   if (!query) {
      return null;
   }
   let orders = query.getOrderBy();
   if (orders.length === 0) {
      return null;
   }

   let sort = [];
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
export function getPagingParams(query: Query, options: IOptions, adapter: adapter.IAdapter): Object | null {
   if (!query) {
      return null;
   }

   let offset = query.getOffset();
   let limit = query.getLimit();
   let meta = query.getMeta();
   let moreProp = options.hasMoreProperty;
   let hasMoreProp = meta.hasOwnProperty(moreProp);
   let more = hasMoreProp ? meta[moreProp] : offset >= 0;
   let withoutOffset = offset === 0;
   let withoutLimit = limit === undefined || limit === null;

   if (hasMoreProp) {
      delete meta[moreProp];
      query.meta(meta);
   }

   let params = null;
   switch (options.navigationType) {
      case NAVIGATION_TYPE.PAGE:
         if (!withoutOffset || !withoutLimit) {
            params = {
               'Страница': limit > 0 ? Math.floor(offset / limit) : 0,
               'РазмерСтраницы': limit,
               'ЕстьЕще': more
            };
         }
         break;

      case NAVIGATION_TYPE.POSITION:
         if (!withoutLimit) {
            let where = query.getWhere();
            let pattern = /(.+)([<>]=|~)$/;
            let fields = null;
            let order = '';
            let parts;

            Object.keys(where).forEach((expr) => {
               parts = expr.match(pattern);
               if (parts) {
                  if (!fields) {
                     fields = {};
                  }
                  fields[parts[1]] = where[expr];
                  if (!order) {
                     switch (parts[2]) {
                        case '~':
                           order = 'both';
                           break;
                        case '<=':
                           order = 'before';
                           break;
                     }
                  }

                  // delete in query by link
                  delete where[expr];
               }
            });
            order = order || 'after';

            params = {
               HaveMore: more,
               Limit: limit,
               Order: order,
               Position: buildRecord(fields, adapter)
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
 * Returns filtration parameters
 */
function getFilterParams(query: Query): Object | null {
   let params = null;
   if (query) {
      params = query.getWhere();

      let meta = query.getMeta();
      if (meta) {
         switch (meta.expand) {
            case ExpandMode.None:
               params['Разворот'] = 'Без разворота';
               break;
            case ExpandMode.Nodes:
               params['Разворот'] = 'С разворотом';
               params['ВидДерева'] = 'Только узлы';
               break;
            case ExpandMode.Leaves:
               params['Разворот'] = 'С разворотом';
               params['ВидДерева'] = 'Только листья';
               break;
            case ExpandMode.All:
               params['Разворот'] = 'С разворотом';
               params['ВидДерева'] = 'Узлы и листья';
               break;
         }
      }
   }

   return params;
}

/**
 * Returns additional paramters
 * @return {Array}
 */
export function getAdditionalParams(query: Query): Array<any> {
   let meta: any = [];
   if (query) {
      meta = query.getMeta();
      if (meta && DataMixin.isModelInstance(meta)) {
         let obj = {};
         meta.each((key, value) => {
            obj[key] = value;
         });
         meta = obj;
      }
      if (meta instanceof Object) {
         let arr = [];
         for (let key in meta) {
            if (meta.hasOwnProperty(key)) {
               arr.push(meta[key]);
            }
         }
         meta = arr;
      }
      if (!(meta instanceof Array)) {
         throw new TypeError('Types/_source/SbisService::getAdditionalParams(): unsupported metadata type: only Array, Types/_entity/Record or Object allowed');
      }
   }

   return meta;
}

function passCreate(meta?: Object): Object {
   if (!DataMixin.isModelInstance(meta)) {
      meta = Object.assign({}, meta || {});
      if (!('ВызовИзБраузера' in meta)) {
         meta['ВызовИзБраузера'] = true;
      }
   }

   //TODO: вместо 'ИмяМетода' может передаваться 'Расширение'
   return {
      'Фильтр': buildRecord(meta, this._$adapter),
      'ИмяМетода': this._$binding.format || null
   };
}

function passRead(key: string | number, meta?: Object): Object {
   let args = {
      'ИдО': key,
      'ИмяМетода': this._$binding.format || null
   };
   if (meta && Object.keys(meta).length) {
      args['ДопПоля'] = meta;
   }
   return args;
}

function passUpdate(data: Record | RecordSet<Record>, meta?: Object): Object {
   let superArgs = Rpc.prototype['_$passing'].update.call(this, data, meta);
   let args = {};
   let recordArg = DataMixin.isListInstance(superArgs[0]) ? 'Записи' : 'Запись';

   args[recordArg] = superArgs[0];

   if (superArgs[1] && Object.keys(superArgs[1]).length) {
      args['ДопПоля'] = superArgs[1];
   }

   return args;
}

function passUpdateBatch(items: RecordSet<Record>, meta?: Object): Object {
   const RecordSet = resolve('Types/collection:RecordSet');
   let patch = RecordSet.patch(items);
   return {
      changed: patch.get('changed'),
      added: patch.get('added'),
      removed: patch.get('removed')
   };
}

function passDestroy(keys: string | string[], meta?: Object): Object {
   let args = {
      'ИдО': keys
   };
   if (meta && Object.keys(meta).length) {
      args['ДопПоля'] = meta;
   }
   return args;
}

function passQuery (query: Query): Object {
   let nav = getPagingParams(query, this._$options, this._$adapter);
   let filter = getFilterParams(query);
   let sort = getSortingParams(query);
   let add = getAdditionalParams(query);

   return {
      'Фильтр': buildRecord(filter, this._$adapter),
      'Сортировка': buildRecordSet(sort, this._$adapter, this.getIdProperty()),
      'Навигация': buildRecord(nav, this._$adapter),
      'ДопПоля': add
   };
}

function passCopy(key: string | number, meta?: Object): Object {
   let args = {
      'ИдО': key,
      'ИмяМетода': this._$binding.format
   };
   if (meta && Object.keys(meta).length) {
      args['ДопПоля'] = meta;
   }
   return args;
}

function passMerge(from: string | number, to: string | number): Object {
   return {
      'ИдО': from,
      'ИдОУд': to
   };
}

function passMove(from: string | number, to: string | number, meta?: IMoveMeta): Object {
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

interface IOldMoveMeta {
   before: string;
   hierField: string;
}

/**
 * Calls move method in old style
 * @param instance
 * @param from Record to move
 * @param to Record to move to
 * @param meta Meta data
 */
function oldMove(instance: SbisService | any, from: string, to: string, meta: IOldMoveMeta): ExtendPromise<any> {
   logger.info(instance._moduleName, 'Move elements through moveAfter and moveBefore methods have been deprecated, please use just move instead.');

   let moveMethod = meta.before ? instance._$binding.moveBefore : instance._$binding.moveAfter;
   let params = {
      'ПорядковыйНомер': instance._$orderProperty,
      'Иерархия': meta.hierField || null,
      'Объект': instance._$endpoint.moveContract,
      'ИдО': createComplexId(from, instance._$endpoint.contract)
   };

   params[meta.before ? 'ИдОДо' : 'ИдОПосле'] = createComplexId(to, instance._$endpoint.contract);

   return instance._callProvider(
      instance._$endpoint.moveContract + '.' + moveMethod,
      params
   );
}

export default class SbisService extends Rpc /** @lends Types/_source/SbisService.prototype */{
   /**
    * @typedef {Object} Endpoint
    * @property {String} contract Контракт - определяет доступные операции
    * @property {String} [address] Адрес - указывает место расположения сервиса, к которому будет осуществлено подключение
    * @property {String} [moveContract=ПорядковыйНомер] Название объекта бл в которому принадлежат методы перемещения
    */

   /** @typedef {Object} MoveMetaConfig
    * @property {Boolean} [before=false] Если true, то перемещаемая модель добавляется перед целевой моделью.
    */

   /**
    * @typedef {String} NavigationType
    * @variant Page По номеру страницы: передается номер страницы выборки и количество записей на странице.
    * @variant Offset По смещению: передается смещение от начала выборки и количество записей на странице.
    */
   //* @variant Position По курсору: передается набор значений ключевых полей начальной записи выборки, количество записей на странице и направление сортировки.

   /**
    * @cfg {Endpoint|String} Конечная точка, обеспечивающая доступ клиента к функциональным возможностям источника данных.
    * @name Types/_source/SbisService#endpoint
    * @remark
    * Можно успользовать сокращенную запись, передав значение в виде строки - в этом случае оно будет
    * интерпретироваться как контракт (endpoint.contract).
    * @see getEndPoint
    * @example
    * Подключаем объект БЛ 'Сотрудник', используя сокращенную запись:
    * <pre>
    *    require(['Types/source'], function(source) {
    *       var dataSource = new source.SbisService({
    *          endpoint: 'Сотрудник'
    *       });
    *    });
    * </pre>
    * Подключаем объект БЛ 'Сотрудник', используя отдельную точку входа:
    * <pre>
    *    require(['Types/source'], function(source) {
    *       var dataSource = new source.SbisService({
    *          endpoint: {
    *             address: '/my-service/entry/point/',
    *             contract: 'Сотрудник'
    *          }
    *       });
    *    });
    * </pre>
    */

   /**
    * @cfg {Object} Соответствие методов CRUD методам БЛ. Определяет, какой метод объекта БЛ соответствует каждому методу CRUD.
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
    *    require(['Types/source'], function(source) {
    *       var dataSource = new source.SbisService({
    *          endpoint: 'Сотрудник',
    *          binding: {
    *             create: 'МойМетодСоздать',
    *             read: 'МойМетодПрочитать',
    *             update: 'МойМетодЗаписать'
    *          }
    *       });
    *    });
    * </pre>
    * Зададим реализацию для метода create на другом объекте БЛ:
    * <pre>
    *    require(['Types/source'], function(source) {
    *       var dataSource = new source.SbisService({
    *          endpoint: 'Сотрудник',
    *          binding: {
    *             create: 'Персонал.Создать'
    *          }
    *       });
    *    });
    * </pre>
    */
   protected _$binding: IBinding;

   protected _$passing: IPassing;

   /**
    * @cfg {String|Function|Types/_entity/adapter/IAdapter} Адаптер для работы с данными. Для работы с БЛ всегда используется адаптер {@link Types/_entity/adapter/Sbis}.
    * @name Types/_source/SbisService#adapter
    * @see getAdapter
    * @see Types/_entity/adapter/Sbis
    * @see Types/di
    */
   protected _$adapter: string;

   /**
    * @cfg {String|Function|Types/_source/provider/IAbstract} Объект, реализующий сетевой протокол для обмена в режиме клиент-сервер, по умолчанию {@link Types/_source/provider/SbisBusinessLogic}.
    * @name Types/_source/SbisService#provider
    * @see Types/_source/Rpc#provider
    * @see getProvider
    * @see Types/di
    * @example
    * Используем провайдер нотификатора:
    * <pre>
    *    require(['Types/source', 'Plugin/DataSource/Provider/SbisPlugin'], function (source, SbisPluginProvider) {
    *       var dataSource = new source.SbisService({
    *          endpoint: 'Сотрудник',
    *          provider: new SbisPluginProvider()
    *       });
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

   protected _$options: IOptions;

   constructor(options?: Object) {
      super(options);

      if (!this._$endpoint.moveContract) {
         this._$endpoint.moveContract = 'IndexNumber';
      }
   }

   //region Public methods

   getOrderProperty() {
      return this._$orderProperty;
   }

   setOrderProperty(name) {
      this._$orderProperty = name;
   }

   //endregion Public methods

   //region ICrud

   /**
    * Создает пустую модель через источник данных
    * @param {Object|Types/_entity/Record} [meta] Дополнительные мета данные, которые могут понадобиться для создания модели
    * @return {Core/Deferred} Асинхронный результат выполнения: в случае успеха вернет {@link Types/_entity/Model}, в случае ошибки - Error.
    * @see Types/_source/ICrud#create
    * @example
    * Создадим нового сотрудника:
    * <pre>
    *    require(['Types/source'], function(source) {
    *        var dataSource = new source.SbisService({
    *           endpoint: 'Сотрудник',
    *           idProperty: '@Сотрудник'
    *        });
    *        dataSource.create().addCallbacks(function(employee) {
    *           console.log(employee.get('Имя'));
    *        }, function(error) {
    *           console.error(error);
    *        });
    *     });
    * </pre>
    * Создадим нового сотрудника по формату:
    * <pre>
    *    require(['Types/source'], function(source) {
    *        var dataSource = new source.SbisService({
    *           endpoint: 'Сотрудник',
    *           idProperty: '@Сотрудник',
    *           binding: {
    *              format: 'СписокДляПрочитать'
    *           }
    *        });
    *        dataSource.create().addCallbacks(function(employee) {
    *           console.log(employee.get('Имя'));
    *        }, function(error) {
    *           console.error(error);
    *        });
    *     });
    * </pre>
    */
   create(meta?: Object): ExtendPromise<Record> {
      meta = object.clonePlain(meta, true);
      return this._loadAdditionalDependencies((def) => {
         this._connectAdditionalDependencies(
            super.create(meta),
            def
         );
      });
   }

   update(data: Record | RecordSet<Record>, meta?: Object): ExtendPromise<null> {
      if (this._$binding.updateBatch && DataMixin.isListInstance(data)) {
         return this._loadAdditionalDependencies((def) => {
            this._connectAdditionalDependencies(
               this._callProvider(
                  this._$binding.updateBatch,
                  passUpdateBatch(data, meta)
               ).addCallback(
                  (key) => this._prepareUpdateResult(data, key)
               ),
               def
            );
         });
      }

      return super.update(data, meta);
   }

   destroy(keys: any | Array<any>, meta?: Object): ExtendPromise<null> {
      if (!(keys instanceof Array)) {
         return callDestroyWithComplexId(
            this,
            [getKeyByComplexId(keys)],
            getNameByComplexId(keys, this._$endpoint.contract),
            meta
         );
      }

      //В ключе может содержаться ссылка на объект БЛ - сгруппируем ключи по соответствующим им объектам
      let groups = getGroupsByComplexIds(keys, this._$endpoint.contract);
      let pd = new ParallelDeferred();
      for (let name in groups) {
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
      return this._loadAdditionalDependencies((def) => {
         this._connectAdditionalDependencies(
            super.query(query),
            def
         );
      });
   }

   //endregion ICrud

   //region ICrudPlus

   move(items: Array<string | number>, target: string | number, meta?: IMoveMeta): ExtendPromise<any> {
      meta = meta || {};
      if (this._$binding.moveBefore) {
         //TODO: поддерживаем старый способ с двумя методами
         return oldMove(this, items, target, meta);
      }

      //На БЛ не могут принять массив сложных идентификаторов,
      //поэтому надо сгуппировать идентификаторы по объекту и для каждой группы позвать метод
      let groups = getGroupsByComplexIds(items, this._$endpoint.contract);
      let groupsCount = Object.keys(groups).length;
      let pd = new ParallelDeferred();
      if (target !== null) {
         target = getKeyByComplexId(target);
      }

      for (let name in groups) {
         if (groups.hasOwnProperty(name)) {
            meta.objectName = name;
            let def = this._callProvider(
               this._$binding.move.indexOf('.') > -1 ?
                  this._$binding.move :
                  this._$endpoint.moveContract + '.' + this._$binding.move,
               this._$passing.move.call(this, groups[name], target, meta)
            );
            if (groupsCount === 1) {
               //TODO: нужно доработать ParallelDeferred что бы он возвращал оригинал ошибки
               //на это есть задача в 3.17.110 https://online.sbis.ru/opendoc.html?guid=ecb592a4-bc06-463f-a3a0-90527f397ac2&des=
               return def;
            }
            pd.push(def);
         }
      }

      return pd.done().getResult();
   }

   //endregion ICrudPlus

   //region Remote

   getProvider(): IAbstract {
      if (!this._provider) {
         this._provider = this._createProvider(this._$provider, {
            endpoint: this._$endpoint,
            options: this._$options,

            //TODO: remove pass 'service' and 'resource'
            service: this._$endpoint.address,
            resource: this._$endpoint.contract
         });
      }

      return this._provider;
   }

   //endregion Remote

   //region Statics

   static get NAVIGATION_TYPE() {
      return NAVIGATION_TYPE;
   }

   //endregion Statics
}

SbisService.prototype['[Types/_source/SbisService]'] = true;
SbisService.prototype._moduleName = 'Types/source:SbisService';

// @ts-ignore
SbisService.prototype._$binding = {
   /**
    * @cfg {String} Имя метода для создания записи через {@link create}.
    * @name Types/_source/SbisService#binding.create
    * @example
    * Зададим свою реализацию для метода create:
    * <pre>
    *    require(['Types/source'], function(source) {
    *       var dataSource = new source.SbisService({
    *          endpoint: 'Сотрудник',
    *          binding: {
    *             create: 'МойМетодСоздать'
    *          }
    *       });
    *    });
    * </pre>
    * Зададим реализацию для метода create на другом объекте БЛ:
    * <pre>
    *    require(['Types/source'], function(source) {
    *       var dataSource = new source.SbisService({
    *          endpoint: 'Сотрудник',
    *          binding: {
    *             create: 'Персонал.Создать'
    *          }
    *       });
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
    *    require(['Types/source'], function(source) {
    *       var dataSource = new source.SbisService({
    *          endpoint: 'Сотрудник',
    *          binding: {
    *             read: 'МойМетодПрочитать'
    *          }
    *       });
    *    });
    * </pre>
    * Зададим реализацию для метода create на другом объекте БЛ:
    * <pre>
    *    require(['Types/source'], function(source) {
    *       var dataSource = new source.SbisService({
    *          endpoint: 'Сотрудник',
    *          binding: {
    *             read: 'Персонал.Прочитать'
    *          }
    *       });
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
    *    require(['Types/source'], function(source) {
    *       var dataSource = new source.SbisService({
    *          endpoint: 'Сотрудник',
    *          binding: {
    *             update: 'МойМетодЗаписать'
    *          }
    *       });
    *    });
    * </pre>
    * Зададим реализацию для метода update на другом объекте БЛ:
    * <pre>
    *    require(['Types/source'], function(source) {
    *       var dataSource = new source.SbisService({
    *          endpoint: 'Сотрудник',
    *          binding: {
    *             update: 'Персонал.Записать'
    *          }
    *       });
    *    });
    * </pre>
    */
   update: 'Записать',

   /**
    * @cfg {String} Имя метода для обновления рекордсета через метод {@link update} с передачей только измененных записей.
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
    *    require(['Types/source'], function(source) {
    *       var dataSource = new source.SbisService({
    *          endpoint: 'Сотрудник',
    *          binding: {
    *             destroy: 'МойМетодУдалить'
    *          }
    *       });
    *    });
    * </pre>
    * Зададим реализацию для метода destroy на другом объекте БЛ:
    * <pre>
    *    require(['Types/source'], function(source) {
    *       var dataSource = new source.SbisService({
    *          endpoint: 'Сотрудник',
    *          binding: {
    *             destroy: 'Персонал.Удалить'
    *          }
    *       });
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
    *    require(['Types/source'], function(source) {
    *       var dataSource = new source.SbisService({
    *          endpoint: 'Сотрудник',
    *          binding: {
    *             query: 'МойСписок'
    *          }
    *       });
    *    });
    * </pre>
    * Зададим реализацию для метода query на другом объекте БЛ:
    * <pre>
    *    require(['Types/source'], function(source) {
    *       var dataSource = new source.SbisService({
    *          endpoint: 'Сотрудник',
    *          binding: {
    *             query: 'Персонал.Список'
    *          }
    *       });
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
    * @remark Метод перемещения, используемый по умолчанию - IndexNumber.Move, при изменении родителя вызовет методы Прочитать(read) и Записать(Update)
    * они обязательно должны быть у объекта БЛ.
    * @name Types/_source/SbisService#binding.move
    */
   move: 'Move',

   /**
    * @cfg {String} Имя метода для получения формата записи через {@link create}, {@link read} и {@link copy}. Метод должен быть декларативным.
    * @name Types/_source/SbisService#binding.format
    */
   format: ''
};

// @ts-ignore
SbisService.prototype._$passing = {
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
};

/**
 * @cfg {String|Function|Types/_entity/adapter/IAdapter} Адаптер для работы с данными. Для работы с БЛ всегда используется адаптер {@link Types/_entity/adapter/Sbis}.
 * @name Types/_source/SbisService#adapter
 * @see getAdapter
 * @see Types/_entity/adapter/Sbis
 * @see Types/di
 */
// @ts-ignore
SbisService.prototype._$adapter = 'Types/entity:adapter.Sbis';

/**
 * @cfg {String|Function|Types/_source/Provider/IAbstract} Объект, реализующий сетевой протокол для обмена в режиме клиент-сервер, по умолчанию {@link Types/_source/Provider/SbisBusinessLogic}.
 * @name Types/_source/SbisService#provider
 * @see Types/_source/Rpc#provider
 * @see getProvider
 * @see Types/di
 * @example
 * Используем провайдер нотификатора:
 * <pre>
 *    require(['Types/source', 'Plugin/DataSource/Provider/SbisPlugin'], function (source SbisPluginProvider) {
 *       var dataSource = new source.SbisService({
 *          endpoint: 'Сотрудник',
 *          provider: new SbisPluginProvider()
 *       });
 *    });
 * </pre>
 */
// @ts-ignore
SbisService.prototype._$provider = 'Types/source:provider.SbisBusinessLogic';

/**
 * @cfg {String} Имя поля, по которому по умолчанию сортируются записи выборки. По умолчанию 'ПорНомер'.
 * @name Types/_source/SbisService#orderProperty
 * @see move
 */
// @ts-ignore
SbisService.prototype._$orderProperty = 'ПорНомер';

// @ts-ignore
SbisService.prototype._$options = OptionsMixin.addOptions(Rpc, {
   /**
    * @cfg {String} Название свойства мета-данных {@link Types/_source/Query#meta запроса}, в котором хранится значение поля HasMore аргумента Навигация, передаваемое в вызов {@link query}.
    * @name Types/_source/SbisService#options.hasMoreProperty
    */
   hasMoreProperty: 'hasMore'
});

//Also add SBIS adapter to lazy loaded dependencies
SbisService.prototype._additionalDependencies = Rpc.prototype._additionalDependencies.slice();
//SbisService.prototype._additionalDependencies.push('Types/_entity/adapter/Sbis');

register('Types/source:SbisService', SbisService, {instantiate: false});
