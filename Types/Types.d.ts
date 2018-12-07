interface CompareFunction {
   (a: any, b: any): number
}

interface EventBusChannel {
   publish(name: string): void;
   subscribe(event: string, handler: Function, ctx?: any): void;
   unsubscribe(event: string, handler: Function, ctx?: any): void;
   unsubscribeAll(): void;
   getEventHandlers(event: string): Function[];
   hasEventHandlers(event: string): boolean;
   destroy(): void;
   _notifyWithTarget(event: string, target: any, ...args): void;
}

interface EventObject {
}

interface ExtendDateConstructor extends DateConstructor {
   SQL_SERIALIZE_MODE_DATE: undefined;
   SQL_SERIALIZE_MODE_TIME: boolean;
   SQL_SERIALIZE_MODE_DATETIME: boolean;
   SQL_SERIALIZE_MODE_AUTO: null;
}

interface ExtendDate extends Date {
   getSQLSerializationMode(): any;
   setSQLSerializationMode(mode: any);
}

interface ExtendPromise<T> extends Promise<T> {
   addCallback(callback: Function);
   addErrback(callback: Function);
   addCallbacks(callback: Function, errback: Function);
}
