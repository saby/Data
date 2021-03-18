const nativeStringifier = Object.prototype.toString;
const objectTag = '[object Object]';

/**
 * Проверяет, является ли объект пустой. Проверяются только собственные перечисляемые свойства.
 * @example
 * <h2>Пример использования</h2>
 * <pre>
 *     import {isEmpty} from 'Types/object';
 *
 *     // true
 *     console.log(isEmpty({});
 *
 *     // false
 *     console.log(isEmpty({
 *         foo: 'bar'
 *     });
 * </pre>
 *
 * @param obj Проверяемый объект.
 * @public
 * @author Кудярвцев И.С.
 */
export default (obj: any): boolean => {
    if (obj === null || typeof obj !== 'object') {
        return false;
    }

    const tag = nativeStringifier.call(obj);
    if (tag === objectTag || obj instanceof Object) {
        // tslint:disable-next-line: forin
        for (const _key in obj) {
            return false;
        }
    }

    return true;
};
