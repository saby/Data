import {controller} from 'I18n/i18n';

const DEFAULT_LOCALE = 'en-US';

const russianFormat = {
    patterns: {
        decimal: {
            positivePattern: '{number}',
            negativePattern: '{minusSign}{number}'
        },
        percent: {
            positivePattern: '{number} {percentSign}',
            negativePattern: '{minusSign}{number} {percentSign}'
        }
    },
    symbols: {
        latn: {
            decimal: ',',
            group: ' ',
            nan: 'не число',
            plusSign: '+',
            minusSign: '-',
            percentSign: '%',
            infinity: '∞'
        }
    }
};

const englishFormat = {
    patterns: {
        decimal: {
            positivePattern: '{number}',
            negativePattern: '{minusSign}{number}'
        },
        percent: {
            positivePattern: '{number} {percentSign}',
            negativePattern: '{minusSign}{number} {percentSign}'
        }
    },
    symbols: {
        latn: {
            decimal: '.',
            group: ',',
            nan: 'NAN',
            plusSign: '+',
            minusSign: '-',
            percentSign: '%',
            infinity: '∞'
        }
    }
};

const FORMATS = {
    'ru-RU': russianFormat,
    ru: russianFormat,
    'en-US': englishFormat,
    en: englishFormat
};

const groupSize = 3;

const DEFAULT_MAXIMUM_FRACTION_DIGITS = 3;
const DEFAULT_MAXIMUM_SIGNIFICANT_DIGITS = 21;

type FORMAT_STYLE = 'decimal' | 'percent';

interface IFormat {
    minimumIntegerDigits?: number;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    minimumSignificantDigits?: number;
    maximumSignificantDigits?: number;
    useGrouping?: boolean;
    style?: FORMAT_STYLE;
}

interface IPattern {
    type: string;
    value: number;
}

function formatNumberToString(numberFormat: IFormat, x: number): string {
    if (numberFormat.hasOwnProperty('minimumSignificantDigits') ||
        numberFormat.hasOwnProperty('maximumSignificantDigits')
    ) {
        return toRawPrecision(
            x,
            numberFormat.minimumSignificantDigits || 1,
            numberFormat.maximumSignificantDigits || DEFAULT_MAXIMUM_SIGNIFICANT_DIGITS
        );
    }

    return toRawFixed(
        x,
        numberFormat.minimumIntegerDigits,
        numberFormat.minimumFractionDigits,
        numberFormat.maximumFractionDigits
    );
}

function partitionNumberPattern(numberFormat: IFormat, x: number): IPattern[] {
    const localeFormat = FORMATS[controller.currentLocale] || FORMATS[DEFAULT_LOCALE];
    const ild = localeFormat.symbols.latn;
    const style = numberFormat.style || 'decimal';

    let pattern;
    if (!isNaN(x) && x < 0) {
        x = -x;
        pattern = localeFormat.patterns[style].negativePattern;
    } else {
        pattern = localeFormat.patterns[style].positivePattern;
    }

    const result = [];
    let beginIndex = pattern.indexOf('{', 0);
    let endIndex = 0;
    let nextIndex = 0;
    const length = pattern.length;
    while (beginIndex > -1 && beginIndex < length) {
        endIndex = pattern.indexOf('}', beginIndex);
        if (endIndex === -1) {
            throw new Error();
        }

        if (beginIndex > nextIndex) {
            const literal = pattern.substring(nextIndex, beginIndex);
            result.push({type: 'literal', value: literal});
        }

        const p = pattern.substring(beginIndex + 1, endIndex);
        if (p === 'number') {
            if (isNaN(x)) {
                const n = ild.nan;
                result.push({type: 'nan', value: n});
            } else if (!isFinite(x)) {
                const n = ild.infinity;
                result.push({type: 'infinity', value: n});
            } else {
                if (numberFormat.style === 'percent') {
                    x *= 100;
                }

                const n = formatNumberToString(numberFormat, x);

                let integer;
                let fraction;
                const decimalSepIndex = n.indexOf('.', 0);
                if (decimalSepIndex > 0) {
                    integer = n.substring(0, decimalSepIndex);
                    fraction = n.substring(decimalSepIndex + 1);
                } else {
                    integer = n;
                    fraction = undefined;
                }
                if (numberFormat.useGrouping === true) {
                    const groupSepSymbol = ild.group;
                    const groups = [];
                    if (integer.length > groupSize) {
                        const end = integer.length - groupSize;
                        let idx = end % groupSize;
                        const start = integer.slice(0, idx);
                        if (start.length) {
                            groups.push(start);
                        }
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
                        const integerGroup = groups.shift();
                        result.push({type: 'integer', value: integerGroup});
                        if (groups.length) {
                            result.push({type: 'group', value: groupSepSymbol});
                        }
                    }
                } else {
                    result.push({type: 'integer', value: integer});
                }
                if (fraction !== undefined) {
                    const decimalSepSymbol = ild.decimal;
                    result.push({type: 'decimal', value: decimalSepSymbol});
                    result.push({type: 'fraction', value: fraction});
                }
            }
        } else if (p === 'plusSign') {
            const plusSignSymbol = ild.plusSign;
            result.push({type: 'plusSign', value: plusSignSymbol});
        } else if (p === 'minusSign') {
            const minusSignSymbol = ild.minusSign;
            result.push({type: 'minusSign', value: minusSignSymbol});
        } else if (p === 'percentSign' && numberFormat.style === 'percent') {
            const percentSignSymbol = ild.percentSign;
            result.push({type: 'literal', value: percentSignSymbol});
        } else {
            const literal = pattern.substring(beginIndex, endIndex);
            result.push({type: 'literal', value: literal});
        }
        nextIndex = endIndex + 1;
        beginIndex = pattern.indexOf('{', nextIndex);
    }
    if (nextIndex < length) {
        const literal = pattern.substring(nextIndex, length);
        result.push({type: 'literal', value: literal});
    }

    return result;
}

