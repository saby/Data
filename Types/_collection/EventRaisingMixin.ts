/// <amd-module name="Types/_collection/EventRaisingMixin" />
/**
 * Миксин для реализации коллекции, в которой можно приостанавливать генерацию событий об изменениях с фиксацией состояния
 * @mixin Types/_collection/EventRaisingMixin
 * @public
 * @author Мальцев А.А.
 */

import enumerableComparator from './enumerableComparator';

const EventRaisingMixin = /** @lends Types/_entity/EventRaisingMixin.prototype */{
   '[Types/_entity/EventRaisingMixin]': true,

   /**
    * @event onEventRaisingChange После изменения режима генерации событий
    * @param {Boolean} enabled Включена или выключена генерация событий
    * @param {Boolean} analyze Включен или выключен анализ изменений
    */

   /**
    * @member {Boolean} Генерация событий включена
    */
   _eventRaising: true,

   /**
    * @member {String} Метод получения содержимого элемента коллекции (если такое поведение поддерживается)
    */
   _sessionItemContentsGetter: '',

   /**
    * @member {Object|null} Состояние коллекции до выключения генерации событий
    */
   _beforeRaiseOff: null,

   constructor() {
      this._publish('onEventRaisingChange');
   },

   //region Public methods

   /**
    * Включает/выключает генерацию событий об изменении коллекции
    * @param {Boolean} enabled Включить или выключить генерацию событий
    * @param {Boolean} [analyze=false] Анализировать изменения (если включить, то при enabled = true будет произведен анализ всех изменений с момента enabled = false - сгенерируются события обо всех изменениях)
    * @example
    * Сгенерируем событие о перемещении элемента c позиции 1 на позицию 3:
    * <pre>
    *    requirejs(['Types/collection'], function(collection) {
    *       var list = new collection.ObservableList({
    *          items: ['one', 'two', 'three', 'four', 'five']
    *       });
    *
    *      list.subscribe('onCollectionChange', function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
    *         action === collection.IObservable.ACTION_MOVE;//true
    *
    *         oldItems[0] === 'two';//true
    *         oldItems[0] === item;//true
    *         oldItemsIndex === 1;//true
    *
    *         newItems[0] === 'two';//true
    *         newItems[0] === item;//true
    *         newItemsIndex === 3;//true
    *      });
    *
    *      list.setEventRaising(false, true);
    *      var item = list.removeAt(1);
    *      list.add(item, 3);
    *      list.setEventRaising(true, true);
    *   });
    * </pre>
    */
   setEventRaising(enabled, analyze) {
      enabled = !!enabled;
      analyze = !!analyze;
      let isEqual = this._eventRaising === enabled;

      if (analyze && isEqual) {
         throw new Error(`The events raising is already ${enabled ? 'enabled' : 'disabled'} with analize=true`);
      }

      if (analyze) {
         if (enabled) {
            this._eventRaising = enabled;
            this._finishUpdateSession(this._beforeRaiseOff);
            this._beforeRaiseOff = null;
         } else {
            this._beforeRaiseOff = this._startUpdateSession();
            this._eventRaising = enabled;
         }
      } else {
         this._eventRaising = enabled;
      }

      if (!isEqual) {
         this._notify('onEventRaisingChange', enabled, analyze);
      }
   },

   /**
    * Возвращает признак, включена ли генерация событий об изменении проекции
    * @return {Boolean}
    */
   isEventRaising() {
      return this._eventRaising;
   },

   //endregion Public methods

   //region Protected methods

   /**
    * Запускает серию обновлений
    * @return {Object}
    * @protected
    */
   _startUpdateSession() {
      if (!this._eventRaising) {
         return null;
      }
      return enumerableComparator.startSession(this, this._sessionItemContentsGetter);
   },

   /**
    * Завершает серию обновлений
    * @param {Object} session Серия обновлений
    * @param {Boolean} [analize=true] Запустить анализ изменений
    * @protected
    */
   _finishUpdateSession(session, analize) {
      if (!session) {
         return;
      }

      analize = analize === undefined ? true : analize;

      enumerableComparator.finishSession(session, this, this._sessionItemContentsGetter);

      if (analize) {
         this._analizeUpdateSession(session);
      }
   },

   /**
    * Анализирует серию обновлений, генерирует события об изменениях
    * @param {Object} session Серия обновлений
    * @protected
    */
   _analizeUpdateSession(session) {
      if (!session) {
         return;
      }

      enumerableComparator.analizeSession(session, this, (action, changes) => {
         this._notifyCollectionChange(
            action,
            changes.newItems,
            changes.newItemsIndex,
            changes.oldItems,
            changes.oldItemsIndex,
            session
         );
      });
   },

   /**
    * Генерирует событие об изменении коллекции
    * @param {String} action Действие, приведшее к изменению.
    * @param {Array} newItems Новые исходной коллекции.
    * @param {Number} newItemsIndex Индекс коллекции, в котором появились новые элементы.
    * @param {Array} oldItems Удаленные элементы коллекции.
    * @param {Number} oldItemsIndex Индекс коллекции, в котором удалены элементы.
    * @param {Object} [session] Серия обновлений
    * @protected
    */
   _notifyCollectionChange(action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
      if (!this._isNeedNotifyCollectionChange()) {
         return;
      }

      this._notify(
         'onCollectionChange',
         action,
         newItems,
         newItemsIndex,
         oldItems,
         oldItemsIndex
      );
   },

   /**
    * Разбивает элементы списка на пачки в порядке их следования в списке.
    * @param {Types/_collection/IList} list Список, в котором содержатся элементы.
    * @param {Array} items Элементы в произвольном порядке.
    * @param {Function} callback Функция обратного вызова для каждой пачки
    * @protected
    * @static
    */
   _extractPacksByList(list, items, callback) {
      let send = (pack, index) => {
         callback(pack.slice(), index);
         pack.length = 0;
      };
      let sortedItems = [];
      let item;
      let index;
      for (let i = 0; i < items.length; i++) {
         item = items[i];
         index = list.getIndex(item);
         sortedItems[index] = item;
      }

      let pack = [];
      let packIndex = 0;
      let maxIndex = sortedItems.length - 1;
      for (let index = 0; index <= maxIndex; index++) {
         item = sortedItems[index];

         if (!item) {
            if (pack.length) {
               send(pack, packIndex);
            }
            continue;
         }

         if (!pack.length) {
            packIndex = index;
         }
         pack.push(item);

      }

      if (pack.length) {
         send(pack, packIndex);
      }
   },

   /**
    * Возвращает признак, что нужно генерировать события об изменениях коллекции
    * @return {Boolean}
    * @protected
    */
   _isNeedNotifyCollectionChange() {
      return this._eventRaising && this.hasEventHandlers('onCollectionChange');
   }

   //endregion Protected methods
};

export default EventRaisingMixin;
