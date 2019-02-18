/// <amd-module name="Types/_shim/Map" />
/**
 * Limited emulation of standard built-in object "Map" if it's not supported.
 * Follow {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map} for details.
 * @author Мальцев А.А.
 */

import Set from './Set';

// Use native implementation if supported
let MapImplementation;

if (typeof Map === 'undefined') {
   MapImplementation = class <K, V> {
      protected _hash: Object;
      protected _objects: V[];
      protected _objectPrefix: string;

      constructor() {
         this.clear();
      }

      static _getUnhashedKey(key: string): string {
         return String(key).split('@', 2)[1];
      }

      clear() {
         this._hash = {};
         this._objects = [];
      }

      delete(key: K) {
         let surrogate;
         if (this._isObject(key)) {
            surrogate = this._addObject(key);
            if (!surrogate) {
               return;
            }
         } else {
            surrogate = key;
         }
         // @ts-ignore
         this._hash[Set._getHashedKey(surrogate)] = undefined;
      }

      entries() {
         throw new Error('Method is not supported');
      }

      forEach(callbackFn: Function, thisArg?: Object) {
         // FIXME: now not in insertion order
         const hash = this._hash;
         let ukey;
         let value;

         for (const key in hash) {
            if (hash.hasOwnProperty(key) && hash[key] !== undefined) {
               value = hash[key];
               ukey = MapImplementation._getUnhashedKey(key);
               if (this._isObjectKey(ukey)) {
                  ukey = this._getObject(ukey);
               }
               callbackFn.call(thisArg, value, ukey, this);
            }
         }
      }

      get(key: K): V {
         let surrogate;
         if (this._isObject(key)) {
            surrogate = this._getObjectKey(key);
            if (!surrogate) {
               return;
            }
         } else {
            surrogate = key;
         }
         // @ts-ignore
         return this._hash[Set._getHashedKey(surrogate)];
      }

      has(key: K): boolean {
         let surrogate;
         if (this._isObject(key)) {
            surrogate = this._getObjectKey(key);
            if (!surrogate) {
               return false;
            }
         } else {
            surrogate = key;
         }
         // @ts-ignore
         surrogate = Set._getHashedKey(surrogate);

         return this._hash.hasOwnProperty(surrogate) && this._hash[surrogate] !== undefined;
      }

      keys() {
         throw new Error('Method is not supported');
      }

      set(key: K, value: V): this {
         let surrogate;
         if (this._isObject(key)) {
            surrogate = this._addObject(key);
         } else {
            surrogate = key;
         }
         // @ts-ignore
         this._hash[Set._getHashedKey(surrogate)] = value;

         return this;
      }

      _isObject(value: any): boolean {
         // @ts-ignore
         return Set.prototype._isObject.call(this, value);
      }

      _addObject(value: Object): string {
         // @ts-ignore
         return Set.prototype._addObject.call(this, value);
      }

      _deleteObject(value: Object): string|undefined {
         // @ts-ignore
         return Set.prototype._deleteObject.call(this, value);
      }

      _getObjectKey(value: Object): string|undefined {
         // @ts-ignore
         return Set.prototype._getObjectKey.call(this, value);
      }

      _isObjectKey(key: any) {
         return String(key).substr(0, this._objectPrefix.length) === this._objectPrefix;
      }

      _getObject(key: string) {
         const index = parseInt(key.substr(this._objectPrefix.length), 10);
         return this._objects[index];
      }
   };

   Object.assign(MapImplementation.prototype, {
      _hash: null,
      _objectPrefix: Set.prototype._objectPrefix,
      _objects: null
   });

   Object.defineProperty(MapImplementation.prototype, 'size', {
      get() {
         return Object.keys(this._hash).length;
      },
      enumerable: true,
      configurable: false
   });
} else {
   MapImplementation = Map;
}

export default MapImplementation;
