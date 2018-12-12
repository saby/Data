/// <amd-module name="Types/_display/Collection" />
/**
 * Проекция коллекции - предоставляет методы навигации, фильтрации и сортировки, не меняя при этом оригинальную коллекцию.
 * @class Types/Display/Collection
 * @extends Types/Display/Abstract
 * @implements Types/Collection/IEnumerable
 * @implements Types/Collection/IList
 * @implements Types/Display/IBindCollection
 * @mixes Types/Entity/SerializableMixin
 * @mixes Types/Collection/EventRaisingMixin
 * @ignoreMethods notifyItemChange
 * @public
 * @author Мальцев А.А.
 */

import IBind from './IBind';
import Abstract, {IEnumerable} from './Abstract';
import CollectionEnumerator from './CollectionEnumerator';
import CollectionItem from './CollectionItem';
import GroupItem from './GroupItem';
import IItemsStrategy from './IItemsStrategy';
import ItemsStrategyComposer from './itemsStrategy/Composer';
import DirectItemsStrategy from './itemsStrategy/Direct';
import UserItemsStrategy from './itemsStrategy/User';
import GroupItemsStrategy from './itemsStrategy/Group';
import {DestroyableMixin, SerializableMixin, functor} from '../entity';
import {EnumeratorCallback, IList, EventRaisingMixin,} from '../collection';
import di from '../di';
import {mixin, object} from '../util';
import {Set, Map} from '../shim';

const GLOBAL = (0, eval)('this');
const LOGGER = GLOBAL.console;
const MESSAGE_READ_ONLY = 'The Display is read only. You should modify the source collection instead.';


/**
 * Преобразует проекцию в массив из ее элементов
 * @param display Проекция.
 */
function toArray(display: Abstract): Array<CollectionItem> {
   let result = [];
   display.each((item) => {
      result.push(item);
   });
   return result;
}

/**
 * Нормализует массив обработчиков
 * @param {Function|Array.<Function>} handlers Обработчики
 * @return {Array.<Function>}
 */
function normalizeHandlers<T>(handlers: T | T[]): T[] {
   if (typeof handlers === 'function') {
      handlers = [handlers];
   }
   return handlers instanceof Array ? handlers.filter((item) => typeof item === 'function') : [];
}

/**
 * Обрабатывает событие об изменении коллекции
 * @param event Дескриптор события.
 * @param action Действие, приведшее к изменению.
 * @param newItems Новые элементы коллекции.
 * @param newItemsIndex Индекс, в котором появились новые элементы.
 * @param oldItems Удаленные элементы коллекции.
 * @param oldItemsIndex Индекс, в котором удалены элементы.
 */
function onCollectionChange(
   event: EventObject,
   action: string,
   newItems: Array<any>,
   newItemsIndex: number,
   oldItems: Array<any>,
   oldItemsIndex: number
) {
   let session;

   switch (action) {
      case IBind.ACTION_RESET:
         let projectionOldItems = toArray(this);
         let projectionNewItems;
         this._reBuild(true);
         projectionNewItems = toArray(this);
         this._notifyBeforeCollectionChange();
         this._notifyCollectionChange(
            action,
            projectionNewItems,
            0,
            projectionOldItems,
            0
         );
         this._notifyAfterCollectionChange();
         return;

      case IBind.ACTION_CHANGE:
         session = this._startUpdateSession();

         //FIXME: newItems.length - FIXME[OrderMatch]
         this._reGroup(newItemsIndex, newItems.length);
         this._reSort();
         this._reFilter();
         this._finishUpdateSession(session, false);
         this._notifyCollectionItemsChange(newItems, newItemsIndex, session);
         return;
   }

   session = this._startUpdateSession();

   switch (action) {
      case IBind.ACTION_ADD:
         this._addItems(newItemsIndex, newItems);

         //FIXME: newItems.length - FIXME[OrderMatch]
         this._reGroup(newItemsIndex, newItems.length);
         this._reSort();
         this._reFilter();
         break;

      case IBind.ACTION_REMOVE:
         //FIXME: oldItems.length - FIXME[OrderMatch]
         this._removeItems(oldItemsIndex, oldItems.length);
         this._reSort();
         if (this._isFiltered() && this._isFilteredByIndex()) {
            this._reFilter();
         }
         break;

      case IBind.ACTION_REPLACE:
         //FIXME: newItems - FIXME[OrderMatch]
         this._replaceItems(newItemsIndex, newItems);

         //FIXME: newItems.length - FIXME[OrderMatch]
         this._reGroup(newItemsIndex, newItems.length);
         this._reSort();
         this._reFilter();
         break;

      case IBind.ACTION_MOVE:
         //FIXME: newItems - FIXME[OrderMatch]
         this._moveItems(newItemsIndex, oldItemsIndex, newItems);
         this._reSort();
         this._reFilter();
         break;
   }

   this._finishUpdateSession(session);
}

/**
 * Обрабатывает событие об изменении элемента коллекции
 * @param event Дескриптор события.
 * @param item Измененный элемент коллекции.
 * @param index Индекс измененного элемента.
 * @param [properties] Изменившиеся свойства
 */
function onCollectionItemChange(
   event: EventObject,
   item: any,
   index: number,
   properties?: Object
) {
   if (!this.isEventRaising()) {
      return;
   }

   if (this._sourceCollectionSynchronized) {
      this._notifySourceCollectionItemChange(event, item, index, properties);
   } else {
      this._sourceCollectionDelayedCallbacks = this._sourceCollectionDelayedCallbacks || [];
      this._sourceCollectionDelayedCallbacks.push([this._notifySourceCollectionItemChange, arguments]);
   }
}

/**
 * Обрабатывает событие об изменении режима генерации событий
 * @param event Дескриптор события.
 * @param enabled Включена или выключена генерация событий
 * @param analyze Включен или выключен анализ изменений
 */
function onEventRaisingChange(event: EventObject, enabled: boolean, analyze: boolean) {
   //Если без выключили без анализа изменений, то при следующем включении генерации надо актуализировать состояние
   if (!analyze && enabled) {
      this._reBuild(true);
   }

   this._sourceCollectionSynchronized = enabled;

   //Call delayed handlers if get back to synchronize
   let callbacks = this._sourceCollectionDelayedCallbacks;
   if (this._sourceCollectionSynchronized && callbacks) {
      let callback;
      while (callbacks.length > 0) {
         callback = callbacks[0];
         callback[0].apply(this, callback[1]);
         callbacks.shift();
      }
   }
}

interface IOptions {
}

interface SplicedArray<T> extends Array<T> {
   start?: number;
}


export interface ICollection extends DestroyableMixin, IEnumerable<any>, IList<any> {
   each(callback: EnumeratorCallback<any>, context?: Object, localize?: boolean);
   subscribe(event: string, handler: Function, ctx?: Object);
   unsubscribe(event: string, handler: Function, ctx?: Object);
}

interface FilterFunction {
   (item: any, index: number, collectionItem: CollectionItem, collectionIndex: number): boolean;
}

interface GroupFunction {
   (item: any, index: number, collectionItem: CollectionItem): string | null;
}

interface SortItem {
   item: CollectionItem;
   index: number;
   collectionItem: any;
   collectionIndex: number;
}

export interface SortFunction {
   (a: SortItem, b: SortItem): Number;
}

export interface ItemsFactory {
   (item: any): CollectionItem;
}

interface Session {
}

interface SessionItems extends Array<CollectionItem> {
   properties?: Object
}

export interface SessionItemState {
   item: CollectionItem;
   selected: boolean;
}

