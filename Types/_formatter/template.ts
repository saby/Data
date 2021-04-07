type TransformerCallback = (expression: string) => unknown;

interface ITransformer {
    transform(cb: TransformerCallback): this;
    render(): string;
};

const PARSE_REGEXP = /\$\{([^}]*)\}/g;

// https://developer.mozilla.org/en-US/docs/Glossary/Identifier
const IDENTIFIER_REGEXP = /^[-_$A-z][0-9-_$A-z]*$/;

/**
 * Returns flag that given expression is a valid indentifier
 */
function isIdentifier(str: string): boolean {
    return IDENTIFIER_REGEXP.test(str);
}

/**
 * Compiles string template into executable object
 */
function compile(str: string): ITransformer {
    let result;

    return {
        transform(cb: TransformerCallback): ITransformer {
            result = str.replace(
                PARSE_REGEXP,
                (match, expression) => cb(expression) as string
            );
            return this;
        },
        render(): string {
            return result === undefined ? str : result;
        }
    };
}

/**
 * Resolves expression value
 */
function resolve(expression: string, scope: unknown): unknown {
    if (scope && isIdentifier(expression)) {
        if (!(expression in (scope as object))) {
            throw new ReferenceError(`${expression} is not defined`);
        }
        return scope[expression];
    }

    let argNames;
    let executor;

    try {
        argNames = scope ? Object.keys(scope) : [];
        executor = new Function(argNames.join(', '), `return ${expression};`);
    } catch (err) {
        err.message = `Unable to compile expression "${expression}": ${err.message}`;
        throw err;
    }

    try {
        const argValues = argNames.map((name) => scope[name]);
        return executor.apply(null, argValues);
    } catch (err) {
        err.message = `Unable to evaluate expression "${expression}": ${err.message}`;
        throw err;
    }
}

/**
 * Форматирует строку по шаблону.
 * @example
 * <h2>Отформатируем строку c использованием объекта</h2>
 * <pre>
 *     import {template} from 'Types/formatter';
 *     template('A ${person} walks into a ${place} and asks "${question}" ', {
 *         person: 'neutron',
 *         place: 'bar',
 *         question: 'How much for a beer?'
 *     }); // returns 'A neutron walks into a bar and asks "How much for a beer?"'
 * </pre>
 *
 * <h2>Отформатируем строку c использованием вложенных полей объекта</h2>
 * <pre>
 *     import {template} from 'Types/formatter';
 *     template('A ${person.kind} walks into a ${place}..." ', {
 *         person: {
 *             kind: 'neutron',
 *             state: 'thirsty'
 *         },
 *         place: 'bar'
 *     }); // returns 'A neutron walks into a bar...'
 * </pre>
 *
 * @param str Форматируемая строка
 * @param scope Данные для подстановки
 * @returns Отформатированная строка
 * @public
 * @author Кудрявцев И.С.
 */
export default function template(str: string, scope: object): string {
    return compile(String(str))
        .transform((expression: string) => resolve(expression, scope))
        .render();
}
