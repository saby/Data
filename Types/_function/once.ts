const storage = new WeakMap();

/**
 * Модуль, в котором описана функция <b>once(original)</b>.
 *
 * Метод обертки функции: вызовет функцию только один раз.
 * Повторные вызовы результирующей функции будут возвращать результат первого вызова.
 *
 * <h2>Параметры функции</h2>
 * <ul>
 *     <li><b>original</b> {Function} - исходная функция, вызов которой нужно выполнить один раз.</li>
 * </ul>
 *
 * <h2>Возвращает</h2>
 * {Function} Результирующая функция.
 *
 * <h2>Пример использования</h2>
 * <pre>
 * require(['Types/function'], function(util) {
 *    var foo = function(bar) {
 *          console.log(`foo: ${bar}`);
 *          return 'foo+' + bar;
 *       },
 *       fooDecorator = outil.once(foo);
 *
 *    console.log(fooDecorator('baz'));//foo: baz, foo+baz
 *    console.log(fooDecorator('baz'));//foo+baz
 * });
 * </pre>
 *
 * @class Types/_function/once
 * @public
 * @author Мальцев А.А.
 */
export default function once(original: Function): Function {
   return function(...args: any[]): any {
      if (!storage.has(original)) {
         const result = original.apply(this, args);
         storage.set(original, result);
      }
      return storage.get(original);
   };
}
