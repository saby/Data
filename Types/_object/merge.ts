/// <amd-module name="Types/_object/merge" />

function isObject(obj:any):boolean {
   return obj !== null && typeof(obj) === "object"
}

/**
 *
 * Модуль, в котором описана функция <b>merge.ts(obj1[, obj2, ...])</b>,
 *
 * Функция рекурсивно объединяет два или более объектов.
 *
 * <h2>Параметры функции</h2>
 *
 * <ul>
 *   <li><b>target</b> {Object}.</li>
 *   <li><b>sources</b> {Object}.</li>
 * </ul>
 *
 * <h2>Пример использования</h2>
 * <pre>
 *    require(['Types/object'], function(util) {
 *       // true
 *       console.log(object.merge({foo: {data:'bar'}}, {foo: {myData:'bar'}})); //{foo: {data:'bar', myData:'bar'}}
 *
 *       // false
 *       console.log(util.isEqual([0], ['0']));
 *    });
 * </pre>
 *
 * @class Types/_object/merge
 * @public
 * @author Мальцев А.А.
 */

export default function merge(target:any, ...sources:any[]): any {
   if (!sources.length) {
      return target;
   }
   const source = sources.shift();

   if (isObject(target) && isObject(source)) {
      for (const key in source) {
         if (isObject(source[key])) {
            if (!target[key]) {
               Object.assign(target, { [key]: {} });
            }
            merge(target[key], source[key]);
         } else {
            Object.assign(target, { [key]: source[key] });
         }
      }
   }
   return merge(target, ...sources);
}
