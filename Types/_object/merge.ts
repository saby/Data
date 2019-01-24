/// <amd-module name="Types/_object/merge" />
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

function isObject(obj: any): boolean {
   return obj !== null && typeof obj === 'object';
}

export default function merge(target: any, ...sources: any[]): any {
   if (isObject(target)) {
      sources.forEach((source) => {
         if (isObject(source)) {
            const overrides = {};
            Object.keys(source).forEach((key) => {
               if (isObject(source[key])) {
                  if (target.hasOwnProperty(key)) {
                     overrides[key] = merge(target[key], source[key]);
                  }
               }
            });

            Object.assign(target, source, overrides);
         }
      });
   }

   return target;
}
