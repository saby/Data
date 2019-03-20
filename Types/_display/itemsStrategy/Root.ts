import IItemsStrategy, {IOptions as IItemsStrategyOptions} from '../IItemsStrategy';
import CollectionItem from '../CollectionItem';
import TreeItem from '../TreeItem';
import {DestroyableMixin, SerializableMixin, ISerializableState} from '../../entity';
import {mixin} from '../../util';

interface IOptions {
   source: IItemsStrategy;
   root: Function;
}

/**
 * Стратегия-декоратор для формирования корня дерева
 * @class Types/_display/ItemsStrategy/Root
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_display/IItemsStrategy
 * @mixes Types/_entity/SerializableMixin
 * @author Мальцев А.А.
 */
export default class Root extends mixin(DestroyableMixin, SerializableMixin) implements IItemsStrategy {
   /**
    * @typedef {Object} Options
    * @property {Types/_display/ItemsStrategy/Abstract} source Декорирумая стратегия
    * @property {Function:Types/_display/TreeItem} root Функция, возвращающая корень дерева
    */

   /**
    * Опции конструктора
    */
   protected _options: IOptions;

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

   // region IItemsStrategy

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

   get items(): CollectionItem[] {
      return [<CollectionItem> this.root].concat(this.source.items);
   }

   at(index: number): CollectionItem {
      if (index === 0) {
         return this.root;
      } else {
         return this.source.at(index - 1);
      }
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
      if (isNaN(parseInt(String(index), 10))) {
         return -1;
      }
      index = this.source.getDisplayIndex(index);
      return index === -1 ? index : 1 + index;
   }

   getCollectionIndex(index: number): number {
      return this.source.getCollectionIndex(index - 1);
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
}

Root.prototype._moduleName = 'Types/display:itemsStrategy.Root';
Root.prototype['[Types/_display/itemsStrategy/Root]'] = true;
