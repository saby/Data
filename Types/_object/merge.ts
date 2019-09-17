import {Set} from '../shim';

function isTraversable(obj: any): boolean {
   if (obj === null || typeof obj !== 'object') {
      return false;
   }
   const proto = Object.getPrototypeOf(obj);
   return proto === Object.prototype || proto === Array.prototype;
}

function mergeInner<T, S>(path: Set<T>, target: T, ...sources: S[]): T & S {
    if (isTraversable(target)) {
        sources.forEach((source) => {
            if (isTraversable(source)) {
                const overrides = {};
                Object.keys(source).forEach((key) => {
                    const sourceItem = source[key];
                    if (isTraversable(sourceItem)) {
                        if (target.hasOwnProperty(key) && !path.has(sourceItem)) {
                            path.add(sourceItem);
                            overrides[key] = mergeInner(path, target[key], sourceItem);
                            path.delete(sourceItem);
                        }
                    }
                });

                Object.assign(target, source, overrides);
            }
        });
    }

    return target as T & S;
}

/**
 * Рекурсивно объединяет два или более объектов.
 * @remark
 * <h2>Параметры функции</h2>
 *
 * <ul>
 *   <li><b>target</b> {Object}.</li>
 *   <li><b>sources</b> {Object}.</li>
 * </ul>
 *
 * <h2>Пример использования</h2>
 * <pre>
 *     import {merge} from 'Types/object';
 *
 *     // {foo: {data: 'bar', myData: 'baz'}}
 *     console.log(merge(
 *         {foo: {data: 'bar'}},
 *         {foo: {myData: 'baz'}}
 *     ));
 * </pre>
 *
 * @class Types/_object/merge
 * @public
 * @author Мальцев А.А.
 */
export default function merge<T = object, S = object>(target: T, ...sources: S[]): T & S {
    const path = new Set<T>();
    return mergeInner<T, S>(path, target, ...sources);
}
