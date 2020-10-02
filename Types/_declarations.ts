export type EntityMarker = true;

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
