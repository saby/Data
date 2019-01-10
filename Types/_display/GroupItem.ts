/// <amd-module name="Types/_display/GroupItem" />
/**
 * Группа элементов
 * @class Types/Display/GroupItem
 * @extends Types/Display/CollectionItem
 * @public
 * @author Мальцев А.А.
 */

import CollectionItem from './CollectionItem';
import di from '../_di';

export default class GroupItem extends CollectionItem /** @lends Types/Display/GroupItem.prototype */{
   /**
    * @cfg {Boolean} Развернута или свернута группа. По умолчанию развернута.
    * @name Types/Display/GroupItem#expanded
    */
   protected _$expanded: boolean;

   constructor(options) {
      super(options);
      this._$expanded = !!this._$expanded;
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
}

GroupItem.prototype._moduleName = 'Types/display:GroupItem';
GroupItem.prototype['[Types/_display/GroupItem]'] = true;
// @ts-ignore
GroupItem.prototype._instancePrefix = 'group-item-';
// @ts-ignore
GroupItem.prototype._$expanded = true;

// Deprecated
GroupItem.prototype['[WS.Data/Display/GroupItem]'] = true;

di.register('Types/display:GroupItem', GroupItem);
