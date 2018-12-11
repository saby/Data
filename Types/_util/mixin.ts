/// <amd-module name="Types/_util/mixin" />
/**
 * Наследование с использованием миксинов
 * @author Мальцев А.А.
 */

/**
 * Наследует статические свойства
 * @param {Function} Base Базовый класс.
 * @param {Function} Sub Класс-наследник.
 */
function inheritStatic(Base, Sub) {
   //Don't inherit from plain object
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
            //Skip some valuable keys of type Function
            break;
         default:
            if (!Sub.hasOwnProperty(key)) {
               Object.defineProperty(Sub, key, Object.getOwnPropertyDescriptor(Base, key));
            }
      }
   });
}

export function applyMixins(Sub: any, ...mixins): any {

   //FIXME: to fix behaviour of Core/core-instance::instanceOfMixin()
   if (mixins.length && !Sub.prototype._mixins) {
      Sub.prototype._mixins = [];
   }

   mixins.forEach((mixin) => {
      const isClass = typeof mixin === 'function';
      const proto = isClass ? mixin.prototype : mixin;

      if (isClass) {
         inheritStatic(mixin, Sub);
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
 * @return {Function} Наследник с миксинами.
 */
export function mixin(Base, ...mixins) {
   class Sub extends Base {
      constructor(...args) {
         if (Base !== Object) {
            super(...args);
         }
      }
   }

   inheritStatic(Base, Sub);
   applyMixins(Sub, ...mixins);

   return Sub;
}
