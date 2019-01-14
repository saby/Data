/// <amd-module name="Types/_display/Tree" />
/**
 * Проекция в виде дерева - предоставляет методы навигации, фильтрации и сортировки, не меняя при этом оригинальную коллекцию.
 * Дерево может строиться по алгоритму {@link https://en.wikipedia.org/wiki/Adjacency_list Adjacency List} или {@link https://docs.mongodb.com/v3.2/tutorial/model-tree-structures-with-materialized-paths/ Materialized Path}. Выбор алгоритма выполняется в зависимости от настроек.
 * @class Types/Display/Tree
 * @extends Types/Display/Collection
 * @public
 * @author Мальцев А.А.
 */

import Collection, {ItemsFactory, SessionItemState} from './Collection';
import CollectionEnumerator from './CollectionEnumerator';
import CollectionItem from './CollectionItem';
import GroupItem from './GroupItem';
import TreeItem from './TreeItem';
import TreeChildren from './TreeChildren';
import ItemsStrategyComposer from './itemsStrategy/Composer';
import DirectItemsStrategy from './itemsStrategy/Direct';
import AdjacencyListStrategy from './itemsStrategy/AdjacencyList';
import MaterializedPathStrategy from './itemsStrategy/MaterializedPath';
import RootStrategy from './itemsStrategy/Root';
import {register} from '../di';
import {object} from '../util';

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
   newItems: any[],
   newItemsIndex: number,
   oldItems: any[],
   oldItemsIndex: number
) {
   //Fix state of all nodes
   let nodes = this.instance._getItems().filter((item) => item.isNode && item.isNode());
   let state = this.instance._getItemsState(nodes);
   let session = this.instance._startUpdateSession();

   this.instance._reIndex();
   this.prev(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex);

   //Check state of all nodes. They can change children count (include hidden by filter).
   this.instance._finishUpdateSession(session, false);
   this.instance._checkItemsDiff(session, nodes, state);
}

/**
 * Обрабатывает событие об изменении элемента коллекции
 * @param event Дескриптор события.
 * @param item Измененный элемент коллекции.
 * @param index Индекс измененного элемента.
 * @param properties Объект содержащий измененные свойства элемента
 */
function onCollectionItemChange(event: EventObject, item: any, index: number, properties: Object) {
   this.instance._reIndex();
   this.prev(event, item, index, properties);
}

/**
 * Возвращает имя совйства с инвертированным смыслом
 * @param name Имя свойства.
 */
function invertPropertyLogic(name: string): string {
   return name[0] === '!' ? name.slice(1) : '!' + name;
}

export interface IOptions {
   hasChildrenProperty?: string;
   loadedProperty?: string;
}

export interface TreeSessionItemState extends SessionItemState {
   parent: TreeItem;
   childrenCount: number;
   level: number;
   node: boolean;
   expanded: boolean;
}


export default class Tree extends Collection /** @lends Types/Display/Tree.prototype */{
   /**
    * @cfg {String} Название свойства, содержащего идентификатор родительского узла. Дерево в этом случае строится по алгоритму Adjacency List (список смежных вершин). Также требуется задать {@link idProperty}
    * @name Types/Display/Tree#parentProperty
    */
   protected _$parentProperty: string;

   /**
    * @cfg {String} Название свойства, содержащего признак узла. Требуется для различения узлов и листьев.
    * @name Types/Display/Tree#nodeProperty
    */
   protected _$nodeProperty: string;

   /**
    * @cfg {String} Название свойства, содержащего дочерние элементы узла. Дерево в этом случае строится по алгоритму Materialized Path (материализованный путь).
    * @remark Если задано, то опция {@link parentProperty} не используется.
    * @name Types/Display/Tree#childrenProperty
    */
   protected _$childrenProperty: string;

   /**
    * @cfg {String} Название свойства, содержащего признак наличия детей у узла
    * @name Types/Display/Tree#hasChildrenProperty
    * @example
    * Зададим поле "Раздел$" отвечающим за признак загруженности:
    * <pre>
    *    new Tree({
    *       parentProperty: 'Раздел',
    *       hasChildrenProperty: 'Раздел$'
    *    })
    * </pre>
    *
    */
   protected _$hasChildrenProperty: string;

   /**
    * @cfg {Types/Display/TreeItem|*} Корневой узел или его содержимое
    * @name Types/Display/Tree#root
    */
   protected _$root: TreeItem | any;

   /**
    * @cfg {Boolean} Включать корневой узел в список элементов
    * @name Types/Display/Tree#rootEnumerable
    * @example
    * Получим корень как первый элемент проекции:
    * <pre>
    *    var tree = new Tree({
    *       root: {id: null, title: 'Root'},
    *       rootEnumerable: true
    *    });
    *    tree.at(0).getContents().title;//'Root'
    * </pre>
    *
    */
   protected _$rootEnumerable: boolean;

