/// <amd-module name="Types/_function/memoize" />

'use strict';

/**
  * Возвращает функцию, запоминающую результат первого вызова оборачиваемого метода объекта и возврашающую при повторных вызовах единожды вычисленный результат.
  *
  * <h2>Параметры функции</h2>
  * <ul>
  *     <li><b>func</b> {Function} - Метод, результат вызова которого будет запомнен.</li>
  *     <li><b>cachedFuncName</b> {String} - Имя метода в экземпляре объекта, которому он принадлежит.</li>
  * </ul>
  *
  * <h2>Возвращает</h2>
  * {Function} Результирующая функция.
  *
  * @class Types/_function/memoize
  * @public
  * @author Мальцев А.А.
  */
let storage = new WeakMap();

class Memoize {
   memoize(original: Function) {
      return function (...args):any {
         let cache = {};
         const key = JSON.stringify(args);

         if (storage.has(original)) {
            cache = <Array<any>>storage.get(original);
         } else {
            storage.set(original, cache);
         }

         if (cache.hasOwnProperty(key)) {
            return cache[key];
         }

         let result = original.apply(this, args);
         cache[key] = result;
         return result;
      }
   }

   clear (original, ...args) {
      if (storage.has(this)) {
         const cache = storage.get(original);
         const key = JSON.stringify(args);
         const keyIndex= cache.indexOf(key);
         if (keyIndex > -1) {
            storage.set(this, cache.splice(keyIndex, 1));
         }
      }
   }
}

let instance = new Memoize();
let memoize = instance.memoize.bind(instance);
memoize.clear = instance.clear.bind(instance);
memoize.prototype = {_moduleName: 'Types/_function/memoize'};
export default memoize;
