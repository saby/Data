function isTraversable(v: any): boolean {
   let proto;
   if (v && typeof v === 'object') {
      if (v instanceof Date) {
         return true;
      }
      proto = Object.getPrototypeOf(v);
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

   keys1.sort();
   keys2.sort();
   if (keys1.length > 0) {
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
 * массивы, то они сравниваются рекурсивно.
 * Функция возвращает true, когда оба объекта/массива идентичны.
 *
 * <h2>Параметры функции</h2>
 *
 * <ul>
 *   <li><b>obj1</b> {Object|Array}.</li>
 *   <li><b>obj2</b> {Object|Array}.</li>
 * </ul>
 *
 * <h2>Пример использования</h2>
 * <pre>
 *    require(['Types/object'], function(util) {
 *       // true
 *       console.log(util.isEqual({foo: 'bar'}, {foo: 'bar'}));
 *
 *       // false
 *       console.log(util.isEqual([0], ['0']));
 *    });
 * </pre>
 *
 * @function
 * @name Types/_object/isEqual
 * @public
 * @author Мальцев А.А.
 */
export default function isEqual(obj1: object, obj2: object): boolean {
   const equal = obj1 === obj2;
   let val1;
   let val2;
   let isArray1;
   let isArray2;

   if (equal) {
      return equal;
   }

   isArray1 = Array.isArray(obj1);
   isArray2 = Array.isArray(obj2);
   if (isArray1 !== isArray2) {
      return false;
   }
   if (isArray1) {
      return isEqualArrays(obj1 as any[], obj2 as any[]);
   }

   if (isTraversable(obj1) && isTraversable(obj2)) {
      if (obj1.valueOf && obj1.valueOf === obj2.valueOf) {
         val1 = obj1.valueOf();
         val2 = obj2.valueOf();
      } else {
         val1 = obj1;
         val2 = obj2;
      }
      return val1 === obj1 && val2 === obj2 ? isEqualObjects(obj1, obj2) : isEqual(val1, val2);
   }

   return false;
}
