export type EntityMarker = true;
export type EntityMarkerCompat = boolean;

export type CompareFunction<T = unknown> = (a: T, b: T) => number;

export interface IHashMap<T> {
    [key: string]: T;
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

export interface IDeferred<T> extends Promise<T> {
    addCallback(success: Function): IDeferred<T>;
    addCallbacks(success: Function, fail: Function): IDeferred<T>;
    addErrback(fail: Function): IDeferred<T>;
    callback(result: T): void;
    cancel(): void;
    errback(err: Error): void;
    isCallbacksLocked(): boolean;
    isReady(): boolean;
}
