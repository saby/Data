import toRoman from './numberRoman';
// @ts-ignore
import locales = require('Core/helpers/i18n/locales');

interface IDateFormatOptions {
   lead: number;
   lower: boolean;
}

let tokensRegex;
const tokens = {};
const locale = locales.current;

/**
 * Adds lead zeroes to the Number
 * @param value Number
 * @param count Max digits count
 * @return Number with leading zeroes
 */
function withLeadZeroes(value: number, count: number): string {
   const absValue = String(Math.abs(value));
   const restCount = count - absValue.length;
   const sign = value >= 0 ? '' : '-';
   return sign + (String(Math.pow(
      10,
      Math.max(0, restCount)
   )).substr(1) + absValue);
}

/**
 * Returns hour in 12-hours format
 */
function getTwelveHours(date: Date): number {
   return date.getHours() % 12 || 12;
}

/**
 * Returns localized am/pm mark
 */
function getAmPm(date: Date): string {
   return date.getHours() >= 12 ? locale.config.pm : locale.config.am;
}

/**
 * Returns localized day of week in minimized notation
 */
function getDayOfWeekMin(date: Date): string {
   return locale.config.minDays[date.getDay()];
}

/**
 * Returns localized day of week in short notation
 */
function getDayOfWeekShort(date: Date): string {
   return locale.config.shortDays[date.getDay()];
}

/**
 * Returns localized day of week in long notation
 */
function getDayOfWeekLong(date: Date): string {
   return locale.config.longDays[date.getDay()];
}

/**
 * Returns human-friendly month number
 */
function getHumanMonth(date: Date): number {
   return date.getMonth() + 1;
}

/**
 * Returns localized month name in short notation
 */
function getMonthNameShort(date: Date): string {
   return locale.config.shortMonths[date.getMonth()];
}

/**
 * Returns localized month name in long notation
 */
function getMonthNameLong(date: Date): string {
   return locale.config.longMonths[date.getMonth()];
}

/**
 * Returns localized month name in ordinal notation
 */
function getMonthOrdinal(date: Date): string {
   return locale.config.ordinalMonths[date.getMonth()];
}

/**
 * Returns quarter number
 */
function getQuarter(date: Date): number {
   return 1 + Math.floor((date.getMonth()) / 3);
}

/**
 * Returns quarter number in roman notation
 */
function getQuarterRoman(date: Date): string {
   return toRoman(getQuarter(date));
}

/**
 * Returns quarter number in minimized roman notation
 */
function getQuarterRomanMin(date: Date): string {
   return locale.config.minQuarter.replace(
      '$digit$s$',
      getQuarterRoman(date)
   );
}

/**
 * Returns quarter number in short roman notation
 */
function getQuarterRomanShort(date: Date): string {
   return locale.config.shortQuarter.replace(
      '$digit$s$',
      getQuarterRoman(date)
   );
}

/**
 * Returns quarter number in long roman notation
 */
function getQuarterRomanLong(date: Date): string {
   return locale.config.longQuarter.replace(
      '$digit$s$',
      getQuarterRoman(date)
   );
}

/**
 * Returns year number in minimized notation
 */
function getYearMin(date: Date): number {
   return date.getFullYear() % 100;
}

/**
 * Returns half a year number (1 or 2)
 */
function getHalfYear(date: Date): number {
   return date.getMonth() < 6 ? 1 : 2;
}

/**
 * Returns half a year number in roman notation
 */
function getHalfYearRoman(date: Date): string {
   return toRoman(getHalfYear(date));
}

/**
 * Returns localized half a year in minimized roman notation
 */
function getHalfYearRomanMin(date: Date): string {
   return locale.config.minHalfYear.replace(
      '$digit$s$',
      getHalfYearRoman(date)
   );
}

/**
 * Returns localized half a year in long roman notation
 */
