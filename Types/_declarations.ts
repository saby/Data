export type CompareFunction = <T>(a: T, b: T) => number;

export interface IHashMap<T> {
   [key: string]: T;
}

export class ExtendPromise<T> extends Promise<T> {
   addCallback: (callback: Function) => ExtendPromise<T>;
   addErrback: (callback: Function) => ExtendPromise<T>;
   addCallbacks: (callback: Function, errback: Function) => ExtendPromise<T>;
}

export interface IExtendDateConstructor extends DateConstructor {
   SQL_SERIALIZE_MODE_DATE: undefined;
   SQL_SERIALIZE_MODE_TIME: boolean;
   SQL_SERIALIZE_MODE_DATETIME: boolean;
   SQL_SERIALIZE_MODE_AUTO: null;
}

export class ExtendDate extends Date {
   getSQLSerializationMode: () => any;
   setSQLSerializationMode: (mode: any) => void;
}
