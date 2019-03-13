/**
 * Элемент коллекции флагов
 * @class Types/_display/FlagsItem
 * @extends Types/_display/CollectionItem
 * @public
 * @author Мальцев А.А.
 */

import CollectionItem from './CollectionItem';
import {register} from '../di';

export default class FlagsItem extends CollectionItem /** @lends Types/_display/FlagsItem.prototype */{
   isSelected(): boolean {
      return this._$owner.getCollection().get(
         this._$contents, this._$owner.localize
      );
   }

   setSelected(selected: boolean): void {
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

register('Types/display:FlagsItem', FlagsItem);
