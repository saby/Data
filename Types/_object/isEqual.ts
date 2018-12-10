/// <amd-module name="Types/_object/isEqual" />
/**
 *
 * Модуль, в котором описана функция <b>isEqual(obj1, obj2)</b>,
 *
 * Функция рекурсивно сравнивает два объекта или массива.
 * Объекты считаются равными тогда, когда они равны по оператору ===, или когда они являются plain Object и у них одинаковые наборы внутренних ключей, и по каждому ключу значения равны, причём, если эти значения - объекты или массивы, то они сравниваются рекурсивно.
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
 * @class Types/_object/isEqual
 * @public
 * @author Мальцев А.А.
 */

let isTraversable = function (v): boolean {
   let proto;
   if (v && typeof v === 'object') {
      if (v instanceof Date) {
         return true;
      }
      proto = Object.getPrototypeOf(v);
      return proto === null || proto === Object.prototype;
   }

   return false;
};
let isEqualArrays = function (arr1, arr2): boolean {
   if (arr1.length !== arr2.length) {
      return false;
   }

   return !arr1.some(function (item, index) {
      return !isEqual(item, arr2[index]);
   });
};
let isEqualObjects = function (obj1, obj2): boolean {
   let keys1 = Object.keys(obj1),
      keys2 = Object.keys(obj2);

   if (keys1.length !== keys2.length) {
      return false;
   }

   keys1.sort();
   keys2.sort();
   if (keys1.length > 0) {
      return !keys1.some(function (key, index) {
         return !(keys2[index] === key && isEqual(obj1[key], obj2[key]));
      });
   }
   return Object.getPrototypeOf(obj1) === Object.getPrototypeOf(obj2);
};

export default function isEqual(obj1, obj2): boolean {
   let equal = obj1 === obj2,
      val1,
      val2,
      isArray1,
      isArray2;

   if (equal) {
      return equal;
   }

   isArray1 = Array.isArray(obj1);
   isArray2 = Array.isArray(obj2);
   if (isArray1 !== isArray2) {
      return false;
   }
   if (isArray1) {
      return isEqualArrays(obj1, obj2);
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
};
