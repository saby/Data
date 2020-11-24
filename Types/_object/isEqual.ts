import IEquatable from '../_entity/IEquatable';

function isTraversable(value: any): boolean {
    let proto;
    if (value && typeof value === 'object') {
        if (value instanceof Date) {
            return true;
        }
        proto = Object.getPrototypeOf(value);
        return proto === null || proto === Object.prototype;
    }

    return false;
}

function isEqualArrays(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) {
        return false;
    }

    return !arr1.some((item, index) => {
        return !isEqual(item, arr2[index]);
    });
}

function isEqualObjects(obj1: object, obj2: object): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    if (keys1.length > 0) {
        keys1.sort();
        keys2.sort();
        return !keys1.some((key, index) => {
            return !(keys2[index] === key && isEqual(obj1[key], obj2[key]));
        });
    }

    return Object.getPrototypeOf(obj1) === Object.getPrototypeOf(obj2);
}

/**
 * Рекурсивно сравнивает два объекта или массива.
 * @remark
 * Объекты считаются равными тогда, когда они равны по оператору ===, или когда они являются plain Object и у них
 * одинаковые наборы внутренних ключей, и по каждому ключу значения равны, причём, если эти значения - объекты или
 * массивы, то они сравниваются рекурсивно. Если объект не является plain Object, но поддерживает интерфейс
 * {@link Types/_entity/IEquatable}, то такие объекты сравниваются через вызов метода isEqual().
 * Функция возвращает true, когда оба объекта/массива идентичны.
 *
 * <h2>Пример использования</h2>
 * <pre>
 *     import {isEqual} from 'Types/object';
 *
 *     // true
 *     console.log(isEqual({foo: 'bar'}, {foo: 'bar'}));
 *
 *     // false
 *     console.log(isEqual([0], ['0']));
 * </pre>
 *
 * @param obj1 Первый объект
 * @param obj2 Второй объект
 * @public
 * @author Мальцев А.А.
 */
export default function isEqual(obj1: any, obj2: any): boolean {
    // Deal with strict equal of any type
    if (obj1 === obj2) {
        return true;
    }

    // Deal with arrays
    const isArray1 = Array.isArray(obj1);
    const isArray2 = Array.isArray(obj2);
    if (isArray1 !== isArray2) {
        return false;
    }
    if (isArray1) {
        return isEqualArrays(obj1 as any[], obj2 as any[]);
    }

    // Deal with traversable objects
    if (isTraversable(obj1) && isTraversable(obj2)) {
        let val1;
        let val2;
        if (obj1.valueOf && obj1.valueOf === obj2.valueOf) {
            val1 = obj1.valueOf();
            val2 = obj2.valueOf();
        } else {
            val1 = obj1;
            val2 = obj2;
        }
        return val1 === obj1 && val2 === obj2 ? isEqualObjects(obj1, obj2) : isEqual(val1, val2);
    }

    // Deal with equatable objects
    if (obj1 && obj1['[Types/_entity/IEquatable]']) {
         return (obj1 as IEquatable).isEqual(obj2);
    }
    if (obj2 && obj2['[Types/_entity/IEquatable]']) {
         return (obj2 as IEquatable).isEqual(obj1);
    }

    // Deal with NaNs because comparison NaN === NaN gives false
    if (Number.isNaN(obj1) && Number.isNaN(obj2)) {
        return true;
    }

    // Unknown types which are not strict equal
    return false;
}
