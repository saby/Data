/// <amd-module name="Types/_display/BreadcrumbsItem" />
/**
 * Хлебная крошка
 * @class Types/Display/BreadcrumbsItem
 * @extends Types/Display/CollectionItem
 * @public
 * @author Мальцев А.А.
 */

import CollectionItem, {IOptions as ICollectionItemOptions} from './CollectionItem';
import TreeItem from './TreeItem';
import {register} from '../di';

export interface IOptions extends ICollectionItemOptions {
   last: CollectionItem;
}

export default class BreadcrumbsItem extends CollectionItem /** @lends Types/Display/BreadcrumbsItem.prototype */{
   _instancePrefix: 'breadcrumbs-item-';

   /**
    * @cfg {Types/Collection/TreeItem} Последний элемент хлебной крошки
    * @name Types/Display/BreadcrumbsItem#last
    */
   protected _$last: CollectionItem;

   constructor(options: IOptions) {
      super(options);
   }

   // region Public methods

   getContents() {
      const root = this._$owner ? this._$owner.getRoot() : {};
      let current = this._$last;
      let contents = [];

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

   setContents() {
      throw new ReferenceError('BreadcrumbsItem contents is read only.');
   }

   // endregion
}

BreadcrumbsItem.prototype._moduleName = 'Types/display:BreadcrumbsItem';
BreadcrumbsItem.prototype['[Types/_display/BreadcrumbsItem]'] = true;
// @ts-ignore
BreadcrumbsItem.prototype._$last = null;

register('Types/display:BreadcrumbsItem', BreadcrumbsItem);
