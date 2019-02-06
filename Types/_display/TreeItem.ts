/// <amd-module name="Types/_display/TreeItem" />
/**
 * Элемент дерева
 * @class Types/_display/TreeItem
 * @extends Types/_display/CollectionItem
 * @public
 * @author Мальцев А.А.
 */

import CollectionItem, {IOptions as ICollectionItemOptions} from './CollectionItem';
import {register} from '../di';

export interface IOptions extends ICollectionItemOptions {
   node?: boolean;
   expanded?: boolean;
   hasChildren?: boolean;
   loaded?: boolean;
}

export default class TreeItem extends CollectionItem /** @lends Types/_display/TreeItem.prototype */{
   /**
    * @cfg {Types/_display/TreeItem} Родительский узел
    * @name Types/_display/TreeItem#parent
    */
   protected _$parent: TreeItem;

   /**
    * @cfg {Boolean} Является узлом
    * @name Types/_display/TreeItem#node
    */
   protected _$node: boolean;

   /**
    * @cfg {Boolean} Развернут или свернут узел. По умолчанию свернут.
    * @name Types/_display/TreeItem#expanded
    */
   protected _$expanded: boolean;

   /**
    * @cfg {Boolean} Есть ли дети у узла. По умолчанию есть.
    * @name Types/_display/TreeItem#hasChildren
    */
   protected _$hasChildren: boolean;

   /**
    * @cfg {String} Название свойства, содержащего дочерние элементы узла. Используется для анализа на наличие дочерних элементов.
    * @name Types/_display/TreeItem#childrenProperty
    */
   protected _$childrenProperty: string;

   constructor(options: IOptions) {
      super(options);

      if (options && !options.hasOwnProperty('hasChildren') && options.hasOwnProperty('loaded')) {
         this._$hasChildren = !options.loaded;
      }

      this._$node = !!this._$node;
      this._$expanded = !!this._$expanded;
      this._$hasChildren = !!this._$hasChildren;
   }

   //region Types/_entity/SerializableMixin

   protected _getSerializableState(state) {
      state =  super._getSerializableState(state);

      //It's too hard to serialize context related method. It should be restored at class that injects this function.
      if (typeof state.$options.parent === 'function') {
         delete state.$options.parent;
      }

      return state;
   }

   protected _setSerializableState(state) {
      let fromSuper = super._setSerializableState(state);
      return function() {
         fromSuper.call(this);
      };
   }

   //endregion Types/_entity/SerializableMixin

   //region Public methods

   /**
    * Возвращает родительский узел
    * @return {Types/_display/TreeItem}
    */
   getParent(): TreeItem {
      return this._$parent;
   }

   /**
    * Устанавливает родительский узел
    * @param {Types/_display/TreeItem} parent Новый родительский узел
    */
   setParent(parent: TreeItem) {
      this._$parent = parent;
   }

   /**
    * Возвращает корневой элемент дерева
    * @return {Types/_display/TreeItem}
    */
   getRoot(): TreeItem {
      let parent = this.getParent();
      if (parent === this) {
         return;
      }
      return parent ? parent.getRoot() : this;
   }

   /**
    * Является ли корнем дерева
    * @return {Boolean}
    */
   isRoot(): boolean {
      return !this.getParent();
   }

   /**
    * Возвращает уровень вложенности относительно корня
    * @return {Number}
    */
   getLevel(): number {
      let parent = this.getParent();
      if (parent) {
         return (parent instanceof TreeItem ? parent.getLevel() : 0) + 1;
      }

      let owner = this.getOwner();
      return owner && owner.isRootEnumerable() ? 1 : 0;
   }

   /**
    * Возвращает признак, является ли элемент узлом
    * @return {Boolean}
    */
   isNode(): boolean {
      return this._$node;
   }

   /**
    * Устанавливает признак, является ли элемент узлом
    * @param {Boolean} node Является ли элемент узлом
    */
   setNode(node: boolean) {
      this._$node = node;
   }

   /**
    * Возвращает признак, что узел развернут
    * @return {Boolean}
    */
   isExpanded(): boolean {
      return this._$expanded;
   }

   /**
    * Устанавливает признак, что узел развернут или свернут
    * @param {Boolean} expanded Развернут или свернут узел
    * @param {Boolean} [silent=false] Не генерировать событие
    */
   setExpanded(expanded: boolean, silent?: boolean) {
      if (this._$expanded === expanded) {
         return;
      }
      this._$expanded = expanded;
      if (!silent) {
         this._notifyItemChangeToOwner('expanded');
      }
   }

   /**
    * Переключает признак, что узел развернут или свернут
    */
   toggleExpanded() {
      this.setExpanded(!this.isExpanded());
   }

   /**
    * Возвращает признак наличия детей у узла
    * @return {Boolean}
    */
   isHasChildren(): boolean {
      return this._$hasChildren;
   }

   /**
    * Устанавливает признак наличия детей у узла
    * @param {Boolean} value
    */
   setHasChildren(value: boolean) {
      this._$hasChildren = value;
   }

   isLoaded(): boolean {
      return !this._$hasChildren;
   }

   setLoaded(value: boolean) {
      this._$hasChildren = !value;
   }

   /**
    * Возвращает название свойства, содержащего дочерние элементы узла
    * @return {String}
    */
   getChildrenProperty(): string {
      return this._$childrenProperty;
   }

   //endregion

   //region Protected methods

   /**
    * Генерирует событие у владельца об изменении свойства элемента.
    * Помимо родительской коллекции уведомляет также и корневой узел дерева.
    * @param {String} property Измененное свойство
    * @protected
    */
   protected _notifyItemChangeToOwner(property: string) {
      super._notifyItemChangeToOwner(property);

      let root = this.getRoot();
      let rootOwner = root ? root.getOwner() : undefined;
      if (rootOwner && rootOwner !== this._$owner) {
         rootOwner.notifyItemChange(this, property);
      }
   }

   //endregion
}

Object.assign(TreeItem.prototype, {
   '[Types/_display/TreeItem]': true,
   _moduleName: 'Types/display:TreeItem',
   _$parent: undefined,
   _$node: false,
   _$expanded: false,
   _$hasChildren: true,
   _$childrenProperty: '',
   _instancePrefix: 'tree-item-'
});

// FIXME: deprecated
TreeItem.prototype['[WS.Data/Display/TreeItem]'] = true;

register('Types/display:TreeItem', TreeItem);
