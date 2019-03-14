/**
 * Наследует статические свойства
 * @param Base Базовый класс.
 * @param Sub Класс-наследник.
 */
function inheritStatic<T>(Base: Function, Sub: Function): void {
   // Don't inherit from plain object
   if (Base === Object) {
      return;
   }

   Object.getOwnPropertyNames(Base).forEach((key) => {
      switch (key) {
         case 'arguments':
         case 'caller':
         case 'length':
         case 'name':
         case 'prototype':
            // Skip some valuable keys of type Function
            break;
         default:
            if (!Sub.hasOwnProperty(key)) {
               Object.defineProperty(Sub, key, Object.getOwnPropertyDescriptor(Base, key));
            }
      }
   });
}

export function applyMixins(Sub: Function, ...mixins: Array<Function | object>): void {
   // FIXME: to fix behaviour of Core/core-instance::instanceOfMixin()
   if (mixins.length && !Sub.prototype._mixins) {
      Sub.prototype._mixins = [];
   }

   mixins.forEach((mixin) => {
      const isClass = typeof mixin === 'function';
      const proto = isClass ? (mixin as Function).prototype : mixin;

      if (isClass) {
         inheritStatic(mixin as Function, Sub);
      }

      const inject = (name) => {
         Object.defineProperty(Sub.prototype, name, Object.getOwnPropertyDescriptor(proto, name));
      };

      Object.getOwnPropertyNames(proto).forEach(inject);
      if (Object.getOwnPropertySymbols) {
         Object.getOwnPropertySymbols(proto).forEach(inject);
      }
   });
}

/**
 * Создает наследника с набором миксинов
 * @param Base Базовый класс
 * @param mixins Миксины
 * @return Наследник с миксинами.
 */
export function mixin<T>(Base: any, ...mixins: Array<Function | Object>): any {
   class Sub extends Base  {
      constructor(...args: any[]) {
         if (Base !== Object) {
            super(...args);
         }
      }
   }

   inheritStatic(Base, Sub);
   applyMixins(Sub, ...mixins);

   return Sub;
}
