/// <amd-module name="Types/_display/itemsStrategy/Direct" />
/**
 * Стратегия получения элементов проекции напрямую по коллекции
 * @class Types/_display/ItemsStrategy/Direct
 * @extends Types/_display/ItemsStrategy/Abstract
 * @author Мальцев А.А.
 */

import AbstractStrategy, {IOptions as IAbstractOptions} from './AbstractStrategy';
import CollectionItem from '../CollectionItem';
import {object} from '../../util';
import {Set} from '../../shim';

interface IOptions extends IAbstractOptions {
   unique: boolean
   idProperty: string
}

interface ISortOptions {
   unique: boolean
   idProperty: string
}

export default class Direct extends AbstractStrategy /** @lends Types/_display/ItemsStrategy/Direct.prototype */{
   protected _options: IOptions;

   /**
    * Индекс в в стратегии -> оригинальный индекс
    */
   protected _itemsOrder: Array<number>;

   /**
    * @typedef {Object} Options
    * @property {Types/_display/Collection} display Проекция
    * @property {Boolean} unique Признак обеспечения уникальности элементов
    * @property {String} idProperty Название свойства элемента коллекции, содержащего его уникальный идентификатор
    */

   constructor(options: IOptions) {
      super(options);
   }

   /**
    * Устанавливает признак обеспечения уникальности элементов
    */
   set unique(value: boolean) {
      this._options.unique = value;
   }

   //region IItemsStrategy

   get count(): number {
      return this._getItemsOrder().length;
   }

   get items(): Array<CollectionItem> {
      let items = this._getItems();
      let itemsOrder = this._getItemsOrder();

      return itemsOrder.map((position) => items[position]);
   }

   at(index: number): CollectionItem {
      let items = this._getItems();
      let itemsOrder = this._getItemsOrder();
      let position = itemsOrder[index];

      if (position === undefined) {
         throw new ReferenceError(`Display index ${index} is out of bounds.`);
      }

      return items[position];
   }

   splice(start: number, deleteCount: number, added?: Array<CollectionItem | any>): Array<CollectionItem> {
      added = added || [];

      let reallyAdded = added.map(
         (contents) => contents instanceof CollectionItem ? contents : this._createItem(contents)
      );
      let result = this._getItems().splice(start, deleteCount, ...reallyAdded);

      this._itemsOrder = null;

      return result;
   }

   reset() {
      super.reset();
      this._itemsOrder = null;
   }

   invalidate() {
      super.invalidate();
      this._itemsOrder = null;
   }

   getDisplayIndex(index: number): number {
      let itemsOrder = this._getItemsOrder();
      let itemIndex = itemsOrder.indexOf(index);

      return itemIndex === -1 ? itemsOrder.length : itemIndex;
   }

   getCollectionIndex(index: number): number {
      let itemsOrder = this._getItemsOrder();
      let itemIndex = itemsOrder[index];
      return itemIndex === undefined ? -1 : itemIndex;
   }

   //endregion

   //region SerializableMixin

   protected _getSerializableState(state) {
      state = super._getSerializableState(state);

      state._itemsOrder = this._itemsOrder;

      return state;
   }

   protected _setSerializableState(state) {
      let fromSuper = super._setSerializableState(state);
      return function() {
         this._itemsOrder = state._itemsOrder;
         fromSuper.call(this);
      };
   }

   //endregion

   //region Protected

   protected _initItems() {
      super._initItems();

      let items = this._items;
      let sourceItems = this._getSourceItems();
      let count = items.length;
      for (let index = 0; index < count; index++) {
         items[index] = this._createItem(sourceItems[index]);
      }
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

   protected _createItemsOrder(): Array<number> {
      return Direct.sortItems(this._getItems(), {
         idProperty: this._options.idProperty,
         unique: this._options.unique
      });
   }

   //endregion

   //region Statics

   /**
    * Создает индекс сортировки в том же порядке, что и коллекция
    * @param {Array.<Types/_display/CollectionItem>} items Элементы проекции.
    * @param {Array.<Number>} current Текущий индекс сортировки
    * @param {Object} options Опции
    * @return {Array.<Number>}
    */
   static sortItems(items: Array<CollectionItem>, options: ISortOptions): Array<number> {
      let idProperty = options.idProperty;

      if (!options.unique || !idProperty) {
         return items.map((item, index) => index);
      }

      let processed = new Set();
      let result = [];
      let itemId;

      items.forEach((item, index) => {
         itemId = object.getPropertyValue(
            item.getContents(),
            idProperty
         );

         if (processed.has(itemId)) {
            return;
         }

         processed.add(itemId);
         result.push(index);
      });

      return result;
   }

   //endregion
}

Direct.prototype._moduleName = 'Types/display:itemsStrategy.Direct';
Direct.prototype['[Types/_display/itemsStrategy/Direct]'] = true;
// @ts-ignore
Direct.prototype._itemsOrder = null;
