/// <amd-module name="Types/_entity/ObservableMixin" />
/**
 * Примесь, позволяющая сущности возможность узнавать об изменении состояния объекта через события.
 * @class Types/Entity/ObservableMixin
 * @public
 * @author Мальцев А.А.
 */

// @ts-ignore
import EventBus = require('Core/EventBus');

interface IOptions {
   handlers?: Object
}

export default abstract class ObservableMixin /**@lends Types/Entity/ObservableMixin.prototype */{
   /**
    * @cfg {Object.<Function>} handlers Обработчики событий
    */

   /**
    * Канал событий
    */
   protected _eventBusChannel: EventBusChannel;

   /**
    * @property {Array.<Array>} Очередь событий
    */
   protected _eventsQueue: Array<Array<any>>;

   /**
    * Декларированные события
    */
   protected _publishedEvents: string[];

   protected _destroyed: boolean;

   constructor(options?: IOptions) {
      let handlers = options && options.handlers;
      if (handlers instanceof Object) {
         for (let event in handlers) {
            if (handlers.hasOwnProperty(event)) {
               this.subscribe(event, handlers[event]);
            }
         }
      }
   }

   destroy() {
      if (this._eventBusChannel) {
         this._eventBusChannel.unsubscribeAll();
         this._eventBusChannel.destroy();
         this._eventBusChannel = null;
      }
   }

   /**
    * Добавляет подписку на событие
    * @param {String} event Имя события, на которое подписается обработчик
    * @param {Function} handler Обработчик события.
    * @param {Object} [ctx] Контекст выполнения
    * @example
    * Подпишемся на событие OnSomethingChanged:
    * <pre>
    *    var instance = new Entity();
    *    instance.subscribe('OnSomethingChanged', function(event, eventArg1) {
    *       //do something
    *    });
    * </pre>
    */
   subscribe(event: string, handler: Function, ctx?: Object) {
      if (this._destroyed) {
         return;
      }

      if (!this._eventBusChannel) {
         this._eventBusChannel = EventBus.channel();

         if (this._publishedEvents) {
            for (let i = 0; i < this._publishedEvents.length; i++) {
               this._eventBusChannel.publish(this._publishedEvents[i]);
            }
         }
      }

      if (ctx === undefined) {
         ctx = this;
      }
      this._eventBusChannel.subscribe(event, handler, ctx);
   }

   /**
    * Отменяет подписку на событие
    * @param {String} event Имя события, на которое подписается обработчик
    * @param {Function} handler Обработчик события.
    * @param {Object} [ctx] Контекст выполнения
    * @example
    * Подпишемся на событие OnSomethingChanged и обработаем его только один раз:
    * <pre>
    *    var instance = new Entity(),
    *       handler = function(event, eventArg1) {
    *          instance.unsubscribe(handler);
    *          //do something
    *       };
    *    instance.subscribe('OnSomethingChanged', handler);
    * </pre>
    */
   unsubscribe(event: string, handler: Function, ctx?: Object) {
      if (this._eventBusChannel) {
         if (ctx === undefined) {
            ctx = this;
         }
         this._eventBusChannel.unsubscribe(event, handler, ctx);
      }
   }

   /**
    * Возвращет массив подписчиков на событие
    * @param {String} event Имя события
    * @return {Array.<Core/EventObject>}
    * @example
    * Посмотрим, сколько подписчиков у события OnSomethingChanged
    * <pre>
    *    var handlersCount = instance.getEventHandlers().length;
    * </pre>
    */
   getEventHandlers(event: string): Array<Object> {
      return this._eventBusChannel ? this._eventBusChannel.getEventHandlers(event) : [];
   }

   /**
    * Проверяет наличие подписки на событие
    * @param {String} event Имя события
    * @return {Boolean}
    * @example
    * Посмотрим, есть ли подписчики у события OnSomethingChanged
    * <pre>
    *    var hasHandlers = instance.hasEventHandlers();
    * </pre>
    */
   hasEventHandlers(event: string): boolean {
      return this._eventBusChannel ? this._eventBusChannel.hasEventHandlers(event) : false;
   }

   /**
    * Деклариует наличие события
    * @param {...String} events Имя события
    * @protected
    */
   protected _publish(...events) {
      this._publishedEvents = this._publishedEvents || [];
      let event;
      for (let i = 0; i < events.length; i++) {
         event = events[i];
         this._publishedEvents.push(event);
         if (this._eventBusChannel) {
            this._eventBusChannel.publish(event);
         }
      }
   }

   /**
    * Извещает о наступлении события.
    * Если в процессе извещения приходит очередное событие, то извещение о нем будет отправлено после выполнения обработчиков предыдущего.
    * @param {String} event Имя события
    * @param {...*} args Аргументы события
    * @return {*} Результат обработки события (возвращается только в случае отсутствия очереди)
    * @protected
    */
   protected _notify(event: string, ...args) {
      if (this._eventBusChannel) {
         this._notifyPushQueue.apply(this, arguments);
         return this._notifyQueue(this._eventsQueue)[0];
      }
   }

   /**
    * Ставит в очередь извещение о наступлении события.
    * @param {String} event Имя события
    * @param {...*} args Аргументы события
    * @protected
    */
   protected _notifyLater(event: string, ...args) {
      if (this._eventBusChannel) {
         this._notifyPushQueue.apply(this, arguments);
      }
   }

   /**
    * Добавляет извещение о событии в очередь.
    * @param {String} event Имя события
    * @param {...*} args Аргументы события
    * @protected
    */
   protected _notifyPushQueue(event: string, ...args) {
      this._eventsQueue = this._eventsQueue || [];
      this._eventsQueue.push([event, ...args]);
   }

   /**
    * Инициирует выполнение обработчиков из очереди событий
    * @param {Array.<Array>} eventsQueue Очередь событий
    * @return {Array} Результаты обработки событиий
    * @protected
    */
   protected _notifyQueue(eventsQueue: Array<Array<Function>>) {
      let results = [];

      // @ts-ignore
      if (!eventsQueue.running) {
         // @ts-ignore
         eventsQueue.running = true;
         let item;
         while ((item = eventsQueue[0])) {
            results.push(this._eventBusChannel._notifyWithTarget(
               item[0],
               this,
               item.slice(1)
            ));
            eventsQueue.shift();
         }
         // @ts-ignore
         eventsQueue.running = false;
      }

      return results;
   }

   /**
    * Удаляет из очереди все обработчики указанного события
    * @param {String} eventName Имя события
    * @protected
    */
   protected _removeFromQueue(eventName: string) {
      if (!this._eventsQueue) {
         return;
      }

      for (let i = 1; i < this._eventsQueue.length; i++) {
         if (this._eventsQueue[i][0] === eventName) {
            this._eventsQueue.splice(i, 1);
            i--;
         }
      }
   }
}

ObservableMixin.prototype['[Types/_entity/ObservableMixin]'] = true;
// @ts-ignore
ObservableMixin.prototype._eventBusChannel = null;
// @ts-ignore
ObservableMixin.prototype._eventsQueue = null;
// @ts-ignore
ObservableMixin.prototype._publishedEvents = null;
