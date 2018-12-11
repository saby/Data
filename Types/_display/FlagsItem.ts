/// <amd-module name="Types/_display/FlagsItem" />
/**
 * Элемент коллекции флагов
 * @class Types/Display/FlagsItem
 * @extends Types/Display/CollectionItem
 * @public
 * @author Мальцев А.А.
 */

import CollectionItem from './CollectionItem';
import di from '../di';

export default class FlagsItem extends CollectionItem /** @lends Types/Display/FlagsItem.prototype */{
   isSelected(): boolean {
      return this._$owner.getCollection().get(
         this._$contents, this._$owner.localize
      );
   }

   setSelected(selected: boolean) {
      if (this.isSelected() === selected) {
         return;
      }
      this._$owner.getCollection().set(
         this._$contents, selected, this._$owner.localize
      );
   }
}

FlagsItem.prototype._moduleName = 'Types/display:FlagsItem';
FlagsItem.prototype['[Types/_display/FlagsItem]'] = true;

di.register('Types/display:FlagsItem', FlagsItem);
