const storage = new WeakMap();

class Memoize {
   memoize(original: Function): any {
      return function(...args: any[]): any {
         let cache = {};
         const key = JSON.stringify(args);

         if (storage.has(original)) {
            cache = storage.get(original) as any[];
         } else {
            storage.set(original, cache);
         }

         if (cache.hasOwnProperty(key)) {
            return cache[key];
         }

         const result = original.apply(this, args);
         cache[key] = result;
         return result;
      };
   }

   clear(original: Function, ...args: any[]): void {
      if (storage.has(this)) {
         const cache = storage.get(original);
         const key = JSON.stringify(args);
         const keyIndex = cache.indexOf(key);
         if (keyIndex > -1) {
            storage.set(this, cache.splice(keyIndex, 1));
         }
      }
   }
}

const instance = new Memoize();
const memoize = instance.memoize.bind(instance);
memoize.clear = instance.clear.bind(instance);
memoize.prototype = {_moduleName: 'Types/_function/memoize'};

/**
 * Возвращает функцию, запоминающую результат первого вызова оборачиваемого метода объекта и возвращающую при
 * повторных вызовах единожды вычисленный результат.
 * @remark
 * <h2>Параметры функции</h2>
 * <ul>
 *     <li><b>func</b> {Function} - Метод, результат вызова которого будет запомнен.</li>
 *     <li><b>cachedFuncName</b> {String} - Имя метода в экземпляре объекта, которому он принадлежит.</li>
 * </ul>
 *
 * <h2>Возвращает</h2>
 * {Function} Результирующая функция.
 *
 * @function Types/_function/memoize
 * @public
 * @author Мальцев А.А.
 */
export default memoize;