function getHalfYearRomanLong(date: Date): string {
   return locale.config.longHalfYear.replace(
      '$digit$s$',
      getHalfYearRoman(date)
   );
}

/**
 * Returns regular expression to match date tokens in a string
 */
function getTokensRegex(): RegExp {
   if (tokensRegex) {
      return tokensRegex;
   }

   // More longer must match first
   const expr = Object.keys(tokens).sort((a: string, b: string): number => {
      return b.length - a.length;
   });
   tokensRegex = new RegExp('\\[[^\\]]+\\]|(' + expr.join('|') + ')', 'g');

   return tokensRegex;
}

/**
 * Adds token to match
 * @param token Token
 * @param handler Token handler (for String is the method name in Date.prototype)
 * @param [options] Options to pass to the handler
 */
function addToken(token: string, handler: string|Function, options: object = {} as IDateFormatOptions): void {
   tokens[token] = [handler, options];
   tokensRegex = null;
}

/**
 * Formats date with a handler
 * @param date Date to format
 * @param handler Token handler (for String is the method name in Date.prototype)
 * @param [options] Options to pass to the handler
 */
function formatByToken(date: Date, handler: string|Function, options: IDateFormatOptions): string {
   if (typeof handler === 'string') {
      handler = (
         (method) => (date) => date[method]()
      )(handler);
   }

   let result = handler(date);

   if (options.lead) {
      result = withLeadZeroes(result, options.lead);
   }

   if (options.lower && typeof result === 'string') {
      result = result.toLowerCase();
   }

   return result;
}

// Time tokens
addToken('SSS', 'getMilliseconds');
addToken('s', 'getSeconds');
addToken('ss', 'getSeconds', {lead: 2} as IDateFormatOptions);
addToken('m', 'getMinutes');
addToken('mm', 'getMinutes', {lead: 2} as IDateFormatOptions);
addToken('h', getTwelveHours);
addToken('hh', getTwelveHours, {lead: 2} as IDateFormatOptions);
addToken('H', 'getHours');
addToken('HH', 'getHours', {lead: 2} as IDateFormatOptions);
addToken('a', getAmPm);

// Date tokens
addToken('D', 'getDate');
addToken('DD', 'getDate', {lead: 2} as IDateFormatOptions);
addToken('dd', getDayOfWeekMin);
addToken('ddl', getDayOfWeekMin, {lower: true} as IDateFormatOptions);
addToken('ddd', getDayOfWeekShort);
addToken('dddl', getDayOfWeekShort, {lower: true} as IDateFormatOptions);
addToken('dddd', getDayOfWeekLong);
addToken('ddddl', getDayOfWeekLong, {lower: true} as IDateFormatOptions);
addToken('M', getHumanMonth);
addToken('MM', getHumanMonth, {lead: 2} as IDateFormatOptions);
addToken('MMM', getMonthNameShort);
addToken('MMMl', getMonthNameShort, {lower: true} as IDateFormatOptions);
addToken('MMMM', getMonthNameLong);
addToken('MMMMl', getMonthNameLong, {lower: true} as IDateFormatOptions);
addToken('MMMMo', getMonthOrdinal);
addToken('MMMMlo', getMonthOrdinal, {lower: true} as IDateFormatOptions);
addToken('Y', getYearMin);
addToken('Yh', getHalfYear);
addToken('YY', getYearMin, {lead: 2} as IDateFormatOptions);
addToken('YYhr', getHalfYearRomanMin);
addToken('YYYY', 'getFullYear');
addToken('YYYYhr', getHalfYearRomanLong);
addToken('Q', getQuarter);
addToken('QQr', getQuarterRomanMin);
addToken('QQQr', getQuarterRomanShort);
addToken('QQQQr', getQuarterRomanLong);

