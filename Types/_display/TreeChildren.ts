/// <amd-module name="Types/_display/TreeChildren" />
/**
 * Список дочерних элементов узла дерева.
 * @class Types/Display/TreeChildren
 * @extends Types/Collection/List
 * @public
 * @author Мальцев А.А.
 */

import TreeItem from './TreeItem';
import {List} from '../collection';
import {register} from '../di';

interface IOptions {
}

export default class TreeChildren extends List<TreeItem> /** @lends Types/Display/TreeChildren.prototype */{
   /**
    * @cfg {Types/Display/TreeItem} Узел-владелец
    * @name Types/Display/TreeChildren#owner
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
    * @return {Types/Display/TreeItem}
    */
   getOwner() {
      return this._$owner;
   }

}

TreeChildren.prototype['[Types/_display/TreeChildren]'] = true;
TreeChildren.prototype._$owner = null;

register('Types/display:TreeChildren', TreeChildren);
