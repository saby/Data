declare type CompareFunction = (a: any, b: any) => number;

interface IHashMap<T> {
   [key: string]: T;
}

export {CompareFunction, IHashMap};
