import enumerableComparator, {ISession} from './enumerableComparator';
import {IList} from '../collection';

/**
 * Миксин для реализации коллекции, в которой можно приостанавливать генерацию событий об изменениях с фиксацией
 * состояния
 * @mixin Types/_collection/EventRaisingMixin
 * @public
 * @author Мальцев А.А.
 */
export default class EventRaisingMixin {
   '[Types/_entity/EventRaisingMixin]': boolean;

   /**
    * @event После изменения режима генерации событий
    * @name Types/_collection/EventRaisingMixin#onEventRaisingChange
    * @param {Boolean} enabled Включена или выключена генерация событий
    * @param {Boolean} analyze Включен или выключен анализ изменений
    */

   /**
    * Генерация событий включена
    */
   protected _eventRaising: boolean;

   /**
    * Метод получения содержимого элемента коллекции (если такое поведение поддерживается)
    */
   protected _sessionItemContentsGetter: string;

   /**
    * Состояние коллекции до выключения генерации событий
    */
   protected _beforeRaiseOff: ISession;

   constructor() {
      this._publish('onEventRaisingChange');
   }

   // region ObservableMixin

   hasEventHandlers: (event: string) => boolean;
   protected _publish: (...events: string[]) => void;
   protected _notify: (event: string, ...args: any[]) => void;

   // endregion

   // region Public methods

   /**
    * Включает/выключает генерацию событий об изменении коллекции
    * @param {Boolean} enabled Включить или выключить генерацию событий
    * @param {Boolean} [analyze=false] Анализировать изменения (если включить, то при enabled = true будет произведен
    * анализ всех изменений с момента enabled = false - сгенерируются события обо всех изменениях)
    * @example
    * Сгенерируем событие о перемещении элемента c позиции 1 на позицию 3:
    * <pre>
    *    requirejs(['Types/collection'], function(collection) {
    *       var list = new collection.ObservableList({
    *          items: ['one', 'two', 'three', 'four', 'five']
    *       });
    *
    *      list.subscribe('onCollectionChange', (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
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
   setEventRaising(enabled: boolean, analyze?: boolean): void {
      enabled = !!enabled;
      analyze = !!analyze;
      const isEqual = this._eventRaising === enabled;

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
   }

   /**
    * Возвращает признак, включена ли генерация событий об изменении проекции
    * @return {Boolean}
    */
   isEventRaising(): boolean {
      return this._eventRaising;
   }

   // endregion

   // region Protected methods

   /**
    * Запускает серию обновлений
    * @protected
    */
   protected _startUpdateSession(): ISession {
      if (!this._eventRaising) {
         return null;
      }
      return enumerableComparator.startSession(this as any, this._sessionItemContentsGetter);
   }

   /**
    * Завершает серию обновлений
    * @param session Серия обновлений
    * @param [analize=true] Запустить анализ изменений
    * @protected
    */
   protected _finishUpdateSession(session: ISession, analize?: boolean): void {
      if (!session) {
         return;
      }

      analize = analize === undefined ? true : analize;

      enumerableComparator.finishSession(session, this as any, this._sessionItemContentsGetter);

      if (analize) {
         this._analizeUpdateSession(session);
      }
   }

   /**
    * Анализирует серию обновлений, генерирует события об изменениях
    * @param session Серия обновлений
    * @protected
    */
   protected _analizeUpdateSession(session: ISession): void {
      if (!session) {
         return;
      }

      enumerableComparator.analizeSession(session, this as any, (action, changes) => {
         this._notifyCollectionChange(
            action,
            changes.newItems,
            changes.newItemsIndex,
            changes.oldItems,
            changes.oldItemsIndex,
            session
         );
      });
   }

   /**
    * Генерирует событие об изменении коллекции
    * @param action Действие, приведшее к изменению.
    * @param newItems Новые исходной коллекции.
    * @param newItemsIndex Индекс коллекции, в котором появились новые элементы.
    * @param oldItems Удаленные элементы коллекции.
    * @param oldItemsIndex Индекс коллекции, в котором удалены элементы.
    * @param [session] Серия обновлений
    * @protected
    */
   protected _notifyCollectionChange(
      action: string,
      newItems: any[],
      newItemsIndex: number,
      oldItems: any[],
      oldItemsIndex: number,
      session?: ISession
   ): void {
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
   }

   /**
    * Разбивает элементы списка на пачки в порядке их следования в списке.
    * @param list Список, в котором содержатся элементы.
    * @param items Элементы в произвольном порядке.
    * @param callback Функция обратного вызова для каждой пачки
    * @protected
    */
   protected _extractPacksByList(list: IList<any>, items: any[], callback: Function): void {
      const send = (pack, index) => {
         callback(pack.slice(), index);
         pack.length = 0;
      };
      const sortedItems = [];
      let item;
      let index;
      for (let i = 0; i < items.length; i++) {
         item = items[i];
         index = list.getIndex(item);
         sortedItems[index] = item;
      }

      const pack = [];
      let packIndex = 0;
      const maxIndex = sortedItems.length - 1;
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
   }

   /**
    * Возвращает признак, что нужно генерировать события об изменениях коллекции
    * @protected
    */
   protected _isNeedNotifyCollectionChange(): boolean {
      return this._eventRaising && this.hasEventHandlers('onCollectionChange');
   }

   // endregion Protected methods
}

Object.assign(EventRaisingMixin.prototype, {
   '[Types/_entity/EventRaisingMixin]': true,
   _eventRaising: true,
   _sessionItemContentsGetter: '',
   _beforeRaiseOff: null
});