   /**
    * Корневой элемент дерева
    */
   protected _root: TreeItem;

   /**
    * {Object.<Array.<Types/Display/TreeItem>>} Соответствие узлов и их потомков
    */
   protected _childrenMap: Object = {};

   // @ts-ignore
   constructor(options?: IOptions) {
      // FIXME: must process options before superclass constructor because it's immediately used in _composer
      if (options && !options.hasChildrenProperty && options.loadedProperty) {
         options.hasChildrenProperty = invertPropertyLogic(options.loadedProperty);
      }

      super(options);

      if (this._$parentProperty) {
         this._setImportantProperty(this._$parentProperty);
      }
      if (this._$childrenProperty) {
         this._setImportantProperty(this._$childrenProperty);
      }
   }

   destroy() {
      this._childrenMap = {};

      super.destroy();
   }

   //region SerializableMixin

   protected _getSerializableState(state) {
      state = super._getSerializableState(state);

      state._root = this._root;

      return state;
   }

   protected _setSerializableState(state) {
      let fromSuper = super._setSerializableState(state);
      return function() {
         this._root = state._root;
         fromSuper.call(this);
      };
   }

   //region Collection

   getIndexBySourceItem(item: any): number {
      if (this._$rootEnumerable && this.getRoot().getContents() === item) {
         return 0;
      }
      return super.getIndexBySourceItem(item);
   }

   /**
    * Устанавливает текущим следующий элемент родительского узла.
    * @return {Boolean} Есть ли следующий элемент в родительском узле
    */
   moveToNext(): boolean {
      return this._moveTo(true);
   }

   /**
    * Устанавливает текущим предыдущий элемент родительского узла
    * @return {Boolean} Есть ли предыдущий элемент в родительском узле
    */
   moveToPrevious(): boolean {
      return this._moveTo(false);
   }

   protected _exctractItemId(item) {
      let path = [super._exctractItemId(item)];

      let parent;
      while ((parent = item.getParent()) && !parent.isRoot()) {
         path.push(super._exctractItemId(parent));
         item = parent;
      }

      return path.join(':');
   }

   //endregion

   //region Public methods

   /**
    * Возвращает название свойства, содержащего идентификатор родительского узла
    * @return {String}
    */
   getParentProperty(): string {
      return this._$parentProperty;
   }

   /**
    * Устанавливает название свойства, содержащего идентификатор родительского узла
    * @param {String} name
    */
   setParentProperty(name: string) {
      this._unsetImportantProperty(this._$parentProperty);
      this._$parentProperty = name;

      this._resetItemsStrategy();
      this._setImportantProperty(name);
      this._reBuild(true);
   }

   /**
    * Возвращает название свойства, содержащего признак узла
    * @return {String}
    */
   getNodeProperty(): string {
      return this._$nodeProperty;
   }

   /**
    * Возвращает название свойства, содержащего дочерние элементы узла
    * @return {String}
    */
   getChildrenProperty(): string {
      return this._$childrenProperty;
   }

   /**
    * Возвращает название свойства, содержащего признак наличия детей у узла
    * @return {String}
    */
   getHasChildrenProperty(): string {
      return this._$hasChildrenProperty;
   }

   protected getLoadedProperty(): string {
      return invertPropertyLogic(this._$hasChildrenProperty);
   }

   /**
    * Возвращает корневой узел дерева
    * @return {Types/Display/TreeItem}
    */
   getRoot(): TreeItem {
      if (this._root === null) {
         this._root = this._$root;
         if (!(this._root instanceof TreeItem)) {
            this._root = new TreeItem({
               contents: this._root,
               owner: this,
               node: true,
               expanded: true,
               hasChildren: false
            });
         }
      }

      return this._root;
   }

   /**
    * Устанавливает корневой узел дерева
    * @param {Types/Display/TreeItem|*} root Корневой узел или его содержимое
    */
   setRoot(root: TreeItem | any) {
      if (this._$root === root) {
         return;
      }

      this._$root = root;
      this._root = null;

      this._reIndex();
      this._reAnalize();
   }

   /**
    * Возвращает признак, что корневой узел включен в список элементов
    * @return {Boolean}
    */
   isRootEnumerable(): boolean {
      return this._$rootEnumerable;
   }

