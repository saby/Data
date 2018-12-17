/// <amd-module name="Types/_display/itemsStrategy/AdjacencyList" />
/**
 * Стратегия-декоратор получения элементов проекции по списку смежных вершин
 * @class Types/Display/ItemsStrategy/AdjacencyList
 * @mixes Types/Entity/DestroyableMixin
 * @implements Types/Display/IItemsStrategy
 * @mixes Types/Entity/SerializableMixin
 * @author Мальцев А.А.
 */

import IItemsStrategy from '../IItemsStrategy';
import AbstractStrategy, {IOptions as IAbstractOptions} from './AbstractStrategy';
import CollectionItem from '../CollectionItem';
import GroupItem from '../GroupItem';
import {DestroyableMixin, SerializableMixin} from '../../entity';
import {mixin, protect, object, logger} from '../../util';
import {Map} from '../../shim';
// @ts-ignore
import throttle = require('Core/helpers/Function/throttle');

/**
 * Свойство, хранящее признак, что список элементов проинициализирован
 * @const {Symbol}
 */
const $initialized = protect('initialized');

/**
 * Выводит предупреждения не чаще, чем раз в 300мс
 */
let warning = throttle(logger.info, 300);

/**
 * Нормализует значение идентификатора
 */
function normalizeId(id: number | string): string {
   if (typeof id === 'number') {
      id = String(id);
   }
   return id;
}

interface SplicedArray {
   hasBeenRemoved?: boolean;
}

/**
 * Создает список "родитель - дети".
 * @param sourceItems Массив элементов декорируемой стратегии
 * @param parentProperty Имя свойства, в котором хранится идентификатор родительского узла
 * @return Идентификатор узла -> Индексы детей в исходной коллекции
 */
function buildChildrenMap(sourceItems: CollectionItem[], parentProperty: string): Map<number, number> {
   let parentToChildren = new Map(); //Map<Array<Number>>: parentId => [childIndex, childIndex, ...]
   let count = sourceItems.length;
   let item;
   let itemContents;
   let children;
   let parentId;

   for (let position = 0; position < count; position++) {
      item = sourceItems[position];
      itemContents = item.getContents();

      //Skip groups
      if (item instanceof GroupItem) {
         continue;
      }

      //TODO: work with parentId === Object|Array
      parentId = normalizeId(object.getPropertyValue(itemContents, parentProperty));

      if (parentToChildren.has(parentId)) {
         children = parentToChildren.get(parentId);
      } else {
         children = [];
      }

      children.push(position);
      parentToChildren.set(parentId, children);
   }

   return parentToChildren;
}

/**
 * Создает список "элемент - индекс группы".
 * @param {Array.<Types/Display/CollectionItem>} sourceItems Массив элементов декорируемой стратегии
 * @return {Map.<Types/Display/CollectionItem, Number>} Элемент -> индекс группы в sourceItems
 * @static
 */
function buildGroupsMap(sourceItems: CollectionItem[]): Map<CollectionItem, number> {
   let itemToGroup = new Map();
   let currentGroup;

   sourceItems.forEach((item, index) => {
      if (item instanceof GroupItem) {
         currentGroup = index;
      } else {
         itemToGroup.set(item, currentGroup);
      }
   });

   return itemToGroup;
}

/**
 * Создает индекс следования элементов исходной коллекции в древовидной структуре.
 * @param {Object} options Опции
 * @param {Array.<Types/Display/CollectionItem>} options.sourceItems Массив элементов декорируемой стратегии
 * @param {Map.<Number>} options.childrenMap Cписок "родитель - дети".
 * @param {Array.<Types/Display/CollectionItem, Number>} options.groupsMap Cписок "элемент - индекс группы"
 * @param {Array.<Number>} options.parentsMap Cписок "ребенок - родитель" (заполняется динамически).
 * @param {Array.<String>} options.path Путь до текущиего узла в дереве (заполняется динамически).
 * @param {String} options.idProperty Имя свойства, в котором хранится идентификатор элемента.
 * @param {Number} [parentIndex] Индекс текущего родителя
 * @return {Array.<Number>} Индекс в дереве -> индекс в исходной коллекции
 * @static
 */