/**
 * When the toRawPrecision abstract operation is called with arguments x (which
 * must be a finite non-negative number), minPrecision, and maxPrecision (both
 * must be integers between 1 and 21) the following steps are taken:
 */
function toRawPrecision(x: number, minPrecision: number, maxPrecision: number): string {
    const digit = x;
    let digitStr = digit.toString();
    const [int, fraction = '']: string[] = digitStr.split('.');
    const lengthDigit = int.length + fraction.length;

    if (lengthDigit >= minPrecision && lengthDigit <= maxPrecision) {
        return digitStr;
    }

    if (lengthDigit < minPrecision) {
        return digit.toFixed(minPrecision - int.length);
    }

    const lengthDifference = lengthDigit - maxPrecision;

    if (fraction.length >= lengthDifference) {
        return digit.toFixed(maxPrecision - int.length);
    }

    const integerShift = lengthDifference - fraction.length;
    digitStr = (digit / Math.pow(10, integerShift)).toFixed();

    return digitStr.padEnd(int.length, '0');
}

/**
 * @spec[tc39/ecma402/master/spec/numberformat.html]
 * When the toRawFixed abstract operation is called with arguments x (which must
 * be a finite non-negative number), minInteger (which must be an integer between
 * 1 and 21), minFraction, and maxFraction (which must be integers between 0 and
 * 20) the following steps are taken:
 */
function toRawFixed(x: number, minInteger: number, minFraction: number, maxFraction: number): string {
    const digit = x;
    let digitStr = digit.toString();
    const [int, fraction = '']: string[] = digitStr.split('.');

    if (fraction.length < minFraction) {
        digitStr = digit.toFixed(minFraction);
    }

    if (fraction.length > maxFraction) {
        digitStr = digit.toFixed(maxFraction);
    }

    if (int.length < minInteger) {
        const [int, fraction = '']: string[] = digitStr.split('.');

        return `${int.padStart(minInteger, '0')}${fraction ? '.' + fraction : ''}`;
    }

    return digitStr;
}

function getNumberFormat(options: IFormat): IFormat {
    return {...{
        style: 'decimal',
        useGrouping: true,
        minimumIntegerDigits: 1,
        minimumFractionDigits: 0,
        maximumFractionDigits: DEFAULT_MAXIMUM_FRACTION_DIGITS
    }, ...options || {}};
}

