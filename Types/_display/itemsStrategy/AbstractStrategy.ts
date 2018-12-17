/// <amd-module name="Types/_display/itemsStrategy/AbstractStrategy" />
/**
 * Абстрактная стратегия получения элементов проекции
 * @class Types/Display/ItemsStrategy/Abstract
 * @mixes Types/Entity/DestroyableMixin
 * @implements Types/Display/IItemsStrategy
 * @mixes Types/Entity/SerializableMixin
 * @author Мальцев А.А.
 */

import IItemsStrategy, {IOptions as IItemsStrategyOptions} from '../IItemsStrategy';
import Collection from '../Collection';
import CollectionItem from '../CollectionItem';
import {DestroyableMixin, SerializableMixin} from '../../entity';
import {IEnumerable, IEnumerator} from '../../collection';
import {mixin} from '../../util';

export interface IOptions extends  IItemsStrategyOptions {
   localize?: boolean
}

export default abstract class Abstract extends mixin(
   DestroyableMixin, SerializableMixin
) implements IItemsStrategy /** @lends Types/Display/ItemsStrategy/Abstract.prototype */{
   /**
    * @typedef {Object} Options
    * @property {Boolean} localize Алиас зависимости или конструктора элементов проекции
    * @property {Types/Display/Collection} display Проекция
    */

   /**
    * Элементы проекции
    */
   protected _items: Array<CollectionItem>;

   /**
    * Кэш элементов исходной коллекции
    */
   protected _sourceItems: Array<CollectionItem>;

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

   //region IItemsStrategy

   readonly '[Types/_display/IItemsStrategy]': boolean = true;

   get options(): IOptions {
      return Object.assign({}, this._options);
   }

   get source() {
      return null;
   }

   get count(): number {
      throw new Error('Property must be implemented');
   }

   get items(): Array<CollectionItem> {
      return this._getItems();
   }

   at(index: number): CollectionItem {
      throw new Error('Method must be implemented');
   }

   splice(start: number, deleteCount: number, added?: Array<CollectionItem>): Array<CollectionItem> {
      throw new Error('Method must be implemented');
   }

   reset() {
      this._items = null;
      this._sourceItems = null;
   }

   invalidate() {
   }

   getDisplayIndex(index: number): number {
      return index;
   }

   getCollectionIndex(index: number): number {
      return index;
   }

   //endregion

   //region SerializableMixin

   protected _getSerializableState(state) {
      state = SerializableMixin.prototype._getSerializableState.call(this, state);

      state.$options = this._options;
      state._items = this._items;

      return state;
   }

   protected _setSerializableState(state) {
      let fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);

      return function() {
         fromSerializableMixin.call(this);
         this._items = state._items;
      };
   }

   //endregion

   //region Protected members

   /**
    * Возвращает исходную коллекцию
    * @return {Types/Collection/IEnumerable}
    * @protected
    */
   protected _getCollection(): Collection {
      return this._options.display.getCollection();
   }

   /**
    * Возвращает энумератор коллекции
    * @return {Types/Collection/IEnumerator}
    * @protected
    */
   protected _getCollectionEnumerator(): IEnumerator<any> {
      return this._getCollection().getEnumerator(this._options.localize);
   }

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
    * Инициализирует элементы
    * @protected
    */
   protected _initItems() {
      this._items = this._items || [];
      this._items.length = this._options.display.getCollectionCount();
   }

   /**
    * Возвращает элементы исходной коллекции
    * @protected
    */
   protected _getSourceItems(): Array<any> {
      if (this._sourceItems) {
         return this._sourceItems;
      }

      let enumerator = this._getCollectionEnumerator();
      let items = [];
      enumerator.reset();
      while (enumerator.moveNext()) {
         items.push(enumerator.getCurrent());
      }

      return this._sourceItems = items;
   }

   /**
    * Создает элемент проекции
    * @return Types/Display/CollectionItem
    * @protected
    */
   protected _createItem(contents: any): CollectionItem {
      return this.options.display.createItem({
         contents: contents
      });
   }

   //endregion
}

Abstract.prototype._moduleName = 'Types/display:itemsStrategy.DestroyableMixin';
Abstract.prototype['[Types/_display/itemsStrategy/DestroyableMixin]'] = true;
// @ts-ignore
Abstract.prototype._items = null;
// @ts-ignore
Abstract.prototype._sourceItems = null;
