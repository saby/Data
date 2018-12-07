/// <amd-module name="Types/_display/itemsStrategy/Group" />
/**
 * Стратегия-декоратор для формирования групп элементов
 * @class Types/Display/ItemsStrategy/Group
 * @mixes Types/Entity/DestroyableMixin
 * @implements Types/Display/IItemsStrategy
 * @mixes Types/Entity/SerializableMixin
 * @author Мальцев А.А.
 */

import IItemsStrategy, {IOptions as IItemsStrategyOptions} from '../IItemsStrategy';
import Abstract from '../Abstract';
import CollectionItem from '../CollectionItem';
import GroupItem from '../GroupItem';
import {DestroyableMixin, SerializableMixin} from '../../entity';
import {mixin} from '../../util';

interface GroupHandler {
   (data: any, index: number, item: CollectionItem): string | number
}

interface IOptions {
   source: IItemsStrategy;
   display: Abstract;
   handler: GroupHandler;
}

interface ISortOptions {
   display: Abstract;
   handler: GroupHandler;
   groups: Array<GroupItem>;
}

export default class Group extends mixin(DestroyableMixin, SerializableMixin) implements IItemsStrategy /** @lends Types/Display/ItemsStrategy/Group.prototype */{
   /**
    * @typedef {Object} Options
    * @property {Types/Display/ItemsStrategy/Abstract} source Декорирумая стратегия
    * @property {Function(Types/Collection/Item, Number, *)} handler Метод, возвращающий группу элемента
    */

   /**
    * Опции конструктора
    */
   protected _options: IOptions;

   /**
    * Группы
    */
   protected _groups: Array<GroupItem> = [];

   /**
    * Индекс в в стратегии -> оригинальный индекс
    */
   protected _itemsOrder: Array<number>;

   /**
    * Конструктор
    * @param {Options} options Опции
    */
   constructor(options: IOptions) {
      super();
      this._options = options;
   }

   /**
    * Метод, возвращающий группу элемента
    */
   set handler(value: GroupHandler) {
      this._options.handler = value;
   }

   //region IItemsStrategy

   readonly '[Types/_display/IItemsStrategy]': boolean = true;

   get options(): IItemsStrategyOptions {
      return this.source.options;
   }

   get source(): IItemsStrategy {
      return this._options.source;
   }

   get count(): number {
      return this._getItemsOrder().length;
   }

   get items(): Array<CollectionItem> {
      let itemsOrder = this._getItemsOrder();
      let items = this._getItems();

      return itemsOrder.map((index) => items[index]);
   }

   at(index: number): CollectionItem {
      let itemsOrder = this._getItemsOrder();
      let itemIndex = itemsOrder[index];

      if (itemIndex === undefined) {
         throw new ReferenceError('Index ' + index + ' is out of bounds.');
      }

      return this._getItems()[itemIndex];
   }

   splice(start: number, deleteCount: number, added?: Array<CollectionItem>): Array<CollectionItem> {
      this._itemsOrder = null;
      return this.source.splice(
         start,
         deleteCount,
         added
      );
   }

   reset() {
      this._groups = [];
      this._itemsOrder = null;
      return this.source.reset();
   }

   invalidate() {
      this._itemsOrder = null;
      return this.source.invalidate();
   }

   getDisplayIndex(index: number): number {
      let itemsOrder = this._getItemsOrder();
      let sourceIndex = this.source.getDisplayIndex(index);
      let overallIndex = sourceIndex + this._groups.length;
      let itemIndex = itemsOrder.indexOf(overallIndex);

      return itemIndex === -1 ? itemsOrder.length : itemIndex;
   }

   getCollectionIndex(index: number): number {
      let itemsOrder = this._getItemsOrder();
      let overallIndex = itemsOrder[index];
      let sourceIndex = overallIndex - this._groups.length;

      sourceIndex = sourceIndex >= 0 ? this.source.getCollectionIndex(sourceIndex) : -1;

      return sourceIndex;
   }

   //endregion

   //region SerializableMixin