function buildTreeIndex(options, parentIndex?: number): number[] {
   let result = [];
   let sourceItems = options.sourceItems;
   let childrenMap = options.childrenMap;
   let parentsMap = options.parentsMap;
   let groupsMap = options.groupsMap;
   let lastGroup = options.lastGroup;
   let path = options.path;
   let idProperty = options.idProperty;
   let parentId = path[path.length - 1];

   //Check if that parentId is already behind
   if (path.indexOf(parentId) > -1 && path.indexOf(parentId) < path.length - 1) {
      logger.error(
         'Types/display:itemsStrategy.AdjacencyList',
         `Wrong data hierarchy relation: recursive traversal detected: parent with id "${parentId}" is already in progress. Path: ${path.join(' -> ')}.`
      );
      return result;
   }

   let children = childrenMap.has(parentId) ? childrenMap.get(parentId) : [];
   let childrenCount = children.length;
   let child;
   let childIndex;
   let childContents;
   let childGroup;
   let groupReverted;
   for (let i = 0; i < childrenCount; i++) {
      childIndex = children[i];
      child = sourceItems[childIndex];
      childContents = child.getContents();
      childGroup = groupsMap.get(child);

      //Add group if it has been changed
      if (childGroup !== lastGroup) {
         //Reject reverted group. Otherwise we'll have empty reverted group.
         if (groupReverted) {
            result.pop();
            parentsMap.pop();
         }

         result.push(childGroup);
         parentsMap.push(parentIndex);
         lastGroup = options.lastGroup = childGroup;
      }

      result.push(childIndex);
      parentsMap.push(parentIndex);

      if (groupReverted) {
         groupReverted = false;//Reset revert flag if group has any members
      }

      if (childContents && idProperty) {
         let childId = normalizeId(object.getPropertyValue(childContents, idProperty));
         path.push(childId);

         //Lookup for children
         let itemsToPush = buildTreeIndex(options, parentsMap.length - 1);
         result.push(...itemsToPush);

         //Revert parent's group if any child joins another group if there is not the last member in the root
         if (childGroup !== options.lastGroup && (parentIndex !== undefined || i < childrenCount - 1)) {
            result.push(childGroup);
            parentsMap.push(parentIndex);
            lastGroup = options.lastGroup = childGroup;
            groupReverted = true;
         }

         path.pop();
      }
   }

   return result;
}

interface IOptions {
   idProperty: string;
   parentProperty: string;
   source: AbstractStrategy;
}

export default class AdjacencyList extends mixin(DestroyableMixin, SerializableMixin) implements IItemsStrategy /** @lends Types/Display/ItemsStrategy/AdjacencyList.prototype */{
   /**
    * @typedef {Object} Options
    * @property {Types/Display/ItemsStrategy/Abstract} source Декорирумая стратегия
    * @property {String} idProperty Имя свойства, хранящего первичный ключ
    * @property {String} parentProperty Имя свойства, хранящего первичный ключ родителя
    */

   /**
    * Опции конструктора
    */
   protected _options: IOptions;

   /**
    * Элементы стратегии
    */
   protected _items: Array<CollectionItem>;

   /**
    * Элементы декорируемой стратегии
    */
   protected _sourceItems: Array<CollectionItem>;

   /**
    * Внутренний индекс -> оригинальный индекс
    */
   protected _itemsOrder: Array<number>;

   /**
    * Индекс ребенка -> индекс родителя
    */
   protected _parentsMap: Array<number>;

   /**
    * Конструктор
    * @param {Options} options Опции
    */
   constructor(options: IOptions) {
      super();
      this._options = options;

      if (!options.idProperty) {
         warning(`${this._moduleName}::constructor(): option "idProperty" is not defined. Only root elements will be presented`);
      }
   }

   //region IItemsStrategy

   readonly '[Types/_display/IItemsStrategy]': boolean = true;

   get options(): IAbstractOptions {
      return this.source.options;
   }

   get source(): IItemsStrategy {
      return this._options.source;
   }

   get count(): number {
      let itemsOrder = this._getItemsOrder();
      return itemsOrder.length;
   }

   get items(): Array<CollectionItem> {
      //Force create every item
      let items = this._getItems();
      if (!items[$initialized]) {
         let count = items.length;
         for (let i = 0; i < count; i++) {
            if (items[i] === undefined) {
               this.at(i);
            }
         }
         items[$initialized] = true;
      }
      return items;
   }