/**
 *
 * Метод возвращает строку с чувствительным к языку представлением этого числа.
 * @remark
 * Вариации аргумента options:
 * <ul>
 *     <li> style - Стиль форматирования, который будет использован. Возможные значения: «десятичное» для простого форматирования чисел и «процент» для процентного форматирования. По умолчанию - «десятичный».<li>
 *  useGrouping - Использовать ли группирующие разделители, такие как разделители тысяч или тысячные/сто тысячные/крор разделители. Возможные значения: true и false. по умолчанию - true.
 *  Следующие параметры делятся на две группы: minimumIntegerDigits, minimumFractionDigits, и maximumFractionDigits в одной группе, minimumSignificantDigits и maximumSignificantDigits в другой группе.
 *  Если хотя бы один параметр из второй группы определен, то первая группа игнорируется.
 *     </li>
 *     <li>minimumIntegerDigits - Минимальное количество целых чисел. Возможные значения от 1 до 21. по умолчанию - 1.</li>
 *     <li>
 *         minimumFractionDigits - Минимальное количество дробных чисел. Возможные значения от 0 до 20;
 *         по умолчанию для простого числа и процента - 0; по умолчанию для форматирования валюты используется количество младших разрядов, представленное в списке кодов валют ISO 4217 (2, если в списке нет этой информации).
 *     </li>
 *     <li>
 *         maximumFractionDigits - Максимальное количество дробных чисел. Возможные значения от 0 до 20;
 *         по умолчанию для обычного форматирования числа больше, чем "minimalFractionDigits" и 3;
 *         значение по умолчанию для форматирования валюты - большее из minimumFractionDigits и числа младших цифр, предоставленных списком кодов валют IS O 4217 (2, если список не предоставляет эту информацию);
 *         значение по умолчанию для форматирования в процентах - это больше, чем minimumFractionDigits и 0.
 *     </li>
 *     <li>minimumSignificantDigits - Минимальное количество значащих чисел. Возможные значения от 1 до 21; по умолчанию - 1.</li>
 *     <li>maximumSignificantDigits - Максимальное количество значащих чисел. Возможные значения от 1 до 21; по умолчанию - 21.</li>
 * </ul>
 * Если локализация не включена, будет использоваться локаль «en-US».
 *
 * <h2>Пример</h2>
 * <pre>
 *     import {number as formatNumber} from 'Types/formatter';
 *     formatNumber(12325.13) // return '12,325.13' for en-US locale and '12 325,13' for ru-RU
 * </pre>
 * Подробнее - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat MDN}.
 * @param x Число
 * @param options Опции
 * @public
 * @author Мальцев А.А.
 * @spec[tc39/ecma402/master/spec/numberformat.html]
 * @clause[sec-formatnumber]
 */

/*
 *
 * The method returns a string with a language-sensitive representation of this number.
 * @remark
 *        <ul>
 *            <li>
 *                style - The formatting style to use. Possible values are 'decimal' for plain number formatting and 'percent' for percent formatting; the default is 'decimal'.
 *            <li>
 *                useGrouping - Whether to use grouping separators, such as thousands separators or thousand/lakh/crore separators. Possible values are true and false; the default is true.
 *                The following properties fall into two groups: minimumIntegerDigits, minimumFractionDigits, and maximumFractionDigits in one group, minimumSignificantDigits and maximumSignificantDigits in the other.
 *                If at least one property from the second group is defined, then the first group is ignored.
 *            </li>
 *            <li>
 *                minimumIntegerDigits - The minimum number of integer digits to use. Possible values are from 1 to 21; the default is 1.
 *            </li>
 *            <li>
 *                minimumFractionDigits - The minimum number of fraction digits to use. Possible values are from 0 to 20;
 *                the default for plain number and percent formatting is 0; the default for currency formatting is the number of minor unit digits provided by the ISO 4217 currency code list (2 if the list doesn't provide that information).
 *            </li>
 *            <li>
 *                maximumFractionDigits - The maximum number of fraction digits to use. Possible values are from 0 to 20;
 *                the default for plain number formatting is the larger of minimumFractionDigits and 3; the default for currency formatting is the larger of minimumFractionDigits and the number of minor unit digits provided by the ISO 4217 currency code list (2 if the list doesn't provide that information); the default for percent formatting is the larger of minimumFractionDigits and 0.
 *            </li>
 *            <li>
 *                minimumSignificantDigits - The minimum number of significant digits to use. Possible values are from 1 to 21; the default is 1.
 *            </li>
 *            <li>
 *                maximumSignificantDigits - The maximum number of significant digits to use. Possible values are from 1 to 21; the default is 21.
 *            </li>
 *         </ul>
 * If localization is not enabled 'en-US' locale will be uesed.
 *
 * <h2>Example</h2>
 * <pre>
 *     import {number as formatNumber} from 'Types/formatter';
 *     formatNumber(12325.13) // return '12,325.13' for en-US locale and '12 325,13' for ru-RU
 * </pre>
 * See more info at {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat MDN}.
 * @param x Number
 * @param options Options
 * @public
 * @author Мальцев А.А.
 * @spec[tc39/ecma402/master/spec/numberformat.html]
 * @clause[sec-formatnumber]
 */
export default function number(x: number, options?: IFormat): string  {
    const parts = partitionNumberPattern(getNumberFormat(options), x);
    let result = '';
    for (let i = 0; parts.length > i; i++) {
        const part = parts[i];
        result += part.value;
    }
    return result;
}
