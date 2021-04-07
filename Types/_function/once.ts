const storage = new WeakMap();

/**
 * Метод обертки функции: вызовет функцию только один раз.
 * Повторные вызовы результирующей функции будут возвращать результат первого вызова.
 * @remark
 * <h2>Пример использования</h2>
 * <pre>
 *     import {once} from 'Types/function';
 *     const foo = (bar) => {
 *         console.log(`foo: ${bar}`);
 *         return 'foo+' + bar;
 *     };
 *     const fooDecorator = once(foo);
 *
 *     console.log(fooDecorator('baz'));//foo: baz, foo+baz
 *     console.log(fooDecorator('baz'));//foo+baz
 * });
 * </pre>
 *
 * @param original Исходная функция, вызов которой нужно выполнить один раз
 * @returns Результирующая функция
 * @public
 * @author Кудрявцев И.С.
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
