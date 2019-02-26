/// <amd-module name="Types/_display/itemsStrategy/Search" />
/**
 * Стратегия-декоратор для объединения развернутых узлов в "хлебную крошку"
 * @class Types/_display/ItemsStrategy/Search
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_display/IItemsStrategy
 * @mixes Types/_entity/SerializableMixin
 * @author Мальцев А.А.
 */

import IItemsStrategy, {IOptions as IItemsStrategyOptions} from '../IItemsStrategy';
import Collection from '../Collection';
import CollectionItem from '../CollectionItem';
import BreadcrumbsItem from '../BreadcrumbsItem';
import {DestroyableMixin, SerializableMixin, ISerializableState} from '../../entity';
import {mixin} from '../../util';

interface IOptions {
   source: IItemsStrategy;
}

interface ISortOptions {
   display: Collection;
}

export default class Search extends mixin(
   DestroyableMixin, SerializableMixin
) implements IItemsStrategy /** @lends Types/_display/ItemsStrategy/Search.prototype */ {
   /**
    * @typedef {Object} Options
    * @property {Types/_display/ItemsStrategy/Abstract} source Декорирумая стратегия
    */

   /**
    * Опции конструктора
    */
   protected _options: IOptions;

   /**
    * Конструктор
    * @param {Options} options Опции
    */
   constructor(options: IOptions) {
      super();
      this._options = options;
   }

   // region IItemsStrategy

   readonly '[Types/_display/IItemsStrategy]': boolean = true;

   get options(): IItemsStrategyOptions {
      return this.source.options;
   }

   get source(): IItemsStrategy {
      return this._options.source;
   }

   get count(): number {
      return this._getItems().length;
   }

   get items(): CollectionItem[] {
      return this._getItems();
   }

   at(index: number): CollectionItem {
      return this._getItems()[index];
   }

   splice(start: number, deleteCount: number, added?: CollectionItem[]): CollectionItem[] {
      return this.source.splice(start, deleteCount, added);
   }

   reset(): void {
      return this.source.reset();
   }

   invalidate(): void {
      return this.source.invalidate();
   }

   getDisplayIndex(index: number): number {
      const sourceIndex = this.source.getDisplayIndex(index);
      const sourceItem = this.source.items[sourceIndex];
      const items = this._getItems();
      const itemIndex = items.indexOf(sourceItem);

      return itemIndex === -1 ? items.length : itemIndex;
   }

   getCollectionIndex(index: number): number {
      const items = this._getItems();
      const item = items[index];
      const sourceIndex = this.source.items.indexOf(item);

      return sourceIndex >= 0 ? this.source.getCollectionIndex(sourceIndex) : -1;
   }

   // endregion

   // region SerializableMixin

   protected _getSerializableState(state: ISerializableState): ISerializableState {
      const resultState = SerializableMixin.prototype._getSerializableState.call(this, state);

      resultState.$options = this._options;

      return resultState;
   }

   protected _setSerializableState(state: ISerializableState): Function {
      const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
      return function(): void {
         fromSerializableMixin.call(this);
      };
   }

   // endregion

   // region Protected

   /**
    * Возвращает элементы проекции
    * @return Array.<Types/_display/CollectionItem>
    * @protected
    */
   protected _getItems(): CollectionItem[] {
      return Search.sortItems(this.source.items, {
         display: this.options.display as Collection
      });
   }

   // endregion

   // region Statics

   /**
    * Создает индекс сортировки, объединяющий хлебные крошки в один элемент
    * @param {Array.<Types/_display/CollectionItem>} items Элементы проекции.
    * @param {Object} options Опции
    * @param {Types/_display/Collection} options.display Проекция
    * @return {Array.<Types/_display/CollectionItem>}
    * @static
    */
   static sortItems(items: CollectionItem[], options: ISortOptions): CollectionItem[] {
      const display = options.display;
      const dump = {};
      let currentBreadcrumbs = null;

      const isNode = (item: any): boolean => item && item.isNode ? item.isNode() : false;

      return items.map((item, index) => {
         const next = items[index + 1];
         const itemIsNode = isNode(item);
         const nextIsNode = isNode(next);

         if (itemIsNode) {
            const isLastBreadcrumb = nextIsNode ? item.getLevel() >= next.getLevel() : true;
            if (isLastBreadcrumb) {
               currentBreadcrumbs = new BreadcrumbsItem({
                  owner: display,
                  last: item
               });

               return currentBreadcrumbs;
            }

            currentBreadcrumbs = null;
            return dump;
         }

         item.setParent(currentBreadcrumbs);
         return item;
      }).filter((item) => {
         return item !== dump;
      });
   }

   // endregion
}

Search.prototype._moduleName = 'Types/display:itemsStrategy.Search';
Search.prototype['[Types/_display/itemsStrategy/Search]'] = true;
