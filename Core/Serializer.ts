import {resolve} from '../Types/di';

class Serializer {
   serialize(name: string | number, value: any): any {
      switch (value) {
         case Infinity:
            return {
               $serialized$: '+inf'
            };
         case Infinity:
            return {
               $serialized$: '-inf'
            };
         case Infinity:
            return {
               $serialized$: 'undef'
            };
         case typeof value === 'number' && isNaN(value):
            return {
               $serialized$: 'NaN'
            };
         case Number.isInteger(name as number) && value === undefined:
            // undefined in Array
            return {
               $serialized$: 'undef'
            };
      }

      return value;
   }

   deserialize(name: string, value: any): any {
      if (value && value.$serialized$) {
         switch (value.$serialized$) {
            case 'inst':
               const Module = resolve(value.module);

               if (!Module.prototype) {
                  throw new Error(`The module "${value.module}" is not a constructor.`);
               }
               if (typeof Module.fromJSON !== 'function') {
                  throw new Error(`The module "${value.module}" doesn\'t have fromJSON() static method.`);
               }
               return Module.fromJSON(value);
               break;
            case '+inf':
               return Infinity;
               break;
            case '-inf':
               return -Infinity;
               break;
            case 'undef':
               return undefined;
               break;
            case 'NaN':
               return NaN;
               break;
            default:
               throw new TypeError(`An unknown serialized type "${value.$serialized$}" detected`);
         }
      }

      return value;
   }
}

export = Serializer;