export default class Collection extends mixin(
   Abstract, SerializableMixin, EventRaisingMixin
) implements IEnumerable<CollectionItem>, IList<CollectionItem> /** @lends Types/Display/Collection.prototype */{
   /**
    * @typedef {Object} UserSortItem
    * @property {Types/Display/CollectionItem} item Элемент проекции
    * @property {*} collectionItem Элемент коллекции
    * @property {Number} index Индекс элемента проекции
    * @property {Number} collectionIndex Индекс элемента коллекции
    */

   /**
    * @event onBeforeCollectionChange Перед началом изменений коллекции
    */

   /**
    * @event onAfterCollectionChange После окончания изменений коллекции
    */

   /**
    * @cfg {Types/Collection/IEnumerable} Оригинальная коллекция
    * @name Types/Display/Collection#collection
    * @see getCollection
    */
   protected _$collection: ICollection;

   /**
    * @cfg {Array.<Function(*, Number, Types/Display/CollectionItem, Number): Boolean>|Function(*, Number, Types/Display/CollectionItem, Number): Boolean} Пользовательские методы фильтрации элементов проекциию. Аргументы: элемент коллекции, позиция в коллекции, элемент проекции, позиция в проекции. Должен вернуть Boolean - признак, что элемент удовлетворяет условиям фильтрации.
    * @name Types/Display/Collection#filter
    * @example
    * Отберем персонажей женского пола:
    * <pre>
    *    require([
    *       'Types/Collection/List'
    *       'Types/Display/Collection'
    *    ], function(List, CollectionDisplay) {
    *       var list = new List({
    *             items: [
    *                {name: 'Philip J. Fry', gender: 'M'},
    *                {name: 'Turanga Leela', gender: 'F'},
    *                {name: 'Professor Farnsworth', gender: 'M'},
    *                {name: 'Amy Wong', gender: 'F'},
    *                {name: 'Bender Bending Rodriguez', gender: 'R'}
    *             ]
    *          }),
    *          display = new CollectionDisplay({
    *             collection: list,
    *             filter: function(collectionItem) {
    *                return collectionItem.gender === 'F';
    *             }
    *          });
    *
    *       display.each(function(item) {
    *          console.log(item.getContents().name);
    *       });
    *       //output: 'Turanga Leela', 'Amy Wong'
    *    });
    * </pre>
    * @see getFilter
    * @see setFilter
    * @see addFilter
    * @see removeFilter
    */
   protected _$filter: FilterFunction[];

   /**
    * @cfg {Function(*, Number, Types/Display/CollectionItem): String|null} Метод группировки элементов проекции. Аргументы: элемент коллекции, позиция в коллекции, элемент проекции. Должен вернуть идентификатор группы.
    * @name Types/Display/Collection#group
    * @example
    * Сгруппируем персонажей по полу:
    * <pre>
    *    require([
    *       'Types/Collection/List',
    *       'Types/Display/Collection',
    *       'Types/Display/GroupItem'
    *    ], function(List, CollectionDisplay, GroupItem) {
    *       var list = new List({
    *             items: [
    *                {name: 'Philip J. Fry', gender: 'M'},
    *                {name: 'Turanga Leela', gender: 'F'},
    *                {name: 'Professor Farnsworth', gender: 'M'},
    *                {name: 'Amy Wong', gender: 'F'},
    *                {name: 'Bender Bending Rodriguez', gender: 'R'}
    *             ]
    *          }),
    *          display = new CollectionDisplay({
    *             collection: list
    *             group: function(collectionItem, index, item) {
    *                return collectionItem.gender;
    *             }
    *          });
    *
    *       display.each(function(item, index) {
    *          if (item instanceof GroupItem) {
    *             console.log('[' + item.getContents() + ']';
    *          } else {
    *             console.log(item.getContents().name);
    *          }
    *       });
    *       //output: '[M]', 'Philip J. Fry', 'Professor Farnsworth', '[F]', 'Turanga Leela', 'Amy Wong', '[R]', 'Bender Bending Rodriguez'
    *    });
    * </pre>
    * @see getGroup
    * @see setGroup
    */
   protected _$group: GroupFunction;

   /**
    * @cfg {Array.<Function(UserSortItem, UserSortItem): Number>|Function(UserSortItem, UserSortItem): Number} Пользовательские методы сортировки элементов. Аргументы: 2 объекта типа {@link UserSortItem}, должен вернуть -1|0|1 (см. Array.prototype.sort())
    * @name Types/Display/Collection#sort
    * @example
    * Отсортируем коллекцию по возрастанию значения поля title:
    * <pre>
    *    require([
    *       'Types/Collection/List'
    *       'Types/Display/Collection'
    *    ], function(List, CollectionDisplay) {
    *       var display = new CollectionDisplay({
    *          collection: new List({
    *             items: [
    *                {id: 1, title: 'foo'},
    *                {id: 2, title: 'bar'}
    *             ]
    *          }),
    *          sort: function(a, b) {
    *             return a.collectionItem.title - b.collectionItem.title;
    *          }
    *       });
    *
    *       display.each(function(item) {
    *          console.log(item.getContents().title;
    *       });
    *       //output: 'bar', 'foo'
    *    });
    * </pre>
    * @see getSort
    * @see setSort
    * @see addSort
    * @see removeSort
    */
   protected _$sort: SortFunction[];

   /**
    * @cfg {String} Название свойства элемента коллекции, содержащего его уникальный идентификатор.
    * @name Types/Display/Collection#idProperty
    */
   protected _$idProperty: string;

   /**
    * @cfg {Boolean} Обеспечивать уникальность элементов (элементы с повторяющимися идентфикаторами будут игнорироваться). Работает только если задано {@link idProperty}.
    * @name Types/Display/Collection#unique
    */
   protected _$unique: boolean;

   /**
    * @cfg {Array.<String>} Названия свойств элемента коллекции, от которых зависят фильтрация, сортировка, группировка.
    * @name Types/Display/Collection#importantItemProperties
    * @remark
    * Изменение любого из указанных свойств элемента коллекции приведет к перерасчету фильтрации, сортировки и группировки.
    */
   protected _$importantItemProperties: string[];

   /**
    * Возвращать локализованные значения для типов, поддерживающих локализацию
    */
   protected _localize: boolean;

   /**
    * Тип элемента проекции
    */
   protected _itemModule: string | Function;

   /**
    * Фабрика элементов проекции
    */
   protected _itemsFactory: ItemsFactory;

   /**
    * Элемент -> уникальный идентификатор
    */
   protected _itemToUid: Map<CollectionItem, string> = new Map();

   /**
    * Уникальные идентификаторы элементов
    */
   protected _itemsUid: Set<string> = new Set();

   /**
    * Компоновщик стратегий
    */
   protected _composer: ItemsStrategyComposer;

   /**
    * Коллекция синхронизирована с проекцией (все события, приходящие от нее, соответсвуют ее состоянию)
    */
   protected _sourceCollectionSynchronized: boolean;

   /**
    * Обработчики событий коллекции, отложенные до момента синхронизации
    */
   protected _sourceCollectionDelayedCallbacks: Function[];

   /**
    * Результат применения фильтра: индекс элемента проекции -> прошел фильтр
    */
   protected _filterMap: boolean[] = [];

   /**
    * Результат применения сортировки: индекс после сортировки -> индекс элемента проекции
    */
   protected _sortMap: number[] = [];

   /**
    * Служебный энумератор для организации курсора
    */
   protected _cursorEnumerator: CollectionEnumerator;

   /**
    * Служебный энумератор для поиска по свойствам и поиска следующего или предыдущего элемента относительно заданного
    */
   protected _utilityEnumerator: CollectionEnumerator;

   /**
    * Обработчик события об изменении коллекции
    */
   protected _onCollectionChange: Function;

   /**
    * Обработчик события об изменении элемента коллекции
    */
   protected _onCollectionItemChange: Function;

   /**
    * Обработчик события об изменении генерации событий коллекции
    */
   protected _oEventRaisingChange: Function;

   /**
    * Возвращать локализованные значения
    */
   get localize(): boolean {
      return this._localize;
   }

   constructor(options: IOptions) {
      super(options);
      SerializableMixin.constructor.call(this);
      EventRaisingMixin.constructor.call(this, options);
      this._$filter = this._$filter || [];
      this._$sort = this._$sort || [];
      this._$importantItemProperties = this._$importantItemProperties || [];

      if (!this._$collection) {
         throw new Error(`${this._moduleName}: source collection is empty`);
      }
      if (this._$collection instanceof Array) {
         this._$collection = di.create('Types/collection:List', {items: this._$collection});
      }
      if (!this._$collection['[Types/_collection/IEnumerable]']) {
         throw new TypeError(`${this._moduleName}: source collection should implement Types/collection:IEnumerable`);
      }

      this._$sort = normalizeHandlers(this._$sort);
      this._$filter = normalizeHandlers(this._$filter);

      if (this._$idProperty) {
         this._setImportantProperty(this._$idProperty);
      }

      this._publish('onCurrentChange', 'onCollectionChange', 'onBeforeCollectionChange', 'onAfterCollectionChange');

      this._switchImportantPropertiesByUserSort(true);
      this._switchImportantPropertiesByGroup(true);

      this._reBuild();
      this._bindHandlers();
      if (this._$collection['[Types/_collection/IObservable]']) {
         this._$collection.subscribe('onCollectionChange', this._onCollectionChange);
         this._$collection.subscribe('onCollectionItemChange', this._onCollectionItemChange);
      }
      if (this._$collection['[Types/_entity/EventRaisingMixin]']) {
         this._$collection.subscribe('onEventRaisingChange', this._oEventRaisingChange);
      }
   }

   destroy() {
      if (!this._$collection.destroyed) {
         if (this._$collection['[Types/_collection/IObservable]']) {
            this._$collection.unsubscribe('onCollectionChange', this._onCollectionChange);
            this._$collection.unsubscribe('onCollectionItemChange', this._onCollectionItemChange);
         }
         if (this._$collection['[Types/_entity/EventRaisingMixin]']) {
            this._$collection.unsubscribe('onEventRaisingChange', this._oEventRaisingChange);
         }
      }

      this._unbindHandlers();
      this._composer = null;
      this._filterMap = [];
      this._sortMap = [];
      this._itemToUid = null;
      this._itemsUid = null;
      this._cursorEnumerator = null;
      this._utilityEnumerator = null;

      super.destroy();
   }

   //region mutable

   /**
    * Возвращает элемент проекции с указанным идентификатором экземпляра.
    * @param {String} instanceId Идентификатор экземпляра.
    * @return {Types/Display/CollectionItem}
    * @state mutable
    */
   getByInstanceId(instanceId: string): CollectionItem {
      return this.at(
         this._getUtilityEnumerator().getIndexByValue('instanceId', instanceId)
      );
   }

   /**
    * Возвращает индекс элемента проекции с указанным идентификатором экземпляра.
    * @param {String} instanceId Идентификатор экземпляра.
    * @return {Number}
    * @state mutable
    */
   getIndexByInstanceId(instanceId: string): number {
      return this._getUtilityEnumerator().getIndexByValue('instanceId', instanceId);
   }

   //endregion

   //region IEnumerable

   readonly '[Types/_collection/IEnumerable]': boolean = true;

   /**
    * Возвращает энумератор для перебора элементов проекции
    * @return {Types/Display/CollectionEnumerator}
    */
   getEnumerator(localize?: boolean): CollectionEnumerator {
      return this._getEnumerator();
   }

   /**
    * Перебирает все элементы проекции, начиная с первого.
    * @param {Function(Types/Display/CollectionItem, Number)} callback Ф-я обратного вызова для каждого элемента коллекции (аргументами придут элемент коллекции и его порядковый номер)
    * @param {Object} [context] Контекст вызова callback
    * @example
    * Сгруппируем персонажей по полу:
    * <pre>
    *    require([
    *       'Types/Collection/List',
    *       'Types/Display/Collection',
    *       'Types/Display/GroupItem'
    *    ], function(List, CollectionDisplay, GroupItem) {
    *       var list = new List({
    *             items: [
    *                {name: 'Philip J. Fry', gender: 'M'},
    *                {name: 'Turanga Leela', gender: 'F'},
    *                {name: 'Professor Farnsworth', gender: 'M'},
    *                {name: 'Amy Wong', gender: 'F'},
    *                {name: 'Bender Bending Rodriguez', gender: 'R'}
    *             ]
    *          }),
    *          display = new CollectionDisplay({
    *             collection: list
    *          });
    *
    *       display.setGroup(function(collectionItem, index, item) {
    *          return collectionItem.gender;
    *       });
    *
    *       display.each(function(item, index) {
    *          if (item instanceof GroupItem) {
    *             console.log('[' + item.getContents() + ']');
    *          } else {
    *             console.log(item.getContents().name);
    *          }
    *       });
    *       //output: '[M]', 'Philip J. Fry', 'Professor Farnsworth', '[F]', 'Turanga Leela', 'Amy Wong', '[R]', 'Bender Bending Rodriguez'
    *    });
    * </pre>
    */
   each(callback: EnumeratorCallback<CollectionItem>, context?: Object) {
      let enumerator = this.getEnumerator();
      let index;
      while (enumerator.moveNext()) {
         index = enumerator.getCurrentIndex();
         callback.call(
            context,
            enumerator.getCurrent(),
            index
         );
      }
   }

   //endregion

   //region IList

   readonly '[Types/_collection/IList]': boolean = true;

   assign() {
      throw new Error(MESSAGE_READ_ONLY);
   }

   append() {
      throw new Error(MESSAGE_READ_ONLY);
   }

   prepend() {
      throw new Error(MESSAGE_READ_ONLY);
   }

   clear() {
      throw new Error(MESSAGE_READ_ONLY);
   }

   add() {
      throw new Error(MESSAGE_READ_ONLY);
   }

   at(index) {
      return this._getUtilityEnumerator().at(index);
   }

   remove(): boolean {
      throw new Error(MESSAGE_READ_ONLY);
   }

   removeAt(): CollectionItem {
      throw new Error(MESSAGE_READ_ONLY);
   }

   replace() {
      throw new Error(MESSAGE_READ_ONLY);
   }

   move() {
      throw new Error(MESSAGE_READ_ONLY);
   }

   getIndex(item) {
      if (!(item instanceof CollectionItem)) {
         return -1;
      }
      return this.getIndexByInstanceId(item.getInstanceId());
   }

   /**
    * Возвращает количество элементов проекции.
    * @param {Boolean} [skipGroups=false] Не считать группы
    * @return {Number}
    */
   getCount(skipGroups?: boolean): number {
      let count = 0;
      if (skipGroups && this._isGrouped()) {
         this.each((item) => {
            if (!(item instanceof GroupItem)) {
               count++;
            }
         });
      } else {
         count = this._getUtilityEnumerator().getCount();
      }
      return count;
   }

   //endregion

   //region SerializableMixin

   protected _getSerializableState(state) {
      state = SerializableMixin.prototype._getSerializableState.call(this, state);

      state._composer = this._composer;

      return state;
   }

   protected _setSerializableState(state) {
      let fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
      return function() {
         fromSerializableMixin.call(this);

         this._composer = state._composer;

         if (this._composer) {
            //Restore link to _$sort in UserItemsStrategy instance
            let userStrategy = this._composer.getInstance(UserItemsStrategy);
            if (userStrategy) {
               userStrategy.handlers = this._$sort;
            }

            //Restore link to _$group in GroupItemsStrategy instance
            let groupStrategy = this._composer.getInstance(GroupItemsStrategy);
            if (groupStrategy) {
               groupStrategy.handler = this._$group;
            }

            //Restore items contents before the _$collection will be affected
            if (this._composer) {
               let restoreItemsContents = (items, owner) => {
                  items.forEach((item) => {
                     if (item._contentsIndex !== undefined) {
                        item._$owner = owner;//Link to _$owner is not restored yet, force it
                        item.getContents();//Force resolving item contents
                     }
                  });
               };

               try {
                  let itemsHolder = this._composer.getResult();
                  do {
                     if (itemsHolder._items) {
                        restoreItemsContents(itemsHolder._items, this);
                     }
                     itemsHolder = itemsHolder.source;
                  } while (itemsHolder);
               } catch (err) {
                  //eslint
                  if (typeof LOGGER !== undefined) {
                     LOGGER.error(err);// eslint-disable-line no-console
                  }
               }
            }
         }
      };
   }

   //endregion

   //region Public

   //region Access

   /**
    * Возвращает оригинальную коллекцию
    * @return {Types/Collection/IEnumerable}
    * @see collection
    */
   getCollection(): ICollection {
      return this._$collection;
   }

   /**
    * Возвращает число элементов оригинальной коллекции
    * @return {Number}
    * @see collection
    */
   getCollectionCount(): number {
      let collection = this.getCollection();
      if (collection['[Types/_collection/IList]']) {
         return collection.getCount();
      }

      let enumerator = collection.getEnumerator();
      let count = 0;
      enumerator.reset();
      while (enumerator.moveNext()) {
         count++;
      }
      return count;
   }

   /**
    * Возвращает элементы проекции (без учета сортировки, фильтрации и группировки)
    * @return {Array.<Types/Display/CollectionItem>}
    */
   getItems(): Array<CollectionItem> {
      return this._getItems().slice();
   }

   /**
    * Создает элемент проекции
    * @param {Object} options Значения опций
    * @return {Types/Display/CollectionItem}
    */
   createItem(options): CollectionItem {
      if (!this._itemsFactory) {
         this._itemsFactory = this._getItemsFactory().bind(this);
      }

      return this._itemsFactory(options);
   }

   /**
    * Возвращает псевдоуникальный идентификатор элемента коллекции, основанный на значении опции {@link Types/Display/CollectionItem#contents}.
    * @param {Types/Display/CollectionItem} item Элемент коллекции
    * @return {String|undefined}
    */
   getItemUid(item: CollectionItem): string {
      let itemToUid = this._itemToUid;
      if (itemToUid.has(item)) {
         return itemToUid.get(item);
      }

      let uid = this._exctractItemId(item);
      uid = this._searchItemUid(item, uid);

      itemToUid.set(item, uid);

      return uid;
   }

   /**
    * Рассчитывает идентификатор элемента коллекции.
    * @param {Types/Display/CollectionItem} item Элемент коллекции
    * @return {String}
    */
   protected _exctractItemId(item: CollectionItem): string {
      let contents = item.getContents();
      let uid;
      if (contents['[Types/_entity/Model]']) {
         uid = contents.getId();
      } else if (this._$idProperty) {
         uid = object.getPropertyValue(contents, this._$idProperty);
      } else {
         throw new Error('Option "idProperty" must be defined to extract item unique id.');
      }

      return String(uid);
   }

   /**
    * Рассчитывает уникальный идентификатор элемента коллекции.
    * @param {Types/Display/CollectionItem} item Элемент коллекции
    * @param {String} baseId Базовое значение
    * @return {String}
    */
   protected _searchItemUid(item: CollectionItem, baseId: string): string {
      let uid = baseId;
      let itemsUid = this._itemsUid;
      let count = 0;
      while (itemsUid.has(uid)) {
         uid = baseId.concat('-', String(++count));
      }
      itemsUid.add(uid);

      return uid;
   }

   //endregion Access

   //region Navigation

   /**
    * Возвращает текущий элемент
    * @return {Types/Display/CollectionItem}
    */
   getCurrent(): CollectionItem {
      return this._getCursorEnumerator().getCurrent();
   }

   /**
    * Устанавливает текущий элемент
    * @param {Types/Display/CollectionItem} item Новый текущий элемент
    * @param {Boolean} [silent=false] Не генерировать событие onCurrentChange
    */
   setCurrent(item: CollectionItem, silent?: boolean) {
      let oldCurrent = this.getCurrent();
      if (oldCurrent !== item) {
         let enumerator = this._getCursorEnumerator();
         let oldPosition = this.getCurrentPosition();
         enumerator.setCurrent(item);

         if (!silent) {
            this._notifyCurrentChange(
               this.getCurrent(),
               oldCurrent,
               enumerator.getPosition(),
               oldPosition
            );
         }
      }
   }

   /**
    * Возвращает позицию текущего элемента
    * @return {Number}
    */
   getCurrentPosition(): number {
      return this._getCursorEnumerator().getPosition();
   }

   /**
    * Устанавливает позицию текущего элемента
    * @param {Number} position Позиция текущего элемента. Значение -1 указывает, что текущий элемент не выбран.
    * @param {Boolean} [silent=false] Не генерировать событие onCurrentChange
    */
   setCurrentPosition(position: number, silent?: boolean) {
      let oldPosition = this.getCurrentPosition();
      if (position !== oldPosition) {
         let oldCurrent = this.getCurrent();
         this._getCursorEnumerator().setPosition(position);
         if (!silent) {
            this._notifyCurrentChange(
               this.getCurrent(),
               oldCurrent,
               position,
               oldPosition
            );
         }
      }
   }

   /**
    * Возвращает первый элемент
    * @return {Types/Display/CollectionItem}
    */
   getFirst(): CollectionItem {
      let enumerator = this._getUtilityEnumerator();
      enumerator.setPosition(0);

      let item = enumerator.getCurrent();

      if (item instanceof GroupItem) {
         return this._getNearbyItem(
            enumerator,
            item,
            true,
            true
         );
      }

      return item;
   }

   /**
    * Возвращает последний элемент
    * @return {Types/Display/CollectionItem}
    */
   getLast(): CollectionItem {
      let enumerator = this._getUtilityEnumerator();
      let lastIndex = enumerator.getCount() - 1;

      enumerator.setPosition(lastIndex);
      let item = enumerator.getCurrent();

      if (item instanceof GroupItem) {
         return this._getNearbyItem(
            enumerator,
            undefined,
            false,
            true
         );
      }

      return item;
   }

   /**
    * Возвращает следующий элемент относительно item
    * @param {Types/Display/CollectionItem} item элемент проекции
    * @return {Types/Display/CollectionItem}
    */
   getNext(item: CollectionItem): CollectionItem {
      return this._getNearbyItem(
         this._getUtilityEnumerator(),
         item,
         true,
         true
      );
   }

   /**
    * Возвращает предыдущий элемент относительно item
    * @param {Types/Display/CollectionItem} index элемент проекции
    * @return {Types/Display/CollectionItem}
    */
   getPrevious(item: CollectionItem): CollectionItem {
      return this._getNearbyItem(
         this._getUtilityEnumerator(),
         item,
         false,
         true
      );
   }

   /**
    * Устанавливает текущим следующий элемент
    * @return {Boolean} Есть ли следующий элемент
    */
   moveToNext(): boolean {
      let oldCurrent = this.getCurrent();
      let oldCurrentPosition = this.getCurrentPosition();
      let hasNext = this._getCursorEnumerator().moveNext();
      if (hasNext) {
         this._notifyCurrentChange(
            this.getCurrent(),
            oldCurrent,
            this.getCurrentPosition(),
            oldCurrentPosition
         );
      }
      return hasNext;
   }

   /**
    * Устанавливает текущим предыдущий элемент
    * @return {Boolean} Есть ли предыдущий элемент
    */
   moveToPrevious(): boolean {
      let oldCurrent = this.getCurrent();
      let oldCurrentPosition = this.getCurrentPosition();
      let hasPrevious = this._getCursorEnumerator().movePrevious();
      if (hasPrevious) {
         this._notifyCurrentChange(
            this.getCurrent(),
            oldCurrent,
            this.getCurrentPosition(),
            oldCurrentPosition
         );
      }
      return hasPrevious;
   }

   /**
    * Устанавливает текущим первый элемент
    * @return {Boolean} Есть ли первый элемент
    */
   moveToFirst(): boolean {
      if (this.getCurrentPosition() === 0) {
         return false;
      }
      this.setCurrentPosition(0);
      return this._getCursorEnumerator().getPosition() === 0;
   }

   /**
    * Устанавливает текущим последний элемент
    * @return {Boolean} Есть ли последний элемент
    */
   moveToLast(): boolean {
      let position = this.getCount() - 1;
      if (this.getCurrentPosition() === position) {
         return false;
      }
      this.setCurrentPosition(position);
      return this.getCurrentPosition() === position;
   }

   /**
    * Возвращает индекс элемента в коллекции по его индексу в проекции
    * @param {Number} index Индекс элемента в проекции
    * @return {Number} Индекс элемента в коллекции
    */
   getSourceIndexByIndex(index: number): number {
      let sourceIndex = this._getUtilityEnumerator().getSourceByInternal(index);
      sourceIndex = sourceIndex === undefined || sourceIndex === null ? -1 : sourceIndex;
      return this._getSourceIndex(sourceIndex);
   }

   /**
    * Возвращает индекс элемента проекции в коллекции
    * @param {Types/Display/CollectionItem} item Элемент проекции
    * @return {Number} Индекс элемента проекции в коллекции
    */
   getSourceIndexByItem(item: CollectionItem): number {
      let index = this.getIndex(item);
      return index === -1 ? -1 : this.getSourceIndexByIndex(index);
   }

   /**
    * Возвращает индекс элемента в проекции по индексу в коллекции
    * @param {Number} index Индекс элемента в коллекции
    * @return {Number} Индекс элемента в проекции
    */
   getIndexBySourceIndex(index: number): number {
      index = this._getItemIndex(index);
      let itemIndex = this._getUtilityEnumerator().getInternalBySource(index);

      return itemIndex === undefined || itemIndex === null ? -1 : itemIndex;
   }

   /**
    * Возвращает позицию элемента коллекции в проекции.
    * @param {*} item Элемент коллекции
    * @return {Number} Позиция элемента в проекции или -1, если не входит в проекцию
    */
   getIndexBySourceItem(item: any): number {
      let collection = this.getCollection();
      let sourceIndex = -1;

      if (collection && collection['[Types/_collection/IList]']) {
         sourceIndex = collection.getIndex(item);
      } else {
         let index = 0;
         collection.each((value) => {
            if (sourceIndex === -1 && value === item) {
               sourceIndex = index;
            }
            index++;
         }, this, this._localize);
      }
      return sourceIndex === -1 ? -1 : this.getIndexBySourceIndex(sourceIndex);
   }

   /**
    * Возвращает элемент проекции по индексу коллекции.
    * @param {Number} index Индекс элемента в коллекции
    * @return {Types/Display/CollectionItem} Элемент проекции или undefined, если index не входит в проекцию
    */
   getItemBySourceIndex(index: number): CollectionItem {
      index = this.getIndexBySourceIndex(index);
      return index === -1 ? undefined : this.at(index);
   }

   /**
    * Возвращает элемент проекции для элемента коллекции.
    * @param {*} item Элемент коллекции
    * @return {Types/Display/CollectionItem} Элемент проекции или undefined, если item не входит в проекцию
    */
   getItemBySourceItem(item: any): CollectionItem {
      let index = this.getIndexBySourceItem(item);
      return index === -1 ? undefined : this.at(index);
   }

   //endregion Navigation

   //region Changing

   /**
    * Возвращает пользовательские методы фильтрации элементов проекции
    * @return {Array.<Function(*, Number, Types/Display/CollectionItem, Number): Boolean>}
    * @see filter
    * @see setFilter
    * @see addFilter
    * @see removeFilter
    */
   getFilter(): FilterFunction[] {
      return this._$filter.slice();
   }

   /**
    * Устанавливает пользовательские методы фильтрации элементов проекции. Вызов метода без аргументов приведет к удалению всех пользовательских фильтров.
    * @param {...Function(*, Number, Types/Display/CollectionItem, Number): Boolean} [filter] Методы фильтрации элементов: аргументами приходят элемент коллекции, позиция в коллекции, элемент проекции, позиция в проекции. Должен вернуть Boolean - признак, что элемент удовлетворяет условиям фильтрации.
    * @see filter
    * @see getFilter
    * @see addFilter
    * @see removeFilter
    * @example
    * Отберем персонажей женского пола:
    * <pre>
    *    require([
    *       'Types/Collection/List'
    *       'Types/Display/Collection'
    *    ], function(List, CollectionDisplay) {
    *       var list = new List({
    *             items: [
    *                {name: 'Philip J. Fry', gender: 'M'},
    *                {name: 'Turanga Leela', gender: 'F'},
    *                {name: 'Professor Farnsworth', gender: 'M'},
    *                {name: 'Amy Wong', gender: 'F'},
    *                {name: 'Bender Bending Rodriguez', gender: 'R'}
    *             ]
    *          }),
    *          display = new CollectionDisplay({
    *             collection: list
    *          });
    *
    *       display.setFilter(function(collectionItem, index, item) {
    *          return collectionItem.gender === 'F';
    *       });
    *
    *       display.each(function(item) {
    *          console.log(item.getContents().name);
    *       });
    *       //output: 'Turanga Leela', 'Amy Wong'
    *    });
    * </pre>
    */
   setFilter(...args) {
      let filters;
      if (args[0] instanceof Array) {
         filters = args[0];
      } else {
         filters = args;
      }

      if (this._$filter.length === filters.length) {
         let changed = false;
         for (let i = 0; i < filters.length; i++) {
            if (this._$filter[i] !== filters[i]) {
               changed = true;
               break;
            }
         }

         if (!changed) {
            return;
         }
      }

      this._$filter = filters.filter((item) => typeof item === 'function');

      let session = this._startUpdateSession();
      this._reFilter();
      this._finishUpdateSession(session);
   }

   /**
    * Добавляет пользовательский метод фильтрации элементов проекции, если такой еще не был задан.
    * @param {Function(*, Number, Types/Display/CollectionItem, Number): Boolean} filter Метод фильтрации элементов: аргументами приходят элемент коллекции, позиция в коллекции, элемент проекции, позиция в проекции. Должен вернуть Boolean - признак, что элемент удовлетворяет условиям фильтрации.
    * @param {Number} [at] Порядковый номер метода (если не передан, добавляется в конец)
    * @see filter
    * @see getFilter
    * @see setFilter
    * @see removeFilter
    * @example
    * Отберем персонажей женского пола:
    * <pre>
    *    require([
    *       'Types/Collection/List'
    *       'Types/Display/Collection'
    *    ], function(List, CollectionDisplay) {
    *       var list = new List({
    *             items: [
    *                {name: 'Philip J. Fry', gender: 'M'},
    *                {name: 'Turanga Leela', gender: 'F'},
    *                {name: 'Professor Farnsworth', gender: 'M'},
    *                {name: 'Amy Wong', gender: 'F'},
    *                {name: 'Bender Bending Rodriguez', gender: 'R'}
    *             ]
    *          }),
    *          display = new CollectionDisplay({
    *             collection: list
    *          });
    *
    *       display.addFilter(function(collectionItem, index, item) {
    *          return collectionItem.gender === 'F';
    *       });
    *
    *       display.each(function(item) {
    *          console.log(item.getContents().name);
    *       });
    *       //output: 'Turanga Leela', 'Amy Wong'
    *    });
    * </pre>
    */
   addFilter(filter: FilterFunction, at?: number) {
      if (this._$filter.indexOf(filter) > -1) {
         return;
      }
      if (at === undefined) {
         this._$filter.push(filter);
      } else {
         this._$filter.splice(at, 0, filter);
      }

      let session = this._startUpdateSession();
      this._reFilter();
      this._finishUpdateSession(session);
   }

   /**
    * Удаляет пользовательский метод фильтрации элементов проекции.
    * @param {Function(*, Number, Types/Display/CollectionItem, Number): Boolean} filter Метод фильтрации элементов: аргументами приходят элемент коллекции, позиция в коллекции, элемент проекции, позиция в проекции. Должен вернуть Boolean - признак, что элемент удовлетворяет условиям фильтрации.
    * @return {Boolean} Был ли установлен такой метод фильтрации
    * @see filter
    * @see getFilter
    * @see setFilter
    * @see addFilter
    * @example
    * Уберем фильтрацию персонажей по полу:
    * <pre>
    *    require([
    *       'Types/Collection/List'
    *       'Types/Display/Collection'
    *    ], function(List, CollectionDisplay) {
    *       var filter = function(collectionItem, index, item) {
    *             return collectionItem.gender === 'F';
    *          }),
    *          list = new List({
    *             items: [
    *                {name: 'Philip J. Fry', gender: 'M'},
    *                {name: 'Turanga Leela', gender: 'F'},
    *                {name: 'Professor Farnsworth', gender: 'M'},
    *                {name: 'Amy Wong', gender: 'F'},
    *                {name: 'Bender Bending Rodriguez', gender: 'R'}
    *             ]
    *          }),
    *          display = new CollectionDisplay({
    *             collection: list,
    *             filter: filter
    *          });
    *
    *       display.each(function(item) {
    *          console.log(item.getContents().name);
    *       });
    *       //output: 'Turanga Leela', 'Amy Wong'
    *
    *       display.removeFilter(filter);
    *
    *       display.each(function(item) {
    *          console.log(item.getContents().name);
    *       });
    *       //output: 'Philip J. Fry', 'Turanga Leela', 'Professor Farnsworth', 'Amy Wong', 'Bender Bending Rodriguez'
    *    });
    * </pre>
    */
   removeFilter(filter: FilterFunction): boolean {
      let at = this._$filter.indexOf(filter);
      if (at === -1) {
         return false;
      }

      this._$filter.splice(at, 1);

      let session = this._startUpdateSession();
      this._reFilter();
      this._finishUpdateSession(session);

      return true;
   }

   /**
    * Возвращает метод группировки элементов проекции
    * @return {Function}
    * @see group
    * @see setGroup
    */
   getGroup(): GroupFunction {
      return this._$group;
   }

   /**
    * Устанавливает метод группировки элементов проекции. Для сброса ранее установленной группировки следует вызвать этот метод без параметров.
    * @param {Function(*, Number, Types/Display/CollectionItem): String|null} group Метод группировки элементов: аргументами приходят элемент коллекции, его позиция, элемент проекции. Должен вернуть String|Number - группу, в которую входит элемент.
    * @see group
    * @see getGroup
    */
   setGroup(group: GroupFunction) {
      if (this._$group === group) {
         return;
      }

      this._switchImportantPropertiesByGroup(false);
      if (!this._composer) {
         this._$group = group;
         this._switchImportantPropertiesByGroup(true);
         return;
      }

      let session = this._startUpdateSession();
      let groupStrategy = <GroupItemsStrategy> this._composer.getInstance(GroupItemsStrategy);

      this._$group = groupStrategy.handler = group;
      this._switchImportantPropertiesByGroup(true);
      this._getItemsStrategy().invalidate();
      this._reSort();
      this._reFilter();

      this._finishUpdateSession(session);
   }

   /**
    * Возвращает элементы группы. Учитывается сортировка и фильтрация.
    * @param {String} groupId Идентификатор группы, элементы которой требуется получить
    * @return {Array.<Types/Display/CollectionItem>}
    * @example
    * Получим персонажей мужского пола:
    * <pre>
    *    require([
    *       'Types/Collection/List'
    *       'Types/Display/Collection'
    *    ], function(List, CollectionDisplay) {
    *       var list = new List({
    *             items: [
    *                {name: 'Philip J. Fry', gender: 'M'},
    *                {name: 'Turanga Leela', gender: 'F'},
    *                {name: 'Professor Farnsworth', gender: 'M'},
    *                {name: 'Amy Wong', gender: 'F'},
    *                {name: 'Bender Bending Rodriguez', gender: 'R'}
    *             ]
    *          }),
    *          display = new CollectionDisplay({
    *             collection: list
    *          });
    *
    *       display.setGroup(function(collectionItem, index, item) {
    *          return collectionItem.gender;
    *       });
    *
    *       var males = display.getGroupItems('M'),
    *          male,
    *          i;
    *       for (i = 0; i < males.length; i++) {
    *          male = males[i].getContents();
    *          console.log(male.name);
    *       }
    *       //output: 'Philip J. Fry', 'Professor Farnsworth'
    *    });
    * </pre>
    */
   getGroupItems(groupId: string): Array<CollectionItem> {
      let items = [];
      let currentGroupId;
      this.each((item) => {
         if (item instanceof GroupItem) {
            currentGroupId = item.getContents();
            return;
         }
         if (currentGroupId === groupId) {
            items.push(item);
         }
      });
      return items;
   }

   /**
    * Возвращает идентификтор группы по индексу элемента в проекции
    * @param {Number} index Индекс элемента в проекции
    * @return {String|Number}
    * @example
    * Сгруппируем персонажей по полу:
    * <pre>
    *    require([
    *       'Types/Collection/List'
    *       'Types/Display/Collection'
    *    ], function(List, CollectionDisplay) {
    *       var list = new List({
    *             items: [
    *                {name: 'Philip J. Fry', gender: 'M'},
    *                {name: 'Turanga Leela', gender: 'F'},
    *                {name: 'Professor Farnsworth', gender: 'M'},
    *                {name: 'Amy Wong', gender: 'F'},
    *                {name: 'Bender Bending Rodriguez', gender: 'R'}
    *             ]
    *          }),
    *          display = new CollectionDisplay({
    *             collection: list
    *          });
    *
    *       display.setGroup(function(collectionItem, index, item) {
    *          return collectionItem.gender;
    *       });
    *
    *       var enumerator = display.getEnumerator(),
    *          index = 0,
    *          item,
    *          group,
    *          contents;
    *       while (enumerator.moveNext()) {
    *          item = enumerator.getCurrent();
    *          group = display.getGroupByIndex(index);
    *          contents = item.getContents();
    *          console.log(group + ': ' + contents.name);
    *          index++;
    *       }
    *       //output: 'M: Philip J. Fry', 'M: Professor Farnsworth', 'F: Turanga Leela', 'F: Amy Wong', 'R: Bender Bending Rodriguez'
    *    });
    * </pre>
    */
   getGroupByIndex(index: number): string | number {
      let items = this._getItems();
      let item;
      for (let position = index; position >= 0; position--) {
         item = items[position];
         if (item instanceof GroupItem) {
            return item.getContents();
         }
      }
   }

   /**
    * Возвращает пользовательские методы сортировки элементов проекции
    * @return {Array.<Function>}
    * @see sort
    * @see setSort
    * @see addSort
    */
   getSort(): SortFunction[] {
      return this._$sort.slice();
   }

   /**
    * Устанавливает пользовательские методы сортировки элементов проекции. Вызов метода без аргументов приведет к удалению всех пользовательских сортировок.
    * @param {...Function(UserSortItem, UserSortItem): Number} [sort] Методы сортировки элементов: аргументами приходят 2 объекта типа {@link UserSortItem}, должен вернуть -1|0|1 (см. Array.prototype.sort())
    * @see sort
    * @see getSort
    * @see addSort
    * @see removeSort
    * @example
    * Отсортируем коллекцию по возрастанию значения поля title:
    * <pre>
    *    require([
    *       'Types/Collection/List'
    *       'Types/Display/Collection'
    *    ], function(List, CollectionDisplay) {
    *       var display = new CollectionDisplay({
    *          collection: new List({
    *             items: [
    *                {id: 1, title: 'foo'},
    *                {id: 2, title: 'bar'}
    *             ]
    *          })
    *       });
    *
    *       display.setSort(function(a, b) {
    *          return a.collectionItem.title > b.collectionItem.title;
    *       });
    *
    *       display.each(function(item) {
    *          console.log(item.getContents().title;
    *       });
    *       //output: 'bar', 'foo'
    *    });
    * </pre>
    * Отсортируем коллекцию сначала по title, а потом - по id:
    * <pre>
    *    require([
    *       'Types/Collection/List'
    *       'Types/Display/Collection'
    *    ], function(List, CollectionDisplay) {
    *       var display = new CollectionDisplay({
    *          collection: new List({
    *             items: [
    *                {id: 4, title: 'foo'},
    *                {id: 3, title: 'bar'},
    *                {id: 2, title: 'foo'}
    *             ]
    *          })
    *       });
    *
    *       display.setSort(function(a, b) {
    *          return a.collectionItem.title > b.collectionItem.title;
    *       }, function(a, b) {
    *          return a.collectionItem.id - b.collectionItem.id;
    *       });
    *
    *       display.each(function(item) {
    *          console.log(item.getContents().id;
    *       });
    *       //output: 3, 2, 4
    *    });
    * </pre>
    */
   setSort(...args) {
      let session = this._startUpdateSession();
      let sorts = args[0] instanceof Array ? args[0] : args;

      if (this._$sort.length === sorts.length) {
         let changed = false;
         for (let i = 0; i < sorts.length; i++) {
            if (this._$sort[i] !== sorts[i]) {
               changed = true;
               break;
            }
         }

         if (!changed) {
            return;
         }
      }

      this._switchImportantPropertiesByUserSort(false);
      this._$sort.length = 0;
      this._$sort.push.apply(this._$sort, normalizeHandlers(sorts));
      this._switchImportantPropertiesByUserSort(true);

      this._getItemsStrategy().invalidate();

      this._reSort();
      if (this._isFiltered()) {
         this._reFilter();
      }

      this._finishUpdateSession(session);
   }

   /**
    * Добавляет пользовательский метод сортировки элементов проекции, если такой еще не был задан.
    * @param {Function(UserSortItem, UserSortItem): Number} [sort] Метод сортировки элементов: аргументами приходят 2 объекта типа {@link UserSortItem}, должен вернуть -1|0|1 (см. Array.prototype.sort())
    * @param {Number} [at] Порядковый номер метода (если не передан, добавляется в конец)
    * @see sort
    * @see getSort
    * @see setSort
    * @see removeSort
    * @example
    * Отсортируем коллекцию по возрастанию значения поля id
    * <pre>
    *    require([
    *       'Types/Collection/List'
    *       'Types/Display/Collection'
    *    ], function(List, CollectionDisplay) {
    *       var display = new CollectionDisplay({
    *          collection: new List({
    *             items: [
    *                {id: 1, title: 'foo'},
    *                {id: 2, title: 'bar'}
    *             ]
    *          })
    *       });
    *
    *       display.addSort(function(a, b) {
    *          return a.collectionItem.id - b.collectionItem.id
    *       });
    *    });
    * </pre>
    */
   addSort(sort: SortFunction, at?: number) {
      if (this._$sort.indexOf(sort) > -1) {
         return;
      }

      let session = this._startUpdateSession();

      this._switchImportantPropertiesByUserSort(false);
      if (at === undefined) {
         this._$sort.push(sort);
      } else {
         this._$sort.splice(at, 0, sort);
      }
      this._switchImportantPropertiesByUserSort(true);

      this._getItemsStrategy().invalidate();

      this._reSort();
      if (this._isFiltered()) {
         this._reFilter();
      }

      this._finishUpdateSession(session);
   }

   /**
    * Удаляет пользовательский метод сортировки элементов проекции.
    * @param {Function(UserSortItem, UserSortItem): Number} [sort] Метод сортировки элементов: аргументами приходят 2 объекта типа {@link UserSortItem}, должен вернуть -1|0|1 (см. Array.prototype.sort())
    * @return {Boolean} Был ли установлен такой метод сортировки
    * @see sort
    * @see getSort
    * @see setSort
    * @see addSort
    * @example
    * Отсортируем коллекцию по возрастанию значения поля id
    * <pre>
    *    require([
    *       'Types/Collection/List'
    *       'Types/Display/Collection'
    *    ], function(List, CollectionDisplay) {
    *       var handler = function(a, b) {
    *             return a.item.id - b.item.id
    *          },
    *          display = new CollectionDisplay({
    *             collection: new List({
    *                items: [
    *                   {id: 1, title: 'foo'},
    *                   {id: 2, title: 'bar'}
    *                ]
    *             }),
    *             sort: handler
    *          });
    *
    *       //...
    *       display.removeSort(handler);
    *    });
    * </pre>
    */
   removeSort(sort: SortFunction): boolean {
      let at = this._$sort.indexOf(sort);
      if (at === -1) {
         return false;
      }

      let session = this._startUpdateSession();

      this._switchImportantPropertiesByUserSort(false);
      this._$sort.splice(at, 1);
      this._switchImportantPropertiesByUserSort(true);

      this._getItemsStrategy().invalidate();
      this._reSort();
      if (this._isFiltered()) {
         this._reFilter();
      }

      this._finishUpdateSession(session);

      return true;
   }

   /**
    * Возвращает Название свойства элемента коллекции, содержащего его уникальный идентификатор.
    * @return {String}
    */
   getIdProperty(): string {
      return this._$idProperty;
   }

   /**
    * Возвращает признак обеспечивания уникальности элементов
    * @return {Boolean}
    */
   isUnique(): boolean {
      return this._$unique;
   }

   /**
    * Возвращает признак обеспечивания уникальности элементов
    * @param {Boolean} unique Обеспечивать уникальность элементов
    */
   setUnique(unique: boolean) {
      if (this._$unique === unique) {
         return;
      }

      let session = this._startUpdateSession();

      this._$unique = unique;
      (<DirectItemsStrategy>this._composer.getInstance(DirectItemsStrategy)).unique = unique;
      this._getItemsStrategy().invalidate();
      this._reSort();

      this._finishUpdateSession(session);
   }

   /**
    * Уведомляет подписчиков об изменении элемента коллекции
    * @param {Types/Display/CollectionItem} item Элемент проекции
    * @param {Object} [properties] Изменившиеся свойства
    */
   notifyItemChange(item: CollectionItem, properties?: Object) {
      let isFiltered = this._isFiltered();
      let isGrouped = this._isGrouped();
      
      if (isFiltered || isGrouped) {
         let session = this._startUpdateSession();
         if (isGrouped) {
            this._reGroup();
            this._reSort();
         }
         if (isFiltered) {
            this._reFilter();
         }
         this._finishUpdateSession(session);
      }

      if (!this.isEventRaising()) {
         return;
      }

      let index = this.getIndex(item);
      let items: SessionItems = [item];
      items.properties = properties;

      this._notifyBeforeCollectionChange();
      this._notifyCollectionChange(
         IBind.ACTION_CHANGE,
         items,
         index,
         items,
         index
      );
      this._notifyAfterCollectionChange();
   }

   //endregion

   //endregion

   //region EventRaisingMixin

   protected _analizeUpdateSession(session: Session) {
      if (session) {
         this._notifyBeforeCollectionChange();
      }

      EventRaisingMixin._analizeUpdateSession.call(this, session);

      if (session) {
         this._notifyAfterCollectionChange();
      }
   }

   protected _notifyCollectionChange(
      action: string,
      newItems: CollectionItem[],
      newItemsIndex: number,
      oldItems: CollectionItem[],
      oldItemsIndex: number,
      session?: Session
   ) {
      if (!this._isNeedNotifyCollectionChange()) {
         return;
      }
      if (
         !session ||
         action === IBind.ACTION_RESET ||
         !this._isGrouped()
      ) {
         this._notifyLater(
            'onCollectionChange',
            action,
            newItems,
            newItemsIndex,
            oldItems,
            oldItemsIndex
         );
         return;
      }

      //Split by groups and notify
      let notify = (start, finish) => {
         if (start < finish) {
            this._notifyLater(
               'onCollectionChange',
               action,
               newItems.slice(start, finish),
               newItems.length ? newItemsIndex + start : 0,
               oldItems.slice(start, finish),
               oldItems.length ? oldItemsIndex + start : 0
            );
         }
      };
      let isRemove = action === IBind.ACTION_REMOVE;
      let max = isRemove ? oldItems.length : newItems.length;
      let notifyIndex = 0;
      let item;

      for (let i = 0; i < max; i++) {
         item = isRemove ? oldItems[i] : newItems[i];
         if (item instanceof GroupItem) {
            notify(notifyIndex, i);
            notifyIndex = i;
         }
         if (i === max - 1) {
            notify(notifyIndex, i + 1);
         }
      }
   }

   //endregion

   //region Multiselectable

   /**
    * Возвращает массив выбранных элементов
    * @remark Метод возвращает выбранные элементы не зависимо от фильтра проекции.
    * @return {Array.<Types/Display/CollectionItem>}
    */
   getSelectedItems(): Array<CollectionItem> {
      let items = this._getItems();
      let result = [];
      for (let i = items.length - 1; i >= 0; i--) {
         if (items[i].isSelected()) {
            result.push(items[i]);
         }
      }
      return result;
   }

   /**
    * Устанавливает признак, что элемент выбран, переданным элементам.
    * @remark Метод зависит от фильтра проекции.
    * @param {Array} items Массив элементов коллекции
    * @param {Boolean} selected Элемент выбран.
    * @example
    * <pre>
    *     var list = new List({...}),
    *        display = new CollectionDisplay({
    *           collection: list
    *        });
    *    display.setSelectedItems([list.at(0), list.at(1)], true) //установит признак двум элементам;
    * </pre>
    */
   setSelectedItems(items: Array<any>, selected: boolean) {
      let sourceItems = [];
      for (let i = 0, count = items.length; i < count; i++) {
         sourceItems.push(
            this.getItemBySourceItem(items[i])
         );
      }
      this._setSelectedItems(sourceItems, selected);
   }

   /**
    * Устанавливает признак, что элемент выбран, всем элементам проекции.
    * @remark Метод устанавливает  признак всем элементам не зависимо от фильтра проекции.
    * @param {Boolean} selected Элемент выбран.
    * @return {Array}
    */
   setSelectedItemsAll(selected: boolean) {
      this._setSelectedItems(this._getItems(), selected);
   }

   /**
    * Инвертирует признак, что элемент выбран, у всех элементов проекции
    * @remark Метод инвертирует выделение у всех элементов не зависимо от фильтра проекции.
    */
   invertSelectedItemsAll() {
      let items = this._getItems();
      for (let i = items.length - 1; i >= 0; i--) {
         items[i].setSelected(!items[i].isSelected(), true);
      }
      this._notifyBeforeCollectionChange();
      this._notifyCollectionChange(
         IBind.ACTION_RESET,
         items,
         0,
         items,
         0
      );
      this._notifyAfterCollectionChange();
   }

   /**
    * Устанавливает признак, переданным, элементам проекции.
    * @param {Array} selecItems массив элементов проекции
    * @param {Boolean} selected Элемент выбран.
    */
   protected _setSelectedItems(selecItems: Array<CollectionItem>, selected: boolean) {
      let items = [];
      selected = !!selected;
      for (let i = selecItems.length - 1; i >= 0; i--) {
         if (selecItems[i].isSelected() !== selected) {
            selecItems[i].setSelected(selected, true);
            items.push(selecItems[i]);
         }
      }
      if (items.length > 0) {
         let index = this.getIndex(items[0]);
         this._notifyBeforeCollectionChange();
         this._notifyCollectionChange(
            IBind.ACTION_REPLACE,
            items,
            index,
            items,
            index
         );
         this._notifyAfterCollectionChange();
      }
   }

   //endregion

   //region Protected methods

   //region Access

   /**
    * Добавляет свойство в importantItemProperties, если его еще там нет
    * @param {String} name Название свойства
    * @protected
    */
   protected _setImportantProperty(name: string) {
      let index = this._$importantItemProperties.indexOf(name);
      if (index === -1) {
         this._$importantItemProperties.push(name);
      }
   }

   /**
    * Удаляет свойство из importantItemProperties, если оно там есть
    * @param {String} name Название свойства
    * @protected
    */
   protected _unsetImportantProperty(name: string) {
      let index = this._$importantItemProperties.indexOf(name);
      if (index !== -1) {
         this._$importantItemProperties.splice(index, 1);
      }
   }

   /**
    * Модифицирует список важных свойств по наличию функторов среди пользовательских сортировок
    * @param {Boolean} add Добавить или удалить свойства
    * @protected
    */
   protected _switchImportantPropertiesByUserSort(add: boolean) {// eslint-disable-line id-match
      for (let i = 0; i < this._$sort.length; i++) {
         Collection._functorToImportantProperties(this._$sort[i], this, add);
      }
   }

   /**
    * Модифицирует список важных свойств по функтору группировки
    * @param {Boolean} add Добавить или удалить свойства
    * @protected
    */
   protected _switchImportantPropertiesByGroup(add: boolean) {// eslint-disable-line id-match
      Collection._functorToImportantProperties(this._$group, this, add);
   }

   /**
    * Добавляет/удаляет свойства функтора в в/из список важных свойств.
    * @param func Функтор
    * @param instance Проекция
    * @param add Добавить или удалить свойства
    */
   protected static _functorToImportantProperties(func: Function, instance: Collection, add: boolean) {
      if (functor.Compute.isFunctor(func)) {
         let properties = (<any>func).properties;
         for (let i = 0; i < properties.length; i++) {
            if (add) {
               instance._setImportantProperty(properties[i]);
            } else {
               instance._unsetImportantProperty(properties[i]);
            }
         }
      }
   }

   /**
    * Настраивает контекст обработчиков
    * @protected
    */
   protected _bindHandlers() {
      this._onCollectionChange = onCollectionChange.bind(this);
      this._onCollectionItemChange = onCollectionItemChange.bind(this);
      this._oEventRaisingChange = onEventRaisingChange.bind(this);
   }

   protected _unbindHandlers() {
      this._onCollectionChange = null;
      this._onCollectionItemChange = null;
      this._oEventRaisingChange = null;
   }

   //endregion

   //region Navigation

   /**
    * Возвращает элементы проекции
    * @return {Array.<Types/Display/CollectionItem>}
    * @protected
    */
   protected _getItems(): Array<CollectionItem> {
      return this._getItemsStrategy().items;
   }

   /**
    * Возвращает функцию, создающую элементы проекции
    * @return {Function(Object):Types/Display/CollectionItem}
    * @protected
    */
   protected _getItemsFactory(): ItemsFactory {
      return function CollectionItemsFactory(options) {
         options.owner = this;
         return di.resolve(this._itemModule, options);
      };
   }

   /**
    * Возвращает cтратегию получения элементов проекции
    * @return {Types/Display/ItemsStrategy/Abstract}
    * @protected
    */
   protected _getItemsStrategy(): IItemsStrategy {
      if (!this._composer) {
         this._composer = this._createComposer();
      }

      return this._composer.getResult();
   }

   /**
    * Сбрасывает построенную cтратегию получения элементов проекции
    * @protected
    */
   protected _resetItemsStrategy() {
      this._composer = null;
   }

   /**
    * Создает компоновщик стратегий
    * @return {Types/Display/ItemsStrategy/Composer}
    * @protected
    */
   protected _createComposer(): ItemsStrategyComposer {
      let composer = new ItemsStrategyComposer();

      composer.append(DirectItemsStrategy, {
         display: this,
         localize: this._localize,
         idProperty: this._$idProperty,
         unique: this._$unique
      }).append(UserItemsStrategy, {
         handlers: this._$sort
      }).append(GroupItemsStrategy, {
         handler: this._$group
      });

      return composer;
   }

   /**
    * Возвращает энумератор
    * @param {Boolean} unlink Отвязать от состояния проекции
    * @return {Types/Display/CollectionEnumerator}
    * @protected
    */
   protected _getEnumerator(unlink?: boolean): CollectionEnumerator {
      return this._buildEnumerator(
         unlink ? this._getItems().slice() : this._getItems.bind(this),
         unlink ? this._filterMap.slice() : this._filterMap,
         unlink ? this._sortMap.slice() : this._sortMap
      );
   }

   /**
    * Конструирует энумератор по входным данным
    * @param {Array.<Types/Display/CollectionItem>} items Элементы проекции
    * @param {Array.<Boolean>} filterMap Фильтр: индекс в коллекции -> прошел фильтр
    * @param {Array.<Number>} sortMap Сортировка: индекс в проекции -> индекс в коллекции
    * @return {Types/Display/CollectionEnumerator}
    * @protected
    */
   protected _buildEnumerator(items: CollectionItem[], filterMap: boolean[], sortMap: number[]): CollectionEnumerator {
      return new CollectionEnumerator({
         items: items,
         filterMap: filterMap,
         sortMap: sortMap
      });
   }

   /**
    * Возвращает служебный энумератор для организации курсора
    * @return {Types/Display/CollectionEnumerator}
    * @protected
    */
   protected _getCursorEnumerator(): CollectionEnumerator {
      return this._cursorEnumerator || (this._cursorEnumerator = this._getEnumerator());
   }

   /**
    * Возвращает служебный энумератор для для поиска по свойствам и поиска следующего или предыдущего элемента относительно заданного
    * @return {Types/Display/CollectionEnumerator}
    * @protected
    */
   protected _getUtilityEnumerator(): CollectionEnumerator {
      return this._utilityEnumerator || (this._utilityEnumerator = this._getEnumerator());
   }

   /**
    * Возвращает соседний элемент проекции
    * @param {Types/Collection/IEnumerator} enumerator Энумератор элементов
    * @param {Types/Display/CollectionItem} item Элемент проекции относительно которого искать
    * @param {Boolean} isNext Следующий или предыдущий элемент
    * @param {Boolean} [skipGroups=false] Пропускать группы
    * @return {Types/Display/CollectionItem}
    * @protected
    */
   protected _getNearbyItem(
      enumerator: CollectionEnumerator,
      item: CollectionItem,
      isNext: boolean,
      skipGroups?: boolean
   ): CollectionItem {
      let method = isNext ? 'moveNext' : 'movePrevious';
      let nearbyItem;

      enumerator.setCurrent(item);
      while (enumerator[method]()) {
         nearbyItem = enumerator.getCurrent();
         if (skipGroups && nearbyItem instanceof GroupItem) {
            nearbyItem = undefined;
            continue;
         }
         break;
      }

      return nearbyItem;
   }

   /**
    * Возвращает индекс элемента проекции по индексу в коллекции
    * @param {Number} index Индекс в коллекции
    * @return {Number}
    * @protected
    */
   protected _getItemIndex(index: number): number {
      return this._getItemsStrategy().getDisplayIndex(index);
   }

   /**
    * Возвращает индекс в коллекци по индексу в проекции
    * @param {Number} index Индекс в проекции
    * @return {Number}
    * @protected
    */
   protected _getSourceIndex(index: number): number {
      return this._getItemsStrategy().getCollectionIndex(index);
   }

   //endregion

   //region Calculation

   /**
    * Перерасчитывает все данные заново
    * @param {Boolean} [reset=false] Сбросить все созданные элементы
    * @protected
    */
   protected _reBuild(reset?: boolean) {
      let itemsStrategy = this._getItemsStrategy();
      this._reIndex();

      if (reset) {
         itemsStrategy.reset();
      }

      this._reGroup();
      this._reSort();

      this._resetFilter(itemsStrategy.count);
      if (this._isFiltered()) {
         this._reFilter();
      }
   }

   /**
    * Производит фильтрацию и сортировку и анализ изменений для набора элементов проекции
    * @param {Number} [start=0] Начальный индекс (в коллекции)
    * @param {Number} [count] Кол-во элементов (по умолчанию - все)
    * @protected
    */
   protected _reAnalize(start?: number, count?: number) {
      start = start || 0;

      let itemsStrategy = this._getItemsStrategy();
      let session = this._startUpdateSession();

      let indexBefore = itemsStrategy.getDisplayIndex(start);
      itemsStrategy.invalidate();
      let indexAfter = itemsStrategy.getDisplayIndex(start);

      if (count === undefined) {
         count = itemsStrategy.count - indexAfter;
      }

      this._reGroup(start, count);
      this._reSort();

      // If element is moved or user filter uses element indices then re-filter whole collection
      if (indexBefore !== indexAfter || this._isFilteredByIndex()) {
         this._reFilter();
      } else {
         this._reFilter(indexAfter, count);
      }

      this._finishUpdateSession(session);
   }

   /**
    * Вызывает переиндексацию
    * @protected
    */
   protected _reIndex() {
      this._getCursorEnumerator().reIndex();
      this._getUtilityEnumerator().reIndex();
   }

   //endregion

   //region Changing

   /**
    * Сбрасывает фильтр: помечает все элементы как прошедшие фильтрацию
    * @protected
    */
   protected _resetFilter(count: number) {
      this._filterMap.length = 0;
      for (let index = 0; index < count; index++) {
         this._filterMap.push(true);
      }
      this._reIndex();
   }

   /**
    * Производит фильтрацию для набора элементов проекции
    * @param {Number} [start=0] Начальный индекс
    * @param {Number} [count] Кол-во элементов (по умолчанию - все)
    * @protected
    */
   protected _reFilter(start?: number, count?: number) {
      start = start || 0;
      count = count || this._getItemsStrategy().count - start;

      let filters = this._$filter;
      let filtersLength = filters.length;
      let items = this._getItems();
      let sortMap = this._sortMap;
      let sortMapLength = sortMap.length;
      let filterMap = this._filterMap;
      let processedIndices = new Set();
      let finish = start + count;
      let changed = false;
      let item;
      let position;
      let index;
      let prevGroup;
      let prevGroupIndex = -1;
      let prevGroupPosition = -1;
      let prevGroupHasMembers = false;
      let match;
      let isMatch = (item, index, position, hasMembers?: boolean) => {
         let result = true;
         let filter;
         for (let filterIndex = 0; filterIndex < filtersLength; filterIndex++) {
            filter = filters[filterIndex];
            result = filter(
               item.getContents(),
               index,
               item,
               position,
               hasMembers
            );
            if (!result) {
               break;
            }
         }
         return result;
      };
      let applyMatch = (match, index) => {
         let oldMatch = filterMap[index];
         if (match === oldMatch) {
            return false;
         }
         if (match) {
            filterMap[index] = match;
            return true;
         } else if (oldMatch !== undefined) {
            filterMap[index] = match;
            return true;
         }
         return false;
      };

      //Lookup every item in _sortMap order
      for (position = 0; position < sortMapLength; position++) {
         index = sortMap[position];

         //Check item index in range
         if (index === undefined || index < start || index >= finish) {
            continue;
         }

         processedIndices.add(index);
         item = items[index];
         match = true;
         if (item instanceof GroupItem) {
            //A new group begin, check match for previous
            if (prevGroup) {
               match = isMatch(prevGroup, prevGroupIndex, prevGroupPosition, prevGroupHasMembers);
               changed = applyMatch(match, prevGroupIndex) || changed;
            }

            //Remember current group as previous
            prevGroup = item;
            prevGroupIndex = index;
            prevGroupPosition = position;
            prevGroupHasMembers = false;
         } else {
            //Check item match
            match = isMatch(item, index, position);
            changed = applyMatch(match, index) || changed;
            if (match) {
               prevGroupHasMembers = true;
            }
         }
      }

      for (index = start; index < finish; index++) {
         if (!processedIndices.has(index)) {
            filterMap[index] = undefined;
         }
      }

      //Check last group match
      if (prevGroup) {
         match = isMatch(prevGroup, prevGroupIndex, prevGroupPosition, prevGroupHasMembers);
         changed = applyMatch(match, prevGroupIndex) || changed;
      }

      if (changed) {
         this._reIndex();
      }
   }

   /**
    * Производит сортировку элементов
    * @protected
    */
   protected _reSort() {
      this._sortMap.length = 0;
      let items = this._buildSortMap();
      this._sortMap.push(...items);

      this._reIndex();
   }

   /**
    * Производит построение sortMap
    * @return {Array.<Number>}
    * @protected
    */
   protected _buildSortMap(): number[] {
      return this._getItems().map((item, index) => index);
   }

   /**
    * Производит группировку для набора элементов проекции
    * @param {Number} [start=0] Начальный индекс (в коллекции)
    * @param {Number} [count] Кол-во элементов (по умолчанию - все)
    * @protected
    */
   protected _reGroup(start?: number, count?: number) {
      if (!this._composer) {
         return;
      }
      let groupStrategy = <GroupItemsStrategy> this._composer.getInstance(GroupItemsStrategy);
      groupStrategy.invalidate();
   }

   /**
    * Проверяет, что используется фильтрация
    * @return {Boolean}
    * @protected
    */
   protected _isFiltered(): boolean {
      return this._$filter.length > 0;
   }

   /**
    * Проверяет, что хотя бы в один из методов фильтрации использует аргумент index
    * @return {Boolean}
    * @protected
    */
   protected _isFilteredByIndex(): boolean {
      return this._$filter.some((filter) => this._isFilterUseIndex(filter));
   }

   /**
    * Проверяет, что метод фильтрации использует аргумент index
    * @param {Function} filter
    * @return {Boolean}
    * @protected
    */
   protected _isFilterUseIndex(filter: FilterFunction): boolean {
      return filter.length > 3;
   }

   /**
    * Проверяет, что используется группировка
    * @return {Boolean}
    * @protected
    */
   protected _isGrouped(): boolean {
      return !!this._$group;
   }

   /**
    * Дробавляет набор элементов коллекции в проекцию
    * @param {Number} start Начальный индекс (в коллекции)
    * @param {Array} items Элементы
    * @return {Number} Начальный индекс (в проекциии)
    * @protected
    */
   protected _addItems(start: number, items: any[]): number {
      let isFiltered = this._isFiltered();
      let strategy = this._getItemsStrategy();
      let innerIndex;
      let filterMap = [];
      let sortMap = [];
      let groupMap = [];

      strategy.splice(start, 0, items);
      innerIndex = strategy.getDisplayIndex(start);

      items.forEach((item, index) => {
         filterMap.push(!isFiltered);
         sortMap.push(innerIndex + index);
         groupMap.push(undefined);
      });

      this._filterMap.splice(innerIndex, 0, ...filterMap);
      this._sortMap.splice(innerIndex, 0, ...sortMap);

      return innerIndex;
   }

   /**
    * Удаляет набор элементов проекции
    * @param {Number} start Начальный индекс (в коллекции)
    * @param {Number} [count] Кол-во элементов (по умолчанию - все)
    * @return {Array.<Types/Display/CollectionItem>} Удаленные элементы
    * @protected
    */
   protected _removeItems(start: number, count?: number): CollectionItem[] {
      start = start || 0;

      let strategy = this._getItemsStrategy();
      let innerIndex;
      let result;

      count = count === undefined ? strategy.count - start : count;

      result = strategy.splice(start, count);
      innerIndex = result.start = strategy.getDisplayIndex(start);

      this._filterMap.splice(innerIndex, count);
      this._removeFromSortMap(innerIndex, count);

      return result;
   }

   /**
    * Заменяет набор элементов проекции
    * @param {Number} start Начальный индекс (в коллекции)
    * @param {Array} newItems Замененные элементы
    * @return {Array.<Types/Display/CollectionItem>} Замененные элементы
    * @protected
    */
   protected _replaceItems(start: number, newItems: any[]): SplicedArray<CollectionItem> {
      let strategy = this._getItemsStrategy();
      let result = <SplicedArray<CollectionItem>> strategy.splice(start, newItems.length, newItems);
      result.start = strategy.getDisplayIndex(start);

      return result;
   }

   /**
    * Перемещает набор элементов проекции
    * @param {Number} newIndex Старый индекс (в коллекции)
    * @param {Number} oldIndex Новый индекс (в коллекции)
    * @param {Array} items Перемещаемые элементы
    * @return {Array.<Types/Display/CollectionItem>} Перемещенные элементы
    * @protected
    */
   protected _moveItems(newIndex: number, oldIndex: number, items: any[]): CollectionItem[] {
      let length = items.length;
      let strategy = this._getItemsStrategy();
      let movedItems;

      movedItems = strategy.splice(oldIndex, length);
      strategy.splice(newIndex, 0, movedItems);
      movedItems.oldIndex = strategy.getDisplayIndex(oldIndex);

      return movedItems;
   }

   /**
    * Удаляет из индекса сортировки срез элементов
    * @param {Number} start Начальный индекс (в коллекци)
    * @param {Number} count Кол-во элементов
    * @return {Array.<Number>}
    * @protected
    */
   protected _removeFromSortMap(start: number, count: number): Object {
      start = start || 0;
      count = count || 0;
      let finish = start + count;
      let index;
      let sortIndex;
      let toRemove = [];
      let removed = {};

      //Collect indices to remove
      for (index = start; index < finish; index++) {
         sortIndex = this._sortMap.indexOf(index);
         if (sortIndex > -1) {
            toRemove.push(sortIndex);
            removed[sortIndex] = this._sortMap[sortIndex];
         }
      }

      //Remove collected indices from _sortMap
      toRemove.sort((a, b) => a - b);
      for (index = toRemove.length - 1; index >= 0; index--) {
         this._sortMap.splice(toRemove[index], 1);
      }

      //Shift _sortMap values by count from start index
      for (index = 0; index < this._sortMap.length; index++) {
         if (this._sortMap[index] >= start) {
            this._sortMap[index] -= count;
         }
      }

      this._reIndex();

      return removed;
   }

   /**
    * Возвращает набор контрольных свойств элемента проекции для анализа его состояния
    * @param {Types/Display/CollectionItem} item Элемент проекции
    * @return {Object}
    * @protected
    */
   protected _getItemState(item: CollectionItem): SessionItemState {
      return {
         item: item,
         selected: item.isSelected()
      };
   }

   /**
    * Возвращает состояния элементов
    * @param {Array.<Types/Display/CollectionItem>} items Элементы проекции
    * @return {Array.<Object>}
    * @protected
    */
   protected _getItemsState(items: CollectionItem[]): SessionItemState[] {
      return items.map(this._getItemState);
   }

   /**
    * Возвращает разницу между двумя состояниями элементов (результатами работы метода _getItemsState)
    * @param {Array.<Object>} before Состояния до изменений
    * @param {Array.<Object>} after Состояния после изменений
    * @return {Array.<CollectionItem>} Отличающиеся состояния
    * @protected
    */
   protected _getItemsDiff(before: SessionItemState[], after: SessionItemState[]): CollectionItem[] {
      return after.filter((itemNow, index) => {
         let itemThen = before[index];
         return Object.keys(itemNow).some((prop) => itemNow[prop] !== itemThen[prop]);
      }).map((element) => {
         return element.item;
      });
   }

   /**
    * Генерирует события об изменении элементов проекции при изменении их состояния
    * @param {Object} session Сессия изменений
    * @param {Array.<Types/Display/CollectionItem>} items Измененные элементы
    * @param {Array} state Состояние элементов до изменений
    * @param {Function} beforeCheck Функция обратного вызова перед проверкой изменений состояния
    * @protected
    */
   protected _checkItemsDiff(session: Session, items: CollectionItem[], state: any[], beforeCheck: Function) {
      let diff = state ? this._getItemsDiff(
         state,
         this._getItemsState(items)
      ) : [];

      if (beforeCheck) {
         beforeCheck(diff, items);
      }

      //Notify changes by the diff
      if (diff.length) {
         this._notifyBeforeCollectionChange();
         EventRaisingMixin._extractPacksByList(this, diff, (items, index) => {
            this._notifyCollectionChange(
               IBind.ACTION_CHANGE,
               items,
               index,
               items,
               index,
               session
            );
         });
         this._notifyAfterCollectionChange();
      }
   }

   /**
    * Генерирует событие об изменении текущего элемента проекции коллекции
    * @param {Types/Display/CollectionItem} newCurrent Новый текущий элемент
    * @param {Types/Display/CollectionItem} oldCurrent Старый текущий элемент
    * @param {Number} newPosition Новая позиция
    * @param {Number} oldPosition Старая позиция
    * @protected
    */
   protected _notifyCurrentChange(newCurrent: CollectionItem, oldCurrent: CollectionItem, newPosition: number, oldPosition: number) {
      if (!this.isEventRaising()) {
         return;
      }

      this._removeFromQueue('onCurrentChange');
      this._notify(
         'onCurrentChange',
         newCurrent,
         oldCurrent,
         newPosition,
         oldPosition
      );
   }

   /**
    * Нотифицирует событие change для измененных элементов
    * @param {Array} changed Измененные элементы исходной коллекции.
    * @param {Number} index Индекс исходной коллекции, в котором находятся элементы.
    * @protected
    */
   protected _notifyCollectionItemsChange(changed: any[], index: number, session: Session) {
      let items = this._getItems();
      let last = index + changed.length;
      let changedItems = [];

      //Extract display items contains changed
      for (let i = index; i < last; i++) {
         changedItems.push(items[this._getItemIndex(i)]);
      }

      this._notifyBeforeCollectionChange();
      EventRaisingMixin._extractPacksByList(
         this,
         changedItems,
         (pack, index) => {
            this._notifyCollectionChange(
               IBind.ACTION_CHANGE,
               pack,
               index,
               pack,
               index,
               session
            );
         }
      );
      this._notifyAfterCollectionChange();
   }

   /**
    * Генерирует событие об изменении элемента проекции
    * @param {Core/EventObject} event Дескриптор события.
    * @param {*} item Измененный элемент коллекции.
    * @param {Number} index Индекс измененного элемента.
    * @param {Object} [properties] Изменившиеся свойства
    * @protected
    */
   protected _notifySourceCollectionItemChange(event: EventObject, item: any, index: number, properties?: Object) {
      let enumerator = this._getUtilityEnumerator();
      let internalItems = this._getItems();
      let internalIndexBefore = this._getItemIndex(index);
      let internalIndexAfter;
      let internalItem = internalItems[internalIndexBefore];
      let indexBefore = enumerator.getInternalBySource(internalIndexBefore);
      let indexAfter;
      let isEventRaising = this.isEventRaising();
      let session = this._startUpdateSession();
      let isMoved;
      let state;

      //Only changes of important properties can run analysis
      for (let key in properties) {
         if (properties.hasOwnProperty(key)) {
            if (this._$importantItemProperties.indexOf(key) > -1) {
               if (isEventRaising) {
                  //Fix the state before analysis
                  state = this._getItemsState(internalItems);
               }
               this._reAnalize(
                  index,
                  1
               );
               break;
            }
         }
      }

      //Return here if events are disabled
      if (!isEventRaising) {
         return;
      }

      this._finishUpdateSession(session, false);

      //Check changes by state
      internalIndexAfter = this._getItemIndex(index);
      indexAfter = enumerator.getInternalBySource(internalIndexAfter);
      isMoved = indexBefore !== indexAfter;
      this._checkItemsDiff(session, internalItems, state, (diff) => {
         //Some hard logic related with the character of item change.
         let internalItemIndex = diff.indexOf(internalItem);
         if (isMoved) {
            //Item change the position
            if (internalItemIndex > -1 && indexBefore > indexAfter) {
               //Changed item is presented in the diff and moved up.
               //It will be presented as a move event with that item in _finishUpdateSession.
               //We should not notify about item change with the diff.
               diff.splice(internalItemIndex, 1);
            } else if (internalItemIndex === -1 && indexBefore < indexAfter) {
               //Changed item isn't presented in the diff and moved down.
               //It won't be presented as a move event with that item in _finishUpdateSession (items after will move up).
               //We should notify about item change with the diff.
               diff.push(internalItem);
            }
         } else if (!isMoved && internalItemIndex === -1) {
            //Changed item don't change the position and not presented in the diff.
            //We should notify about item change with the diff.
            diff.push(internalItem);
         }
      });
   }

   /**
    * Генерирует событие о начале изменений коллекции
    * @protected
    */
   protected _notifyBeforeCollectionChange() {
      if (!this.isEventRaising()) {
         return;
      }
      this._notifyLater('onBeforeCollectionChange');
   }

   /**
    * Генерирует событие об окончании изменений коллекции
    * @protected
    */
   protected _notifyAfterCollectionChange() {
      if (!this.isEventRaising()) {
         return;
      }
      this._notify('onAfterCollectionChange');
   }

   //endregion

   //endregion
}

