import CollectionItem, {
   IOptions as ICollectionItemOptions,
   ISerializableState as IDefaultSerializableState
} from './CollectionItem';
import {register} from '../di';

export interface IOptions extends ICollectionItemOptions {
   node?: boolean;
   expanded?: boolean;
   hasChildren?: boolean;
   loaded?: boolean;
   parent?: Function;
}

interface ISerializableState extends IDefaultSerializableState {
   $options: IOptions;
}

/**
 * Элемент дерева
 * @class Types/_display/TreeItem
 * @extends Types/_display/CollectionItem
 * @public
 * @author Мальцев А.А.
 */
export default class TreeItem extends CollectionItem /** @lends Types/_display/TreeItem.prototype */{
   /**
    * Родительский узел
    */
   protected _$parent: TreeItem;

   /**
    * Является узлом
    */
   protected _$node: boolean;

   /**
    * Развернут или свернут узел. По умолчанию свернут.
    */
   protected _$expanded: boolean;

   /**
    * Есть ли дети у узла. По умолчанию есть.
    */
   protected _$hasChildren: boolean;

   /**
    * Название свойства, содержащего дочерние элементы узла. Используется для анализа на наличие дочерних элементов.
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

   // region Public methods

   /**
    * Возвращает родительский узел
    */
   getParent(): TreeItem {
      return this._$parent;
   }

   /**
    * Устанавливает родительский узел
    * @param parent Новый родительский узел
    */
   setParent(parent: TreeItem): void {
      this._$parent = parent;
   }

   /**
    * Возвращает корневой элемент дерева
    */
   getRoot(): TreeItem {
      const parent = this.getParent();
      if (parent === this) {
         return;
      }
      return parent ? parent.getRoot() : this;
   }

   /**
    * Является ли корнем дерева
    */
   isRoot(): boolean {
      return !this.getParent();
   }

   /**
    * Возвращает уровень вложенности относительно корня
    */
   getLevel(): number {
      const parent = this.getParent();
      if (parent) {
         return (parent instanceof TreeItem ? parent.getLevel() : 0) + 1;
      }

      const owner = this.getOwner();
      return owner && owner.isRootEnumerable() ? 1 : 0;
   }

   /**
    * Возвращает признак, является ли элемент узлом
    */
   isNode(): boolean {
      return this._$node;
   }

   /**
    * Устанавливает признак, является ли элемент узлом
    * @param node Является ли элемент узлом
    */
   setNode(node: boolean): void {
      this._$node = node;
   }

   /**
    * Возвращает признак, что узел развернут
    */
   isExpanded(): boolean {
      return this._$expanded;
   }

   /**
    * Устанавливает признак, что узел развернут или свернут
    * @param expanded Развернут или свернут узел
    * @param [silent=false] Не генерировать событие
    */
   setExpanded(expanded: boolean, silent?: boolean): void {
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
   toggleExpanded(): void {
      this.setExpanded(!this.isExpanded());
   }

   /**
    * Возвращает признак наличия детей у узла
    */
   isHasChildren(): boolean {
      return this._$hasChildren;
   }

   /**
    * Устанавливает признак наличия детей у узла
    */
   setHasChildren(value: boolean): void {
      this._$hasChildren = value;
   }

   isLoaded(): boolean {
      return !this._$hasChildren;
   }

   setLoaded(value: boolean): void {
      this._$hasChildren = !value;
   }

   /**
    * Возвращает название свойства, содержащего дочерние элементы узла
    */
   getChildrenProperty(): string {
      return this._$childrenProperty;
   }

   // region SerializableMixin

   protected _getSerializableState(state: IDefaultSerializableState): ISerializableState {
      const resultState = super._getSerializableState(state) as ISerializableState;

      // It's too hard to serialize context related method. It should be restored at class that injects this function.
      if (typeof resultState.$options.parent === 'function') {
         delete resultState.$options.parent;
      }

      return resultState;
   }

   protected _setSerializableState(state: ISerializableState): Function {
      const fromSuper = super._setSerializableState(state);
      return function(): void {
         fromSuper.call(this);
      };
   }

   // endregion

   // region Protected methods

   /**
    * Генерирует событие у владельца об изменении свойства элемента.
    * Помимо родительской коллекции уведомляет также и корневой узел дерева.
    * @param property Измененное свойство
    * @protected
    */
   protected _notifyItemChangeToOwner(property: string): void {
      super._notifyItemChangeToOwner(property);

      const root = this.getRoot();
      const rootOwner = root ? root.getOwner() : undefined;
      if (rootOwner && rootOwner !== this._$owner) {
         rootOwner.notifyItemChange(this, property);
      }
   }

   // endregion
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