   /**
    * Устанавливает признак, что корневой узел включен в список элементов
    * @param {Boolean} enumerable Корневой узел включен в список элементов
    */
   setRootEnumerable(enumerable: boolean) {
      if (this._$rootEnumerable === enumerable) {
         return;
      }

      let session = this._startUpdateSession();

      this._$rootEnumerable = enumerable;
      if (enumerable) {
         this._wrapRootStrategy(this._composer);
      } else {
         this._unwrapRootStrategy(this._composer);
      }

      this._reSort();
      this._reFilter();
      this._finishUpdateSession(session);
   }

   /**
    * Возвращает коллекцию потомков элемента коллекции
    * @param {Types/Display/TreeItem} parent Родительский узел
    * @param {Boolean} [withFilter=true] Учитывать {@link setFilter фильтр}
    * @return {Types/Display/TreeChildren}
    */
   getChildren(parent: TreeItem, withFilter?: boolean): TreeChildren {
      return new TreeChildren({
         owner: parent,
         items: this._getChildrenArray(parent, withFilter)
      });
   }

   /**
    * Устанавливает текущим родителя текущего элемента
    * @return {Boolean} Есть ли родитель
    */
   moveToAbove(): boolean {
      let current = this.getCurrent();
      if (!current) {
         return false;
      }

      let parent = current.getParent();
      if (!parent || parent.isRoot()) {
         return false;
      }

      this.setCurrent(parent);
      return true;
   }

   /**
    * Устанавливает текущим первого непосредственного потомка текущего элемента
    * @return {Boolean} Есть ли первый потомок
    */
   moveToBelow(): boolean {
      let current = <TreeItem> this.getCurrent();
      if (!current || !current.isNode()) {
         return false;
      }

      let children = this._getChildrenArray(current);
      if (children.length === 0) {
         return false;
      }

      this.setCurrent(children[0]);
      return true;
   }

   //endregion

   //region Protected methods

   protected _getItemsFactory(): ItemsFactory {
      let parent = super._getItemsFactory();

      return function TreeItemsFactory(options) {
         let hasChildrenProperty = this._$hasChildrenProperty;
         let invertLogic = false;

         if (typeof hasChildrenProperty === 'string' && hasChildrenProperty[0] === '!') {
            hasChildrenProperty = hasChildrenProperty.substr(1);
            invertLogic = !invertLogic;
         }

         let hasChildren = object.getPropertyValue(options.contents, hasChildrenProperty);
         options.hasChildren = invertLogic ? !hasChildren : hasChildren;

         if (!('node' in options)) {
            options.node = object.getPropertyValue(options.contents, this._$nodeProperty);
         }

         return parent.call(this, options);
      };
   }

   protected _createComposer(): ItemsStrategyComposer {
      let composer = super._createComposer();

      if (this._$childrenProperty) {
         composer.remove(DirectItemsStrategy);
         composer.prepend(MaterializedPathStrategy, {
            display: this,
            childrenProperty: this._$childrenProperty,
            nodeProperty: this._$nodeProperty,
            hasChildrenProperty: this._$hasChildrenProperty,
            root: this.getRoot.bind(this)
         });
      } else {
         composer.append(AdjacencyListStrategy, {
            idProperty: this._$idProperty,
            parentProperty: this._$parentProperty,
            nodeProperty: this._$nodeProperty,
            hasChildrenProperty: this._$hasChildrenProperty
         });
      }

      this._wrapRootStrategy(composer);

      return composer;
   }

   protected _wrapRootStrategy(composer: ItemsStrategyComposer) {
      if (this._$rootEnumerable && !composer.getInstance(RootStrategy)) {
         composer.append(RootStrategy, {
            root: this.getRoot.bind(this)
         });
      }
   }

   protected _unwrapRootStrategy(composer: ItemsStrategyComposer) {
      if (!this._$rootEnumerable) {
         composer.remove(RootStrategy);
      }
   }

   protected _reIndex() {
      super._reIndex();
      this._childrenMap = {};
   }

   protected _bindHandlers() {
      super._bindHandlers();

      this._onCollectionChange = onCollectionChange.bind({
         instance: this,
         prev: this._onCollectionChange
      });

      this._onCollectionItemChange = onCollectionItemChange.bind({
         instance: this,
         prev: this._onCollectionItemChange
      });
   }

   protected _replaceItems(start: number, newItems: any[]): CollectionItem[] {
      let replaced = super._replaceItems(start, newItems);
      let strategy = this._getItemsStrategy();
      let count = strategy.count;

      replaced.forEach((item, index) => {
         let strategyIndex = replaced.start + index;
         if (strategyIndex < count) {
            strategy.at(strategyIndex).setExpanded(item.isExpanded(), true);
         }
      });

      return replaced;
   }