Collection.prototype._moduleName = 'Types/display:Collection';
Collection.prototype['[Types/_display/Collection]'] = true;
// @ts-ignore
Collection.prototype._$collection = null;
// @ts-ignore
Collection.prototype._$filter = null;
// @ts-ignore
Collection.prototype._$group = null;
// @ts-ignore
Collection.prototype._$sort = null;
// @ts-ignore
Collection.prototype._$idProperty = '';
// @ts-ignore
Collection.prototype._$unique = false;
// @ts-ignore
Collection.prototype._$importantItemProperties = null;
// @ts-ignore
Collection.prototype._localize = false;
// @ts-ignore
Collection.prototype._itemModule = 'Types/display:CollectionItem';
// @ts-ignore
Collection.prototype._itemsFactory = null;
// @ts-ignore
Collection.prototype._composer = null;
// @ts-ignore
Collection.prototype._sourceCollectionSynchronized = true;
// @ts-ignore
Collection.prototype._sourceCollectionDelayedCallbacks = null;
// @ts-ignore
Collection.prototype._cursorEnumerator = null;
// @ts-ignore
Collection.prototype._utilityEnumerator = null;
// @ts-ignore
Collection.prototype._onCollectionChange = null;
// @ts-ignore
Collection.prototype._onCollectionItemChange = null;
// @ts-ignore
Collection.prototype._oEventRaisingChange = null;

// Deprecated
Collection.prototype['[Types/Display/Collection]'] = true;

di.register('Types/display:Collection', Collection);