   at(index: number): CollectionItem {
      let items = this._getItems();
      if (items[index]) {
         return items[index];
      }

      let itemsOrder = this._getItemsOrder();
      let collectionIndex = itemsOrder[index];
      let sourceItem = this._getSourceItems()[collectionIndex];
      let item;

      if (sourceItem === undefined) {
         throw new ReferenceError('Collection index ' + index + ' is out of bounds.');
      }

      if (sourceItem instanceof GroupItem) {
         item = sourceItem;
      } else {
         item = this.options.display.createItem({
            contents: sourceItem.getContents(),
            parent: this._getParent(index)
         });
      }

      return items[index] = item;
   }

   splice(start: number, deleteCount: number, added?: Array<CollectionItem>): Array<CollectionItem> {
      added = added || [];

      let shiftTail = (start, offset) => {
         return (value) => value >= start ? value + offset : value;
      };

      let source = this.source;
      let deletedInSource = []; //deleted indices in this.source.items
      for (let i = start; i < start + deleteCount; i++) {
         deletedInSource.push(source.getDisplayIndex(i));
      }

      source.splice(start, deleteCount, added);

      let items = this._getItems();
      let itemsOrder = this._getItemsOrder();
      let sourceItems = this._getSourceItems();

      //There is the one and only case to move items with two in turn splices
      if ((<SplicedArray>added).hasBeenRemoved) {
         added.forEach((item, index) => {
            let startInSource = source.getDisplayIndex(start + index - deleteCount); //Actual index of added items in source
            let startInInner = itemsOrder.indexOf(startInSource);//Actual index of added items in itemsOrder

            //If no actual index in itemsOrder bring it to the end
            if (startInInner === -1) {
               startInInner = itemsOrder.length;
            }

            sourceItems.splice(startInSource, 0, item);//insert in sourceItems
            itemsOrder = itemsOrder.map(shiftTail(startInSource, 1));//shift itemsOrder values by +1 from startInSource
            itemsOrder.splice(startInInner, 0, startInSource);//insert in itemsOrder
            items.splice(startInInner, 0, item);//insert in items
         });
      }

      let removed = [];
      if (deleteCount > 0) {
         //Remove deleted in _itemsOrder, _items and _sourceItems
         let removeDeleted = (deleted) => (outer, inner) => {
            let isRemoved = deleted.indexOf(outer) > -1;
            if (isRemoved) {
               removed.push(
                  items.splice(inner, 1)[0]
               );
               sourceItems.splice(outer, 1);
            }
            return !isRemoved;
         };

         //Remove deleted from itemsOrder
         itemsOrder = itemsOrder.filter(removeDeleted(deletedInSource));

         //Shift indices from deleted in itemsOrder from higher to lower
         deletedInSource.sort().reverse().forEach((outer) => {
            itemsOrder = itemsOrder.map(shiftTail(outer, -1));
         });

         //Set removed flag to use in possible move operation
         (<SplicedArray>removed).hasBeenRemoved = true;
      }

      this._itemsOrder = itemsOrder;

      this._syncItemsOrder();

      return removed;
   }

   reset() {
      this._items = null;
      this._sourceItems = null;
      this._itemsOrder = null;
      this.source.reset();
   }

   invalidate() {
      this.source.invalidate();
      this._syncItemsOrder();
   }

   getDisplayIndex(index: number): number {
      let sourceIndex = this.source.getDisplayIndex(index);
      let itemsOrder = this._getItemsOrder();
      let itemIndex = itemsOrder.indexOf(sourceIndex);

      return itemIndex === -1 ? itemsOrder.length : itemIndex;
   }

   getCollectionIndex(index: number): number {
      let sourceIndex = this.source.getCollectionIndex(index);
      let itemsOrder = this._getItemsOrder();
      let collectionIndex = itemsOrder[sourceIndex];

      return collectionIndex === undefined ? -1 : collectionIndex;
   }

   //endregion

   //region SerializableMixin

   protected _getSerializableState(state) {
      state = SerializableMixin.prototype._getSerializableState.call(this, state);

      state.$options = this._options;
      state._items = this._items;
      state._itemsOrder = this._itemsOrder;
      state._parentsMap = this._parentsMap;

      return state;
   }

   protected _setSerializableState(state) {
      let fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
      return function() {
         fromSerializableMixin.call(this);

         this._items = state._items;
         this._itemsOrder = state._itemsOrder;
         this._parentsMap = state._parentsMap;
      };
   }

   //endregion

   //region Protected