   protected _getSerializableState(state) {
      state = SerializableMixin._getSerializableState.call(this, state);

      state.$options = this._options;
      state._groups = this._groups;
      state._itemsOrder = this._itemsOrder;

      //If handler is defined force calc order because handler can be lost during serialization
      if (!state._itemsOrder && this._options.handler) {
         state._itemsOrder = this._getItemsOrder();
      }

      return state;
   }

   protected _setSerializableState(state) {
      let fromSerializableMixin = SerializableMixin._setSerializableState(state);
      return function() {
         this._groups = state._groups;
         this._itemsOrder = state._itemsOrder;
         fromSerializableMixin.call(this);
      };
   }

   //endregion

   //region Protected

   /**
    * Возвращает группы + элементы оригинальной стратегии
    * @protected
    * @return {Array.<CollectionItem>}
    */
   protected _getItems(): Array<CollectionItem> {
      return (<CollectionItem[]> this._groups).concat(this.source.items);
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

   /**
    * Создает соответствие индексов в стратегии оригинальным оригинальный индексам
    * @protected
    * @return {Array.<Number>}
    */
   protected _createItemsOrder(): Array<number> {
      return Group.sortItems(this.source.items, {
         display: this.options.display,
         handler: this._options.handler,
         groups: this._groups
      });
   }

   /**
    * Возвращает число групп, в которых есть элементы
    * @protected
    * @return {Number}
    */
   protected _getActiveGroupsCount(itemsOrder) {
      return itemsOrder.length - this.source.items.length;
   }

   //endregion

   //region Statics

   /**
    * Создает индекс сортировки в порядке группировки
    * @param {Array.<Types/Display/CollectionItem>} items Элементы проекции.
    * @param {Object} options Опции
    * @param {Array.<Types/Display/GroupItem>} options.groups Группы
    * @param {Types/Display/Display} options.display Проекция
    * @param {Function(Types/Display/CollectionItem):*>} options.handler Метод, возвращающий идентификатор группы
    * @return {Array.<Number>}
    */
   static sortItems(items: Array<CollectionItem>, options: ISortOptions) {
      let groups = options.groups;
      let display = options.display;
      let handler = options.handler;

      //No grouping - reset groups and return current order
      if (!handler) {
         groups.length = 0;
         return items.map((item, index) => index);
      }

      let groupsId; //{Array}: Group index -> group ID
      //Fill groupsId by groups
      groupsId = groups.map((item) => item.getContents());

      let groupsOrder = []; //{Array.<Number>}: Group position -> Group index
      let groupsItems = []; //{Array.<Number>}: Group index -> Item index
      //Check group ID and group instance for every item and join them all together
      for (let position = 0; position < items.length; position++) {
         let item = items[position];
         let groupId = handler ? handler(item.getContents(), position, item) : undefined;
         let groupIndex = groupsId.indexOf(groupId);

         //Create group with this groupId if necessary
         if (groupsId.indexOf(groupId) === -1) {
            let group = new GroupItem({
               owner: display,
               contents: groupId
            });

            groupIndex = groups.length;

            //Insert data into groups and groupsId
            groups.push(group);
            groupsId.push(groupId);
         }

         //Remember group order
         if (groupsOrder.indexOf(groupIndex) === -1) {
            groupsOrder.push(groupIndex);
         }

         //Items of each group
         if (!groupsItems[groupIndex]) {
            groupsItems[groupIndex] = [];
         }
         groupsItems[groupIndex].push(position);
      }

      //Fill result by groups
      let result = [];
      let groupsCount = groups.length;
      groupsOrder.forEach((groupIndex) => {
         result.push(groupIndex);
         groupsItems[groupIndex].forEach((item) => {
            result.push(item + groupsCount);
         });
      });

      return result;
   }

   //endregion
}

Group.prototype._moduleName = 'Types/display:itemsStrategy.Group';
Group.prototype['[Types/_display/itemsStrategy/Group]'] = true;
// @ts-ignore
Group.prototype._groups = null;
// @ts-ignore
Group.prototype._itemsOrder = null;
