import CollectionItem, {IOptions as ICollectionItemOptions} from './CollectionItem';
import TreeItem from './TreeItem';
import Tree from './Tree';
import {register} from '../di';

export interface IOptions<T> extends ICollectionItemOptions<T> {
   last: CollectionItem<T>;
}

/**
 * Хлебная крошка
 * @class Types/_display/BreadcrumbsItem
 * @extends Types/_display/CollectionItem
 * @public
 * @author Мальцев А.А.
 */
export default class BreadcrumbsItem<T> extends CollectionItem<T> {
   protected _instancePrefix: 'breadcrumbs-item-';
   protected _$owner: Tree<T>;

   /**
    * Последний элемент хлебной крошки
    */
   protected _$last: TreeItem<T>;

   constructor(options: IOptions<T>) {
      super(options);
   }

   // region Public methods

   getContents(): T {
      const root = this._$owner ? this._$owner.getRoot() : {};
      let current = this._$last;
      const contents = [];

      // Go up from last item until end
      while (current) {
         contents.unshift(current.getContents());
         current = current.getParent();
         if (current === root) {
            break;
         }
      }

      return contents as any as T;
   }

   setContents(): void {
      throw new ReferenceError('BreadcrumbsItem contents is read only.');
   }

   // endregion
}

Object.assign(BreadcrumbsItem.prototype, {
   '[Types/_display/BreadcrumbsItem]': true,
   _moduleName: 'Types/display:BreadcrumbsItem',
   _$last: null
});

register('Types/display:BreadcrumbsItem', BreadcrumbsItem);
