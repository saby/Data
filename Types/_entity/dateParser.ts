let tokensRegex;
const tokens = {};

/**
 * Sets month from human-friendly value
 */
function setHumanMonth(date: Date, value: string): void {
    const month = Number(value) - 1;
    date.setMonth(month);
    // If timezone between old and new months is different the result might seen wrong, but probably it's just a
    // time zone correction effect.
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

/**
 * Adds token to match
 * @param token Token
 * @param handler Token handler (for String is the method name in Date.prototype)
 */
function addToken(token: string, handler: string|Function): void {
    tokens[token] = handler;
    tokensRegex = null;
}

/**
 * Applies token value to given date
 * @param date Date to being affected
 * @param value Value to apply
 * @param handler Token handler (for String is the method name in Date.prototype)
 */
function applyToken(date: Date, value: string, handler: string|Function): void {
    if (typeof handler === 'string') {
        handler = (
            (method) => (date) => date[method](value)
        )(handler);
    }

    handler(date, value);
}

// Date tokens
addToken('DD', 'setDate');
addToken('MM', setHumanMonth);
addToken('YY', setShortYear);
addToken('YYYY', 'setFullYear');

/**
 * Parses date from string by given format.
 * @function
 * @name Types/_entity/dateParser
 * @param str Date in a string representation
 * @param format Date format
 * @private
 * @author Мальцев А.А.
 */
export default function parse(str: string, format: string): Date {
    const validStr = String(str);
    const validFormat = String(format);
    const matcher = getTokensRegex();
    const result = new Date(0);

    let match;
    matcher.lastIndex = 0;
    while ((match = matcher.exec(validFormat)) !== null) {
        const token = match[0];

        // Check if to be escaped
        if (token[0] === '[' && token[token.length - 1] === ']') {
            continue;
        }
        const value = validStr.substr(match.index, token.length);
        applyToken(result, value, tokens[token]);

    }

    return result;
}
