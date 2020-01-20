interface IDateFormatOptions {
    separator?: string;
}

let tokensRegex;
const tokens = {};

/**
 * Sets month from human-friendly value
 */
function setHumanMonth(date: Date, value: string): number {
    return date.setMonth(Number(value) - 1);
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
 * @param [options] Options to pass to the handler
 */
function addToken(token: string, handler: string|Function, options: IDateFormatOptions = {}): void {
    tokens[token] = [handler, options];
    tokensRegex = null;
}

/**
 * Applies token value to given date
 * @param date Date to being affected
 * @param value Value to apply
 * @param handler Token handler (for String is the method name in Date.prototype)
 * @param [options] Options to pass to the handler
 */
function applyToken(date: Date, value: string, handler: string|Function, options: IDateFormatOptions): void {
    if (typeof handler === 'string') {
        handler = (
            (method) => (date) => date[method](value)
        )(handler);
    }

    handler(date, value, options);
}

// Date tokens
addToken('DD', 'setDate');
addToken('MM', setHumanMonth);
addToken('YY', setShortYear);
addToken('YYYY', 'setFullYear');

export default function parse(str: string, format: string): Date {
    const date = new Date(0, 0, 0, 0, 0, 0);

    const validStr = String(str);

    String(format).replace(getTokensRegex(), (token: string, p1: string, offset: number): string => {
        // Check if to be escaped
        if (token[0] === '[' && token[token.length - 1] === ']') {
            return;
        }
        const value = validStr.substr(offset, token.length);
        applyToken(date, value, tokens[token][0], tokens[token][1]);
    });

    return date;
}