   protected _getItemState(item: CollectionItem): TreeSessionItemState {
      let state = <TreeSessionItemState> super._getItemState(item);

      if (item instanceof TreeItem) {
         state.parent = item.getParent();
         state.childrenCount = item.getOwner()._getChildrenArray(item, false).length;
         state.level = item.getLevel();
         state.node = item.isNode();
         state.expanded = item.isExpanded();
      }

      return state;
   }

   /**
    * Проверяет валидность элемента проекции
    * @param {*} item Элемент проекции
    * @protected
    */
   protected _checkItem(item: any) {
      if (!item || !(item instanceof CollectionItem)) {
         throw new Error(this._moduleName + '::_checkItem(): item should be in instance of Types/Display/CollectionItem');
      }
   }

   /**
    * Возвращает массив детей для указанного родителя
    * @param {Types/Display/TreeItem} parent Родительский узел
    * @param {Boolean} [withFilter=true] Учитывать {@link setFilter фильтр}
    * @return {Array.<Types/Display/TreeItem>}
    * @protected
    */
   protected _getChildrenArray(parent: TreeItem, withFilter?: boolean): TreeItem[] {
      this._checkItem(parent);

      withFilter = withFilter === undefined ? true : !!withFilter;
      let iid = parent.getInstanceId();
      let key = iid + '|' + withFilter;

      if (!(key in this._childrenMap)) {
         let children = [];
         let enumerator;

         if (withFilter) {
            enumerator = this.getEnumerator();
         } else {
            enumerator = this._buildEnumerator(
               this._getItems.bind(this),
               this._filterMap.map(() => true),
               this._sortMap
            );
         }

         enumerator.setCurrent(parent);
         if (enumerator.getCurrent() === parent || parent.isRoot()) {
            let item;
            while (enumerator.moveNext()) {
               item = enumerator.getCurrent();
               if (!(item instanceof TreeItem)) {
                  continue;
               }
               if (item.getParent() === parent) {
                  children.push(item);
               } else if (item.getLevel() === parent.getLevel()) {
                  break;
               }
            }
         }

         this._childrenMap[key] = children;
      }

      return this._childrenMap[key];
   }

   protected _getNearbyItem(enumerator: CollectionEnumerator, item: CollectionItem, isNext: boolean, skipGroups: boolean) {
      let method = isNext ? 'moveNext' : 'movePrevious';
      let parent = item && item.getParent && item.getParent() || this.getRoot();
      let hasItem = true;
      let initial = enumerator.getCurrent();
      let sameParent = false;
      let current;
      let nearbyItem;

      enumerator.setCurrent(item);

      //TODO: отлеживать по level, что вышли "выше"
      while (hasItem && !sameParent) {
         hasItem = enumerator[method]();
         nearbyItem = enumerator.getCurrent();

         if (skipGroups && nearbyItem instanceof GroupItem) {
            nearbyItem = undefined;
            continue;
         }

         sameParent = nearbyItem ? nearbyItem.getParent() === parent : false;
         current = (hasItem && sameParent) ? nearbyItem : undefined;
      }

      enumerator.setCurrent(initial);

      return current;
   }

   protected _moveTo(isNext: boolean): boolean {
      let enumerator = this._getCursorEnumerator();
      let initial = this.getCurrent();
      let item = this._getNearbyItem(enumerator, initial, isNext, true);
      let hasMove = !!item;

      if (hasMove) {
         this.setCurrent(item);
      } else {
         enumerator.setCurrent(initial);
      }

      return hasMove;
   }

   protected _notifyItemsParent(treeItem: TreeItem, oldParent: TreeItem, properties: Object) {
      if (properties.hasOwnProperty(this.getParentProperty())) {
         this._notifyItemsParentByItem(treeItem.getParent());
         this._notifyItemsParentByItem(oldParent);
      }
   }

   protected _notifyItemsParentByItem(treeItem: TreeItem) {
      while (treeItem !== this.getRoot()) {
         this.notifyItemChange(treeItem, {children: []});
         treeItem = treeItem.getParent();
      }
   }

   //endregion
}

Tree.prototype._moduleName = 'Types/display:Tree';
Tree.prototype['[Types/_display/Tree]'] = true;
// @ts-ignore
Tree.prototype._itemModule = 'Types/display:TreeItem';
// @ts-ignore
Tree.prototype._$parentProperty = '';
// @ts-ignore
Tree.prototype._$nodeProperty = '';
// @ts-ignore
Tree.prototype._$childrenProperty = '';
// @ts-ignore
Tree.prototype._$hasChildrenProperty = '';
// @ts-ignore
Tree.prototype._$root = undefined;
// @ts-ignore
Tree.prototype._$rootEnumerable = false;
// @ts-ignore
Tree.prototype._root = null;

// Deprecated
Tree.prototype['[WS.Data/Display/Tree]'] = true;

register('Types/display:Tree', Tree);
