/// <amd-module name="Types/_display/itemsStrategy/User" />
/**
 * Стратегия-декоратор для пользовательского порядка элементов
 * @class Types/Display/ItemsStrategy/User
 * @mixes Types/Entity/DestroyableMixin
 * @implements Types/Display/IItemsStrategy
 * @mixes Types/Entity/SerializableMixin
 * @author Мальцев А.А.
 */

import IItemsStrategy from '../IItemsStrategy';
import {SortFunction} from '../Collection';
import AbstractStrategy, {IOptions as IAbstractOptions} from './AbstractStrategy';
import CollectionItem from '../CollectionItem';
import GroupItem from '../GroupItem';
import {DestroyableMixin, SerializableMixin} from '../../entity';
import {mixin} from '../../util';

interface IOptions {
   handlers: SortFunction[],
   source: AbstractStrategy
}

export default class User extends mixin(DestroyableMixin, SerializableMixin) implements IItemsStrategy /** @lends Types/Display/ItemsStrategy/User.prototype */{
   /**
    * @typedef {Object} Options
    * @property {Types/Display/ItemsStrategy/Abstract} source Декорирумая стратегия
    * @property {Array.<Function>} handlers Пользовательские методы сортировки
    */

   /**
    * Опции конструктора
    */
   protected _options: IOptions;

   /**
    * Индекс в в стратегии -> оригинальный индекс
    */
   protected _itemsOrder: Array<number>;

   //region Public members

   /**
    * Конструктор
    * @param {Options} options Опции
    */
   constructor(options: IOptions) {
      super();
      if (!options || !(options.handlers instanceof Array)) {
         throw new TypeError('Option "handlers" should be an instance of Array');
      }
      this._options = Object.assign({}, options);
   }

   /**
    * Декорирумая стратегия
    */
   get source(): AbstractStrategy {
      return this._options.source;
   }

   /**
    * Пользовательские методы сортировки
    */
   set handlers(value: SortFunction[]) {
      if (!(value instanceof Array)) {
         throw new TypeError('Option "handlers" should be an instance of Array');
      }
      this._options.handlers = value;
   }

   //endregion

   //region IItemsStrategy

   readonly '[Types/_display/IItemsStrategy]': boolean = true;

   get options(): IAbstractOptions {
      return this.source.options;
   }

   get count(): number {
      return this.source.count;
   }

   get items(): Array<CollectionItem> {
      let items = this.source.items;
      let itemsOrder = this._getItemsOrder();

      return itemsOrder.map((index) => items[index]);
   }

   at(index: number): CollectionItem {
      let itemsOrder = this._getItemsOrder();
      let sourceIndex = itemsOrder[index];

      return this.source.at(sourceIndex);
   }

   splice(start: number, deleteCount: number, added?: Array<CollectionItem>): Array<CollectionItem> {
      this._itemsOrder = null;
      return this.source.splice(start, deleteCount, added);
   }

   reset() {
      this._itemsOrder = null;
      return this.source.reset();
   }

   invalidate() {
      this._itemsOrder = null;
      return this.source.invalidate();
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

      return sourceIndex === -1 ? sourceIndex : itemsOrder[sourceIndex];
   }

   //endregion

   //region SerializableMixin

   protected _getSerializableState(state) {
      state = SerializableMixin.prototype._getSerializableState.call(this, state);

      state.$options = this._options;
      state._itemsOrder = this._itemsOrder;

      //If some handlers are defined force calc order because handlers can be lost during serialization
      if (!state._itemsOrder && this._options.handlers.length) {
         state._itemsOrder = this._getItemsOrder();
      }

      return state;
   }

   protected _setSerializableState(state) {
      let fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
      return function() {
         this._itemsOrder = state._itemsOrder;
         fromSerializableMixin.call(this);
      };
   }

   //endregion

   //region Protected

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
    * Создает соответствие индексов в стратегии оригинальным индексам
    * @protected
    * @return {Array.<Number>}
    */
   protected _createItemsOrder(): Array<number> {
      let items = this.source.items;
      let current = items.map((item, index) => index);

      return User.sortItems(
         items,
         current,
         this._options && this._options.handlers || []
      );
   }

   //endregion

   //region Statics

   /**
    * Создает индекс сортировки в порядке, определенном набором пользовательских обработчиков
    * @param {Array.<Types/Display/CollectionItem>} items Элементы проекции.
    * @param {Array.<Number>} current Текущий индекс сортировки
    * @param {Array.<Function>} handlers Пользовательские обработчики для Array.prototype.sort
    * @return {Array.<Number>}
    */
   static sortItems(items: CollectionItem[], current: number[], handlers: SortFunction[]): number[] {
      if (!handlers || handlers.length === 0) {
         return current;
      }

      let map = [];
      let sorted = [];
      let index;
      let item;

      //Make utilitary array
      for (let i = 0, count = current.length; i < count; i++) {
         index = current[i];
         item = items[index];
         if (item instanceof GroupItem) {
            //Don't sort groups
            map.push(index);
         } else {
            sorted.push({
               item: item,
               collectionItem: item.getContents(),
               index: index,
               collectionIndex: index
            });
         }
      }

      //Sort utilitary array
      for (let i = handlers.length - 1; i >= 0; i--) {
         sorted.sort(<CompareFunction> handlers[i]);
      }

      //Create map from utilitary array
      for (let index = 0, count = sorted.length; index < count; index++) {
         map.push(sorted[index].collectionIndex);
      }

      return map;
   }

   //endregion
}

User.prototype._moduleName = 'Types/display:itemsStrategy.User';
User.prototype['[Types/_display/itemsStrategy/User]'] = true;
// @ts-ignore
User.prototype._itemsOrder = null;
