import 'i18n!controller?';
import {controller} from 'I18n/i18n';
import ILocale from 'I18n/locales/Interfaces/ILocale';

const AM_PM_BOUNDARY = 12;
const ONE_TWO_DIGITS_MATCHER = /[0-9]{1,2}/;
const AM_PM_MATCHER = /\w{1,2}/;

let tokensRegex: RegExp;
const tokens: Record<string, IToken> = {};

const getConfig = (): ILocale => {
    return controller.currentLocaleConfig;
}

interface IToken {
    handler: Function;
    valueMatcher: RegExp;
}

/**
 * Sets hours from 12-hours range
 */
function setTwelveHours(date: Date, value: string): void {
    const numberValue = Number(value);
    date.setHours(numberValue);
}

/**
 * Sets hours by AM-PM flag
 */
function setAmPm(date: Date, value: string): void {
    if (value === getConfig().calendarEntities.pm && date.getHours() <= AM_PM_BOUNDARY) {
        date.setHours(date.getHours() + AM_PM_BOUNDARY);
    }
}

/**
 * Sets month from human-friendly value
 */
function setHumanMonth(date: Date, value: string): void {
    const month = Number(value) - 1;
    date.setMonth(month);
    // If time zones between old and new month are different the result might seen wrong but probably it's just a time
    // zone correction effect.
    if (date.getMonth() !== month) {
        date.setMonth(month);
    }
}

/**
 * Sets year from 2-digit value
 */
function setShortYear(date: Date, value: string): number {
    const numberValue = Number(value);
    return date.setFullYear(numberValue >= 100 ? numberValue : 2000 + numberValue);
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

/*
 * Adds token to match
 * @param token Token
 * @param handler Token handler (for String is the method name in Date.prototype)
 */
function addToken(token: string, handler: string | Function, valueMatcher?: RegExp): void {
    if (typeof handler === 'string') {
        handler = (
            (method) => (date, value) => date[method](value)
        )(handler);
    }
    tokens[token] = {handler, valueMatcher};
    tokensRegex = null;
}

/*
 * Applies token value to given date
 * @param instance Date to being affected
 * @param tokenValue Value to apply
 * @param handler Token handler (for String is the method name in Date.prototype)
 */
function applyToken(instance: Date, tokenValue: string, token: IToken): void {
    token.handler(instance, tokenValue);
}

/*
 * Returns token value from string
 * @param str String with value
 * @param tokenString Token string
 * @param token Token data
 */
function getTokenValue(str: string, tokenString: string, token: IToken): string {
    if (token.valueMatcher) {
        const valueMatch = token.valueMatcher.exec(str);
        if (valueMatch === null) {
            return '';
        }
        return valueMatch[0];
    }

    return str.substr(0, tokenString.length);
}

// Date tokens
addToken('D', 'setDate', ONE_TWO_DIGITS_MATCHER);
addToken('DD', 'setDate');
addToken('M', setHumanMonth, ONE_TWO_DIGITS_MATCHER);
addToken('MM', setHumanMonth);
addToken('Y', setShortYear, ONE_TWO_DIGITS_MATCHER);
addToken('YY', setShortYear);
addToken('YYYY', 'setFullYear');

// Time tokens
addToken('s', 'setSeconds', ONE_TWO_DIGITS_MATCHER);
addToken('ss', 'setSeconds');
addToken('m', 'setMinutes', ONE_TWO_DIGITS_MATCHER);
addToken('mm', 'setMinutes');
addToken('h', setTwelveHours, ONE_TWO_DIGITS_MATCHER);
addToken('hh', setTwelveHours);
addToken('H', 'setHours', ONE_TWO_DIGITS_MATCHER);
addToken('HH', 'setHours');
addToken('a', setAmPm, AM_PM_MATCHER);

/**
 * Создает дату из строки по заданному формату.
 * @example
 * Создадим дату из строки:
 * <pre>
 *     import {date as parse} from 'Types/parser';
 *     const dateInstance = parse('01-12-2003', 'DD-MM-YYYY');
 *     console.log(dateInstance.getDate()); // 1
 *     console.log(dateInstance.getMonth()); // 11
 *     console.log(dateInstance.getFullYear()); // 2003
 * </pre>
 * @param str Дата в строковом представлении
 * @param format Формат даты
 * @public
 * @author Кудрявцев И.С.
 */

/*
 * Produces Date from string by given format.
 * @param str Date in a string representation
 * @param format Date format
 * @public
 * @author Кудрявцев И.С.
 */
export default function date(str: string, format: string): Date {
    const validStr = String(str);
    const validFormat = String(format);
    const matcher = getTokensRegex();
    const result = new Date(0);

    matcher.lastIndex = 0;
    let offset = 0;
    let match;
    while ((match = matcher.exec(validFormat)) !== null) {
        const tokenString = match[0];

        // Check if to be escaped
        if (tokenString[0] === '[' && tokenString[tokenString.length - 1] === ']') {
            continue;
        }

        const value = getTokenValue(
            validStr.substr(offset + match.index),
            tokenString,
            tokens[tokenString]
        );
        offset += value.length - tokenString.length;
        applyToken(result, value, tokens[tokenString]);

    }

    return result;
}
