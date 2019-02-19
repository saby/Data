/// <amd-module name="Types/_display/Enum" />
/**
 * Проекция типа "Перечисляемое".
 * @class Types/_display/Enum
 * @extends Types/_display/Collection
 * @public
 * @author Ганшнин Ярослав
 */

import CollectionItem from './CollectionItem';
import Collection, {ICollection} from './Collection';
import {IEnum} from '../collection';
import {register} from '../di';

function onSourceChange(event: EventObject, index: number) {
   this.setCurrentPosition(this.getIndexBySourceIndex(index));
}

interface IEnumCollection extends ICollection, IEnum<CollectionItem> {
}

interface IOptions {
}

export default class Enum extends Collection /** @lends Types/_display/Enum.prototype */{
   protected _$collection: IEnumCollection;

   /**
    * Обработчик события об изменении текущего индекса Enum
    */
   protected _onSourceChange: Function;

   constructor(options: IOptions) {
      super(options);

      if (!this._$collection['[Types/_collection/IEnum]']) {
         throw new TypeError(`${this._moduleName}: source collection should implement Types/_collection/IEnum`);
      }

      this._getCursorEnumerator().setPosition(
         this.getIndexBySourceIndex(this._$collection.get() as number)
      );

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

   protected _notifyCurrentChange(newCurrent: CollectionItem, oldCurrent: CollectionItem, newPosition: number, oldPosition: number) {
      let value = null;
      if (newPosition > -1) {
         value = this.getSourceIndexByIndex(newPosition);
      }
      this._$collection.set(value);

      super._notifyCurrentChange(newCurrent, oldCurrent, newPosition, oldPosition);
   }

   protected _getSourceIndex(index) {
      const enumerator = this._$collection.getEnumerator();
      let i = 0;

      if (index > -1) {
         while (enumerator.moveNext()) {
            if (i === index) {
               return enumerator.getCurrentIndex();
            }
            i++;
         }
      }
      return -1;
   }

   protected _getItemIndex(index) {
      const enumerator = this._$collection.getEnumerator();
      let i = 0;

      while (enumerator.moveNext()) {
         if (enumerator.getCurrentIndex() == index) {
            return i;
         }
         i++;
      }
      return -1;
   }
}

Object.assign(Enum.prototype, {
   '[Types/_display/Enum]': true,
   _moduleName: 'Types/display:Enum',
   _localize: true,
   _onSourceChange: null
});

register('Types/display:Enum', Enum);
