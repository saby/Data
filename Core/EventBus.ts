class Channel implements EventBusChannel {
   protected handlers: Map<string, Function[]> = new Map();

   publish(name): void {
   }

   subscribe(event: string, handler: Function, ctx?: object): void {
      const handlers = this.handlers.get(event) || [];
      handlers.push(handler);
      this.handlers.set(event, handlers);
   }
   unsubscribe(event: string, handler: Function, ctx?: any): void {
      const handlers = this.handlers.get(event);
      if (handlers) {
         let index = 0;
         while (index > -1) {
            index = handlers.indexOf(handler);
            if (index > -1) {
               handlers.splice(index, 1);
            }
         }
      }
   }

   unsubscribeAll(): void {
      this.handlers = new Map();
   }

   getEventHandlers(event: string): Function[] {
      return this.handlers.get(event) || [];
   }

   hasEventHandlers(event: string): boolean {
      return this.getEventHandlers(event).length > 0;
   }

   destroy(): void {
      this.unsubscribeAll();
   }

   _notifyWithTarget(event: string, target: any, ...args): void {
      this.getEventHandlers(event).forEach((handler) => {
         handler.apply(target || handler, args);
      });
   }
}

class EventBus {
   static channel(): Channel {
      return new Channel();
   }
}

export = EventBus;
