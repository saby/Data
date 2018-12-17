/// <amd-module name="Types/_display/itemsStrategy/Root" />
/**
 * Стратегия-декоратор для формирования корня дерева
 * @class Types/Display/ItemsStrategy/Root
 * @mixes Types/Entity/DestroyableMixin
 * @implements Types/Display/IItemsStrategy
 * @mixes Types/Entity/SerializableMixin
 * @author Мальцев А.А.
 */

import IItemsStrategy, {IOptions as IItemsStrategyOptions} from '../IItemsStrategy';
import CollectionItem from '../CollectionItem';
import TreeItem from '../TreeItem';
import {DestroyableMixin, SerializableMixin} from '../../entity';
import {mixin} from '../../util';

interface IOptions {
   source: IItemsStrategy;
   root: Function;
}

export default class Root extends mixin(DestroyableMixin, SerializableMixin) implements IItemsStrategy /** @lends Types/Display/ItemsStrategy/Root.prototype */{
   /**
    * @typedef {Object} Options
    * @property {Types/Display/ItemsStrategy/Abstract} source Декорирумая стратегия
    * @property {Function:Types/Display/TreeItem} root Функция, возвращающая корень дерева
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

   /**
    * Корень дерева
    */
   get root(): TreeItem {
      return this._options.root();
   }

   //region IItemsStrategy

   readonly '[Types/_display/IItemsStrategy]': boolean = true;

   get source(): IItemsStrategy {
      return this._options.source;
   }

   get options(): IItemsStrategyOptions {
      return this.source.options;
   }

   get count(): number {
      return this.source.count + 1;
   }

   get items(): Array<CollectionItem> {
      return [<CollectionItem> this.root].concat(this.source.items);
   }

   at(index: number): CollectionItem {
      if (index === 0) {
         return this.root;
      } else {
         return this.source.at(index - 1);
      }
   }

   splice(start: number, deleteCount: number, added?: Array<CollectionItem>): Array<CollectionItem> {
      return this.source.splice(start, deleteCount, added);
   }

   reset() {
      return this.source.reset();
   }

   invalidate() {
      return this.source.invalidate();
   }

   getDisplayIndex(index: number): number {
      if (isNaN(parseInt(String(index), 10))) {
         return -1;
      }
      index = this.source.getDisplayIndex(index);
      return index === -1 ? index : 1 + index;
   }

   getCollectionIndex(index: number): number {
      return this.source.getCollectionIndex(index - 1);
   }

   //endregion

   //region SerializableMixin

   protected _getSerializableState(state) {
      state = SerializableMixin.prototype._getSerializableState.call(this, state);

      state.$options = this._options;

      return state;
   }

   protected _setSerializableState(state) {
      let fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
      return function() {
         fromSerializableMixin.call(this);
      };
   }

   //endregion
}

Root.prototype._moduleName = 'Types/display:itemsStrategy.Root';
Root.prototype['[Types/_display/itemsStrategy/Root]'] = true;