/**
 * Преобразует дату в строку указанного формата.
 * @remark
 * <h2>Параметры функции</h2>
 * <ul>
 *     <li><b>date</b> {Date} Дата.</li>
 *     <li><b>format</b> {String} Формат вывода.</li>
 * </ul>
 * <h2>Возвращает</h2>
 * {String} Дата в указанном формате.
 *
 * <h2>Доступные константы (следует использовать для вывода дат
 * {@link http://axure.tensor.ru/standarts/v7/форматы_дат_01.html по стандарту} с учетом локализации).</h2>
 * <ul>
 *    <li>FULL_DATE: полная дата, "DD.MM.YY" для "Ru-ru";</li>
 *    <li>FULL_DATE_DOW: полная дата с днем недели, "DD MMMMlo'YY, ddddl" для "Ru-ru";</li>
 *    <li>FULL_DATE_FULL_MONTH: полная дата с полным названием месяца, "DD MMMMlo'YY" для "Ru-ru";</li>
 *    <li>FULL_DATE_FULL_MONTH_FULL_YEAR: полная дата с полным названием месяца и полным годом, "DD MMMMlo YYYY" для
 *        "Ru-ru";</li>
 *    <li>FULL_DATE_FULL_YEAR: полная дата с полным годом, "DD.MM.YYYY" для "Ru-ru";</li>
 *    <li>FULL_DATE_SHORT_MONTH: полная дата с кратким названием месяца, "DD MMMl'YY" для "Ru-ru";</li>
 *    <li>FULL_DATE_SHORT_MONTH_FULL_YEAR: полная дата с кратким названием месяца и полным годом, "DD MMMl YYYY" для
 *        "Ru-ru";</li>
 *    <li>FULL_DATETIME: полный формат даты и времени, "DD MMM'YY HH:mm" для "Ru-ru";</li>
 *    <li>FULL_HALF_YEAR: полное полугодие и год, "YYYYhr 'YY" для "Ru-ru";</li>
 *    <li>FULL_MONTH: полное название месяца и год, "MMMM'YY" для "Ru-ru";</li>
 *    <li>FULL_QUATER: полный квартал и год, "QQQQr 'YY" для "Ru-ru";</li>
 *    <li>FULL_TIME: полное время, "HH:mm:ss" для "Ru-ru";</li>
 *    <li>SHORT_DATE: краткая дата, "DD.MM" для "Ru-ru";</li>
 *    <li>SHORT_DATE_DOW: краткая дата с днем недели, "DD MMMMlo, ddddl" для "Ru-ru";</li>
 *    <li>SHORT_DATE_FULL_MONTH: краткая дата с полным названием месяца, "DD MMMMlo" для "Ru-ru";</li>
 *    <li>SHORT_DATE_SHORT_MONTH: краткая дата с кратким названием месяца, "DD MMMl" для "Ru-ru";</li>
 *    <li>SHORT_DATETIME: краткий формат даты и времени, "DD MMMl HH:mm" для "Ru-ru";</li>
 *    <li>SHORT_HALF_YEAR: краткое полугодие, "YYhr 'YY" для "Ru-ru";</li>
 *    <li>SHORT_MONTH: краткое название месяца и год, "MMM'YY" для "Ru-ru";</li>
 *    <li>SHORT_QUATER: краткий квартал и год, "QQr 'YY" для "Ru-ru";</li>
 *    <li>SHORT_TIME: краткое время, "HH:mm" для "Ru-ru".</li>
 * </ul>
 *
 * <h2>Примеры использования констант.</h2>
 *
 * Выведем полную дату:
 * <pre>
 *    require(['Core/helpers/Date/format'], function(format) {
 *       var date = new Date(2018, 4, 7);
 *       console.log(format(date, format.FULL_DATE));//07.05.18
 *    });
 * </pre>
 * Выведем полную дату с днем недели:
 * <pre>
 *    require(['Core/helpers/Date/format'], function(format) {
 *       var date = new Date(2018, 4, 7);
 *       console.log(format(date, format.FULL_DATE_DOW));//07 мая'18, понедельник
 *    });
 * </pre>
 *
 * <h2>Доступные маски.</h2>
 * Отображение времени:
 * <ul>
 *    <li>s: секунды;</li>
 *    <li>ss: секунды с лидирующим нулем;</li>
 *    <li>m: минуты;</li>
 *    <li>mm: минуты с лидирующим нулем;</li>
 *    <li>h: часы в 12-часовом формате;</li>
 *    <li>hh: часы в 12-часовом формате с лидирующим нулем;</li>
 *    <li>H: часы в 24-часовом формате;</li>
 *    <li>HH: часы в 24-часовом формате с лидирующим нулем;</li>
 *    <li>a: интервал суток либо до полудня (ante meridiem), либо после полудня (post meridiem) в текущей локали;</li>
 *    <li>SSS: дробная часть секунд (миллисекунды).</li>
 * </ul>
 * Отображение даты:
 * <ul>
 *    <li>D: порядковый номер дня месяца;</li>
 *    <li>DD: порядковый номер дня месяца с лидирующим нулем;</li>
 *    <li>dd: краткое название дня недели в текущей локали с заглавной буквы (например, 'Пн' или 'Mo');</li>
 *    <li>ddl: краткое название дня недели в текущей локали в нижнем регистре (например, 'пн' или 'mo');</li>
 *    <li>ddd: сокращенное название дня недели в текущей локали с заглавной буквы (например, 'Пнд' или 'Mon');</li>
 *    <li>dddl: сокращенное название дня недели в текущей локали в нижнем регистре (например, 'пнд' или 'mon');</li>
 *    <li>dddd: полное название дня недели в текущей локали с заглавной буквы (например, 'Понедельник' или 'Monday');
 *    </li>
 *    <li>ddddl: полное название дня недели в текущей локали в нижнем регистре (например, 'понедельник' или 'monday');
 *    </li>
 *    <li>M: порядковый номер месяца;</li>
 *    <li>MM: порядковый номер месяца с лидирующим нулем;</li>
 *    <li>MMM: сокращенное название месяца в текущей локали (например, 'Янв' или 'Jan');</li>
 *    <li>MMMl: сокращенное название месяца в текущей локали в нижнем регистре (например, 'янв' или 'jan');</li>
 *    <li>MMMM: полное название месяца в текущей локали (например, 'Январь' или 'January');</li>
 *    <li>MMMMl: полное название месяца в текущей локали в нижнем регистре (например, 'январь' или 'january');</li>
 *    <li>MMMMo: полное название месяца в текущей локали в плюральной форме (например, 'Января' или 'January');</li>
 *    <li>MMMMlo: полное название месяца в текущей локали в плюральной форме и нижнем регистре (например, 'января' или
 *        'january');</li>
 *    <li>Y: двузначный номер года;</li>
 *    <li>YY: двузначный номер года с лидирующим нулем;</li>
 *    <li>YYYY: четырехзначный номер года;</li>
 *    <li>YYhr: номер полугодия в римской нотации и полугодие в текущей локали в краткой форме (например, 'I по' или
 *        'I hy');</li>
 *    <li>YYYYhr: номер полугодия в римской нотации и полугодие в текущей локали в полной форме (например, 'I полугодие'
 *        или 'I half year');</li>
 *    <li>QQr: номер квартала в римской нотации и квартал в текущей локали в краткой форме (например, 'I кв' или
 *        'I qt');</li>
 *    <li>QQQr: номер квартала в римской нотации и квартал в текущей локали в сокращенной форме (например, 'I квр' или
 *        'I qtr');</li>
 *    <li>QQQQr: номер квартала в римской нотации и квартал в текущей локали в полной форме (например, 'I квартал' или
 *        'I quarter').</li>
 * </ul>
 *
 * <h2>Примеры использования масок.</h2>
 * Выведем дату:
 * <pre>
 *    require(['Core/helpers/Date/format'], function(format) {
 *       var date = new Date(2018, 4, 7);
 *       console.log(format(date, 'Сегодня ddddl, D MMMMlo YYYY года.'));//Сегодня понедельник, 7 мая 2018 года.
 *    });
 * </pre>
 *
 * Для экранирования вывода следует использовать квадратные скобки:
 * <pre>
 *    require(['Core/helpers/Date/format'], function(format) {
 *       var date = new Date(2018, 4, 7);
 *       console.log(format(date, '[Today is] YYYY/DD/MM'));//Today is 2018/07/05
 *    });
 * </pre>
 *
 * @class
 * @name Types/_formatter/date
 * @public
 * @author Мальцев А.А.
 */
