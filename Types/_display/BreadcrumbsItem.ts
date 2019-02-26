/// <amd-module name="Types/_display/BreadcrumbsItem" />
/**
 * Хлебная крошка
 * @class Types/_display/BreadcrumbsItem
 * @extends Types/_display/CollectionItem
 * @public
 * @author Мальцев А.А.
 */

import CollectionItem, {IOptions as ICollectionItemOptions} from './CollectionItem';
import {register} from '../di';

export interface IOptions extends ICollectionItemOptions {
   last: CollectionItem;
}

export default class BreadcrumbsItem extends CollectionItem /** @lends Types/_display/BreadcrumbsItem.prototype */{
   _instancePrefix: 'breadcrumbs-item-';

   /**
    * @cfg {Types/_collection/TreeItem} Последний элемент хлебной крошки
    * @name Types/_display/BreadcrumbsItem#last
    */
   protected _$last: CollectionItem;

   constructor(options: IOptions) {
      super(options);
   }

   // region Public methods

   getContents(): any[] {
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

      return contents;
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
