/// <amd-module name="Types/_display/TreeChildren" />
/**
 * Список дочерних элементов узла дерева.
 * @class Types/_display/TreeChildren
 * @extends Types/_collection/List
 * @public
 * @author Мальцев А.А.
 */

import TreeItem from './TreeItem';
import {List, IListOptions} from '../collection';
import {register} from '../di';

export interface IOptions extends IListOptions<TreeItem> {
   owner?: TreeItem;
}

export default class TreeChildren extends List<TreeItem> /** @lends Types/_display/TreeChildren.prototype */{
   /**
    * @cfg {Types/_display/TreeItem} Узел-владелец
    * @name Types/_display/TreeChildren#owner
    */
   _$owner: TreeItem;

   constructor(options: IOptions) {
      super(options);

      if (!(this._$owner instanceof Object)) {
         throw new TypeError('Tree children owner should be an object');
      }
      if (!(this._$owner instanceof TreeItem)) {
         throw new TypeError('Tree children owner should be an instance of Types/display:TreeItem');
      }
   }

   /**
    * Возвращает узел-владелец
    * @return {Types/_display/TreeItem}
    */
   getOwner(): TreeItem {
      return this._$owner;
   }

}

TreeChildren.prototype['[Types/_display/TreeChildren]'] = true;
TreeChildren.prototype._$owner = null;

register('Types/display:TreeChildren', TreeChildren);
