// @ts-ignore
import i18n = require('Core/i18n');
import 'i18n!Types/_formatter/number';
import {getDefaultOptions} from "../../View/Executor/_Utils/OptionsResolver";

/**
 *
 * The method returns a string with a language-sensitive representation of this number.
 * @remark
 * Params:
 * <ul>
 *   <li>source - number</li>
 *   <li>options - An object with some or all of the following properties:
 *      <ul>
 *         <li>
 *            style - The formatting style to use. Possible values are "decimal" for plain number formatting
 *            and "percent" for percent formatting; the default is "decimal".
 *         <li>
 *            useGrouping - Whether to use grouping separators, such as thousands separators or thousand/lakh/crore
 *            separators. Possible values are true and false; the default is true.
 *            The following properties fall into two groups: minimumIntegerDigits, minimumFractionDigits, and
 *            maximumFractionDigits in one group, minimumSignificantDigits and maximumSignificantDigits in the other.
 *            If at least one property from the second group is defined, then the first group is ignored.
 *         </li>
 *         <li>
 *            minimumIntegerDigits - The minimum number of integer digits to use. Possible values are from 1 to 21;
 *            the default is 1.
 *         </li>
 *         <li>
 *            minimumFractionDigits - The minimum number of fraction digits to use. Possible values are from 0 to 20;
 *            the default for plain number and percent formatting is 0; the default for currency formatting is the
 *            number of minor unit digits provided by the ISO 4217 currency code list (2 if the list doesn't provide
 *            that information).
 *         </li>
 *         <li>
 *            maximumFractionDigits - The maximum number of fraction digits to use. Possible values are from 0 to 20;
 *            the default for plain number formatting is the larger of minimumFractionDigits and 3; the default for
 *            currency formatting is the larger of minimumFractionDigits and the number of minor unit digits provided
 *            by the ISO 4217 currency code list (2 if the list doesn't provide that information); the default for
 *            percent formatting is the larger of minimumFractionDigits and 0.
 *         </li>
 *         <li>
 *            minimumSignificantDigits - The minimum number of significant digits to use. Possible values are from 1 to
 *            21; the default is 1.
 *         </li>
 *         <li>
 *            maximumSignificantDigits - The maximum number of significant digits to use. Possible values are from 1 to
 *            21; the default is 21.
 *         </li>
 *       </ul>
 *    </li>
 * </ul>
 *
 * <h2>example</h2>
 * <pre>
 *    require(['Types/_formatter/number'], function(format) {
 *       format(12325.13) // return "12,325.13" for en-US locale and "12 325.13" for ru-RU
 *    });
 * </pre>
 * More info https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
 * @function Types/_formatter/number
 * @public
 * @author Мальцев А.А.
 */

const NumberFormat = {
   'ru-RU': {
      "patterns": {
         "decimal": {
            "positivePattern": "{number}",
            "negativePattern": "{minusSign}{number}"
         },
         "percent": {
            "positivePattern": "{number} {percentSign}",
            "negativePattern": "{minusSign}{number} {percentSign}"
         }
      },
      "symbols": {
         "latn": {
            "decimal": ",",
            "group": " ",
            "nan": "не число",
            "plusSign": "+",
            "minusSign": "-",
            "percentSign": "%",
            "infinity": "∞"
         }
      }
   },
   'en-US': {
      "patterns": {
         "decimal": {
            "positivePattern": "{number}",
            "negativePattern": "{minusSign}{number}"
         },
         "percent": {
            "positivePattern": "{number} {percentSign}",
            "negativePattern": "{minusSign}{number} {percentSign}"
         }
      },
      "symbols": {
         "latn": {
            "decimal": ".",
            "group": ",",
            "nan": "NAN",
            "plusSign": "+",
            "minusSign": "-",
            "percentSign": "%",
            "infinity": "∞"
         }
      }
   }
};
const groupSize = 3;


function FormatNumberToString(numberFormat, x) {
   if (numberFormat.hasOwnProperty('minimumSignificantDigits') && numberFormat.hasOwnProperty('maximumSignificantDigits')) {
      return ToRawPrecision(x, numberFormat.minimumSignificantDigits, numberFormat.maximumSignificantDigits);
   }

   return ToRawFixed(x, numberFormat.minimumIntegerDigits || 1, numberFormat.minimumFractionDigits || 0, numberFormat.maximumFractionDigits || 21);
}

