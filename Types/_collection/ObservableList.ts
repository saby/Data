/// <amd-module name="Types/_collection/ObservableList" />
/**
 * Список, в котором можно отслеживать изменения.
 * <pre>
 *    define(['Types/Collection/ObservableList', 'Types/Collection/IBind'], function(ObservableList, IBindCollection) {
 *       var list = new ObservableList({
 *          items: [1, 2, 3]
 *       });
 *
 *       list.subscribe('onCollectionChange', function(eventObject, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
 *          if (action == IBindCollection.ACTION_REMOVE){
 *             console.log(oldItems);//[1]
 *             console.log(oldItemsIndex);//0
 *          }
 *       });
 *
 *       list.removeAt(0);
 *    });
 * </pre>
 * @class Types/_collection/ObservableList
 * @extends Types/_collection/List
 * @implements Types/_collection/IBind
 * @implements Types/Mediator/IReceiver
 * @mixes Types/_collection/EventRaisingMixin
 * @public
 * @author Мальцев А.А.
 */

import IObservable from './IObservable';
import List from './List';
import EventRaisingMixin from './EventRaisingMixin';
import {IReceiver} from '../_entity/relation';
import {register} from '../di';
import {mixin} from '../util';

let arraySlice = Array.prototype.slice;

export default class ObservableList<T> extends mixin(
   List,
   IObservable,
   EventRaisingMixin,
) implements IReceiver /** @lends Types/_collection/ObservableList.prototype */{

   /**
    * @property {Number} Количество измененившихся элементов, при превышении которого генерируется одно событие onCollectionChange с ACTION_RESET, вместо нескольких c другими action
    */
   _resetChangesCount: number;

   constructor(options?) {
      super(options);
      EventRaisingMixin.constructor.call(this, options);

      this._publish('onCollectionChange', 'onCollectionItemChange');
   }

   //region List

   assign(items) {
      let oldItems = this._itemsSlice();
      let eventsWasRaised = this._eventRaising;

      this._eventRaising = false;
      super.assign(items);
      this._eventRaising = eventsWasRaised;

      if (oldItems.length > 0 || this._$items.length > 0) {
         this._notifyCollectionChange(
            IObservable.ACTION_RESET,
            this._itemsSlice(),
            0,
            oldItems,
            0
         );
      }
   }

   append(items) {
      let eventsWasRaised = this._eventRaising;

      this._eventRaising = false;
      let count = this.getCount();
      super.append(items);
      this._eventRaising = eventsWasRaised;

      this._notifyCollectionChange(
         IObservable.ACTION_ADD,
         this._itemsSlice(count),
         count,
         [],
         0
      );
   }

   prepend(items) {
      let eventsWasRaised = this._eventRaising;

      this._eventRaising = false;
      let length = this.getCount();
      super.prepend(items);
      this._eventRaising = eventsWasRaised;

      this._notifyCollectionChange(
         IObservable.ACTION_ADD,
         this._itemsSlice(0, this.getCount() - length),
         0,
         [],
         0
      );
   }

   clear() {
      let oldItems = this._$items.slice();
      let eventsWasRaised = this._eventRaising;

      this._eventRaising = false;
      super.clear();
      this._eventRaising = eventsWasRaised;

      this._notifyCollectionChange(
         IObservable.ACTION_RESET,
         this._itemsSlice(),
         0,
         oldItems,
         0
      );
   }

   add(item, at) {
      super.add(item, at);
      at = this._isValidIndex(at) ? at : this.getCount() - 1;
      this._notifyCollectionChange(
         IObservable.ACTION_ADD,
         this._itemsSlice(at, at + 1),
         at,
         [],
         0
      );
   }

   removeAt(index) {
      let item = super.removeAt(index);
      this._notifyCollectionChange(
         IObservable.ACTION_REMOVE,
         [],
         0,
         [item],
         index
      );
      return item;
   }

   replace(item, at) {
      let oldItem = this._$items[at];
      super.replace(item, at);

      //Replace with itself has no effect
      if (oldItem !== item) {
         this._notifyCollectionChange(
            IObservable.ACTION_REPLACE,
            this._itemsSlice(at, at + 1),
            at,
            [oldItem],
            at
         );
      }
   }

   move(from, to) {
      let item = this._$items[from];
      super.move(from, to);

      if (from !== to) {
         this._notifyCollectionChange(
            IObservable.ACTION_MOVE,
            [item],
            to,
            [item],
            from
         );
      }
   }

   //endregion List

   //region IReceiver

   readonly '[Types/_entity/relation/IReceiver]': boolean;

   relationChanged(which: any, route: Array<string>): any {
      let target = which.target;
      let index = this.getIndex(target);
      let data = {};

      if (index > -1) {
         this._reindex(
            '',
            index,
            1
         );
      }

      let name = route[0];
      if (name === undefined) {
         this._notifyItemChange(
            target,
            which.data || {}
         );
      }

      data[index] = target;
      return {
         target: target,
         data: data
      };
   }

   //endregion IReceiver

   //region EventRaisingMixin

   setEventRaising(enabled, analyze) {
      EventRaisingMixin.setEventRaising.call(this, enabled, analyze);

      //Если стрелять событиями до синхронизации то проекция не всегда сможет найти стрельнувший item или найдет не тот
      if (enabled && analyze && this._silentChangedItems) {
         if (this._silentChangedItems.length >= Math.min(this._resetChangesCount, this._$items.length)) {
            //Если изменилось критическое число элементов, то генерируем reset
            this._notifyCollectionChange(
               IObservable.ACTION_RESET,
               this._itemsSlice(),
               0,
               [],
               0
            );
         } else {
            //Собираем изменившиеся элементы в пачки
            EventRaisingMixin._extractPacksByList(
               this,
               this._silentChangedItems,
               (pack, index) => {
                  this._notifyCollectionChange(
                     IObservable.ACTION_CHANGE,
                     pack,
                     index,
                     pack,
                     index
                  );
               }
            );
         }
      }
      delete this._silentChangedItems;
   }

   //endregion EventRaisingMixin

   //region Protected methods

   /**
    * Генерирует событие об изменении элемента
    * @param {*} item Элемент
    * @param {Object} properties Изменившиеся свойства
    */
   _notifyItemChange(item, properties) {
      if (this._isNeedNotifyCollectionItemChange()) {
         let index = this.getIndex(item);
         this._notify(
            'onCollectionItemChange',
            this._$items[index],
            index,
            properties
         );
      }

      if (
         (this.hasEventHandlers('onCollectionItemChange') || this.hasEventHandlers('onCollectionChange')) &&
         !this._eventRaising
      ) {
         if (!this._silentChangedItems) {
            this._silentChangedItems = [];
         }
         this._silentChangedItems.push(item);
      }
   }

   /**
    * Извлекает элементы, входящие в указанный отрезок
    * @param {Number} [begin] Индекс, по которому начинать извлечение.
    * @param {Number} [end] Индекс, по которому заканчивать извлечение.
    * @return {Array}
    * @protected
    */
   _itemsSlice(begin?, end?) {
      return arraySlice.apply(this._$items, arguments);
   }

   /**
    * Возвращает признак, что нужно генерировать события об изменениях элементов коллекции
    * @return {Boolean}
    * @protected
    */
   _isNeedNotifyCollectionItemChange() {
      return this._eventRaising && this.hasEventHandlers('onCollectionItemChange');
   }

   //endregion Protected methods
}

ObservableList.prototype['[Types/_collection/ObservableList]'] = true;
// @ts-ignore
ObservableList.prototype['[Types/_entity/relation/IReceiver]'] = true;
ObservableList.prototype._moduleName = 'Types/collection:ObservableList';
ObservableList.prototype._resetChangesCount = 100;

register('Types/collection:ObservableList', ObservableList, {instantiate: false});