export default function format(date: Date, format: string): string {
   return String(format).replace(getTokensRegex(), (token) => {
      // Check if to be escaped
      if (token[0] === '[' && token[token.length - 1] === ']') {
         return token.substr(1, token.length - 2);
      }

      return formatByToken(date, tokens[token][0], tokens[token][1]);
   });
}

/**
 * Constants with predefined formats
 */
Object.defineProperties(format, {
   FULL_DATE_DOW: {
      get: (): string => {
         return locale.config.fullDateDayOfWeekFormat;
      }
   },
   FULL_DATE: {
      get: (): string => {
         return locale.config.fullDateFormat;
      }
   },
   FULL_DATE_FULL_MONTH: {
      get: (): string => {
         return locale.config.fullDateFullMonthFormat;
      }
   },
   FULL_DATE_FULL_MONTH_FULL_YEAR: {
      get: (): string => {
         return locale.config.fullDateFullMonthFullYearFormat;
      }
   },
   FULL_DATE_FULL_YEAR: {
      get: (): string => {
         return locale.config.fullDateFullYearFormat;
      }
   },
   FULL_DATE_SHORT_MONTH: {
      get: (): string => {
         return locale.config.fullDateShortMonthFormat;
      }
   },
   FULL_DATE_SHORT_MONTH_FULL_YEAR: {
      get: (): string => {
         return locale.config.fullDateShortMonthFullYearFormat;
      }
   },
   FULL_DATETIME: {
      get: (): string => {
         return locale.config.fullDateShortMonthFormat + ' ' + locale.config.shortTimeFormat;
      }
   },
   FULL_HALF_YEAR: {
      get: (): string => {
         return locale.config.fullHalfYearFormat;
      }
   },
   FULL_MONTH: {
      get: (): string => {
         return locale.config.fullMonthFormat;
      }
   },
   FULL_QUATER: {
      get: (): string => {
         return locale.config.fullQuarterFormat;
      }
   },
   FULL_TIME: {
      get: (): string => {
         return locale.config.fullTimeFormat;
      }
   },
   SHORT_DATE_DOW: {
      get: (): string => {
         return locale.config.shortDateDayOfWeekFormat;
      }
   },
   SHORT_DATE: {
      get: (): string => {
         return locale.config.shortDateFormat;
      }
   },
   SHORT_DATE_FULL_MONTH: {
      get: (): string => {
         return locale.config.shortDateFullMonthFormat;
      }
   },
   SHORT_DATE_SHORT_MONTH: {
      get: (): string => {
         return locale.config.shortDateShortMonthFormat;
      }
   },
   SHORT_DATETIME: {
      get: (): string => {
         return locale.config.shortDateShortMonthFormat + ' ' + locale.config.shortTimeFormat;
      }
   },
   SHORT_HALF_YEAR: {
      get: (): string => {
         return locale.config.shortHalfYearFormat;
      }
   },
   SHORT_MONTH: {
      get: (): string => {
         return locale.config.shortMonthFormat;
      }
   },
   SHORT_QUATER: {
      get: (): string => {
         return locale.config.shortQuarterFormat;
      }
   },
   SHORT_TIME: {
      get: (): string => {
         return locale.config.shortTimeFormat;
      }
   }
});
