/// <amd-module name="Types/_formatter/numberRoman" />

const boundaries = {
   M: 1000,
   CM: 900,
   D: 500,
   CD: 400,
   C: 100,
   XC: 90,
   L: 50,
   XL: 40,
   X: 10,
   IX: 9,
   V: 5,
   IV: 4,
   I: 1
};

/**
 * Функция, переводящая арабское число в римское.
 *
 * Параметры:
 * <ul>
 *     <li>{Number} num Арабское число.</li>
 * </ul>
 *
 * @class Types/_formatter/numberRoman
 * @public
 * @author Мальцев А.А.
 */
export default function numberRoman(num: number):string {
   let result = '';

   for (const key in boundaries) {
      if (boundaries.hasOwnProperty(key)) {
         while (num >= boundaries[key]) {
            result += key;
            num -= boundaries[key];
         }
      }
   }

   return result;
}
