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
        if (storage.has(original)) {
            const cache = storage.get(original);
            const key = JSON.stringify(args);

            if (cache.hasOwnProperty(key)) {
                delete cache[key];
            }
        }
    }
}

const instance = new Memoize();
const memoize = instance.memoize.bind(instance);
memoize.clear = instance.clear.bind(instance);
memoize.prototype = {_moduleName: 'Types/_function/memoize'};

/**
 * Возвращает функцию, запоминающую результат первого вызова оборачиваемого метода объекта и возвращающую при повторных вызовах единожды вычисленный результат.
 *
 * @param original Метод, результат вызова которого будет запомнен.
 * @param cachedFuncName Имя метода в экземпляре объекта, которому он принадлежит.
 * @returns Результирующая функция
 * @public
 * @author Кудрявцев И.С.
 */
export default memoize;
