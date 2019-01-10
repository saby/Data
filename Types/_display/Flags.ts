/// <amd-module name="Types/_display/Flags" />
/**
 * Проекция типа "Флаги".
 * @class Types/Display/Flags
 * @extends Types/Display/Collection
 * @public
 * @author Мальцев А.А.
 */

import Collection from './Collection';
import './FlagsItem';
import di from '../_di';

interface IOptions {
}

/**
 * Обрабатывает событие об изменении состояния Flags
 * @param event Дескриптор события
 * @param name Название флага
 */
function onSourceChange (event: EventObject, name: string) {
   let item = this.getItemBySourceItem(name);
   this.notifyItemChange(item, 'selected');
}

export default class Flags extends Collection /** @lends Types/Display/Flags.prototype */{
   constructor(options: IOptions) {
      super(options);

      if (!this._$collection['[Types/_collection/IFlags]']) {
         throw new TypeError(this._moduleName + ': source collection should implement Types/Type/IFlags');
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

Flags.prototype._moduleName = 'Types/display:Flags';
Flags.prototype['[Types/_display/Flags]'] = true;
// @ts-ignore
Flags.prototype._itemModule = 'Types/display:FlagsItem';
// @ts-ignore
Flags.prototype._localize = true;

di.register('Types/display:Flags', Flags);
