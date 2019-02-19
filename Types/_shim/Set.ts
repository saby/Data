/// <amd-module name="Types/_shim/Set" />
/**
 * Limited emulation of standard built-in object "Set" if it's not supported.
 * Follow {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Set} for details.
 * @author Мальцев А.А.
 */

// Use native implementation if supported
let SetImplementation;

if (typeof Set === 'undefined') {
   SetImplementation = class <T> {
      protected _hash: Object;
      protected _objects: T[];
      protected _objectPrefix: string;

      constructor() {
         this.clear();
      }

      static _getHashedKey(key: string): string {
         return (typeof key) + '@' + key;
      }

      add(value: T): this {
         const key = this._isObject(value) ? this._addObject(value) : value;

         this._hash[SetImplementation._getHashedKey(key)] = value;

         return this;
      }

      clear() {
         this._hash = {};
         this._objects = [];
      }

      delete(value: T) {
         let key;
         if (this._isObject(value)) {
            key = this._deleteObject(value);
            if (!key) {
               return;
            }
         } else {
            key = value;

         }
         this._hash[SetImplementation._getHashedKey(key)] = undefined;
      }

      entries() {
         throw new Error('Method is not supported');
      }

      forEach(callbackFn: Function, thisArg?: Object) {
         // FIXME: now not in insertion order
         const hash = this._hash;
         for (const key in hash) {
            if (hash.hasOwnProperty(key) && hash[key] !== undefined) {
               callbackFn.call(thisArg, hash[key], hash[key], this);
            }
         }
      }

      has(value: T): boolean {
         let key;
         if (this._isObject(value)) {
            key = this._getObjectKey(value);
            if (!key) {
               return false;
            }
         } else {
            key = value;
         }
         key = SetImplementation._getHashedKey(key);

         return this._hash.hasOwnProperty(key) && this._hash[key] !== undefined;
      }

      keys() {
         throw new Error('Method is not supported');
      }

      values() {
         throw new Error('Method is not supported');
      }

      _isObject(value: any): boolean {
         return value && typeof value === 'object';
      }

      _addObject(value: T): string {
         let index = this._objects.indexOf(value);
         if (index === -1) {
            index = this._objects.length;
            this._objects.push(value);
         }
         return this._objectPrefix + index;
      }

      _deleteObject(value: T): string|undefined {
         const index = this._objects.indexOf(value);
         if (index > -1) {
            this._objects[index] = null;
            return this._objectPrefix + index;
         }
         return undefined;
      }

      _getObjectKey(value: T): string|undefined {
         const index = this._objects.indexOf(value);
         if (index === -1) {
            return undefined;
         }
         return this._objectPrefix + index;
      }
   };

   Object.assign(SetImplementation.prototype, {
      _hash: null,
      _objectPrefix: '{[object]}:',
      _objects: null
   });

   Object.defineProperty(SetImplementation.prototype, 'size', {
      get() {
         return Object.keys(this._hash).length;
      },
      enumerable: true,
      configurable: false
   });
} else {
   SetImplementation = Set;
}

export default SetImplementation;
