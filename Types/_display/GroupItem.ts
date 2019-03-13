/**
 * Группа элементов
 * @class Types/_display/GroupItem
 * @extends Types/_display/CollectionItem
 * @public
 * @author Мальцев А.А.
 */

import CollectionItem from './CollectionItem';
import {register} from '../di';

export default class GroupItem extends CollectionItem /** @lends Types/_display/GroupItem.prototype */{
   /**
    * @cfg {Boolean} Развернута или свернута группа. По умолчанию развернута.
    * @name Types/_display/GroupItem#expanded
    */
   protected _$expanded: boolean;

   constructor(options?: object) {
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
}

Object.assign(GroupItem.prototype, {
   '[Types/_display/GroupItem]': true,
   _moduleName: 'Types/display:GroupItem',
   _instancePrefix: 'group-item-',
   _$expanded: true
});

// FIXME: deprecated
GroupItem.prototype['[WS.Data/Display/GroupItem]'] = true;

register('Types/display:GroupItem', GroupItem);
