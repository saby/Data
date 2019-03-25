import IItemsStrategy, {IOptions as IItemsStrategyOptions} from '../IItemsStrategy';
import Tree from '../Tree';
import TreeItem from '../TreeItem';
import BreadcrumbsItem from '../BreadcrumbsItem';
import {DestroyableMixin, SerializableMixin, ISerializableState} from '../../entity';
import {mixin} from '../../util';

interface IOptions<S, T> {
   source: IItemsStrategy<S, T>;
}

interface ISortOptions<S, T> {
   display: Tree<S, T>;
}

/**
 * Стратегия-декоратор для объединения развернутых узлов в "хлебную крошку"
 * @class Types/_display/ItemsStrategy/Search
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_display/IItemsStrategy
 * @mixes Types/_entity/SerializableMixin
 * @author Мальцев А.А.
 */
export default class Search<S, T> extends mixin<
   DestroyableMixin,
   SerializableMixin
>(
   DestroyableMixin,
   SerializableMixin
) implements IItemsStrategy<S, T> {
   /**
    * @typedef {Object} Options
    * @property {Types/_display/ItemsStrategy/Abstract} source Декорирумая стратегия
    */

   /**
    * Опции конструктора
    */
   protected _options: IOptions<S, T>;

   constructor(options: IOptions<S, T>) {
      super();
      this._options = options;
   }

   // region IItemsStrategy

   readonly '[Types/_display/IItemsStrategy]': boolean = true;

   get options(): IItemsStrategyOptions<S, T> {
      return this.source.options;
   }

   get source(): IItemsStrategy<S, T> {
      return this._options.source;
   }

   get count(): number {
      return this._getItems().length;
   }

   get items(): T[] {
      return this._getItems();
   }

   at(index: number): T {
      return this._getItems()[index];
   }

   splice(start: number, deleteCount: number, added?: S[]): T[] {
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

   _getSerializableState(state: ISerializableState): ISerializableState {
      const resultState = SerializableMixin.prototype._getSerializableState.call(this, state);

      resultState.$options = this._options;

      return resultState;
   }

   _setSerializableState(state: ISerializableState): Function {
      const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
      return function(): void {
         fromSerializableMixin.call(this);
      };
   }

   // endregion

   // region Protected

   /**
    * Возвращает элементы проекции
    * @protected
    */
   protected _getItems(): T[] {
      return Search.sortItems<S, T>(this.source.items, {
         display: this.options.display as Tree<S, T>
      });
   }

   // endregion

   // region Statics

   /**
    * Создает индекс сортировки, объединяющий хлебные крошки в один элемент
    * @param items Элементы проекции.
    * @param options Опции
    * @static
    */
   static sortItems<S, T>(items: T[], options: ISortOptions<S, T>): T[] {
      const display = options.display;
      const dump = {};
      let currentBreadcrumbs = null;

      const isNode = (item: any): boolean => item && item.isNode ? item.isNode() : false;

      return items.map((item, index) => {
         const next = items[index + 1];
         const itemIsNode = isNode(item);
         const nextIsNode = isNode(next);

         if (item instanceof TreeItem) {
            if (itemIsNode && next instanceof TreeItem) {
               const isLastBreadcrumb = nextIsNode ? item.getLevel() >= next.getLevel() : true;
               if (isLastBreadcrumb) {
                  currentBreadcrumbs = new BreadcrumbsItem<S>({
                     contents: null,
                     owner: display as any,
                     last: item
                  });

                  return currentBreadcrumbs;
               }

               currentBreadcrumbs = null;
               return dump;
            }

            item.setParent(currentBreadcrumbs);
         }

         return item;
      }).filter((item) => {
         return item !== dump;
      });
   }

   // endregion
}

Object.assign(Search.prototype, {
   '[Types/_display/itemsStrategy/Search]': true,
   _moduleName: 'Types/display:itemsStrategy.Search'
});
