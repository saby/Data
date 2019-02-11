/// <amd-module name="Types/_display/Flags" />
/**
 * Проекция типа "Флаги".
 * @class Types/_display/Flags
 * @extends Types/_display/Collection
 * @public
 * @author Мальцев А.А.
 */

import Collection from './Collection';
import {register} from '../di';
import './FlagsItem';
import {IFlagsValue} from '../collection';

interface IOptions {
}

/**
 * Обрабатывает событие об изменении состояния Flags
 * @param {Core/EventObject} event Дескриптор события
 * @param {String|Array.<boolean|null>} name Название флага
 */
function onSourceChange (event: EventObject, name: string | Array<IFlagsValue>) {
   if (Array.isArray(name)) {
      name.forEach((selected, index) => {
         let item = this.getItemBySourceIndex(index);
         this.notifyItemChange(item, 'selected');
      });
   } else {
      let item = this.getItemBySourceItem(name);
      this.notifyItemChange(item, 'selected');
   }
}

export default class Flags extends Collection /** @lends Types/_display/Flags.prototype */{
   constructor(options: IOptions) {
      super(options);

      if (!this._$collection['[Types/_collection/IFlags]']) {
         throw new TypeError(this._moduleName + ': source collection should implement Types/_collection/IFlags');
      }

      if (this._$collection['[Types/_entity/ObservableMixin]']) {
         this._$collection.subscribe('onChange', this._onSourceChange);
      }
   }

   destroy() {
      if (this._$collection['[Types/_entity/DestroyableMixin]'] &&
         this._$collection['[Types/_entity/ObservableMixin]'] &&
         !this._$collection.destroyed
      ) {
         this._$collection.unsubscribe('onChange', this._onSourceChange);
      }

      super.destroy();
   }

   protected _bindHandlers() {
      super._bindHandlers();

      this._onSourceChange = onSourceChange.bind(this);
   }
}

Object.assign(Flags.prototype, {
   '[Types/_display/Flags]': true,
   _moduleName: 'Types/display:Flags',
   _itemModule: 'Types/display:FlagsItem',
   _localize: true
});

register('Types/display:Flags', Flags);