function PartitionNumberPattern(numberFormat:any, x:number) {

   let locale = i18n.getLang(),
       localeFormat = NumberFormat[locale],
       ild = localeFormat.symbols.latn,
       style = numberFormat.style || 'decimal',
       pattern;

   if (!isNaN(x) && x < 0) {
      x = -x;
      pattern = localeFormat.patterns[style].negativePattern;
   }
   else {
      pattern = localeFormat.patterns[style].positivePattern;
   }
   let result = [];
   let beginIndex = pattern.indexOf('{', 0);
   let endIndex = 0;
   let nextIndex = 0;
   let length = pattern.length;
   while (beginIndex > -1 && beginIndex < length) {
      endIndex = pattern.indexOf('}', beginIndex);
      if (endIndex === -1) throw new Error();
      if (beginIndex > nextIndex) {
         let literal = pattern.substring(nextIndex, beginIndex);
         result.push({'type': 'literal', 'value': literal});
      }
      let p = pattern.substring(beginIndex + 1, endIndex);
      if (p === "number") {
         if (isNaN(x)) {
            let n = ild.nan;
            result.push({'type': 'nan', 'value': n});
         }
         else if (!isFinite(x)) {
            let n = ild.infinity;
            result.push({'type': 'infinity', 'value': n});
         }
         else {
            if (numberFormat.style === 'percent') {
               x *= 100;
            }

            let n = FormatNumberToString(numberFormat, x);

            let integer;
            let fraction;
            let decimalSepIndex = n.indexOf('.', 0);
            if (decimalSepIndex > 0) {
               integer = n.substring(0, decimalSepIndex);
               fraction = n.substring(decimalSepIndex + 1, decimalSepIndex.length);
            }
            else {
               integer = n;
               fraction = undefined;
            }
            if (numberFormat.useGrouping === true) {
               let groupSepSymbol = ild.group;
               let groups = [];
               if (integer.length > groupSize) {
                  let end = integer.length - groupSize;
                  let idx = end % groupSize;
                  let start = integer.slice(0, idx);
                  if (start.length) groups.push(start);
                  while (idx < end) {
                     groups.push(integer.slice(idx, idx + groupSize));
                     idx += groupSize;
                  }
                  groups.push(integer.slice(end));
               } else {
                  groups.push(integer);
               }
               if (groups.length === 0) {
                  throw new Error('group is empty');
               }
               while (groups.length) {
                  let integerGroup = groups.shift();
                  result.push({'type': 'integer', 'value': integerGroup});
                  if (groups.length) {
                     result.push({'type': 'group', 'value': groupSepSymbol});
                  }
               }
            }
            else {
               result.push({'type': 'integer', 'value': integer});
            }
            if (fraction !== undefined) {
               let decimalSepSymbol = ild.decimal;
               result.push({'type': 'decimal', 'value': decimalSepSymbol});
               result.push({'type': 'fraction', 'value': fraction});
            }
         }
      }
      else if (p === "plusSign") {
         let plusSignSymbol = ild.plusSign;
         result.push({'type': 'plusSign', 'value': plusSignSymbol});
      }
      else if (p === "minusSign") {
         let minusSignSymbol = ild.minusSign;
         result.push({'type': 'minusSign', 'value': minusSignSymbol});
      }
      else if (p === "percentSign" && numberFormat.style === "percent") {
         let percentSignSymbol = ild.percentSign;
         result.push({'type': 'literal', 'value': percentSignSymbol});
      }
      else {
         let literal = pattern.substring(beginIndex, endIndex);
         result.push({'type': 'literal', 'value': literal});
      }
      nextIndex = endIndex + 1;
      beginIndex = pattern.indexOf('{', nextIndex);
   }
   if (nextIndex < length) {
      let literal = pattern.substring(nextIndex, length);
      result.push({'type': 'literal', 'value': literal});
   }
   return result;
}

/**
 * When the ToRawPrecision abstract operation is called with arguments x (which
 * must be a finite non-negative number), minPrecision, and maxPrecision (both
 * must be integers between 1 and 21) the following steps are taken:
 */
function ToRawPrecision (x, minPrecision, maxPrecision) {
   let result = x.toString();

   if (result === '0') {
      result = Array (maxPrecision + 1).join('0');
   }

   if (result.indexOf(".") >= 0 && maxPrecision > minPrecision) {
      let cut = maxPrecision - minPrecision;

      while (cut > 0 && result.charAt(result.length-1) === '0') {
         result = result.slice(0, -1);
         cut--;
      }

      if (result.charAt(result.length-1) === '.')
         result = result.slice(0, -1);
   }

   return result;
}

/**
 * @spec[tc39/ecma402/master/spec/numberformat.html]
 * When the ToRawFixed abstract operation is called with arguments x (which must
 * be a finite non-negative number), minInteger (which must be an integer between
 * 1 and 21), minFraction, and maxFraction (which must be integers between 0 and
 * 20) the following steps are taken:
 */
function ToRawFixed(x:number, minInteger:number, minFraction:number, maxFraction:number) {
   // 1. Let f be maxFraction.
   let n = Math.pow(10, maxFraction) * x; // diverging...
   let result = (n === 0 ? "0" : n.toFixed(0)); // divering...

   // this diversion is needed to take into consideration big numbers, e.g.:
   // 1.2344501e+37 -> 12344501000000000000000000000000000000
   let idx;
   let exp = (idx = result.indexOf('e')) > -1 ? +result.slice(idx + 1) : 0;
   if (exp) {
      result = result.slice(0, idx).replace('.', '');
      result += Array(exp - (result.length - 1) + 1).join('0');
   }

   let int;
   if (maxFraction!== 0) {
      let length = result.length;
      if (length <= maxFraction) {
         let zero = Array(maxFraction + 1 - length + 1).join('0');
         result = zero + result;
         length = maxFraction + 1;
      }
      let a = result.substring(0, length - maxFraction),
         b = result.substring(length - maxFraction, result.length);
      result = a + "." + b;
      int = a.length;
   } else {
      int = result.length;
   }
   let cut = maxFraction - minFraction;
   while (cut > 0 && result.slice(-1) === "0") {
      result = result.slice(0, -1);
      cut--;
   }
   if (result.slice(-1) === ".") {
      result = result.slice(0, -1);
   }
   if (int < minInteger) {
      let zero = Array(minInteger - int + 1).join('0');
      result = zero + result;
   }
   return result;
}

function getNumberFormat(options): any {
   return Object.assign({
      style: 'decimal',
      useGrouping: true,
      minimumIntegerDigits: 0,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
   }, options||{})
}
/*
 * @spec[tc39/ecma402/master/spec/numberformat.html]
 * @clause[sec-formatnumber]
 */
export default function number(x: number, options?: Intl.NumberFormatOptions): string  {
   let parts = PartitionNumberPattern(getNumberFormat(options) || {}, x);
   let result = '';
   for (let i = 0; parts.length > i; i++) {
      let part = parts[i];
      result += part.value;
   }
   return result;
}