   /**
    * Возвращает элементы проекции
    * @return Array.<Types/Display/CollectionItem>
    * @protected
    */
   protected _getItems(): Array<CollectionItem> {
      if (!this._items) {
         this._initItems();
      }
      return this._items;
   }

   /**
    * Инициализирует элементы проекции
    * @protected
    */
   protected _initItems() {
      this._items = [];
      this._items.length = this._getItemsOrder().length;
   }

   /**
    * Возвращает соответствие индексов в стратегии оригинальным индексам
    * @protected
    * @return {Array.<Number>}
    */
   protected _getItemsOrder(): Array<number> {
      if (!this._itemsOrder) {
         this._itemsOrder = this._createItemsOrder();
      }

      return this._itemsOrder;
   }

   protected _syncItemsOrder() {
      if (!this._itemsOrder) {
         return;
      }

      let oldOrder = this._itemsOrder;
      let oldItems = this._getItems();
      let oldSourceItems = this._getSourceItems();
      let newOrder = this._createItemsOrder();
      let newSourceItems = this._sourceItems;
      let sourceToInner = new Map();

      oldOrder.forEach((sourceIndex, innerIndex) => {
         sourceToInner.set(oldSourceItems[sourceIndex], oldItems[innerIndex]);
      });

      let newItems = new Array(newOrder.length);
      let innerItem;
      let sourceItem;
      let sourceIndex;
      for (let newIndex = 0; newIndex < newOrder.length; newIndex++) {
         sourceIndex = newOrder[newIndex];
         sourceItem = newSourceItems[sourceIndex];
         innerItem = sourceToInner.get(sourceItem);
         if (innerItem && innerItem.getContents() === sourceItem.getContents()) {
            newItems[newIndex] = innerItem;
            sourceToInner.delete(sourceItem);//To skip duplicates
         }
      }

      this._itemsOrder = newOrder;
      this._items = newItems;

      //Every item leaved the tree should lost their parent
      oldItems.forEach((item) => {
         if (item.setParent) {
            item.setParent(undefined);
         }
      });

      //Every item stayed in the tree should renew their parent
      newItems.forEach((item, index) => {
         if (item.setParent) {
            item.setParent(this._getParent(index));
         }
      });
   }

   protected _getSourceItems(): Array<CollectionItem> {
      if (!this._sourceItems) {
         this._sourceItems = this.source.items;
      }
      return this._sourceItems;
   }

   protected _createItemsOrder(): Array<number> {
      this._sourceItems = null;
      this._parentsMap = [];

      let options = this._options;
      let sourceItems = this._getSourceItems();

      let root = this.options.display.getRoot();
      root = root && root.getContents ? root.getContents() : root;
      if (root && root instanceof Object) {
         root = root.valueOf();
      }
      root = normalizeId(root && typeof root === 'object'
         ? object.getPropertyValue(root, options.idProperty)
         : root
      );

      let childrenMap = buildChildrenMap(sourceItems, options.parentProperty);
      let groupsMap = buildGroupsMap(sourceItems);

      //FIXME: backward compatibility with controls logic: 1st level items may don\'t have parentProperty
      if (root === null && !childrenMap.has(root) && childrenMap.has(undefined)) {
         root = undefined;
      }

      return buildTreeIndex({
         idProperty: options.idProperty,
         sourceItems: sourceItems,
         childrenMap: childrenMap,
         groupsMap: groupsMap,
         parentsMap: this._parentsMap,
         path: [root]
      });
   }

   /**
    * Возращает родителя элемента проекции.
    * @param {Number} index Индекс элемента
    * @return {Types/Display/CollectionItem} Родитель
    */
   protected _getParent(index: number): CollectionItem {
      let parentsMap = this._parentsMap;
      let parentIndex = parentsMap[index];
      if (parentIndex === -1) {
         return undefined;
      }
      return parentIndex === undefined ? this.options.display.getRoot() : this.at(parentIndex);
   }

   //endregion
}

AdjacencyList.prototype._moduleName = 'Types/display:itemsStrategy.AdjacencyList';
AdjacencyList.prototype['[Types/_display/itemsStrategy/AdjacencyList]'] = true;
// @ts-ignore
AdjacencyList.prototype._options = null;
// @ts-ignore
AdjacencyList.prototype._items = null;
// @ts-ignore
AdjacencyList.prototype._sourceItems = null;
// @ts-ignore
AdjacencyList.prototype._itemsOrder = null;
// @ts-ignore
AdjacencyList.prototype._parentsMap = null;
