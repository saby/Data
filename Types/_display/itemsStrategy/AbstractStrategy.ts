import IItemsStrategy, {IOptions as IItemsStrategyOptions} from '../IItemsStrategy';
import Collection from '../Collection';
import CollectionItem from '../CollectionItem';
import {DestroyableMixin, SerializableMixin, ISerializableState as IDefaultSerializableState} from '../../entity';
import {IEnumerator} from '../../collection';
import {mixin} from '../../util';

export interface IOptions extends  IItemsStrategyOptions {
   localize?: boolean;
}

export interface ISerializableState extends IDefaultSerializableState {
   _items: CollectionItem[];
}

/**
 * Абстрактная стратегия получения элементов проекции
 * @class Types/_display/ItemsStrategy/Abstract
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_display/IItemsStrategy
 * @mixes Types/_entity/SerializableMixin
 * @author Мальцев А.А.
 */
export default abstract class Abstract extends mixin(
   DestroyableMixin, SerializableMixin
) implements IItemsStrategy /** @lends Types/_display/ItemsStrategy/Abstract.prototype */{
   /**
    * @typedef {Object} Options
    * @property {Boolean} localize Алиас зависимости или конструктора элементов проекции
    * @property {Types/_display/Collection} display Проекция
    */

   /**
    * Элементы проекции
    */
   protected _items: CollectionItem[];

   /**
    * Кэш элементов исходной коллекции
    */
   protected _sourceItems: CollectionItem[];

   /**
    * Опции
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

   get options(): IOptions {
      return {...this._options};
   }

   get source(): IItemsStrategy {
      return null;
   }

   get count(): number {
      throw new Error('Property must be implemented');
   }

   get items(): CollectionItem[] {
      return this._getItems();
   }

   at(index: number): CollectionItem {
      throw new Error('Method must be implemented');
   }

   splice(start: number, deleteCount: number, added?: CollectionItem[]): CollectionItem[] {
      throw new Error('Method must be implemented');
   }

   reset(): void {
      this._items = null;
      this._sourceItems = null;
   }

   invalidate(): void {
      // Could be redefined
   }

   getDisplayIndex(index: number): number {
      return index;
   }

   getCollectionIndex(index: number): number {
      return index;
   }

   // endregion

   // region SerializableMixin

   protected _getSerializableState(state: IDefaultSerializableState): ISerializableState {
      const resultState: ISerializableState = SerializableMixin.prototype._getSerializableState.call(this, state);

      resultState.$options = this._options;
      resultState._items = this._items;

      return resultState;
   }

   protected _setSerializableState(state: ISerializableState): Function {
      const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);

      return function(): void {
         fromSerializableMixin.call(this);
         this._items = state._items;
      };
   }

   // endregion

   // region Protected members

   /**
    * Возвращает исходную коллекцию
    * @return {Types/_collection/IEnumerable}
    * @protected
    */
   protected _getCollection(): Collection {
      return this._options.display.getCollection();
   }

   /**
    * Возвращает энумератор коллекции
    * @return {Types/_collection/IEnumerator}
    * @protected
    */
   protected _getCollectionEnumerator(): IEnumerator<any> {
      return this._getCollection().getEnumerator(this._options.localize);
   }

   /**
    * Возвращает элементы проекции
    * @return Array.<Types/_display/CollectionItem>
    * @protected
    */
   protected _getItems(): CollectionItem[] {
      if (!this._items) {
         this._initItems();
      }
      return this._items;
   }

   /**
    * Инициализирует элементы
    * @protected
    */
   protected _initItems(): void {
      this._items = this._items || [];
      this._items.length = this._options.display.getCollectionCount();
   }

   /**
    * Возвращает элементы исходной коллекции
    * @protected
    */
   protected _getSourceItems(): any[] {
      if (this._sourceItems) {
         return this._sourceItems;
      }

      const enumerator = this._getCollectionEnumerator();
      const items = [];
      enumerator.reset();
      while (enumerator.moveNext()) {
         items.push(enumerator.getCurrent());
      }

      return this._sourceItems = items;
   }

   /**
    * Создает элемент проекции
    * @return Types/_display/CollectionItem
    * @protected
    */
   protected _createItem(contents: any): CollectionItem {
      return this.options.display.createItem({
         contents
      });
   }

   // endregion
}

Object.assign(Abstract.prototype, {
   '[Types/_display/itemsStrategy/DestroyableMixin]': true,
   _moduleName: 'Types/display:itemsStrategy.DestroyableMixin',
   _items: null,
   _sourceItems: null
});
